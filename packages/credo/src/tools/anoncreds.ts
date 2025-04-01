import { CredoAgent } from '../agent.js';
import {
	ListCredentialDefinitionParams,
	ListSchemaParams,
	RegisterCredentialDefinitionParams,
	RegisterSchemaParams,
	ResolveCredentialDefinitionParams,
	ResolveSchemaIdParams,
	ToolDefinition,
} from '../types.js';

/**
 * Handler class for managing Anonymous Credentials in the Credo agent.
 * Provides tools for creating and managing schemas and credential definitions.
 */
export class AnonCredsToolHandler {
	credo: CredoAgent;

	constructor(credo: CredoAgent) {
		this.credo = credo;
	}

	/**
	 * Lists all schemas in the agent's wallet.
	 * Provides a complete overview of all available schemas.
	 */
	listSchemaTool(): ToolDefinition<typeof ListSchemaParams> {
		return {
			name: 'list-schemas',
			description:
				"Retrieves all schema definitions from the agent's wallet, providing a comprehensive list of all available schemas with their attributes and versions.",
			schema: ListSchemaParams,
			handler: async () => {
				const result = await this.credo.agent.modules.anoncreds.getCreatedSchemas({
					methodName: 'cheqd',
				});

				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(result),
						},
					],
				};
			},
		};
	}

	/**
	 * Resolves a schemaId from the Cheqd network.
	 * Returns detailed information about a single schema.
	 */
	getSchemaTool(): ToolDefinition<typeof ResolveSchemaIdParams> {
		return {
			name: 'get-schema',
			description:
				'Resolves a schema definition from the Cheqd network using its DID URL. Returns detailed information about the schema, including its attributes and version.',
			schema: ResolveSchemaIdParams,
			handler: async ({ schemaId }) => {
				const result = await this.credo.agent.modules.anoncreds.getSchema(schemaId);

				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(result),
						},
					],
				};
			},
		};
	}

	/**
	 * Creates and publishes a new schema to the cheqd network.
	 * Defines the structure for a type of credential.
	 */
	createSchemaTool(): ToolDefinition<typeof RegisterSchemaParams> {
		return {
			name: 'create-schema',
			description:
				'Creates and publishes a new schema to the specified cheqd network. Defines the structure for a type of credential, including attribute names and version information.',
			schema: RegisterSchemaParams,
			handler: async ({ schema, options }) => {
				const result = await this.credo.agent.modules.anoncreds.registerSchema({
					schema,
					options,
				});

				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(result),
						},
					],
				};
			},
		};
	}

	/**
	 * Lists all credential definitions in the agent's wallet.
	 * Provides a complete overview of all available credential definitions.
	 */
	listCredentialDefinitionTool(): ToolDefinition<typeof ListCredentialDefinitionParams> {
		return {
			name: 'list-credential-definitions',
			description:
				"Retrieves all credential definitions from the agent's wallet, providing a comprehensive list of all available definitions with their associated schemas and issuers.",
			schema: ListCredentialDefinitionParams,
			handler: async () => {
				const result = await this.credo.agent.modules.anoncreds.getCreatedCredentialDefinitions({
					methodName: 'cheqd',
				});

				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(result),
						},
					],
				};
			},
		};
	}

	/**
	 * Resolves a credential definition from the Cheqd Network.
	 * Returns detailed information about a single credential definition.
	 */
	getCredentialDefinitionTool(): ToolDefinition<typeof ResolveCredentialDefinitionParams> {
		return {
			name: 'get-credential-definition',
			description:
				'Resolves a credential definition from the Cheqd network using its DID URL. Returns detailed information about the definition, including its schema reference and issuer details.',
			schema: ResolveCredentialDefinitionParams,
			handler: async ({ credentialDefinitionId }) => {
				const result = await this.credo.agent.modules.anoncreds.getCredentialDefinition(credentialDefinitionId);

				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(result),
						},
					],
				};
			},
		};
	}

	/**
	 * Creates and publishes a new credential definition to the cheqd network.
	 * Defines how a schema can be used to issue credentials.
	 */
	createCredentialDefinitionTool(): ToolDefinition<typeof RegisterCredentialDefinitionParams> {
		return {
			name: 'create-credential-definition',
			description:
				'Creates and publishes a new credential definition for a specific schema id as a DID Linked Resource to the cheqd network',
			schema: RegisterCredentialDefinitionParams,
			handler: async ({ credentialDefinition, options }) => {
				const result = await this.credo.agent.modules.anoncreds.registerCredentialDefinition({
					credentialDefinition,
					options,
				});

				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(result),
						},
					],
				};
			},
		};
	}
}
