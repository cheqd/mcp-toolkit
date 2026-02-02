export interface IAgentMCPServerOptions {
	tools: string[];
	credo?: {
		port: number;
		name: string;
		domain?: string;
		cosmosPayerSeed?: string;
		trainEndpoint?: string;
	};
	studio?: {
		name?: string;
		apiKey: string;
		apiEndpoint: string;
	}
}
