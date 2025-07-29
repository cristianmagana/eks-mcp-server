# Architecture & Design

## Project Structure

```
eks-mcp-server/
├── src/
│   ├── index.ts                 # Main MCP server entry point
│   ├── services/
│   │   ├── eks-auth.service.ts      # AWS/EKS authentication service
│   │   ├── kubernetes-tools.service.ts  # Kubernetes tools and operations
│   │   └── helm-tools.service.ts    # Helm release management tools
│   ├── interfaces/
│   │   └── eks-auth.interface.ts    # EKS authentication interface
│   ├── types/
│   │   ├── eks.ts                   # EKS-specific type definitions
│   │   ├── mcp.ts                   # MCP protocol type definitions
│   │   └── node-helm.d.ts           # Node-helm type declarations
│   └── util/
│       ├── aws.util.ts              # AWS utility functions
│       ├── kubeconfig.util.ts       # Kubernetes config utilities
│       └── response-formatter.util.ts # Structured response formatting
├── test/
│   ├── test-connection.js           # Connection testing utilities
│   ├── test-helm-tools.js           # Helm tools testing
│   └── test-integration.js          # Integration testing
├── docs/                           # Documentation
├── package.json
├── tsconfig.json
└── README.md
```

## Architecture Design

The application follows a clean, modular architecture with clear separation of concerns:

### Core Components

1. **Main Server (`index.ts`)**: Handles MCP protocol routing and tool delegation
2. **KubernetesToolsService**: Centralized management of all Kubernetes operations and authentication state
3. **HelmToolsService**: Management of Helm release operations and chart management
4. **EKSAuthenticatorService**: Handles AWS/EKS authentication and cluster connections
5. **ResponseFormatter**: Provides structured response formatting with system prompts and metadata
6. **Utility Modules**: AWS and Kubernetes configuration utilities

### Design Principles

- **Separation of Concerns**: Each service has a specific responsibility
- **Modularity**: Easy to add new tools and functionality
- **Type Safety**: Full TypeScript support with proper type definitions
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Extensibility**: Designed for easy extension and customization

## Tool Categories

The MCP server provides 13 tools organized into four categories:

### Connection Tools
- `connect_to_eks`: Establish connection to an EKS cluster

### Cluster Information Tools
- `get_cluster_info`: Get general cluster information (nodes, namespaces)
- `get_resource_usage`: Get resource usage across the cluster
- `list_namespaces`: List all namespaces in the connected cluster

### Resource Management Tools
- `list_pods`: List pods in a specific namespace
- `describe_pod`: Get detailed information about a specific pod
- `list_services`: List services in a namespace
- `list_deployments`: List deployments in a namespace
- `get_pod_logs`: Get logs from a specific pod

### Helm Management Tools
- `list_helm_releases`: List all Helm releases across all namespaces
- `get_helm_release`: Get detailed information about a specific Helm release
- `get_helm_release_status`: Get the status of a specific Helm release
- `get_helm_release_history`: Get the revision history of a specific Helm release

### System Tools
- `help`: Get help information about available tools and their usage

## Data Flow

1. **MCP Request**: AI assistant sends tool request via MCP protocol
2. **Request Routing**: Main server routes request to appropriate service
3. **Authentication**: EKSAuthenticatorService handles AWS/EKS authentication
4. **Tool Execution**: Specific tool service executes the requested operation
5. **Response Formatting**: ResponseFormatter creates structured response
6. **MCP Response**: Formatted response sent back to AI assistant

## Authentication Flow

1. **AWS Credentials**: Uses AWS SDK with configured credentials
2. **EKS Cluster Info**: Retrieves cluster information from AWS EKS API
3. **Kubeconfig Generation**: Creates Kubernetes configuration with AWS authentication
4. **Connection Test**: Validates connection to the cluster
5. **API Client Creation**: Initializes Kubernetes API clients for operations

## Response System

### Structured Response Format
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

### System Prompts
Each tool includes a system prompt that guides the response format:
- **Connection Tools**: Focus on connection status and next steps
- **Cluster Information**: Emphasize metrics and health indicators
- **Resource Management**: Highlight status and actionable recommendations
- **Helm Management**: Focus on release status and deployment information
- **System Tools**: Provide clear navigation and usage guidance

## Extensibility

The architecture is designed for easy extension:

### Adding New Tools
1. Create a new service class following the established pattern
2. Implement tool methods with proper error handling
3. Register tools in the main server
4. Add system prompts and response summaries
5. Update help system and documentation

### Adding New Authentication Methods
1. Extend the authentication interface
2. Implement new authentication service
3. Update the main server to use new authentication
4. Add configuration options

### Adding New Response Types
1. Extend the ResponseFormatter class
2. Add new response formats and summaries
3. Update type definitions
4. Add configuration options

## Security Considerations

- **AWS IAM**: Uses AWS IAM for authentication and authorization
- **RBAC**: Respects Kubernetes RBAC permissions
- **No Credential Storage**: Credentials are not stored, only used for authentication
- **Secure Communication**: All communication uses HTTPS/TLS
- **Error Handling**: Sensitive information is not exposed in error messages 