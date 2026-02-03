import { ToolCallback } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z, ZodRawShape } from 'zod';

/**
 * Base interface for tool definitions in the Studio toolkit.
 * Defines the structure for all tools with their name, description, schema, and handler.
 */
export interface ToolDefinition<Args extends ZodRawShape> {
	readonly name: string;
	readonly description: string;
	readonly schema: Args;
	handler: ToolCallback<Args>;
}

/**
 * Configuration options for initializing the Studio toolkit.
 */
export interface IStudioToolKitOptions {
	name?: string;
	apiKey: string;
	apiEndpoint: string;
}

/**
 * Schema for validating cheqd Decentralized Identifiers (DIDs).
 * Must start with 'did:cheqd:' followed by network and unique identifier.
 */
const DID = z
	.string()
	.startsWith('did:cheqd:')
	.describe(
		'A cheqd Decentralized Identifier (DID) in the format: did:cheqd:testnet:4769f00d-0af4-472b-aab7-019abbbb8009'
	);

/**
 * Schema for validating DID URLs that point to resources.
 * Must be a valid cheqd DID followed by '/resources/'.
 */
export const DID_URL = z.string().startsWith('did:cheqd:').includes('/resources/');

// DID Document Management Parameters
export const CreateDidDocumentParams = {
	network: z
		.enum(['testnet', 'mainnet'])
		.describe('The cheqd network to publish the DID document (testnet or mainnet)'),
    identifierFormatType: z.enum(['uuid', 'base58btc']).optional().default('uuid').describe('Algorithm for generating the method-specific ID'),
    verificationMethodType: z.enum(['Ed25519VerificationKey2018', 'JsonWebKey2020', 'Ed25519VerificationKey2020']).optional().default('Ed25519VerificationKey2020').describe('Type of verification method for the DID'),
};

/**
 * JSON Web Key schema for cryptographic keys
 */
const JwkJsonSchema = z
	.object({
		kty: z.string(),
		use: z.optional(z.string()),
	})
	.catchall(z.unknown());

/**
 * Schema for DID verification methods
 */
const VerificationMethodSchema = z.object({
	id: z.string(),
	type: z.string(),
	controller: z.string(),
	publicKeyJwk: z.optional(JwkJsonSchema),
	publicKeyMultibase: z.optional(z.string()),
});

/**
 * Schema for DID service endpoints
 */
const DidDocumentServiceSchema = z.object({
	id: z.string(),
	type: z.string(),
	serviceEndpoint: z.union([z.string(), z.array(z.string())]),
});

const CreateDidDocumentShape = z.object(CreateDidDocumentParams)
export type CreateDidDocumentRequestType = z.infer<typeof CreateDidDocumentShape>;

export const CreateDidDocumentResponse = z.object({
	did: z.string().describe('The DID'),
	keys: z.array(z.object({
		kid: z.string(),
		kms: z.string(),
		type: z.string(),
		publicKeyHex: z.string(),
		meta: z.record(z.unknown()),
		controller: z.string(),
	})).describe('Array of cryptographic keys associated with the DID'),
	services: z.array(DidDocumentServiceSchema).describe('Array of service endpoints'),
	provider: z.string().describe('The DID provider'),
	controllerKeyRefs: z.array(z.string()).describe('Array of key identifiers controlling the DID'),
	controllerKeys: z.array(z.object({
		kid: z.string(),
		kms: z.string(),
		type: z.string(),
		publicKeyHex: z.string(),
		meta: z.record(z.unknown()),
		controller: z.string(),
	})).describe('Array of controller keys'),
	controllerKeyId: z.string().describe('The key identifier used for signing'),
	success: z.boolean().describe('Whether the operation was successful'),
	existedInDb: z.boolean().describe('Whether the DID was retrieved from local database'),
	error: z.string().optional().describe('Error message if creation failed'),
})
export type CreateDidDocumentResponseType = z.infer<typeof CreateDidDocumentResponse>;

/**
 * Complete schema for a DID Document
 */
