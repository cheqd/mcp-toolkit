import { startDockerServices } from './packages/server/tests/utils';

async function globalSetup() {
	await startDockerServices();
}

export default globalSetup;
