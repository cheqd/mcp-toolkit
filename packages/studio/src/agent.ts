import { IStudioToolKitOptions, CreateDidDocumentRequestType, UpdateDidDocumentRequestType, DeactivateDidDocumentRequestType, CreateDidDocumentResponseType, UpdateDidDocumentResponseType, DeactivateDidDocumentResponseType, CreateDidLinkedResourceRequestType, CreateDidLinkedResourceResponseType, IssueCredentialRequest, IssueCredentialResponseType, VerifyCredentialRequestType, CredentialStatusListCreateRequest, CredentialStatusListUpdateRequest } from './types.js';
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
				throw new Error(`Failed to update DID: ${response.statusText}`);
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
				throw new Error(`Failed to deactivate DID: ${response.statusText}`);
			}
			return await response.json();
		},

		getCreatedDids: async(params?: string): Promise<string[]> => {
			const response = await fetch(`${this.endpoint}/did/list${params}`);
			if (!response.ok) {
				throw new Error(`Failed to list DID: ${response.statusText}`);
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
				throw new Error(`Failed to create DID Linked Resource: ${response.statusText}`);
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
		create: async(body: CredentialStatusListCreateRequest) => {
			const response = await fetch(`${this.endpoint}/credential-status/create/unencrypted`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			if (!response.ok) {
				throw new Error(`Failed to create DID Linked Resource: ${response.statusText}`);
			}
			return await response.json();	
		},

		update: async(body: CredentialStatusListUpdateRequest) => {
			const response = await fetch(`${this.endpoint}/credential-status/update/unencrypted`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			if (!response.ok) {
				throw new Error(`Failed to create DID Linked Resource: ${response.statusText}`);
			}
			return await response.json();	
		},
	}


	public credentials = {

		issue: async(body: IssueCredentialRequest): Promise<IssueCredentialResponseType> => {
			const response = await fetch(`${this.endpoint}/credential/issue`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			if (!response.ok) {
				throw new Error(`Failed to issue Credential: ${response.statusText}`);
			}
			return await response.json();
		},

		verify: async(body: VerifyCredentialRequestType) => {
			const response = await fetch(`${this.endpoint}/credential/verify`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			if (!response.ok) {
				throw new Error(`Failed to issue Credential: ${response.statusText}`);
			}
			return await response.json();
		},

		getCredentialExchangeRecords: async(params?: string) => {
			const response = await fetch(`${this.endpoint}/did/list?${params}`);
			if (!response.ok) {
				throw new Error(`Failed to list DID: ${response.statusText}`);
			}
			return await response.json();
		},


		revoke: async(body) => {
			const response = await fetch(`${this.endpoint}/credential/revoke`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			if (!response.ok) {
				throw new Error(`Failed to issue Credential: ${response.statusText}`);
			}
			return await response.json();
		},

		reinstate: async(body) => {
			const response = await fetch(`${this.endpoint}/credential/reinstate`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			if (!response.ok) {
				throw new Error(`Failed to issue Credential: ${response.statusText}`);
			}
			return await response.json();
		},

		suspend: async(body) => {
			const response = await fetch(`${this.endpoint}/credential/suspend`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			if (!response.ok) {
				throw new Error(`Failed to issue Credential: ${response.statusText}`);
			}
			return await response.json();
		},
	}

	public presentations = {

		create: async() => {

		},

		verify: async() => {

		}	
	}

}

