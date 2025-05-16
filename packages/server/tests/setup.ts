import path from 'path';
import { fileURLToPath } from 'url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { test as base } from '@playwright/test';
import { waitForCredentialExchangeState } from './utils';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const getServerPath = () => {
	return path.resolve(__dirname, '../build/index.js');
};

// Holder ACA-Py Agent API
interface HolderAgent {
	createInvitation: (label: string) => Promise<any>;
	getActiveConnections: () => Promise<any[]>;
	//getCredential: (credentialId: string) => Promise<any>;
	acceptAndStoreCredential: () => Promise<any>;
	getCredentials: () => Promise<any[]>;
	//storeCredential: (credentialExchangeId: string) => Promise<any>;
	acceptAndSendPresentation: () => Promise<any>;
}

export interface TestFixtures {
	client: Client;
	holderAgent: HolderAgent;
	parseToolResponse: (response: any) => any;
	parseFlexibleToolResponse: (response: any) => any;
	shutdown: () => Promise<void>;
}

let client: Client | null = null;
const startClient = async (): Promise<Client> => {
	const env = {
		...process.env,
		TOOLS: 'credo',
		CREDO_PORT: '9001',
		CREDO_NAME: 'test-agent',
		CREDO_ENDPOINT: 'http://host.docker.internal:9001',
		CREDO_CHEQD_TESTNET_MNEMONIC: process.env.CREDO_CHEQD_TESTNET_MNEMONIC || '',
	};
	// Create MCP Client
	const transport = new StdioClientTransport({
		command: 'node',
		args: [getServerPath()],
		env,
	});
	client = new Client({ name: 'test-client', version: '1.0.0' }, { capabilities: { tools: {} } });
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
	holderAgent: async ({}, use) => {
		const holderAgent: HolderAgent = {
			// Create invitation
			createInvitation: async (label: string) => {
				const response = await fetch(
					'http://localhost:4001/out-of-band/create-invitation?auto_accept=true&create_unique_did=false&multi_use=false',
					{
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({
							alias: label,
							handshake_protocols: ['https://didcomm.org/didexchange/1.1'],
							use_public_did: false,
							my_label: 'Invitation to ' + label,
						}),
					}
				);
				return response.json();
			},
			// Get active connections
			getActiveConnections: async () => {
				const response = await fetch('http://localhost:4001/connections?state=active');
				return response.json();
			},
			// Accept credential offer
			acceptAndStoreCredential: async () => {
				const timeout = 10000; // Maximum time to wait (in milliseconds)
				const interval = 1000; // Interval between checks (in milliseconds)
				const startTime = Date.now();

				let offers;
				// Wait for at least one offer to be received
				while (Date.now() - startTime < timeout) {
					const getResponse = await fetch(
						'http://localhost:4001/issue-credential-2.0/records?state=offer-received'
					);
					if (!getResponse.ok) {
						throw new Error(`Failed to fetch credential offers: ${getResponse.statusText}`);
					}

					offers = await getResponse.json();

					if (offers.results && offers.results.length > 0) {
						break; // Exit the loop if at least one result is found
					}

					// Wait for the specified interval before checking again
					await new Promise((resolve) => setTimeout(resolve, interval));
				}
				if (!offers || !offers.results || offers.results.length === 0) {
					throw new Error('No credential offers found');
				}

				// Extract the first credentialExchangeId
				const credentialExchangeId = offers.results[0]?.cred_ex_record.cred_ex_id;
				if (!credentialExchangeId) {
					throw new Error('Credential exchange ID not found in the response');
				}
				const response = await fetch(
					`http://localhost:4001/issue-credential-2.0/records/${credentialExchangeId}/send-request`,
					{
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
					}
				);
				if (!response.ok) {
					throw new Error(`Failed to accept credential offer: ${response.statusText}`);
				}
				// Wait for the credential exchange to reach the 'credential-received' state
				await waitForCredentialExchangeState(credentialExchangeId, 'credential-received');
				const storeResponse = await fetch(
					`http://localhost:4001/issue-credential-2.0/records/${credentialExchangeId}/store`,
					{
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
					}
				);
				if (!storeResponse.ok) {
					throw new Error(`Failed to store credential offer: ${storeResponse.statusText}`);
				}
				return storeResponse.json();
			},
			// Get credentials
			getCredentials: async () => {
				const response = await fetch('http://localhost:4001/credentials');
				return response.json();
			},
			// Get presentation exchanges
			acceptAndSendPresentation: async () => {
				const timeout = 10000; // Maximum time to wait (in milliseconds)
				const interval = 1000; // Interval between checks (in milliseconds)
				const startTime = Date.now();

				let offers;
				// Wait for at least one offer to be received
				while (Date.now() - startTime < timeout) {
					const getResponse = await fetch(
						'http://localhost:4001/present-proof-2.0/records?limit=1000&offset=0&state=request-received'
					);
					if (!getResponse.ok) {
						throw new Error(`Failed to fetch presentation offers: ${getResponse.statusText}`);
					}
					offers = await getResponse.json();

					if (offers.results && offers.results.length > 0) {
						break;
					}
					// Wait for the specified interval before checking again
					await new Promise((resolve) => setTimeout(resolve, interval));
				}
				if (!offers || !offers.results || offers.results.length === 0) {
					throw new Error('No presentation offers found');
				}
				// Extract the first presentationExchangeId
				const presentationExchangeId = offers.results[0]?.pres_ex_id;
				if (!presentationExchangeId) {
					throw new Error('Presentation exchange ID not found in the response');
				}
				const proofRequest = offers.results[0]?.by_format.pres_request.anoncreds;
				const credResponse = await fetch(
					`http://localhost:4001/present-proof-2.0/records/${presentationExchangeId}/credentials`
				);
				if (!credResponse.ok) {
					throw new Error(`Failed to fetch credential: ${credResponse.statusText}`);
				}
				const relevantCreds = await credResponse.json();
				// Initialize requested attributes and predicates
				let requestedAttributes = {};
				let requestedPredicates = {};
				// Process requested attributes
				for (let presReferent in proofRequest.requested_attributes) {
					for (let credPrecis of relevantCreds) {
						if (credPrecis.presentation_referents.includes(presReferent)) {
							requestedAttributes[presReferent] = {
								cred_id: credPrecis.cred_info.referent,
								revealed: true,
							};
							break; // Stop searching once a match is found
						}
					}
				}
				const timestampSeconds = Math.floor(Date.now() / 1000);
				// Process requested predicates
				for (let presReferent in proofRequest.requested_predicates) {
					for (let credPrecis of relevantCreds) {
						if (credPrecis.presentation_referents.includes(presReferent)) {
							requestedPredicates[presReferent] = {
								cred_id: credPrecis.cred_info.referent,
								timestamp: timestampSeconds,
							};
							break; // Stop searching once a match is found
						}
					}
				}
				// Construct the presentation specification
				let presSpec = {
					requested_attributes: requestedAttributes,
					requested_predicates: requestedPredicates,
					self_attested_attributes: {},
				};
				const response = await fetch(
					`http://localhost:4001/present-proof-2.0/records/${presentationExchangeId}/send-presentation`,
					{
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({
							anoncreds: presSpec,
						}),
					}
				);
				if (!response.ok) {
					throw new Error(`Failed to send presentation: ${response.statusText}`);
				}
				return response.json();
			},
		};
		await use(holderAgent);
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
