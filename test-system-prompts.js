import { ResponseFormatter } from './build/util/response-formatter.util.js';

console.log('=== EKS MCP Server - System Prompt Usage Demo ===\n');

// 1. View current system prompts
console.log('1. Current System Prompts:');
console.log('==========================');

const tools = ['connect_to_eks', 'get_cluster_info', 'list_pods', 'get_pod_logs', 'help'];

tools.forEach(toolName => {
    const prompt = ResponseFormatter.getSystemPrompt(toolName);
    console.log(`\n${toolName}:`);
    console.log(prompt.substring(0, 150) + '...');
});

console.log('\n2. How to Modify System Prompts:');
console.log('================================');
console.log('To modify system prompts:');
console.log('1. Edit src/util/response-formatter.util.ts');
console.log('2. Find the getSystemPrompt() method');
console.log('3. Modify the prompts object');
console.log('4. Add new prompts or update existing ones');
console.log('5. Rebuild the project with: npm run build');

console.log('\n3. Example Customization:');
console.log('========================');
console.log('Current connect_to_eks prompt:');
const currentPrompt = ResponseFormatter.getSystemPrompt('connect_to_eks');
console.log(currentPrompt);

console.log('\nModified connect_to_eks prompt (example):');
const modifiedPrompt = `You are connecting to an EKS cluster. Return a structured response with:
- Connection status and cluster details
- Any authentication issues or warnings
- Next steps for cluster interaction
- Clear success/failure indication
- Security compliance status
- Performance baseline metrics
- Network connectivity status
- IAM role validation`;

console.log(modifiedPrompt);

console.log('\n4. Response Instruction Customization:');
console.log('====================================');
console.log('Available instruction options:');
console.log('- responseFormat: "structured" | "simple"');
console.log('- includeMetadata: boolean');
console.log('- includeSummary: boolean');
console.log('- summaryFormat: "detailed" | "concise"');
console.log('- errorHandling: "detailed" | "simple"');

console.log('\nExample custom instructions:');
const customInstructions = {
    responseFormat: 'structured',
    includeMetadata: true,
    includeSummary: true,
    summaryFormat: 'detailed',
    errorHandling: 'detailed'
};
console.log(JSON.stringify(customInstructions, null, 2));

console.log('\n=== End of Demo ===');
console.log('\nFor more detailed customization examples, see the README.md file.'); 