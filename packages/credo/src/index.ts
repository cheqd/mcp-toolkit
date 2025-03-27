import { CredoAgent } from './agent.js';
import { ConnectionToolHandler } from './tools/connection.js';
import { CredentialToolHandler } from './tools/credential.js';
import { DidToolHandler, AnonCredsToolHandler } from './tools/index.js';
import { ICredoToolKitOptions } from './types.js';

// Create a BaseToolKit
export class CredoToolKit {
	credo: CredoAgent;

	constructor({ port, name, mnemonic, endpoint }: ICredoToolKitOptions) {
		this.credo = new CredoAgent({ port, name, mnemonic, endpoint });
	}

	async getTools() {
		return [
			new DidToolHandler(this.credo).resolveDidTool(),
			new DidToolHandler(this.credo).createDidTool(),
			new DidToolHandler(this.credo).updateDidTool(),
			new DidToolHandler(this.credo).deactivateDidTool(),
			new DidToolHandler(this.credo).listDidTool(),
			new DidToolHandler(this.credo).createDIDLinkedResourceTool(),
			new DidToolHandler(this.credo).resolveDIDLinkedResourceTool(),
			new AnonCredsToolHandler(this.credo).createSchemaTool(),
			new AnonCredsToolHandler(this.credo).listSchemaTool(),
			new AnonCredsToolHandler(this.credo).getSchemaTool(),
			new AnonCredsToolHandler(this.credo).createCredentialDefinitionTool(),
			new AnonCredsToolHandler(this.credo).listCredentialDefinitionTool(),
			new AnonCredsToolHandler(this.credo).getCredentialDefinitionTool(),
			new ConnectionToolHandler(this.credo).createConnectionInvitationTool(),
			new ConnectionToolHandler(this.credo).acceptConnectionInvitationTool(),
			new ConnectionToolHandler(this.credo).listConnections(),
			new ConnectionToolHandler(this.credo).getConnectionRecord(),
			new CredentialToolHandler(this.credo).connectionLessCredentialOfferTool(),
			new CredentialToolHandler(this.credo).connectionCredentialOfferTool(),
			new CredentialToolHandler(this.credo).listCredentialsTool(),
			new CredentialToolHandler(this.credo).getCredentialRecordTool(),
		];
	}
}
