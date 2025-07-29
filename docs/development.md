# Development Guide

This guide provides information for developers who want to contribute to the EKS MCP Server project.

## Development Setup

### Prerequisites

- **Node.js 18+**: Required for development
- **TypeScript**: For type checking and compilation
- **Git**: For version control
- **AWS CLI**: For testing EKS connections
- **Helm CLI**: For testing Helm functionality

### Local Development Environment

1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd eks-mcp-server
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Install Development Tools** (optional):
   ```bash
   npm install -g typescript nodemon ts-node
   ```

4. **Build the Project**:
   ```bash
   npm run build
   ```

### Development Scripts

- `npm run build`: Build the TypeScript project
- `npm run clean`: Clean build artifacts
- `npm run test`: Run tests (when implemented)

### Development Workflow

1. **Make Changes**: Edit TypeScript files in the `src/` directory
2. **Build**: Run `npm run build` to compile changes
3. **Test**: Run tests to verify functionality
4. **Commit**: Commit changes with descriptive messages

## Project Structure

### Source Code Organization

```
src/
├── index.ts                 # Main MCP server entry point
├── services/                # Service layer
│   ├── eks-auth.service.ts      # AWS/EKS authentication
│   ├── kubernetes-tools.service.ts  # Kubernetes tools
│   └── helm-tools.service.ts    # Helm tools
├── interfaces/              # TypeScript interfaces
│   └── eks-auth.interface.ts
├── types/                   # Type definitions
│   ├── eks.ts
│   ├── mcp.ts
│   └── node-helm.d.ts
└── util/                    # Utility functions
    ├── aws.util.ts
    ├── kubeconfig.util.ts
    └── response-formatter.util.ts
```

### Testing Structure

```
test/
├── test-connection.js       # Connection testing
├── test-helm-tools.js       # Helm tools testing
└── test-integration.js      # Integration testing
```

## Adding New Tools

### 1. Create a New Service

Create a new service file following the established pattern:

```typescript
// src/services/new-tools.service.ts
import { KubernetesTool } from '../types/mcp.js';
import { z } from 'zod';
import { EKSAuthenticatorService } from './eks-auth.service.js';
import { ResponseFormatter } from '../util/response-formatter.util.js';

export class NewToolsService {
    private static eksAuth?: EKSAuthenticatorService;

    static getNewTools(): KubernetesTool[] {
        return [
            {
                name: 'new_tool',
                description: 'Description of the new tool',
                systemPrompt: ResponseFormatter.getSystemPrompt('new_tool'),
                schema: {
                    type: 'object',
                    properties: {
                        // Define tool parameters
                    },
                    required: ['required_param'],
                },
                execute: async (args, _coreApi, _appsApi) => {
                    try {
                        // Tool implementation
                        const data = {
                            // Tool-specific data
                        };

                        return ResponseFormatter.formatResponse('new_tool', data, undefined, {
                            includeMetadata: true,
                            includeSummary: true
                        });
                    } catch (error) {
                        const errorMessage = `Failed to execute new tool: ${error instanceof Error ? error.message : 'Unknown error'}`;
                        return ResponseFormatter.formatErrorResponse('new_tool', errorMessage);
                    }
                },
            },
        ];
    }

    static executeNewTool(toolName: string, args: any, coreApi?: any, appsApi?: any): Promise<any> {
        const tools = this.getNewTools();
        const tool = tools.find(t => t.name === toolName);
        
        if (!tool) {
            throw new Error(`Unknown new tool: ${toolName}`);
        }

        return tool.execute(args, coreApi, appsApi);
    }

    static setEksAuth(eksAuth: EKSAuthenticatorService): void {
        this.eksAuth = eksAuth;
    }
}
```

### 2. Register Tools in Main Server

Update `src/index.ts` to include your new tools:

```typescript
import { NewToolsService } from './services/new-tools.service.js';

// In the ListToolsRequestSchema handler:
const newTools = NewToolsService.getNewTools();

return {
    tools: [...kubernetesTools, ...helmTools, ...newTools].map(tool => ({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.schema,
    })),
};

// In the CallToolRequestSchema handler:
const newTool = newTools.find(tool => tool.name === request.params.name);

if (newTool) {
    return await this.handleNewTool(request.params.name, request.params.arguments);
}

// Add handler method:
private handleNewTool = async (toolName: string, args: any) => {
    try {
        const eksAuth = KubernetesToolsService.getEksAuth();
        if (eksAuth) {
            NewToolsService.setEksAuth(eksAuth);
        }
        
        const result = await NewToolsService.executeNewTool(toolName, args);
        
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(result, null, 2),
                },
            ],
        };
    } catch (error) {
        throw new McpError(ErrorCode.InternalError, `New tool execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};
```

### 3. Add System Prompts

Update `src/util/response-formatter.util.ts`:

```typescript
// In getSystemPrompt method:
'new_tool': `You are executing a new tool. Return a structured response with:
- Tool-specific requirements
- Relevant metrics and data
- Actionable recommendations
- Next steps for the user`,

// In generateSummary method:
'new_tool': {
    title: 'New Tool Results',
    description: 'Results from the new tool execution',
    keyMetrics: {
        // Tool-specific metrics
    },
    recommendations: [
        'Tool-specific recommendations'
    ]
}
```

### 4. Update Help System

Update `src/services/kubernetes-tools.service.ts`:

```typescript
// Add to tool categories
const categories = {
    // ... existing categories
    new: tools.filter(t => ['new_tool'].includes(t.name)),
};

// Add to category descriptions
new: {
    name: 'New Tools',
    description: 'Description of new tool category',
    tools: categories.new.map(t => ({
        name: t.name,
        description: t.description
    }))
},

// Add to category help
'new': {
    name: 'New Tools',
    description: 'Description of new tool category',
    tools: ['new_tool']
},

// Add examples
'new_tool': [
    'new_tool with required_param="value"',
    'new_tool with required_param="value" and optional_param="value"'
]
```

## Structured Response System

### Response Format

All tools should return structured responses using the `ResponseFormatter`:

```typescript
return ResponseFormatter.formatResponse(
    toolName,
    data,
    error,
    {
        includeMetadata: true,
        includeSummary: true,
        summaryFormat: 'detailed',
        errorHandling: 'detailed'
    }
);
```

### System Instructions

Customize response formatting with specific instructions:

```typescript
// Production response
const productionInstructions = {
    responseFormat: 'structured',
    includeMetadata: true,
    includeSummary: true,
    summaryFormat: 'detailed',
    errorHandling: 'detailed'
};

// Development response
const devInstructions = {
    responseFormat: 'structured',
    includeMetadata: false,
    includeSummary: true,
    summaryFormat: 'concise',
    errorHandling: 'simple'
};
```

### Adding New Response Fields

Extend the `StructuredResponse` interface in `src/types/mcp.ts`:

```typescript
export interface StructuredResponse {
    success: boolean;
    data?: any;
    error?: string;
    message?: string;
    metadata?: {
        timestamp: string;
        tool: string;
        executionTime?: number;
        clusterInfo?: {
            connected: boolean;
            clusterName?: string;
            region?: string;
        };
        // Add custom fields
        customField?: string;
        context?: string;
    };
    summary?: {
        title: string;
        description: string;
        keyMetrics?: Record<string, any>;
        recommendations?: string[];
        // Add custom summary fields
        customMetrics?: Record<string, any>;
        alerts?: string[];
    };
}
```

## Testing

### Running Tests

```bash
# Run all tests
node test/test-integration.js

# Run specific tests
node test/test-helm-tools.js
node test/test-connection.js
```

### Writing Tests

Create test files following the established pattern:

```javascript
// test/test-new-tools.js
import { NewToolsService } from '../build/services/new-tools.service.js';

async function testNewTools() {
    console.log('Testing New Tools Service...\n');

    try {
        const newTools = NewToolsService.getNewTools();
        console.log(`Found ${newTools.length} new tools:`);
        newTools.forEach(tool => {
            console.log(`  - ${tool.name}: ${tool.description}`);
        });

        console.log('\n✅ New Tools Service test completed successfully!');
    } catch (error) {
        console.error('❌ New Tools Service test failed:', error);
    }
}

