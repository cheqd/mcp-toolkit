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
	name: string;
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

const CreateDidDocumentShape = z.object(CreateDidDocumentParams)
export type CreateDidDocumentRequestType = z.infer<typeof CreateDidDocumentShape>;

export const CreateDidDocumentResponse =  z.object({
    did: z.string().describe('The DID'),
    didDocument: z.any().describe('The full DID Document'),
    success: z.boolean().describe('Whether the operation was successful'),
    existedInDb: z.boolean().describe('Whether the DID was retrieved from local database'),
    error: z.string().optional().describe('Error message if creation failed'),
})
export type CreateDidDocumentResponseType = z.infer<typeof CreateDidDocumentResponse>;

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
	didDocument: DidDocumentSchema,
    success: z.boolean().describe('Whether the update was successful'),
    error: z.string().optional().describe('Error message if update failed'),
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

export type CreateDidLinkedResourceResponseType = any;

// Anonymous Credentials Parameters
export const ResolveSchemaIdParams = {
	schemaId: DID_URL.describe(
		'The DID URL of the schema to resolve, e.g., did:cheqd:testnet:4769f00d-0af4-472b-aab7-019abbbb8009/resources/5acb3d53-ba06-441a-b48b-07d8c2f129f8'
	),
};

export const RegisterSchemaParams = {
	schema: z.object({
		issuerId: z
			.string()
			.startsWith('did:cheqd:')
			.describe('The DID of the schema issuer, e.g., did:cheqd:testnet:4769f00d-0af4-472b-aab7-019abbbb8009'),
		name: z.string(),
		version: z.string(),
		attrNames: z.array(z.string()),
	}),
	options: z.object({
		network: z.enum(['testnet', 'mainnet']),
	}),
};

export const ListSchemaParams = {};

export const CredentialOfferParams = {
	issuerDid: z.string().startsWith('did:cheqd:').describe('DID of the Verifiable Credential issuer. This needs to be a `did:cheqd` DID.'),
	subjectDid: z.string().describe('DID of the Verifiable Credential holder/subject. This needs to be a `did:key` DID.'),
	attributes: z.record(z.unknown()).describe('JSON object containing the attributes to be included in the credential.'),
	'@context': z.array(z.string()).optional().describe('Optional properties to be included in the `@context` property of the credential.'),
	type: z.array(z.string()).optional().describe('Optional properties to be included in the `type` property of the credential.'),
	expirationDate: z.string().datetime().optional().describe('Optional expiration date for the credential.'),
	format: z.enum(['jwt', 'jsonld']).optional().default('jwt').describe('Format of the Verifiable Credential.'),
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
	termsOfUse: z.array(z.object({}).passthrough()).optional().describe('Terms of use for the verifiable credential.'),
	refreshService: z.array(z.object({}).passthrough()).optional().describe('Refresh services for updating the credential.'),
	evidence: z.array(z.object({}).passthrough()).optional().describe('Evidence supporting the credential issuance.'),
};

export const ListCredentialParams = {};

export const GetCredentialRecordParams = {
	credentialId: z.string().uuid(),
};

export const AcceptCredentialOfferParams = {
	credentialRecordId: z.string().uuid(),
};

export const StoreCredentialParams = {
	jwt: z.string(),
};

// Proof Management Parameters
export const ConnectionlessProofRequestParams = {
	requestedAttributes: z
		.array(
			z.object({
				attribute: z.string(),
				restrictions: z.array(
					z.object({
						cred_def_id: z.optional(
							DID_URL.describe(
								'The DID URL of the credential definition to restrict the proof to, e.g., did:cheqd:testnet:4769f00d-0af4-472b-aab7-019abbbb8009/resources/5acb3d53-ba06-441a-b48b-07d8c2f129f8'
							)
						),
						issuerId: z.optional(DID),
						schemaId: z.optional(
							DID_URL.describe(
								'The DID URL of the schema to restrict the proof to, e.g., did:cheqd:testnet:4769f00d-0af4-472b-aab7-019abbbb8009/resources/5acb3d53-ba06-441a-b48b-07d8c2f129f8'
							)
						),
					})
				),
			})
		)
		.describe('List of attributes to be revealed in the proof'),

	requestedPredicates: z
		.array(
			z.object({
				attribute: z.string(),
				p_type: z.enum(['>', '<', '>=', '<=']),
				p_value: z.number(),
				restrictions: z.array(
					z.object({
						cred_def_id: z.optional(
							DID_URL.describe(
								'The DID URL of the credential definition to restrict the proof to, e.g., did:cheqd:testnet:4769f00d-0af4-472b-aab7-019abbbb8009/resources/5acb3d53-ba06-441a-b48b-07d8c2f129f8'
							)
						),
						issuerId: z.optional(DID),
						schemaId: z.optional(
							DID_URL.describe(
								'The DID URL of the schema to restrict the proof to, e.g., did:cheqd:testnet:4769f00d-0af4-472b-aab7-019abbbb8009/resources/5acb3d53-ba06-441a-b48b-07d8c2f129f8'
							)
						),
					})
				),
			})
		)
		.describe('List of predicates to be proven without revealing the actual attribute values'),
};

export const ConnectionProofRequestParams = {
	...ConnectionlessProofRequestParams,
	connectionId: z.string().uuid(),
};

export const ListProofParams = {};

export const GetProofRecordParams = {
	proofRecordId: z.string().uuid(),
};

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
