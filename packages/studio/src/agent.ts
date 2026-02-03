import { IStudioToolKitOptions, CreateDidDocumentRequestType, UpdateDidDocumentRequestType, DeactivateDidDocumentRequestType, CreateDidDocumentResponseType, UpdateDidDocumentResponseType, DeactivateDidDocumentResponseType, CreateDidLinkedResourceRequestType, CreateDidLinkedResourceResponseType, IssueCredentialRequest, IssueCredentialResponseType, VerifyCredentialRequestType, CredentialStatusListCreateRequest, CredentialStatusListUpdateRequest } from './types.js';

// Generic API response wrapper used across StudioAgent methods
export type ApiResponse<T> = {
	success: boolean;
	error?: string;
	status?: number;
	data?: T;
};

export class StudioAgent {
	public name?: string;
	public endpoint: string;
	private apiKey: string;

	public constructor({ name, apiKey, apiEndpoint }: IStudioToolKitOptions) {
		this.name = name;
		this.apiKey = apiKey
		this.endpoint = apiEndpoint || 'https://studio-api-staging.cheqd.net';
	}

	/**
	 * Initialize the agent if needed
	 */
	public async initializeAgent() {}

	public dids = {
		resolveDidDocument: async (did: string): Promise<ApiResponse<any>> => {
			try {
				const res = await fetch(`${this.endpoint}/did/search/${did}`, { headers: { 'x-api-key': this.apiKey } });
				if (!res.ok) {
					return { success: false, status: res.status, error: res.statusText };
				}
				const json = await res.json().catch((e) => undefined);
				return { success: true, status: res.status, data: json };
			} catch (err: any) {
				return { success: false, error: err?.message ?? String(err) };
			}
		},

		create: async(body: CreateDidDocumentRequestType): Promise<ApiResponse<CreateDidDocumentResponseType>> => {
			try {
				const res = await fetch(`${this.endpoint}/did/create`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json', 'x-api-key': this.apiKey },
					body: JSON.stringify(body)
				});
				if (!res.ok) {
					return { success: false, status: res.status, error: res.statusText };
				}
				const json = await res.json().catch((e) => undefined);
				return { success: true, status: res.status, data: json };
			} catch (err: any) {
				return { success: false, error: err?.message ?? String(err) };
			}
		},

