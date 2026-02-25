import type { PankitSetup } from "@/types";
import type { CheckResult } from "../types.js";
import { formatVersion } from "../utils/version-formatter.js";

/**
 * Check global Pankit installation
 */
export function checkGlobalInstall(setup: PankitSetup): CheckResult {
	const hasGlobal = !!setup.global.path;
	const metadata = setup.global.metadata;
	const kitName = metadata?.name || "Pankit";
	const version = formatVersion(metadata?.version);

	return {
		id: "ck-global-install",
		name: "Global CK",
		group: "pankit",
		priority: "critical",
		status: hasGlobal ? "pass" : "warn",
		message: hasGlobal ? `${kitName} ${version}` : "Not installed",
		details: hasGlobal ? setup.global.path : undefined,
		suggestion: !hasGlobal ? "Install globally: ck init --global" : undefined,
		autoFixable: false, // Manual: ck init --global
	};
}

/**
 * Check project Pankit installation
 */
export function checkProjectInstall(setup: PankitSetup): CheckResult {
	const metadata = setup.project.metadata;
	// A real Pankit project requires metadata.json (not just .claude dir)
	const hasProject = !!metadata;
	const kitName = metadata?.name || "Pankit";
	const version = formatVersion(metadata?.version);

	return {
		id: "ck-project-install",
		name: "Project CK",
		group: "pankit",
		priority: "standard",
		status: hasProject ? "pass" : "info",
		message: hasProject ? `${kitName} ${version}` : "Not a Pankit project",
		details: hasProject ? setup.project.path : undefined,
		suggestion: !hasProject ? "Initialize: ck new or ck init" : undefined,
		autoFixable: false, // Requires user choice
	};
}
