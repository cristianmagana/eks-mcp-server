import {KubernetesTool} from '../types/mcp.js';
import {z} from 'zod';
import {EKSAuthenticatorService} from './eks-auth.service.js';
import {EKSClusterConfig} from '../types/eks.js';
import {ResponseFormatter} from '../util/response-formatter.util.js';

export class KubernetesToolsService {
    private static eksAuth?: EKSAuthenticatorService;

    static getKubernetesTools(): KubernetesTool[] {
        return [
            {
                name: 'connect_to_eks',
                description: 'Connect to an EKS cluster',
                systemPrompt: ResponseFormatter.getSystemPrompt('connect_to_eks'),
                schema: {
                    type: 'object',
                    properties: {
                        clusterName: {
                            type: 'string',
                            description: 'Name of the EKS cluster',
                        },
                        region: {
                            type: 'string',
                            description: 'AWS region where the cluster is located',
                        },
                        roleArn: {
                            type: 'string',
                            description: 'Optional IAM role ARN to assume',
                        },
                    },
                    required: ['clusterName', 'region'],
                },
                execute: async (args, _coreApi, _appsApi) => {
                    const startTime = Date.now();
                    try {
                        const schema = z.object({
                            clusterName: z.string(),
                            region: z.string(),
                            roleArn: z.string().optional(),
                        });

                        const {clusterName, region, roleArn} = schema.parse(args);

                        const config: EKSClusterConfig = {
                            clusterName,
                            region,
                            roleArn,
                        };

                        KubernetesToolsService.eksAuth = new EKSAuthenticatorService(config);

                        await KubernetesToolsService.eksAuth.authenticate();
                        const isConnected = await KubernetesToolsService.eksAuth.testConnection();

                        if (isConnected) {
                            const data = {
                                success: true,
                                message: `Successfully connected to EKS cluster: ${clusterName} in region: ${region}`,
                                clusterName,
                                region,
                            };

                            return ResponseFormatter.formatResponse('connect_to_eks', data, undefined, {
                                includeMetadata: true,
                                includeSummary: true
                            });
                        } else {
                            throw new Error('Connection test failed');
                        }
                    } catch (error) {
                        const errorMessage = `Failed to connect to EKS cluster: ${error instanceof Error ? error.message : 'Unknown error'}`;
                        return ResponseFormatter.formatErrorResponse('connect_to_eks', errorMessage);
                    }
                },
            },

            {
                name: 'get_cluster_info',
                description: 'Get general cluster information',
                systemPrompt: ResponseFormatter.getSystemPrompt('get_cluster_info'),
                schema: {
                    type: 'object',
                    properties: {},
                },
                execute: async (_args, coreApi) => {
                    try {
                        const nodes = await coreApi.listNode();
                        const namespaces = await coreApi.listNamespace();

                        const data = {
                            nodeCount: nodes.items.length,
                            namespaceCount: namespaces.items.length,
                            nodes: nodes.items.map((node: any) => ({
                                name: node.metadata?.name,
                                status: node.status?.conditions?.find((c: any) => c.type === 'Ready')?.status,
                                version: node.status?.nodeInfo?.kubeletVersion,
                            })),
                        };

                        return ResponseFormatter.formatResponse('get_cluster_info', data, undefined, {
                            includeMetadata: true,
                            includeSummary: true
                        });
                    } catch (error) {
                        const errorMessage = `Failed to get cluster info: ${error instanceof Error ? error.message : 'Unknown error'}`;
                        return ResponseFormatter.formatErrorResponse('get_cluster_info', errorMessage);
                    }
                },
            },

            {
                name: 'get_resource_usage',
                description: 'Get resource usage across the cluster',
                systemPrompt: ResponseFormatter.getSystemPrompt('get_resource_usage'),
                schema: {
                    type: 'object',
                    properties: {
                        namespace: {
                            type: 'string',
                            description: 'Specific namespace to check (optional)',
                        },
                    },
                },
                execute: async (args, coreApi) => {
                    try {
                        const namespace = args?.namespace;

                        let pods;
                        if (namespace) {
                            pods = await coreApi.listNamespacedPod(namespace);
                        } else {
                            pods = await coreApi.listPodForAllNamespaces();
                        }

                        const data = {
                            totalPods: pods.items.length,
                            runningPods: pods.items.filter((p: any) => p.status?.phase === 'Running').length,
                            pendingPods: pods.items.filter((p: any) => p.status?.phase === 'Pending').length,
                            failedPods: pods.items.filter((p: any) => p.status?.phase === 'Failed').length,
                        };

                        return ResponseFormatter.formatResponse('get_resource_usage', data, undefined, {
                            includeMetadata: true,
                            includeSummary: true
                        });
                    } catch (error) {
                        const errorMessage = `Failed to get resource usage: ${error instanceof Error ? error.message : 'Unknown error'}`;
                        return ResponseFormatter.formatErrorResponse('get_resource_usage', errorMessage);
                    }
                },
            },

            {
                name: 'describe_pod',
                description: 'Get detailed information about a specific pod',
                systemPrompt: ResponseFormatter.getSystemPrompt('describe_pod'),
                schema: {
                    type: 'object',
                    properties: {
                        podName: {
                            type: 'string',
                            description: 'Name of the pod',
                        },
                        namespace: {
                            type: 'string',
                            description: 'Namespace of the pod',
                            default: 'default',
                        },
                    },
                    required: ['podName'],
                },
                execute: async (args, coreApi) => {
                    try {
                        const {podName, namespace = 'default'} = args;

                        const pod = await coreApi.readNamespacedPod(podName, namespace);

                        const data = {
                            metadata: {
                                name: pod.metadata?.name,
                                namespace: pod.metadata?.namespace,
                                labels: pod.metadata?.labels,
                                annotations: pod.metadata?.annotations,
                                creationTimestamp: pod.metadata?.creationTimestamp,
                            },
                            spec: {
                                containers: pod.spec?.containers?.map((c: any) => ({
                                    name: c.name,
                                    image: c.image,
                                    ports: c.ports,
                                    env: c.env,
                                })),
                                restartPolicy: pod.spec?.restartPolicy,
                                nodeName: pod.spec?.nodeName,
                            },
                            status: {
                                phase: pod.status?.phase,
                                conditions: pod.status?.conditions,
                                containerStatuses: pod.status?.containerStatuses,
                                hostIP: pod.status?.hostIP,
                                podIP: pod.status?.podIP,
                            },
                        };

                        return ResponseFormatter.formatResponse('describe_pod', data, undefined, {
                            includeMetadata: true,
                            includeSummary: true
                        });
                    } catch (error) {
                        const errorMessage = `Failed to describe pod: ${error instanceof Error ? error.message : 'Unknown error'}`;
                        return ResponseFormatter.formatErrorResponse('describe_pod', errorMessage);
                    }
                },
            },

            {
                name: 'list_services',
                description: 'List services in a namespace',
                systemPrompt: ResponseFormatter.getSystemPrompt('list_services'),
                schema: {
                    type: 'object',
                    properties: {
                        namespace: {
                            type: 'string',
                            description: 'Namespace to list services from',
                            default: 'default',
                        },
                    },
                },
                execute: async (args, coreApi) => {
                    try {
                        const {namespace = 'default'} = args || {};

                        const services = await coreApi.listNamespacedService(namespace);

                        const data = services.items.map((svc: any) => ({
                            name: svc.metadata?.name,
                            namespace: svc.metadata?.namespace,
                            type: svc.spec?.type,
                            clusterIP: svc.spec?.clusterIP,
                            ports: svc.spec?.ports,
                            selector: svc.spec?.selector,
                        }));

                        return ResponseFormatter.formatResponse('list_services', data, undefined, {
                            includeMetadata: true,
                            includeSummary: true
                        });
                    } catch (error) {
                        const errorMessage = `Failed to list services: ${error instanceof Error ? error.message : 'Unknown error'}`;
                        return ResponseFormatter.formatErrorResponse('list_services', errorMessage);
                    }
                },
            },

            {
                name: 'list_deployments',
                description: 'List deployments in a namespace',
                systemPrompt: ResponseFormatter.getSystemPrompt('list_deployments'),
                schema: {
                    type: 'object',
                    properties: {
                        namespace: {
                            type: 'string',
                            description: 'Namespace to list deployments from',
                            default: 'default',
                        },
                    },
                },
                execute: async (args, _coreApi, appsApi) => {
                    try {
                        const {namespace = 'default'} = args || {};

                        const deployments = await appsApi.listNamespacedDeployment(namespace);

                        const data = deployments.items.map((dep: any) => ({
                            name: dep.metadata?.name,
                            namespace: dep.metadata?.namespace,
                            replicas: {
                                desired: dep.spec?.replicas,
                                ready: dep.status?.readyReplicas,
                                available: dep.status?.availableReplicas,
                                updated: dep.status?.updatedReplicas,
                            },
                            images: dep.spec?.template?.spec?.containers?.map((c: any) => c.image),
                            creationTimestamp: dep.metadata?.creationTimestamp,
                        }));

                        return ResponseFormatter.formatResponse('list_deployments', data, undefined, {
                            includeMetadata: true,
                            includeSummary: true
                        });
                    } catch (error) {
                        const errorMessage = `Failed to list deployments: ${error instanceof Error ? error.message : 'Unknown error'}`;
                        return ResponseFormatter.formatErrorResponse('list_deployments', errorMessage);
                    }
                },
            },

            // Additional Kubernetes tools moved from index.ts
            {
                name: 'list_namespaces',
                description: 'List all namespaces in the connected cluster',
                systemPrompt: ResponseFormatter.getSystemPrompt('list_namespaces'),
                schema: {
                    type: 'object',
                    properties: {},
                },
                execute: async (_args, coreApi) => {
                    try {
                        const response = await coreApi.listNamespace();

                        const data = {
                            count: response.items.length,
                            namespaces: response.items.map((ns: any) => ({
                                name: ns.metadata?.name,
                                status: ns.status?.phase,
                                creationTimestamp: ns.metadata?.creationTimestamp,
                            })),
                        };

                        return ResponseFormatter.formatResponse('list_namespaces', data, undefined, {
                            includeMetadata: true,
                            includeSummary: true
                        });
                    } catch (error) {
                        const errorMessage = `Failed to list namespaces: ${error instanceof Error ? error.message : 'Unknown error'}`;
                        return ResponseFormatter.formatErrorResponse('list_namespaces', errorMessage);
                    }
                },
            },

            {
                name: 'list_pods',
                description: 'List pods in a specific namespace',
                systemPrompt: ResponseFormatter.getSystemPrompt('list_pods'),
                schema: {
                    type: 'object',
                    properties: {
                        namespace: {
                            type: 'string',
                            description: 'Namespace to list pods from (default: default)',
                            default: 'default',
                        },
                    },
                },
                execute: async (args, coreApi) => {
                    try {
                        const {namespace = 'default'} = args || {};

                        const response = await coreApi.listNamespacedPod({namespace});

                        const data = {
                            namespace: namespace,
                            count: response.items.length,
                            pods: response.items.map((pod: any) => ({
                                name: pod.metadata?.name,
                                namespace: pod.metadata?.namespace,
                                status: pod.status?.phase,
                                ready: pod.status?.containerStatuses?.every((cs: any) => cs.ready) || false,
                                restarts: pod.status?.containerStatuses?.reduce((sum: number, cs: any) => sum + cs.restartCount, 0) || 0,
                                age: pod.metadata?.creationTimestamp,
                            })),
                        };

                        return ResponseFormatter.formatResponse('list_pods', data, undefined, {
                            includeMetadata: true,
                            includeSummary: true
                        });
                    } catch (error) {
                        const errorMessage = `Failed to list pods: ${error instanceof Error ? error.message : 'Unknown error'}`;
                        return ResponseFormatter.formatErrorResponse('list_pods', errorMessage);
                    }
                },
            },

            {
                name: 'get_pod_logs',
                description: 'Get logs from a specific pod',
                systemPrompt: ResponseFormatter.getSystemPrompt('get_pod_logs'),
                schema: {
                    type: 'object',
                    properties: {
                        podName: {
                            type: 'string',
                            description: 'Name of the pod',
                        },
                        namespace: {
                            type: 'string',
                            description: 'Namespace of the pod (default: default)',
                            default: 'default',
                        },
                        container: {
                            type: 'string',
                            description: 'Container name (optional)',
                        },
                        tailLines: {
                            type: 'number',
                            description: 'Number of lines to tail (default: 100)',
                            default: 100,
                        },
                    },
                    required: ['podName'],
                },
                execute: async (args, coreApi) => {
                    try {
                        const {podName, namespace = 'default', container, tailLines = 100} = args;

                        // Build query parameters for the log request
                        const queryParams: any = {
                            tailLines: tailLines,
                            timestamps: false,
                            follow: false,
                        };

                        // Add container if specified
                        if (container) {
                            queryParams.container = container;
                        }

                        const response = await coreApi.readNamespacedPodLog({
                            name: podName,
                            namespace: namespace,
                            ...queryParams,
                        });

                        const data = {
                            podName: podName,
                            namespace: namespace,
                            container: container || 'default',
                            tailLines: tailLines,
                            logs: response,
                        };

                        return ResponseFormatter.formatResponse('get_pod_logs', data, undefined, {
                            includeMetadata: true,
                            includeSummary: true
                        });
                    } catch (error) {
                        const errorMessage = `Failed to get pod logs: ${error instanceof Error ? error.message : 'Unknown error'}`;
                        return ResponseFormatter.formatErrorResponse('get_pod_logs', errorMessage);
                    }
                },
            },

            // Help tool
            {
                name: 'help',
                description: 'Get help information about available tools',
                systemPrompt: ResponseFormatter.getSystemPrompt('help'),
                schema: {
                    type: 'object',
                    properties: {
                        tool: {
                            type: 'string',
                            description: 'Specific tool name to get help for (optional)',
                        },
                        category: {
                            type: 'string',
                            description: 'Tool category to list (connection, cluster, resource)',
                        },
                    },
                },
                execute: async (args) => {
                    try {
                        const {tool, category} = args || {};
                        
                        let data;
                        if (tool) {
                            data = KubernetesToolsService.getToolHelp(tool);
                        } else if (category) {
                            data = KubernetesToolsService.getCategoryHelp(category);
                        } else {
                            data = KubernetesToolsService.getAllToolsHelp();
                        }

                        return ResponseFormatter.formatResponse('help', data, undefined, {
                            includeMetadata: true,
                            includeSummary: true
                        });
                    } catch (error) {
                        const errorMessage = `Failed to get help: ${error instanceof Error ? error.message : 'Unknown error'}`;
                        return ResponseFormatter.formatErrorResponse('help', errorMessage);
                    }
                },
            },
        ];
    }

