declare module 'node-helm' {
    export default class Helm {
        constructor(options?: { kubeconfig?: string });
        exec(command: string): Promise<string>;
    }
} 