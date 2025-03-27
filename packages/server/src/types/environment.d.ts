declare global {
	namespace NodeJS {
		interface ProcessEnv {
			CREDO_CHEQD_TESTNET_MNEMONIC?: string;
			CREDO_CHEQD_MAINNET_MNEMONIC?: string;
			CREDO_PORT: string | '3000';
			CREDO_NAME: string | 'credo-agent';
			CREDO_ENDPOINT?: string;
		}
	}
}

declare module '*.json' {
	const value: any;
	export default value;
}

export {};
