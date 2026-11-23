import type { AppKeybinding, KeybindingsManager } from "@oh-my-pi/pi-tui/app-keybindings";
import { formatKeyHint, keyHintPlatform } from "@oh-my-pi/pi-tui/app-keybindings";
import type { KeyName } from "@oh-my-pi/pi-tui/key-hint-format";
import { matchesSelectCancel } from "@oh-my-pi/pi-tui/keybinding-matchers";
import { canonicalKeyId } from "@oh-my-pi/pi-tui/keybindings";
import { truncateToWidth } from "@oh-my-pi/pi-tui/utils";

/**
 * Chinese rebuild of the `/hotkeys` reference (pi-tui `hotkeys-markdown.ts`).
 * The host bundle's sheet cannot be patched from an extension, so this mirrors
 * its group/row structure with Chinese copy and real keymap data. When upstream
 * changes the action list, re-sync against `pi-tui/src/hotkeys-markdown.ts`.
 *
 * Rendered as plain text rows on purpose: the plugin cannot reach the host's
 * markdown theme instance, and a theme-less Markdown copy would misrender.
 */

export interface BindingKeySource {
	readonly keybindings: Pick<KeybindingsManager, "getDisplayString" | "getKeys" | "matchesCanonical">;
}

type HotkeyRow = { readonly keys: string; readonly action: string };
type HotkeyGroup = { readonly title: string; readonly rows: readonly HotkeyRow[] };

function hintIds(keys: readonly KeyName[]): string {
	return keys.map(formatKeyHint).join("/");
}

function hintKeys(source: BindingKeySource, action: AppKeybinding): string {
	const keys = source.keybindings.getKeys(action);
	if (keys.length > 0) return keys.map(formatKeyHint).join("/");
	return source.keybindings.getDisplayString(action) || "未绑定";
}