		update: async(body: UpdateDidDocumentRequestType): Promise<ApiResponse<UpdateDidDocumentResponseType>> => {
			try {
				const res = await fetch(`${this.endpoint}/did/update`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json', 'x-api-key': this.apiKey },
					body: JSON.stringify(body)
				});
				if (!res.ok) {
					return { success: false, status: res.status, error: res.statusText };
				}
				const json = await res.json().catch((e) => undefined);
				return { success: true, status: res.status, data: json };
			} catch (err: any) {
				return { success: false, error: err?.message ?? String(err) };
			}
		},

		deactivate: async(body: DeactivateDidDocumentRequestType): Promise<ApiResponse<DeactivateDidDocumentResponseType>> => {
			try {
				const res = await fetch(`${this.endpoint}/did/deactivate`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json', 'x-api-key': this.apiKey },
					body: JSON.stringify(body)
				});
				if (!res.ok) {
					return { success: false, status: res.status, error: res.statusText };
				}
				const json = await res.json().catch((e) => undefined);
				return { success: true, status: res.status, data: json };
			} catch (err: any) {
				return { success: false, error: err?.message ?? String(err) };
			}
		},

		getCreatedDids: async(params?: string): Promise<ApiResponse<string[]>> => {
			try {
				const res = await fetch(`${this.endpoint}/did/list?${params}`, { headers: { 'x-api-key': this.apiKey } });
				if (!res.ok) {
					return { success: false, status: res.status, error: res.statusText };
				}
				const json = await res.json().catch((e) => undefined);
				return { success: true, status: res.status, data: json };
			} catch (err: any) {
				return { success: false, error: err?.message ?? String(err) };
			}
		}
	};

	public resources = {
		createResource: async(body: CreateDidLinkedResourceRequestType): Promise<ApiResponse<CreateDidLinkedResourceResponseType>> => {
			try {
				const res = await fetch(`${this.endpoint}/resource/create/${body.did}`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json', 'x-api-key': this.apiKey },
					body: JSON.stringify(body)
				});
				if (!res.ok) {
					return { success: false, status: res.status, error: res.statusText };
				}
				const json = await res.json().catch((e) => undefined);
				return { success: true, status: res.status, data: json };
			} catch (err: any) {
				return { success: false, error: err?.message ?? String(err) };
			}
		},

		resolveResource: async (didUrl: string): Promise<ApiResponse<Uint8Array<ArrayBuffer>>> => {
			try {
				const res = await fetch(`${this.endpoint}/resource/search/${didUrl}`, { headers: { 'x-api-key': this.apiKey } });
				if (!res.ok) {
					return { success: false, status: res.status, error: res.statusText };
				}
				const buf = await res.bytes();
				return { success: true, status: res.status, data: buf };
			} catch (err: any) {
				return { success: false, error: err?.message ?? String(err) };
			}
		},
	}


	public statusList = {
		create: async(body: CredentialStatusListCreateRequest): Promise<ApiResponse<any>> => {
			try {
				const res = await fetch(`${this.endpoint}/credential-status/create/unencrypted`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json', 'x-api-key': this.apiKey },
					body: JSON.stringify(body)
				});
				if (!res.ok) {
					return { success: false, status: res.status, error: res.statusText };
				}
				const json = await res.json().catch((e) => undefined);
				return { success: true, status: res.status, data: json };
			} catch (err: any) {
				return { success: false, error: err?.message ?? String(err) };
			}
		},

		update: async(body: CredentialStatusListUpdateRequest): Promise<ApiResponse<any>> => {
			try {
				const res = await fetch(`${this.endpoint}/credential-status/update/unencrypted`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json', 'x-api-key': this.apiKey },
					body: JSON.stringify(body)
				});
				if (!res.ok) {
					return { success: false, status: res.status, error: res.statusText };
				}
				const json = await res.json().catch((e) => undefined);
				return { success: true, status: res.status, data: json };
			} catch (err: any) {
				return { success: false, error: err?.message ?? String(err) };
			}
		},
	}


	public credentials = {

		issue: async(body: IssueCredentialRequest): Promise<ApiResponse<IssueCredentialResponseType>> => {
			try {
				const res = await fetch(`${this.endpoint}/credential/issue`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json', 'x-api-key': this.apiKey },
					body: JSON.stringify(body)
				});
				if (!res.ok) {
					return { success: false, status: res.status, error: res.statusText };
				}
				const json = await res.json().catch((e) => undefined);
				return { success: true, status: res.status, data: json };
			} catch (err: any) {
				return { success: false, error: err?.message ?? String(err) };
			}
		},

		verify: async(body: VerifyCredentialRequestType): Promise<ApiResponse<any>> => {
			try {
				const res = await fetch(`${this.endpoint}/credential/verify`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json', 'x-api-key': this.apiKey },
					body: JSON.stringify(body)
				});
				if (!res.ok) {
					return { success: false, status: res.status, error: res.statusText };
				}
				const json = await res.json().catch((e) => undefined);
				return { success: true, status: res.status, data: json };
			} catch (err: any) {
				return { success: false, error: err?.message ?? String(err) };
			}
		},

		getCredentialExchangeRecords: async(params?: string): Promise<ApiResponse<any>> => {
			try {
				const res = await fetch(`${this.endpoint}/did/list?${params}`, { headers: { 'x-api-key': this.apiKey } });
				if (!res.ok) {
					return { success: false, status: res.status, error: res.statusText };
				}
				const json = await res.json().catch((e) => undefined);
				return { success: true, status: res.status, data: json };
			} catch (err: any) {
				return { success: false, error: err?.message ?? String(err) };
			}
		},


		revoke: async(body) => {
			try {
				const res = await fetch(`${this.endpoint}/credential/revoke`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json', 'x-api-key': this.apiKey },
					body: JSON.stringify(body)
				});
				if (!res.ok) {
					return { success: false, status: res.status, error: res.statusText };
				}
				const json = await res.json().catch((e) => undefined);
				return { success: true, status: res.status, data: json };
			} catch (err: any) {
				return { success: false, error: err?.message ?? String(err) };
			}
		},

		reinstate: async(body) => {
			try {
				const res = await fetch(`${this.endpoint}/credential/reinstate`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json', 'x-api-key': this.apiKey },
					body: JSON.stringify(body)
				});
				if (!res.ok) {
					return { success: false, status: res.status, error: res.statusText };
				}
				const json = await res.json().catch((e) => undefined);
				return { success: true, status: res.status, data: json };
			} catch (err: any) {
				return { success: false, error: err?.message ?? String(err) };
			}
		},

		suspend: async(body) => {
			try {
				const res = await fetch(`${this.endpoint}/credential/suspend`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json', 'x-api-key': this.apiKey },
					body: JSON.stringify(body)
				});
				if (!res.ok) {

					return { success: false, status: res.status, error: res.statusText };
				}
				const json = await res.json().catch((e) => undefined);
				return { success: true, status: res.status, data: json };
			} catch (err: any) {
				return { success: false, error: err?.message ?? String(err) };
			}
		},
	}

	public presentations = {

		create: async() => {

		},

		verify: async() => {

		}	
	}

}

