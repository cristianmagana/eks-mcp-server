/* eslint-disable @typescript-eslint/no-explicit-any */
import {CoreV1Api, AppsV1Api} from '@kubernetes/client-node';

export interface KubernetesTool {
    name: string;
    description: string;
    execute: (args: any, coreApi: CoreV1Api, appsApi: AppsV1Api) => Promise<any>;
    schema: any;
}

export const kubernetesTools: KubernetesTool[] = [
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
                nodes: nodes.items.map(node => ({
                    name: node.metadata?.name,
                    status: node.status?.conditions?.find(c => c.type === 'Ready')?.status,
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
                runningPods: pods.items.filter(p => p.status?.phase === 'Running').length,
                pendingPods: pods.items.filter(p => p.status?.phase === 'Pending').length,
                failedPods: pods.items.filter(p => p.status?.phase === 'Failed').length,
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
                    containers: pod.spec?.containers?.map(c => ({
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

            return services.items.map(svc => ({
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

            return deployments.items.map(dep => ({
                name: dep.metadata?.name,
                namespace: dep.metadata?.namespace,
                replicas: {
                    desired: dep.spec?.replicas,
                    ready: dep.status?.readyReplicas,
                    available: dep.status?.availableReplicas,
                    updated: dep.status?.updatedReplicas,
                },
                images: dep.spec?.template?.spec?.containers?.map(c => c.image),
                creationTimestamp: dep.metadata?.creationTimestamp,
            }));
        },
    },
];

export function setupKubernetesTools() {
    return kubernetesTools;
}