const DidDocumentSchema = z.object({
	id: z.string(),
	alsoKnownAs: z.optional(z.array(z.string())),
	controller: z.optional(z.union([z.string(), z.array(z.string())])),
	verificationMethod: z.optional(z.array(VerificationMethodSchema)),
	service: z.optional(z.array(DidDocumentServiceSchema)),
	authentication: z.optional(z.array(z.union([z.string(), VerificationMethodSchema]))),
	assertionMethod: z.optional(z.array(z.union([z.string(), VerificationMethodSchema]))),
	keyAgreement: z.optional(z.array(z.union([z.string(), VerificationMethodSchema]))),
	capabilityInvocation: z.optional(z.array(z.union([z.string(), VerificationMethodSchema]))),
	capabilityDelegation: z.optional(z.array(z.union([z.string(), VerificationMethodSchema]))),
});

export const UpdateDidDocumentParams = {
	did: DID,
	service: z.array(DidDocumentServiceSchema).optional(),
	verificationMethod: z.array(VerificationMethodSchema).optional(),
	authentication: z.array(z.string()).optional(),
	publicKeyHexs: z.array(z.string()).optional().describe('List of key references (publicKeys) in hexadecimal format for signing'),
	didDocument: DidDocumentSchema.optional(),
};

const UpdateDidDocumentShape = z.object(UpdateDidDocumentParams)
export type UpdateDidDocumentRequestType = z.infer<typeof UpdateDidDocumentShape>;

export const UpdateDidDocumentResponse = z.object({
	did: z.string().describe('The updated DID'),
	keys: z.array(z.object({
		kid: z.string(),
		kms: z.string(),
		type: z.string(),
		publicKeyHex: z.string(),
		meta: z.record(z.unknown()),
		controller: z.string(),
	})).describe('Array of cryptographic keys associated with the DID'),
	services: z.array(DidDocumentServiceSchema).describe('Array of service endpoints'),
	provider: z.string().describe('The DID provider'),
	controllerKeyRefs: z.array(z.string()).describe('Array of key identifiers controlling the DID'),
	controllerKeys: z.array(z.object({
		kid: z.string(),
		kms: z.string(),
		type: z.string(),
		publicKeyHex: z.string(),
		meta: z.record(z.unknown()),
		controller: z.string(),
	})).describe('Array of controller keys'),
	controllerKeyId: z.string().describe('The key identifier used for signing'),
})
export type UpdateDidDocumentResponseType = z.infer<typeof UpdateDidDocumentResponse>;

export const DeactivateDidDocumentParams = {
	did: DID,
};

const DeactivateDidDocumentShape = z.object(DeactivateDidDocumentParams)
export type DeactivateDidDocumentRequestType = z.infer<typeof DeactivateDidDocumentShape>;

export const DeactivateDidDocumentResponse = z.object({
	didDocument: DidDocumentSchema,
	didDocumentMetadata: z.any().describe("DID Document metadata")
});
export type DeactivateDidDocumentResponseType = z.infer<typeof DeactivateDidDocumentResponse>;


export const ResolveDidDocumentParams = {
	did: DID,
};

export const ResolveDidLinkedResourceParams = {
	didUrl: DID,
};

export const CreateDidLinkedResourceParams = {
	did: DID,
	name: z.string().describe('Name of DID-Linked Resource'),
	type: z.string().describe('Type of DID-Linked Resource. This is NOT the same as the media type, which is calculated automatically ledger-side'),
	data: z.string().describe('Encoded string containing the data to be stored in the DID-Linked Resource'),
	encoding: z.enum(['base64url', 'base64', 'hex']).describe('Encoding format used to encode the data'),
	alsoKnownAs: z
		.array(
			z.object({
				uri: z.string(),
				description: z.string(),
			})
		)
		.optional()
		.describe('Optional field to assign a set of alternative URIs where the DID-Linked Resource can be fetched from'),
	version: z.string().optional().describe('Optional field to assign a human-readable version in the DID-Linked Resource'),
	publicKeyHexs: z.array(z.string()).optional().describe('List of key references (publicKeys) in hexadecimal format for signing'),
};
const CreateDidLinkedResourceShape = z.object(CreateDidLinkedResourceParams)
export type CreateDidLinkedResourceRequestType = z.infer<typeof CreateDidLinkedResourceShape>;

