import { CredoAgent } from "./agent.js";
import { ConnectionToolHandler } from "./tools/connection.js";
import { CredentialToolHandler } from "./tools/credential.js";
import { DidToolHandler, AnonCredsToolHandler } from "./tools/index.js";

// Create a BaseToolKit
export class CredoToolKit {
    credo: CredoAgent

    constructor({ port, name, mnemonic }: { port: number | string; name: string; mnemonic: string }) {
        this.credo = new CredoAgent({ port, name, mnemonic });
    }

    async getTools() {
        return [
            new DidToolHandler(this.credo).resolveDidTool(),
            new DidToolHandler(this.credo).createDidTool(),
            new AnonCredsToolHandler(this.credo).createSchemaTool(),
            new AnonCredsToolHandler(this.credo).getSchemaTool(),
            new AnonCredsToolHandler(this.credo).createCredentialDefinitionTool(),
            new AnonCredsToolHandler(this.credo).getCredentialDefinitionTool(),
            new ConnectionToolHandler(this.credo).createConnectionInvitationTool(),
            new ConnectionToolHandler(this.credo).acceptConnectionInvitationTool(),
            new CredentialToolHandler(this.credo).connectionLessCredentialOfferTool(),
            new CredentialToolHandler(this.credo).listCredentialsTool()
        ]
    }
}