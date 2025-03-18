import { CredoAgent } from "../agent.js";
import { ConnectionlessCredentialOfferParams, ListCredentialParams, ToolDefinition } from "../types.js";

export class CredentialToolHandler {
    credo: CredoAgent

    constructor(credo: CredoAgent) {
        this.credo = credo;
    }

    connectionLessCredentialOfferTool(): ToolDefinition<typeof ConnectionlessCredentialOfferParams> {
        return {
            name: "create-connectionless-credential-offer",
            description: "Create a connectionless credential offer which a holder can accept to initiate credential issuance.",
            schema: ConnectionlessCredentialOfferParams,
            handler: async ({ attributes, credentialDefinitionId }) => {
                let { message, credentialRecord } = await this.credo.agent.credentials.createOffer({
                    comment: 'V1 Out of Band offer',
                    credentialFormats: {
                      anoncreds: {
                        attributes,
                        credentialDefinitionId,
                      },
                    },
                    protocolVersion: 'v1' as never,
                  })
              
                  const { invitationUrl, outOfBandRecord } = await this.credo.agent.oob.createLegacyConnectionlessInvitation({
                    recordId: credentialRecord.id,
                    message,
                    domain:  `http://localhost:${this.credo.port}`,
                  })
    
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(outOfBandRecord)
                        },
                        {
                            type: "image",
                            data: btoa(invitationUrl),
                            mimeType: "image/png"
                        }
                    ]
                };
            }
        };
    }

    listCredentialsTool(): ToolDefinition<typeof ListCredentialParams> {
        return {
            name: "list-credentials",
            description: "List the credentials in wallet",
            schema: ListCredentialParams,
            handler: async () => {
                const credentials = await this.credo.agent.credentials.getAll();
    
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(credentials)
                        }
                    ]
                };
            }
        };
    }
}