export interface EKSClusterConfig {
    clusterName: string;
    region: string;
    roleArn?: string;
}

export interface EKSClusterInfo {
    name: string;
    endpoint: string;
    certificateAuthority: string;
    region: string;
}

export interface KubeConfigData {
    apiVersion: string;
    kind: string;
    clusters: Array<{
        name: string;
        cluster: {
            'certificate-authority-data': string;
            server: string;
        };
    }>;
    contexts: Array<{
        name: string;
        context: {
            cluster: string;
            user: string;
        };
    }>;
    'current-context': string;
    preferences: Record<string, unknown>;
    users: Array<{
        name: string;
        user: {
            exec: {
                apiVersion: string;
                command: string;
                args: string[];
                env: Array<{
                    name: string;
                    value: string;
                }>;
            };
        };
    }>;
} 