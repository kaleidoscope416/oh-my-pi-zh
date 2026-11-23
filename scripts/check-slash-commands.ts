import { BUILTIN_SLASH_COMMAND_DEFS } from "@oh-my-pi/pi-coding-agent/slash-commands/builtin-registry";
import { VERSION } from "@oh-my-pi/pi-utils";
import { slashCommandTranslations, bundledCommandTranslations } from "../src/translations/slash-commands";
import { subcommandTranslations } from "../src/translations/subcommands";
import { buildSlashCommandReport, hasSlashCommandDrift } from "./slash-report";

/** Host commands outside BUILTIN_SLASH_COMMAND_DEFS; kept in lockstep with bundledCommandTranslations. */
const extraCommandSources: readonly {
	name: string;
	description: string;
	subcommands?: undefined;
}[] = [
	{ name: "autoresearch", description: "Toggle builtin autoresearch mode, or pass off / clear, or a goal message." },
	{ name: "green", description: "Generate a prompt to iterate on CI failures until the branch is green" },
	{ name: "annotate", description: "Annotate a diff or text from a file, prompt, latest reply, or session" },
	{ name: "init", description: "Generate AGENTS.md for current codebase" },
] as const;

const report = buildSlashCommandReport(
	[...BUILTIN_SLASH_COMMAND_DEFS, ...extraCommandSources],
	[...slashCommandTranslations, ...bundledCommandTranslations],
);

type SubTable = Record<string, Readonly<Record<string, readonly [string, string]>>>;
const subTable = subcommandTranslations as SubTable;
const declaredSubs = new Set<string>();
const subIssues: string[] = [];
let subCovered = 0;
for (const def of [...BUILTIN_SLASH_COMMAND_DEFS, ...extraCommandSources]) {
	const table = subTable[def.name];
	const registrySubs = new Set<string>();
	for (const sub of def.subcommands ?? []) {
		registrySubs.add(sub.name);
		declaredSubs.add(def.name + " " + sub.name);
		const entry = table?.[sub.name];
		if (!entry) { subIssues.push(`${def.name} ${sub.name}: missing translation`); continue; }
		if (entry[0] !== sub.description) { subIssues.push(`${def.name} ${sub.name}: source drift`); continue; }
		if (!entry[1].trim() || entry[1] === entry[0]) { subIssues.push(`${def.name} ${sub.name}: empty translation`); continue; }
		subCovered++;
	}
	if (table) {
		for (const sub of Object.keys(table)) {
			if (!registrySubs.has(sub)) subIssues.push(`${def.name} ${sub}: stale (not in registry)`);
		}
	}
}
const subTotal = declaredSubs.size;
const subDrift = subIssues.length > 0 || subCovered !== subTotal;

console.log(`OMP ${VERSION} 内置命令翻译：${report.completeCommands}/${report.totalCommands} 完整，${report.totalIdentifiers} 个命令名/别名`);
console.log(`参数补全翻译：${subCovered}/${subTotal} 完整`);
if (hasSlashCommandDrift(report) || subDrift) {
	console.error(JSON.stringify({ ...report, subIssues }, null, 2));
	process.exitCode = 1;
} else {
	console.log("内置命令新增/删除、原文与别名漂移：0；参数补全漂移：0");
}
