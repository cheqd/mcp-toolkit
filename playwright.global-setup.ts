import { startDockerServices } from './packages/server/tests/credo/utils';

async function globalSetup() {
	await startDockerServices();
}

export default globalSetup;
