import { ToolCallback } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z, ZodRawShape } from 'zod';

/**
 * Base interface for tool definitions in the Credo toolkit.
 * Defines the structure for all tools with their name, description, schema, and handler.
 */
export interface ToolDefinition<Args extends ZodRawShape> {
	readonly name: string;
	readonly description: string;
	readonly schema: Args;
	handler: ToolCallback<Args>;
}

/**
 * Configuration options for initializing the Credo toolkit.
 */
export interface ICredoToolKitOptions {
	port: number | string;
	name: string;
	mnemonic: string;
	endpoint?: string;
}

/**
 * Schema for validating cheqd Decentralized Identifiers (DIDs).
 * CHEQD_DID Must start with 'did:cheqd:' followed by network and unique identifier.
 */
const DID = z.string().startsWith('did:');

const CHEQD_DID = DID.describe(
	'A cheqd Decentralized Identifier (DID) in the format: did:cheqd:testnet:4769f00d-0af4-472b-aab7-019abbbb8009'
);

export const VC_CONTEXT = ['https://www.w3.org/2018/credentials/v1'];
export const VC_TYPE = 'VerifiableCredential';

/**
 * Schema for validating DID URLs that point to resources.
 * Must be a valid cheqd DID followed by '/resources/'.
 */
export const CHEQD_DID_URL = CHEQD_DID.includes('/resources/');

// DID Document Management Parameters
export const CreateDidDocumentParams = {
	network: z
		.enum(['testnet', 'mainnet'])
		.describe('The cheqd network to publish the DID document (testnet or mainnet)'),
	verificationMethodType: z
		.enum(['Ed25519VerificationKey2018', 'Ed25519VerificationKey2020', 'JsonWebKey2020'])
		.optional(),
	verificationMethodId: z.string().optional(),
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
	did: CHEQD_DID,
	options: z.record(z.any()).optional(),
	didDocument: DidDocumentSchema,
};

export const DeactivateDidDocumentParams = {
	did: CHEQD_DID,
};

export const ResolveDidDocumentParams = {
	did: CHEQD_DID,
};

export const ResolveDidLinkedResourceParams = {
	didUrl: CHEQD_DID,
};

export const CreateDidLinkedResourceParams = {
	did: CHEQD_DID,
	id: z.string().uuid(),
	name: z.string(),
	resourceType: z.string(),
	data: z.union([z.string(), z.instanceof(Uint8Array), z.record(z.any())]),
	collectionId: z.string().uuid(),
	version: z.string(),
	alsoKnownAs: z
		.array(
			z.object({
				uri: z.string(),
				description: z.string(),
			})
		)
		.optional(),
};

