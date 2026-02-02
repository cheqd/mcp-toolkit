import { StudioAgent } from '../agent.js';
import {
    CredentialStatusListCreateParams,
    CredentialStatusListUpdateParams,
    IssueCredentialParams,
    ToolDefinition,
} from '../types.js';

/**
 * Handler class for managing credentials in the Credo agent.
 * Provides tools for creating credential offers, managing credentials, and handling credential records.
 */
export class CredentialStatusListToolHandler {
    studio: StudioAgent;

    constructor(studio: StudioAgent) {
        this.studio = studio;
    }

    /**
     * Creates a new status list credential for managing credential revocation.
     */
    StatusListCreateTool(): ToolDefinition<typeof CredentialStatusListCreateParams> {
        return {
            name: 'statuslist-create',
            description:
                'Creates a new status list credential that can be used to manage the revocation status of issued credentials.',
            schema: CredentialStatusListCreateParams,
            handler: async (body) => {
                const result = await this.studio.statusList.create(body);

                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(result)
                        },
                    ],
                };
            },
        };
    }

    /**
     * Updates an existing status list credential to revoke or reinstate credentials.
     */
    StatusListUpdateTool(): ToolDefinition<typeof CredentialStatusListUpdateParams> {
        return {
            name: 'statuslist-update',
            description:
                'Updates an existing status list credential to change the revocation status of issued credentials.',
            schema: CredentialStatusListUpdateParams,
            handler: async (body) => {
                const result = await this.studio.statusList.update(body);

                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(result)
                        },
                    ],
                };
            },
        };
    }
}

