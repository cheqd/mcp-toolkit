import { ResolveAccreditationParams, ToolDefinition } from '../types.js';

/**
 * Agent class responsible for handling accreditation verification and trust assessment of DIDs.
 * Provides tools for interacting with a training/verification service to determine the trustworthiness
 * of decentralized identifiers (DIDs) in the network.
 */
export class TrustRegistryAgent {
	trainUrl: string;

	/**
	 * Creates a new instance of the TrustRegistryAgent.
	 *
	 * @param {Object} config - Configuration object for the TrustRegistryAgent
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
	verifyTrustRegistry(): ToolDefinition<typeof ResolveAccreditationParams> {
		return {
			name: 'verify-trust-registry',
			description:
				'Verify a DID or Credential against the trust registry to determine its trustworthiness, credentials status, and accreditation level',
			schema: ResolveAccreditationParams,
			handler: async (args) => {
				try {
					// Set a timeout for the fetch request
					const controller = new AbortController();
					const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
					const response = await fetch(`${this.trainUrl}/resolve-cheqd`, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							Accept: 'application/json',
						},
						body: JSON.stringify(args),
						signal: controller.signal,
					});
					// Clear the timeout
					clearTimeout(timeoutId);
					if (!response.ok) {
						throw new Error(`API request failed with status: ${response.status}`);
					}
					const data = await response.json();
					// Process and enhance the trust validation results
					const result = {
						...data,
						validationTimestamp: new Date().toISOString(),
						summary: processTrustStatus(data),
					};
					return {
						content: [
							{
								type: 'text',
								text: JSON.stringify(result, null, 2),
							},
						],
					};
				} catch (error) {
					console.error('Trust verification error:', error);
					let errorMessage = 'An unknown error occurred during trust validation';

					if (error instanceof Error && error.name === 'AbortError') {
						errorMessage = 'Trust registry validation request timed out';
					} else if (error instanceof TypeError && error.message.includes('fetch')) {
						errorMessage = `Cannot connect to trust registry service at ${this.trainUrl}`;
					} else if (error instanceof Error) {
						errorMessage = error.message;
					}
					return {
						content: [
							{
								type: 'text',
								text: JSON.stringify(
									{
										error: errorMessage,
										status: 'failed',
										timestamp: new Date().toISOString(),
									},
									null,
									2
								),
							},
						],
						isError: true,
					};
				}
			},
		};
	}
}
// Helper function to process trust status
function processTrustStatus(data) {
	// This is a placeholder - implement actual trust status logic based on your data structure
	if (!data) return 'Invalid trust data';

	if (data.VerificationStatus === true) {
		return 'Trusted - All accreditations valid';
	} else if (data.VerificationStatus === false) {
		return 'Untrusted - Accreditation validation failed';
	} else {
		return 'Indeterminate - Unable to fully verify trust status';
	}
}
