import type { InitConfig } from '@credo-ts/core';

import {
	Agent,
	AutoAcceptCredential,
	AutoAcceptProof,
	ConnectionsModule,
	CredentialsModule,
	DidsModule,
	DifPresentationExchangeProofFormatService,
	HttpOutboundTransport,
	JsonLdCredentialFormatService,
	ProofsModule,
	V2CredentialProtocol,
	V2ProofProtocol,
	W3cCredentialsModule,
} from '@credo-ts/core';
import { AskarModule } from '@credo-ts/askar';
import { HttpInboundTransport, agentDependencies } from '@credo-ts/node';
import {
	CheqdAnonCredsRegistry,
	CheqdDidRegistrar,
	CheqdDidResolver,
	CheqdModule,
	CheqdModuleConfig,
} from '@credo-ts/cheqd';
import { AnonCredsCredentialFormatService, AnonCredsModule, AnonCredsProofFormatService } from '@credo-ts/anoncreds';
import { ariesAskar } from '@hyperledger/aries-askar-nodejs';
import { anoncreds } from '@hyperledger/anoncreds-nodejs';
import { ICredoToolKitOptions } from './types.js';
import * as net from 'net';

export class CredoAgent {
	public port: number;
	public name: string;
	public domain: string;
	public config: InitConfig;
	public agent: Agent<ReturnType<typeof getAskarAnonCredsModules>>;

	public constructor({ port, name, mnemonic, endpoint }: ICredoToolKitOptions) {
		this.name = name;
		this.port = typeof port === 'string' ? parseInt(port) : port;
		this.domain = endpoint || `http://localhost:${port}`;

		const config = {
			label: name,
			walletConfig: {
				id: name,
				key: name, // can be a separate param
			},
			endpoints: [this.domain],
		} satisfies InitConfig;

		this.config = config;

		this.agent = new Agent({
			config,
			dependencies: agentDependencies,
			modules: getAskarAnonCredsModules(mnemonic),
		});

		this.agent.registerOutboundTransport(new HttpOutboundTransport());
	}

	/**
	 * Initialize the agent with random wait and port availability check
	 */
	public async initializeAgent() {
		// TODO: Remove this block when remote execution is supported
		// START: Remove block
		// Random wait between 0-7 seconds to avoid port conflicts when multiple instances start simultaneously
		// Current limitation with Claude Desktop: Always two instances start simultaneously
		const waitTime = Math.floor(Math.random() * 7000);
		console.error(`Waiting ${waitTime}ms before initializing agent...`);
		await new Promise((resolve) => setTimeout(resolve, waitTime));
		// Check if port is available
		const isPortAvailable = await this.checkPortAvailability(this.port);
		if (!isPortAvailable) {
			console.error(`Port ${this.port} is already in use. This instance will exit gracefully.`);
			return; // Don't exit immediately to allow proper cleanup in the server class
		}
		// END: Remove block

		try {
			const transport = new HttpInboundTransport({ port: this.port });
			this.agent.registerInboundTransport(transport);
			await this.agent.initialize();
		} catch (err) {
			const e = err as Error;
			console.error(`Error initializing agent: ${e.message}`);
			throw err;
		}
	}

	/**
	 * Check if a port is available
	 */
	private async checkPortAvailability(port: number): Promise<boolean> {
		return new Promise((resolve) => {
			const tester = net
				.createServer()
				.once('error', () => {
					// Port is in use
					resolve(false);
				})
				.once('listening', () => {
					// Port is available
					tester.once('close', () => resolve(true)).close();
				})
				.listen(port, '0.0.0.0');
		});
	}
}

function getAskarAnonCredsModules(mnemonic: string) {
	return {
		connections: new ConnectionsModule({
			autoAcceptConnections: true,
		}),
		anoncreds: new AnonCredsModule({
			registries: [new CheqdAnonCredsRegistry()],
			anoncreds,
		}),
		cheqd: new CheqdModule(
			new CheqdModuleConfig({
				networks: [
					{
						network: 'testnet',
						cosmosPayerSeed: mnemonic,
					},
				],
			})
		),
		credentials: new CredentialsModule({
			autoAcceptCredentials: AutoAcceptCredential.Always,
			credentialProtocols: [
				new V2CredentialProtocol({
					credentialFormats: [new AnonCredsCredentialFormatService(), new JsonLdCredentialFormatService()],
				}),
			],
		}),
		w3cCredentials: new W3cCredentialsModule(),
		proofs: new ProofsModule({
			autoAcceptProofs: AutoAcceptProof.Always,
			proofProtocols: [
				new V2ProofProtocol({
					proofFormats: [new AnonCredsProofFormatService(), new DifPresentationExchangeProofFormatService()],
				}),
			],
		}),
		dids: new DidsModule({
			resolvers: [new CheqdDidResolver()],
			registrars: [new CheqdDidRegistrar()],
		}),
		askar: new AskarModule({
			ariesAskar,
		}),
	} as const;
}
