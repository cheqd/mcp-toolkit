import { z } from 'zod';
const CredoConfigSchema = z.object({
	name: z.string(),
	port: z.number(),
	mnemonic: z.string(),
	network: z.enum(['testnet', 'mainnet']).default('testnet'),
});

export type CredoConfig = z.infer<typeof CredoConfigSchema>;

export function loadCredoConfig(env: Record<string, string | undefined>): CredoConfig {
	try {
		return CredoConfigSchema.parse({
			name: env.CREDO_NAME,
			port: parseInt(env.CREDO_PORT || '3000', 10),
			mnemonic: env.CREDO_CHEQD_TESTNET_MNEMONIC,
			network: env.CREDO_NETWORK || 'testnet',
		});
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(`Invalid Credo configuration: ${error.message}`);
		} else {
			throw new Error('Invalid Credo configuration: Unknown error');
		}
	}
}
