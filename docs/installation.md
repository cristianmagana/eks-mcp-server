# Installation & Configuration

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

### Testing the Connection

Use the provided test script to verify your setup:

```bash
node test-connection.js
```

## Environment Variables

The following environment variables can be configured:

- `AWS_ACCESS_KEY_ID`: AWS access key
- `AWS_SECRET_ACCESS_KEY`: AWS secret key
- `AWS_DEFAULT_REGION`: Default AWS region
- `DEBUG`: Enable debug logging (set to `eks-mcp-server:*`)

## Security Considerations

1. **AWS Credentials**: Store credentials securely and never commit them to version control
2. **IAM Permissions**: Use least-privilege access for AWS and EKS permissions
3. **Network Security**: Ensure secure network access to EKS clusters
4. **Audit Logging**: Monitor and log all cluster access for security compliance 