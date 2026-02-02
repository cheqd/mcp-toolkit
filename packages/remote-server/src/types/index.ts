export interface IAgentMCPServerOptions {
	tools: string[];
	version: string;
	credo?: {
		port: number;
		name: string;
		domain?: string;
		cosmosPayerSeed?: string;
	};
	studio?: {
		name: string;
		apiKey: string;
	}
}
