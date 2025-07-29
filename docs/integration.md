# Integration Guide

This guide explains how to integrate the EKS MCP Server with AI assistants like Claude Desktop and Cursor.

## Overview

The EKS MCP Server uses the Model Context Protocol (MCP) to provide AI assistants with tools for managing EKS clusters. This enables natural language interactions with your Kubernetes infrastructure.

## Supported AI Assistants

### Claude Desktop

Claude Desktop is Anthropic's desktop application that supports MCP servers.

#### Installation

1. **Download Claude Desktop** from [Anthropic's website](https://claude.ai/download)
2. **Install and launch** the application
3. **Sign in** with your Anthropic account

#### Configuration

1. **Open Settings**:
   - Click on the settings icon (gear) in the top-right corner
   - Select "Settings" from the menu

2. **Navigate to MCP**:
   - Click on "Model Context Protocol" in the left sidebar

3. **Add Server Configuration**:
   - Click "Add Server"
   - Fill in the configuration:
     ```
     Name: EKS MCP Server
     Command: node
     Arguments: /path/to/eks-mcp-server/build/index.js
     ```
   - Replace `/path/to/eks-mcp-server` with the actual path to your installation
   - Click "Save"

4. **Enable the Server**:
   - Toggle the server to "On"
   - The server should show as "Connected" if configured correctly

#### Usage

1. **Start a Conversation**:
   - Create a new conversation or use an existing one

2. **Connect to EKS**:
   ```
   "Connect to my EKS cluster named 'production-cluster' in us-west-2"
   ```

3. **Explore Your Cluster**:
   ```
   "What's the status of my cluster?"
   "List all pods in the default namespace"
   "Show me all Helm releases"
   ```

4. **Get Help**:
   ```
   "What tools are available?"
   "How do I check pod logs?"
   ```

### Cursor

Cursor is a code editor with AI capabilities that supports MCP servers.

#### Installation

1. **Download Cursor** from [cursor.sh](https://cursor.sh)
2. **Install and launch** the application
3. **Sign in** with your account

#### Configuration

1. **Open Settings**:
   - Press `Cmd/Ctrl + ,` to open settings
   - Or go to File → Preferences → Settings

2. **Navigate to MCP**:
   - Search for "MCP" in the settings search bar
   - Click on "Extensions" → "Model Context Protocol"

3. **Add Server Configuration**:
   - Click "Add Server"
   - Fill in the configuration:
     ```
     Name: EKS MCP Server
     Command: node
     Arguments: /path/to/eks-mcp-server/build/index.js
     ```
   - Replace `/path/to/eks-mcp-server` with the actual path to your installation
   - Click "Save"

4. **Enable the Server**:
   - Toggle the server to "On"
   - The server should show as "Connected" if configured correctly

#### Usage

1. **Open Command Palette**:
   - Press `Cmd/Ctrl + Shift + P`

2. **Use MCP Commands**:
   - Type "MCP" to see available MCP commands
   - Select the appropriate command

3. **Use Chat Interface**:
   - Open the chat panel (usually on the right side)
   - Ask questions about your EKS cluster:
     ```
     "Connect to my production EKS cluster"
     "What's the status of my deployments?"
     ```

## Example Interactions

### Getting Started

#### Initial Connection
```
User: "Connect to my EKS cluster named 'production' in us-east-1"
Assistant: [Connects and confirms connection with cluster details]
```

#### Exploring the Cluster
```
User: "What's the status of my cluster?"
Assistant: [Returns node count, namespace count, and node details]

User: "List all namespaces"
Assistant: [Lists all namespaces with status information]
```

### Resource Management

#### Pod Management
```
User: "Show me all pods that are not running"
Assistant: [Lists pods with status other than Running]

User: "Get the logs from the web-app pod in the frontend namespace"
Assistant: [Retrieves and displays pod logs]

User: "Describe the api-server pod"
Assistant: [Shows detailed pod information]
```

#### Service and Deployment Management
```
User: "List all services in the production namespace"
Assistant: [Lists services with configurations]

User: "Show me deployment status in the backend namespace"
Assistant: [Shows deployment information with replica counts]
```

### Helm Release Management

#### Listing Releases
```
User: "List all Helm releases in the production namespace"
Assistant: [Lists all Helm releases with status and version information]

User: "Show me failed Helm releases"
Assistant: [Filters and shows only failed releases]
```

#### Release Details
```
User: "Get the status of the web-app Helm release"
Assistant: [Returns detailed status including resource health and hook execution]

User: "Show me the deployment history for the database release"
Assistant: [Displays revision history with deployment timeline and status]

User: "Get detailed information about the api-server release"
Assistant: [Shows comprehensive release information including values and manifests]
```

### Troubleshooting

#### Debugging Issues
```
User: "Why is my pod not starting?"
Assistant: [Analyzes pod status and provides troubleshooting steps]

User: "Check the logs for errors in the web-app deployment"
Assistant: [Retrieves logs and identifies potential issues]

User: "What's wrong with my Helm release?"
Assistant: [Checks release status and identifies problems]
```

## Best Practices

### 1. Start with Connection
Always connect to your EKS cluster first before using other tools:
```
"Connect to my EKS cluster named 'cluster-name' in 'region'"
```

### 2. Use Specific Namespaces
When working with resources, specify namespaces for better results:
```
"List pods in the production namespace"
"Get logs from the web-app pod in the frontend namespace"
```

### 3. Leverage the Help System
Use the help tool to understand available options:
```
"What tools are available?"
"Help me with the connect_to_eks tool"
"Show me all cluster information tools"
```

### 4. Monitor and Debug
Use monitoring tools to keep track of your cluster:
```
"What's the resource usage in my cluster?"
"Show me all failed pods"
"Check the status of my Helm releases"
```

### 5. Follow Recommendations
Pay attention to the recommendations provided by tools:
```
"Follow the recommendations from the last command"
"What should I do next?"
```

## Troubleshooting Integration

### Common Issues

#### Server Not Connecting
- **Check Path**: Ensure the path to `build/index.js` is correct
- **Verify Build**: Make sure you've run `npm run build`
- **Check Permissions**: Ensure the file is executable
- **Test Manually**: Try running `node build/index.js` directly

#### Tools Not Available
- **Restart AI Assistant**: Close and reopen the application
- **Check Server Status**: Verify the MCP server shows as "Connected"
- **Review Logs**: Check for error messages in the AI assistant logs

#### Authentication Issues
- **Verify AWS Credentials**: Ensure AWS CLI is configured correctly
- **Check Permissions**: Verify IAM permissions for EKS access
- **Test Connection**: Use the test scripts to verify connectivity

### Debug Mode

Enable debug logging for troubleshooting:

```bash
export DEBUG=eks-mcp-server:*
node build/index.js
```

### Testing Integration

1. **Test Basic Connection**:
   ```
   "Connect to my EKS cluster"
   ```

2. **Test Tool Availability**:
   ```
   "What tools are available?"
   ```

3. **Test Resource Access**:
   ```
   "List all namespaces"
   ```

4. **Test Helm Tools**:
   ```
   "List all Helm releases"
   ```

## Security Considerations

### Access Control
- **IAM Permissions**: Use least-privilege access for AWS credentials
- **RBAC**: Ensure appropriate Kubernetes RBAC permissions
- **Network Security**: Secure network access to EKS clusters

### Credential Management
- **No Storage**: The MCP server doesn't store credentials
- **Temporary Access**: Credentials are only used for authentication
- **Audit Logging**: Monitor and log all cluster access

### Best Practices
- **Regular Rotation**: Rotate AWS credentials regularly
- **Monitoring**: Monitor cluster access and usage
- **Compliance**: Follow your organization's security policies

## Support

If you encounter issues with integration:

1. **Check Configuration**: Verify MCP server configuration
2. **Test Manually**: Use test scripts to verify functionality
3. **Review Logs**: Check both MCP server and AI assistant logs
4. **Documentation**: Review this guide and other documentation
5. **Community**: Create an issue in the repository for support 