    static executeKubernetesTool(toolName: string, args: any, coreApi?: any, appsApi?: any): Promise<any> {
        const tools = this.getKubernetesTools();
        const tool = tools.find(t => t.name === toolName);
        
        if (!tool) {
            throw new Error(`Unknown Kubernetes tool: ${toolName}`);
        }

        // For connect_to_eks and help, we don't need APIs
        if (toolName === 'connect_to_eks' || toolName === 'help') {
            return tool.execute(args, undefined, undefined);
        }

        // For all other tools, we need the APIs from the authenticated service
        if (!this.eksAuth) {
            throw new Error('Not connected to any EKS cluster. Please connect first using connect_to_eks.');
        }

        // Use the APIs from the authenticated service if not provided
        if (!coreApi) {
            coreApi = this.eksAuth.getCoreV1Api();
        }
        if (!appsApi) {
            appsApi = this.eksAuth.getAppsV1Api();
        }
        
        return tool.execute(args, coreApi, appsApi);
    }

    static isConnected(): boolean {
        return this.eksAuth !== undefined;
    }

    static getEksAuth(): EKSAuthenticatorService | undefined {
        return this.eksAuth;
    }

    // Help system methods
    static getAllToolsHelp(): any {
        const tools = this.getKubernetesTools();
        const categories = {
            connection: tools.filter(t => t.name === 'connect_to_eks'),
            cluster: tools.filter(t => ['get_cluster_info', 'get_resource_usage', 'list_namespaces'].includes(t.name)),
            resource: tools.filter(t => ['list_pods', 'describe_pod', 'list_services', 'list_deployments', 'get_pod_logs'].includes(t.name)),
            helm: tools.filter(t => ['list_helm_releases', 'get_helm_release', 'get_helm_release_status', 'get_helm_release_history'].includes(t.name)),
            system: tools.filter(t => t.name === 'help')
        };

        return {
            title: 'EKS MCP Server - Available Tools',
            description: 'This MCP server provides tools for managing and monitoring EKS clusters.',
            totalTools: tools.length,
            categories: {
                connection: {
                    name: 'Connection Tools',
                    description: 'Tools for establishing connections to EKS clusters',
                    tools: categories.connection.map(t => ({
                        name: t.name,
                        description: t.description
                    }))
                },
                cluster: {
                    name: 'Cluster Information Tools',
                    description: 'Tools for getting cluster-wide information and statistics',
                    tools: categories.cluster.map(t => ({
                        name: t.name,
                        description: t.description
                    }))
                },
                resource: {
                    name: 'Resource Management Tools',
                    description: 'Tools for managing and monitoring Kubernetes resources',
                    tools: categories.resource.map(t => ({
                        name: t.name,
                        description: t.description
                    }))
                },
                helm: {
                    name: 'Helm Management Tools',
                    description: 'Tools for managing Helm releases and charts',
                    tools: categories.helm.map(t => ({
                        name: t.name,
                        description: t.description
                    }))
                },
                system: {
                    name: 'System Tools',
                    description: 'Utility tools for getting help and information',
                    tools: categories.system.map(t => ({
                        name: t.name,
                        description: t.description
                    }))
                }
            },
            usage: {
                general: 'Use "help" to see this overview, "help {tool_name}" for specific tool details, or "help {category}" for category-specific help.',
                examples: [
                    'help connect_to_eks',
                    'help cluster',
                    'help list_pods'
                ]
            }
        };
    }

