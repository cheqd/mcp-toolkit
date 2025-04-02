import type { Config } from '@jest/types';
const config: Config.InitialOptions = {
	preset: 'ts-jest',
	moduleNameMapper: {
		'^(\\.{1,2}/.*)\\.js$': '$1',
	},
	extensionsToTreatAsEsm: ['.ts'],
	transform: {
		'^.+\\.tsx?$': ['ts-jest', { useESM: true }],
	},
	testMatch: ['**/tests/**/*.test.ts'],
	collectCoverageFrom: ['src/**/*.{ts,js}'],
	moduleDirectories: ['node_modules', 'src'],
	testEnvironment: 'node',
	testTimeout: 10 * 1000, // 10s
};

export default config;
