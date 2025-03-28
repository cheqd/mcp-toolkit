import { AutoAcceptCredential, V2CredentialPreview } from '@credo-ts/core';
import QRCode from 'qrcode';
import { CredoAgent } from '../agent.js';
import {
	AcceptCredentialOfferParams,
	ConnectionlessCredentialOfferParams,
	CredentialOfferParams,
	GetCredentialRecordParams,
	ListCredentialParams,
	ToolDefinition,
} from '../types.js';

export class CredentialToolHandler {
	credo: CredoAgent;

	constructor(credo: CredoAgent) {
		this.credo = credo;
	}

	connectionLessCredentialOfferTool(): ToolDefinition<typeof ConnectionlessCredentialOfferParams> {
		return {
			name: 'create-credential-offer-connectionless',
			description:
				'Create a connectionless credential offer which a holder can accept to initiate credential issuance.',
			schema: ConnectionlessCredentialOfferParams,
			handler: async ({ attributes, credentialDefinitionId }) => {
				let { message, credentialRecord } = await this.credo.agent.credentials.createOffer({
					comment: 'V2 Out of Band offer',
					credentialFormats: {
						anoncreds: {
							attributes: V2CredentialPreview.fromRecord(attributes).attributes,
							credentialDefinitionId,
						},
					},
					protocolVersion: 'v2',
				});

				const { invitationUrl, outOfBandRecord } =
					await this.credo.agent.oob.createLegacyConnectionlessInvitation({
						recordId: credentialRecord.id,
						message,
						domain: this.credo.domain,
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
							data: qrCodeBuffer.toString('base64'),
							mimeType: 'image/png',
						},
						{
							type: 'text',
							text: JSON.stringify(outOfBandRecord),
						},
						{
							type: 'text',
							text: `Invitation created successfully.\n\nConnection URL: ${invitationUrl}\n\nScan this QR code with another agent to establish a connection:`,
						},
					],
				};
			},
		};
	}

	connectionCredentialOfferTool(): ToolDefinition<typeof CredentialOfferParams> {
		return {
			name: 'create-credential-offer-didcomm',
			description: 'Offer a credential which a holder can accept to initiate credential issuance via didcomm.',
			schema: CredentialOfferParams,
			handler: async ({ attributes, credentialDefinitionId, connectionId }) => {
				let credentialRecord = await this.credo.agent.credentials.offerCredential({
					comment: 'V2 Out of Band offer',
					credentialFormats: {
						anoncreds: {
							attributes: V2CredentialPreview.fromRecord(attributes).attributes,
							credentialDefinitionId,
						},
					},
					protocolVersion: 'v2',
					connectionId,
					autoAcceptCredential: AutoAcceptCredential.Always,
				});

				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(credentialRecord),
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
				const credentials = await this.credo.agent.w3cCredentials.getAllCredentialRecords();

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

	listCredentialExchangeRecordsTool(): ToolDefinition<typeof ListCredentialParams> {
		return {
			name: 'list-credential-exchange-records',
			description: 'List the credential exchange records in wallet',
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

	getCredentialRecordTool(): ToolDefinition<typeof GetCredentialRecordParams> {
		return {
			name: 'get-credential-record',
			description: 'Retreive the credential record from wallet',
			schema: GetCredentialRecordParams,
			handler: async ({ credentialId }) => {
				const credential = await this.credo.agent.credentials.getById(credentialId);

				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(credential),
						},
					],
				};
			},
		};
	}

	acceptCredentialOfferTool(): ToolDefinition<typeof AcceptCredentialOfferParams> {
		return {
			name: 'accept-credential-offer',
			description: 'Accept the credential offer from issuer to initiate credential issuance',
			schema: AcceptCredentialOfferParams,
			handler: async ({ credentialRecordId }) => {
				const credential = await this.credo.agent.credentials.acceptOffer({
					credentialRecordId,
				});

				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(credential),
						},
					],
				};
			},
		};
	}
}
