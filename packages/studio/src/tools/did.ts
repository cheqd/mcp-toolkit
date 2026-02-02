import { StudioAgent } from '../agent.js';
import {
	CreateDidDocumentParams,
	CreateDidLinkedResourceParams,
	DeactivateDidDocumentParams,
	ResolveDidDocumentParams,
	ResolveDidLinkedResourceParams,
	ToolDefinition,
	UpdateDidDocumentParams,
} from '../types.js';

/**
 * Handler class for managing Decentralized Identifiers (DIDs) in the Credo agent.
 * Provides tools for creating, updating, deactivating, and resolving DIDs on the cheqd network.
 */
export class DidToolHandler {
	studio: StudioAgent;

	constructor(studio: StudioAgent) {
		this.studio = studio;
	}

	/**
	 * Resolves a DID document and its metadata from the cheqd network.
	 * Returns the complete DID document with all its components.
	 */
	resolveDidTool(): ToolDefinition<typeof ResolveDidDocumentParams> {
		return {
			name: 'resolve-did',
			description:
				'Resolves a DID document and its associated metadata from the cheqd network. Returns the complete DID document including verification methods, services, and other components.',
			schema: ResolveDidDocumentParams,
			handler: async ({ did }) => {
				const result = await this.studio.dids.resolveDidDocument(did);

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

	/**
	 * Creates and publishes a new DID document to the cheqd network.
	 * Generates a new DID with specified verification methods and services.
	 */
	createDidTool(): ToolDefinition<typeof CreateDidDocumentParams> {
		return {
			name: 'create-did',
			description:
				'Creates and publishes a new DID document to the specified cheqd network (testnet or mainnet). Generates a new DID with default verification methods and returns the complete DID document.',
			schema: CreateDidDocumentParams,
			handler: async (body) => {
				const result = await this.studio.dids.create(body);
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

	/**
	 * Updates an existing DID document on the cheqd network.
	 * Modifies the DID document while maintaining its core identifier.
	 */
	updateDidTool(): ToolDefinition<typeof UpdateDidDocumentParams> {
		return {
			name: 'update-did',
			description:
				"Updates an existing DID document on the cheqd network. Allows modification of verification methods, services, and other components while maintaining the DID's core identifier.",
			schema: UpdateDidDocumentParams,
			handler: async (body) => {
				const result = await this.studio.dids.update(body);

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

	/**
	 * Deactivates a DID document on the cheqd network.
	 * Permanently marks the DID as inactive.
	 */
	deactivateDidTool(): ToolDefinition<typeof DeactivateDidDocumentParams> {
		return {
			name: 'deactivate-did',
			description:
				'Deactivates a DID document on the cheqd network. Permanently marks the DID as inactive, preventing any further updates or usage.',
			schema: DeactivateDidDocumentParams,
			handler: async ({ did }) => {
				const result = await this.studio.dids.deactivate({ did });

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

	listDidTool(): ToolDefinition<{}> {
		return {
			name: 'list-did',
			description: 'List the DIDs from the wallet',
			schema: {},
			handler: async () => {
				const result = await this.studio.dids.getCreatedDids();

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

	/**
	 * Resolves a DID-linked resource from the cheqd network.
	 * Retrieves a specific resource associated with a DID.
	 */
	resolveDIDLinkedResourceTool(): ToolDefinition<typeof ResolveDidLinkedResourceParams> {
		return {
			name: 'resolve-did-linked-resource',
			description:
				'Resolves a specific resource linked to a DID on the cheqd network. Returns the resource data and its associated metadata.',
			schema: ResolveDidLinkedResourceParams,
			handler: async ({ didUrl }) => {
				const result = await this.studio.resources.resolveResource(didUrl);

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

	/**
	 * Creates and publishes a DID-linked resource to the cheqd network.
	 * Associates a new resource with an existing DID.
	 */
	createDIDLinkedResourceTool(): ToolDefinition<typeof CreateDidLinkedResourceParams> {
		return {
			name: 'create-did-linked-resource',
			description:
				'Creates and publishes a new resource linked to an existing DID on the cheqd network. Associates the resource with the DID and makes it available for resolution.',
			schema: CreateDidLinkedResourceParams,
			handler: async (body) => {
				const result = await this.studio.resources.createResource(body);

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
