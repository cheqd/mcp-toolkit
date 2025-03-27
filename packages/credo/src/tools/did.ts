import { CredoAgent } from '../agent.js';
import {
	CreateDidDocumentParams,
	CreateDidLinkedResourceParams,
	DeactivateDidDocumentParams,
	ResolveDidDocumentParams,
	ToolDefinition,
	UpdateDidDocumentParams,
} from '../types.js';

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

	updateDidTool(): ToolDefinition<typeof UpdateDidDocumentParams> {
		return {
			name: 'create-did',
			description: 'Create and publish a DID Document to cheqd network',
			schema: UpdateDidDocumentParams,
			handler: async ({ did, didDocument }) => {
				const result = await this.credo.agent.dids.update({
					did,
					didDocument,
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

	deactivateDidTool(): ToolDefinition<typeof DeactivateDidDocumentParams> {
		return {
			name: 'create-did',
			description: 'Create and publish a DID Document to cheqd network',
			schema: UpdateDidDocumentParams,
			handler: async ({ did }) => {
				const result = await this.credo.agent.dids.deactivate({ did });

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

	resolveeDIDLinkedResourceTool(): ToolDefinition<typeof ResolveDidDocumentParams> {
		return {
			name: 'resolve-did-linked-resource',
			description: 'Resolve a DID Linked Resource to cheqd network',
			schema: ResolveDidDocumentParams,
			handler: async ({ did }) => {
				const result = await this.credo.agent.modules.cheqd.resolveResource(did);

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

	createDIDLinkedResourceTool(): ToolDefinition<typeof CreateDidLinkedResourceParams> {
		return {
			name: 'create-did-linked-resource',
			description: 'Create and publish a DID Linked Resource to cheqd network',
			schema: CreateDidLinkedResourceParams,
			handler: async ({ did, ...params }) => {
				const result = await this.credo.agent.modules.cheqd.createResource(did, params);

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
