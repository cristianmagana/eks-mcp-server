import * as k8s from '@kubernetes/client-node';
import {
    EKSClient as AWSEKSClient,
    DescribeClusterCommand,
} from '@aws-sdk/client-eks';
import {STSClient, GetCallerIdentityCommand} from '@aws-sdk/client-sts';
import {EKSClusterConfig, EKSClusterInfo} from '../types/eks.js';
import {IEKSAuthenticator} from '../interfaces/eks-auth.interface.js';
import {KubeConfigUtil} from '../util/kubeconfig.util.js';
import {AWSUtil} from '../util/aws.util.js';

export class EKSAuthenticatorService implements IEKSAuthenticator {
    private eksClient: AWSEKSClient;
    private stsClient: STSClient;
    private kubeConfig: k8s.KubeConfig;
    private coreV1Api?: k8s.CoreV1Api;
    private appsV1Api?: k8s.AppsV1Api;
    private clusterConfig: EKSClusterConfig;

    constructor(config: EKSClusterConfig) {
        this.clusterConfig = config;

        // Initialize AWS SDK clients using the default profile
        this.eksClient = new AWSEKSClient({
            region: config.region,
        });
        this.stsClient = new STSClient({
            region: config.region,
        });

        // Initialize Kubernetes client
        this.kubeConfig = new k8s.KubeConfig();
    }

    getCurrentIdentity = async (): Promise<string> => {
        try {
            const command = new GetCallerIdentityCommand({});
            const response = await this.stsClient.send(command);
            return response.Account || 'Unknown';
        } catch (error) {
            console.error('Error getting AWS identity:', error);
            throw error;
        }
    };

    getClusterInfo = async (clusterName: string): Promise<EKSClusterInfo> => {
        try {
            const command = new DescribeClusterCommand({name: clusterName});
            const response = await this.eksClient.send(command);

            if (!response.cluster) {
                throw new Error(`Cluster ${clusterName} not found`);
            }

            return {
                name: response.cluster.name || clusterName,
                endpoint: response.cluster.endpoint || '',
                certificateAuthority: response.cluster.certificateAuthority?.data || '',
                region: this.clusterConfig.region,
            };
        } catch (error) {
            console.error(`Error getting cluster info for ${clusterName}:`, error);
            throw error;
        }
    };

    authenticate = async (): Promise<void> => {
        try {
            console.log(`Authenticating to EKS cluster: ${this.clusterConfig.clusterName}`);

            // Get current AWS identity
            const accountId = await this.getCurrentIdentity();
            console.log(`AWS Account: ${accountId}`);

            // Get cluster information
            const clusterInfo = await this.getClusterInfo(this.clusterConfig.clusterName);
            console.log('Cluster Information:');
            console.log(`  Name: ${clusterInfo.name}`);
            console.log(`  Endpoint: ${clusterInfo.endpoint}`);
            console.log(`  Region: ${clusterInfo.region}`);

            // Update kubeconfig using pure SDK
            await this.updateKubeConfig(this.clusterConfig.clusterName);

            // Reload the kubeconfig and initialize API clients
            this.kubeConfig.loadFromDefault();
            this.coreV1Api = this.kubeConfig.makeApiClient(k8s.CoreV1Api);
            this.appsV1Api = this.kubeConfig.makeApiClient(k8s.AppsV1Api);

            console.log(`Successfully authenticated to EKS cluster: ${this.clusterConfig.clusterName}`);
        } catch (error) {
            console.error('EKS authentication failed:', error);
            throw new Error(`Failed to authenticate to EKS cluster: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    updateKubeConfig = async (clusterName: string): Promise<void> => {
        try {
            console.log(`Updating kubeconfig for cluster: ${clusterName}`);

            // Get cluster info to build kubeconfig
            const clusterInfo = await this.getClusterInfo(clusterName);

            // Get AWS credentials
            const credentials = await AWSUtil.getAWSCredentials();

            // Generate kubeconfig content
            const kubeconfig = KubeConfigUtil.generateKubeConfig(
                clusterName,
                clusterInfo,
                credentials,
                this.clusterConfig.region
            );

            // Write to kubeconfig file
            await KubeConfigUtil.writeKubeConfig(kubeconfig);

            console.log('Kubeconfig updated successfully');
        } catch (error) {
            console.error('Error updating kubeconfig:', error);
            throw error;
        }
    };

    testConnection = async (): Promise<boolean> => {
        try {
            if (!this.coreV1Api) {
                throw new Error('Not authenticated. Call authenticate() first.');
            }

            console.log('Testing connection by listing namespaces...');
            const response = await this.coreV1Api.listNamespace();
            console.log(`Successfully connected! Found ${response.items.length} namespaces`);
            return true;
        } catch (error) {
            console.error('Connection test failed with error:', error);
            if (error instanceof Error) {
                console.error('Error message:', error.message);
                console.error('Error stack:', error.stack);
            }
            return false;
        }
    };

    listNamespaces = async (): Promise<void> => {
        try {
            if (!this.coreV1Api) {
                throw new Error('Not authenticated. Call authenticate() first.');
            }

            console.log('Fetching namespaces from EKS cluster...\n');

            const response = await this.coreV1Api.listNamespace();

            if (response.items && response.items.length > 0) {
                console.log('Namespaces found:');
                console.log('================');

                response.items.forEach((namespace: any) => {
                    const name = namespace.metadata?.name || 'Unknown';
                    const status = namespace.status?.phase || 'Unknown';
                    const creationTimestamp = namespace.metadata?.creationTimestamp || 'Unknown';

                    console.log(`Name: ${name}`);
                    console.log(`Status: ${status}`);
                    console.log(`Created: ${creationTimestamp}`);
                    console.log('---');
                });

                console.log(`Total namespaces: ${response.items.length}`);
            } else {
                console.log('No namespaces found in the cluster.');
            }
        } catch (error) {
            console.error('Error listing namespaces:', error);
            throw error;
        }
    };

    getCoreV1Api = (): k8s.CoreV1Api => {
        if (!this.coreV1Api) {
            throw new Error('Not authenticated. Call authenticate() first.');
        }
        return this.coreV1Api;
    };

    getAppsV1Api = (): k8s.AppsV1Api => {
        if (!this.appsV1Api) {
            throw new Error('Not authenticated. Call authenticate() first.');
        }
        return this.appsV1Api;
    };

    getKubeConfig = (): k8s.KubeConfig => {
        return this.kubeConfig;
    };
} 