export const CreateDidLinkedResourceResponse = z.object({
	resource: z.object({
		checksum: z.string().describe('SHA-256 checksum of the resource'),
		created: z.string().datetime().describe('ISO 8601 timestamp when resource was created'),
		mediaType: z.string().describe('MIME type of the resource'),
		nextVersionId: z.string().nullable().describe('ID of the next version if available'),
		previousVersionId: z.string().nullable().describe('ID of the previous version if available'),
		resourceCollectionId: z.string().uuid().describe('UUID of the resource collection (DID without method)'),
		resourceId: z.string().uuid().describe('UUID of the resource'),
		resourceName: z.string().describe('Human-readable name of the resource'),
		resourceType: z.string().describe('Type of resource'),
		resourceURI: DID_URL.describe('Full DID URL pointing to the resource'),
		resourceVersion: z.string().describe('Human-readable version of the resource'),
	}).describe('The created DID-Linked Resource'),
});
export type CreateDidLinkedResourceResponseType = z.infer<typeof CreateDidLinkedResourceResponse>;

export const IssueCredentialParams = {
	issuerDid: z.string().describe('DID of the Verifiable Credential issuer. This needs to be a `did:cheqd` DID.'),
	subjectDid: z.string().describe('DID of the Verifiable Credential holder/subject. This needs to be a `did:key` DID.'),
	attributes: z.record(z.unknown()).describe('JSON object containing the attributes to be included in the credential.'),
	'@context': z.array(z.string()).optional().describe('Optional properties to be included in the `@context` property of the credential.'),
	type: z.array(z.string()).optional().describe('Optional properties to be included in the `type` property of the credential.'),
	expirationDate: z.string().datetime().optional().describe('Optional expiration date according to the VC Data Model specification.'),
	format: z.enum(['jwt', 'jsonld']).optional().default('jwt').describe('Format of the Verifiable Credential. Defaults to VC-JWT.'),
	credentialStatus: z.object({
		statusPurpose: z.enum(['revocation', 'suspension']),
		statusListName: z.string(),
		statusListType: z.enum(['StatusList2021', 'BitstringStatusList']),
		statusListIndex: z.number().optional(),
		statusListVersion: z.string().datetime().optional(),
		statusListRangeStart: z.number().optional(),
		statusListRangeEnd: z.number().optional(),
		indexNotIn: z.number().optional(),
	}).optional().describe('Optional `credentialStatus` properties for VC revocation or suspension.'),
	termsOfUse: z.array(z.record(z.unknown())).optional().describe('Terms of use can be utilized by an issuer or a holder to communicate the terms under which a verifiable credential was issued.'),
	refreshService: z.array(z.record(z.unknown())).optional().describe('RefreshService property MUST be one or more refresh services that provides enough information to the recipient\'s software.'),
	evidence: z.array(z.record(z.unknown())).optional().describe('Evidence property MUST be one or more evidence schemes providing enough information for a verifier.'),
	connector: z.enum(['verida', 'resource']).optional(),
}
const IssueCredentialShape = z.object(IssueCredentialParams)
export type IssueCredentialRequest = z.infer<typeof IssueCredentialShape>

export const VerifiableCredential = z.object({
	'@context': z.union([z.string(), z.array(z.string())]).describe('JSON-LD context'),
	id: z.string().optional().describe('Credential identifier'),
	type: z.array(z.string()).describe('Credential types'),
	issuer: z.union([z.string(), z.object({ id: z.string() })]).describe('Credential issuer'),
	issuanceDate: z.string().datetime().describe('Issuance date'),
	expirationDate: z.string().datetime().optional().describe('Expiration date'),
	credentialSubject: z.record(z.unknown()).describe('Credential subject claims'),
	proof: z.record(z.unknown()).optional().describe('Cryptographic proof'),
	credentialStatus: z.record(z.unknown()).optional().describe('Credential status information'),
})

