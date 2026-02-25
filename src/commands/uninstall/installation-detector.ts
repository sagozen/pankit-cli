/**
 * Installation Detector
 *
 * Detects Pankit installations (local and global).
 * Handles HOME directory edge case where local === global.
 * Supports fallback detection for legacy installs without metadata.json.
 */

import { getPankitSetup } from "@/services/file-operations/pankit-scanner.js";
import { PathResolver } from "@/shared/path-resolver.js";
import type { ComponentCounts } from "@/types";
import { pathExists } from "fs-extra";

export interface Installation {
	type: "local" | "global";
	path: string;
	exists: boolean;
	/** Whether metadata.json exists (false = legacy/corrupted install) */
	hasMetadata: boolean;
	/** Component counts (skills, commands, etc.) - used for fallback detection */
	components: ComponentCounts;
}

/**
 * Check if component counts indicate Pankit files exist
 */
function hasPankitComponents(components: ComponentCounts): boolean {
	return (
		components.agents > 0 ||
		components.commands > 0 ||
		components.rules > 0 ||
		components.skills > 0
	);
}

/**
 * Detect both local and global Pankit installations
 * Deduplicates when at HOME directory (local path === global path)
 *
 * Detection strategy:
 * 1. Primary: metadata.json exists (tracked installation)
 * 2. Fallback: .claude/ has Pankit components (legacy/corrupted install)
 */
export async function detectInstallations(): Promise<Installation[]> {
	const installations: Installation[] = [];

	// Detect both local and global installations
	const setup = await getPankitSetup(process.cwd());

	// Check if local and global point to same path (HOME directory edge case)
	const isLocalSameAsGlobal = PathResolver.isLocalSameAsGlobal();

	// Add local installation if found
	// Skip if local === global to avoid duplicates
	if (setup.project.path && !isLocalSameAsGlobal) {
		const hasMetadata = setup.project.metadata !== null;
		const hasComponents = hasPankitComponents(setup.project.components);

		// Detect if: has metadata OR has Pankit components (fallback)
		if (hasMetadata || hasComponents) {
			installations.push({
				type: "local",
				path: setup.project.path,
				exists: await pathExists(setup.project.path),
				hasMetadata,
				components: setup.project.components,
			});
		}
	}

	// Add global installation if found
	if (setup.global.path) {
		const hasMetadata = setup.global.metadata !== null;
		const hasComponents = hasPankitComponents(setup.global.components);

		// Detect if: has metadata OR has Pankit components (fallback)
		if (hasMetadata || hasComponents) {
			installations.push({
				type: "global",
				path: setup.global.path,
				exists: await pathExists(setup.global.path),
				hasMetadata,
				components: setup.global.components,
			});
		}
	}

	return installations.filter((i) => i.exists);
}
