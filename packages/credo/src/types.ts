import { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z, ZodRawShape } from "zod";

export interface ToolDefinition<Args extends ZodRawShape>{
    readonly name: string;
    readonly description: string;
    readonly schema: Args;
    handler: ToolCallback<Args>
}

// did
export const CreateDidDocumentParams = {
    network: z.enum(["testnet", "mainnet"]).describe("Provide the cheqd network to publish the did document"),
}

export const ResolveDidDocumentParams = {
    did: z.string().startsWith("did:cheqd:").describe("Decentralized identifier for cheqd e.g. did:cheqd:testnet:4769f00d-0af4-472b-aab7-019abbbb8009")
}

// anoncreds
export const ResolveSchemaIdParams = {
    schemaId: z.string().startsWith("did:cheqd:").includes("/resources/").describe("DID Url of schemaId e.g. did:cheqd:testnet:4769f00d-0af4-472b-aab7-019abbbb8009/resources/5acb3d53-ba06-441a-b48b-07d8c2f129f8")
}

export const RegisterSchemaParams ={
    schema: z.object({
        issuerId: z.string().startsWith("did:cheqd:").describe("Decentralized identifier for cheqd e.g. did:cheqd:testnet:4769f00d-0af4-472b-aab7-019abbbb8009"),
        name: z.string(),
        version: z.string(), 
        attrNames: z.array(z.string()),
    }),
    options: z.object({
        network: z.enum(["testnet", "mainnet"])
    })
};

export const ResolveCredentialDefinitionParams = {
    credentialDefinitionId: z.string().startsWith("did:cheqd:").includes("/resources/").describe("DID Url of schemaId e.g. did:cheqd:testnet:4769f00d-0af4-472b-aab7-019abbbb8009/resources/5acb3d53-ba06-441a-b48b-07d8c2f129f8")
}

export const RegisterCredentialDefinitionParams ={
    credentialDefinition: z.object({
        issuerId: z.string().startsWith("did:cheqd:").describe("Decentralized identifier for cheqd e.g. did:cheqd:testnet:4769f00d-0af4-472b-aab7-019abbbb8009"),
        schemaId: z.string().startsWith("did:cheqd:").includes("/resources/").describe("DID Url of schemaId e.g. did:cheqd:testnet:4769f00d-0af4-472b-aab7-019abbbb8009/resources/5acb3d53-ba06-441a-b48b-07d8c2f129f8"),
        tag: z.string()
    }),
    options: z.object({
        supportRevocation: z.boolean().optional().default(false)
    })
};


// connection
export const CreateInvitationParams = {}

export const ReceiveInvitationParams = {
    invitationUrl: z.string().describe("Provide the invitation url to establish a secure didcomm connection")
}

// credential
export const ConnectionlessCredentialOfferParams = {
    attributes: z.object({}),
    credentialDefinitionId: z.string().startsWith("did:cheqd:").includes("/resources/").describe("DID Url of schemaId e.g. did:cheqd:testnet:4769f00d-0af4-472b-aab7-019abbbb8009/resources/5acb3d53-ba06-441a-b48b-07d8c2f129f8")
}

export const ListCredentialParams = {}