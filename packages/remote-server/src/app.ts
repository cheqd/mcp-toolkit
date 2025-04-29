import express, { Request, Response } from 'express';
import Helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { StatusCodes } from 'http-status-codes';
import { config } from 'dotenv';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { AgentMcpServer, normalizeEnvVar } from '@cheqd/mcp-toolkit-server';

config();

class App {
	public express: express.Application;
	private server: AgentMcpServer;

	constructor() {
		this.express = express();
		this.middleware();
		this.routes();
		const tools = process.env.TOOLS ? normalizeEnvVar(process.env.TOOLS).split(',') : [];
		this.server = new AgentMcpServer({
			tools,
			credo: {
				port: parseInt(process.env.CREDO_PORT || '3000', 10),
				domain: process.env.CREDO_ENDPOINT,
				name: process.env.CREDO_NAME,
				cosmosPayerSeed: process.env.CREDO_CHEQD_TESTNET_MNEMONIC,
				trainEndpoint: process.env.TRAIN_ENDPOINT,
			},
		});
		// Initializing the server with tools
		this.server.setupTools().catch((err) => {
			console.error('Error setting up tools:', err);
			process.exit(1);
		});
	}

	private middleware() {
		this.express.use(Helmet());
		this.express.use(
			cors({
				origin: '*',
			})
		);
		this.express.use(cookieParser());
	}

	private routes() {
		const app = this.express;
		const transports: { [sessionId: string]: SSEServerTransport } = {};

		app.get('/sse', async (_req: Request, res: Response) => {
			const transport = new SSEServerTransport('/messages', res);
			transports[transport.sessionId] = transport;

			console.log('SSE session started:', transport.sessionId);

			res.on('close', () => {
				console.log('SSE session closed:', transport.sessionId);
				delete transports[transport.sessionId];
			});

			console.log('Connecting to server...');
			if (this.server) {
				await this.server.start(transport).catch((err) => {
					console.error('Unhandled error in server startup:', err);
				});
				console.log('Connected.');
			}
		});

		app.post('/messages', async (req, res) => {
			const sessionId = req.query.sessionId as string;
			const transport = transports[sessionId];

			if (transport) {
				await transport.handlePostMessage(req, res);
			} else {
				res.status(400).send('No transport found for sessionId');
			}
		});

		app.get('/status', async (_req: Request, res: Response) => {
			// Basic server information
			const status = {
				uptime: process.uptime(),
				timestamp: new Date().toISOString(),
				activeSessions: Object.keys(transports).length,
				healthy: true,
			};
			if (this.server) {
				// If the server has a getStatus method, use it
				if (typeof this.server.getStatus === 'function') {
					const serverStatus = this.server.getStatus();
					status['mcpServer'] = serverStatus;
				} else {
					const agentStatus = {
						tools: normalizeEnvVar(process.env.TOOLS).split(','),
						agent: {
							isConnected: Boolean(this.server),
						},
					};
					status['mcpServer'] = agentStatus;
				}
			}

			res.status(StatusCodes.OK).json(status);
		});
		// Handle 'Route not found' for all other requests
		app.use((_req, res) => {
			res.status(StatusCodes.NOT_FOUND).send('Route not found.');
		});
	}
}

export default new App().express;
