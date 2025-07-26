export interface MCPTool {
    name: string;
    description: string;
    inputSchema: Record<string, unknown>;
}

export interface MCPResponse {
    content: Array<{
        type: string;
        text: string;
    }>;
}

export interface KubernetesTool {
    name: string;
    description: string;
    execute: (args: any, coreApi: any, appsApi: any) => Promise<any>;
    schema: any;
} 