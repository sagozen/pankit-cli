/**
 * Pankit-wide constants that should stay consistent across modules.
 * Centralizing these avoids drift between update/version/health-check paths.
 */
export const PANKIT_CLI_NPM_PACKAGE_NAME = "pankit-cli";
export const PANKIT_CLI_NPM_PACKAGE_URL = `https://www.npmjs.com/package/${PANKIT_CLI_NPM_PACKAGE_NAME}`;
export const PANKIT_CLI_GLOBAL_INSTALL_COMMAND = `npm install -g ${PANKIT_CLI_NPM_PACKAGE_NAME}`;
export const PANKIT_CLI_INSTALL_COMMANDS = [
	PANKIT_CLI_GLOBAL_INSTALL_COMMAND,
	`pnpm add -g ${PANKIT_CLI_NPM_PACKAGE_NAME}`,
	`yarn global add ${PANKIT_CLI_NPM_PACKAGE_NAME}`,
	`bun add -g ${PANKIT_CLI_NPM_PACKAGE_NAME}`,
] as const;
/**
 * Lazily evaluated so tests can override env vars after module load.
 */
export function getCliVersion(): string {
	return (
		process.env.PANKIT_CLI_VERSION?.trim() ||
		process.env.npm_package_version?.trim() ||
		"unknown"
	);
}

/**
 * Lazily evaluated — composed from getCliVersion().
 */
export function getCliUserAgent(): string {
	return `${PANKIT_CLI_NPM_PACKAGE_NAME}/${getCliVersion()}`;
}
export const DEFAULT_NETWORK_TIMEOUT_MS = 3_000;
