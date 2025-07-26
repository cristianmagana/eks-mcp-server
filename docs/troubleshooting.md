# Troubleshooting

## Common Issues

### Authentication Errors

**Symptoms:**
- Error messages about invalid credentials
- Permission denied errors
- Unable to describe EKS clusters

**Solutions:**

1. **Verify AWS credentials are properly configured:**
   ```bash
   aws sts get-caller-identity
   ```

2. **Check IAM permissions for EKS access:**
   Ensure your AWS user/role has the following permissions:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "eks:DescribeCluster",
           "eks:ListClusters"
         ],
         "Resource": "*"
       }
     ]
   }
   ```

3. **Ensure the cluster exists in the specified region:**
   ```bash
   aws eks list-clusters --region us-west-2
   ```

4. **Check AWS CLI configuration:**
   ```bash
   aws configure list
   ```

### Connection Failures

**Symptoms:**
- Unable to connect to EKS cluster
- Timeout errors
- Network connectivity issues

**Solutions:**

1. **Verify cluster name and region:**
   - Double-check the cluster name spelling
   - Ensure the region matches where the cluster was created

2. **Check network connectivity to EKS endpoint:**
   ```bash
   # Test connectivity to EKS API
   curl -k https://your-cluster-endpoint.eks.amazonaws.com/api/v1/namespaces
   ```

3. **Ensure kubeconfig is properly generated:**
   ```bash
   aws eks update-kubeconfig --name your-cluster-name --region your-region
   ```

4. **Check VPC and security group settings:**
   - Ensure your local machine can reach the EKS cluster
   - Verify security groups allow necessary traffic

### Permission Errors

**Symptoms:**
- RBAC permission errors
- "Forbidden" responses from Kubernetes API
- Unable to list or describe resources

**Solutions:**

1. **Verify RBAC permissions in the cluster:**
   ```bash
   kubectl auth can-i list pods --all-namespaces
   kubectl auth can-i get nodes
   ```

2. **Check if the AWS user/role has necessary permissions:**
   - Ensure your AWS credentials have EKS access
   - Verify the IAM role/user is mapped to a Kubernetes user/group

3. **Check cluster access configuration:**
   ```bash
   aws eks describe-cluster --name your-cluster-name --region your-region
   ```

4. **Verify aws-auth ConfigMap:**
   ```bash
   kubectl get configmap aws-auth -n kube-system -o yaml
   ```

### Resource Not Found Errors

**Symptoms:**
- Pods, services, or namespaces not found
- "404 Not Found" errors

**Solutions:**

1. **Verify the resource exists:**
   ```bash
   kubectl get pods -n your-namespace
   kubectl get namespaces
   ```

2. **Check namespace spelling:**
   - Ensure namespace names are spelled correctly
   - Use `kubectl get namespaces` to list available namespaces

3. **Verify resource names:**
   - Pod names often include random suffixes
   - Use `kubectl get pods -n namespace` to see exact names

### Performance Issues

**Symptoms:**
- Slow response times
- Timeout errors
- High latency

**Solutions:**

1. **Check cluster health:**
   ```bash
   kubectl get nodes
   kubectl top nodes
   ```

2. **Monitor resource usage:**
   ```bash
   kubectl top pods --all-namespaces
   ```

3. **Check network connectivity:**
   - Verify stable internet connection
   - Check if VPN or proxy is affecting connectivity

## Debug Mode

Enable debug logging to get more detailed information about issues:

```bash
export DEBUG=eks-mcp-server:*
node build/index.js
```

### Debug Environment Variables

- `DEBUG=eks-mcp-server:*`: Enable all debug logging
- `DEBUG=eks-mcp-server:auth`: Enable authentication debug logging
- `DEBUG=eks-mcp-server:tools`: Enable tools debug logging
- `DEBUG=eks-mcp-server:response`: Enable response formatting debug logging

## Log Analysis

### Common Log Patterns

1. **Authentication Issues:**
   ```
   [ERROR] AWS authentication failed: Invalid credentials
   [DEBUG] Attempting to authenticate with AWS...
   ```

2. **Connection Issues:**
   ```
   [ERROR] Failed to connect to EKS cluster: timeout
   [DEBUG] Attempting to connect to cluster: your-cluster-name
   ```

3. **Permission Issues:**
   ```
   [ERROR] Permission denied: cannot list pods
   [DEBUG] Checking RBAC permissions...
   ```

### Log Locations

- **Application Logs**: Output to stdout/stderr when running the server
- **AWS CLI Logs**: Check `~/.aws/logs/` for AWS CLI debug logs
- **Kubernetes Logs**: Use `kubectl logs` for cluster-side issues

## Performance Optimization

### Reducing Response Times

1. **Use specific namespaces:**
   - Always specify namespace when possible
   - Avoid listing all namespaces unless necessary

2. **Limit log retrieval:**
   - Use the `tail` parameter to limit log lines
   - Specify container name for multi-container pods

3. **Cache cluster information:**
   - Reuse connections when possible
   - Avoid repeated authentication calls

### Resource Usage Optimization

1. **Monitor memory usage:**
   - Large log responses can consume significant memory
   - Consider pagination for large result sets

2. **Optimize network calls:**
   - Batch operations when possible
   - Use efficient Kubernetes API calls

## Getting Help

### Before Seeking Help

1. **Collect Information:**
   - Error messages and stack traces
   - Debug logs with `DEBUG=eks-mcp-server:*`
   - AWS CLI version and configuration
   - Kubernetes cluster version

2. **Reproduce the Issue:**
   - Document exact steps to reproduce
   - Note any recent changes to configuration
   - Test with minimal parameters

3. **Check Documentation:**
   - Review this troubleshooting guide
   - Check the [API Reference](api-reference.md)
   - Review [Installation Guide](installation.md)

### Support Channels

1. **GitHub Issues:**
   - Create an issue with detailed information
   - Include logs and error messages
   - Provide reproduction steps

2. **Community Support:**
   - Check existing issues for similar problems
   - Review pull requests for solutions

3. **Documentation:**
   - Review [Architecture Documentation](architecture.md)
   - Check [Development Guide](development.md) for customization issues

## Prevention

### Best Practices

1. **Regular Testing:**
   - Test connections regularly
   - Monitor cluster health
   - Validate permissions periodically

2. **Configuration Management:**
   - Use version control for configurations
   - Document environment-specific settings
   - Regular backup of important configurations

3. **Monitoring:**
   - Set up alerts for authentication failures
   - Monitor API rate limits
   - Track performance metrics

4. **Security:**
   - Rotate AWS credentials regularly
   - Use least-privilege access
   - Audit permissions periodically 