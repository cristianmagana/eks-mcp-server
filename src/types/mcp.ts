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
    systemPrompt?: string;
}

export interface StructuredResponse {
    success: boolean;
    data?: any;
    error?: string;
    message?: string;
    metadata?: {
        timestamp: string;
        tool: string;
        executionTime?: number;
        clusterInfo?: {
            connected: boolean;
            clusterName?: string;
            region?: string;
        };
    };
    summary?: {
        title: string;
        description: string;
        keyMetrics?: Record<string, any>;
        recommendations?: string[];
    };
}

export interface SystemInstructions {
    responseFormat: 'structured' | 'simple';
    includeMetadata: boolean;
    includeSummary: boolean;
    summaryFormat: 'detailed' | 'concise';
    errorHandling: 'detailed' | 'simple';
} 