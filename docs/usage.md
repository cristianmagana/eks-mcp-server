# Usage Guide

## Running the MCP Server

1. Build the project:
```bash
npm run build
```

2. Run the server:
```bash
node build/index.js
```

The server will start and listen for MCP protocol messages via stdio.

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

## Example Interactions

### Getting Help
```
User: "What tools are available?"
Assistant: [Lists all available tools organized by category]

User: "How do I connect to an EKS cluster?"
Assistant: [Shows detailed help for connect_to_eks tool with parameters and examples]

User: "Show me all cluster information tools"
Assistant: [Lists cluster information tools with descriptions]
```

### Connecting to a Cluster
```
User: "Connect to my EKS cluster named 'production' in us-east-1"
Assistant: [Connects and confirms connection]
```

### Getting Cluster Information
```
User: "What's the status of my cluster?"
Assistant: [Returns node count, namespace count, and node details]
```

### Monitoring Resources
```
User: "Show me all pods that are not running"
Assistant: [Lists pods with status other than Running]
```

### Debugging Issues
```
User: "Get the logs from the web-app pod in the frontend namespace"
Assistant: [Retrieves and displays pod logs]
```

## Help System

The MCP server includes a comprehensive help system accessible through the `help` tool:

### Available Help Commands
- `help`: Show all available tools organized by category
- `help with tool="tool_name"`: Get detailed help for a specific tool
- `help with category="category_name"`: Get help for a specific category

### Help Categories
- **connection**: Tools for establishing EKS cluster connections
- **cluster**: Tools for cluster-wide information and monitoring
- **resource**: Tools for managing Kubernetes resources
- **system**: Utility tools like help

### Help Information Includes
- Tool descriptions and purposes
- Required and optional parameters with types
- Usage examples
- Connection requirements
- Parameter descriptions and defaults
- System prompts for structured responses

## Best Practices

1. **Always Connect First**: Use `connect_to_eks` before running other tools
2. **Use Namespaces**: Specify namespaces when working with resources
3. **Check Permissions**: Ensure you have the necessary RBAC permissions
4. **Monitor Resources**: Use resource usage tools to monitor cluster health
5. **Use Help**: Leverage the help system to understand tool capabilities 