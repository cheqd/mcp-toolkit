import express, { Request, Response } from 'express';
import Helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { StatusCodes } from 'http-status-codes';
import { config } from 'dotenv';
import { AgentMcpServer, normalizeEnvVar } from '@cheqd/mcp-toolkit-server';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';
import { randomUUID } from 'node:crypto';

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
				domain: normalizeEnvVar(process.env.CREDO_ENDPOINT),
				name: normalizeEnvVar(process.env.CREDO_NAME),
				cosmosPayerSeed: normalizeEnvVar(process.env.CREDO_CHEQD_TESTNET_MNEMONIC),
				trainEndpoint: normalizeEnvVar(process.env.TRAIN_ENDPOINT),
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
		app.use(express.json());

		// Map to store transports by session ID
		const transports: { [sessionId: string]: StreamableHTTPServerTransport } = {};

		// Handle POST requests for client-to-server communication
		app.post('/mcp', async (_req: Request, res: Response) => {
			// Check for existing session ID
			const sessionId = _req.headers['mcp-session-id'] as string | undefined;
			let transport: StreamableHTTPServerTransport;
			if (sessionId && transports[sessionId]) {
				transport = transports[sessionId];
			} else if (!sessionId && isInitializeRequest(_req.body)) {
				transport = new StreamableHTTPServerTransport({
					sessionIdGenerator: () => randomUUID(),
					onsessioninitialized: (sessionId) => {
						// Store the transport by session ID
						transports[sessionId] = transport;
					},
				});
				// Clean up transport when closed
				transport.onclose = () => {
					if (transport.sessionId) {
						console.log('Session closed:', transport.sessionId);
						delete transports[transport.sessionId];
					}
				};
				console.log('Connecting to server...');
				// Connect to the MCP server
				await this.server.getStatus();
				if (this.server) {
					await this.server.start(transport).catch((err) => {
						console.error('Unhandled error in server startup:', err);
					});
					console.log('Connected.');
				}
				console.log('MCP session started');
			} else {
				// Invalid request
				res.status(400).json({
					jsonrpc: '2.0',
					error: {
						code: -32000,
						message: 'Bad Request: No valid session ID provided',
					},
					id: null,
				});
				return;
			}

			// Handle the request
			await transport.handleRequest(_req, res, _req.body);
		});
		// Reusable handler for GET and DELETE requests
		const handleSessionRequest = async (req: express.Request, res: express.Response) => {
			const sessionId = req.headers['mcp-session-id'] as string | undefined;
			if (!sessionId || !transports[sessionId]) {
				res.status(400).send('Invalid or missing session ID');
				return;
			}

			const transport = transports[sessionId];
			await transport.handleRequest(req, res);
		};
		// Handle GET requests for server-to-client notifications via SSE
		app.get('/mcp', handleSessionRequest);

		// Handle DELETE requests for session termination
		app.delete('/mcp', handleSessionRequest);

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
