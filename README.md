# EKS MCP Server

A Model Context Protocol (MCP) server that provides seamless access to Amazon Elastic Kubernetes Service (EKS) clusters through AI assistants like Claude and Cursor.

## Overview

This MCP server enables AI assistants to interact with EKS clusters by providing a set of tools for cluster management, resource monitoring, and debugging. It handles AWS authentication, EKS cluster connections, and Kubernetes API operations in a secure and organized manner.

## Quick Start

### Prerequisites

- Node.js 18+ 
- AWS CLI configured with appropriate credentials
- Access to an EKS cluster
- Helm CLI installed and available in system PATH

### Installation

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

### Usage

Run the MCP server:
```bash
node build/index.js
```

## Documentation

- **[Architecture & Design](docs/architecture.md)** - Project structure and design patterns
- **[Tool Reference](docs/tools.md)** - Complete list of available tools and their usage
- **[Installation Guide](docs/installation.md)** - Detailed setup instructions
- **[Integration Guide](docs/integration.md)** - How to integrate with AI assistants
- **[Development Guide](docs/development.md)** - Development setup and contributing guidelines
- **[Troubleshooting](docs/troubleshooting.md)** - Common issues and solutions

## Available Tools

The MCP server provides 13 tools organized into four categories:

- **Connection Tools**: Establish EKS cluster connections
- **Cluster Information Tools**: Get cluster-wide information and monitoring
- **Resource Management Tools**: Manage Kubernetes resources
- **Helm Management Tools**: Manage Helm releases and charts
- **System Tools**: Help and utility functions

See the [Tool Reference](docs/tools.md) for complete details.

## Features

- 🔐 **Secure Authentication**: AWS/EKS authentication with IAM role support
- 🛠️ **Comprehensive Tools**: 13 tools for cluster and resource management
- 📊 **Structured Responses**: Rich, formatted responses with metadata and summaries
- 🎯 **Helm Integration**: Full Helm release management capabilities
- 🔧 **Extensible Architecture**: Easy to add new tools and functionality
- 📚 **Help System**: Built-in help and documentation

## Contributing

See [Development Guide](docs/development.md) for contribution guidelines.

## Support

For issues and questions:
- Create an issue in the repository
- Check the [Troubleshooting](docs/troubleshooting.md) guide
- Review the [Architecture](docs/architecture.md) documentation
