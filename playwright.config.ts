import { defineConfig } from '@playwright/test';
import * as dotenv from 'dotenv';
dotenv.config();

export default defineConfig({
	testDir: './packages/server/tests',
	// Timeout for each test in milliseconds
	// Docs: https://playwright.dev/docs/test-timeouts
	timeout: 90 * 1000,
	// Fail the build on CI if you accidentally left test.only in the source code
	// Docs: https://playwright.dev/docs/api/class-testconfig#test-config-forbid-only
	forbidOnly: !!process.env.CI,
	// Whether to run tests in parallel
	// Docs: https://playwright.dev/docs/api/class-testconfig#test-config-fully-parallel
	fullyParallel: false,
	// The maximum number of retry attempts given to failed tests
	// Docs: https://playwright.dev/docs/api/class-testconfig#test-config-retries
	retries: process.env.CI ? 2 : 0,
	// Number of parallel workers OR %age of logical CPUs to use
	// Github Actions runners have 2 logical CPU cores
	// Defaults to half of the logical CPU cores available
	// Docs: https://playwright.dev/docs/api/class-testconfig#test-config-workers
	workers: 1, // We want to run tests in sequence
	// Reporter to use for test results
	// Uses GitHub Actions reporter on CI, otherwise uses HTML reporter
	// Docs: https://playwright.dev/docs/test-reporters
	reporter: process.env.CI ? 'github' : 'html',
	// Shared settings for all the projects below.
	// Docs: https://playwright.dev/docs/api/class-testoptions
	use: {
		// Set whether to record traces
		// Docs: https://playwright.dev/docs/api/class-testoptions#test-options-trace
		trace: 'retain-on-failure',

		// Set whether to record screenshots
		// Docs: https://playwright.dev/docs/api/class-testoptions#test-options-screenshot
		screenshot: 'off',

		// Set whether to record videos
		// Docs: https://playwright.dev/docs/api/class-testoptions#test-options-video
		video: 'off',
	},
	// Configure project specific settings
	// Docs: https://playwright.dev/docs/test-projects
	projects: [
		{
			name: 'node',
			testMatch: /.*\.spec\.ts/,
		},
	],
	// Set up global services
	globalSetup: './playwright.global-setup.ts',
	globalTeardown: './playwright.global-teardown.ts',
});
