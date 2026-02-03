import { stopDockerServices } from './packages/server/tests/credo/utils';

async function globalTeardown() {
	await stopDockerServices();
}

export default globalTeardown;
