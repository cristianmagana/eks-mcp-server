# API Reference

## Tool Documentation

### Connection Tools

#### `connect_to_eks`

Establishes a connection to an EKS cluster.

**Parameters:**
- `clusterName` (string, required): Name of the EKS cluster
- `region` (string, required): AWS region where the cluster is located

**Example:**
```json
{
  "clusterName": "production-cluster",
  "region": "us-west-2"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "clusterName": "production-cluster",
    "region": "us-west-2",
    "status": "connected"
  },
  "metadata": {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "tool": "connect_to_eks",
    "executionTime": 1500,
    "clusterInfo": {
      "connected": true,
      "clusterName": "production-cluster",
      "region": "us-west-2"
    }
  },
  "summary": {
    "title": "Successfully connected to EKS cluster",
    "description": "Connection established to production-cluster in us-west-2",
    "keyMetrics": {
      "connectionTime": "1.5s",
      "clusterStatus": "active"
    },
    "recommendations": [
      "Use get_cluster_info to view cluster details",
      "Use list_namespaces to explore available namespaces"
    ]
  }
}
```

### Cluster Information Tools

#### `get_cluster_info`

Retrieves general information about the connected EKS cluster.

**Parameters:**
- None (uses current connection)

**Response:**
```json
{
  "success": true,
  "data": {
    "nodes": [
      {
        "name": "ip-10-0-1-100.ec2.internal",
        "status": "Ready",
        "capacity": {
          "cpu": "4",
          "memory": "8Gi"
        }
      }
    ],
    "namespaces": ["default", "kube-system", "production"],
    "nodeCount": 3,
    "namespaceCount": 3
  },
  "summary": {
    "title": "Cluster Information Retrieved",
    "description": "Cluster has 3 nodes and 3 namespaces",
    "keyMetrics": {
      "totalNodes": 3,
      "readyNodes": 3,
      "totalNamespaces": 3
    }
  }
}
```

#### `get_resource_usage`

Gets resource usage information across the cluster.

**Parameters:**
- None (uses current connection)

**Response:**
```json
{
  "success": true,
  "data": {
    "cpu": {
      "requested": "2.5",
      "limits": "4.0",
      "available": "12.0"
    },
    "memory": {
      "requested": "4Gi",
      "limits": "8Gi",
      "available": "24Gi"
    },
    "pods": {
      "running": 15,
      "pending": 2,
      "failed": 0
    }
  },
  "summary": {
    "title": "Resource Usage Summary",
    "description": "Cluster resources are well utilized",
    "keyMetrics": {
      "cpuUtilization": "20.8%",
      "memoryUtilization": "16.7%",
      "podSuccessRate": "88.2%"
    },
    "recommendations": [
      "Monitor pending pods for resource constraints",
      "Consider scaling if utilization exceeds 80%"
    ]
  }
}
```

#### `list_namespaces`

Lists all namespaces in the connected cluster.

