# omp-settings-zh

官方 [Oh My Pi（omp）](https://github.com/can1357/oh-my-pi) 的简体中文汉化插件。基于 [kaleidoscope416/oh-my-pi-zh](https://github.com/kaleidoscope416/oh-my-pi-zh) 19.1.0 的扩展 fork，不分叉官方代码、不修改任何二进制，通过 Extension 在进程内替换显示文案，随时可逆。

**宿主要求**：omp 19.x（针对 19.1.0 校准，兼容预检 fail-closed，不匹配时自动回退英文，绝不弄坏 omp 本体）。

## 安装

```sh
omp plugin install github:kaleidoscope416/oh-my-pi-zh
```

安装后重启 omp，`/settings` 默认显示中文。`omp stats` 网页需要新开终端（插件会装一个可撤销的 PATH 启动器）。

## 翻译了哪些内容

### 设置面板（482/482 项）

`/settings` 全部设置项的名称、描述与选项文案，含分组、空态、动态快捷键图标；`/effort` 参数原文与显示副本隔离。

### 内置斜杠命令（93/93 条）

- 官方注册表全部 89 条内置命令的描述
- 注册表之外的 4 条：`autoresearch`、`green`、`annotate`、`init`（bundled 命令的 `(bundled)` 标记原样保留）
- 斜杠列表中的实时状态（`/plan`、`/loop`、`/advisor` 等）按命令翻译状态值

### 斜杠参数补全（142/142 条）

输入 `/mcp list`、`/effort high` 这类参数时的子命令描述，覆盖 29 个命令的全部 142 条声明式子命令，例如：

| 输入 | 显示 |
|---|---|
| `/mcp l` | 列出所有已配置的 MCP 服务器 |
| `/effort h` | 深度推理（约 16k tokens）；当前档位追加 `（当前）` |
| `/todo ap` | 追加一个任务；阶段模糊匹配或自动创建 |

别名输入（`/plugin list`）与官方补全等价；升级 omp 后原文漂移的条目自动回退英文，不会错译。

### `/hotkeys` 快捷键面板

完整中文重建（本 fork 扩展）：导航 / 编辑 / 其他三组全部动作说明，键位数据来自宿主真实 keymap（用户自定义键位生效），`Esc` 关闭。中文模式拦截 `/hotkeys` 显示本面板；`en` 模式直通官方原版。

### `omp stats` 网页

中文 / English 切换（上游功能，随插件安装，可撤销 PATH 启动器）。

## 明确不翻译的部分

模型与提供商 ID、effort 选择值本身、路径、MCP 服务器名、技能名、错误原文、API 返回内容、运行时动态生成的补全（模型列表、目录补全等）——保持官方原文以保证匹配与插入行为不变。

## 切换语言

```text
/settings-language        # 中文 / 原版选择器
/settings-language zh     # 应用汉化（热插拔，无需重启）
/settings-language en     # 撤销，恢复官方文案
```

## 与上游 fork 的差异

上游只覆盖官方 89 条注册表命令与设置面板。本 fork 额外做了：

1. 注册表外命令翻译（`autoresearch` / `green` / `annotate` / `init`）
2. 斜杠参数补全翻译（142 条，含别名归一化、`(current)` 标记、`(bundled)` 标签）
3. `/hotkeys` 快捷键面板中文重建
4. 门禁扩展：`bun run commands:check` 同时校验注册表外命令与参数补全覆盖率、原文漂移和 stale 条目

## 开发

```sh
bun install
bun test            # 全部测试
bun run check       # typecheck + test + coverage + drift + commands（smoke 需真实宿主，单独跑）
```

同步上游：

```sh
git fetch upstream && git merge upstream/main
```

上游新增命令或参数时，`bun run commands:check` 会精确列出缺失与漂移条目。

## 许可

MIT。基于 kaleidoscope416/oh-my-pi-zh 与 can1357/oh-my-pi（MIT）派生，版权归原作者所有。
