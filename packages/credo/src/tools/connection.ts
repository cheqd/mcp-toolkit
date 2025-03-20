import { CredoAgent } from '../agent.js';
import { CreateInvitationParams, ReceiveInvitationParams, ResolveDidDocumentParams, ToolDefinition } from '../types.js';

export class ConnectionToolHandler {
	credo: CredoAgent;

	constructor(credo: CredoAgent) {
		this.credo = credo;
	}

	createConnectionInvitationTool(): ToolDefinition<typeof CreateInvitationParams> {
		return {
			name: 'create-connection-invitation-didcomm',
			description: 'Create a connection invitation to be used by another credo agent to establish a connection',
			schema: CreateInvitationParams,
			handler: async () => {
				const outOfBand = await this.credo.agent.oob.createInvitation();

				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(outOfBand),
						},
						{
							type: 'image',
							data: btoa(outOfBand.outOfBandInvitation.toUrl({ domain: this.credo.domain })),
							mimeType: 'image/png',
						},
					],
				};
			},
		};
	}

	acceptConnectionInvitationTool(): ToolDefinition<typeof ReceiveInvitationParams> {
		return {
			name: 'accept-connection-invitation-didcomm',
			description:
				'Accept a connection invitation provided by a credo agent to establish a secure connection via didcomm',
			schema: ReceiveInvitationParams,
			handler: async ({ invitationUrl }) => {
				const { connectionRecord } = await this.credo.agent.oob.receiveInvitationFromUrl(invitationUrl, {
					autoAcceptConnection: true,
				});

				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(connectionRecord),
						},
					],
				};
			},
		};
	}
}
