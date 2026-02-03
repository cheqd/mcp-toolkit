import path from 'path';
import { fileURLToPath } from 'url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { test as base } from '@playwright/test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const getServerPath = () => {
	return path.resolve(__dirname, '../../build/index.js');
};

export interface TestFixtures {
	client: Client;
	parseToolResponse: (response: any) => any;
	parseFlexibleToolResponse: (response: any) => any;
	shutdown: () => Promise<void>;
}

let client: Client | null = null;
const startClient = async (): Promise<Client> => {
	const env = {
		...process.env,
		TOOLS: 'studio',
		CHEQD_STUDIO_API_ENDPOINT: 'https://studio-api-staging.cheqd.net',
		CHEQD_STUDIO_API_KEY: 'caas_01eeddee4d9c86aa3659f56a43c11cbbb348cbe62ac066e870f00f7ec75856795a77629428968bddb141ec14c148472aa01d178e9d749864d95cd765d583fecf'
	};
	// Create MCP Client
	const transport = new StdioClientTransport({
		command: 'node',
		args: [getServerPath()],
		env,
	});
	client = new Client(
		{ name: 'test-client', version: '1.0.0' },
		{ capabilities: { sampling: { tools: {} } } }
	);
	await client.connect(transport);
	return client;
};
const shutdownClient = async (): Promise<void> => {
	try {
		if (client) {
			try {
				await client.close();
				client = null;
			} catch (e) {
				console.error('Error closing client: ', e);
			}
		}
	} catch (error) {
		console.error('Error shutting down client:', error);
	}
};

// Define custonm Playwright test with fixtures
export const test = base.extend<TestFixtures>({
	client: async ({}, use) => {
		if (!client) {
			client = await startClient();
		}
		await use(client);
	},

	parseToolResponse: async ({}, use) => {
		// Helper function to parse JSON from tool responses
		const parseToolResponse = (response: any): any => {
			try {
				if (!response || !response.content || !response.content[0]) {
					throw new Error('Invalid response structure');
				}

				const content = response.content[0];
				if (content.type !== 'text') {
					throw new Error(`Unexpected content type: ${content.type}`);
				}

				return JSON.parse(content.text);
			} catch (e) {
				console.error('Error parsing tool response:', e);
				throw e;
			}
		};

		await use(parseToolResponse);
	},
	parseFlexibleToolResponse: async ({}, use) => {
		const parseFlexibleToolResponse = (response: any): any => {
			try {
				if (!response || !response.content || !Array.isArray(response.content)) {
					throw new Error('Invalid response structure');
				}

				// Parse the content array
				const parsedResponse: any = {};

				response.content.forEach((item: any) => {
					if (item.type === 'text') {
						// Handle text content
						if (item.text.startsWith('{') && item.text.endsWith('}')) {
							// Parse JSON text
							parsedResponse.json = JSON.parse(item.text);
						} else if (item.text.includes('Connection URL')) {
							// Extract connection URL
							parsedResponse.connectionUrl = item.text.split('Connection URL: ')[1]?.trim();
						} else {
							parsedResponse.text = item.text;
						}
					} else if (item.type === 'image') {
						// Handle image content
						parsedResponse.image = {
							data: item.data,
							mimeType: item.mimeType,
						};
					} else {
						console.warn(`Unknown content type: ${item.type}`);
					}
				});
				return parsedResponse;
			} catch (e) {
				console.error('Error parsing tool response:', e);
				throw e;
			}
		};
		await use(parseFlexibleToolResponse);
	},
	shutdown: async ({}, use) => {
		await use(async () => {
			await shutdownClient();
		});
	},
});
export const { expect } = test;
