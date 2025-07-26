import { EKSAuthenticatorService } from './build/services/eks-auth.service.js';

const testEKSConnection = async () => {
    console.log('Testing EKS connection...');
    
    const config = {
        clusterName: 'sandbox-cluster',
        region: 'us-east-1'
    };
    
    const authenticator = new EKSAuthenticatorService(config);
    
    try {
        console.log('Authenticating to EKS cluster...');
        await authenticator.authenticate();
        
        console.log('Testing connection...');
        const isConnected = await authenticator.testConnection();
        
        if (isConnected) {
            console.log('✅ Successfully connected to EKS cluster!');
            
            // Test listing namespaces
            const coreApi = authenticator.getCoreV1Api();
            const namespaces = await coreApi.listNamespace();
            console.log(`Found ${namespaces.items.length} namespaces`);
            
            namespaces.items.forEach((ns) => {
                console.log(`- ${ns.metadata?.name} (${ns.status?.phase})`);
            });
        } else {
            console.log('❌ Connection test failed');
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Full error:', error);
    }
};

testEKSConnection().catch(console.error); 