    static getCategoryHelp(category: string): any {
        const categoryMap = {
            'connection': {
                name: 'Connection Tools',
                description: 'Tools for establishing and managing connections to EKS clusters',
                tools: ['connect_to_eks']
            },
            'cluster': {
                name: 'Cluster Information Tools',
                description: 'Tools for getting cluster-wide information, statistics, and monitoring',
                tools: ['get_cluster_info', 'get_resource_usage', 'list_namespaces']
            },
            'resource': {
                name: 'Resource Management Tools',
                description: 'Tools for managing, monitoring, and debugging Kubernetes resources',
                tools: ['list_pods', 'describe_pod', 'list_services', 'list_deployments', 'get_pod_logs']
            },
            'helm': {
                name: 'Helm Management Tools',
                description: 'Tools for managing Helm releases, charts, and deployments',
                tools: ['list_helm_releases', 'get_helm_release', 'get_helm_release_status', 'get_helm_release_history']
            }
        };

        const categoryInfo = categoryMap[category as keyof typeof categoryMap];
        if (!categoryInfo) {
            throw new Error(`Unknown category: ${category}. Available categories: ${Object.keys(categoryMap).join(', ')}`);
        }

        const tools = this.getKubernetesTools().filter(t => categoryInfo.tools.includes(t.name));
        
        return {
            category: categoryInfo.name,
            description: categoryInfo.description,
            tools: tools.map(tool => ({
                name: tool.name,
                description: tool.description,
                parameters: this.formatToolParameters(tool.schema)
            }))
        };
    }

