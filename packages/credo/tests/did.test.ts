import { DidToolHandler } from '../src/tools/did.js';
import { CredoAgent } from '../src/agent.js';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { validDid, validDidDoc } from './setup.js';
import { DidDocument } from '@credo-ts/core';
import { RequestHandlerExtra } from '@modelcontextprotocol/sdk/shared/protocol.js';

jest.mock('../src/agent.js');

describe('DidToolHandler', () => {
	let mockCredoAgent: jest.Mocked<CredoAgent>;
	let didToolHandler: DidToolHandler;
	beforeEach(() => {
		mockCredoAgent = {
			agent: {
				dids: {
					resolveDidDocument: jest.fn(),
					create: jest.fn(),
					update: jest.fn(),
					deactivate: jest.fn(),
					getCreatedDids: jest.fn(),
				},
			},
			did: {
				createDid: jest.fn(),
				resolveDid: jest.fn(),
				deleteDid: jest.fn(),
				updateDid: jest.fn(),
			},
		} as unknown as jest.Mocked<CredoAgent>;
		didToolHandler = new DidToolHandler(mockCredoAgent);
	});

	describe('resolveDid', () => {
		it('should return a valid tool definition', () => {
			const tool = didToolHandler.resolveDidTool();
			expect(tool.name).toBe('resolve-did');
			expect(tool.schema).toBeDefined();
			expect(typeof tool.handler).toBe('function');
		});

		it('should resolve a DID', async () => {
			const mockDidDoc = validDidDoc();

			mockCredoAgent.agent.dids.resolveDidDocument.mockResolvedValue(mockDidDoc);

			const tool = didToolHandler.resolveDidTool();
			const response = await tool.handler({ did: validDid }, {} as RequestHandlerExtra);

			//verify
			expect(mockCredoAgent.agent.dids.resolveDidDocument).toHaveBeenCalledWith(validDid);
			expect(response).toBeDefined();
			expect(response.content).toBeDefined();
			expect(response.content.length).toBe(1);
			expect(response.content[0].text).toContain(validDid);
			expect(JSON.parse(response.content[0].text as string)).toEqual(mockDidDoc.toJSON());
		});
		it('should handle errors', async () => {
			const errorMessage = 'DID resolution failed';
			mockCredoAgent.agent.dids.resolveDidDocument.mockRejectedValue(new Error(errorMessage));

			const tool = didToolHandler.resolveDidTool();
			await expect(tool.handler({ did: 'did:cheqd:invaliddid' }, {} as RequestHandlerExtra)).rejects.toThrow(
				errorMessage
			);
		});
	});
	describe('createDID', () => {
		it('should return a valid tool definition', () => {
			const tool = didToolHandler.createDidTool();
			expect(tool.name).toBe('create-did');
			expect(tool.schema).toBeDefined();
			expect(typeof tool.handler).toBe('function');
		});

		it('should create a DID', async () => {
			const mockDidDoc = validDidDoc();

			mockCredoAgent.agent.dids.create.mockResolvedValue({
				didState: { state: 'finished', did: validDid, didDocument: mockDidDoc },
				didRegistrationMetadata: {},
				didDocumentMetadata: {},
			});

			const tool = didToolHandler.createDidTool();
			const response = await tool.handler({ network: 'testnet' }, {} as RequestHandlerExtra);

			//verify
			expect(response).toBeDefined();
			expect(response.content).toBeDefined();
			expect(response.content.length).toBe(1);
			const result = JSON.parse(response.content[0].text as string);
			expect(result.didState.did).toEqual(validDid);
			expect(result.didState.didDocument).toEqual(mockDidDoc.toJSON());
		});
		it('should handle errors', async () => {
			const errorMessage = 'DID creation failed';
			mockCredoAgent.agent.dids.create.mockRejectedValue(new Error(errorMessage));

			const tool = didToolHandler.createDidTool();
			await expect(tool.handler({ network: 'testnet' }, {} as RequestHandlerExtra)).rejects.toThrow(errorMessage);
		});
	});
});
