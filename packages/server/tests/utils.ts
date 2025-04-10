import { ChildProcess, execSync, spawn } from 'child_process';
import path from 'path';

// Helper function to start Docker containers and wait for them to be ready
export async function startDockerServices(): Promise<ChildProcess> {
	const dockerComposePath = path.resolve(__dirname, '../../../docker/docker-compose.yml');
	const process = spawn('docker', ['compose', '-f', dockerComposePath, '--profile', 'demo', 'up', '--detach']);
	return new Promise((resolve, reject) => {
		process.stdout?.on('data', (data) => console.log(`[Docker]: ${data.toString().trim()}`));
		process.stderr?.on('data', (data) => console.error(`[Docker]: ${data.toString().trim()}`));
		process.on('error', (error) => {
			console.error('Failed to start Docker services:', error);
			reject(error);
		});
		process.on('close', (code) => {
			if (code === 0) {
				console.log('Docker services started successfully.');
				waitForServices()
					.then(() => resolve(process))
					.catch(reject);
			} else {
				console.error(`Docker services exited with code ${code}`);
				reject(new Error(`Docker services exited with code ${code}`));
			}
		});
	});
}

// Check if services are healthy
async function waitForServices(maxRetries = 30, retryInterval = 2000): Promise<void> {
	console.log('Waiting for Docker services to be healthy...');
	let retries = 0;
	let servicesHealthy = false;
	while (!servicesHealthy && retries < maxRetries) {
		try {
			// Check ACA-PY Holder agent health
			const holderHealth = execSync('curl -s -o /dev/null -w "%{http_code}" http://localhost:4001/status/live');
			const holderHealthCode = holderHealth.toString().trim();
			if (holderHealthCode === '200') {
				console.log('ACA-PY Holder agent is healthy.');
				servicesHealthy = true;
			} else {
				console.log(`ACA-Py Holder agent not ready yet. Status: ${holderHealthCode}`);
				retries++;
				await new Promise((r) => setTimeout(r, retryInterval));
			}
		} catch (e) {
			console.log('Services not ready yet, retrying...');
			retries++;
			await new Promise((r) => setTimeout(r, retryInterval));
		}
	}
	if (!servicesHealthy) {
		throw new Error('Docker services are not healthy after maximum retries.');
	}
	console.log('All services are healthy.');
}

// Helper function to stop Docker containers
export function stopDockerServices() {
	try {
		console.log('Stopping Docker services.');
		const dockerComposePath = path.resolve(__dirname, '../../../docker/docker-compose.yml');
		execSync(`docker compose -f ${dockerComposePath} --profile demo down`, { stdio: 'inherit' });
		console.log('Docker services stopped successfully.');
	} catch (error) {
		console.error('Error stopping Docker services:', error);
	}
}

// Helper function to wait for a specific connection state
export async function waitForConnectionState(
	client: any,
	connectionId: string,
	desiredState: string,
	timeout = 10000,
	interval = 1000
) {
	const startTime = Date.now();

	while (Date.now() - startTime < timeout) {
		const result = await client.callTool({
			name: 'get-connection-record-didcomm',
			arguments: { connectionId },
		});

		const data = result.content ? JSON.parse(result.content[0].text) : result;
		// Check if the connection record is in the desired state
		if (data && data.state === desiredState) {
			return data;
		}

		// Wait for the specified interval before checking again
		await new Promise((resolve) => setTimeout(resolve, interval));
	}

	throw new Error(`Connection did not reach the desired state '${desiredState}' within ${timeout}ms`);
}

// Helper function to wait for a specific credential exchange state
export async function waitForCredentialExchangeState(
	credentialExchangeId: string,
	desiredState: string,
	timeout = 30000,
	interval = 2000
): Promise<any> {
	const startTime = Date.now();

	while (Date.now() - startTime < timeout) {
		const result = await fetch(`http://holder:4001/issue-credential-2.0/records/${credentialExchangeId}`);
		const data = await result.json();
		// Check if the credential exchange record is in the desired state
		if (data.cred_ex_record && data.cred_ex_record.state === desiredState) {
			return data.cred_ex_record;
		}
		// Wait for the specified interval before checking again
		await new Promise((resolve) => setTimeout(resolve, interval));
	}

	throw new Error(`Credential exchange did not reach the desired state '${desiredState}' within ${timeout}ms`);
}

// Helper function to wait for a specific presentation state
export async function waitForPresentationState(
	client: any,
	presentationExchangeId: string,
	desiredState: string,
	timeout = 10000,
	interval = 1000
) {
	const startTime = Date.now();

	while (Date.now() - startTime < timeout) {
		const result = await client.callTool({
			name: 'get-proof-record',
			arguments: { proofRecordId: presentationExchangeId },
		});

		const data = result.content ? JSON.parse(result.content[0].text) : result;
		// Check if the connection record is in the desired state
		if (data && data.state === desiredState) {
			return data;
		}

		// Wait for the specified interval before checking again
		await new Promise((resolve) => setTimeout(resolve, interval));
	}

	throw new Error(`Presentation did not reach the desired state '${desiredState}' within ${timeout}ms`);
}
