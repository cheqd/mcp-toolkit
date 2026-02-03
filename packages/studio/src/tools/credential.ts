import { StudioAgent } from '../agent.js';
import {
    IssueCredentialParams,
    ListCredentialExchangeRecordsParams,
    ToolDefinition,
    VerifyCredentialParams,
} from '../types.js';

/**
 * Handler class for managing credentials in the Credo agent.
 * Provides tools for creating credential offers, managing credentials, and handling credential records.
 */
export class CredentialToolHandler {
    studio: StudioAgent;

    constructor(studio: StudioAgent) {
        this.studio = studio;
    }

    /**
     * Creates a connectionless credential offer that can be accepted by any holder.
     * Generates a QR code for the offer that can be scanned to initiate credential issuance.
     */
    IssueCredentialTool(): ToolDefinition<typeof IssueCredentialParams> {
        return {
            name: 'issue-credential',
            description:
                'Issues a credential to the subject did, the credential can also be sent to a wallet by using external connectors.',
            schema: IssueCredentialParams,
            handler: async (body) => {
                const result = await this.studio.credentials.issue(body);

                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify('result')
                        },
                    ],
                };
            },
        };
    }

    /**
     * Lists all credential exchange records in the agent's wallet.
     * Provides a complete overview of all credential exchange records.
     */
    listCredentialExchangeRecordsTool(): ToolDefinition<typeof ListCredentialExchangeRecordsParams> {
        return {
            name: 'list-credential-exchange-records',
            description:
                "Retrieves all credential exchange records from the agent's wallet, providing a comprehensive list of all credential exchanges with their states and associated metadata.",
            schema: ListCredentialExchangeRecordsParams,
            handler: async () => {
                const credentials = await this.studio.credentials.getCredentialExchangeRecords();

                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(credentials),
                        },
                    ],
                };
            },
        };
    }


    /**
     * Verifies a credential to ensure its authenticity and validity.
     * Checks the credential signature and expiration status.
     */
    verifyCredentialTool(): ToolDefinition<typeof VerifyCredentialParams> {
        return {
            name: 'verify-credential',
            description:
                "Verifies a credential's authenticity and validity by checking its signature, expiration status, and issuer information.",
            schema: VerifyCredentialParams,
            handler: async (body) => {
                const result = await this.studio.credentials.verify(body);

                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(result),
                        },
                    ],
                };
            },
        };
    }

    // 
/**
 * Revokes a previously issued credential.
 * The credential can no longer be used or verified after revocation.
 */
revokeCredentialTool(): ToolDefinition<typeof VerifyCredentialParams> {
    return {
        name: 'revoke-credential',
        description:
            'Revokes a previously issued credential, making it invalid for future verification.',
        schema: VerifyCredentialParams,
        handler: async (body) => {
            const result = await this.studio.credentials.revoke(body);

            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(result),
                    },
                ],
            };
        },
    };
}

/**
 * Suspends a credential temporarily.
 * The credential can be reinstated later if needed.
 */
suspendCredentialTool(): ToolDefinition<typeof VerifyCredentialParams> {
    return {
        name: 'suspend-credential',
        description:
            'Temporarily suspends a credential, preventing verification until it is reinstated.',
        schema: VerifyCredentialParams,
        handler: async (body) => {
            const result = await this.studio.credentials.suspend(body);

            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(result),
                    },
                ],
            };
        },
    };
}

/**
 * Reinstates a previously suspended credential.
 * The credential becomes valid for verification again.
 */
reinstateCredentialTool(): ToolDefinition<typeof VerifyCredentialParams> {
    return {
        name: 'reinstate-credential',
        description:
            'Reinstates a suspended credential, making it valid for verification again.',
        schema: VerifyCredentialParams,
        handler: async (body) => {
            const result = await this.studio.credentials.reinstate(body);

            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(result),
                    },
                ],
            };
        },
    };
}
}

