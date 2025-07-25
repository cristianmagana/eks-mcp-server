import { KubeConfig, CoreV1Api, AppsV1Api } from '@kubernetes/client-node';
export interface EKSClusterConfig {
    clusterName: string;
    region: string;
    roleArn?: string;
}
export declare class EKSAuthenticator {
    private eksClient;
    private kubeConfig;
    private coreV1Api?;
    private appsV1Api?;
    private clusterConfig;
    constructor(config: EKSClusterConfig);
    authenticate(): Promise<void>;
    private generateEKSToken;
    private createPresignedToken;
    testConnection(): Promise<boolean>;
    getCoreV1Api(): CoreV1Api;
    getAppsV1Api(): AppsV1Api;
    getKubeConfig(): KubeConfig;
}
//# sourceMappingURL=eks-auth.d.ts.map