export const IssueCredentialResponse = z.object({
	issuedCredentialId: z.string().describe('Unique identifier for the issued credential'),
	providerId: z.string().describe('Provider identifier'),
	providerCredentialId: z.string().optional().describe('Provider-specific credential ID'),
	issuerId: z.string().describe('DID or identifier of the credential issuer'),
	subjectId: z.string().describe('DID or identifier of the credential subject'),
	format: z.string().describe('Credential format (e.g., jwt_vc, jsonld)'),
	category: z.enum(['credential', 'accreditation']).optional().describe('Credential category'),
	type: z.array(z.string()).describe('Array of credential types'),
	status: z.enum(['active', 'revoked', 'suspended', 'expired']).describe('Current status of the credential'),
	statusUpdatedAt: z.string().datetime().optional().describe('Timestamp when status was last updated'),
	issuedAt: z.string().datetime().describe('Timestamp when credential was issued'),
	expiresAt: z.string().datetime().optional().describe('Timestamp when credential expires'),
	credentialStatus: z.record(z.unknown()).optional().describe('Credential status configuration'),
	statusRegistryId: z.string().optional().describe('UUID of the Status Registry'),
	statusIndex: z.number().optional().describe('Allocated Index of the Status Registry'),
	retryCount: z.number().optional().describe('Retry Count in case of failures'),
	lastError: z.string().optional().describe('Last error message in case of failure'),
	providerMetadata: z.record(z.unknown()).optional().describe('Provider-specific metadata'),
	credential: VerifiableCredential.describe('The issued Verifiable Credential'),
	createdAt: z.string().datetime().describe('Timestamp when record was created'),
	updatedAt: z.string().datetime().describe('Timestamp when record was last updated'),
})

export type IssueCredentialResponseType = z.infer<typeof IssueCredentialResponse>

// trust registry
export const ResolveAccreditationParams = {
	issuer: z.string().describe('The DID or identifier of the entity that issued the accreditation credential'),
	type: z
		.array(z.string())
		.describe(
			'Array of credential types that define the nature and purpose of the accreditation (e.g., ["VerifiableCredential", "AccreditationCredential"])'
		),
	termsofuse: z.string().describe('Reference to the terms of use type governing the use of this accreditation'),
	parentAccreditation: z
		.string()
		.describe('Reference to a higher-level accreditation that this credential inherits from or is authorized by'),
	credentialSchema: z
		.string()
		.describe(
			'URI pointing to the JSON Schema that defines the structure and validation rules for this accreditation credential'
		),
	DNSTrustFrameworkPointers: z
		.array(z.string())
		.describe(
			'Array of DNS-based trust framework identifiers that establish the trust context and verification rules for this accreditation'
		),
};

export const ListCredentialExchangeRecordsParams = {
	page: z.number().optional().default(1).describe('Page number for pagination'),
	limit: z.number().optional().default(10).describe('Number of items per page'),
	providerId: z.string().optional().describe('Filter credentials by provider ID (e.g., "studio", "dock")'),
	issuerId: z.string().optional().describe('Filter credentials by issuer DID or ID'),
	subjectId: z.string().optional().describe('Filter credentials by subject DID or ID'),
	status: z.enum(['issued', 'suspended', 'revoked', 'offered', 'rejected', 'unknown', 'valid']).optional().describe('Filter credentials by status'),
	format: z.enum(['jwt', 'jsonld', 'sd-jwt-vc', 'anoncreds']).optional().describe('Filter credentials by format'),
	category: z.enum(['credential', 'accreditation']).optional().describe('Filter credentials by category'),
	createdAt: z.string().datetime().optional().describe('Filter credentials created before or on this date'),
	credentialType: z.string().optional().describe('Filter credentials by type (e.g., "VerifiableCredential", "UniversityDegreeCredential")'),
	statusRegistryId: z.string().optional().describe('Filter issued credentials using status registry ID'),
}
const ListCredentialExchangeRecordsShape = z.object(ListCredentialExchangeRecordsParams)
export type ListCredentialExchangeRecordsRequest = z.infer<typeof ListCredentialExchangeRecordsShape>

