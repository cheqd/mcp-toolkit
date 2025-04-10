import { CredoAgent } from './agent.js';
import {
	DidToolHandler,
	AnonCredsToolHandler,
	ConnectionToolHandler,
	CredentialToolHandler,
	ProofToolHandler,
} from './tools/index.js';
import { ICredoToolKitOptions } from './types.js';

/**
 * CredoToolKit provides a comprehensive set of tools for interacting with the Credo agent.
 * It bundles together various handlers for managing DIDs, credentials, connections, and anonymous credentials.
 */
export class CredoToolKit {
	credo: CredoAgent;

	/**
	 * Creates a new CredoToolKit instance with the specified configuration.
	 * @param {ICredoToolKitOptions} options - Configuration options for the toolkit
	 * @param {number} options.port - Port number for the agent
	 * @param {string} options.name - Name of the agent
	 * @param {string} options.mnemonic - Mnemonic phrase for wallet initialization
	 * @param {string} options.endpoint - Endpoint URL for the agent
	 */
	constructor({ port, name, mnemonic, endpoint }: ICredoToolKitOptions) {
		this.credo = new CredoAgent({ port, name, mnemonic, endpoint });
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
	async getTools() {
		return [
			new DidToolHandler(this.credo).resolveDidTool(),
			new DidToolHandler(this.credo).createDidTool(),
			new DidToolHandler(this.credo).updateDidTool(),
			new DidToolHandler(this.credo).deactivateDidTool(),
			new DidToolHandler(this.credo).listDidTool(),
			new DidToolHandler(this.credo).createDIDLinkedResourceTool(),
			new DidToolHandler(this.credo).resolveDIDLinkedResourceTool(),
			new AnonCredsToolHandler(this.credo).createSchemaTool(),
			new AnonCredsToolHandler(this.credo).listSchemaTool(),
			new AnonCredsToolHandler(this.credo).getSchemaTool(),
			new AnonCredsToolHandler(this.credo).createCredentialDefinitionTool(),
			new AnonCredsToolHandler(this.credo).listCredentialDefinitionTool(),
			new AnonCredsToolHandler(this.credo).getCredentialDefinitionTool(),
			new ConnectionToolHandler(this.credo).createConnectionInvitationTool(),
			new ConnectionToolHandler(this.credo).acceptConnectionInvitationTool(),
			new ConnectionToolHandler(this.credo).listConnections(),
			new ConnectionToolHandler(this.credo).getConnectionRecord(),
			new CredentialToolHandler(this.credo).connectionLessCredentialOfferTool(),
			new CredentialToolHandler(this.credo).connectionCredentialOfferTool(),
			new CredentialToolHandler(this.credo).acceptCredentialOfferTool(),
			new CredentialToolHandler(this.credo).listCredentialsTool(),
			new CredentialToolHandler(this.credo).getCredentialRecordTool(),
			new CredentialToolHandler(this.credo).listCredentialExchangeRecordsTool(),
			new CredentialToolHandler(this.credo).importCredentialTool(),
			new ProofToolHandler(this.credo).connectionlessProofRequestTool(),
			new ProofToolHandler(this.credo).connectionProofRequestTool(),
			new ProofToolHandler(this.credo).getProofRecordTool(),
			new ProofToolHandler(this.credo).listProofsTool(),
			new ProofToolHandler(this.credo).acceptProofRequestTool(),
		];
	}
}
