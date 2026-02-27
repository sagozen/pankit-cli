/**
 * Tests for ManifestWriter multi-kit functionality
 */
import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ManifestWriter } from "@/services/file-operations/manifest-writer.js";
import type { Metadata, TrackedFile } from "@/types";

describe("ManifestWriter multi-kit", () => {
	let testDir: string;

	beforeEach(async () => {
		testDir = join(tmpdir(), `manifest-writer-multikit-test-${Date.now()}`);
		await mkdir(testDir, { recursive: true });
	});

	afterEach(async () => {
		try {
			await rm(testDir, { recursive: true, force: true });
		} catch {
			// Ignore cleanup errors
		}
	});

	describe("writeManifest (multi-kit)", () => {
		it("creates multi-kit structure for fresh install", async () => {
			const writer = new ManifestWriter();

			await writer.writeManifest(testDir, "Pankit Community", "v1.2.3", "local", "community");

			const content = await readFile(join(testDir, "metadata.json"), "utf-8");
			const metadata = JSON.parse(content) as Metadata;

			expect(metadata.kits).toBeDefined();
			expect(metadata.kits?.community?.version).toBe("v1.2.3");
			expect(metadata.scope).toBe("local");
			// Legacy fields preserved for backward compat
			expect(metadata.name).toBe("Pankit Community");
			expect(metadata.version).toBe("v1.2.3");
		});

		it("preserves existing kits when adding new kit", async () => {
			// Pre-create multi-kit metadata with community
			const existing: Metadata = {
				kits: {
					community: {
						version: "v1.0.0",
						installedAt: "2024-01-01T00:00:00.000Z",
						files: [],
					},
				},
				scope: "local",
			};
			await writeFile(join(testDir, "metadata.json"), JSON.stringify(existing));

			// Add pro kit
			const writer = new ManifestWriter();
			await writer.writeManifest(testDir, "Pankit Pro", "v0.1.0", "local", "pro");

			const content = await readFile(join(testDir, "metadata.json"), "utf-8");
			const metadata = JSON.parse(content) as Metadata;

			expect(metadata.kits?.community?.version).toBe("v1.0.0");
			expect(metadata.kits?.pro?.version).toBe("v0.1.0");
		});

		it("updates existing kit version", async () => {
			// Pre-create multi-kit metadata
			const existing: Metadata = {
				kits: {
					community: {
						version: "v1.0.0",
						installedAt: "2024-01-01T00:00:00.000Z",
					},
				},
				scope: "local",
			};
			await writeFile(join(testDir, "metadata.json"), JSON.stringify(existing));

			// Update community kit
			const writer = new ManifestWriter();
			await writer.writeManifest(testDir, "Pankit Community", "v2.0.0", "local", "community");

			const content = await readFile(join(testDir, "metadata.json"), "utf-8");
			const metadata = JSON.parse(content) as Metadata;

			expect(metadata.kits?.community?.version).toBe("v2.0.0");
		});

		it("migrates legacy format before writing", async () => {
			// Pre-create legacy metadata
			const legacy: Metadata = {
				name: "Pankit Community",
				version: "v1.0.0",
				installedAt: "2024-01-01T00:00:00.000Z",
				scope: "global",
				files: [],
			};
			await writeFile(join(testDir, "metadata.json"), JSON.stringify(legacy));

			// Write pro kit (should trigger migration)
			const writer = new ManifestWriter();
			await writer.writeManifest(testDir, "Pankit Pro", "v0.1.0", "global", "pro");

			const content = await readFile(join(testDir, "metadata.json"), "utf-8");
			const metadata = JSON.parse(content) as Metadata;

			// Should have both kits
			expect(metadata.kits?.community?.version).toBe("v1.0.0");
			expect(metadata.kits?.pro?.version).toBe("v0.1.0");
			// DEPRECATED: Legacy fields preserved from first kit, not overwritten
			// Use kits object for version display instead
			expect(metadata.name).toBe("Pankit Community");
		});

		it("infers kit type from name if not provided", async () => {
			const writer = new ManifestWriter();

			// Pro kit should be inferred from name
			await writer.writeManifest(testDir, "Pankit Pro", "v0.1.0", "local");

			const content = await readFile(join(testDir, "metadata.json"), "utf-8");
			const metadata = JSON.parse(content) as Metadata;

			expect(metadata.kits?.pro?.version).toBe("v0.1.0");
		});

		it("defaults to community if kit type cannot be inferred", async () => {
			const writer = new ManifestWriter();

			await writer.writeManifest(testDir, "Some Other Kit", "v1.0.0", "local");

			const content = await readFile(join(testDir, "metadata.json"), "utf-8");
			const metadata = JSON.parse(content) as Metadata;

			expect(metadata.kits?.community?.version).toBe("v1.0.0");
		});
	});

	describe("readKitManifest", () => {
		it("returns kit-specific metadata", async () => {
			const metadata: Metadata = {
				kits: {
					community: {
						version: "v1.2.3",
						installedAt: "2024-01-01T00:00:00.000Z",
						files: [],
					},
					pro: {
						version: "v0.1.0",
						installedAt: "2024-02-01T00:00:00.000Z",
					},
				},
			};
			await writeFile(join(testDir, "metadata.json"), JSON.stringify(metadata));

			const result = await ManifestWriter.readKitManifest(testDir, "community");

			expect(result?.version).toBe("v1.2.3");
		});

		it("returns null for non-existent kit", async () => {
			const metadata: Metadata = {
				kits: {
					community: {
						version: "v1.0.0",
						installedAt: "2024-01-01T00:00:00.000Z",
					},
				},
			};
			await writeFile(join(testDir, "metadata.json"), JSON.stringify(metadata));

			const result = await ManifestWriter.readKitManifest(testDir, "pro");

			expect(result).toBeNull();
		});

		it("returns null when no metadata.json", async () => {
			const result = await ManifestWriter.readKitManifest(testDir, "community");
			expect(result).toBeNull();
		});
	});

	describe("getUninstallManifest (multi-kit)", () => {
		it("returns all files for full uninstall", async () => {
			const file1: TrackedFile = {
				path: "commands/community.md",
				checksum: "abc123abc123abc123abc123abc123abc123abc123abc123abc123abc123abc1",
				ownership: "ck",
				installedVersion: "v1.0.0",
			};
			const file2: TrackedFile = {
				path: "commands/pro.md",
				checksum: "def456def456def456def456def456def456def456def456def456def456def4",
				ownership: "ck",
				installedVersion: "v0.1.0",
			};

			const metadata: Metadata = {
				kits: {
					community: {
						version: "v1.0.0",
						installedAt: "2024-01-01T00:00:00.000Z",
						files: [file1],
					},
					pro: {
						version: "v0.1.0",
						installedAt: "2024-02-01T00:00:00.000Z",
						files: [file2],
					},
				},
			};
			await writeFile(join(testDir, "metadata.json"), JSON.stringify(metadata));

			const result = await ManifestWriter.getUninstallManifest(testDir);

			expect(result.isMultiKit).toBe(true);
			expect(result.filesToRemove.length).toBe(2);
			expect(result.remainingKits.length).toBe(0);
		});

		it("returns kit-specific files for kit-scoped uninstall", async () => {
			const file1: TrackedFile = {
				path: "commands/community.md",
				checksum: "abc123abc123abc123abc123abc123abc123abc123abc123abc123abc123abc1",
				ownership: "ck",
				installedVersion: "v1.0.0",
			};
			const file2: TrackedFile = {
				path: "commands/pro.md",
				checksum: "def456def456def456def456def456def456def456def456def456def456def4",
				ownership: "ck",
				installedVersion: "v0.1.0",
			};

			const metadata: Metadata = {
				kits: {
					community: {
						version: "v1.0.0",
						installedAt: "2024-01-01T00:00:00.000Z",
						files: [file1],
					},
					pro: {
						version: "v0.1.0",
						installedAt: "2024-02-01T00:00:00.000Z",
						files: [file2],
					},
				},
			};
			await writeFile(join(testDir, "metadata.json"), JSON.stringify(metadata));

			const result = await ManifestWriter.getUninstallManifest(testDir, "community");

			expect(result.isMultiKit).toBe(true);
			expect(result.filesToRemove).toContain("commands/community.md");
			expect(result.filesToRemove).not.toContain("commands/pro.md");
			expect(result.remainingKits).toContain("pro");
		});

		it("preserves shared files during kit-scoped uninstall", async () => {
			const sharedFile: TrackedFile = {
				path: "shared/common.md",
				checksum: "shared1shared1shared1shared1shared1shared1shared1shared1shared1shar",
				ownership: "ck",
				installedVersion: "v1.0.0",
			};
			const communityFile: TrackedFile = {
				path: "commands/community.md",
				checksum: "abc123abc123abc123abc123abc123abc123abc123abc123abc123abc123abc1",
				ownership: "ck",
				installedVersion: "v1.0.0",
			};

			const metadata: Metadata = {
				kits: {
					community: {
						version: "v1.0.0",
						installedAt: "2024-01-01T00:00:00.000Z",
						files: [sharedFile, communityFile],
					},
					pro: {
						version: "v0.1.0",
						installedAt: "2024-02-01T00:00:00.000Z",
						files: [sharedFile], // Shared file
					},
				},
			};
			await writeFile(join(testDir, "metadata.json"), JSON.stringify(metadata));

			const result = await ManifestWriter.getUninstallManifest(testDir, "community");

			// Shared file should be preserved
			expect(result.filesToRemove).toContain("commands/community.md");
			expect(result.filesToRemove).not.toContain("shared/common.md");
			expect(result.filesToPreserve).toContain("shared/common.md");
		});

		it("handles shared files with different versions across kits", async () => {
			// Same file tracked by both kits but with different versions/checksums
			const communityVersion: TrackedFile = {
				path: "shared/config.md",
				checksum: "eng111eng111eng111eng111eng111eng111eng111eng111eng111eng111eng1",
				ownership: "ck",
				installedVersion: "v1.0.0",
			};
			const proVersion: TrackedFile = {
				path: "shared/config.md", // Same path
				checksum: "mkt222mkt222mkt222mkt222mkt222mkt222mkt222mkt222mkt222mkt222mkt2", // Different checksum
				ownership: "ck",
				installedVersion: "v0.2.0", // Different version
			};

			const metadata: Metadata = {
				kits: {
					community: {
						version: "v1.0.0",
						installedAt: "2024-01-01T00:00:00.000Z",
						files: [communityVersion],
					},
					pro: {
						version: "v0.2.0",
						installedAt: "2024-02-01T00:00:00.000Z",
						files: [proVersion],
					},
				},
			};
			await writeFile(join(testDir, "metadata.json"), JSON.stringify(metadata));

			// When uninstalling community kit, shared file should be preserved for pro
			const result = await ManifestWriter.getUninstallManifest(testDir, "community");

			expect(result.filesToRemove).not.toContain("shared/config.md");
			expect(result.filesToPreserve).toContain("shared/config.md");
			expect(result.remainingKits).toContain("pro");
		});

		it("handles files with same checksum but different ownership across kits", async () => {
			// Edge case: same file, same content, but tracked with different ownership
			const sharedChecksum = "same1same1same1same1same1same1same1same1same1same1same1same1same";
			const communityFile: TrackedFile = {
				path: "shared/utility.md",
				checksum: sharedChecksum,
				ownership: "ck",
				installedVersion: "v1.0.0",
			};
			const proFile: TrackedFile = {
				path: "shared/utility.md",
				checksum: sharedChecksum,
				ownership: "pk-modified", // Different ownership status
				installedVersion: "v1.0.0",
			};

			const metadata: Metadata = {
				kits: {
					community: {
						version: "v1.0.0",
						installedAt: "2024-01-01T00:00:00.000Z",
						files: [communityFile],
					},
					pro: {
						version: "v1.0.0",
						installedAt: "2024-02-01T00:00:00.000Z",
						files: [proFile],
					},
				},
			};
			await writeFile(join(testDir, "metadata.json"), JSON.stringify(metadata));

			// Shared file should be preserved regardless of ownership differences
			const result = await ManifestWriter.getUninstallManifest(testDir, "community");

			expect(result.filesToRemove).not.toContain("shared/utility.md");
			expect(result.filesToPreserve).toContain("shared/utility.md");
		});

		it("handles legacy format gracefully", async () => {
			const file: TrackedFile = {
				path: "commands/test.md",
				checksum: "abc123abc123abc123abc123abc123abc123abc123abc123abc123abc123abc1",
				ownership: "ck",
				installedVersion: "v1.0.0",
			};

			const legacy: Metadata = {
				name: "Pankit Community",
				version: "v1.0.0",
				files: [file],
			};
			await writeFile(join(testDir, "metadata.json"), JSON.stringify(legacy));

			const result = await ManifestWriter.getUninstallManifest(testDir);

			expect(result.isMultiKit).toBe(false);
			expect(result.filesToRemove).toContain("commands/test.md");
		});
	});

	describe("removeKitFromManifest", () => {
		it("removes kit from multi-kit metadata", async () => {
			const metadata: Metadata = {
				kits: {
					community: {
						version: "v1.0.0",
						installedAt: "2024-01-01T00:00:00.000Z",
					},
					pro: {
						version: "v0.1.0",
						installedAt: "2024-02-01T00:00:00.000Z",
					},
				},
				scope: "local",
			};
			await writeFile(join(testDir, "metadata.json"), JSON.stringify(metadata));

			const result = await ManifestWriter.removeKitFromManifest(testDir, "community");

			expect(result).toBe(true);

			const content = await readFile(join(testDir, "metadata.json"), "utf-8");
			const updated = JSON.parse(content) as Metadata;

			expect(updated.kits?.community).toBeUndefined();
			expect(updated.kits?.pro?.version).toBe("v0.1.0");
		});

		it("returns true even when removing last kit (metadata.json cleanup handled separately)", async () => {
			const metadata: Metadata = {
				kits: {
					community: {
						version: "v1.0.0",
						installedAt: "2024-01-01T00:00:00.000Z",
					},
				},
			};
			await writeFile(join(testDir, "metadata.json"), JSON.stringify(metadata));

			const result = await ManifestWriter.removeKitFromManifest(testDir, "community");

			expect(result).toBe(true);
		});

		it("returns false for non-existent kit", async () => {
			const metadata: Metadata = {
				kits: {
					community: {
						version: "v1.0.0",
						installedAt: "2024-01-01T00:00:00.000Z",
					},
				},
			};
			await writeFile(join(testDir, "metadata.json"), JSON.stringify(metadata));

			const result = await ManifestWriter.removeKitFromManifest(testDir, "pro");

			expect(result).toBe(false);
		});

		it("returns false when no metadata.json", async () => {
			const result = await ManifestWriter.removeKitFromManifest(testDir, "community");
			expect(result).toBe(false);
		});
	});
});
