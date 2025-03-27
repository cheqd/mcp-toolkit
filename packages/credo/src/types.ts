import { ToolCallback } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z, ZodRawShape } from 'zod';

export interface ToolDefinition<Args extends ZodRawShape> {
	readonly name: string;
	readonly description: string;
	readonly schema: Args;
	handler: ToolCallback<Args>;
}

export interface ICredoToolKitOptions {
	port: number | string;
	name: string;
	mnemonic: string;
	endpoint?: string;
}

const DID = z
	.string()
	.startsWith('did:cheqd:')
	.describe('Decentralized identifier for cheqd e.g. did:cheqd:testnet:4769f00d-0af4-472b-aab7-019abbbb8009');

export const DID_URL = z.string().startsWith('did:cheqd:').includes('/resources/');

// did
export const CreateDidDocumentParams = {
	network: z.enum(['testnet', 'mainnet']).describe('Provide the cheqd network to publish the did document'),
};

const JwkJsonSchema = z
	.object({
		kty: z.string(),
		use: z.optional(z.string()),
	})
	.catchall(z.unknown());

// VerificationMethod schema
const VerificationMethodSchema = z.object({
	id: z.string(),
	type: z.string(),
	controller: z.string(),
	publicKeyJwk: z.optional(JwkJsonSchema),
	publicKeyMultibase: z.optional(z.string()),
});

const DidDocumentServiceSchema = z.object({
	id: z.string(),
	type: z.string(),
	serviceEndpoint: z.union([z.string(), z.array(z.string())]),
});

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
	options: z.record(z.any()).optional(),
	didDocument: DidDocumentSchema,
};

export const DeactivateDidDocumentParams = {
	did: DID,
};

export const ResolveDidDocumentParams = {
	did: DID,
};

export const ResolveDidLinkedResourceParams = {
	didUrl: DID,
};

export const CreateDidLinkedResourceParams = {
	did: DID,
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

// anoncreds
export const ResolveSchemaIdParams = {
	schemaId: DID_URL.describe(
		'DID Url of schemaId e.g. did:cheqd:testnet:4769f00d-0af4-472b-aab7-019abbbb8009/resources/5acb3d53-ba06-441a-b48b-07d8c2f129f8'
	),
};

export const RegisterSchemaParams = {
	schema: z.object({
		issuerId: z
			.string()
			.startsWith('did:cheqd:')
			.describe('Decentralized identifier for cheqd e.g. did:cheqd:testnet:4769f00d-0af4-472b-aab7-019abbbb8009'),
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
	credentialDefinitionId: DID_URL.describe(
		'DID Url of schemaId e.g. did:cheqd:testnet:4769f00d-0af4-472b-aab7-019abbbb8009/resources/5acb3d53-ba06-441a-b48b-07d8c2f129f8'
	),
};

export const RegisterCredentialDefinitionParams = {
	credentialDefinition: z.object({
		issuerId: DID,
		schemaId: DID_URL.describe(
			'DID Url of schemaId e.g. did:cheqd:testnet:4769f00d-0af4-472b-aab7-019abbbb8009/resources/5acb3d53-ba06-441a-b48b-07d8c2f129f8'
		),
		tag: z.string(),
	}),
	options: z.object({
		supportRevocation: z.boolean().optional().default(false),
	}),
};

export const ListCredentialDefinitionParams = {};

// connection
export const CreateInvitationParams = {};

export const ReceiveInvitationParams = {
	invitationUrl: z.string().describe('Provide the invitation url to establish a secure didcomm connection'),
};

export const GetConnectionRecordParams = {
	outOfBandId: z.string().uuid().optional(),
	connectionId: z.string().uuid().optional(),
};

// credential
export const ConnectionlessCredentialOfferParams = {
	attributes: z
		.record(z.string())
		.describe(
			'Provide the list of attributes published in the schema linked to the provided credentialDefinitionId'
		),
	credentialDefinitionId: DID_URL.describe(
		'DID Url of credentialDefinitionId e.g. did:cheqd:testnet:4769f00d-0af4-472b-aab7-019abbbb8009/resources/5acb3d53-ba06-441a-b48b-07d8c2f129f8. You have the option to list the credential definitionIds with the other tool'
	),
};

export const CredentialOfferParams = {
	connectionId: z.string().uuid(),
	attributes: z
		.record(z.string())
		.describe(
			'Provide the list of attributes published in the schema linked to the provided credentialDefinitionId'
		),
	credentialDefinitionId: DID_URL.describe(
		'DID Url of credentialDefinitionId e.g. did:cheqd:testnet:4769f00d-0af4-472b-aab7-019abbbb8009/resources/5acb3d53-ba06-441a-b48b-07d8c2f129f8.'
	),
};

export const ListCredentialParams = {};

export const GetCredentialRecordParams = {
	credentialId: z.string().uuid(),
};
