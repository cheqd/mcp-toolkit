import { randomUUID } from 'crypto';
import { test, expect } from './setup';
import { state } from './state';

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

		const data = parseToolResponse(result);
		expect(data).toHaveProperty('didState');
		expect(data.didState).toHaveProperty('state');
		expect(data.didState).toHaveProperty('did');

		state.testDid = data.didState.did;
		state.testDidDoc = data.didState.didDocument;

		expect(data.didState.state).toBe('finished');
		expect(data.didState.did).toMatch(/^did:cheqd:testnet:/);
		expect(data.didState.didDocument.id).toBe(state.testDid);
		expect(Array.isArray(data.didState.didDocument.verificationMethod)).toBe(true);
	});

	// Teardown after all tests in this suite
	test.afterAll(async ({ shutdown }) => {
		await shutdown();
		console.log('DID Operations test suite completed');
	});

	test('should list DIDs in wallet', async ({ client, parseToolResponse }) => {
		const result = await client.callTool({
			name: 'list-did',
			arguments: {},
		});

		const data = parseToolResponse(result);
		expect(Array.isArray(data)).toBe(true);
		expect(data.length).toBeGreaterThanOrEqual(1);
	});

	test('should resolve the created DID', async ({ client, parseToolResponse }) => {
		// Resolve the DID
		const resolveResult = await client.callTool({
			name: 'resolve-did',
			arguments: { did: state.testDid },
		});

		const resolveData = parseToolResponse(resolveResult);
		expect(resolveData).toHaveProperty('id');
		expect(resolveData.id).toBe(state.testDid);
		expect(resolveData).toHaveProperty('controller');
		expect(resolveData).toHaveProperty('verificationMethod');
		expect(resolveData).toHaveProperty('authentication');
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

		const updateData = parseToolResponse(updateResult);
		expect(updateData).toHaveProperty('didState');
		expect(updateData.didState.state).toBe('finished');
		expect(updateData.didState.did).toBe(state.testDid);
		expect(updateData.didState.didDocument.id).toBe(state.testDid);
		expect(updateData.didState.didDocument).toHaveProperty('service');
		expect(Array.isArray(updateData.didState.didDocument.service)).toBe(true);
	});

	test('should create a DID Linked Resource', async ({ client, parseToolResponse }) => {
		const didSuffix = state.testDid.split(':').pop(); // Extract the last part of the DID
		const params = {
			id: randomUUID(),
			name: 'TestResourceName',
			resourceType: 'Document',
			data: 'SGVsbG8gV29ybGQ=', // Base64 encoded data
			collectionId: didSuffix,
			version: '1.0',
		};
		// Create DID Linked Resource
		const createDLR = await client.callTool({
			name: 'create-did-linked-resource',
			arguments: { did: state.testDid, ...params },
		});

		const createData = parseToolResponse(createDLR);
		expect(createData).toHaveProperty('resourceState');
		expect(createData.resourceState.state).toBe('finished');
		expect(createData.resourceState).toHaveProperty('resourceId');
		state.testDLRId = state.testDid + '/resources/' + createData.resourceState.resourceId;
	});

	test('should resolve the created DID Linked Resource', async ({ client, parseToolResponse }) => {
		// Resolve DID Linked Resource
		const response = await client.callTool({
			name: 'resolve-did-linked-resource',
			arguments: { didUrl: state.testDLRId },
		});

		const result = parseToolResponse(response);
		expect(result).toHaveProperty('resource');
	});
});
