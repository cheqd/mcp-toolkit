import { stopDockerServies } from './packages/server/tests/utils';

async function globalTeardown() {
	await stopDockerServies();
}

export default globalTeardown;