// Anonymous Credentials Parameters
export const ResolveSchemaIdParams = {
	schemaId: CHEQD_DID_URL.describe(
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

export const ResolveCredentialDefinitionParams = {
	credentialDefinitionId: CHEQD_DID_URL.describe(
		'The DID URL of the credential definition to resolve, e.g., did:cheqd:testnet:4769f00d-0af4-472b-aab7-019abbbb8009/resources/5acb3d53-ba06-441a-b48b-07d8c2f129f8'
	),
};

export const RegisterCredentialDefinitionParams = {
	credentialDefinition: z.object({
		issuerId: CHEQD_DID,
		schemaId: CHEQD_DID_URL.describe(
			'The DID URL of the schema this credential definition is based on, e.g., did:cheqd:testnet:4769f00d-0af4-472b-aab7-019abbbb8009/resources/5acb3d53-ba06-441a-b48b-07d8c2f129f8'
		),
		tag: z.string(),
	}),
	options: z.object({
		supportRevocation: z.boolean().optional().default(false),
	}),
};

export const ListCredentialDefinitionParams = {};

// Connection Management Parameters
export const CreateInvitationParams = {};

export const ReceiveInvitationParams = {
	invitationUrl: z.string().describe('The DIDComm invitation URL to establish a secure connection'),
};

export const GetConnectionRecordParams = {
	outOfBandId: z.string().uuid().optional(),
	connectionId: z.string().uuid().optional(),
};

// Credential Management Parameters
export const AnoncredsCredentialOfferParams = z.object({
	attributes: z
		.record(z.string())
		.describe(
			'Key-value pairs of attributes to be included in the credential, matching the schema defined by credentialDefinitionId'
		),
	credentialDefinitionId: CHEQD_DID_URL.describe(
		'The DID URL of the credential definition to use, e.g., did:cheqd:testnet:4769f00d-0af4-472b-aab7-019abbbb8009/resources/5acb3d53-ba06-441a-b48b-07d8c2f129f8'
	),
});

const AdditionalDataSchema = z
	.object({
		type: z.union([z.string(), z.array(z.string())]),
		id: z.string().optional(),
	})
	.catchall(z.any());

const StatusOptionsSchema = z.object({
	statusPurpose: z.enum(['revocation', 'suspension']),
	statusListName: z.string(),
	statusListIndex: z.number().optional(),
	statusListVersion: z.string().optional(),
	statusListRangeStart: z.number().optional(),
	statusListRangeEnd: z.number().optional(),
	indexNotIn: z.array(z.number()).optional(),
});

export const JsonLDCredentialOfferParams = z
	.object({
		subjectDid: z.string(),
		attributes: z.record(z.unknown()),
		'@context': z.array(z.string()).optional(),
		type: z.array(z.string()).optional(),
		expirationDate: z.union([z.string(), z.date()]).optional(),
		issuerDid: z.string(),
		credentialStatus: StatusOptionsSchema.optional(),
		credentialSchema: z.string().optional(),
		credentialName: z.string().optional(),
		credentialSummary: z.string().optional(),
		termsOfUse: z.union([AdditionalDataSchema, z.array(AdditionalDataSchema)]).optional(),
		refreshService: z.union([AdditionalDataSchema, z.array(AdditionalDataSchema)]).optional(),
		evidence: z.union([AdditionalDataSchema, z.array(AdditionalDataSchema)]).optional(),
		credentialId: z.string().optional(),
	})
	.catchall(z.any());

export const ConnectionlessCredentialOfferParams = {
	anoncreds: AnoncredsCredentialOfferParams.optional(),
	jsonld: JsonLDCredentialOfferParams.optional(),
};

export const CredentialOfferParams = {
	...ConnectionlessCredentialOfferParams,
	connectionId: z.string().uuid(),
};

export const ListCredentialParams = {};

export const GetCredentialRecordParams = {
	credentialId: z.string().uuid(),
};

export const AcceptCredentialOfferParams = {
	credentialRecordId: z.string().uuid(),
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
							CHEQD_DID_URL.describe(
								'The DID URL of the credential definition to restrict the proof to, e.g., did:cheqd:testnet:4769f00d-0af4-472b-aab7-019abbbb8009/resources/5acb3d53-ba06-441a-b48b-07d8c2f129f8'
							)
						),
						issuerId: z.optional(CHEQD_DID),
						schemaId: z.optional(
							CHEQD_DID_URL.describe(
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
							CHEQD_DID_URL.describe(
								'The DID URL of the credential definition to restrict the proof to, e.g., did:cheqd:testnet:4769f00d-0af4-472b-aab7-019abbbb8009/resources/5acb3d53-ba06-441a-b48b-07d8c2f129f8'
							)
						),
						issuerId: z.optional(CHEQD_DID),
						schemaId: z.optional(
							CHEQD_DID_URL.describe(
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

export const GetProofExchangeRecordParams = {
	proofRecordId: z.string().uuid(),
};

export const ProofRequestParams = {};

export const ListProofParams = {};

export const GetProofRecordParams = {
	proofRecordId: z.string().uuid(),
};
