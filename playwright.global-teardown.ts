import { stopDockerServices } from './packages/server/tests/utils';

async function globalTeardown() {
	await stopDockerServices();
}

export default globalTeardown;
