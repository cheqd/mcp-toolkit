declare global {
	namespace NodeJS {
		interface ProcessEnv {
			CREDO_CHEQD_TESTNET_MNEMONIC?: string;
			CREDO_CHEQD_MAINNET_MNEMONIC?: string;
			CREDO_PORT?: string;
			CREDO_NAME?: string;
		}
	}
}

declare module '*.json' {
	const value: any;
	export default value;
}

export {};
