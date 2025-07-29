import { StructuredResponse, SystemInstructions } from '../types/mcp.js';

export class ResponseFormatter {
    private static defaultInstructions: SystemInstructions = {
        responseFormat: 'structured',
        includeMetadata: true,
        includeSummary: true,
        summaryFormat: 'concise',
        errorHandling: 'detailed'
    };

    static formatResponse(
        toolName: string,
        data: any,
        error?: string,
        instructions?: Partial<SystemInstructions>
    ): StructuredResponse {
        const startTime = Date.now();
        const mergedInstructions = { ...this.defaultInstructions, ...instructions };
        
        const response: StructuredResponse = {
            success: !error,
            data: data,
            error: error,
            metadata: {
                timestamp: new Date().toISOString(),
                tool: toolName,
                executionTime: Date.now() - startTime,
                clusterInfo: mergedInstructions.includeMetadata ? {
                    connected: false // Will be updated by the service
                } : undefined
            }
        };

        if (mergedInstructions.includeSummary && !error) {
            response.summary = this.generateSummary(toolName, data, mergedInstructions.summaryFormat);
        }

        return response;
    }

    static formatErrorResponse(
        toolName: string,
        error: string,
        instructions?: Partial<SystemInstructions>
    ): StructuredResponse {
        const mergedInstructions = { ...this.defaultInstructions, ...instructions };
        
        return {
            success: false,
            error: mergedInstructions.errorHandling === 'detailed' ? error : 'Operation failed',
            metadata: {
                timestamp: new Date().toISOString(),
                tool: toolName
            }
        };
    }

