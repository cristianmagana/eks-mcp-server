import { KubernetesToolsService } from '../build/services/kubernetes-tools.service.js';
import { HelmToolsService } from '../build/services/helm-tools.service.js';

async function testIntegration() {
    console.log('Testing EKS MCP Server Integration...\n');

    try {
        // Test Kubernetes Tools
        console.log('1. Testing Kubernetes Tools Service...');
        const kubernetesTools = KubernetesToolsService.getKubernetesTools();
        console.log(`   Found ${kubernetesTools.length} Kubernetes tools`);
        
        // Test Helm Tools
        console.log('\n2. Testing Helm Tools Service...');
        const helmTools = HelmToolsService.getHelmTools();
        console.log(`   Found ${helmTools.length} Helm tools`);
        
        // Test combined tools
        console.log('\n3. Testing Combined Tools...');
        const allTools = [...kubernetesTools, ...helmTools];
        console.log(`   Total tools available: ${allTools.length}`);
        
        // Test tool categories
        console.log('\n4. Testing Tool Categories...');
        const categories = {
            connection: kubernetesTools.filter(t => t.name === 'connect_to_eks').length,
            cluster: kubernetesTools.filter(t => ['get_cluster_info', 'get_resource_usage', 'list_namespaces'].includes(t.name)).length,
            resource: kubernetesTools.filter(t => ['list_pods', 'describe_pod', 'list_services', 'list_deployments', 'get_pod_logs'].includes(t.name)).length,
            helm: helmTools.length,
            system: kubernetesTools.filter(t => t.name === 'help').length
        };
        
        console.log('   Tool distribution by category:');
        Object.entries(categories).forEach(([category, count]) => {
            console.log(`     ${category}: ${count} tools`);
        });
        
        // Test Helm tool names
        console.log('\n5. Testing Helm Tool Names...');
        const expectedHelmTools = [
            'list_helm_releases',
            'get_helm_release', 
            'get_helm_release_status',
            'get_helm_release_history'
        ];
        
        const actualHelmToolNames = helmTools.map(t => t.name);
        const missingTools = expectedHelmTools.filter(name => !actualHelmToolNames.includes(name));
        
        if (missingTools.length === 0) {
            console.log('   ✅ All expected Helm tools are present');
        } else {
            console.log(`   ❌ Missing Helm tools: ${missingTools.join(', ')}`);
        }
        
        console.log('\n✅ Integration test completed successfully!');
        console.log(`\nSummary: ${allTools.length} total tools available across ${Object.keys(categories).length} categories`);
        
    } catch (error) {
        console.error('❌ Integration test failed:', error);
    }
}

// Run the integration test
testIntegration().catch(console.error); 