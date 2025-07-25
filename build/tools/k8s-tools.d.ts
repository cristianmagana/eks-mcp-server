import { CoreV1Api, AppsV1Api } from '@kubernetes/client-node';
export interface KubernetesTool {
    name: string;
    description: string;
    execute: (args: any, coreApi: CoreV1Api, appsApi: AppsV1Api) => Promise<any>;
    schema: any;
}
export declare const kubernetesTools: KubernetesTool[];
export declare function setupKubernetesTools(): KubernetesTool[];
//# sourceMappingURL=k8s-tools.d.ts.map