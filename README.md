# EKS MCP Server

A Model Context Protocol (MCP) server that provides seamless access to Amazon Elastic Kubernetes Service (EKS) clusters through AI assistants like Claude and Cursor.

## Overview

This MCP server enables AI assistants to interact with EKS clusters by providing a set of tools for cluster management, resource monitoring, and debugging. It handles AWS authentication, EKS cluster connections, and Kubernetes API operations in a secure and organized manner.

## Quick Start

### Prerequisites

- Node.js 18+ 
- AWS CLI configured with appropriate credentials
- Access to an EKS cluster

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

4. Run the server:
```bash
node build/index.js
```

## Documentation

- **[Architecture & Design](docs/architecture.md)** - Project structure, architecture design, and tool categories
- **[Installation & Configuration](docs/installation.md)** - Detailed setup instructions and configuration
- **[Usage Guide](docs/usage.md)** - How to use the MCP server and integrate with AI assistants
- **[Development Guide](docs/development.md)** - Development setup, adding new tools, and customization
- **[API Reference](docs/api-reference.md)** - Tool documentation and API details
- **[Troubleshooting](docs/troubleshooting.md)** - Common issues and solutions

## Features

- **9 Kubernetes Tools** organized into connection, cluster information, and resource management categories
- **Structured Response System** with automatic summary generation and actionable recommendations
- **AWS/EKS Authentication** with secure cluster connections
- **AI Assistant Integration** for Claude Desktop and Cursor
- **Comprehensive Help System** with detailed tool documentation

## Project Scripts

- `npm run build` - Build the TypeScript project
- `npm run clean` - Clean build artifacts

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

For issues and questions:
- Create an issue in the repository
- Check the [troubleshooting guide](docs/troubleshooting.md)
- Review the [architecture documentation](docs/architecture.md)
