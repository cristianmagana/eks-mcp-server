# EKS MCP Server

A Model Context Protocol (MCP) server that provides seamless access to Amazon Elastic Kubernetes Service (EKS) clusters through AI assistants like Claude and Cursor.

## Overview

This MCP server enables AI assistants to interact with EKS clusters by providing a set of tools for cluster management, resource monitoring, and debugging. It handles AWS authentication, EKS cluster connections, and Kubernetes API operations in a secure and organized manner.

## Architecture

### Project Structure

```
eks-mcp-server/
├── src/
│   ├── index.ts                 # Main MCP server entry point
│   ├── services/
│   │   ├── eks-auth.service.ts      # AWS/EKS authentication service
│   │   └── kubernetes-tools.service.ts  # All Kubernetes tools and operations
│   ├── interfaces/
│   │   └── eks-auth.interface.ts    # EKS authentication interface
│   ├── types/
│   │   ├── eks.ts                   # EKS-specific type definitions
│   │   └── mcp.ts                   # MCP protocol type definitions
│   └── util/
│       ├── aws.util.ts              # AWS utility functions
│       └── kubeconfig.util.ts       # Kubernetes config utilities
├── test/
│   └── test-connection.js           # Connection testing utilities
├── package.json
├── tsconfig.json
└── README.md
```

### Architecture Design

The application follows a clean, modular architecture with clear separation of concerns:

1. **Main Server (`index.ts`)**: Handles MCP protocol routing and tool delegation
2. **KubernetesToolsService**: Centralized management of all Kubernetes operations and authentication state
3. **EKSAuthenticatorService**: Handles AWS/EKS authentication and cluster connections
4. **ResponseFormatter**: Provides structured response formatting with system prompts and metadata
5. **Utility Modules**: AWS and Kubernetes configuration utilities

### Tool Categories

The MCP server provides 9 tools organized into three categories:

#### Connection Tools
- `connect_to_eks`: Establish connection to an EKS cluster

#### Cluster Information Tools
- `get_cluster_info`: Get general cluster information (nodes, namespaces)
- `get_resource_usage`: Get resource usage across the cluster
- `list_namespaces`: List all namespaces in the connected cluster

#### Resource Management Tools
- `list_pods`: List pods in a specific namespace
- `describe_pod`: Get detailed information about a specific pod
- `list_services`: List services in a namespace
- `list_deployments`: List deployments in a namespace
- `get_pod_logs`: Get logs from a specific pod

#### System Tools
- `help`: Get help information about available tools and their usage

## Prerequisites

- Node.js 18+ 
- AWS CLI configured with appropriate credentials
- Access to an EKS cluster
- TypeScript knowledge (for development)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd eks-mcp-server
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

## Configuration

### AWS Credentials

Ensure your AWS credentials are properly configured:

```bash
aws configure
```

Or set environment variables:
```bash
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_DEFAULT_REGION=your_region
```

### EKS Cluster Access

Make sure you have the necessary permissions to:
- Describe EKS clusters
- Assume IAM roles (if using role-based access)
- Access Kubernetes API resources

## Usage

### Running the MCP Server

1. Build the project:
```bash
npm run build
```

2. Run the server:
```bash
node build/index.js
```

The server will start and listen for MCP protocol messages via stdio.

### Testing the Connection

Use the provided test script to verify your setup:

```bash
node test-connection.js
```

## Integration with AI Assistants

### Claude Desktop