    private static generateSummary(toolName: string, data: any, format: 'detailed' | 'concise'): any {
        const summaries: { [key: string]: any } = {
            'connect_to_eks': {
                title: 'EKS Connection Status',
                description: 'Connection to EKS cluster established successfully',
                keyMetrics: {
                    clusterName: data.clusterName,
                    region: data.region,
                    status: 'Connected'
                },
                recommendations: [
                    'You can now use other tools to interact with the cluster',
                    'Use get_cluster_info to verify cluster details'
                ]
            },
            'get_cluster_info': {
                title: 'Cluster Information',
                description: `Cluster overview with ${data.nodeCount} nodes and ${data.namespaceCount} namespaces`,
                keyMetrics: {
                    nodeCount: data.nodeCount,
                    namespaceCount: data.namespaceCount,
                    healthyNodes: data.nodes?.filter((n: any) => n.status === 'True').length || 0
                },
                recommendations: [
                    'Check node status for any unhealthy nodes',
                    'Use get_resource_usage for detailed resource information'
                ]
            },
            'get_resource_usage': {
                title: 'Resource Usage Summary',
                description: `Resource utilization across the cluster`,
                keyMetrics: {
                    totalPods: data.totalPods,
                    runningPods: data.runningPods,
                    pendingPods: data.pendingPods,
                    failedPods: data.failedPods,
                    successRate: data.totalPods > 0 ? ((data.runningPods / data.totalPods) * 100).toFixed(1) + '%' : '0%'
                },
                recommendations: [
                    data.failedPods > 0 ? `Investigate ${data.failedPods} failed pods` : 'All pods are running successfully',
                    data.pendingPods > 0 ? `Monitor ${data.pendingPods} pending pods` : 'No pending pods'
                ]
            },
            'list_namespaces': {
                title: 'Namespace Overview',
                description: `Found ${data.count} namespaces in the cluster`,
                keyMetrics: {
                    totalNamespaces: data.count,
                    activeNamespaces: data.namespaces?.filter((ns: any) => ns.status === 'Active').length || 0
                },
                recommendations: [
                    'Review namespace status for any inactive namespaces',
                    'Use list_pods to explore resources in specific namespaces'
                ]
            },
            'list_pods': {
                title: 'Pod Status Overview',
                description: `Pod status in namespace: ${data.namespace || 'default'}`,
                keyMetrics: {
                    totalPods: data.count || 0,
                    readyPods: Array.isArray(data.pods) ? data.pods.filter((p: any) => p.ready).length : 0,
                    runningPods: Array.isArray(data.pods) ? data.pods.filter((p: any) => p.status === 'Running').length : 0
                },
                recommendations: [
                    Array.isArray(data.pods) && data.pods.some((p: any) => !p.ready) ? 'Some pods are not ready - investigate further' : 'All pods are ready',
                    'Use describe_pod for detailed pod information'
                ]
            },
            'describe_pod': {
                title: 'Pod Details',
                description: `Detailed information for pod: ${data.metadata?.name}`,
                keyMetrics: {
                    podName: data.metadata?.name,
                    namespace: data.metadata?.namespace,
                    status: data.status?.phase,
                    containerCount: data.spec?.containers?.length || 0
                },
                recommendations: [
                    data.status?.phase !== 'Running' ? `Pod is in ${data.status?.phase} state - investigate` : 'Pod is running normally',
                    'Use get_pod_logs to check pod logs if needed'
                ]
            },
            'list_services': {
                title: 'Service Overview',
                description: `Services in namespace: ${Array.isArray(data) && data.length > 0 ? data[0].namespace || 'default' : 'default'}`,
                keyMetrics: {
                    totalServices: Array.isArray(data) ? data.length : 0,
                    clusterIPServices: Array.isArray(data) ? data.filter((s: any) => s.type === 'ClusterIP').length : 0,
                    loadBalancerServices: Array.isArray(data) ? data.filter((s: any) => s.type === 'LoadBalancer').length : 0
                },
                recommendations: [
                    'Review service types and configurations',
                    'Check service selectors for proper pod targeting'
                ]
            },
            'list_deployments': {
                title: 'Deployment Overview',
                description: `Deployments in namespace: ${Array.isArray(data) && data.length > 0 ? data[0].namespace || 'default' : 'default'}`,
                keyMetrics: {
                    totalDeployments: Array.isArray(data) ? data.length : 0,
                    readyDeployments: Array.isArray(data) ? data.filter((d: any) => d.replicas && d.replicas.ready === d.replicas.desired).length : 0,
                    totalReplicas: Array.isArray(data) ? data.reduce((sum: number, d: any) => sum + (d.replicas && d.replicas.desired || 0), 0) : 0
                },
                recommendations: [
                    'Monitor deployment readiness and replica counts',
                    'Check deployment images for updates'
                ]
            },
            'get_pod_logs': {
                title: 'Pod Logs',
                description: `Logs for pod: ${data.podName}`,
                keyMetrics: {
                    podName: data.podName,
                    namespace: data.namespace,
                    container: data.container,
                    logLines: data.tailLines
                },
                recommendations: [
                    'Review logs for errors or warnings',
                    'Check log patterns for application health'
                ]
            },
            'help': {
                title: 'Help Information',
                description: 'Tool help and usage information',
                keyMetrics: {
                    toolCount: data.totalTools || Object.keys(data.categories || {}).length,
                    categories: Object.keys(data.categories || {}).length
                },
                recommendations: [
                    'Use specific tool help for detailed information',
                    'Explore different tool categories for your needs'
                ]
            },
            'list_helm_releases': {
                title: 'Helm Releases Overview',
                description: `Found ${data.totalReleases} Helm releases`,
                keyMetrics: {
                    totalReleases: data.totalReleases,
                    byStatus: data.summary?.byStatus || {},
                    byNamespace: data.summary?.byNamespace || {}
                },
                recommendations: [
                    'Review release status for any failed or pending releases',
                    'Check namespace distribution for resource organization',
                    'Use get_helm_release for detailed release information'
                ]
            },
            'get_helm_release': {
                title: 'Helm Release Details',
                description: `Detailed information for release: ${data.releaseName}`,
                keyMetrics: {
                    releaseName: data.releaseName,
                    namespace: data.namespace,
                    status: data.status?.status,
                    resourceCount: data.summary?.resourceCount || 0,
                    hookCount: data.summary?.hookCount || 0
                },
                recommendations: [
                    data.status?.status !== 'deployed' ? `Release is in ${data.status?.status} state - investigate` : 'Release is deployed successfully',
                    'Review resource status and hook execution',
                    'Use get_helm_release_status for detailed status information'
                ]
            },
            'get_helm_release_status': {
                title: 'Helm Release Status',
                description: `Status for release: ${data.releaseName}`,
                keyMetrics: {
                    releaseName: data.releaseName,
                    namespace: data.namespace,
                    status: data.status,
                    healthyResources: data.summary?.healthyResources || 0,
                    failedResources: data.summary?.failedResources || 0
                },
                recommendations: [
                    data.failedResources > 0 ? `Investigate ${data.failedResources} failed resources` : 'All resources are healthy',
                    'Review hook execution status if applicable',
                    'Use get_helm_release_history for deployment timeline'
                ]
            },
            'get_helm_release_history': {
                title: 'Helm Release History',
                description: `Revision history for release: ${data.releaseName}`,
                keyMetrics: {
                    releaseName: data.releaseName,
                    namespace: data.namespace,
                    totalRevisions: data.totalRevisions,
                    currentRevision: data.currentRevision,
                    deployedRevisions: data.summary?.deployedRevisions || 0
                },
                recommendations: [
                    data.summary?.failedRevisions > 0 ? `Review ${data.summary.failedRevisions} failed revisions` : 'All revisions are successful',
                    'Monitor deployment frequency and patterns',
                    'Use get_helm_release for current release details'
                ]
            }
        };

        const summary = summaries[toolName] || {
            title: 'Tool Execution Result',
            description: 'Tool executed successfully',
            keyMetrics: {},
            recommendations: ['Review the data for any issues or next steps']
        };

        if (format === 'concise') {
            return {
                title: summary.title,
                description: summary.description,
                keyMetrics: summary.keyMetrics
            };
        }

        return summary;
    }

