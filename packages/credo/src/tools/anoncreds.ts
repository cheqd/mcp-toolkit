import { CredoAgent } from "../agent.js";
import { RegisterSchemaParams, ResolveSchemaIdParams, ToolDefinition } from "../types.js";

export class AnonCredsToolHandler {
    credo: CredoAgent

    constructor(credo: CredoAgent) {
        this.credo = credo;
    }

    getSchemaTool(): ToolDefinition<typeof ResolveSchemaIdParams> {
        return {
            name: "get-schema",
            description: "Resolve an anoncreds schema using the didUrl of cheqd",
            schema: ResolveSchemaIdParams,
            handler: async ({ schemaId }) => {
                const result = await this.credo.agent.dids.resolveDidDocument(schemaId);
    
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(result)
                        },
                    ]
                };
            }
        };
    }

    createSchemaTool(): ToolDefinition<typeof RegisterSchemaParams> {
        return {
            name: "create-schema",
            description: "Create and publish a schema as a DID Linked Resource in Cheqd Network",
            schema: RegisterSchemaParams,
            handler: async ({schema, options}) => {
                const result = await this.credo.agent.modules.anoncreds.registerSchema({
                    schema,
                    options
                });
    
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(result)
                        },
                    ]
                };
            }
        };
    }
}