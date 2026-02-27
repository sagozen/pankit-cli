/**
 * New Command Help
 *
 * Help definition for the 'new' command.
 */

import type { CommandHelp } from "../help-types.js";
import { filterOptionsGroup, folderOptionsGroup } from "./common-options.js";

export const newCommandHelp: CommandHelp = {
	name: "new",
	description: "Bootstrap a new Pankit project (with interactive version selection)",
	usage: "pk new [options]",
	examples: [
		{
			command: "pk new --kit community --dir ./my-project",
			description: "Create community kit project in specific directory",
		},
		{
			command: "pk new -y --use-git --release v2.1.0",
			description: "Non-interactive with git clone (no GitHub API needed)",
		},
	],
	optionGroups: [
		{
			title: "Mode Options",
			options: [
				{
					flags: "-y, --yes",
					description: "Non-interactive mode (skip all prompts)",
				},
				{
					flags: "--use-git",
					description: "Use git clone instead of GitHub API (uses SSH/HTTPS credentials)",
				},
			],
		},
		{
			title: "Project Options",
			options: [
				{
					flags: "--dir <directory>",
					description: "Target directory for the new project",
					defaultValue: ".",
				},
				{
					flags: "--kit <kit>",
					description: "Kit to use (community, pro)",
				},
				{
					flags: "-r, --release <version>",
					description: "Skip version selection, use specific version (e.g., latest, v1.0.0)",
				},
				{
					flags: "--force",
					description: "Overwrite existing files without confirmation",
				},
			],
		},
		filterOptionsGroup,
		{
			title: "Installation Options",
			options: [
				{
					flags: "--opencode",
					description: "Install OpenCode CLI package (non-interactive mode)",
				},
				{
					flags: "--gemini",
					description: "Install Google Gemini CLI package (non-interactive mode)",
				},
				{
					flags: "--install-skills",
					description: "Install skills dependencies (non-interactive mode)",
				},
				{
					flags: "--with-sudo",
					description: "Include system packages requiring sudo (Linux: ffmpeg, imagemagick)",
				},
				{
					flags: "--prefix",
					description: "Add /pk: prefix to all slash commands",
				},
			],
		},
		folderOptionsGroup,
	],
};
