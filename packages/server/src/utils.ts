export function normalizeEnvVar(value) {
	return value?.replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1');
}
