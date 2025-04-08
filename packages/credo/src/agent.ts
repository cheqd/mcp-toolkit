import type { InitConfig } from '@credo-ts/core';

import {
	Agent,
	AutoAcceptCredential,
	AutoAcceptProof,
	ConnectionsModule,
	CredentialsModule,
	DidsModule,
	HttpOutboundTransport,
	ProofsModule,
	V2CredentialProtocol,
	V2ProofProtocol,
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
					credentialFormats: [new AnonCredsCredentialFormatService()],
				}),
			],
		}),
		proofs: new ProofsModule({
			autoAcceptProofs: AutoAcceptProof.Always,
			proofProtocols: [
				new V2ProofProtocol({
					proofFormats: [new AnonCredsProofFormatService()],
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
