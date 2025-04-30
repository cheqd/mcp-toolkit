import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { CredoToolKit } from '@cheqd/mcp-toolkit-credo';
import { ToolDefinition } from '@cheqd/mcp-toolkit-credo/build/types.js';
import { IAgentMCPServerOptions } from './types/index.js';
import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the module's package.json
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageJsonPath = path.join(__dirname, '../package.json');
const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf-8'));
/**
 * AgentMcpServer extends McpServer to provide specialized functionality
 * for the cheqd agent, including tool setup, signal handling, and proper cleanup.
 */
export class AgentMcpServer extends McpServer {
	private transport: StdioServerTransport | SSEServerTransport | null = null;
	private credoToolkit: CredoToolKit | null = null;
	private options: IAgentMCPServerOptions;

	/**
	 * Initialize the server with a name and version, and set up capabilities
	 */
	constructor(options: IAgentMCPServerOptions) {
		super(
			{
				name: 'cheqd-mcp-toolkit-server',
				version: packageJson.version,
			},
			{
				capabilities: {
					logging: {},
					tools: {},
					resources: {},
					prompts: {},
				},
			}
		);
		// setup signal handling
		this.setupSignalHandlers();
		this.options = options;
	}

	/**
	 * Setup signal handlers for proper cleanup
	 */
	private setupSignalHandlers(): void {
		// Handle termination signals
		process.on('SIGINT', this.cleanup.bind(this));
		process.on('SIGTERM', this.cleanup.bind(this));
		process.on('disconnect', this.cleanup.bind(this));

		// Handle stdin/stdout closing
		process.stdin.on('close', this.cleanup.bind(this));
		process.stdout.on('close', this.cleanup.bind(this));
		process.stdin.on('error', () => this.cleanup());
	}

	/**
	 * Get the current status of the MCP server and its tools
	 * @returns A status object with information about the server and agent
	 */
	public getStatus(): Record<string, any> {
		try {
			// Basic Agent server information
			const status: Record<string, any> = {
				name: 'cheqd-mcp-toolkit-server',
				version: packageJson.version,
				uptime: process.uptime(),
				timestamp: new Date().toISOString(),
				tools: this.options.tools,
				healthy: true,
			};

			// Add Credo agent status
			if (this.credoToolkit?.credo) {
				const credo = this.credoToolkit.credo;
				status.credoAgent = {
					name: credo.name,
					isInitialized: credo.agent?.isInitialized || false,
					domain: credo.domain,
					port: credo.port,
				};

				// Add connection information if the agent is initialized
				try {
					if (credo.agent?.isInitialized) {
						status.credoAgent.walletId = credo.config.walletConfig?.id;

						// Add credo agent stats
						status.credoAgent.stats = {
							uptime: process.uptime(),
							services: this.transport ? 'connected' : 'disconnected',
						};
					}
				} catch (error) {
					status.credoAgent.error = `Error getting detailed agent stats: ${error instanceof Error ? error.message : String(error)}`;
				}
			}

			return status;
		} catch (error) {
			return {
				healthy: false,
				error: `Failed to retrieve server status: ${error instanceof Error ? error.message : String(error)}`,
			};
		}
	}

	/*
	 * Configure and initialize tools, resources and prompts for the server based on env variables
	 */
	async setupTools(): Promise<void> {
		// Configure tools through env
		const tools: ToolDefinition<any>[] = [];

		// Handle Credo Tools
		if (this.options.tools.includes('credo')) {
			await this.setupCredoTools(tools);
			if (this.credoToolkit) {
				this.credoToolkit.registerResources(this);
				this.credoToolkit.registerPrompts(this);
			}
		}

		// Register all tools with the server
		for (const tool of tools) {
			this.tool(tool.name, tool.description, tool.schema, tool.handler);
		}
	}

	/**
	 * Set up Credo-specific tools
	 */
	private async setupCredoTools(tools: ToolDefinition<any>[]): Promise<void> {
		// Validate required env variables
		if (!this.options.credo?.cosmosPayerSeed) {
			throw new Error(
				'Missing required environment variables for Credo tools. Please set: CREDO_CHEQD_TESTNET_MNEMONIC'
			);
		}
		try {
			this.credoToolkit = new CredoToolKit({
				port: this.options.credo.port,
				name: this.options.credo.name,
				mnemonic: this.options.credo.cosmosPayerSeed,
				endpoint: this.options.credo.domain,
			});
			await this.credoToolkit.init();
			const credoTools = await this.credoToolkit.getTools();

			tools.push(...(credoTools as ToolDefinition<any>[]));
		} catch (err) {
			throw new Error(`Credo initialization failed: ${err instanceof Error ? err.message : String(err)}`);
		}
	}

	/*
	 * Start the server and connect to the specified transport
	 */
	async start(transport?: StdioServerTransport | SSEServerTransport): Promise<void> {
		try {
			this.transport = transport || new StdioServerTransport();
			await this.connect(this.transport);
			// Send logging notification to client
			await this.server.sendLoggingMessage({
				level: 'debug',
				data: 'Cheqd MCP Toolkit Server started successfully',
			});
		} catch (err) {
			console.error('Fatal error in start():', err);
			process.exit(1);
		}
	}

	/**
	 * Gracefully cleanup the server
	 */
	async cleanup(): Promise<void> {
		console.error('Shutdown signal received, cleaning up server...');
		try {
			const { credoToolkit, transport } = this;

			// Shutdown the agent if available
			if (credoToolkit) {
				await credoToolkit.shutdown();
			}

			// Close transport if it's a StdioServerTransport
			if (transport instanceof StdioServerTransport) {
				await transport.close();
				this.transport = null;
				// Clear references after shutdown
				this.credoToolkit = null;
			}

			// Force exit after 3 seconds if cleanup hangs
			const forceExitTimeout = setTimeout(() => {
				console.error('Forced exit after timeout');
				process.exit(1);
			}, 3000);
			forceExitTimeout.unref();

			// Exit cleanly if transport was of the expected type
			if (transport instanceof StdioServerTransport) {
				process.exit(0);
			}
		} catch (err) {
			console.error('Error during cleanup:', err);
			process.exit(1);
		}
	}
}

// Export other modules
export * from './utils.js';
export * from './types/index.js';
