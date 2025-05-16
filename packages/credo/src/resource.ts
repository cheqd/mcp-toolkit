import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { CredoAgent } from './agent';
import { ConnectionRecord } from '@credo-ts/core';

/**
 * Handler class for managing resources in the Credo agent.
 * Provides methods to register resources related to DIDs, credentials, and other entities.
 * These resources are exposed to clients through the MCP protocol.
 */
export class ResourceHandler {
	credo: CredoAgent;
	constructor(credo: CredoAgent) {
		this.credo = credo;
	}

	/**
	 * Registers resources related to DIDs and credentials.
	 * These resources are exposed to clients through the MCP protocol.
	 */
	registerResources(server: McpServer) {
		// Register a resource for listing all DIDs in the wallet
		server.resource('wallet-dids', 'dids://wallet/all', async (uri) => {
			try {
				const dids = await this.credo.agent.dids.getCreatedDids();
				return {
					contents: [
						{
							uri: uri.href,
							text: JSON.stringify(dids, null, 2),
							mimeType: 'application/json',
						},
					],
				};
			} catch (error) {
				return {
					contents: [
						{
							uri: uri.href,
							text: `Error fetching DIDs: ${error instanceof Error ? error.message : String(error)}`,
							mimeType: 'text/plain',
						},
					],
				};
			}
		});
		// Register a resource for listing all credentials in the wallet
		server.resource('wallet-credentials', 'credentials://wallet/all', async (uri) => {
			const credentials = await this.credo.agent.w3cCredentials.getAllCredentialRecords();
			return {
				contents: [
					{
						uri: uri.href,
						text: JSON.stringify(credentials, null, 2),
						mimeType: 'application/json',
					},
				],
			};
		});
		// Register a template resource for retrieving a specific credential
		server.resource(
			'wallet-credential-by-id',
			new ResourceTemplate('credentials://wallet/{id}', { list: undefined }),
			async (uri, { id }) => {
				try {
					const credential = await this.credo.agent.credentials.getById(Array.isArray(id) ? id[0] : id);
					return {
						contents: [
							{
								uri: uri.href,
								text: JSON.stringify(credential, null, 2),
								mimeType: 'application/json',
							},
						],
					};
				} catch (e) {
					return {
						contents: [
							{
								uri: uri.href,
								text: JSON.stringify({ error: `Credential with ID ${id} not found` }, null, 2),
								mimeType: 'application/json',
							},
						],
					};
				}
			}
		);
		// Register a resource for listing all credential exchange records
		server.resource('credential-exchange-records', 'credentials://exchange-records/all', async (uri) => {
			try {
				const credentialExchangeRecords = await this.credo.agent.credentials.getAll();
				return {
					contents: [
						{
							uri: uri.href,
							text: JSON.stringify(credentialExchangeRecords, null, 2),
							mimeType: 'application/json',
						},
					],
				};
			} catch (error) {
				return {
					contents: [
						{
							uri: uri.href,
							text: `Error fetching Credential Exchange records: ${error instanceof Error ? error.message : String(error)}`,
							mimeType: 'text/plain',
						},
					],
				};
			}
		});
		// Register a resource for listing all schema definitions
		server.resource('cheqd-schemas', 'anoncreds://schemas/cheqd/all', async (uri) => {
			try {
				const schemas = await this.credo.agent.modules.anoncreds.getCreatedSchemas({
					methodName: 'cheqd',
				});
				return {
					contents: [
						{
							uri: uri.href,
							text: JSON.stringify(schemas, null, 2),
							mimeType: 'application/json',
						},
					],
				};
			} catch (error) {
				return {
					contents: [
						{
							uri: uri.href,
							text: `Error fetching Cheqd Schemas: ${error instanceof Error ? error.message : String(error)}`,
							mimeType: 'text/plain',
						},
					],
				};
			}
		});
		// Register a template resource for retrieving a specific schema
		server.resource(
			'schema-by-id',
			new ResourceTemplate('anoncreds://schemas/{id}', { list: undefined }),
			async (uri, { id }) => {
				try {
					const schema = await this.credo.agent.modules.anoncreds.getSchema(Array.isArray(id) ? id[0] : id);
					return {
						contents: [
							{
								uri: uri.href,
								text: JSON.stringify(schema, null, 2),
								mimeType: 'application/json',
							},
						],
					};
				} catch (e) {
					return {
						contents: [
							{
								uri: uri.href,
								text: JSON.stringify({ error: `Schema with ID ${id} not found` }, null, 2),
								mimeType: 'application/json',
							},
						],
					};
				}
			}
		);

		// Register a resource for listing all credential definitions
		server.resource('cheqd-credential-definitions', 'anoncreds://credential-definitions/cheqd/all', async (uri) => {
			try {
				const credentialDefinitions = await this.credo.agent.modules.anoncreds.getCreatedCredentialDefinitions({
					methodName: 'cheqd',
				});
				return {
					contents: [
						{
							uri: uri.href,
							text: JSON.stringify(credentialDefinitions, null, 2),
							mimeType: 'application/json',
						},
					],
				};
			} catch (error) {
				return {
					contents: [
						{
							uri: uri.href,
							text: `Error fetching Credential Definitions: ${error instanceof Error ? error.message : String(error)}`,
							mimeType: 'text/plain',
						},
					],
				};
			}
		});
		// Register a template resource for retrieving a specific credential definition
		server.resource(
			'credential-definition-by-id',
			new ResourceTemplate('anoncreds://credential-definitions/{id}', { list: undefined }),
			async (uri, { id }) => {
				try {
					const credentialDefinition = await this.credo.agent.modules.anoncreds.getCredentialDefinition(
						Array.isArray(id) ? id[0] : id
					);
					return {
						contents: [
							{
								uri: uri.href,
								text: JSON.stringify(credentialDefinition, null, 2),
								mimeType: 'application/json',
							},
						],
					};
				} catch (e) {
					return {
						contents: [
							{
								uri: uri.href,
								text: JSON.stringify(
									{ error: `Credential Definition with ID ${id} not found` },
									null,
									2
								),
								mimeType: 'application/json',
							},
						],
					};
				}
			}
		);

		// Register a resource for listing all connections
		server.resource('out-of-band-connections', 'connections://out-of-band/all', async (uri) => {
			try {
				const connections = await this.credo.agent.connections.getAll();
				return {
					contents: [
						{
							uri: uri.href,
							text: JSON.stringify(connections, null, 2),
							mimeType: 'application/json',
						},
					],
				};
			} catch (error) {
				return {
					contents: [
						{
							uri: uri.href,
							text: `Error fetching all Connections: ${error instanceof Error ? error.message : String(error)}`,
							mimeType: 'text/plain',
						},
					],
				};
			}
		});
		// Register a template resource for retrieving a specific connection
		server.resource(
			'out-of-band-connection-by-id',
			new ResourceTemplate('connections://out-of-band/{id}', { list: undefined }),
			async (uri, { id, outOfBandId }) => {
				try {
					let connection: ConnectionRecord | null = null;

					if (outOfBandId) {
						[connection] = await this.credo.agent.connections.findAllByOutOfBandId(
							Array.isArray(outOfBandId) ? outOfBandId[0] : outOfBandId
						);
					} else if (id) {
						connection = await this.credo.agent.connections.findById(Array.isArray(id) ? id[0] : id);
					}

					if (!connection) {
						throw new Error(`Connection not found`);
					}

					return {
						contents: [
							{
								uri: uri.href,
								text: JSON.stringify(connection, null, 2),
								mimeType: 'application/json',
							},
						],
					};
				} catch (e) {
					return {
						contents: [
							{
								uri: uri.href,
								text: JSON.stringify({ error: `Connection not found` }, null, 2),
								mimeType: 'application/json',
							},
						],
					};
				}
			}
		);
		// Register a resource for listing all proof records
		server.resource('credential-proofs', 'credential-proofs://all', async (uri) => {
			try {
				const proofs = await this.credo.agent.proofs.getAll();
				return {
					contents: [
						{
							uri: uri.href,
							text: JSON.stringify(proofs, null, 2),
							mimeType: 'application/json',
						},
					],
				};
			} catch (error) {
				return {
					contents: [
						{
							uri: uri.href,
							text: `Error fetching Credential Proofs: ${error instanceof Error ? error.message : String(error)}`,
							mimeType: 'text/plain',
						},
					],
				};
			}
		});
		// Register a template resource for retrieving a specific proof
		server.resource(
			'credential-proof-by-id',
			new ResourceTemplate('credential-proofs://{id}', { list: undefined }),
			async (uri, { id }) => {
				try {
					const proof = await this.credo.agent.proofs.getById(Array.isArray(id) ? id[0] : id);
					return {
						contents: [
							{
								uri: uri.href,
								text: JSON.stringify(proof, null, 2),
								mimeType: 'application/json',
							},
						],
					};
				} catch (e) {
					return {
						contents: [
							{
								uri: uri.href,
								text: JSON.stringify({ error: `Proof with ID ${id} not found` }, null, 2),
								mimeType: 'application/json',
							},
						],
					};
				}
			}
		);
		// Register a resource to get statistics of the connections
		server.resource('connection-stats', 'connections://stats', async (uri) => {
			try {
				const connections = await this.credo.agent.connections.getAll();

				// Generate statistics about connections
				const stats = {
					total: connections.length,
					byState: connections.reduce((acc, conn) => {
						acc[conn.state] = (acc[conn.state] || 0) + 1;
						return acc;
					}, {}),
					recentConnections: connections
						.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
						.slice(0, 5)
						.map((c) => ({
							id: c.id,
							state: c.state,
							createdAt: c.createdAt,
							theirLabel: c.theirLabel,
						})),
				};

				return {
					contents: [
						{
							uri: uri.href,
							text: JSON.stringify(stats, null, 2),
							mimeType: 'application/json',
						},
					],
				};
			} catch (error) {
				return {
					contents: [
						{
							uri: uri.href,
							text: `Error generating connection statistics: ${error instanceof Error ? error.message : String(error)}`,
							mimeType: 'text/plain',
						},
					],
				};
			}
		});
		// Register a resource to get only identity credentials
		server.resource('agent-identity-credentials', 'credentials://wallet/agent-identity', async (uri) => {
			try {
				// Get all credentials
				const allCredentials = await this.credo.agent.w3cCredentials.getAllCredentialRecords();

				// Filter for identity-related credentials
				// This filtering logic can be customized based on your credential types
				const identityCredentials = allCredentials.filter((cred) => {
					const types = cred.credential?.type || [];
					return types.some((type) => type.includes('AIAgentAuthorisation'));
				});

				return {
					contents: [
						{
							uri: uri.href,
							text: JSON.stringify(identityCredentials, null, 2),
							mimeType: 'application/json',
						},
					],
				};
			} catch (error) {
				return {
					contents: [
						{
							uri: uri.href,
							text: `Error fetching identity credentials: ${error instanceof Error ? error.message : String(error)}`,
							mimeType: 'text/plain',
						},
					],
				};
			}
		});
	}
}