export const ListCredentialResult = z.object({
	total: z.number().describe('Total number of credentials'),
	credentials: z.array(IssueCredentialResponse).describe('Array of issued credentials'),
});

export type ListCredentialResultType = z.infer<typeof ListCredentialResult>;

export const VerifyCredentialParams = {
	credential: z.union([z.string(), VerifiableCredential]).describe('Verifiable Credential to be verified as a VC-JWT string or a JSON object.'),
		policies: z.object({
			issuanceDate: z.boolean().optional().default(true).describe('Policy to skip the `issuanceDate` (`nbf`) timestamp check when set to `false`.'),
			expirationDate: z.boolean().optional().default(true).describe('Policy to skip the `expirationDate` (`exp`) timestamp check when set to `false`.'),
			audience: z.boolean().optional().default(false).describe('Policy to skip the audience check when set to `false`.'),
			checkExternalProvider: z.boolean().optional().default(false).describe('Policy to also check other providers when set to `true`.'),
		}).optional().describe('Custom verification policies to execute when verifying credential.'),
}

const VerifyCredentialShape = z.object(VerifyCredentialParams)
export type VerifyCredentialRequestType = z.infer<typeof VerifyCredentialShape>

export const VerifiableCredentialParams = {
	credential: z.union([z.string(), VerifiableCredential]).describe('Verifiable Credential to be verified as a VC-JWT string or a JSON object.'),
}

const VerifiableCredentialShape = z.object(VerifiableCredentialParams)
export type VerifiableCredentialRequest = z.infer<typeof VerifiableCredentialShape>

export const CredentialStatusListCreateParams = {
	did: DID,
	statusListName: z.string().describe('The name of the StatusList2021 or BitstringStatusList DID-Linked Resource to be created'),
	length: z.number().int().positive().default(131072).describe('The length of the status list to be created. Default and minimum is 131072 (16kb)'),
	encoding: z.enum(['base64url', 'hex']).default('base64url').describe('The encoding format of the StatusList DID-Linked Resource'),
	statusListVersion: z.string().optional().describe('Optional human-readable version in the StatusList DID-Linked Resource'),
	statusSize: z.number().int().positive().optional().describe('Only for BitstringStatusList: bits per credential for multiple statuses'),
	credentialCategory: z.enum(['credential', 'accreditation']).optional().describe('Category of credentials this status list is for'),
	statusMessages: z.array(z.object({
		status: z.string(),
		message: z.string(),
	})).optional().describe('Only for BitstringStatusList: Message explaining each bit'),
	ttl: z.number().int().min(1000).optional().describe('Only for BitstringStatusList: Time to Live in Milliseconds'),
	alsoKnownAs: z.array(z.object({
		uri: z.string(),
		description: z.string(),
	})).optional().describe('Optional alternative URIs for the status list'),
}

const CredentialStatusListCreateShape = z.object(CredentialStatusListCreateParams)
export type CredentialStatusListCreateRequest = z.infer<typeof CredentialStatusListCreateShape>

export const CredentialStatusListUpdateParams = {
	did: DID,
	statusListName: z.string().describe('The name of the StatusList2021 DID-Linked Resource to be updated'),
	indices: z.array(z.number().int().nonnegative()).describe('List of credential status indices to be updated. The indices must be in the range of the status list.'),
	statusListVersion: z.string().optional().describe('Optional field to assign a human-readable version in the StatusList2021 DID-Linked Resource'),
}

const CredentialStatusListUpdateShape = z.object(CredentialStatusListUpdateParams)
export type CredentialStatusListUpdateRequest = z.infer<typeof CredentialStatusListUpdateShape>