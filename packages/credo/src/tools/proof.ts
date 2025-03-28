import { AutoAcceptProof } from '@credo-ts/core';
import QRCode from 'qrcode';
import { CredoAgent } from '../agent.js';
import {
	ConnectionProofRequestParams,
	ConnectionlessProofRequestParams,
	GetProofExchangeRecordParams,
	ListCredentialParams,
	ToolDefinition,
} from '../types.js';

export class ProofToolHandler {
	credo: CredoAgent;

	constructor(credo: CredoAgent) {
		this.credo = credo;
	}

	connectionLessProofRequestTool(): ToolDefinition<typeof ConnectionlessProofRequestParams> {
		return {
			name: 'create-proof-request-connectionless',
			description: 'Create a connectionless proof request to request a zero knowledge proof from holder.',
			schema: ConnectionlessProofRequestParams,
			handler: async ({ requestedAttributes, requestedPredicates }) => {
				const proofAttribute = {};
				requestedAttributes.forEach(({ attribute, restrictions }, index) => {
					proofAttribute[`attribute-${index}`] = {
						name: attribute,
						restrictions,
					};
				});

				const proofPredicate = {};
				requestedPredicates.forEach(({ attribute, restrictions, p_type, p_value }, index) => {
					proofPredicate[`predicate-${index}`] = {
						name: attribute,
						p_type,
						p_value,
						restrictions,
					};
				});

				let { message, proofRecord } = await this.credo.agent.proofs.createRequest({
					comment: 'V2 Out of Band offer',
					proofFormats: {
						anoncreds: {
							name: 'proof-request',
							version: '1.0',
							requested_attributes: proofAttribute,
							requested_predicates: proofPredicate,
						},
					},
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

	connectionProofRequestTool(): ToolDefinition<typeof ConnectionProofRequestParams> {
		return {
			name: 'create-proof-request-didcomm',
			description: 'Request a proof from an existing connection to request a zero knowledge proof via didcomm.',
			schema: ConnectionProofRequestParams,
			handler: async ({ requestedAttributes, requestedPredicates, connectionId }) => {
				const proofAttribute = {};
				requestedAttributes.forEach(({ attribute, restrictions }, index) => {
					proofAttribute[`attribute-${index}`] = {
						name: attribute,
						restrictions,
					};
				});

				const proofPredicate = {};
				requestedPredicates.forEach(({ attribute, restrictions, p_type, p_value }, index) => {
					proofPredicate[`predicate-${index}`] = {
						name: attribute,
						p_type,
						p_value,
						restrictions,
					};
				});

				let credentialRecord = await this.credo.agent.proofs.requestProof({
					comment: 'V2 Out of Band offer',
					proofFormats: {
						anoncreds: {
							name: 'proof-request',
							version: '1.0',
							requested_attributes: proofAttribute,
							requested_predicates: proofPredicate,
						},
					},
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

	listProofsTool(): ToolDefinition<typeof ListCredentialParams> {
		return {
			name: 'list-proof-records',
			description: 'List the proof records in wallet',
			schema: ListCredentialParams,
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

	getProofRecordTool(): ToolDefinition<typeof GetProofExchangeRecordParams> {
		return {
			name: 'get-proof-record',
			description: 'Retreive the proof exchange record from wallet',
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
}
