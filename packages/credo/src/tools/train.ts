import { ResolveAccreditationParams, ToolDefinition } from '../types.js';

/**
 * Agent class responsible for handling accreditation verification and trust assessment of DIDs.
 * Provides tools for interacting with a training/verification service to determine the trustworthiness
 * of decentralized identifiers (DIDs) in the network.
 */
export class TrainAgent {
	trainUrl: string;

	/**
	 * Creates a new instance of the TrainAgent.
	 *
	 * @param {Object} config - Configuration object for the TrainAgent
	 * @param {string} config.trainUrl - The URL of the training/verification service endpoint
	 */
	constructor({ trainUrl }) {
		this.trainUrl = trainUrl;
	}

	/**
	 * Resolves the accreditation status of a DID by querying the verification service.
	 * This tool performs trust assessment by checking the DID's credentials and verification status
	 * against the training service's criteria.
	 *
	 * @returns {ToolDefinition} A tool definition for resolving DID accreditations
	 */
	resolveAccreditation(): ToolDefinition<typeof ResolveAccreditationParams> {
		return {
			name: 'resolveAccreditation',
			description: 'Resolve an accreditation of a DID, This will determine if the DID is trustable or not',
			schema: ResolveAccreditationParams,
			handler: async (args) => {
				try {
					const response = await fetch(`${this.trainUrl}/resolve-cheqd`, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify(args),
					});
					if (!response.ok) {
						throw new Error(`API request failed with status: ${response.status}`);
					}
					const data = await response.json();
					return {
						content: [
							{
								type: 'text',
								text: JSON.stringify(data, null, 2),
							},
						],
					};
				} catch (error) {
					console.error('Error resolving accreditation:', error);
					return {
						content: [
							{
								type: 'text',
								text: `Error resolving accreditation: ${error instanceof Error ? error.message : String(error)}`,
							},
						],
						isError: true,
					};
				}
			},
		};
	}
}
