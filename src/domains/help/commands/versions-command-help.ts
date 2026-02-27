/**
 * Versions Command Help
 *
 * Help definition for the 'versions' command.
 */

import type { CommandHelp } from "../help-types.js";

export const versionsCommandHelp: CommandHelp = {
	name: "versions",
	description: "List available versions of Pankit repositories",
	usage: "pk versions [options]",
	examples: [
		{
			command: "pk versions --kit community --limit 10",
			description: "Show latest 10 versions of community kit",
		},
		{
			command: "pk versions --all",
			description: "Show all releases including prereleases",
		},
	],
	optionGroups: [
		{
			title: "Filter Options",
			options: [
				{
					flags: "--kit <kit>",
					description: "Filter by specific kit (community, pro)",
				},
				{
					flags: "--limit <number>",
					description: "Number of releases to show",
					defaultValue: "30",
				},
				{
					flags: "--all",
					description: "Show all releases including prereleases",
				},
			],
		},
	],
};
