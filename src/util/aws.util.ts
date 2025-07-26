import {fromNodeProviderChain} from '@aws-sdk/credential-providers';

export class AWSUtil {
    static getAWSCredentials = async (): Promise<any> => {
        try {
            // Use AWS SDK v3 credential provider chain
            const credentials = await fromNodeProviderChain()();
            return credentials;
        } catch (error) {
            console.error('Error getting AWS credentials:', error);
            throw error;
        }
    };
} 