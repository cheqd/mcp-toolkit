import { AutoAcceptCredential, Jwt, V2CredentialPreview, W3cJwtVerifiableCredential } from '@credo-ts/core';
import QRCode from 'qrcode';
import { CredoAgent } from '../agent.js';
import {
	AcceptCredentialOfferParams,
	ConnectionlessCredentialOfferParams,
	CredentialOfferParams,
	GetCredentialRecordParams,
	ListCredentialParams,
	StoreCredentialParams,
	ToolDefinition,
} from '../types.js';

/**
 * Handler class for managing credentials in the Credo agent.
 * Provides tools for creating credential offers, managing credentials, and handling credential records.
 */
export class CredentialToolHandler {
	credo: CredoAgent;

	constructor(credo: CredoAgent) {
		this.credo = credo;
	}

	/**
	 * Creates a connectionless credential offer that can be accepted by any holder.
	 * Generates a QR code for the offer that can be scanned to initiate credential issuance.
	 */
	connectionLessCredentialOfferTool(): ToolDefinition<typeof ConnectionlessCredentialOfferParams> {
		return {
			name: 'create-credential-offer-connectionless',
			description:
				'Creates a connectionless credential offer that can be accepted by any holder. Generates a QR code containing the offer URL, which can be scanned to initiate credential issuance. The response includes the QR code image, outOfBand record, and invitation details.',
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

	/**
	 * Creates a credential offer for an existing DIDComm connection.
	 * Allows offering credentials to connected agents.
	 */
	connectionCredentialOfferTool(): ToolDefinition<typeof CredentialOfferParams> {
		return {
			name: 'create-credential-offer-didcomm',
			description:
				'Creates a credential offer for an existing DIDComm connection. The offer is automatically sent to the connected agent, who can accept it to receive the credential. Returns the credential record with details about the offer status.',
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

	/**
	 * Lists all credentials stored in the agent's wallet.
	 * Provides a complete overview of all credential records.
	 */
	listCredentialsTool(): ToolDefinition<typeof ListCredentialParams> {
		return {
			name: 'list-credentials',
			description:
				"Retrieves all credential records from the agent's wallet, providing a comprehensive list of all credentials with their states, attributes, and associated metadata.",
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

	/**
	 * Lists all credential exchange records in the agent's wallet.
	 * Provides a complete overview of all credential exchange records.
	 */
	listCredentialExchangeRecordsTool(): ToolDefinition<typeof ListCredentialParams> {
		return {
			name: 'list-credential-exchange-records',
			description:
				"Retrieves all credential exchange records from the agent's wallet, providing a comprehensive list of all credential exchanges with their states and associated metadata.",
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

	/**
	 * Retrieves a specific credential record from the wallet.
	 * Returns detailed information about a single credential.
	 */
	getCredentialRecordTool(): ToolDefinition<typeof GetCredentialRecordParams> {
		return {
			name: 'get-credential-record',
			description:
				'Retrieves a specific credential record from the wallet using its unique identifier. Returns detailed information about the credential, including its attributes, state, and associated metadata.',
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

	/**
	 * Accepts a credential offer from an issuer to initiate credential issuance.
	 * Completes the credential exchange process and returns the credential record.
	 */
	acceptCredentialOfferTool(): ToolDefinition<typeof AcceptCredentialOfferParams> {
		return {
			name: 'accept-credential-offer',
			description:
				'Accepts a credential offer from an issuer using the provided credential record ID. Automatically completes the credential exchange process and returns the updated credential record with the received credential details.',
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

	/**
	 * Imports a credential provided by the user.
	 */
	importCredentialTool(): ToolDefinition<typeof StoreCredentialParams> {
		return {
			name: 'import-credential',
			description: 'Import a jwt credential provided by the user.',
			schema: StoreCredentialParams,
			handler: async ({ jwt }) => {
				const credential = await this.credo.agent.w3cCredentials.storeCredential({
					credential: new W3cJwtVerifiableCredential({
						jwt: Jwt.fromSerializedJwt(jwt),
					}),
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
