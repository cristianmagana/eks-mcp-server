# Installation Guide

This guide provides detailed instructions for installing and configuring the EKS MCP Server.

## Prerequisites

Before installing the EKS MCP Server, ensure you have the following prerequisites:

### System Requirements

- **Node.js 18+**: Required for running the TypeScript application
- **npm or yarn**: Package manager for installing dependencies
- **Git**: For cloning the repository

### AWS Requirements

- **AWS CLI**: Must be installed and configured
- **AWS Account**: With access to EKS clusters
- **IAM Permissions**: Appropriate permissions for EKS access

### Kubernetes Requirements

- **EKS Cluster**: Access to an Amazon EKS cluster
- **kubectl**: Kubernetes command-line tool (optional, for testing)

### Helm Requirements

- **Helm CLI**: Must be installed and available in system PATH
- **Helm Access**: Permissions to access Helm releases in the cluster

## Installation Steps

### 1. Clone the Repository

```bash
git clone <repository-url>
cd eks-mcp-server
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required dependencies including:
- `@aws-sdk/client-eks`: AWS EKS client
- `@aws-sdk/client-sts`: AWS STS client
- `@kubernetes/client-node`: Kubernetes client
- `@modelcontextprotocol/sdk`: MCP protocol SDK
- `node-helm`: Helm client library
- `zod`: Schema validation
- TypeScript and development dependencies

### 3. Build the Project

```bash
npm run build
```

This compiles the TypeScript code into JavaScript in the `build/` directory.

### 4. Verify Installation

Run the integration test to verify everything is working:

```bash
node test/test-integration.js
```

You should see output confirming that all tools are properly loaded.

## Configuration

### AWS Configuration

#### 1. Install AWS CLI

Follow the [AWS CLI installation guide](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) for your operating system.

#### 2. Configure AWS Credentials

```bash
aws configure
```

Enter your AWS credentials:
- AWS Access Key ID
- AWS Secret Access Key
- Default region name
- Default output format

Alternatively, set environment variables:

```bash
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_DEFAULT_REGION=your_region
```

#### 3. Verify AWS Configuration

```bash
aws sts get-caller-identity
```

This should return your AWS account information.

### EKS Cluster Access

#### 1. Verify Cluster Access

```bash
aws eks list-clusters --region your-region
```

#### 2. Update kubeconfig

```bash
aws eks update-kubeconfig --name your-cluster-name --region your-region
```

#### 3. Test Cluster Access

```bash
kubectl get nodes
```

### Helm Configuration

#### 1. Install Helm

Follow the [Helm installation guide](https://helm.sh/docs/intro/install/) for your operating system.

#### 2. Verify Helm Installation

```bash
helm version
```

#### 3. Test Helm Access

```bash
helm list --all-namespaces
```

## Environment Setup

### Development Environment

For development, you may want to set up additional tools:

```bash
# Install TypeScript globally (optional)
npm install -g typescript

# Install development tools
npm install -g nodemon ts-node
```

### Production Environment

For production deployment:

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Set up environment variables**:
   ```bash
   export NODE_ENV=production
   export AWS_PROFILE=your-production-profile
   ```

3. **Run the server**:
   ```bash
   node build/index.js
   ```

## Testing the Installation

### 1. Test Connection

Run the connection test:

```bash
node test/test-connection.js
```

### 2. Test Helm Tools

Run the Helm tools test:

```bash
node test/test-helm-tools.js
```

### 3. Test Integration

Run the full integration test:

```bash
node test/test-integration.js
```

## Troubleshooting Installation

### Common Issues

#### Node.js Version Issues

If you encounter Node.js version issues:

```bash
# Check Node.js version
node --version

# Use nvm to install correct version
nvm install 18
nvm use 18
```

#### AWS Credentials Issues

If AWS credentials are not working:

```bash
# Check AWS configuration
aws configure list

# Test AWS access
aws sts get-caller-identity

# Verify EKS access
aws eks list-clusters
```

#### Helm Installation Issues

If Helm is not found:

```bash
# Check if Helm is in PATH
which helm

# Add Helm to PATH if needed
export PATH=$PATH:/path/to/helm

# Verify Helm installation
helm version
```

#### Build Issues

If the build fails:

```bash
# Clean and rebuild
npm run clean
npm run build

# Check TypeScript errors
npx tsc --noEmit
```

### Verification Checklist

- [ ] Node.js 18+ installed
- [ ] Dependencies installed (`npm install` completed)
- [ ] Project builds successfully (`npm run build` completed)
- [ ] AWS CLI installed and configured
- [ ] AWS credentials working (`aws sts get-caller-identity` succeeds)
- [ ] EKS cluster accessible (`aws eks list-clusters` works)
- [ ] Helm CLI installed and in PATH
- [ ] Helm accessible (`helm version` works)
- [ ] Integration tests pass (`node test/test-integration.js` succeeds)

## Next Steps

After successful installation:

1. **Read the [Tool Reference](tools.md)** to understand available tools
2. **Check the [Integration Guide](integration.md)** for AI assistant setup
3. **Review the [Architecture](architecture.md)** for development information
4. **Test with your EKS cluster** using the connection tools

## Support

If you encounter issues during installation:

1. Check the [Troubleshooting](troubleshooting.md) guide
2. Verify all prerequisites are met
3. Check the verification checklist above
4. Create an issue in the repository with detailed error information 