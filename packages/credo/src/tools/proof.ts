import { AutoAcceptProof } from '@credo-ts/core';
import QRCode from 'qrcode';
import { v4 } from 'uuid';
import { CredoAgent } from '../agent.js';
import {
	ConnectionProofRequestParams,
	ConnectionlessProofRequestParams,
	GetProofExchangeRecordParams,
	GetProofRecordParams,
	ListProofParams,
	ToolDefinition,
} from '../types.js';

/**
 * Handler class for managing Zero-Knowledge Proofs in the Credo agent.
 * Provides tools for creating and managing proof requests and verifications.
 */
export class ProofToolHandler {
	credo: CredoAgent;

	constructor(credo: CredoAgent) {
		this.credo = credo;
	}

	/**
	 * Creates a connectionless proof request.
	 * Generates a QR code for the request that can be scanned to initiate proof presentation.
	 */
	connectionlessProofRequestTool(): ToolDefinition<typeof ConnectionlessProofRequestParams> {
		return {
			name: 'create-proof-request-connectionless',
			description:
				'Creates a connectionless proof request that can be accepted by any holder. Generates a QR code containing the request URL, which can be scanned to initiate proof presentation. The response includes the QR code image and request details.',
			schema: ConnectionlessProofRequestParams,
			handler: async ({ jsonld, anoncreds }) => {
				const proofFormats = this.constructProofFormats({ jsonld, anoncreds });

				let { message, proofRecord } = await this.credo.agent.proofs.createRequest({
					comment: 'V2 Out of Band offer',
					proofFormats,
					protocolVersion: 'v2',
				});

				const { invitationUrl, outOfBandRecord } =
					await this.credo.agent.oob.createLegacyConnectionlessInvitation({
						recordId: proofRecord.id,
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
	 * Creates a proof request for an existing DIDComm connection.
	 * Allows requesting proofs from connected agents.
	 */
	connectionProofRequestTool(): ToolDefinition<typeof ConnectionProofRequestParams> {
		return {
			name: 'create-proof-request-didcomm',
			description:
				'Creates a proof request for an existing DIDComm connection. The request is automatically sent to the connected agent, who can respond with the requested proofs. Returns the proof exchange record with details about the request status.',
			schema: ConnectionProofRequestParams,
			handler: async ({ jsonld, anoncreds, connectionId }) => {
				const proofFormats = this.constructProofFormats({ jsonld, anoncreds });

				let credentialRecord = await this.credo.agent.proofs.requestProof({
					comment: 'V2 Out of Band offer',
					proofFormats,
					protocolVersion: 'v2',
					connectionId,
					autoAcceptProof: AutoAcceptProof.Always,
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
	 * Lists all proof records in the agent's wallet.
	 * Provides a complete overview of all proof exchanges.
	 */
	listProofsTool(): ToolDefinition<typeof ListProofParams> {
		return {
			name: 'list-proofs',
			description:
				"Retrieves all proof records from the agent's wallet, providing a comprehensive list of all proof exchanges with their states and verification results.",
			schema: ListProofParams,
			handler: async () => {
				const proofs = await this.credo.agent.proofs.getAll();

				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(proofs),
						},
					],
				};
			},
		};
	}

	/**
	 * Retrieves a specific proof exchange record.
	 * Returns detailed information about a proof request and its status.
	 */
	getProofExchangeRecordTool(): ToolDefinition<typeof GetProofExchangeRecordParams> {
		return {
			name: 'get-proof-exchange-record',
			description:
				'Retrieves a specific proof exchange record using its unique identifier. Returns detailed information about the proof request, including its state, requested attributes, and verification status.',
			schema: GetProofExchangeRecordParams,
			handler: async ({ proofRecordId }) => {
				const proof = await this.credo.agent.proofs.getById(proofRecordId);

				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(proof),
						},
					],
				};
			},
		};
	}

	/**
	 * Retrieves a specific proof record from the wallet.
	 * Returns detailed information about a single proof exchange.
	 */
	getProofRecordTool(): ToolDefinition<typeof GetProofRecordParams> {
		return {
			name: 'get-proof-record',
			description:
				'Retrieves a specific proof record from the wallet using its unique identifier. Returns detailed information about the proof exchange, including verification results and presented attributes.',
			schema: GetProofRecordParams,
			handler: async ({ proofRecordId }) => {
				const proof = await this.credo.agent.proofs.getById(proofRecordId);

				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(proof),
						},
					],
				};
			},
		};
	}

	/**
	 * Accepts a proof request and generates a Zero-Knowledge Proof from available credentials.
	 * This tool allows the agent to respond to a proof request by selecting appropriate credentials
	 * from the wallet and generating a proof that satisfies the request's requirements.
	 */
	acceptProofRequestTool(): ToolDefinition<typeof GetProofExchangeRecordParams> {
		return {
			name: 'accept-proof-request',
			description: 'Accept the proof request to generate a ZKP from credentials in the wallet',
			schema: GetProofExchangeRecordParams,
			handler: async ({ proofRecordId }) => {
				const requestedCredentials = await this.credo.agent.proofs.selectCredentialsForRequest({
					proofRecordId,
				});

				const proofRecord = await this.credo.agent.proofs.acceptRequest({
					proofRecordId,
					proofFormats: requestedCredentials.proofFormats,
				});

				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(proofRecord),
						},
					],
				};
			},
		};
	}

	/**
	 * Constructs proof formats for either AnonCreds or JSON-LD proof requests.
	 * Formats the requested attributes and predicates according to the specified proof format type.
	 *
	 * @param {Object} params - The parameters for constructing proof formats
	 * @param {Object} params.anoncreds - AnonCreds proof request parameters
	 * @param {Object} params.jsonld - JSON-LD proof request parameters
	 * @returns {Object} Formatted proof request structure
	 * @throws {Error} If neither anoncreds nor jsonld parameters are provided
	 */
	private constructProofFormats({ anoncreds, jsonld }) {
		if (anoncreds) {
			const proofAttribute = {};
			anoncreds.requestedAttributes.forEach(({ attribute, restrictions }, index) => {
				proofAttribute[`attribute-${index}`] = {
					name: attribute,
					restrictions,
				};
			});

			const proofPredicate = {};
			anoncreds.requestedPredicates.forEach(({ attribute, restrictions, p_type, p_value }, index) => {
				proofPredicate[`predicate-${index}`] = {
					name: attribute,
					p_type,
					p_value,
					restrictions,
				};
			});

			return {
				anoncreds: {
					name: 'proof-request',
					version: '1.0',
					requested_attributes: proofAttribute,
					requested_predicates: proofPredicate,
				},
			};
		} else if (jsonld) {
			return {
				presentationExchange: {
					presentationDefinition: {
						id: v4(),
						input_descriptors: jsonld || [],
					},
				},
			};
		}

		throw new Error('Error proof format jsonld, anoncreds with arguments must be provided');
	}
}
