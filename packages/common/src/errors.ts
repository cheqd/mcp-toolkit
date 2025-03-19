// packages/common/src/errors.ts
export class McpToolkitError extends Error {
	constructor(
		message: string,
		public code: string
	) {
		super(message);
		this.name = 'McpToolkitError';
	}
}

export class CredoAgentError extends McpToolkitError {
	constructor(message: string) {
		super(message, 'CREDO_AGENT_ERROR');
		this.name = 'CredoAgentError';
	}
}
