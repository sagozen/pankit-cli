/**
 * Config Command Help
 *
 * Help definition for the 'config' command.
 */

import type { CommandHelp } from "../help-types.js";

export const configCommandHelp: CommandHelp = {
	name: "config",
	description: "Manage Pankit configuration and launch the config dashboard",
	usage: "pk config [action] [key] [value] [options]",
	examples: [
		{
			command: "pk config",
			description: "Launch the web dashboard (same as 'pk config ui')",
		},
		{
			command: "pk config set defaults.kit community",
			description: "Set a config value from the CLI",
		},
	],
	optionGroups: [
		{
			title: "Actions",
			options: [
				{
					flags: "ui",
					description: "Launch config dashboard (default action when omitted)",
				},
				{
					flags: "get <key>",
					description: "Read a config value",
				},
				{
					flags: "set <key> <value>",
					description: "Write a config value",
				},
				{
					flags: "show",
					description: "Print merged config",
				},
			],
		},
		{
			title: "Scope Options",
			options: [
				{
					flags: "-g, --global",
					description: "Use global config (~/.pankit/config.json)",
				},
				{
					flags: "-l, --local",
					description: "Use local config (.claude/.pk.json)",
				},
			],
		},
		{
			title: "Dashboard Options",
			options: [
				{
					flags: "--port <port>",
					description: "Port for dashboard server",
				},
				{
					flags: "--no-open",
					description: "Do not auto-open browser when launching dashboard",
				},
				{
					flags: "--dev",
					description: "Run dashboard in development mode with HMR",
				},
			],
		},
		{
			title: "Output Options",
			options: [
				{
					flags: "--json",
					description: "Output machine-readable JSON for CLI actions",
				},
			],
		},
	],
	sections: [
		{
			title: "Notes",
			content:
				"Run 'pk config --help' to see both CLI actions and dashboard flags. Running bare 'pk config' opens the dashboard directly.",
		},
	],
};
