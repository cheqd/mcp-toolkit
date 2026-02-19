import { CredoAgent } from './agent.js';
import {
	DidToolHandler,
	AnonCredsToolHandler,
	ConnectionToolHandler,
	CredentialToolHandler,
	ProofToolHandler,
	TrustRegistryAgent,
} from './tools/index.js';
import { ICredoToolKitOptions, ToolDefinition } from './types.js';
import { ResourceHandler } from './resource.js';
import { PromptHandler } from './prompt.js';

export type AnyTool = ToolDefinition<any>;

/**
 * CredoToolKit provides a comprehensive set of tools for interacting with the Credo agent.
 * It bundles together various handlers for managing DIDs, credentials, connections, and anonymous credentials.
 */
export class CredoToolKit {
	credo: CredoAgent;
	trainEndpoint?: string;
	resourceHandler: ResourceHandler;
	promptHandler: PromptHandler;

	/**
	 * Creates a new CredoToolKit instance with the specified configuration.
	 * @param {ICredoToolKitOptions} options - Configuration options for the toolkit
	 * @param {number} options.port - Port number for the agent
	 * @param {string} options.name - Name of the agent
	 * @param {string} options.mnemonic - Mnemonic phrase for wallet initialization
	 * @param {string} options.endpoint - Endpoint URL for the agent
	 */
	constructor({ port, name, mnemonic, endpoint, trainEndpoint }: ICredoToolKitOptions) {
		this.credo = new CredoAgent({ port, name, mnemonic, endpoint });
		this.trainEndpoint = trainEndpoint || 'https://dev-train.trust-scheme.de/tcr/v1';
		this.resourceHandler = new ResourceHandler(this.credo);
		this.promptHandler = new PromptHandler(this.credo);
	}

	/// Initializes the Credo agent and prepares it for use.
	/// This method must be called before using any tools or resources.
	/// It sets up the agent's internal state and ensures that all necessary components are ready.
	async init() {
		await this.credo.initializeAgent();
	}

	/// Shuts down the Credo agent and cleans up any resources.
	/// This method should be called when the agent is no longer needed.
	async shutdown() {
		if (this.credo.agent) {
			await this.credo.agent.wallet.close();
			await this.credo.agent.shutdown();
		}
	}
	
	/**
	 * Returns an array of all available tools grouped by functionality:
	 * - DID Management Tools (resolve, create, update, deactivate DIDs and linked resources)
	 * - Anonymous Credentials Tools (schema and credential definition management)
	 * - Connection Management Tools (create invitations, accept connections, list and get records)
	 * - Credential Management Tools (connectionless and connection-based credential offers, list and get records)
	 *
	 * @returns {Promise<ToolDefinition[]>} Array of tool definitions
	 */
	async getTools(): Promise<AnyTool[]> {
		const tools: AnyTool[] = [
			new DidToolHandler(this.credo).resolveDidTool() as AnyTool,
			new DidToolHandler(this.credo).createDidTool() as AnyTool,
			new DidToolHandler(this.credo).updateDidTool() as AnyTool,
			new DidToolHandler(this.credo).deactivateDidTool() as AnyTool,
			new DidToolHandler(this.credo).listDidTool() as AnyTool,
			new DidToolHandler(this.credo).createDIDLinkedResourceTool() as AnyTool,
			new DidToolHandler(this.credo).resolveDIDLinkedResourceTool() as AnyTool,
			new AnonCredsToolHandler(this.credo).createSchemaTool() as AnyTool,
			new AnonCredsToolHandler(this.credo).listSchemaTool() as AnyTool,
			new AnonCredsToolHandler(this.credo).getSchemaTool() as AnyTool,
			new AnonCredsToolHandler(this.credo).createCredentialDefinitionTool() as AnyTool,
			new AnonCredsToolHandler(this.credo).listCredentialDefinitionTool() as AnyTool,
			new AnonCredsToolHandler(this.credo).getCredentialDefinitionTool() as AnyTool,
			new ConnectionToolHandler(this.credo).createConnectionInvitationTool() as AnyTool,
			new ConnectionToolHandler(this.credo).acceptConnectionInvitationTool() as AnyTool,
			new ConnectionToolHandler(this.credo).listConnections() as AnyTool,
			new ConnectionToolHandler(this.credo).getConnectionRecord() as AnyTool,
			new CredentialToolHandler(this.credo).connectionLessCredentialOfferTool() as AnyTool,
			new CredentialToolHandler(this.credo).connectionCredentialOfferTool() as AnyTool,
			new CredentialToolHandler(this.credo).acceptCredentialOfferTool() as AnyTool,
			new CredentialToolHandler(this.credo).listCredentialsTool() as AnyTool,
			new CredentialToolHandler(this.credo).getCredentialRecordTool() as AnyTool,
			new CredentialToolHandler(this.credo).listCredentialExchangeRecordsTool() as AnyTool,
			new CredentialToolHandler(this.credo).importCredentialTool() as AnyTool,
			new ProofToolHandler(this.credo).connectionlessProofRequestTool() as AnyTool,
			new ProofToolHandler(this.credo).connectionProofRequestTool() as AnyTool,
			new ProofToolHandler(this.credo).getProofRecordTool() as AnyTool,
			new ProofToolHandler(this.credo).listProofsTool() as AnyTool,
			new ProofToolHandler(this.credo).acceptProofRequestTool() as AnyTool,
		];
		if (this.trainEndpoint) {
			tools.push(new TrustRegistryAgent({ trainEndpoint: this.trainEndpoint }).verifyTrustRegistry());
		}
		return tools;
	}
	/**
	 * Registers all resources with the MCP server
	 * @param server The MCP server instance
	 */
	registerResources(server: any) {
		this.resourceHandler.registerResources(server);
	}
	/**
	 * Registers all prompts with the MCP server
	 * @param server The MCP server instance
	 */
	registerPrompts(server: any) {
		this.promptHandler.registerPrompts(server);
	}
}