1. **Install Claude Desktop** from [Anthropic's website](https://claude.ai/download)

2. **Configure MCP Server**:
   - Open Claude Desktop
   - Go to Settings → Model Context Protocol
   - Add a new server configuration:
     ```
     Name: EKS MCP Server
     Command: node
     Arguments: /path/to/eks-mcp-server/build/index.js
     ```

3. **Usage**:
   - Start a conversation with Claude
   - Use natural language to interact with your EKS cluster:
     ```
     "Connect to my EKS cluster named 'production-cluster' in us-west-2"
     "List all pods in the default namespace"
     "Get logs from the web-app pod"
     ```

### Cursor

1. **Install Cursor** from [cursor.sh](https://cursor.sh)

2. **Configure MCP Server**:
   - Open Cursor
   - Go to Settings → Extensions → Model Context Protocol
   - Add server configuration:
     ```
     Name: EKS MCP Server
     Command: node
     Arguments: /path/to/eks-mcp-server/build/index.js
     ```

3. **Usage**:
   - Use the command palette (Cmd/Ctrl + Shift + P)
   - Type "MCP" to see available MCP commands
   - Or use natural language in the chat interface

### Example Interactions

#### Getting Help
```
User: "What tools are available?"
Assistant: [Lists all available tools organized by category]

User: "How do I connect to an EKS cluster?"
Assistant: [Shows detailed help for connect_to_eks tool with parameters and examples]

User: "Show me all cluster information tools"
Assistant: [Lists cluster information tools with descriptions]
```

#### Connecting to a Cluster
```
User: "Connect to my EKS cluster named 'production' in us-east-1"
Assistant: [Connects and confirms connection]
```

#### Getting Cluster Information
```
User: "What's the status of my cluster?"
Assistant: [Returns node count, namespace count, and node details]
```

#### Monitoring Resources
```
User: "Show me all pods that are not running"
Assistant: [Lists pods with status other than Running]
```

#### Debugging Issues
```
User: "Get the logs from the web-app pod in the frontend namespace"
Assistant: [Retrieves and displays pod logs]
```

## Development

### Project Scripts

- `npm run build`: Build the TypeScript project
- `npm run clean`: Clean build artifacts
- `npm run test`: Run tests (when implemented)

### Structured Response System

The MCP server implements a comprehensive structured response system that ensures consistent, well-formatted output across all tools:

#### Response Structure
```json
{
  "success": boolean,
  "data": "tool-specific data",
  "metadata": {
    "timestamp": "ISO timestamp",
    "tool": "tool name",
    "executionTime": "execution time in ms",
    "clusterInfo": {
      "connected": boolean,
      "clusterName": "cluster name",
      "region": "AWS region"
    }
  },
  "summary": {
    "title": "response title",
    "description": "response description",
    "keyMetrics": {
      "metric1": "value1",
      "metric2": "value2"
    },
    "recommendations": [
      "actionable recommendation 1",
      "actionable recommendation 2"
    ]
  },
  "error": "detailed error information (if applicable)"
}
```

#### System Prompts
Each tool includes a system prompt that guides the response format:
- **Connection Tools**: Focus on connection status and next steps
- **Cluster Information**: Emphasize metrics and health indicators
- **Resource Management**: Highlight status and actionable recommendations
- **System Tools**: Provide clear navigation and usage guidance

#### Key Features
- **Automatic Summary Generation**: Each response includes a contextual summary
- **Key Metrics Calculation**: Important metrics are automatically computed
- **Actionable Recommendations**: Context-aware suggestions for next steps
- **Consistent Error Handling**: Standardized error responses with details
- **Execution Time Tracking**: Performance monitoring for all operations
- **Metadata Enrichment**: Additional context for debugging and monitoring

### Using and Modifying the System Prompt/Instruction Layer

The system prompt and instruction layer can be customized to meet specific requirements. Here's how to use and modify it:

#### **1. Viewing Current System Prompts**

```javascript
import { ResponseFormatter } from './build/util/response-formatter.util.js';

// Get system prompt for a specific tool
const prompt = ResponseFormatter.getSystemPrompt('connect_to_eks');
console.log(prompt);
```

#### **2. Modifying System Prompts**

Edit `src/util/response-formatter.util.ts` and modify the `getSystemPrompt()` method:

```typescript
static getSystemPrompt(toolName: string): string {
    const prompts: { [key: string]: string } = {
        'connect_to_eks': `You are connecting to an EKS cluster. Return a structured response with:
- Connection status and cluster details
- Any authentication issues or warnings
- Next steps for cluster interaction
- Clear success/failure indication
- Security compliance status
- Performance baseline metrics`,

        // Add your custom prompts here
        'custom_tool': `You are executing a custom tool. Return a structured response with:
- Custom requirements
- Specific metrics
- Specialized recommendations`
    };

    return prompts[toolName] || `Default prompt for ${toolName}`;
}
```

#### **3. Customizing Response Instructions**

Modify the `SystemInstructions` interface in `src/types/mcp.ts`:

```typescript
export interface SystemInstructions {
    responseFormat: 'structured' | 'simple' | 'custom';
    includeMetadata: boolean;
    includeSummary: boolean;
    summaryFormat: 'detailed' | 'concise' | 'minimal';
    errorHandling: 'detailed' | 'simple' | 'verbose';
    // Add custom fields
    customFields?: string[];
    context?: 'production' | 'development' | 'audit';
    priority?: 'high' | 'medium' | 'low';
}
```

#### **4. Creating Context-Specific Prompts**

Extend the ResponseFormatter for different contexts:

```typescript
class CustomResponseFormatter extends ResponseFormatter {
    static getContextSpecificPrompt(toolName: string, context: string): string {
        const basePrompt = this.getSystemPrompt(toolName);
        
        switch (context) {
            case 'production':
                return `${basePrompt}
PRODUCTION REQUIREMENTS:
- Include SLA compliance metrics
- Highlight security vulnerabilities
- Provide immediate action items
- Include disaster recovery status`;
                
            case 'development':
                return `${basePrompt}
DEVELOPMENT REQUIREMENTS:
- Include debugging information
- Highlight dev-specific configurations
- Provide testing recommendations`;
                
            default:
                return basePrompt;
        }
    }
}
```

#### **5. Tool-Specific Customization**

Add custom system prompts to individual tools in `src/services/kubernetes-tools.service.ts`:

```typescript
{
    name: 'custom_tool',
    description: 'Custom tool with specialized prompt',
    systemPrompt: `You are performing a specialized operation. Return a structured response with:
- Specialized metrics and analysis
- Custom recommendations
- Context-specific insights`,
    schema: { /* tool schema */ },
    execute: async (args, coreApi, appsApi) => {
        // Tool implementation
        return ResponseFormatter.formatResponse('custom_tool', data, undefined, {
            includeMetadata: true,
            includeSummary: true,
            summaryFormat: 'detailed',
            errorHandling: 'detailed'
        });
    }
}
```

#### **6. Response Format Customization**

Customize response formatting with specific instructions:

```typescript
// Detailed response for production
const productionInstructions = {
    responseFormat: 'structured',
    includeMetadata: true,
    includeSummary: true,
    summaryFormat: 'detailed',
    errorHandling: 'detailed'
};

// Concise response for development
const devInstructions = {
    responseFormat: 'structured',
    includeMetadata: false,
    includeSummary: true,
    summaryFormat: 'concise',
    errorHandling: 'simple'
};

// Use in tool execution
return ResponseFormatter.formatResponse(
    toolName, 
    data, 
    error, 
    productionInstructions
);
```

#### **7. Adding New Response Fields**

Extend the `StructuredResponse` interface in `src/types/mcp.ts`:

```typescript
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
        // Add custom fields
        customField?: string;
        context?: string;
        priority?: string;
    };
    summary?: {
        title: string;
        description: string;
        keyMetrics?: Record<string, any>;
        recommendations?: string[];
        // Add custom summary fields
        customMetrics?: Record<string, any>;
        alerts?: string[];
    };
}
```

#### **8. Implementation Steps**

1. **Identify Requirements**: Determine what customizations you need
2. **Modify Types**: Update interfaces in `src/types/mcp.ts`
3. **Update Prompts**: Modify `getSystemPrompt()` in `src/util/response-formatter.util.ts`
4. **Extend Formatter**: Create custom formatters if needed
5. **Update Tools**: Modify tool implementations in `src/services/kubernetes-tools.service.ts`
6. **Test**: Verify customizations work as expected
7. **Document**: Update documentation for your customizations

### Adding New Tools

To add new tools (e.g., New Relic integration):

1. **Create a new service** in `src/services/` (e.g., `newrelic-tools.service.ts`)
2. **Follow the same pattern** as `KubernetesToolsService`
3. **Register the tools** in the main server's tool list
4. **Update the README** with new tool documentation
5. **Add help information** by implementing help methods in your service

### Help System

The MCP server includes a comprehensive help system accessible through the `help` tool:

#### Available Help Commands
- `help`: Show all available tools organized by category
- `help with tool="tool_name"`: Get detailed help for a specific tool
- `help with category="category_name"`: Get help for a specific category

#### Help Categories
- **connection**: Tools for establishing EKS cluster connections
- **cluster**: Tools for cluster-wide information and monitoring
- **resource**: Tools for managing Kubernetes resources
- **system**: Utility tools like help

#### Help Information Includes
- Tool descriptions and purposes
- Required and optional parameters with types
- Usage examples
- Connection requirements
- Parameter descriptions and defaults
- System prompts for structured responses

### Architecture Extensibility

The current architecture is designed for easy extension:

- **New Tool Categories**: Create new service classes following the established pattern
- **Additional Authentication**: Extend the authentication system for other cloud providers
- **Enhanced Monitoring**: Add tools for metrics, alerts, and observability
- **Structured Responses**: Extend the ResponseFormatter for new response types and formats

## Troubleshooting

### Common Issues

1. **Authentication Errors**:
   - Verify AWS credentials are properly configured
   - Check IAM permissions for EKS access
   - Ensure the cluster exists in the specified region

2. **Connection Failures**:
   - Verify cluster name and region
   - Check network connectivity to EKS endpoint
   - Ensure kubeconfig is properly generated

3. **Permission Errors**:
   - Verify RBAC permissions in the cluster
   - Check if the AWS user/role has necessary permissions

### Debug Mode

Enable debug logging by setting environment variables:
```bash
export DEBUG=eks-mcp-server:*
node build/index.js
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

For issues and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the architecture documentation
