import * as k8s from '@kubernetes/client-node';
import {EKSClusterConfig} from '../types/eks.js';

export interface IEKSAuthenticator {
    authenticate(): Promise<void>;
    testConnection(): Promise<boolean>;
    listNamespaces(): Promise<void>;
    getCurrentIdentity(): Promise<string>;
    getClusterInfo(clusterName: string): Promise<any>;
    updateKubeConfig(clusterName: string): Promise<void>;
    getCoreV1Api(): k8s.CoreV1Api;
    getAppsV1Api(): k8s.AppsV1Api;
    getKubeConfig(): k8s.KubeConfig;
} 