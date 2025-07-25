#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-explicit-any */

import {Server} from '@modelcontextprotocol/sdk/server/index.js';
import {StdioServerTransport} from '@modelcontextprotocol/sdk/server/stdio.js';
import {CallToolRequestSchema, ErrorCode, ListToolsRequestSchema, McpError} from '@modelcontextprotocol/sdk/types.js';
import {z} from 'zod';
import {EKSAuthenticator, EKSClusterConfig} from './eks-auth.js';

class EKSMCPServer {
    private server: Server;
    private eksAuth?: EKSAuthenticator;

    constructor() {
        this.server = new Server(
            {
                name: 'eks-mcp-server',
                version: '0.1.0',
            },
            {
                capabilities: {
                    tools: {},
                    resources: {},
                },
            }
        );

        this.setupHandlers();
    }

    private setupHandlers(): void {
        // List available tools
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            return {
                tools: [
                    {
                        name: 'connect_to_eks',
                        description: 'Connect to an EKS cluster',
                        inputSchema: {
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
                    },
                    {
                        name: 'list_namespaces',
                        description: 'List all namespaces in the connected cluster',
                        inputSchema: {
                            type: 'object',
                            properties: {},
                        },
                    },
                    {
                        name: 'list_pods',
                        description: 'List pods in a specific namespace',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                namespace: {
                                    type: 'string',
                                    description: 'Namespace to list pods from (default: default)',
                                },
                            },
                        },
                    },
                    {
                        name: 'get_pod_logs',
                        description: 'Get logs from a specific pod',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                podName: {
                                    type: 'string',
                                    description: 'Name of the pod',
                                },
                                namespace: {
                                    type: 'string',
                                    description: 'Namespace of the pod (default: default)',
                                },
                                container: {
                                    type: 'string',
                                    description: 'Container name (optional)',
                                },
                                tailLines: {
                                    type: 'number',
                                    description: 'Number of lines to tail (default: 100)',
                                },
                            },
                            required: ['podName'],
                        },
                    },
                ],
            };
        });

        // Handle tool calls
        this.server.setRequestHandler(CallToolRequestSchema, async request => {
            try {
                switch (request.params.name) {
                    case 'connect_to_eks':
                        return await this.handleConnectToEKS(request.params.arguments);

                    case 'list_namespaces':
                        return await this.handleListNamespaces();

                    case 'list_pods':
                        return await this.handleListPods(request.params.arguments);

                    case 'get_pod_logs':
                        return await this.handleGetPodLogs(request.params.arguments);

                    default:
                        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
                }
            } catch (error) {
                if (error instanceof McpError) {
                    throw error;
                }
                throw new McpError(ErrorCode.InternalError, `Tool execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }

    private async handleConnectToEKS(args: any) {
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

        this.eksAuth = new EKSAuthenticator(config);

        try {
            await this.eksAuth.authenticate();
            const isConnected = await this.eksAuth.testConnection();

            if (isConnected) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Successfully connected to EKS cluster: ${clusterName} in region: ${region}`,
                        },
                    ],
                };
            } else {
                throw new Error('Connection test failed');
            }
        } catch (error) {
            throw new McpError(ErrorCode.InternalError, `Failed to connect to EKS cluster: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    private async handleListNamespaces() {
        if (!this.eksAuth) {
            throw new McpError(ErrorCode.InvalidRequest, 'Not connected to any EKS cluster');
        }

        try {
            const coreApi = this.eksAuth.getCoreV1Api();
            const response = await coreApi.listNamespace();

            const namespaces = response.items.map(ns => ({
                name: ns.metadata?.name,
                status: ns.status?.phase,
                creationTimestamp: ns.metadata?.creationTimestamp,
            }));

            return {
                content: [
                    {
                        type: 'text',
                        text: `Found ${namespaces.length} namespaces:\n${JSON.stringify(namespaces, null, 2)}`,
                    },
                ],
            };
        } catch (error) {
            throw new McpError(ErrorCode.InternalError, `Failed to list namespaces: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    private async handleListPods(args: any) {
        if (!this.eksAuth) {
            throw new McpError(ErrorCode.InvalidRequest, 'Not connected to any EKS cluster');
        }

        const schema = z.object({
            namespace: z.string().default('default'),
        });

        const {namespace} = schema.parse(args || {});

        try {
            const coreApi = this.eksAuth.getCoreV1Api();
            const response = await coreApi.listNamespacedPod({namespace});

            const pods = response.items.map(pod => ({
                name: pod.metadata?.name,
                namespace: pod.metadata?.namespace,
                status: pod.status?.phase,
                ready: pod.status?.containerStatuses?.every(cs => cs.ready) || false,
                restarts: pod.status?.containerStatuses?.reduce((sum, cs) => sum + cs.restartCount, 0) || 0,
                age: pod.metadata?.creationTimestamp,
            }));

            return {
                content: [
                    {
                        type: 'text',
                        text: `Found ${pods.length} pods in namespace '${namespace}':\n${JSON.stringify(pods, null, 2)}`,
                    },
                ],
            };
        } catch (error) {
            throw new McpError(ErrorCode.InternalError, `Failed to list pods: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    private async handleGetPodLogs(args: any) {
        if (!this.eksAuth) {
            throw new McpError(ErrorCode.InvalidRequest, 'Not connected to any EKS cluster');
        }

        const schema = z.object({
            podName: z.string(),
            namespace: z.string().default('default'),
            container: z.string().optional(),
            tailLines: z.number().default(100),
        });

        const {podName, namespace, container, tailLines} = schema.parse(args);

        try {
            const coreApi = this.eksAuth.getCoreV1Api();

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
                content: [
                    {
                        type: 'text',
                        text: `Logs for pod '${podName}' in namespace '${namespace}'${container ? ` (container: ${container})` : ''}:\n\n${response}`,
                    },
                ],
            };
        } catch (error) {
            throw new McpError(ErrorCode.InternalError, `Failed to get pod logs: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async run(): Promise<void> {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('EKS MCP server started');
    }
}

// Start the server
const server = new EKSMCPServer();
server.run().catch(error => {
    console.error('Server failed to start:', error);
    throw new Error('Server failed to start');
});
