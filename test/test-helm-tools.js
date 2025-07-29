import { HelmToolsService } from '../build/services/helm-tools.service.js';

async function testHelmTools() {
    console.log('Testing Helm Tools Service...\n');

    try {
        // Test getting Helm tools
        const helmTools = HelmToolsService.getHelmTools();
        console.log(`Found ${helmTools.length} Helm tools:`);
        helmTools.forEach(tool => {
            console.log(`  - ${tool.name}: ${tool.description}`);
        });

        console.log('\nHelm Tools Details:');
        helmTools.forEach(tool => {
            console.log(`\n${tool.name}:`);
            console.log(`  Description: ${tool.description}`);
            console.log(`  Schema:`, JSON.stringify(tool.schema, null, 2));
        });

        console.log('\n✅ Helm Tools Service test completed successfully!');
    } catch (error) {
        console.error('❌ Helm Tools Service test failed:', error);
    }
}

// Run the test
testHelmTools().catch(console.error); 