    static getSystemPrompt(toolName: string): string {
        const prompts: { [key: string]: string } = {
            'connect_to_eks': `You are connecting to an EKS cluster. Return a structured response with:
- Connection status and cluster details
- Any authentication issues or warnings
- Next steps for cluster interaction
- Clear success/failure indication`,

            'get_cluster_info': `You are retrieving cluster information. Return a structured response with:
- Node count and health status
- Namespace count and overview
- Cluster version and status
- Key metrics and health indicators
- Recommendations for cluster monitoring`,

            'get_resource_usage': `You are analyzing resource usage. Return a structured response with:
- Pod counts by status (running, pending, failed)
- Resource utilization metrics
- Performance indicators
- Recommendations for resource optimization
- Alerts for any issues`,

            'list_namespaces': `You are listing namespaces. Return a structured response with:
- Total namespace count
- Namespace status and details
- Active vs inactive namespaces
- Recommendations for namespace management
- Key namespace metrics`,

            'list_pods': `You are listing pods. Return a structured response with:
- Pod count and status breakdown
- Ready vs not ready pods
- Restart counts and age
- Recommendations for pod health
- Key pod metrics`,

            'describe_pod': `You are describing a pod. Return a structured response with:
- Pod metadata and status
- Container information and images
- Resource specifications
- Health conditions and events
- Recommendations for pod management`,

            'list_services': `You are listing services. Return a structured response with:
- Service count and types
- Service configurations and selectors
- Network information
- Recommendations for service management
- Key service metrics`,

            'list_deployments': `You are listing deployments. Return a structured response with:
- Deployment count and status
- Replica information and readiness
- Image versions and updates
- Recommendations for deployment management
- Key deployment metrics`,

            'get_pod_logs': `You are retrieving pod logs. Return a structured response with:
- Log content and format
- Log analysis and patterns
- Error identification and severity
- Recommendations for log monitoring
- Key log metrics`,

            'help': `You are providing help information. Return a structured response with:
- List all the tools, available options, and a long description of the options
- Tool descriptions and categories
- Parameter details and examples
- Usage instructions and best practices
- Recommendations for tool selection
- Clear navigation guidance`,

            'list_helm_releases': `You are listing Helm releases. Return a structured response with:
- Total number of releases found
- Release details including name, namespace, status, and version
- Summary by status and namespace
- Recommendations for release management
- Key metrics and health indicators`,

            'get_helm_release': `You are getting detailed Helm release information. Return a structured response with:
- Release metadata and status information
- Resource details and configurations
- Values and manifest information
- Recommendations for release management
- Key metrics and health indicators`,

            'get_helm_release_status': `You are checking Helm release status. Return a structured response with:
- Release status and version information
- Resource health and status details
- Hook information and execution status
- Recommendations for troubleshooting
- Key metrics and health indicators`,

            'get_helm_release_history': `You are retrieving Helm release history. Return a structured response with:
- Revision history and deployment timeline
- Status of each revision
- Deployment patterns and frequency
- Recommendations for release management
- Key metrics and deployment insights`
        };

        return prompts[toolName] || `You are executing the ${toolName} tool. Return a structured response with:
- Clear success/failure indication
- Relevant data and metrics
- Actionable recommendations
- Next steps for the user`;
    }
} 