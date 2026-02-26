/**
 * Kit configuration types and constants
 */
import { z } from "zod";

// Kit types
export const KitType = z.enum(["community", "pro"]);
export type KitType = z.infer<typeof KitType>;

// Runtime validation helper - validates string is valid KitType before unsafe casts
export function isValidKitType(value: string): value is KitType {
	return value === "community" || value === "pro";
}

// Kit configuration
export const KitConfigSchema = z.object({
	name: z.string(),
	repo: z.string(),
	owner: z.string(),
	description: z.string(),
});
export type KitConfig = z.infer<typeof KitConfigSchema>;

// Available kits
export const AVAILABLE_KITS: Record<KitType, KitConfig> = {
	engineer: {
		name: "Pankit Community",
		repo: "pankit-community",
		owner: "sagozen",
		description: "Community toolkit for agentic workflows with Claude",
	},
	marketing: {
		name: "Pankit Pro",
		repo: "pankit-pro",
		owner: "sagozen",
		description: "Professional toolkit for agentic workflows with Claude",
	},
};

// Security-sensitive files that should NEVER be copied from templates
// These files may contain secrets, keys, or credentials and must never overwrite user's versions
export const NEVER_COPY_PATTERNS = [
	// Environment and secrets
	".env",
	".env.local",
	".env.*.local",
	"*.key",
	"*.pem",
	"*.p12",
	// Dependencies and build artifacts
	"node_modules/**",
	".git/**",
	"dist/**",
	"build/**",
	// Python virtual environments (prevents EMFILE on Windows with large venvs)
	// Root level
	".venv/**",
	"venv/**",
	"__pycache__/**",
	// Nested at any depth (e.g., skills/.venv, mypackage/__pycache__)
	"**/.venv/**",
	"**/venv/**",
	"**/__pycache__/**",
];

// User configuration files that should only be skipped if they already exist
// On first installation, these should be copied; on updates, preserve user's version
export const USER_CONFIG_PATTERNS = [
	".gitignore",
	".repomixignore",
	".mcp.json",
	".ckignore",
	".pk.json",
	"CLAUDE.md",
];

// Combined protected patterns for backward compatibility
export const PROTECTED_PATTERNS = [...NEVER_COPY_PATTERNS, ...USER_CONFIG_PATTERNS];
