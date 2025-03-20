import { CredoAgent } from '../agent.js';
import { CreateDidDocumentParams, ResolveDidDocumentParams, ToolDefinition } from '../types.js';

export class DidToolHandler {
	credo: CredoAgent;

	constructor(credo: CredoAgent) {
		this.credo = credo;
	}

	resolveDidTool(): ToolDefinition<typeof ResolveDidDocumentParams> {
		return {
			name: 'resolve-did',
			description: 'Resolve a didDocument and its metadata',
			schema: ResolveDidDocumentParams,
			handler: async ({ did }) => {
				const result = await this.credo.agent.dids.resolveDidDocument(did);

				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(result),
						},
					],
				};
			},
		};
	}

	createDidTool(): ToolDefinition<typeof CreateDidDocumentParams> {
		return {
			name: 'create-did',
			description: 'Create and publish a DID Document to cheqd network',
			schema: CreateDidDocumentParams,
			handler: async ({ network }) => {
				const result = await this.credo.agent.dids.create({
					method: 'cheqd',
					secret: {
						verificationMethod: {
							id: 'key-1', // can be a param
							type: 'Ed25519VerificationKey2020', // can be a param
						},
					},
					options: {
						network: network,
					},
				});

				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(result),
						},
					],
				};
			},
		};
	}
}
