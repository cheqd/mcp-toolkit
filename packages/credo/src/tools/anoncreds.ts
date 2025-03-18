import { CredoAgent } from "../agent.js";
import { ListCredentialDefinitionParams, ListSchemaParams, RegisterCredentialDefinitionParams, RegisterSchemaParams, ResolveCredentialDefinitionParams, ResolveSchemaIdParams, ToolDefinition } from "../types.js";

export class AnonCredsToolHandler {
    credo: CredoAgent

    constructor(credo: CredoAgent) {
        this.credo = credo;
    }

    listSchemaTool(): ToolDefinition<typeof ListSchemaParams> {
        return {
            name: "list-schema",
            description: "Fetch the list of schemaId's from the walled",
            schema: ListSchemaParams,
            handler: async () => {
                const result = await this.credo.agent.modules.anoncreds.getCreatedSchemas({
                    methodName: "cheqd"
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

    getSchemaTool(): ToolDefinition<typeof ResolveSchemaIdParams> {
        return {
            name: "get-schema",
            description: "Resolve an anoncreds schema using the didUrl of cheqd",
            schema: ResolveSchemaIdParams,
            handler: async ({ schemaId }) => {
                const result = await this.credo.agent.modules.anoncreds.getSchema(schemaId);
    
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

    listCredentialDefinitionTool(): ToolDefinition<typeof ListCredentialDefinitionParams> {
        return {
            name: "list-credential-definition",
            description: "Fetch the list of credentialDefinitionId's from the walled",
            schema: ListCredentialDefinitionParams,
            handler: async () => {
                const result = await this.credo.agent.modules.anoncreds.getCreatedCredentialDefinitions({
                    methodName: "cheqd"
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

    getCredentialDefinitionTool(): ToolDefinition<typeof ResolveCredentialDefinitionParams> {
        return {
            name: "get-credential-definition",
            description: "Resolve an anoncreds credential definition using the didUrl of cheqd",
            schema: ResolveCredentialDefinitionParams,
            handler: async ({ credentialDefinitionId }) => {
                const result = await this.credo.agent.modules.anoncreds.getCredentialDefinition(credentialDefinitionId);
    
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

    createCredentialDefinitionTool(): ToolDefinition<typeof RegisterCredentialDefinitionParams> {
        return {
            name: "create-credential-definition",
            description: "Create and publish a credential definition for a specific schema id as a DID Linked Resource in Cheqd Network",
            schema: RegisterCredentialDefinitionParams,
            handler: async ({credentialDefinition, options}) => {
                const result = await this.credo.agent.modules.anoncreds.registerCredentialDefinition({
                    credentialDefinition,
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