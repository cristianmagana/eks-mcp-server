import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import {KubeConfigData, EKSClusterInfo} from '../types/eks.js';

export class KubeConfigUtil {
    static writeKubeConfig = async (kubeconfig: KubeConfigData): Promise<void> => {
        const kubeconfigPath = path.join(os.homedir(), '.kube', 'config');

        // Ensure .kube directory exists
        const kubeDir = path.dirname(kubeconfigPath);
        if (!fs.existsSync(kubeDir)) {
            fs.mkdirSync(kubeDir, {recursive: true});
        }

        // Write kubeconfig
        fs.writeFileSync(kubeconfigPath, JSON.stringify(kubeconfig, null, 2));
    };

    static generateKubeConfig = (
        clusterName: string,
        clusterInfo: EKSClusterInfo,
        credentials: any,
        region: string
    ): KubeConfigData => {
        const clusterArn = `arn:aws:eks:${region}:${credentials.accessKeyId}:cluster/${clusterName}`;

        return {
            apiVersion: 'v1',
            kind: 'Config',
            clusters: [
                {
                    name: clusterArn,
                    cluster: {
                        'certificate-authority-data': clusterInfo.certificateAuthority,
                        server: clusterInfo.endpoint,
                    },
                },
            ],
            contexts: [
                {
                    name: clusterArn,
                    context: {
                        cluster: clusterArn,
                        user: clusterArn,
                    },
                },
            ],
            'current-context': clusterArn,
            preferences: {},
            users: [
                {
                    name: clusterArn,
                    user: {
                        exec: {
                            apiVersion: 'client.authentication.k8s.io/v1beta1',
                            command: 'aws',
                            args: [
                                'eks',
                                'get-token',
                                '--cluster-name',
                                clusterName,
                                '--region',
                                region,
                            ],
                            env: [
                                {
                                    name: 'AWS_PROFILE',
                                    value: process.env.AWS_PROFILE || 'default',
                                },
                            ],
                        },
                    },
                },
            ],
        };
    };
} 