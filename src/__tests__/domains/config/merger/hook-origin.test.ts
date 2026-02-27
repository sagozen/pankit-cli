import { describe, expect, it } from "bun:test";
import { mergeSettings } from "@/domains/config/merger/merge-engine.js";
import type { SettingsJson } from "@/domains/config/merger/types.js";

describe("Hook Origin Tracking", () => {
	it("tracks hooks by origin kit", () => {
		const source: SettingsJson = {
			hooks: {
				PostToolUse: [
					{
						type: "command",
						command: "node ~/.claude/scripts/foo.cjs",
					},
				],
			},
		};
		const dest: SettingsJson = {};

		const result = mergeSettings(source, dest, { sourceKit: "community" });

		expect(result.hooksByOrigin).toBeDefined();
		expect(result.hooksByOrigin.get("community")).toContain("node ~/.claude/scripts/foo.cjs");
	});

	it("separates hooks by different kits", () => {
		const communityHooks: SettingsJson = {
			hooks: {
				PostToolUse: [
					{
						type: "command",
						command: "node ~/.claude/scripts/community.cjs",
					},
				],
			},
		};
		const dest: SettingsJson = {};

		// First merge community
		const result1 = mergeSettings(communityHooks, dest, { sourceKit: "community" });

		// Then merge pro
		const proHooks: SettingsJson = {
			hooks: {
				PostToolUse: [
					{
						type: "command",
						command: "node ~/.claude/scripts/pro.cjs",
					},
				],
			},
		};
		const result2 = mergeSettings(proHooks, result1.merged, { sourceKit: "pro" });

		expect(result2.hooksByOrigin.get("pro")).toContain(
			"node ~/.claude/scripts/pro.cjs",
		);
		expect(result2.merged.hooks?.PostToolUse).toHaveLength(2);
	});

	it("does not duplicate existing hooks", () => {
		const source: SettingsJson = {
			hooks: {
				PostToolUse: [
					{
						type: "command",
						command: "node ~/.claude/scripts/shared.cjs",
					},
				],
			},
		};
		const dest: SettingsJson = {
			hooks: {
				PostToolUse: [
					{
						type: "command",
						command: "node ~/.claude/scripts/shared.cjs",
					},
				],
			},
		};

		const result = mergeSettings(source, dest, { sourceKit: "pro" });

		expect(result.merged.hooks?.PostToolUse).toHaveLength(1);
		expect(result.conflictsDetected.length).toBeGreaterThan(0);
	});

	it("tags hooks with origin when source kit provided", () => {
		const source: SettingsJson = {
			hooks: {
				PreToolUse: [
					{
						type: "command",
						command: "node ~/.claude/scripts/validate.cjs",
					},
				],
			},
		};
		const dest: SettingsJson = {};

		const result = mergeSettings(source, dest, { sourceKit: "community" });

		// Check that hooks are tagged with _origin
		const hooks = result.merged.hooks?.PreToolUse;
		expect(hooks).toBeDefined();
		expect(hooks?.length).toBe(1);

		const hook = hooks?.[0];
		if (hook && "command" in hook) {
			expect(hook._origin).toBe("community");
		}
	});

	it("tracks multiple hooks from same kit", () => {
		const source: SettingsJson = {
			hooks: {
				PostToolUse: [
					{
						type: "command",
						command: "node ~/.claude/scripts/hook1.cjs",
					},
					{
						type: "command",
						command: "node ~/.claude/scripts/hook2.cjs",
					},
				],
				PreToolUse: [
					{
						type: "command",
						command: "node ~/.claude/scripts/hook3.cjs",
					},
				],
			},
		};
		const dest: SettingsJson = {};

		const result = mergeSettings(source, dest, { sourceKit: "community" });

		const communityHooks = result.hooksByOrigin.get("community") || [];
		expect(communityHooks).toContain("node ~/.claude/scripts/hook1.cjs");
		expect(communityHooks).toContain("node ~/.claude/scripts/hook2.cjs");
		expect(communityHooks).toContain("node ~/.claude/scripts/hook3.cjs");
		expect(communityHooks.length).toBe(3);
	});

	it("preserves existing hooks without sourceKit in origin map", () => {
		const source: SettingsJson = {
			hooks: {
				PostToolUse: [
					{
						type: "command",
						command: "node ~/.claude/scripts/new-hook.cjs",
					},
				],
			},
		};
		const dest: SettingsJson = {
			hooks: {
				PostToolUse: [
					{
						type: "command",
						command: "node ~/.claude/scripts/existing-hook.cjs",
					},
				],
			},
		};

		const result = mergeSettings(source, dest, { sourceKit: "pro" });

		// Should have 2 hooks total
		expect(result.merged.hooks?.PostToolUse).toHaveLength(2);
		// Only the new hook should be tracked in hooksByOrigin
		const proHooks = result.hooksByOrigin.get("pro") || [];
		expect(proHooks).toContain("node ~/.claude/scripts/new-hook.cjs");
		expect(proHooks).not.toContain("node ~/.claude/scripts/existing-hook.cjs");
	});

	it("handles hooks with matcher grouping", () => {
		const source: SettingsJson = {
			hooks: {
				PostToolUse: [
					{
						matcher: "Edit",
						hooks: [
							{
								type: "command",
								command: "node ~/.claude/scripts/edit-hook.cjs",
							},
						],
					},
				],
			},
		};
		const dest: SettingsJson = {};

		const result = mergeSettings(source, dest, { sourceKit: "community" });

		const communityHooks = result.hooksByOrigin.get("community") || [];
		expect(communityHooks).toContain("node ~/.claude/scripts/edit-hook.cjs");
	});
});
