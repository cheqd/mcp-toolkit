import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	testMatch: ['**/?(*.)test.ts'],
	moduleNameMapper: {
		'@cheqd/(.*)$': ['<rootDir>/packages/$1/src'],
	},
	collectCoverage: true,
	transform: {
		'\\.tsx?$': [
			'ts-jest',
			{
				isolatedModules: true,
			},
		],
	},
};

export default config;
