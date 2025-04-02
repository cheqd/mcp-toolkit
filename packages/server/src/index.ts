import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CredoToolKit } from '@cheqd/mcp-toolkit-credo';
import * as dotenv from 'dotenv';
import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { ToolDefinition } from '@cheqd/mcp-toolkit-credo/build/types.js';

dotenv.config();

/**
 * AgentMcpServer extends McpServer to provide specialized functionality
 * for the cheqd agent, including tool setup, signal handling, and proper cleanup.
 */
class AgentMcpServer extends McpServer {
	private transport: StdioServerTransport | null = null;
	private credoToolkit: CredoToolKit | null = null;

	/**
	 * Initialize the server with a name and version, and set up capabilities
	 */
	constructor() {
		super(
			{
				name: 'cheqd-mcp-toolkit-server',
				version: packageJson.version,
			},
			{
				capabilities: {
					logging: {},
					tools: {},
				},
			}
		);
		// setup signal handling
		this.setupSignalHandlers();
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

	/*
	 * Configure and initialize tools for the server based on env variables
	 */
	async setupTools(): Promise<void> {
		// Configure tools through env
		const requestedTools = process.env.TOOLS ? normalizeEnvVar(process.env.TOOLS).split(',') : [];
		const tools: ToolDefinition<any>[] = [];

		// Handle Credo Tools
		if (requestedTools.includes('credo')) {
			await this.setupCredoTools(tools);
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
		if (!process.env.CREDO_CHEQD_TESTNET_MNEMONIC) {
			throw new Error(
				'Missing required environment variables for Credo tools. Please set: CREDO_CHEQD_TESTNET_MNEMONIC'
			);
		}
		try {
			this.credoToolkit = new CredoToolKit({
				port:
					typeof process.env.CREDO_PORT === 'string'
						? parseInt(process.env.CREDO_PORT)
						: process.env.CREDO_PORT,
				name: normalizeEnvVar(process.env.CREDO_NAME),
				mnemonic: normalizeEnvVar(process.env.CREDO_CHEQD_TESTNET_MNEMONIC),
				endpoint: normalizeEnvVar(process.env.CREDO_ENDPOINT),
			});
			await this.credoToolkit.credo.initializeAgent();
			const credoTools = await this.credoToolkit.getTools();

			tools.push(...(credoTools as ToolDefinition<any>[]));
		} catch (err) {
			throw new Error(`Credo initialization failed: ${err instanceof Error ? err.message : String(err)}`);
		}
	}

	/*
	 * Start the server and connect to the specified transport
	 */
	async start(): Promise<void> {
		try {
			await this.setupTools();
			this.transport = new StdioServerTransport();
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
			if (this.credoToolkit?.credo?.agent) {
				await this.credoToolkit.credo.agent.shutdown();
				this.credoToolkit = null;
			}
			if (this.transport) {
				await this.transport.close();
				this.transport = null;
			}
			// Set a timeout to force exit if cleanup hangs
			const forceExitTimeout = setTimeout(() => {
				console.error('Forced exit after timeout');
				process.exit(1);
			}, 3000);
			forceExitTimeout.unref();
			process.exit(0);
		} catch (err) {
			console.error('Error during cleanup:', err);
			process.exit(1);
		}
	}
}

function normalizeEnvVar(value) {
	return value?.replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1');
}

// Get the module's package.json
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageJsonPath = path.join(__dirname, '../package.json');
const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf-8'));

// Create and start the server
const agentServer = new AgentMcpServer();
agentServer.start().catch((err) => {
	console.error('Unhandled error in server startup:', err);
	process.exit(1);
});
