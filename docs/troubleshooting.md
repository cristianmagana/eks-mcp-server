# Troubleshooting Guide

This guide helps you resolve common issues when using the EKS MCP Server.

## Common Issues

### Authentication Errors

#### Issue: AWS credentials not configured
**Symptoms**: Authentication failures, "credentials not found" errors

**Solutions**:
1. **Configure AWS CLI**:
   ```bash
   aws configure
   ```

2. **Set Environment Variables**:
   ```bash
   export AWS_ACCESS_KEY_ID=your_access_key
   export AWS_SECRET_ACCESS_KEY=your_secret_key
   export AWS_DEFAULT_REGION=your_region
   ```

3. **Verify Configuration**:
   ```bash
   aws sts get-caller-identity
   ```

#### Issue: Insufficient IAM permissions
**Symptoms**: "Access Denied" errors, "not authorized" messages

**Solutions**:
1. **Check Required Permissions**:
   - `eks:DescribeCluster`
   - `eks:ListClusters`
   - `sts:GetCallerIdentity`

2. **Verify IAM Policy**:
   ```bash
   aws iam get-user
   aws iam list-attached-user-policies --user-name your-username
   ```

3. **Test EKS Access**:
   ```bash
   aws eks list-clusters --region your-region
   ```

### Connection Failures

#### Issue: Cluster not found
**Symptoms**: "Cluster not found" errors, connection timeouts

**Solutions**:
1. **Verify Cluster Name**:
   ```bash
   aws eks list-clusters --region your-region
   ```

2. **Check Cluster Status**:
   ```bash
   aws eks describe-cluster --name your-cluster-name --region your-region
   ```

3. **Verify Region**:
   Ensure you're using the correct AWS region where the cluster is located.

#### Issue: Network connectivity problems
**Symptoms**: Connection timeouts, "unable to reach cluster" errors

**Solutions**:
1. **Check Network Access**:
   - Verify you can reach the EKS cluster endpoint
   - Check firewall and security group settings

2. **Test Connectivity**:
   ```bash
   aws eks update-kubeconfig --name your-cluster-name --region your-region
   kubectl get nodes
   ```

3. **Check VPC Settings**:
   - Ensure your network can reach the EKS cluster VPC
   - Verify security group rules allow your IP

### Permission Errors

#### Issue: Kubernetes RBAC permissions
**Symptoms**: "Forbidden" errors, "not authorized" for resources

**Solutions**:
1. **Check RBAC Configuration**:
   ```bash
   kubectl auth can-i list pods
   kubectl auth can-i get nodes
   ```

2. **Verify Service Account**:
   ```bash
   kubectl get serviceaccount
   kubectl get clusterrolebinding
   ```

3. **Check Namespace Access**:
   ```bash
   kubectl get namespaces
   kubectl auth can-i list pods --namespace your-namespace
   ```

### Helm Tool Errors

#### Issue: Helm CLI not found
**Symptoms**: "helm command not found", "Helm CLI not available"

**Solutions**:
1. **Install Helm**:
   ```bash
   # macOS
   brew install helm
   
   # Linux
   curl https://get.helm.sh/helm-v3.x.x-linux-amd64.tar.gz | tar xz
   sudo mv linux-amd64/helm /usr/local/bin/
   
   # Windows
   choco install kubernetes-helm
   ```

2. **Verify Installation**:
   ```bash
   helm version
   ```

3. **Add to PATH**:
   Ensure Helm is in your system PATH.

#### Issue: Helm access denied
**Symptoms**: "not authorized" for Helm operations, "forbidden" errors

**Solutions**:
1. **Test Helm Access**:
   ```bash
   helm list --all-namespaces
   ```

2. **Check RBAC for Helm**:
   ```bash
   kubectl auth can-i list secrets --namespace kube-system
   kubectl auth can-i get configmaps --namespace kube-system
   ```

3. **Verify Tiller Permissions** (if using Helm 2):
   ```bash
   kubectl get serviceaccount -n kube-system | grep tiller
   ```

#### Issue: Helm releases not found
**Symptoms**: "release not found", empty release lists

**Solutions**:
1. **Check Release Namespace**:
   ```bash
   helm list --all-namespaces
   ```

2. **Verify Release Names**:
   ```bash
   helm list -n your-namespace
   ```

3. **Check Release Status**:
   ```bash
   helm status your-release-name -n your-namespace
   ```

### Tool Execution Errors

#### Issue: Tools not available
**Symptoms**: "Unknown tool" errors, missing tools in help

**Solutions**:
1. **Check Server Status**:
   - Verify MCP server is running
   - Check server connection in AI assistant

2. **Restart AI Assistant**:
   - Close and reopen Claude Desktop or Cursor
   - Reconnect to the MCP server

3. **Verify Tool Registration**:
   ```bash
   node test/test-integration.js
   ```

#### Issue: Tool execution failures
**Symptoms**: Tool execution errors, unexpected responses

**Solutions**:
1. **Check Connection**:
   - Ensure you're connected to an EKS cluster
   - Use `connect_to_eks` first

2. **Verify Parameters**:
   - Check tool parameters and requirements
   - Use the `help` tool for guidance

3. **Test Manually**:
   ```bash
   node test/test-helm-tools.js
   ```

## Debug Mode

### Enable Debug Logging

Set environment variables for detailed logging:

```bash
export DEBUG=eks-mcp-server:*
export NODE_ENV=development
node build/index.js
```

### Debug Information

Debug mode provides:
- Detailed error messages
- Request/response logging
- Authentication flow details
- Tool execution traces

