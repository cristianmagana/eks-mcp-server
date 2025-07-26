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
4. **Utility Modules**: AWS and Kubernetes configuration utilities

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

### Adding New Tools

To add new tools (e.g., New Relic integration):

1. **Create a new service** in `src/services/` (e.g., `newrelic-tools.service.ts`)
2. **Follow the same pattern** as `KubernetesToolsService`
3. **Register the tools** in the main server's tool list
4. **Update the README** with new tool documentation

### Architecture Extensibility

The current architecture is designed for easy extension:

- **New Tool Categories**: Create new service classes following the established pattern
- **Additional Authentication**: Extend the authentication system for other cloud providers
- **Enhanced Monitoring**: Add tools for metrics, alerts, and observability

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