    static getToolHelp(toolName: string): any {
        const tools = this.getKubernetesTools();
        const tool = tools.find(t => t.name === toolName);
        
        if (!tool) {
            throw new Error(`Unknown tool: ${toolName}. Use "help" to see all available tools.`);
        }

        const examples = this.getToolExamples(toolName);
        
        return {
            name: tool.name,
            description: tool.description,
            parameters: this.formatToolParameters(tool.schema),
            examples: examples,
            requiresConnection: toolName !== 'connect_to_eks' && toolName !== 'help',
            systemPrompt: tool.systemPrompt
        };
    }

    private static formatToolParameters(schema: any): any {
        const properties = schema.properties || {};
        const required = schema.required || [];
        
        return Object.keys(properties).map(paramName => ({
            name: paramName,
            type: properties[paramName].type,
            description: properties[paramName].description,
            required: required.includes(paramName),
            default: properties[paramName].default
        }));
    }

    private static getToolExamples(toolName: string): string[] {
        const examples: { [key: string]: string[] } = {
            'connect_to_eks': [
                'connect_to_eks with clusterName="production-cluster" and region="us-west-2"',
                'connect_to_eks with clusterName="dev-cluster", region="us-east-1", and roleArn="arn:aws:iam::123456789012:role/EKSClusterRole"'
            ],
            'get_cluster_info': [
                'get_cluster_info'
            ],
            'get_resource_usage': [
                'get_resource_usage',
                'get_resource_usage with namespace="kube-system"'
            ],
            'list_namespaces': [
                'list_namespaces'
            ],
            'list_pods': [
                'list_pods',
                'list_pods with namespace="production"'
            ],
            'describe_pod': [
                'describe_pod with podName="web-app-123"',
                'describe_pod with podName="api-server" and namespace="backend"'
            ],
            'list_services': [
                'list_services',
                'list_services with namespace="frontend"'
            ],
            'list_deployments': [
                'list_deployments',
                'list_deployments with namespace="production"'
            ],
            'get_pod_logs': [
                'get_pod_logs with podName="web-app-123"',
                'get_pod_logs with podName="api-server", namespace="backend", container="app", and tailLines=50'
            ],
            'list_helm_releases': [
                'list_helm_releases',
                'list_helm_releases with namespace="production"',
                'list_helm_releases with status="deployed"'
            ],
            'get_helm_release': [
                'get_helm_release with releaseName="my-app"',
                'get_helm_release with releaseName="database" and namespace="backend"'
            ],
            'get_helm_release_status': [
                'get_helm_release_status with releaseName="my-app"',
                'get_helm_release_status with releaseName="database" and namespace="backend"'
            ],
            'get_helm_release_history': [
                'get_helm_release_history with releaseName="my-app"',
                'get_helm_release_history with releaseName="database", namespace="backend", and max=5'
            ],
            'help': [
                'help',
                'help with tool="connect_to_eks"',
                'help with category="cluster"'
            ]
        };

        return examples[toolName] || [];
    }
} 