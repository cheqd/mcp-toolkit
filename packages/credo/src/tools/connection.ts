import { ConnectionRecord, HandshakeProtocol } from '@credo-ts/core';
import { CredoAgent } from '../agent.js';
import {
	CreateInvitationParams,
	GetConnectionRecordParams,
	ReceiveInvitationParams,
	ToolDefinition,
} from '../types.js';
import QRCode from 'qrcode';

/**
 * Handler class for managing DIDComm connections in the Credo agent.
 * Provides tools for creating, accepting, and managing connection invitations.
 */
export class ConnectionToolHandler {
	credo: CredoAgent;

	constructor(credo: CredoAgent) {
		this.credo = credo;
	}

	/**
	 * Creates a DIDComm connection invitation with a QR code.
	 * The QR code can be scanned by another agent to establish a secure connection.
	 * Returns both the invitation URL and a QR code image for easy scanning.
	 */
	createConnectionInvitationTool(): ToolDefinition<typeof CreateInvitationParams> {
		return {
			name: 'create-connection-invitation-didcomm',
			description:
				'Creates a DIDComm connection invitation with a QR code. The invitation can be shared with another agent to establish a secure connection. The response includes a QR code image for easy scanning, the invitation URL, and the full invitation object.',
			schema: CreateInvitationParams,
			handler: async () => {
				const outOfBand = await this.credo.agent.oob.createInvitation({
					autoAcceptConnection: true,
					handshakeProtocols: [HandshakeProtocol.DidExchange],
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

	/**
	 * Accepts a DIDComm connection invitation from another agent.
	 * Establishes a secure connection using the provided invitation URL.
	 */
	acceptConnectionInvitationTool(): ToolDefinition<typeof ReceiveInvitationParams> {
		return {
			name: 'accept-connection-invitation-didcomm',
			description:
				'Accepts a DIDComm connection invitation from another agent using the provided invitation URL. Automatically establishes a secure connection and returns the connection record with details about the established connection.',
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

	/**
	 * Lists all DIDComm connection records in the agent's wallet.
	 * Provides a complete overview of all established connections.
	 */
	listConnections(): ToolDefinition<{}> {
		return {
			name: 'list-connections-didcomm',
			description:
				"Retrieves all DIDComm connection records from the agent's wallet, providing a comprehensive list of all established connections with their current states and details.",
			schema: {},
			handler: async ({}) => {
				const connectionRecords = await this.credo.agent.connections.getAll();

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

	/**
	 * Retrieves a specific connection record by its ID.
	 * Can be looked up using either the outOfBandId or connectionId.
	 */
	getConnectionRecord(): ToolDefinition<typeof GetConnectionRecordParams> {
		return {
			name: 'get-connection-record-didcomm',
			description:
				'Retrieves a specific DIDComm connection record using either the outOfBandId or connectionId. Returns detailed information about the connection state, metadata, and associated identifiers.',
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
