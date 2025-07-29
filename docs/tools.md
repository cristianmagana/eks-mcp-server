# Tool Reference

This document provides a complete reference for all available tools in the EKS MCP Server.

## Tool Categories

The MCP server provides 13 tools organized into four categories:

- **Connection Tools**: Establish EKS cluster connections
- **Cluster Information Tools**: Get cluster-wide information and monitoring
- **Resource Management Tools**: Manage Kubernetes resources
- **Helm Management Tools**: Manage Helm releases and charts
- **System Tools**: Help and utility functions

## Connection Tools

### connect_to_eks

Establish connection to an EKS cluster.

**Parameters:**
- `clusterName` (string, required): Name of the EKS cluster
- `region` (string, required): AWS region where the cluster is located
- `roleArn` (string, optional): IAM role ARN to assume

**Examples:**
```bash
connect_to_eks with clusterName="production-cluster" and region="us-west-2"
connect_to_eks with clusterName="dev-cluster", region="us-east-1", and roleArn="arn:aws:iam::123456789012:role/EKSClusterRole"
```

**Response:**
- Connection status and cluster details
- Authentication information
- Next steps for cluster interaction

## Cluster Information Tools

### get_cluster_info

Get general cluster information including nodes and namespaces.

**Parameters:**
- None

**Examples:**
```bash
get_cluster_info
```

**Response:**
- Node count and health status
- Namespace count and overview
- Cluster version and status
- Key metrics and health indicators

### get_resource_usage

Get resource usage across the cluster.

**Parameters:**
- `namespace` (string, optional): Specific namespace to check

**Examples:**
```bash
get_resource_usage
get_resource_usage with namespace="kube-system"
```

**Response:**
- Pod counts by status (running, pending, failed)
- Resource utilization metrics
- Performance indicators
- Recommendations for resource optimization

### list_namespaces

List all namespaces in the connected cluster.

**Parameters:**
- None

**Examples:**
```bash
list_namespaces
```

**Response:**
- Total namespace count
- Namespace status and details
- Active vs inactive namespaces
- Recommendations for namespace management

## Resource Management Tools

### list_pods

List pods in a specific namespace.

**Parameters:**
- `namespace` (string, optional, default: "default"): Namespace to list pods from

**Examples:**
```bash
list_pods
list_pods with namespace="production"
```

**Response:**
- Pod count and status breakdown
- Ready vs not ready pods
- Restart counts and age
- Recommendations for pod health

### describe_pod

Get detailed information about a specific pod.

**Parameters:**
- `podName` (string, required): Name of the pod
- `namespace` (string, optional, default: "default"): Namespace of the pod

**Examples:**
```bash
describe_pod with podName="web-app-123"
describe_pod with podName="api-server" and namespace="backend"
```

**Response:**
- Pod metadata and status
- Container information and images
- Resource specifications
- Health conditions and events

### list_services

List services in a namespace.

**Parameters:**
- `namespace` (string, optional, default: "default"): Namespace to list services from

**Examples:**
```bash
list_services
list_services with namespace="frontend"
```

**Response:**
- Service count and types
- Service configurations and selectors
- Network information
- Recommendations for service management

### list_deployments

List deployments in a namespace.

**Parameters:**
- `namespace` (string, optional, default: "default"): Namespace to list deployments from

**Examples:**
```bash
list_deployments
list_deployments with namespace="production"
```

**Response:**
- Deployment count and status
- Replica information and readiness
- Image versions and updates
- Recommendations for deployment management

### get_pod_logs

Get logs from a specific pod.

**Parameters:**
- `podName` (string, required): Name of the pod
- `namespace` (string, optional, default: "default"): Namespace of the pod
- `container` (string, optional): Container name
- `tailLines` (number, optional, default: 100): Number of lines to tail

**Examples:**
```bash
get_pod_logs with podName="web-app-123"
get_pod_logs with podName="api-server", namespace="backend", container="app", and tailLines=50
```