**Parameters:**
- None (uses current connection)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "name": "default",
      "status": "Active",
      "age": "30d"
    },
    {
      "name": "kube-system",
      "status": "Active",
      "age": "30d"
    },
    {
      "name": "production",
      "status": "Active",
      "age": "15d"
    }
  ],
  "summary": {
    "title": "Namespaces Listed",
    "description": "Found 3 namespaces in the cluster",
    "keyMetrics": {
      "totalNamespaces": 3,
      "activeNamespaces": 3
    }
  }
}
```

### Resource Management Tools

#### `list_pods`

Lists pods in a specific namespace.

**Parameters:**
- `namespace` (string, required): Namespace to list pods from

**Example:**
```json
{
  "namespace": "production"
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "name": "web-app-7d8f9g",
      "status": "Running",
      "ready": "1/1",
      "restarts": 0,
      "age": "2h"
    },
    {
      "name": "api-server-5e6f7g",
      "status": "Running",
      "ready": "1/1",
      "restarts": 1,
      "age": "1d"
    }
  ],
  "summary": {
    "title": "Pods Listed",
    "description": "Found 2 pods in production namespace",
    "keyMetrics": {
      "totalPods": 2,
      "runningPods": 2,
      "readyPods": 2
    }
  }
}
```

#### `describe_pod`

Gets detailed information about a specific pod.

**Parameters:**
- `podName` (string, required): Name of the pod
- `namespace` (string, required): Namespace containing the pod

**Example:**
```json
{
  "podName": "web-app-7d8f9g",
  "namespace": "production"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "name": "web-app-7d8f9g",
    "namespace": "production",
    "status": "Running",
    "node": "ip-10-0-1-100.ec2.internal",
    "containers": [
      {
        "name": "web-app",
        "image": "nginx:1.21",
        "ready": true,
        "restarts": 0,
        "ports": ["80:80"]
      }
    ],
    "labels": {
      "app": "web-app",
      "version": "v1.0.0"
    }
  },
  "summary": {
    "title": "Pod Details Retrieved",
    "description": "Pod web-app-7d8f9g is running successfully",
    "keyMetrics": {
      "containerCount": 1,
      "readyContainers": 1,
      "restartCount": 0
    }
  }
}
```

#### `list_services`

Lists services in a namespace.

**Parameters:**
- `namespace` (string, required): Namespace to list services from

**Example:**
```json
{
  "namespace": "production"
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "name": "web-app-service",
      "type": "ClusterIP",
      "clusterIP": "10.100.1.100",
      "ports": ["80:80"],
      "age": "2h"
    }
  ],
  "summary": {
    "title": "Services Listed",
    "description": "Found 1 service in production namespace",
    "keyMetrics": {
      "totalServices": 1,
      "clusterIPServices": 1
    }
  }
}
```

#### `list_deployments`

Lists deployments in a namespace.

**Parameters:**
- `namespace` (string, required): Namespace to list deployments from

**Example:**
```json
{
  "namespace": "production"
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "name": "web-app",
      "ready": "3/3",
      "upToDate": "3",
      "available": "3",
      "age": "2h"
    }
  ],
  "summary": {
    "title": "Deployments Listed",
    "description": "Found 1 deployment in production namespace",
    "keyMetrics": {
      "totalDeployments": 1,
      "readyDeployments": 1,
      "totalReplicas": 3
    }
  }
}
```

#### `get_pod_logs`

Retrieves logs from a specific pod.

**Parameters:**
- `podName` (string, required): Name of the pod
- `namespace` (string, required): Namespace containing the pod
- `container` (string, optional): Container name (if multiple containers)
- `tail` (number, optional): Number of lines to retrieve (default: 100)

**Example:**
```json
{
  "podName": "web-app-7d8f9g",
  "namespace": "production",
  "tail": 50
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "logs": [
      "2024-01-01T00:00:00.000Z INFO: Server started on port 80",
      "2024-01-01T00:00:01.000Z INFO: Request received from 10.0.1.100",
      "2024-01-01T00:00:02.000Z INFO: Response sent successfully"
    ],
    "podName": "web-app-7d8f9g",
    "container": "web-app"
  },
  "summary": {
    "title": "Pod Logs Retrieved",
    "description": "Retrieved 50 log lines from web-app-7d8f9g",
    "keyMetrics": {
      "logLines": 50,
      "errorCount": 0,
      "warningCount": 0
    }
  }
}
```

### System Tools

#### `help`

Provides help information about available tools and their usage.

**Parameters:**
- `tool` (string, optional): Specific tool name for detailed help
- `category` (string, optional): Tool category for category-specific help

**Examples:**
```json
{
  "tool": "connect_to_eks"
}
```

```json
{
  "category": "cluster"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tools": [
      {
        "name": "connect_to_eks",
        "description": "Establish connection to an EKS cluster",
        "parameters": {
          "clusterName": "string (required)",
          "region": "string (required)"
        },
        "examples": [
          "connect_to_eks with clusterName=\"production\" and region=\"us-west-2\""
        ]
      }
    ],
    "categories": {
      "connection": ["connect_to_eks"],
      "cluster": ["get_cluster_info", "get_resource_usage", "list_namespaces"],
      "resource": ["list_pods", "describe_pod", "list_services", "list_deployments", "get_pod_logs"],
      "system": ["help"]
    }
  },
  "summary": {
    "title": "Help Information",
    "description": "Available tools and usage information",
    "keyMetrics": {
      "totalTools": 9,
      "categories": 4
    }
  }
}
```

## Error Responses

All tools return standardized error responses:

```json
{
  "success": false,
  "error": "Detailed error message",
  "metadata": {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "tool": "tool_name",
    "executionTime": 500
  },
  "summary": {
    "title": "Operation Failed",
    "description": "Brief description of what went wrong",
    "recommendations": [
      "Check AWS credentials",
      "Verify cluster name and region",
      "Ensure proper permissions"
    ]
  }
}
```

## Common Error Codes

- **AUTHENTICATION_ERROR**: AWS credentials or permissions issue
- **CONNECTION_ERROR**: Unable to connect to EKS cluster
- **RESOURCE_NOT_FOUND**: Requested resource doesn't exist
- **PERMISSION_DENIED**: Insufficient permissions for operation
- **VALIDATION_ERROR**: Invalid parameters provided 