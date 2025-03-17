import { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z, ZodRawShape } from "zod";

export interface ToolDefinition<Args extends ZodRawShape>{
    readonly name: string;
    readonly description: string;
    readonly schema: Args;
    handler: ToolCallback<Args>
}

export const CreateDidDocumentParams = {
    network: z.enum(["testnet", "mainnet"]).describe("Provide the cheqd network to publish the did document"),
}

export const ResolveDidDocumentParams = {
    did: z.string().startsWith("did:cheqd:").describe("Decentralized identifier for cheqd e.g. did:cheqd:testnet:4769f00d-0af4-472b-aab7-019abbbb8009")
}

export const ResolveSchemaIdParams = {
    schemaId: z.string().startsWith("did:cheqd:").includes("/resources/").describe("DID Url of schemaId e.g. did:cheqd:testnet:4769f00d-0af4-472b-aab7-019abbbb8009/resources/5acb3d53-ba06-441a-b48b-07d8c2f129f8")
}

export const RegisterSchemaParams ={
    schema: z.object({
        issuerId: z.string(),
        name: z.string(),
        version: z.string(), 
        attrNames: z.array(z.string()),
    }),
    options: z.object({
        network: z.enum(["testnet", "mainnet"])
    })
};