/** The shortcut groups; mirrors upstream `hotkeyGroups` including the exit-key chord split. */
function hotkeyGroups(source: BindingKeySource): HotkeyGroup[] {
	const isMac = keyHintPlatform() === "darwin";
	const act = (action: AppKeybinding): string => hintKeys(source, action);
	const pushToTalkKeys = source.keybindings.getKeys("app.stt.pushToTalk");
	const exitKeys = source.keybindings.getKeys("app.exit");
	const deletingExitKeys = exitKeys.filter(key =>
		source.keybindings.matchesCanonical(canonicalKeyId(key), "tui.editor.deleteCharForward"),
	);
	const quittingExitKeys = exitKeys.filter(
		key => !source.keybindings.matchesCanonical(canonicalKeyId(key), "tui.editor.deleteCharForward"),
	);
	const exitRows: HotkeyRow[] = [];
	if (deletingExitKeys.length > 0) {
		exitRows.push({
			keys: hintIds(deletingExitKeys),
			action: "向前删除字符（有草稿时）/ 退出（空输入时）",
		});
	}
	if (quittingExitKeys.length > 0 || deletingExitKeys.length === 0) {
		exitRows.push({
			keys: quittingExitKeys.length > 0 ? hintIds(quittingExitKeys) : "未绑定",
			action: "退出",
		});
	}
	return [
		{
			title: "导航",
			rows: [
				{ keys: hintIds(["up", "down", "left", "right"]), action: `移动光标 / 浏览历史（空输入时 ${formatKeyHint("up")}）` },
				{ keys: hintIds(["alt+left", "alt+right"]), action: "按词移动" },
				{ keys: hintIds(isMac ? ["ctrl+a", "home", "super+left"] : ["ctrl+a", "home"]), action: "行首" },
				{ keys: hintIds(isMac ? ["ctrl+e", "end", "super+right"] : ["ctrl+e", "end"]), action: "行尾" },
			],
		},
		{
			title: "编辑",
			rows: [
				{ keys: hintIds(["enter"]), action: "发送消息" },
				{ keys: hintIds(["shift+enter", "alt+enter"]), action: "换行" },
				{ keys: hintIds(["ctrl+w", "alt+backspace"]), action: "向后删除一个词" },
				{ keys: hintIds(["ctrl+u"]), action: "删除至行首" },
				{ keys: hintIds(["ctrl+k"]), action: "删除至行尾" },
				{ keys: act("app.clipboard.copyLine"), action: "复制当前行" },
				{ keys: act("app.clipboard.copyPrompt"), action: "复制全部输入内容" },
			],
		},
		{
			title: "其他",
			rows: [
				{ keys: hintIds(["tab"]), action: "路径补全 / 接受自动补全" },
				{ keys: act("app.interrupt"), action: "取消自动补全 / 中断当前工作" },
				{ keys: act("app.clear"), action: "清空编辑器（第一次）/ 退出（第二次）" },
				...exitRows,
				{ keys: act("app.suspend"), action: "挂起到后台" },
				{ keys: act("app.display.reset"), action: "重置终端显示" },
				{ keys: act("app.thinking.cycle"), action: "循环切换思考等级" },
				{ keys: act("app.model.cycleForward"), action: "循环切换角色模型（slow/default/smol）" },
				{ keys: act("app.model.cycleBackward"), action: "反向循环切换角色模型" },
				{ keys: act("app.model.selectTemporary"), action: "选择模型（临时）" },
				{ keys: act("app.model.select"), action: "选择模型（设置角色）" },
				{ keys: act("app.plan.toggle"), action: "切换计划模式" },
				{ keys: act("app.history.search"), action: "搜索输入历史" },
				{ keys: act("app.tools.expand"), action: "切换工具输出展开" },
				{ keys: act("app.tools.toggleVisibility"), action: "切换工具活动可见性" },
				{ keys: act("app.links.hint"), action: "按标记选择屏幕上的扩展链接；再按一次浏览整个会话记录" },
				{ keys: act("app.ask.hide"), action: "隐藏/显示待处理的 ask 问题" },
				{ keys: act("app.ask.note"), action: "在 ask 选项上添加或编辑备注" },
				{ keys: act("app.approval.approve"), action: "批准待处理的工具调用" },
				{ keys: act("app.thinking.toggle"), action: "切换思考块可见性" },
				{ keys: act("app.editor.external"), action: "在外部编辑器中编辑消息" },
				{ keys: act("app.local.open"), action: "在外部编辑器中打开 local:// 文件" },
				{ keys: act("app.retry"), action: "重试上一轮失败的助手回合" },
				{ keys: act("app.clipboard.pasteImage"), action: "从剪贴板粘贴图片或文本" },
				{
					keys: pushToTalkKeys.length > 0 ? `按住 ${act("app.stt.pushToTalk")}` : act("app.stt.pushToTalk"),
					action: pushToTalkKeys.length > 0
						? "语音转文字（按键说话）：按住录音，松开转写"
						: "语音转文字（按键说话）（未启用）",
				},
				{ keys: act("app.live.toggle"), action: "开始/停止实时语音模式（/live）" },
				{
					keys: `${act("app.agents.hub")} / ${act("app.session.observe")} / 双击 ${hintIds(["left"])}（空输入时）`,
					action: "打开智能体中心",
				},
				{ keys: "#<数字>", action: "GitHub issue/PR 引用（如 `#3164` → `pr://`/`issue://`）" },
				{ keys: "# 或 #<文本>", action: "输入操作（复制 / 撤销 / 移动光标）" },
				{ keys: "/", action: "斜杠命令" },
				{ keys: "!", action: "运行 bash 命令" },
				{ keys: "!!", action: "运行 bash 命令（不进上下文）" },
				{ keys: "$", action: "在共享内核中运行 Python" },
				{ keys: "$$", action: "运行 Python（不进上下文）" },
			],
		},
	];
}

/** Aligned plain-text rows; the keys column is padded to the widest entry. */
export function buildHotkeysRows(source: BindingKeySource): string[] {
	const lines: string[] = ["键盘快捷键（Esc 关闭）"];
	for (const group of hotkeyGroups(source)) {
		const width = Math.max(...group.rows.map(row => row.keys.length));
		lines.push("", group.title);
		for (const row of group.rows) {
			const keys = row.keys.length > width ? row.keys.slice(0, width - 1) + "…" : row.keys.padEnd(width);
			lines.push(`  ${keys}  ${row.action}`);
		}
	}
	return lines;
}

/**
 * Full-width sheet: horizontal rules and per-row fill so the panel spans the
 * overlay width (CJK-aware via visibleWidth) instead of floating short text
 * with blank margins on both sides.
 */
export class HotkeysSheetZh {
	#source: BindingKeySource;
	#onClose: () => void;
	#rows: readonly string[] | undefined;

	constructor(source: BindingKeySource, onClose: () => void) {
		this.#source = source;
		this.#onClose = onClose;
	}

	render(width: number): readonly string[] {
		this.#rows ??= buildHotkeysRows(this.#source);
		const rule = "─".repeat(Math.max(0, width));
		const rows: string[] = [rule, truncateToWidth(this.#rows[0] ?? "", width, null, true), rule];
		for (const line of this.#rows.slice(1)) {
			rows.push(line === "" ? rule : truncateToWidth(line, width, null, true));
		}
		rows.push(rule);
		return rows;
	}

	invalidate(): void {
		this.#rows = undefined;
	}

	handleInput(data: string): void {
		if (matchesSelectCancel(data)) this.#onClose();
	}
}
