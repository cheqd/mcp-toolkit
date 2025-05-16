import {
	AutoAcceptCredential,
	JsonLdCredentialDetailFormat,
	Jwt,
	V2CredentialPreview,
    W3cJwtVerifiableCredential,
} from '@credo-ts/core';
import QRCode from 'qrcode';
import { CredoAgent } from '../agent.js';
import {
	AcceptCredentialOfferParams,
	ConnectionlessCredentialOfferParams,
	GetCredentialRecordParams,
	ListCredentialParams,
	StoreCredentialParams,
	ToolDefinition,
	CredentialOfferParams,
	VC_CONTEXT,
	VC_TYPE,
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
			handler: async ({ jsonld, anoncreds }) => {
				try {
					const credentialFormats = await this.constructCredentialFormats({ anoncreds, jsonld });

					const { message, credentialRecord } = await this.credo.agent.credentials.createOffer({
						comment: 'V2 Out of Band offer',
						credentialFormats,
						protocolVersion: 'v2',
						autoAcceptCredential: AutoAcceptCredential.Always,
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
				} catch (error: any) {
					return {
						content: [
							{
								type: 'text',
								text: error.message,
							},
						],
					};
				}
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
			handler: async ({ anoncreds, jsonld, connectionId }) => {
				try {
					const credentialFormats = await this.constructCredentialFormats({ anoncreds, jsonld });

					let credentialRecord = await this.credo.agent.credentials.offerCredential({
						comment: 'V2 Out of Band offer',
						credentialFormats,
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
				} catch (error: any) {
					return {
						content: [
							{
								type: 'text',
								text: error.message,
							},
						],
					};
				}
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
				try {
					let credential;
					try {
						credential = await this.credo.agent.credentials.getById(credentialId);
					} catch (error) {
						// Credential not found in credentials store, will try W3C store next
						console.error('Credential not found in credentials store');
					}
					if (!credential) {
						credential = await this.credo.agent.w3cCredentials.getCredentialRecordById(credentialId);
					}
					// If we still don't have a credential after both attempts, throw an error
					if (!credential) {
						throw new Error(`Credential with ID ${credentialId} not found in any credential store`);
					}
					return {
						content: [
							{
								type: 'text',
								text: JSON.stringify(credential),
							},
						],
					};
				} catch (error) {
					// Return an error response
					return {
						content: [
							{
								type: 'text',
								text: JSON.stringify(
									{
										error:
											error instanceof Error
												? error.message
												: 'Failed to retrieve credential record',
										status: 'failed',
										credentialId,
									},
									null,
									2
								),
							},
						],
						isError: true,
					};
				}
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
	 * Accepts a credential request from an holder to continue credential issuance.
	 * Completes the credential exchange process and returns the credential record.
	 */
	acceptCredentialRequestTool(): ToolDefinition<typeof AcceptCredentialOfferParams> {
		return {
			name: 'accept-credential-request',
			description: 'Accepts a credential request from an holder using the provided credential record ID.',
			schema: AcceptCredentialOfferParams,
			handler: async ({ credentialRecordId }) => {
				const credential = await this.credo.agent.credentials.acceptRequest({
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

	private async constructCredentialFormats({ anoncreds, jsonld }) {
		if (anoncreds) {
			return {
				anoncreds: {
					attributes: V2CredentialPreview.fromRecord(anoncreds.attributes).attributes,
					credentialDefinitionId: anoncreds.credentialDefinitionId,
				},
			};
		} else if (jsonld) {
			const {
				attributes,
				credentialName,
				credentialSummary,
				credentialSchema,
				issuerDid,
				subjectDid,
				type,
				expirationDate,
				credentialStatus,
				context,
				format,
				connector,
				credentialId,
				...additionalData
			} = jsonld;

			// validate issuer DID
			const didDocument = await this.credo.agent.dids.resolveDidDocument(issuerDid);
			if (!didDocument || !didDocument.assertionMethod?.length) {
				throw new Error(`Issuer DID ${issuerDid} does not exist with an assertionMethod`);
			}

			return {
				jsonld: {
					credential: {
						'@context': [...(context || []), ...VC_CONTEXT],
						type: [...(type || []), VC_TYPE],
						credentialSubject: {
							id: subjectDid,
							...attributes,
						},
						issuer: issuerDid,
						issuanceDate: new Date().toISOString(),
						expirationDate: expirationDate instanceof Date ? expirationDate.toISOString() : expirationDate,
						credentialStatus: credentialStatus
							? {
									id: credentialStatus.statusListName,
									type: credentialStatus.statusPurpose,
								}
							: undefined,
						...additionalData,
					},
					options: {
						proofType: 'Ed25519Signature2018',
						proofPurpose: 'assertionMethod',
					},
				} satisfies JsonLdCredentialDetailFormat,
			};
		}

		throw new Error('Error credential format jsonld, anoncreds with arguments must be provided');
	}
}
