import { IStudioToolKitOptions, CreateDidDocumentResponse, UpdateDidDocumentParams, UpdateDidDocumentResponse, DeactivateDidDocumentParams, CreateDidDocumentRequestType, UpdateDidDocumentRequestType, DeactivateDidDocumentRequestType, CreateDidDocumentResponseType, UpdateDidDocumentResponseType, DeactivateDidDocumentResponseType, CreateDidLinkedResourceRequestType, CreateDidLinkedResourceResponseType } from './types.js';
import { z } from 'zod'

export class StudioAgent {
	public name: string;
	public endpoint: string;

	public constructor({ name }: IStudioToolKitOptions) {
		this.name = name;

		if(!process.env.STUDIO_API_ENDPOINT) {
			throw new Error("Studio Endpoint Not initialized")
		}

		this.endpoint = process.env.STUDIO_API_ENDPOINT;
	}

	/**
	 * Initialize the agent if needed
	 */
	public async initializeAgent() {}

	public dids = {
		resolveDidDocument: async (did: string) => {
			const response = await fetch(`${this.endpoint}/did/search/${did}`);
			if (!response.ok) {
				throw new Error(`Failed to resolve DID: ${response.statusText}`);
			}
			return await response.json();
		},

		create: async(body: CreateDidDocumentRequestType): Promise<CreateDidDocumentResponseType> => {
			const response = await fetch(`${this.endpoint}/did/create`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			if (!response.ok) {
				throw new Error(`Failed to create DID: ${response.statusText}`);
			}
			return await response.json();
		},

		update: async(body: UpdateDidDocumentRequestType): Promise<UpdateDidDocumentResponseType> => {
			const response = await fetch(`${this.endpoint}/did/update`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			if (!response.ok) {
				throw new Error(`Failed to create DID: ${response.statusText}`);
			}
			return await response.json();
		},

		deactivate: async(body: DeactivateDidDocumentRequestType): Promise<DeactivateDidDocumentResponseType> => {
			const response = await fetch(`${this.endpoint}/did/deactivate`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			if (!response.ok) {
				throw new Error(`Failed to create DID: ${response.statusText}`);
			}
			return await response.json();
		},

		getCreatedDids: async(): Promise<string[]> => {
			const response = await fetch(`${this.endpoint}/did/list`);
			if (!response.ok) {
				throw new Error(`Failed to resolve DID: ${response.statusText}`);
			}
			return await response.json();	
		}
	};

	public resources = {
		createResource: async(body: CreateDidLinkedResourceRequestType): Promise<CreateDidLinkedResourceResponseType> => {
			const response = await fetch(`${this.endpoint}/resource/create`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			if (!response.ok) {
				throw new Error(`Failed to create DID: ${response.statusText}`);
			}
			return await response.json();
		},

		resolveResource: async (didUrl: string) => {
			const response = await fetch(`${this.endpoint}/resource/search/${didUrl}`);
			if (!response.ok) {
				throw new Error(`Failed to resolve DID: ${response.statusText}`);
			}
			return await response.json();
		},
	}


	public statusList = {
		create: async() => {

		},

		update: async() => {

		}
	}


	public credentials = {

		issue: async() => {

		},

		verify: async() => {

		}	
	}

	public presentations = {

		create: async() => {

		},

		verify: async() => {

		}	
	}

}

