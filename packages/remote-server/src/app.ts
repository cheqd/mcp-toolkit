import express, { Request, Response } from 'express';
import Helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { StatusCodes } from 'http-status-codes';
import { config } from 'dotenv';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { AgentMcpServer } from '@cheqd/mcp-toolkit-server';

config();

class App {
	public express: express.Application;
	private server: AgentMcpServer;

	constructor() {
		this.express = express();
		this.middleware();
		this.routes();
		const tools = ['credo'];
		this.server = new AgentMcpServer({
			tools,
			version: '1.0.0',
			credo: {
				port: parseInt(process.env.CREDO_PORT || '3000', 10),
				domain: process.env.CREDO_DOMAIN,
				name: process.env.CREDO_NAME,
				cosmosPayerSeed: process.env.CREDO_CHEQD_TESTNET_MNEMONIC,
			},
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
				console.log(' SSE session closed:', transport.sessionId);
				delete transports[transport.sessionId];
			});

            console.log('Connecting to server...');
			await this.server.start(transport).catch((err) => {
                console.error('Unhandled error in server startup:', err);
            });
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

		// 404 for all other requests
		app.all('*', (_req: Request, res: Response) => res.status(StatusCodes.BAD_REQUEST).send('Bad request'));
	}
}

export default new App().express;
