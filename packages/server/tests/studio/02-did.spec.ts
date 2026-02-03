import { randomUUID } from 'crypto';
import { test, expect } from './setup';
import { state } from './state';
import { CreateDidDocumentResponseType, CreateDidLinkedResourceResponse, UpdateDidDocumentResponseType } from '@cheqd/mcp-toolkit-studio/src/types';
import { CreateDidLinkedResourceResponseType } from '@cheqd/mcp-toolkit-studio/build/types';

test.describe('DID Operations', () => {
	// Setup before all tests
	test.beforeAll(async ({ client, parseToolResponse }) => {
		// Create a DID for use in all tests
		const result = await client.callTool({
			name: 'create-did',
			arguments: {
				network: 'testnet',
			},
		});

		const resp = parseToolResponse(result) as any;
		expect(resp).toHaveProperty('success');
		expect(resp.success).toBeTruthy();
		const data: CreateDidDocumentResponseType = resp.data;
		expect(data).toHaveProperty('did');
		expect(data).toHaveProperty('keys');

		state.testDid = data.did;
		state.testDidDoc = data;

		expect(data.did).toMatch(/^did:cheqd:testnet:/);
		expect(Array.isArray(data.keys)).toBe(true);
	});

	// Teardown after all tests in this suite
	test.afterAll(async ({ shutdown }) => {
		await shutdown();
		console.log('DID Operations test suite completed');
	});

	test('should list DIDs in wallet', async ({ client, parseToolResponse }) => {
		const result = await client.callTool({
			name: 'list-did',
			arguments: {}
		});
		const listResp = parseToolResponse(result) as any;
		expect(listResp).toHaveProperty('success');
		expect(listResp.success).toBeTruthy();
		const data = listResp.data;
		expect(Array.isArray(data.dids)).toBe(true);
		expect(data.total).toBeGreaterThanOrEqual(1);
	});

	test('should resolve the created DID', async ({ client, parseToolResponse }) => {
		// Resolve the DID
		const resolveResult = await client.callTool({
			name: 'resolve-did',
			arguments: { did: state.testDid },
		});

		const resolveResp = parseToolResponse(resolveResult) as any;
		expect(resolveResp).toHaveProperty('success');
		expect(resolveResp.success).toBeTruthy();
		const resolveData = resolveResp.data;
		expect(resolveData).toHaveProperty('didDocument');
		expect(resolveData.didDocument).toHaveProperty('id');
		expect(resolveData.didDocument.id).toBe(state.testDid);
		expect(resolveData.didDocument).toHaveProperty('controller');
		expect(resolveData.didDocument).toHaveProperty('verificationMethod');
		expect(resolveData.didDocument).toHaveProperty('authentication');
		expect(Array.isArray(resolveData.didDocument.verificationMethod)).toBe(true);

		state.testDidDoc = resolveData.didDocument
	});
	test('should update the created DID', async ({ client, parseToolResponse }) => {
		const didDoc = {
			...state.testDidDoc,
			service: [
				{
					id: `${state.testDid}#service-1`,
					type: 'URL',
					serviceEndpoint: ['https://example.com/vc/'],
				},
			],
		};
		// Update the DID
		const updateResult = await client.callTool({
			name: 'update-did',
			arguments: { did: state.testDid, didDocument: didDoc },
		});

		const updateResp = parseToolResponse(updateResult) as any;
		expect(updateResp).toHaveProperty('success');
		expect(updateResp.success).toBeTruthy();
		const updateData: UpdateDidDocumentResponseType = updateResp.data;
		expect(updateData).toHaveProperty('did');
		expect(updateData.did).toBe(state.testDid);
		expect(updateData).toHaveProperty('services');
		expect(Array.isArray(updateData.services)).toBe(true);
	});

	test('should create a DID Linked Resource', async ({ client, parseToolResponse }) => {
		const params = {
			did: state.testDid,
			name: 'TestResourceName',
			type: 'Document',
			encoding: 'base64',
			data: 'SGVsbG8gV29ybGQ=', // Base64 encoded data
			version: '1.0',
		};
		// Create DID Linked Resource
		const createDLR = await client.callTool({
			name: 'create-did-linked-resource',
			arguments: params,
		});

		const createResp = parseToolResponse(createDLR) as any;
		expect(createResp).toHaveProperty('success');
		expect(createResp.success).toBeTruthy();
		const createData: CreateDidLinkedResourceResponseType = createResp.data;
		expect(createData.resource).toHaveProperty('resourceId');
		expect(createData.resource).toHaveProperty('resourceName');
		expect(createData.resource.resourceId).toBeTruthy();
		state.testDLRId = state.testDid + '?resourceId=' + createData.resource.resourceId;
	});

	test('should resolve the created DID Linked Resource', async ({ client, parseToolResponse }) => {
		// Resolve DID Linked Resource
		const response = await client.callTool({
			name: 'resolve-did-linked-resource',
			arguments: { didUrl: state.testDLRId },
		});

		const resp = parseToolResponse(response) as any;
		expect(resp).toHaveProperty('success');
		expect(resp.success).toBeTruthy();
		const result = resp.data;
		const decodedText = Buffer.from(Object.values(result as any)).toString('utf-8');
		expect(decodedText).toBe('Hello World');
	});
});
