import * as dotenv from 'dotenv';
import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { AgentMcpServer } from './server.js';
import { normalizeEnvVar } from './utils.js';

dotenv.config();

// Get the module's package.json
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageJsonPath = path.join(__dirname, '../package.json');
const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf-8'));

const tools = process.env.TOOLS ? normalizeEnvVar(process.env.TOOLS).split(',') : [];
// Create and start the server
const agentServer = new AgentMcpServer({
	tools,
	version: packageJson.version,
	credo: {
		port: parseInt(process.env.CREDO_PORT || '3000', 10),
		domain: normalizeEnvVar(process.env.CREDO_DOMAIN),
		name: normalizeEnvVar(process.env.CREDO_NAME),
		cosmosPayerSeed: normalizeEnvVar(process.env.CREDO_CHEQD_TESTNET_MNEMONIC),
	},
});
agentServer.start().catch((err) => {
	console.error('Unhandled error in server startup:', err);
	process.exit(1);
});
