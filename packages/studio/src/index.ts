import { StudioAgent } from './agent.js';
import {
	DidToolHandler,
} from './tools/index.js';
import { IStudioToolKitOptions } from './types.js';

/**
 * StudioToolKit provides a comprehensive set of tools for interacting with the Studio agent.
 * It bundles together various handlers for managing DIDs, credentials, connections, and anonymous credentials.
 */
export class StudioToolKit {
	studio: StudioAgent;
	/**
	 * Creates a new StudioToolKit instance with the specified configuration.
	 * @param {IStudioToolKitOptions} options - Configuration options for the toolkit
	 * @param {string} options.name - Name of the agent
	 */
	constructor({ name, apiKey }: IStudioToolKitOptions) {
		this.studio = new StudioAgent({ name, apiKey })
	}

	/// Initializes the Studio agent and prepares it for use.
	/// This method must be called before using any tools or resources.
	/// It sets up the agent's internal state and ensures that all necessary components are ready.
	async init() {
		await this.studio.initializeAgent();
	}

	/// Shuts down the Studio agent and cleans up any resources.
	/// This method should be called when the agent is no longer needed.
	async shutdown() {
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
			new DidToolHandler(this.studio).resolveDidTool(),
			new DidToolHandler(this.studio).createDidTool(),
			new DidToolHandler(this.studio).updateDidTool(),
			new DidToolHandler(this.studio).deactivateDidTool(),
			new DidToolHandler(this.studio).listDidTool(),
			new DidToolHandler(this.studio).createDIDLinkedResourceTool(),
			new DidToolHandler(this.studio).resolveDIDLinkedResourceTool(),
		];
	}
	/**
	 * Registers all resources with the MCP server
	 * @param server The MCP server instance
	 */
	registerResources(server: any) {
	}
	/**
	 * Registers all prompts with the MCP server
	 * @param server The MCP server instance
	 */
	registerPrompts(server: any) {
	}
}
