# Development Guide

## Project Scripts

- `npm run build`: Build the TypeScript project
- `npm run clean`: Clean build artifacts
- `npm run test`: Run tests (when implemented)

## Structured Response System

The MCP server implements a comprehensive structured response system that ensures consistent, well-formatted output across all tools:

### Response Structure
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

### System Prompts
Each tool includes a system prompt that guides the response format:
- **Connection Tools**: Focus on connection status and next steps
- **Cluster Information**: Emphasize metrics and health indicators
- **Resource Management**: Highlight status and actionable recommendations
- **System Tools**: Provide clear navigation and usage guidance

### Key Features
- **Automatic Summary Generation**: Each response includes a contextual summary
- **Key Metrics Calculation**: Important metrics are automatically computed
- **Actionable Recommendations**: Context-aware suggestions for next steps
- **Consistent Error Handling**: Standardized error responses with details
- **Execution Time Tracking**: Performance monitoring for all operations
- **Metadata Enrichment**: Additional context for debugging and monitoring

## Using and Modifying the System Prompt/Instruction Layer

The system prompt and instruction layer can be customized to meet specific requirements. Here's how to use and modify it:

### 1. Viewing Current System Prompts

```javascript
import { ResponseFormatter } from './build/util/response-formatter.util.js';

// Get system prompt for a specific tool
const prompt = ResponseFormatter.getSystemPrompt('connect_to_eks');
console.log(prompt);
```

### 2. Modifying System Prompts

Edit `src/util/response-formatter.util.ts` and modify the `getSystemPrompt()` method:

```typescript
static getSystemPrompt(toolName: string): string {
    const prompts: { [key: string]: string } = {
        'connect_to_eks': `You are connecting to an EKS cluster. Return a structured response with:
- Connection status and cluster details
- Any authentication issues or warnings
- Next steps for cluster interaction
- Clear success/failure indication
- Security compliance status
- Performance baseline metrics`,

        // Add your custom prompts here
        'custom_tool': `You are executing a custom tool. Return a structured response with:
- Custom requirements
- Specific metrics
- Specialized recommendations`
    };

    return prompts[toolName] || `Default prompt for ${toolName}`;
}
```

### 3. Customizing Response Instructions

Modify the `SystemInstructions` interface in `src/types/mcp.ts`:

```typescript
export interface SystemInstructions {
    responseFormat: 'structured' | 'simple' | 'custom';
    includeMetadata: boolean;
    includeSummary: boolean;
    summaryFormat: 'detailed' | 'concise' | 'minimal';
    errorHandling: 'detailed' | 'simple' | 'verbose';
    // Add custom fields
    customFields?: string[];
    context?: 'production' | 'development' | 'audit';
    priority?: 'high' | 'medium' | 'low';
}
```

### 4. Creating Context-Specific Prompts

Extend the ResponseFormatter for different contexts:

```typescript
class CustomResponseFormatter extends ResponseFormatter {
    static getContextSpecificPrompt(toolName: string, context: string): string {
        const basePrompt = this.getSystemPrompt(toolName);
        
        switch (context) {
            case 'production':
                return `${basePrompt}
PRODUCTION REQUIREMENTS:
- Include SLA compliance metrics
- Highlight security vulnerabilities
- Provide immediate action items
- Include disaster recovery status`;
                
            case 'development':
                return `${basePrompt}
DEVELOPMENT REQUIREMENTS:
- Include debugging information
- Highlight dev-specific configurations
- Provide testing recommendations`;
                
            default:
                return basePrompt;
        }
    }
}
```

### 5. Tool-Specific Customization

Add custom system prompts to individual tools in `src/services/kubernetes-tools.service.ts`:

```typescript
{
    name: 'custom_tool',
    description: 'Custom tool with specialized prompt',
    systemPrompt: `You are performing a specialized operation. Return a structured response with:
- Specialized metrics and analysis
- Custom recommendations
- Context-specific insights`,
    schema: { /* tool schema */ },
    execute: async (args, coreApi, appsApi) => {
        // Tool implementation
        return ResponseFormatter.formatResponse('custom_tool', data, undefined, {
            includeMetadata: true,
            includeSummary: true,
            summaryFormat: 'detailed',
            errorHandling: 'detailed'
        });
    }
}
```

### 6. Response Format Customization

Customize response formatting with specific instructions:

```typescript
// Detailed response for production
const productionInstructions = {
    responseFormat: 'structured',
    includeMetadata: true,
    includeSummary: true,
    summaryFormat: 'detailed',
    errorHandling: 'detailed'
};

// Concise response for development
const devInstructions = {
    responseFormat: 'structured',
    includeMetadata: false,
    includeSummary: true,
    summaryFormat: 'concise',
    errorHandling: 'simple'
};

// Use in tool execution
return ResponseFormatter.formatResponse(
    toolName, 
    data, 
    error, 
    productionInstructions
);
```

### 7. Adding New Response Fields

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
        priority?: string;
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

### 8. Implementation Steps

1. **Identify Requirements**: Determine what customizations you need
2. **Modify Types**: Update interfaces in `src/types/mcp.ts`
3. **Update Prompts**: Modify `getSystemPrompt()` in `src/util/response-formatter.util.ts`
4. **Extend Formatter**: Create custom formatters if needed
5. **Update Tools**: Modify tool implementations in `src/services/kubernetes-tools.service.ts`
6. **Test**: Verify customizations work as expected
7. **Document**: Update documentation for your customizations

## Adding New Tools

To add new tools (e.g., New Relic integration):

1. **Create a new service** in `src/services/` (e.g., `newrelic-tools.service.ts`)
2. **Follow the same pattern** as `KubernetesToolsService`
3. **Register the tools** in the main server's tool list
4. **Update the README** with new tool documentation
5. **Add help information** by implementing help methods in your service

## Development Workflow

1. **Setup Development Environment**:
   ```bash
   npm install
   npm run build
   ```

2. **Make Changes**:
   - Edit TypeScript files in `src/`
   - Follow the established patterns and conventions

3. **Test Changes**:
   ```bash
   npm run build
   node build/index.js
   ```

4. **Update Documentation**:
   - Update relevant documentation files
   - Add examples for new features

5. **Submit Changes**:
   - Create a feature branch
   - Submit a pull request with clear description 