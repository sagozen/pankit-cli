/**
 * Tests for ConfigVersionChecker - version checking with caching and GitHub API
 */
import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ConfigVersionChecker } from "@/domains/sync/config-version-checker.js";
import { PathResolver } from "@/shared/path-resolver.js";

describe("ConfigVersionChecker", () => {
	let testDir: string;
	let originalGetCacheDir: typeof PathResolver.getCacheDir;

	beforeEach(async () => {
		testDir = join(
			tmpdir(),
			`version-checker-test-${Date.now()}-${Math.random().toString(36).slice(2)}`,
		);
		await mkdir(testDir, { recursive: true });

		// Mock getCacheDir to use test directory
		originalGetCacheDir = PathResolver.getCacheDir;
		PathResolver.getCacheDir = () => testDir;
	});

	afterEach(async () => {
		// Restore original
		PathResolver.getCacheDir = originalGetCacheDir;

		try {
			await rm(testDir, { recursive: true, force: true });
		} catch {
			// Ignore cleanup errors
		}
	});

	describe("checkForUpdates", () => {
		it("returns cached result when cache is valid", async () => {
			// Create a valid cache file
			const cache = {
				lastCheck: Date.now(),
				latestVersion: "2.0.0",
				etag: "test-etag",
			};
			await writeFile(join(testDir, "community-config-update-cache.json"), JSON.stringify(cache));

			const result = await ConfigVersionChecker.checkForUpdates("community", "1.0.0", false);

			expect(result.hasUpdates).toBe(true);
			expect(result.currentVersion).toBe("1.0.0");
			expect(result.latestVersion).toBe("2.0.0");
			expect(result.fromCache).toBe(true);
		});

		it("normalizes version strings (removes v prefix)", async () => {
			const cache = {
				lastCheck: Date.now(),
				latestVersion: "1.5.0",
			};
			await writeFile(join(testDir, "community-config-update-cache.json"), JSON.stringify(cache));

			const result = await ConfigVersionChecker.checkForUpdates("community", "v1.5.0", false);

			expect(result.currentVersion).toBe("1.5.0");
			expect(result.hasUpdates).toBe(false);
		});

		it("reports no updates when versions match", async () => {
			const cache = {
				lastCheck: Date.now(),
				latestVersion: "1.0.0",
			};
			await writeFile(join(testDir, "community-config-update-cache.json"), JSON.stringify(cache));

			const result = await ConfigVersionChecker.checkForUpdates("community", "1.0.0", false);

			expect(result.hasUpdates).toBe(false);
		});

		it("reports no updates when current is newer", async () => {
			const cache = {
				lastCheck: Date.now(),
				latestVersion: "1.0.0",
			};
			await writeFile(join(testDir, "community-config-update-cache.json"), JSON.stringify(cache));

			const result = await ConfigVersionChecker.checkForUpdates("community", "2.0.0", false);

			expect(result.hasUpdates).toBe(false);
		});

		it("uses stale cache on fetch failure", async () => {
			// Create stale cache (older than TTL)
			const cache = {
				lastCheck: Date.now() - 48 * 60 * 60 * 1000, // 48 hours ago
				latestVersion: "1.5.0",
			};
			await writeFile(join(testDir, "community-config-update-cache.json"), JSON.stringify(cache));

			// Mock fetch to fail
			const originalFetch = globalThis.fetch;
			globalThis.fetch = Object.assign(
				async () => {
					throw new Error("Network error");
				},
				{ preconnect: () => {} },
			) as typeof fetch;

			try {
				const result = await ConfigVersionChecker.checkForUpdates("community", "1.0.0", false);

				expect(result.hasUpdates).toBe(true);
				expect(result.latestVersion).toBe("1.5.0");
				expect(result.fromCache).toBe(true);
			} finally {
				globalThis.fetch = originalFetch;
			}
		});

		it("returns no updates when fetch fails and no cache", async () => {
			// Mock fetch to fail
			const originalFetch = globalThis.fetch;
			globalThis.fetch = Object.assign(
				async () => {
					throw new Error("Network error");
				},
				{ preconnect: () => {} },
			) as typeof fetch;

			try {
				const result = await ConfigVersionChecker.checkForUpdates("community", "1.0.0", false);

				expect(result.hasUpdates).toBe(false);
				expect(result.currentVersion).toBe("1.0.0");
				expect(result.latestVersion).toBe("1.0.0");
				expect(result.fromCache).toBe(false);
			} finally {
				globalThis.fetch = originalFetch;
			}
		});
	});

	describe("clearCache", () => {
		it("removes cache file when exists", async () => {
			const cachePath = join(testDir, "community-config-update-cache.json");
			await writeFile(cachePath, JSON.stringify({ lastCheck: Date.now() }));

			await ConfigVersionChecker.clearCache("community", false);

			await expect(readFile(cachePath)).rejects.toThrow();
		});

		it("does not throw when cache file does not exist", async () => {
			// Should not throw
			await expect(ConfigVersionChecker.clearCache("community", false)).resolves.toBeUndefined();
		});
	});

	describe("version comparison", () => {
		it("correctly compares semantic versions", async () => {
			const testCases = [
				{ current: "1.0.0", latest: "1.0.1", hasUpdates: true },
				{ current: "1.0.0", latest: "1.1.0", hasUpdates: true },
				{ current: "1.0.0", latest: "2.0.0", hasUpdates: true },
				{ current: "1.0.1", latest: "1.0.0", hasUpdates: false },
				{ current: "1.1.0", latest: "1.0.0", hasUpdates: false },
				{ current: "2.0.0", latest: "1.0.0", hasUpdates: false },
			];

			for (const { current, latest, hasUpdates } of testCases) {
				const cache = {
					lastCheck: Date.now(),
					latestVersion: latest,
				};
				await writeFile(join(testDir, "community-config-update-cache.json"), JSON.stringify(cache));

				const result = await ConfigVersionChecker.checkForUpdates("community", current, false);
				expect(result.hasUpdates).toBe(hasUpdates);
			}
		});
	});

	describe("cache file handling", () => {
		it("handles corrupted cache file gracefully", async () => {
			await writeFile(join(testDir, "community-config-update-cache.json"), "not valid json{{{");

			// Mock fetch to return a result
			const originalFetch = globalThis.fetch;
			globalThis.fetch = Object.assign(
				async () => {
					throw new Error("Network error");
				},
				{ preconnect: () => {} },
			) as typeof fetch;

			try {
				// Should not throw, should return no updates
				const result = await ConfigVersionChecker.checkForUpdates("community", "1.0.0", false);
				expect(result.hasUpdates).toBe(false);
			} finally {
				globalThis.fetch = originalFetch;
			}
		});

		it("uses separate cache files per kit type", async () => {
			const communityCache = {
				lastCheck: Date.now(),
				latestVersion: "2.0.0",
			};
			const proCache = {
				lastCheck: Date.now(),
				latestVersion: "3.0.0",
			};

			await writeFile(
				join(testDir, "community-config-update-cache.json"),
				JSON.stringify(communityCache),
			);
			await writeFile(
				join(testDir, "pro-config-update-cache.json"),
				JSON.stringify(proCache),
			);

			const communityResult = await ConfigVersionChecker.checkForUpdates("community", "1.0.0", false);
			const proResult = await ConfigVersionChecker.checkForUpdates(
				"pro",
				"1.0.0",
				false,
			);

			expect(communityResult.latestVersion).toBe("2.0.0");
			expect(proResult.latestVersion).toBe("3.0.0");
		});
	});
});
