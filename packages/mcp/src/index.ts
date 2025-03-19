import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CredoToolKit } from '@cheqd/mcp-toolkit-credo';
import * as dotenv from 'dotenv';

dotenv.config();

const port = process.env.PORT || 3000;

class AgentMcpServer {
	server: McpServer;

	constructor() {
		this.server = new McpServer({
			name: 'cheqd-vai-server',
			version: '1.0.0',
		});
	}

	async setupTools() {
		// Configure tools through env
		const requestedTools = process.env.TOOLS ? process.env.TOOLS.split(',') : [];

		const tools: any[] = [];

		// handle credo
		if (requestedTools.includes('credo')) {
			// handle env errors
			if (!(process.env.CREDO_NAME && process.env.CREDO_PORT && process.env.CREDO_CHEQD_TESTNET_MNEMONIC)) {
				throw new Error('Provide valid envs for tool: credo');
			}

			const credoToolkit = new CredoToolKit({
				port,
				name: process.env.CREDO_NAME,
				mnemonic: process.env.CREDO_CHEQD_TESTNET_MNEMONIC,
			});
			await credoToolkit.credo.initializeAgent();
			const credoTools = await credoToolkit.getTools();

			tools.push(...credoTools);
		}

		// register tools
		for (const tool of tools) {
			this.server.tool(tool.name, tool.description, tool.schema, tool.handler);
		}
	}

	async start() {
		try {
			await this.setupTools();
			const transport = new StdioServerTransport();
			await this.server.connect(transport);
		} catch (err) {
			console.error('Fatal error in start():', err);
			process.exit(1);
		}
	}
}

const agentServer = new AgentMcpServer();
agentServer.start();
