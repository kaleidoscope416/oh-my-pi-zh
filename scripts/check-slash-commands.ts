import { BUILTIN_SLASH_COMMAND_DEFS } from "@oh-my-pi/pi-coding-agent/slash-commands/builtin-registry";
import { VERSION } from "@oh-my-pi/pi-utils";
import { slashCommandTranslations, bundledCommandTranslations } from "../src/translations/slash-commands";
import { buildSlashCommandReport, hasSlashCommandDrift } from "./slash-report";

/** Host commands outside BUILTIN_SLASH_COMMAND_DEFS; kept in lockstep with bundledCommandTranslations. */
const extraCommandSources = [
	{ name: "autoresearch", description: "Toggle builtin autoresearch mode, or pass off / clear, or a goal message." },
	{ name: "green", description: "Generate a prompt to iterate on CI failures until the branch is green" },
	{ name: "annotate", description: "Annotate a diff or text from a file, prompt, latest reply, or session" },
	{ name: "init", description: "Generate AGENTS.md for current codebase" },
] as const;

const report = buildSlashCommandReport(
	[...BUILTIN_SLASH_COMMAND_DEFS, ...extraCommandSources],
	[...slashCommandTranslations, ...bundledCommandTranslations],
);
console.log(`OMP ${VERSION} 内置命令翻译：${report.completeCommands}/${report.totalCommands} 完整，${report.totalIdentifiers} 个命令名/别名`);
if (hasSlashCommandDrift(report)) {
	console.error(JSON.stringify(report, null, 2));
	process.exitCode = 1;
} else {
	console.log("内置命令新增/删除、原文与别名漂移：0");
}
