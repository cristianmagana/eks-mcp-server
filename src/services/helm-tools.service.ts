import { KubernetesTool } from '../types/mcp.js';
import { z } from 'zod';
import { EKSAuthenticatorService } from './eks-auth.service.js';
import { ResponseFormatter } from '../util/response-formatter.util.js';
import Helm from 'node-helm';

export class HelmToolsService {
    private static eksAuth?: EKSAuthenticatorService;
    private static helmClient?: Helm;

    static getHelmTools(): KubernetesTool[] {
        return [
            {
                name: 'list_helm_releases',
                description: 'List all Helm releases across all namespaces',
                systemPrompt: ResponseFormatter.getSystemPrompt('list_helm_releases'),
                schema: {
                    type: 'object',
                    properties: {
                        namespace: {
                            type: 'string',
                            description: 'Optional namespace to filter releases',
                        },
                        status: {
                            type: 'string',
                            description: 'Optional status filter (deployed, failed, pending, etc.)',
                        },
                    },
                },
                execute: async (args, _coreApi, _appsApi) => {
                    const startTime = Date.now();
                    try {
                        const schema = z.object({
                            namespace: z.string().optional(),
                            status: z.string().optional(),
                        });

                        const { namespace, status } = schema.parse(args);

                        if (!HelmToolsService.eksAuth) {
                            throw new Error('Not connected to any EKS cluster. Please connect first using connect_to_eks.');
                        }

                        // Initialize Helm client if not already done
                        if (!HelmToolsService.helmClient) {
                            // Use default kubeconfig path since it's already configured by EKS auth
                            HelmToolsService.helmClient = new Helm();
                        }

                        // Build helm list command
                        const listArgs = ['list', '--output', 'json', '--all-namespaces'];
                        
                        if (namespace) {
                            listArgs.push('--namespace', namespace);
                        }

                        const result = await HelmToolsService.helmClient.exec(listArgs.join(' '));
                        const releases = JSON.parse(result);

                        // Filter by status if specified
                        let filteredReleases = releases;
                        if (status) {
                            filteredReleases = releases.filter((release: any) => 
                                release.status?.toLowerCase() === status.toLowerCase()
                            );
                        }

                        const data = {
                            totalReleases: filteredReleases.length,
                            releases: filteredReleases.map((release: any) => ({
                                name: release.name,
                                namespace: release.namespace,
                                status: release.status,
                                revision: release.revision,
                                chart: release.chart,
                                appVersion: release.appVersion,
                                lastDeployed: release.updated,
                            })),
                            summary: {
                                byStatus: filteredReleases.reduce((acc: any, release: any) => {
                                    const status = release.status || 'unknown';
                                    acc[status] = (acc[status] || 0) + 1;
                                    return acc;
                                }, {}),
                                byNamespace: filteredReleases.reduce((acc: any, release: any) => {
                                    const ns = release.namespace || 'default';
                                    acc[ns] = (acc[ns] || 0) + 1;
                                    return acc;
                                }, {}),
                            },
                        };

                        return ResponseFormatter.formatResponse('list_helm_releases', data, undefined, {
                            includeMetadata: true,
                            includeSummary: true
                        });
                    } catch (error) {
                        const errorMessage = `Failed to list Helm releases: ${error instanceof Error ? error.message : 'Unknown error'}`;
                        return ResponseFormatter.formatErrorResponse('list_helm_releases', errorMessage);
                    }
                },
            },

            {
                name: 'get_helm_release',
                description: 'Get detailed information about a specific Helm release',
                systemPrompt: ResponseFormatter.getSystemPrompt('get_helm_release'),
                schema: {
                    type: 'object',
                    properties: {
                        releaseName: {
                            type: 'string',
                            description: 'Name of the Helm release',
                        },
                        namespace: {
                            type: 'string',
                            description: 'Namespace of the Helm release',
                            default: 'default',
                        },
                    },
                    required: ['releaseName'],
                },
                execute: async (args, _coreApi, _appsApi) => {
                    const startTime = Date.now();
                    try {
                        const schema = z.object({
                            releaseName: z.string(),
                            namespace: z.string().default('default'),
                        });

                        const { releaseName, namespace } = schema.parse(args);

                        if (!HelmToolsService.eksAuth) {
                            throw new Error('Not connected to any EKS cluster. Please connect first using connect_to_eks.');
                        }

                        // Initialize Helm client if not already done
                        if (!HelmToolsService.helmClient) {
                            // Use default kubeconfig path since it's already configured by EKS auth
                            HelmToolsService.helmClient = new Helm();
                        }

                        // Get release status
                        const statusResult = await HelmToolsService.helmClient.exec(
                            `status ${releaseName} --namespace ${namespace} --output json`
                        );
                        const status = JSON.parse(statusResult);

                        // Get release values
                        const valuesResult = await HelmToolsService.helmClient.exec(
                            `get values ${releaseName} --namespace ${namespace} --output json`
                        );
                        const values = JSON.parse(valuesResult);

                        // Get release manifest
                        const manifestResult = await HelmToolsService.helmClient.exec(
                            `get manifest ${releaseName} --namespace ${namespace}`
                        );

                        const data = {
                            releaseName,
                            namespace,
                            status: {
                                info: status.info,
                                resources: status.resources,
                                hooks: status.hooks,
                                version: status.version,
                                namespace: status.namespace,
                                lastDeployed: status.lastDeployed,
                                status: status.status,
                            },
                            values,
                            manifest: manifestResult,
                            summary: {
                                resourceCount: status.resources?.length || 0,
                                hookCount: status.hooks?.length || 0,
                                lastDeployed: status.lastDeployed,
                                status: status.status,
                            },
                        };

                        return ResponseFormatter.formatResponse('get_helm_release', data, undefined, {
                            includeMetadata: true,
                            includeSummary: true
                        });
                    } catch (error) {
                        const errorMessage = `Failed to get Helm release: ${error instanceof Error ? error.message : 'Unknown error'}`;
                        return ResponseFormatter.formatErrorResponse('get_helm_release', errorMessage);
                    }
                },
            },

            {
                name: 'get_helm_release_status',
                description: 'Get the status of a specific Helm release',
                systemPrompt: ResponseFormatter.getSystemPrompt('get_helm_release_status'),
                schema: {
                    type: 'object',
                    properties: {
                        releaseName: {
                            type: 'string',
                            description: 'Name of the Helm release',
                        },
                        namespace: {
                            type: 'string',
                            description: 'Namespace of the Helm release',
                            default: 'default',
                        },
                    },
                    required: ['releaseName'],
                },
                execute: async (args, _coreApi, _appsApi) => {
                    const startTime = Date.now();
                    try {
                        const schema = z.object({
                            releaseName: z.string(),
                            namespace: z.string().default('default'),
                        });

                        const { releaseName, namespace } = schema.parse(args);

                        if (!HelmToolsService.eksAuth) {
                            throw new Error('Not connected to any EKS cluster. Please connect first using connect_to_eks.');
                        }

                        // Initialize Helm client if not already done
                        if (!HelmToolsService.helmClient) {
                            // Use default kubeconfig path since it's already configured by EKS auth
                            HelmToolsService.helmClient = new Helm();
                        }

                        // Get release status
                        const result = await HelmToolsService.helmClient.exec(
                            `status ${releaseName} --namespace ${namespace} --output json`
                        );
                        const status = JSON.parse(result);

                        const data = {
                            releaseName,
                            namespace,
                            status: status.status,
                            version: status.version,
                            lastDeployed: status.lastDeployed,
                            statusNamespace: status.namespace,
                            info: status.info,
                            resources: status.resources?.map((resource: any) => ({
                                kind: resource.kind,
                                name: resource.name,
                                status: resource.status,
                                manifest: resource.manifest,
                            })),
                            hooks: status.hooks?.map((hook: any) => ({
                                name: hook.name,
                                kind: hook.kind,
                                path: hook.path,
                                manifest: hook.manifest,
                            })),
                            summary: {
                                resourceCount: status.resources?.length || 0,
                                hookCount: status.hooks?.length || 0,
                                healthyResources: status.resources?.filter((r: any) => r.status === 'ok').length || 0,
                                failedResources: status.resources?.filter((r: any) => r.status === 'failed').length || 0,
                            },
                        };

                        return ResponseFormatter.formatResponse('get_helm_release_status', data, undefined, {
                            includeMetadata: true,
                            includeSummary: true
                        });
                    } catch (error) {
                        const errorMessage = `Failed to get Helm release status: ${error instanceof Error ? error.message : 'Unknown error'}`;
                        return ResponseFormatter.formatErrorResponse('get_helm_release_status', errorMessage);
                    }
                },
            },

            {
                name: 'get_helm_release_history',
                description: 'Get the revision history of a specific Helm release',
                systemPrompt: ResponseFormatter.getSystemPrompt('get_helm_release_history'),
                schema: {
                    type: 'object',
                    properties: {
                        releaseName: {
                            type: 'string',
                            description: 'Name of the Helm release',
                        },
                        namespace: {
                            type: 'string',
                            description: 'Namespace of the Helm release',
                            default: 'default',
                        },
                        max: {
                            type: 'number',
                            description: 'Maximum number of revisions to return',
                            default: 10,
                        },
                    },
                    required: ['releaseName'],
                },
                execute: async (args, _coreApi, _appsApi) => {
                    const startTime = Date.now();
                    try {
                        const schema = z.object({
                            releaseName: z.string(),
                            namespace: z.string().default('default'),
                            max: z.number().default(10),
                        });

                        const { releaseName, namespace, max } = schema.parse(args);

                        if (!HelmToolsService.eksAuth) {
                            throw new Error('Not connected to any EKS cluster. Please connect first using connect_to_eks.');
                        }

                        // Initialize Helm client if not already done
                        if (!HelmToolsService.helmClient) {
                            // Use default kubeconfig path since it's already configured by EKS auth
                            HelmToolsService.helmClient = new Helm();
                        }

                        // Get release history
                        const result = await HelmToolsService.helmClient.exec(
                            `history ${releaseName} --namespace ${namespace} --max ${max} --output json`
                        );
                        const history = JSON.parse(result);

                        const data = {
                            releaseName,
                            namespace,
                            totalRevisions: history.length,
                            currentRevision: history.find((rev: any) => rev.status === 'deployed')?.revision || 0,
                            history: history.map((revision: any) => ({
                                revision: revision.revision,
                                status: revision.status,
                                description: revision.description,
                                updated: revision.updated,
                                updatedBy: revision.updatedBy,
                            })),
                            summary: {
                                totalRevisions: history.length,
                                deployedRevisions: history.filter((rev: any) => rev.status === 'deployed').length,
                                failedRevisions: history.filter((rev: any) => rev.status === 'failed').length,
                                pendingRevisions: history.filter((rev: any) => rev.status === 'pending').length,
                                lastDeployed: history.find((rev: any) => rev.status === 'deployed')?.updated,
                            },
                        };

                        return ResponseFormatter.formatResponse('get_helm_release_history', data, undefined, {
                            includeMetadata: true,
                            includeSummary: true
                        });
                    } catch (error) {
                        const errorMessage = `Failed to get Helm release history: ${error instanceof Error ? error.message : 'Unknown error'}`;
                        return ResponseFormatter.formatErrorResponse('get_helm_release_history', errorMessage);
                    }
                },
            },
        ];
    }

    static executeHelmTool(toolName: string, args: any, coreApi?: any, appsApi?: any): Promise<any> {
        const tools = this.getHelmTools();
        const tool = tools.find(t => t.name === toolName);
        
        if (!tool) {
            throw new Error(`Unknown Helm tool: ${toolName}`);
        }

        // For all Helm tools, we need the authenticated service
        if (!this.eksAuth) {
            throw new Error('Not connected to any EKS cluster. Please connect first using connect_to_eks.');
        }

        return tool.execute(args, coreApi, appsApi);
    }

    static setEksAuth(eksAuth: EKSAuthenticatorService): void {
        this.eksAuth = eksAuth;
    }

    static isConnected(): boolean {
        return this.eksAuth !== undefined;
    }

    static getEksAuth(): EKSAuthenticatorService | undefined {
        return this.eksAuth;
    }
} 