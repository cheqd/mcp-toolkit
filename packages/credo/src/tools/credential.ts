import { CredoAgent } from '../agent.js';
import { ConnectionlessCredentialOfferParams, ListCredentialParams, ToolDefinition } from '../types.js';
import QRCode from 'qrcode';
export class CredentialToolHandler {
	credo: CredoAgent;

	constructor(credo: CredoAgent) {
		this.credo = credo;
	}

	connectionLessCredentialOfferTool(): ToolDefinition<typeof ConnectionlessCredentialOfferParams> {
		return {
			name: 'create-connectionless-credential-offer',
			description:
				'Create a connectionless credential offer which a holder can accept to initiate credential issuance.',
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
					protocolVersion: 'v2' as never,
				});

				const { invitationUrl, outOfBandRecord } =
					await this.credo.agent.oob.createLegacyConnectionlessInvitation({
						recordId: credentialRecord.id,
						message,
						domain: `http://${this.credo.name}:${this.credo.port}`,
					});
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
							data:qrCodeBuffer.toString('base64'),
							mimeType: 'image/png',
						},
						{
							type: 'text',
							text: JSON.stringify(outOfBandRecord),
						},
					],
				};
			},
		};
	}

	listCredentialsTool(): ToolDefinition<typeof ListCredentialParams> {
		return {
			name: 'list-credentials',
			description: 'List the credentials in wallet',
			schema: ListCredentialParams,
			handler: async () => {
				const credentials = await this.credo.agent.credentials.getAll();

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
}
