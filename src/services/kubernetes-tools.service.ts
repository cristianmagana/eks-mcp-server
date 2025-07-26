import {KubernetesTool} from '../types/mcp.js';
import {z} from 'zod';
import {EKSAuthenticatorService} from './eks-auth.service.js';
import {EKSClusterConfig} from '../types/eks.js';

export class KubernetesToolsService {
    private static eksAuth?: EKSAuthenticatorService;

    static getKubernetesTools(): KubernetesTool[] {
        return [
            {
                name: 'connect_to_eks',
                description: 'Connect to an EKS cluster',
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

                    try {
                        await KubernetesToolsService.eksAuth.authenticate();
                        const isConnected = await KubernetesToolsService.eksAuth.testConnection();

                        if (isConnected) {
                            return {
                                success: true,
                                message: `Successfully connected to EKS cluster: ${clusterName} in region: ${region}`,
                                clusterName,
                                region,
                            };
                        } else {
                            throw new Error('Connection test failed');
                        }
                    } catch (error) {
                        throw new Error(`Failed to connect to EKS cluster: ${error instanceof Error ? error.message : 'Unknown error'}`);
                    }
                },
            },

            {
                name: 'get_cluster_info',
                description: 'Get general cluster information',
                schema: {
                    type: 'object',
                    properties: {},
                },
                execute: async (_args, coreApi) => {
                    const nodes = await coreApi.listNode();
                    const namespaces = await coreApi.listNamespace();

                    return {
                        nodeCount: nodes.items.length,
                        namespaceCount: namespaces.items.length,
                        nodes: nodes.items.map((node: any) => ({
                            name: node.metadata?.name,
                            status: node.status?.conditions?.find((c: any) => c.type === 'Ready')?.status,
                            version: node.status?.nodeInfo?.kubeletVersion,
                        })),
                    };
                },
            },

            {
                name: 'get_resource_usage',
                description: 'Get resource usage across the cluster',
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
                    const namespace = args?.namespace;

                    let pods;
                    if (namespace) {
                        pods = await coreApi.listNamespacedPod(namespace);
                    } else {
                        pods = await coreApi.listPodForAllNamespaces();
                    }

                    const resourceUsage = {
                        totalPods: pods.items.length,
                        runningPods: pods.items.filter((p: any) => p.status?.phase === 'Running').length,
                        pendingPods: pods.items.filter((p: any) => p.status?.phase === 'Pending').length,
                        failedPods: pods.items.filter((p: any) => p.status?.phase === 'Failed').length,
                    };

                    return resourceUsage;
                },
            },

            {
                name: 'describe_pod',
                description: 'Get detailed information about a specific pod',
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
                    const {podName, namespace = 'default'} = args;

                    const pod = await coreApi.readNamespacedPod(podName, namespace);

                    return {
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
                },
            },

            {
                name: 'list_services',
                description: 'List services in a namespace',
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
                    const {namespace = 'default'} = args || {};

                    const services = await coreApi.listNamespacedService(namespace);

                    return services.items.map((svc: any) => ({
                        name: svc.metadata?.name,
                        namespace: svc.metadata?.namespace,
                        type: svc.spec?.type,
                        clusterIP: svc.spec?.clusterIP,
                        ports: svc.spec?.ports,
                        selector: svc.spec?.selector,
                    }));
                },
            },

            {
                name: 'list_deployments',
                description: 'List deployments in a namespace',
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
                    const {namespace = 'default'} = args || {};

                    const deployments = await appsApi.listNamespacedDeployment(namespace);

                    return deployments.items.map((dep: any) => ({
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
                },
            },

            // Additional Kubernetes tools moved from index.ts
            {
                name: 'list_namespaces',
                description: 'List all namespaces in the connected cluster',
                schema: {
                    type: 'object',
                    properties: {},
                },
                execute: async (_args, coreApi) => {
                    const response = await coreApi.listNamespace();

                    const namespaces = response.items.map((ns: any) => ({
                        name: ns.metadata?.name,
                        status: ns.status?.phase,
                        creationTimestamp: ns.metadata?.creationTimestamp,
                    }));

                    return {
                        count: namespaces.length,
                        namespaces: namespaces,
                    };
                },
            },

            {
                name: 'list_pods',
                description: 'List pods in a specific namespace',
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
                    const {namespace = 'default'} = args || {};

                    const response = await coreApi.listNamespacedPod({namespace});

                    const pods = response.items.map((pod: any) => ({
                        name: pod.metadata?.name,
                        namespace: pod.metadata?.namespace,
                        status: pod.status?.phase,
                        ready: pod.status?.containerStatuses?.every((cs: any) => cs.ready) || false,
                        restarts: pod.status?.containerStatuses?.reduce((sum: number, cs: any) => sum + cs.restartCount, 0) || 0,
                        age: pod.metadata?.creationTimestamp,
                    }));

                    return {
                        namespace: namespace,
                        count: pods.length,
                        pods: pods,
                    };
                },
            },

            {
                name: 'get_pod_logs',
                description: 'Get logs from a specific pod',
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

                    return {
                        podName: podName,
                        namespace: namespace,
                        container: container || 'default',
                        tailLines: tailLines,
                        logs: response,
                    };
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

        // For connect_to_eks, we don't need APIs
        if (toolName === 'connect_to_eks') {
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
} 