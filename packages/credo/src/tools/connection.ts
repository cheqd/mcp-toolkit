import { ConnectionRecord } from '@credo-ts/core';
import { CredoAgent } from '../agent.js';
import {
	CreateInvitationParams,
	GetConnectionRecordParams,
	ReceiveInvitationParams,
	ToolDefinition,
} from '../types.js';
import QRCode from 'qrcode';

export class ConnectionToolHandler {
	credo: CredoAgent;

	constructor(credo: CredoAgent) {
		this.credo = credo;
	}

	createConnectionInvitationTool(): ToolDefinition<typeof CreateInvitationParams> {
		return {
			name: 'create-connection-invitation-didcomm',
			description:
				'Create a connection invitation with a QR code that can be scanned by another agent to establish a secure connection. The QR code image will be displayed in the response.',
			schema: CreateInvitationParams,
			handler: async () => {
				const outOfBand = await this.credo.agent.oob.createInvitation({
					autoAcceptConnection: true,
				});
				const invitationUrl = outOfBand.outOfBandInvitation.toUrl({ domain: this.credo.domain });
				const invitation = outOfBand.outOfBandInvitation.toJSON();

				// Generate QR code as a data URL (png format)
				const qrCodeBuffer = await QRCode.toBuffer(invitationUrl, {
					type: 'png',
					margin: 2,
					errorCorrectionLevel: 'H',
					scale: 8,
				});
				return {
					content: [
						{
							type: 'image',
							data: qrCodeBuffer.toString('base64'),
							mimeType: 'image/png',
						},
						{
							type: 'text',
							text: `Invitation created successfully.\n\nConnection URL: ${invitationUrl}\n\nScan this QR code with another agent to establish a connection:`,
						},
						{
							type: 'text',
							text: JSON.stringify(invitation),
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
					autoAcceptInvitation: true,
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

	listConnections(): ToolDefinition<{}> {
		return {
			name: 'list-connections-didcomm',
			description: 'List all the conneciton records created via didcomm',
			schema: {},
			handler: async ({}) => {
				const connectionRecords = await this.credo.agent.oob.getAll();

				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(connectionRecords),
						},
					],
				};
			},
		};
	}

	getConnectionRecord(): ToolDefinition<typeof GetConnectionRecordParams> {
		return {
			name: 'get-connection-record-didcomm',
			description: 'Retreive a connection record created via didcomm',
			schema: GetConnectionRecordParams,
			handler: async ({ outOfBandId, connectionId }) => {
				let connectionRecord: ConnectionRecord | null = null;
				if (outOfBandId) {
					[connectionRecord] = await this.credo.agent.connections.findAllByOutOfBandId(outOfBandId);
				} else if (connectionId) {
					connectionRecord = await this.credo.agent.connections.findById(connectionId);
				}

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
