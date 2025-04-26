import { z } from 'zod';
import { CredoAgent } from './agent';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export class PromptHandler {
	credo: CredoAgent;
	constructor(credo: CredoAgent) {
		this.credo = credo;
	}
	/**
	 * Registers common credential workflow prompts with the MCP server.
	 */
	registerPrompts(server: McpServer) {
		// Add a help prompt to explain available prompts
		server.prompt('help', () => ({
			messages: [
				{
					role: 'user',
					content: {
						type: 'text',
						text: `
I'm working with the cheqd MCP toolkit. Please help me understand the available functionality and provide a guide on how to use it effectively.

Specifically, I'd like to know:
1. What capabilities does this toolkit provide?
2. What are the main workflows supported (creating DIDs, schemas, credentials, etc.)?
3. Can you provide basic examples of common operations?
4. What resources and tools are available?
5. How do I troubleshoot common issues?

Please provide a comprehensive overview so I can make the most of this toolkit.
          `.trim(),
					},
				},
			],
		}));
		// DID creation guide
		server.prompt(
			'create-did-guide',
			'Guide for creating a DID on the cheqd network',
			{
				network: z.enum(['testnet', 'mainnet']).describe('Network to create the DID on'),
			},
			({ network }) => ({
				messages: [
					{
						role: 'user',
						content: {
							type: 'text',
							text: `
I want to create a new decentralized identifier (DID) on the cheqd ${network}.

Please help me:
1. Create a new DID using the create-did tool
2. After creation, show me what the DID document looks like
3. Explain the key components of the DID document
4. Provide guidance on how I can use this DID for future operations like creating schemas and credentials
          `.trim(),
						},
					},
				],
			})
		);
		// Prompt for resolving a DID
		server.prompt(
			'resolve-did',
			'Guide for resolving a DID on the cheqd network',
			{
				did: z
					.string()
					.regex(/^did:cheqd:/)
					.describe('DID to resolve'),
			},
			({ did }) => ({
				messages: [
					{
						role: 'user',
						content: {
							type: 'text',
							text: `
I need to resolve this DID: ${did}

Please:
1. Use the resolve-did tool to fetch the DID document
2. Explain the key components in the returned document
3. Verify if this is a valid DID that can be used for operations
          `.trim(),
						},
					},
				],
			})
		);
		// Prompt for to guide credential issuance
		server.prompt(
			'explain-credential-workflow',
			'A comprehensive guide to the credential issuance workflow',
			() => ({
				messages: [
					{
						role: 'user',
						content: {
							type: 'text',
							text: `
I'm new to verifiable credentials and would like to understand the full flow.

Please explain in detail:
1. The end-to-end process of creating and issuing credentials
2. All the required components (DID, schema, credential definition, etc.)
3. The role of each component
4. A step-by-step guide for a complete example flow
5. Best practices for credential issuance and verification
          `.trim(),
						},
					},
				],
			})
		);
		// Prompt for Schema creation guide
		server.prompt(
			'create-schema-guide',
			'Interactive guide for creating a credential schema',
			{
				schemaName: z.string().describe('Name for the schema'),
				attributes: z.string().describe('Comma-separated list of attributes'),
				issuerId: z
					.string()
					.regex(/^did:cheqd:/)
					.describe('DID of the issuer'),
				network: z
					.enum(['testnet', 'mainnet'])
					.default('testnet')
					.describe('Network to create the DID on') as z.ZodType<string, z.ZodTypeDef, string>,
			},
			({ schemaName, attributes, issuerId, network }) => ({
				description: `Guide for creating a schema named ${schemaName}`,
				messages: [
					{
						role: 'user',
						content: {
							type: 'text',
							text: `
                  I need to create a new credential schema for ${schemaName} on the cheqd ${network}.
                  
                  The schema should include these attributes: ${attributes}
                  The schema will be created using this issuer DID: ${issuerId}
                  
                  Please help me:
                  1. Create the schema using the create-schema tool
                  2. Create a credential definition based on this schema
                  3. Show me the schema ID and credential definition ID
                  4. Explain how I can use these for issuing credentials
                            `.trim(),
						},
					},
				],
			})
		);
		// Prompt for listing and explaining schemas
		server.prompt('explain-schemas', () => ({
			messages: [
				{
					role: 'user',
					content: {
						type: 'text',
						text: `
I'd like to understand the credential schemas I've created.

Please help me:
1. List all schemas I've created using the appropriate tool
2. Explain what each schema is used for based on its attributes
3. Show me how to retrieve the full details of one specific schema
4. Explain how these schemas relate to credential definitions
          `.trim(),
					},
				},
			],
		}));
		// Credential definition creation guide
		server.prompt(
			'create-credential-definition-guide',
			'Guide for creating a credential definition from a schema',
			{
				schemaId: z.string().describe('ID of the schema to use for the credential definition'),
				tag: z.string().describe('Tag for the credential definition (e.g., "default")'),
			},
			({ schemaId, tag }) => ({
				description: `Guide for creating a credential definition from schema ${schemaId}`,
				messages: [
					{
						role: 'user',
						content: {
							type: 'text',
							text: `I want to create a credential definition for schema ${schemaId} with tag "${tag}"`,
						},
					},
				],
			})
		);
		// Verification request guide
		server.prompt(
			'verification-request-guide',
			'Guide for requesting credential verification',
			{
				credentialType: z.string().describe('Type of credential to verify (e.g., "diploma", "license")'),
				attributesToCheck: z.string().describe('Specific attributes to verify (comma-separated)'),
				credentialDefinitionId: z
					.string()
					.optional()
					.describe('Optional specific credential definition ID to restrict the verification to'),
				issuerDid: z
					.string()
					.regex(/^did:cheqd:/)
					.optional()
					.describe('Optional issuer DID to restrict verification to credentials from this issuer'),
			},
			({ credentialType, attributesToCheck, credentialDefinitionId, issuerDid }) => {
				// Parse attribute list into array
				const attributes = attributesToCheck.split(',').map((attr) => attr.trim());

				// Build restrictions based on optional parameters
				const restrictionsText: string[] = [];
				if (credentialDefinitionId) {
					restrictionsText.push(`specific credential definition (${credentialDefinitionId})`);
				}
				if (issuerDid) {
					restrictionsText.push(`credentials issued by ${issuerDid}`);
				}
				const restrictionsString =
					restrictionsText.length > 0 ? ` with restrictions to ${restrictionsText.join(' and ')}` : '';
				return {
					messages: [
						{
							role: 'user',
							content: {
								type: 'text',
								text: `
                  I need to create a verification request for a ${credentialType} credential${restrictionsString}. 
                  
                  I want to verify the following attributes:
                  ${attributes.map((attr) => `- ${attr}`).join('\n')}
                  
                  Please guide me through:
                  1. Setting up a connection with the credential holder
                  2. Creating a proper proof request specifying exactly these attributes
                  3. Understanding how to interpret the verification results
                  4. Ensuring privacy and security throughout this process
                  5. Handling potential errors or edge cases
                  
                  I'd like a step-by-step walkthrough with the exact tool calls and parameters I should use.
                            `.trim(),
							},
						},
					],
				};
			}
		);

		// Connectionless credential offer guide
		server.prompt(
			'connectionless-credential-guide',
			'Guide for creating a connectionless credential offer',
			{
				credentialDefinitionId: z.string().describe('The DID URL of the credential definition to use'),
				attributes: z.string().describe('Comma-separated list of attribute:value pairs'),
				schemaName: z.string().optional().describe('Optional name of the schema for better guidance'),
				expiryDate: z.string().optional().describe('Optional expiry date for the credential (ISO format)'),
			},
			({ credentialDefinitionId, attributes, schemaName, expiryDate }) => {
				// Parse attributes into proper object format
				const attributeObj = {};
				attributes.split(',').forEach((pair) => {
					const [key, value] = pair.split(':').map((s) => s.trim());
					if (key && value) attributeObj[key] = value;
				});

				// Format attributes for display
				const formattedAttributes = Object.entries(attributeObj)
					.map(([key, value]) => `- ${key}: ${value}`)
					.join('\n');

				// Describe the credential being created
				const credentialDescription = schemaName ? `a "${schemaName}" credential` : 'this credential';

				// Add expiry information if provided
				const expiryInfo = expiryDate ? `\nThis credential will expire on ${expiryDate}.` : '';
				return {
					messages: [
						{
							role: 'user',
							content: {
								type: 'text',
								text: `
  I need to create a connectionless credential offer for ${credentialDescription} that doesn't require an existing connection with the recipient.
  
  The credential definition I want to use is:
  ${credentialDefinitionId}
  
  I want to include these credential attributes:
  ${formattedAttributes}${expiryInfo}
  
  Please guide me through:
  1. The exact format and parameters I need for the \`create-credential-offer-connectionless\` tool
  2. How to deliver the credential offer to recipients (QR code, URL, etc.)
  3. How recipients can accept and store the credential
  4. How to verify if the credential was accepted
  5. Common issues and how to troubleshoot them
  6. Security considerations when issuing credentials this way
  
  I'm looking for step-by-step instructions that I can follow to issue this credential.
            `.trim(),
							},
						},
					],
				};
			}
		);
		server.prompt(
			'manage-connections',
			{
				action: z
					.enum(['create', 'list', 'details'])
					.describe('Connection action: create, list, or get details'),
				connectionId: z.string().optional().describe('Connection ID (required for details)'),
			},
			({ action, connectionId }) => {
				let promptText = '';

				switch (action) {
					case 'create':
						promptText = `
          I need to create a new connection with another agent.
          
          Please help me:
          1. Generate a connection invitation using the create-connection-invitation-didcomm tool
          2. Understand the invitation format and QR code
          3. Learn how to share this invitation with another party
          4. Track when the invitation is accepted
          5. Verify the connection is established successfully`;
						break;

					case 'list':
						promptText = `
          I want to see all my active connections.
          
          Please help me:
          1. List all connections using the appropriate tool or resource
          2. Understand the different connection states
          3. Find out which connections are active and ready for credential exchange
          4. Organize my connections by their creation date and state`;
						break;

					case 'details':
						if (!connectionId) {
							promptText = `I need to retrieve details about a specific connection, but I haven't provided a connection ID. Please help me find my connection IDs first.`;
						} else {
							promptText = `
          I need to check the details of connection with ID: ${connectionId}
          
          Please help me:
          1. Retrieve full information about this connection
          2. Understand what state the connection is in
          3. Determine if I can issue credentials to this connection
          4. Find out when this connection was established
          5. Check if we can proceed with credential exchange`;
						}
						break;
				}

				return {
					messages: [
						{
							role: 'user',
							content: {
								type: 'text',
								text: promptText.trim(),
							},
						},
					],
				};
			}
		);
		server.prompt(
			'troubleshoot',
			{
				issue: z
					.enum([
						'connection-failed',
						'credential-issuance',
						'proof-verification',
						'did-creation',
						'schema-creation',
					])
					.describe('Type of issue to troubleshoot'),
				details: z.string().optional().describe('Additional details about the issue'),
			},
			({ issue, details }) => {
				let promptText = `I'm having trouble with ${issue}`;
				if (details) {
					promptText += `: ${details}`;
				}

				promptText += '\n\nPlease help me diagnose this issue. Specifically:\n';

				switch (issue) {
					case 'connection-failed':
						promptText += `
          1. What are common reasons for connection failures?
          2. How can I check the status of my connection attempt?
          3. What tools can I use to debug connection issues?
          4. How can I retry or reset a failed connection?
          5. How do I verify if the other party has received the invitation?`;
						break;

					case 'credential-issuance':
						promptText += `
          1. What might prevent successful credential issuance?
          2. How can I verify my credential definition is correct?
          3. What tools can I use to check the status of credential issuance?
          4. How can I check if the recipient has accepted the credential?
          5. What are the steps to retry a failed credential issuance?`;
						break;

					case 'proof-verification':
						promptText += `
          1. Why might proof verification fail?
          2. How do I check if the proof request was properly formulated?
          3. What could cause a proof to be invalid?
          4. How can I debug proof verification issues?
          5. What should I check if the holder claims they submitted a proof but verification shows nothing?`;
						break;

					case 'did-creation':
						promptText += `
          1. What are common issues with DID creation on cheqd?
          2. How can I check if my DID was successfully created?
          3. What might cause a DID creation to fail?
          4. How can I verify my DID is properly anchored on the ledger?
          5. What should I do if DID creation is taking a long time?`;
						break;

					case 'schema-creation':
						promptText += `
          1. What could prevent schema creation from succeeding?
          2. How do I verify my schema was properly created?
          3. What are common mistakes in schema definitions?
          4. How can I check for existing schemas before creating a new one?
          5. What should I do if schema creation fails?`;
						break;
				}

				return {
					messages: [
						{
							role: 'user',
							content: {
								type: 'text',
								text: promptText,
							},
						},
					],
				};
			}
		);
		server.prompt(
			'credential-revocation-guide',
			{
				credentialId: z.string().optional().describe('ID of the credential to revoke'),
				reason: z.string().optional().describe('Reason for revocation'),
			},
			({ credentialId, reason }) => {
				const reasonText = reason ? ` due to: ${reason}` : '';
				const specificCredential = credentialId
					? `a specific credential with ID: ${credentialId}${reasonText}`
					: 'a credential';

				return {
					messages: [
						{
							role: 'user',
							content: {
								type: 'text',
								text: `
          I need to understand how to revoke ${specificCredential}.
          
          Please explain:
          1. The concept of credential revocation and when it should be used
          2. The prerequisites for setting up a revocable credential
          3. How to properly revoke a credential using cheqd tools
          4. How revocation status is verified during proof presentation
          5. Best practices for handling credential revocation
          6. The implications of revocation for the credential holder
          7. Any limitations with the current revocation implementation
          
          If I've provided a specific credential ID, please guide me through the actual revocation process for this credential.
                    `.trim(),
							},
						},
					],
				};
			}
		);
		server.prompt(
			'complete-ssi-workflow',
			{
				useCase: z
					.string()
					.describe('The specific use case (e.g., "education credentials", "membership cards")'),
				attributes: z.string().optional().describe('Optional comma-separated list of credential attributes'),
			},
			({ useCase, attributes }) => {
				const attributesList = attributes ? `\nI'd like to include these attributes: ${attributes}` : '';

				return {
					messages: [
						{
							role: 'user',
							content: {
								type: 'text',
								text: `
          I want to implement a complete self-sovereign identity workflow for "${useCase}".${attributesList}
          
          Please guide me through the entire process from start to finish:
          
          1. Setting up the issuer identity (DID creation)
          2. Creating an appropriate schema and credential definition
          3. Establishing connections with credential holders
          4. Issuing credentials to connected parties
          5. Setting up verification requests
          6. Understanding verification results
          7. Managing credentials over their lifecycle (updates, revocation)
          8. Best practices for privacy and security
          
          I'd like this to be a comprehensive guide that I can follow step-by-step to implement the complete workflow.
                    `.trim(),
							},
						},
					],
				};
			}
		);
		server.prompt(
			'wallet-management',
			{
				operation: z
					.enum(['backup', 'restore', 'migrate'])
					.describe('Wallet operation: backup, restore, or migrate'),
			},
			({ operation }) => {
				let promptText = '';

				switch (operation) {
					case 'backup':
						promptText = `
          I need to backup my agent's wallet to protect my DIDs, credentials, and other data.
          
          Please help me understand:
          1. What data needs to be backed up
          2. The recommended backup procedures
          3. Best practices for secure storage of backups
          4. How often backups should be performed
          5. Any limitations or considerations for wallet backups`;
						break;

					case 'restore':
						promptText = `
          I need to restore my agent's wallet from a backup.
          
          Please help me understand:
          1. The steps to restore a wallet from backup
          2. Any prerequisites for restoration
          3. How to verify the restored wallet contains all expected data
          4. Potential issues during restoration and how to address them
          5. Best practices for wallet restoration`;
						break;

					case 'migrate':
						promptText = `
          I need to migrate my wallet to a different environment or system.
          
          Please help me understand:
          1. The process for migrating a wallet between environments
          2. How to maintain the integrity of DIDs and credentials during migration
          3. Compatibility considerations between different systems
          4. How to verify successful migration
          5. Best practices for wallet migration`;
						break;
				}

				return {
					messages: [
						{
							role: 'user',
							content: {
								type: 'text',
								text: promptText.trim(),
							},
						},
					],
				};
			}
		);
	}
}
