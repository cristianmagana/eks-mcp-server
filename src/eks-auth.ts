import {EKS} from '@aws-sdk/client-eks';
import {fromNodeProviderChain} from '@aws-sdk/credential-providers';
import {KubeConfig, CoreV1Api, AppsV1Api} from '@kubernetes/client-node';

export interface EKSClusterConfig {
    clusterName: string;
    region: string;
    roleArn?: string;
}

export class EKSAuthenticator {
    private eksClient: EKS;
    private kubeConfig: KubeConfig;
    private coreV1Api?: CoreV1Api;
    private appsV1Api?: AppsV1Api;
    private clusterConfig: EKSClusterConfig;

    constructor(config: EKSClusterConfig) {
        this.clusterConfig = config;

        // Initialize AWS EKS client with credential chain
        this.eksClient = new EKS({
            region: config.region,
            credentials: fromNodeProviderChain({
                // Will try: env vars, EC2 instance metadata, shared credentials file, etc.
                roleArn: config.roleArn,
            }),
        });

        this.kubeConfig = new KubeConfig();
    }

    async authenticate(): Promise<void> {
        try {
            // Get cluster information from EKS
            const clusterResponse = await this.eksClient.describeCluster({
                name: this.clusterConfig.clusterName,
            });

            if (!clusterResponse.cluster) {
                throw new Error(`Cluster ${this.clusterConfig.clusterName} not found`);
            }

            const cluster = clusterResponse.cluster;

            if (!cluster.endpoint || !cluster.certificateAuthority?.data) {
                throw new Error('Cluster endpoint or certificate authority not available');
            }

            // Generate EKS token
            const token = await this.generateEKSToken();

            // Configure kubectl-like authentication
            this.kubeConfig.loadFromOptions({
                clusters: [
                    {
                        name: this.clusterConfig.clusterName,
                        server: cluster.endpoint,
                        certificateAuthorityData: cluster.certificateAuthority.data,
                    },
                ],
                users: [
                    {
                        name: 'eks-user',
                        token: token,
                    },
                ],
                contexts: [
                    {
                        name: 'eks-context',
                        cluster: this.clusterConfig.clusterName,
                        user: 'eks-user',
                    },
                ],
                currentContext: 'eks-context',
            });

            // Initialize Kubernetes API clients
            this.coreV1Api = this.kubeConfig.makeApiClient(CoreV1Api);
            this.appsV1Api = this.kubeConfig.makeApiClient(AppsV1Api);

            console.log(`Successfully authenticated to EKS cluster: ${this.clusterConfig.clusterName}`);
        } catch (error) {
            console.error('EKS authentication failed:', error);
            throw error;
        }
    }

    private async generateEKSToken(): Promise<string> {
        // This generates an EKS authentication token similar to `aws eks get-token`
        const credentials = await fromNodeProviderChain({
            roleArn: this.clusterConfig.roleArn,
        })();

        const timestamp = Math.floor(Date.now() / 1000);
        const expiration = timestamp + 900; // 15 minutes

        // Create the token payload (simplified version)
        const tokenPayload = {
            kind: 'ExecCredential',
            apiVersion: 'client.authentication.k8s.io/v1beta1',
            spec: {},
            status: {
                expirationTimestamp: new Date(expiration * 1000).toISOString(),
                token: await this.createPresignedToken(credentials),
            },
        };

        return tokenPayload.status.token;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
    private async createPresignedToken(_credentials: any): Promise<string> {
        // Simplified token creation - in production, use aws-iam-authenticator logic
        const payload = {
            cluster: this.clusterConfig.clusterName,
            timestamp: Date.now(),
        };

        const tokenString = Buffer.from(JSON.stringify(payload)).toString('base64');
        return `k8s-aws-v1.${tokenString}`;
    }

    async testConnection(): Promise<boolean> {
        try {
            if (!this.coreV1Api) {
                throw new Error('Not authenticated. Call authenticate() first.');
            }

            const response = await this.coreV1Api.listNamespace();
            console.log(`Connected to cluster. Found ${response.items.length} namespaces.`);
            return true;
        } catch (error) {
            console.error('Connection test failed:', error);
            return false;
        }
    }

    getCoreV1Api(): CoreV1Api {
        if (!this.coreV1Api) {
            throw new Error('Not authenticated. Call authenticate() first.');
        }
        return this.coreV1Api;
    }

    getAppsV1Api(): AppsV1Api {
        if (!this.appsV1Api) {
            throw new Error('Not authenticated. Call authenticate() first.');
        }
        return this.appsV1Api;
    }

    getKubeConfig(): KubeConfig {
        return this.kubeConfig;
    }
}