testNewTools().catch(console.error);
```

### Testing Guidelines

1. **Unit Tests**: Test individual tool functionality
2. **Integration Tests**: Test tool interactions
3. **Error Handling**: Test error scenarios
4. **Edge Cases**: Test boundary conditions
5. **Performance**: Test with realistic data volumes

## Code Style and Standards

### TypeScript Guidelines

- Use strict TypeScript configuration
- Define proper interfaces and types
- Use async/await for asynchronous operations
- Implement proper error handling
- Add JSDoc comments for public methods

### Code Organization

- Follow the established service pattern
- Keep functions focused and single-purpose
- Use meaningful variable and function names
- Implement proper separation of concerns
- Add appropriate error handling

### Documentation

- Update README.md for new features
- Add JSDoc comments for public APIs
- Update tool documentation
- Include usage examples
- Document breaking changes

## Contributing

### Pull Request Process

1. **Fork the Repository**: Create your own fork
2. **Create Feature Branch**: `git checkout -b feature/new-tool`
3. **Make Changes**: Implement your feature
4. **Add Tests**: Include tests for new functionality
5. **Update Documentation**: Update relevant documentation
6. **Commit Changes**: Use descriptive commit messages
7. **Push Changes**: Push to your fork
8. **Create Pull Request**: Submit PR with detailed description

### Commit Message Format

Use conventional commit format:

```
feat: add new tool for monitoring
fix: resolve authentication issue
docs: update installation guide
test: add integration tests
refactor: improve error handling
```

### Code Review Process

1. **Self Review**: Review your own changes
2. **Peer Review**: Request review from maintainers
3. **Address Feedback**: Make requested changes
4. **Final Review**: Ensure all feedback is addressed
5. **Merge**: Maintainers will merge approved changes

## Debugging

### Debug Mode

Enable debug logging:

```bash
export DEBUG=eks-mcp-server:*
node build/index.js
```

### Common Debugging Techniques

1. **Console Logging**: Add strategic console.log statements
2. **Error Tracing**: Use try-catch blocks with detailed error messages
3. **Type Checking**: Use TypeScript strict mode
4. **Manual Testing**: Test tools individually
5. **Integration Testing**: Test with real EKS clusters

### Debugging Tools

- **TypeScript Compiler**: Use `tsc --noEmit` for type checking
- **Node.js Inspector**: Use `--inspect` flag for debugging
- **VS Code Debugger**: Configure launch.json for debugging
- **Logging**: Use structured logging for better debugging

## Performance Considerations

### Optimization Guidelines

1. **Async Operations**: Use async/await for I/O operations
2. **Caching**: Implement caching for frequently accessed data
3. **Connection Pooling**: Reuse connections when possible
4. **Memory Management**: Avoid memory leaks
5. **Error Handling**: Implement proper error boundaries

### Monitoring

- **Execution Time**: Track tool execution times
- **Memory Usage**: Monitor memory consumption
- **Error Rates**: Track error frequencies
- **Response Times**: Monitor response latencies
- **Resource Usage**: Monitor CPU and I/O usage

## Security

### Security Guidelines

1. **Input Validation**: Validate all user inputs
2. **Authentication**: Implement proper authentication
3. **Authorization**: Use least-privilege access
4. **Error Handling**: Don't expose sensitive information
5. **Audit Logging**: Log security-relevant events

### Security Best Practices

- **Credential Management**: Never store credentials in code
- **Network Security**: Use secure communication protocols
- **Access Control**: Implement proper access controls
- **Vulnerability Scanning**: Regularly scan for vulnerabilities
- **Security Updates**: Keep dependencies updated

## Support and Community

### Getting Help

1. **Documentation**: Check the documentation first
2. **Issues**: Search existing issues
3. **Discussions**: Use GitHub discussions
4. **Community**: Join community channels
5. **Maintainers**: Contact maintainers directly

### Contributing to Documentation

- Update README.md for new features
- Add examples and use cases
- Improve clarity and organization
- Fix typos and errors
- Add troubleshooting guides

### Community Guidelines

- Be respectful and inclusive
- Provide constructive feedback
- Help other contributors
- Follow the code of conduct
- Participate in discussions 