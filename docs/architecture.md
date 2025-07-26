# Architecture & Design

## Project Structure

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
│       ├── kubeconfig.util.ts       # Kubernetes config utilities
│       └── response-formatter.util.ts # Structured response formatting
├── test/
│   └── test-connection.js           # Connection testing utilities
├── package.json
├── tsconfig.json
└── README.md
```

## Architecture Design

The application follows a clean, modular architecture with clear separation of concerns:

1. **Main Server (`index.ts`)**: Handles MCP protocol routing and tool delegation
2. **KubernetesToolsService**: Centralized management of all Kubernetes operations and authentication state
3. **EKSAuthenticatorService**: Handles AWS/EKS authentication and cluster connections
4. **ResponseFormatter**: Provides structured response formatting with system prompts and metadata
5. **Utility Modules**: AWS and Kubernetes configuration utilities

## Tool Categories

The MCP server provides 9 tools organized into three categories:

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

### System Tools
- `help`: Get help information about available tools and their usage

## Architecture Extensibility

The current architecture is designed for easy extension:

- **New Tool Categories**: Create new service classes following the established pattern
- **Additional Authentication**: Extend the authentication system for other cloud providers
- **Enhanced Monitoring**: Add tools for metrics, alerts, and observability
- **Structured Responses**: Extend the ResponseFormatter for new response types and formats

## Key Design Principles

1. **Separation of Concerns**: Each service handles a specific domain
2. **Modularity**: Easy to add new tools and services
3. **Type Safety**: Full TypeScript support with comprehensive type definitions
4. **Error Handling**: Consistent error handling across all tools
5. **Structured Responses**: Standardized response format with metadata and summaries 