**Response:**
- Log content and format
- Log analysis and patterns
- Error identification and severity
- Recommendations for log monitoring

## Helm Management Tools

### list_helm_releases

List all Helm releases across all namespaces.

**Parameters:**
- `namespace` (string, optional): Optional namespace to filter releases
- `status` (string, optional): Optional status filter (deployed, failed, pending, etc.)

**Examples:**
```bash
list_helm_releases
list_helm_releases with namespace="production"
list_helm_releases with status="deployed"
```

**Response:**
- Total number of releases found
- Release details including name, namespace, status, and version
- Summary by status and namespace
- Recommendations for release management

### get_helm_release

Get detailed information about a specific Helm release.

**Parameters:**
- `releaseName` (string, required): Name of the Helm release
- `namespace` (string, optional, default: "default"): Namespace of the Helm release

**Examples:**
```bash
get_helm_release with releaseName="my-app"
get_helm_release with releaseName="database" and namespace="backend"
```

**Response:**
- Release metadata and status information
- Resource details and configurations
- Values and manifest information
- Recommendations for release management

### get_helm_release_status

Get the status of a specific Helm release.

**Parameters:**
- `releaseName` (string, required): Name of the Helm release
- `namespace` (string, optional, default: "default"): Namespace of the Helm release

**Examples:**
```bash
get_helm_release_status with releaseName="my-app"
get_helm_release_status with releaseName="database" and namespace="backend"
```

**Response:**
- Release status and version information
- Resource health and status details
- Hook information and execution status
- Recommendations for troubleshooting

### get_helm_release_history

Get the revision history of a specific Helm release.

**Parameters:**
- `releaseName` (string, required): Name of the Helm release
- `namespace` (string, optional, default: "default"): Namespace of the Helm release
- `max` (number, optional, default: 10): Maximum number of revisions to return

**Examples:**
```bash
get_helm_release_history with releaseName="my-app"
get_helm_release_history with releaseName="database", namespace="backend", and max=5
```

**Response:**
- Revision history and deployment timeline
- Status of each revision
- Deployment patterns and frequency
- Recommendations for release management

## System Tools

### help

Get help information about available tools and their usage.

**Parameters:**
- `tool` (string, optional): Specific tool name to get help for
- `category` (string, optional): Tool category to list (connection, cluster, resource, helm)

**Examples:**
```bash
help
help with tool="connect_to_eks"
help with category="cluster"
```

**Response:**
- List all tools, available options, and descriptions
- Tool descriptions and categories
- Parameter details and examples
- Usage instructions and best practices

## Tool Requirements

### Connection Requirements
- Most tools require an active EKS cluster connection via `connect_to_eks`
- AWS credentials must be properly configured
- Appropriate IAM permissions for EKS access

### Helm Tool Requirements
- Helm CLI must be installed and available in system PATH
- Requires authenticated EKS cluster connection
- Kubernetes RBAC permissions to access Helm releases

### Resource Tool Requirements
- Kubernetes API access permissions
- RBAC permissions for the requested resources
- Valid kubeconfig configuration

## Response Format

All tools return structured responses with the following format:

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

## Error Handling

All tools include comprehensive error handling:

- **Authentication Errors**: Clear messages about credential or permission issues
- **Connection Errors**: Information about cluster connectivity problems
- **Resource Errors**: Details about missing or inaccessible resources
- **Validation Errors**: Parameter validation and usage guidance
- **System Errors**: Technical details for debugging

## Best Practices

1. **Always connect first**: Use `connect_to_eks` before using other tools
2. **Check help**: Use the `help` tool to understand tool parameters and usage
3. **Use namespaces**: Specify namespaces when working with resources
4. **Monitor status**: Use status tools to check resource health
5. **Review logs**: Use log tools for debugging and monitoring
6. **Follow recommendations**: Pay attention to tool recommendations for next steps 