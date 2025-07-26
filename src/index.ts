import {Server} from '@modelcontextprotocol/sdk/server/index.js';
import {StdioServerTransport} from '@modelcontextprotocol/sdk/server/stdio.js';
import {CallToolRequestSchema, ErrorCode, ListToolsRequestSchema, McpError} from '@modelcontextprotocol/sdk/types.js';
import {KubernetesToolsService} from './services/kubernetes-tools.service.js';

class EKSMCPServer {
    private server: Server;

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

    private setupHandlers = (): void => {
        // List available tools
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            const kubernetesTools = KubernetesToolsService.getKubernetesTools();
            
            return {
                tools: kubernetesTools.map(tool => ({
                    name: tool.name,
                    description: tool.description,
                    inputSchema: tool.schema,
                })),
            };
        });

        // Handle tool calls
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            try {
                const kubernetesTools = KubernetesToolsService.getKubernetesTools();
                const kubernetesTool = kubernetesTools.find(tool => tool.name === request.params.name);
                
                if (kubernetesTool) {
                    return await this.handleKubernetesTool(request.params.name, request.params.arguments);
                }

                throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
            } catch (error) {
                if (error instanceof McpError) {
                    throw error;
                }
                throw new McpError(ErrorCode.InternalError, `Tool execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    };

    private handleKubernetesTool = async (toolName: string, args: any) => {
        try {
            const result = await KubernetesToolsService.executeKubernetesTool(toolName, args);
            
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(result, null, 2),
                    },
                ],
            };
        } catch (error) {
            throw new McpError(ErrorCode.InternalError, `Kubernetes tool execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    run = async (): Promise<void> => {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
    };
}

// Start the server
const server = new EKSMCPServer();
server.run().catch(error => {
    throw new Error('Server failed to start');
});