### Common Debug Output

#### Authentication Debug
```
[DEBUG] EKS authentication started
[DEBUG] AWS credentials loaded
[DEBUG] Cluster info retrieved
[DEBUG] Kubeconfig updated
[DEBUG] Connection test successful
```

#### Tool Execution Debug
```
[DEBUG] Tool execution started: list_helm_releases
[DEBUG] Parameters: { namespace: 'production' }
[DEBUG] Helm client initialized
[DEBUG] Helm command executed: helm list --output json --namespace production
[DEBUG] Response received
```

## Testing and Verification

### Connection Testing

Test your EKS connection:

```bash
node test/test-connection.js
```

### Helm Tools Testing

Test Helm functionality:

```bash
node test/test-helm-tools.js
```

### Integration Testing

Test all tools together:

```bash
node test/test-integration.js
```

### Manual Testing

Test individual components:

```bash
# Test AWS credentials
aws sts get-caller-identity

# Test EKS access
aws eks list-clusters --region your-region

# Test Kubernetes access
kubectl get nodes

# Test Helm access
helm list --all-namespaces
```

## Performance Issues

### Slow Response Times

**Symptoms**: Long tool execution times, timeouts

**Solutions**:
1. **Check Network Latency**:
   - Test connection to EKS cluster
   - Verify network performance

2. **Optimize Queries**:
   - Use specific namespaces
   - Limit result sets
   - Use appropriate filters

3. **Monitor Resources**:
   - Check CPU and memory usage
   - Monitor network bandwidth

### Memory Issues

**Symptoms**: High memory usage, out of memory errors

**Solutions**:
1. **Check Memory Usage**:
   ```bash
   ps aux | grep node
   ```

2. **Optimize Data Handling**:
   - Process data in chunks
   - Implement pagination
   - Use streaming for large datasets

3. **Restart Services**:
   - Restart the MCP server
   - Clear any cached data

## Security Issues

### Credential Exposure

**Symptoms**: Credentials in logs, security warnings

**Solutions**:
1. **Check Logs**:
   - Review debug output for sensitive data
   - Remove credentials from logs

2. **Use Environment Variables**:
   - Store credentials in environment variables
   - Use AWS profiles instead of hardcoded credentials

3. **Audit Access**:
   - Monitor AWS CloudTrail logs
   - Review Kubernetes audit logs

### Access Control Issues

**Symptoms**: Unauthorized access, permission escalation

**Solutions**:
1. **Review IAM Policies**:
   - Use least-privilege access
   - Regularly audit permissions

2. **Check RBAC**:
   - Review Kubernetes RBAC policies
   - Verify namespace access controls

3. **Monitor Access**:
   - Enable audit logging
   - Monitor access patterns

## Environment-Specific Issues

### macOS Issues

#### Issue: Permission denied errors
**Solutions**:
```bash
# Fix file permissions
chmod +x build/index.js

# Check Node.js installation
which node
node --version
```

#### Issue: Homebrew conflicts
**Solutions**:
```bash
# Update Homebrew
brew update

# Reinstall tools
brew reinstall node helm
```

### Linux Issues

#### Issue: Missing dependencies
**Solutions**:
```bash
# Install required packages
sudo apt-get update
sudo apt-get install curl wget git

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### Issue: PATH issues
**Solutions**:
```bash
# Add to PATH
export PATH=$PATH:/usr/local/bin

# Make permanent
echo 'export PATH=$PATH:/usr/local/bin' >> ~/.bashrc
source ~/.bashrc
```

### Windows Issues

#### Issue: PowerShell execution policy
**Solutions**:
```powershell
# Set execution policy
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Install tools
choco install nodejs kubernetes-helm
```

#### Issue: Path issues
**Solutions**:
1. Add Node.js and Helm to system PATH
2. Restart command prompt after installation
3. Verify tools are accessible

## Getting Help

### Before Asking for Help

1. **Check Documentation**:
   - Review this troubleshooting guide
   - Check the [Installation Guide](installation.md)
   - Read the [Tool Reference](tools.md)

2. **Run Tests**:
   ```bash
   node test/test-integration.js
   ```

3. **Enable Debug Mode**:
   ```bash
   export DEBUG=eks-mcp-server:*
   node build/index.js
   ```

4. **Gather Information**:
   - Error messages
   - Debug output
   - System information
   - Steps to reproduce

### Creating Issues

When creating an issue, include:

1. **Environment Information**:
   - Operating system
   - Node.js version
   - AWS CLI version
   - Helm version

2. **Error Details**:
   - Complete error message
   - Stack trace
   - Debug output

3. **Steps to Reproduce**:
   - Exact commands used
   - Expected vs actual behavior
   - Screenshots if applicable

4. **Configuration**:
   - AWS configuration (without credentials)
   - EKS cluster details
   - MCP server configuration

### Community Support

- **GitHub Issues**: Create detailed issues with all information
- **Documentation**: Check existing documentation and guides
- **Examples**: Look at test files for usage examples
- **Search**: Search existing issues for similar problems

## Prevention

### Best Practices

1. **Regular Updates**:
   - Keep Node.js updated
   - Update AWS CLI regularly
   - Update Helm to latest version

2. **Monitoring**:
   - Monitor cluster health
   - Check tool performance
   - Review error logs

3. **Testing**:
   - Test changes in development
   - Run integration tests regularly
   - Verify functionality after updates

4. **Documentation**:
   - Keep configuration documented
   - Record customizations
   - Maintain runbooks for common issues 