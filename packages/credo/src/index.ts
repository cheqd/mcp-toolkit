import { CredoAgent } from "./agent.js";
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
            new AnonCredsToolHandler(this.credo).getSchemaTool()
        ]
    }
}