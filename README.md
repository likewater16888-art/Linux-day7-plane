# Linux 知识库 · 维护手册（怎么继续加 Day 4 ~ Day 7）

> 这个站点是纯静态的（无后端、无构建、无 CDN），双击 `index.html` 就能用。
> 所以「加内容」= 往数据文件里加一个「天」对象，页面逻辑会自动把它渲染出来。

---

## 1. 目录结构

```
knowledge-base/
├─ index.html          页面骨架（决定 <script> 加载顺序）
├─ README.md           本文件
├─ assets/
│  ├─ data.js          唯一的内容源：meta / mentalModels / skills / nextSteps / days[]
│  ├─ app.js           逻辑：路由、渲染、搜索、权限实验室（加天不用改）
│  └─ style.css        样式（加天不用改）
└─ days/
   └─ _template.js     Day 4+ 的模板（不会被加载，复制走用）
```

## 2. 一句话原理

`assets/data.js` 里有一个 `days: [ {...Day1}, {...Day2}, {...Day3} ]` 数组。
**数组里多一个对象，网站就多一天** —— 侧栏入口、`#/day4` 路由、总览卡片、能力矩阵列、速查表行与筛选按钮、全局搜索、上下页翻页、页脚统计都会自动跟着变。

## 3. 三种加法

### 方式 A：直接追加到 `assets/data.js`（推荐，改 1 个文件）

1. 用 VS Code 打开 `assets/data.js`，找到文件末尾的 `days: [ ... ]`。
2. 在 Day 3 的结束 `}` 后面补一个逗号 `,`，再粘贴一个新的天对象。
3. 保存 → 刷新浏览器。

最小可用示例（只写必填也能跑）：

```js
    , {
      id: 'day4',
      title: 'Shell 脚本与自动化',
      commands: [
        { cmd: 'bash', use: '执行脚本', scene: '跑环境准备脚本', group: '脚本' }
      ]
    }
```

> 缺的字段（`num` / `icon` / `accent` / `mindmap` / `tips` …）会在 `app.js` 里自动补默认值，不会白屏。

### 方式 B：一天一个文件（内容多了更好管理）

1. 复制 `days/_template.js` → `days/day4.js`，把示例内容换成你的总结（文件里已写好 `window.EXTRA_DAYS.push(...)`）。
2. 打开 `index.html`，找到这一行并取消注释：

```html
<!-- <script src="days/day4.js"></script> -->
```

3. 保持脚本顺序：`assets/data.js` → `days/day4.js`（按天先后）→ `assets/app.js`。
4. 以后每加一天：复制模板 → 改 `id` → 在 `index.html` 里多写一行 `<script>`。

两个细节：

- `app.js` 会把 `KB.days` 和 `window.EXTRA_DAYS` 合并，并**按 id 去重**（重复会在 F12 里 warn，不会崩）。
- 同一个 `id` 只能出现一次；`id` 决定网址哈希，例如 `id: 'day4'` → `index.html#/day4`。

### 方式 C：把新文档发我，我按现有结构转成对象

把 `Day4.md` / `Day4.docx` 的内容贴过来即可。我会按 Day1~Day3 的同一套结构（`summary / goals / commands / mindmap / issues / tips / scenarios`）输出可直接粘贴的 JS 对象，并把新文档里的真实报错原文、口诀一并保留。

## 4. 字段速查

| 字段 | 必填 | 类型 | 说明 |
| --- | --- | --- | --- |
| `id` | ✅ | string | 唯一，决定路由 `#/day4` |
| `title` | ✅ | string | 当天大标题 |
| `commands` | ✅ | array | 命令卡片，见下表 |
| `num` | 建议 | string | 例如 `'DAY 4'`，省略按顺序生成 |
| `short` | 建议 | string | 侧栏短标题（4~6 字最好看），省略用 `title` |
| `tagline` | 建议 | string | 一句话副标题，显示在路径卡与页头徽章 |
| `icon` | 可选 | string | 一个 emoji，默认 `📘` |
| `accent` | 可选 | string | 主题色，省略按顺序取调色板 |
| `summary` | 可选 | string | 卡片与页头的一段总结 |
| `goals` | 可选 | string[] | 当天目标清单 |
| `closing` | 可选 | string | 「教练寄语」 |
| `mindmap` | 可选 | object | `{ label, center, branches: [{ name, nodes: [] }] }` |
| `issues` | 可选 | array | 排错档案，见下表 |
| `tips` | 可选 | string[] | 避坑口诀 |
| `scenarios` | 可选 | array | 实战时间线 `{ stage, action, result }` |
| `permissions` | 可选 | object | 仅「讲权限」的天需要，见第 7 节 |

子字段：

```js
// commands 每一项
{ cmd: 'chmod +x', full: '—', use: '给脚本加执行权限', scene: 'AI 场景：chmod +x run.sh', group: '权限' }

// issues 每一项（fix 可以是数组，也可以是一段文字）
{ title: '脚本 Permission denied', op: './run.sh', err: 'bash: ./run.sh: Permission denied',
  why: '没有 x 权限', fix: ['chmod +x run.sh', './run.sh 重新运行'], lesson: '先加权限再运行' }
```

正文里可以用轻量标记：`` `代码` `` 会变成行内代码，`**加粗**` 会加粗；HTML 标签会被转义，不会执行。


## 5. 加完之后「自动生效」的清单

| 位置 | 自动变化 |
| --- | --- |
| 侧栏 | 「N 天历程」计数 + 新的一天入口（`#/day4`） |
| 路由 | `index.html#/day4` 直达；未知路由仍回落总览 |
| 总览统计 | “N 天学习历程 / 条命令 / 个排错 / 条口诀” |
| 学习路径 | 多一张 `DAY 4` 卡片（自动换行，大于 4 张时自动隐藏箭头） |
| 能力矩阵 | 多一列（列头 = `num`，配色 = `accent`） |
| 日速览 | 多一张卡片（`grid-auto` 自动排布） |
| 命令速查 | 多一批行 + 一个筛选按钮 + 计数分母 |
| 全局搜索 | 新命令 / 新排错 / 新口诀都能搜到并跳转 |
| 当天页 | 章节编号、上一页/下一页自动接上 |
| 页面框架 | 页脚统计、浏览器标签标题、面包屑、侧栏「内容来源：DAY 1 – DAY N」 |

## 6. 还需要手动补的 3 处

1. **能力矩阵的格子（`skills`）**：每行 `levels: [3, 2, 2]` 是「每天一个数字」，新增第 4 天就补成 `[3, 2, 2, 0]`（0=未涉及，1=入门，2=熟练，3=精通）。
   不补也不会报错：缺的格子显示「未涉及」，F12 控制台会有一条 info 提示。
2. **（可选）跨天心智模型 `mentalModels`**：加一条新的总结即可，标题里的「五个」会按数量自动变成「六个」。
3. **（可选）文案**：`meta.title`（侧栏/页脚/标签页标题）、`meta.subtitle`、`meta.built`、`meta.sources`。
   注意 `subtitle` 里的「三天」是纯文字，需要手动改成「七天」；总览 h1 的「三天，把 Linux 从…」是自动计算的，不用改。

## 7. 权限实验室与「讲权限的那一天」

- 实验室的配色与预设表取「**第一个带 `permissions.presets` 的天**」（当前是 Day 3），所以 Day 4~7 追加在后面**不会打乱**实验室。
- 如果某天也要讲权限，给那天加 `permissions` 块（`days/_template.js` 里有完整注释结构），当天页面会自动按顺序多出 5 个区块：
  | 区块标题 | 由哪个字段生成 |
  | --- | --- |
  | 权限三要素：4-2-1 | `bits` + `who` |
  | 八进制速查（点击卡片复制 chmod） | `presets` |
  | 符号法 vs 八进制法 | `compare` |
  | ls -l 权限串解读 | `decodeExamples` |
  | 进程处理：先礼后兵 | `killFlow` |
- 实验室的正向计算器、反向解读、八进制对照表始终可用，与新增天无关。

## 8. 常见问题

| 现象 | 原因与处理 |
| --- | --- |
| 页面白屏 / 控制台 `SyntaxError` | 逗号或引号写错。命令里有特殊字符时用单引号包裹；不要用中文引号 `“ ”` |
| `#/day4` 打开后回到总览 | `id` 写错，或与别的天重复（控制台会 warn「重复的 day id」） |
| 侧栏没有新的一天 | 对象没放进 `days` 数组；或 `days/day4.js` 的 `<script>` 还是注释状态 |
| 新的一天没有图标/颜色 | 没写 `icon` / `accent`，已自动兜底（`📘` + 调色板） |
| 能力矩阵少一格 | `skills[].levels` 没补，属正常降级，补一位数字即可 |
| 想调整天的先后 | 数组顺序就是天顺序；但「全局避坑清单」前 3 天用的是人工挑选的口诀，插入中间会改变挑选结果 |
| 数据会不会太大 | 目前 3 天 ≈ 28KB；7 天约 40~50KB，仍然是秒开。想更清爽就用「方式 B」一天一个文件 |
| Markdown / Word 会被自动读取吗 | 不会。浏览器读不了 `.md` / `.docx`，必须先转成上面的数据结构（方式 A/B/C 都是「转换」这一步） |

## 9. 提交前的 30 秒自检

1. 首页：统计里的「N 天」、学习路径卡片数、速览卡片数是否一致；
2. 点新的一天：命令卡片、知识地图、排错档案、避坑口诀、实战时间线都在，底部「上一页 / 下一页」正确；
3. 命令速查：筛选按钮多一个，计数分母变大，点新按钮能筛出新命令；
4. 全局搜索：搜新命令名（如 `bash`）能出现结果，点击可跳回当天；
5. F12 控制台：没有红色报错（info 级的「能力矩阵还没填满」可忽略，补 `levels` 后消失）。

## 10. 发布 / 更新到线上（GitHub Pages）

- 仓库：`https://github.com/likewater16888-art/Linux-day7-plane`
- 线上地址：`https://likewater16888-art.github.io/Linux-day7-plane/`
- 部署方式：Settings → Pages → *Deploy from a branch* → 分支 `main`、目录 `/(root)`。**没有构建步骤**，push 后 30~60 秒自动生效。

**以后改了内容（加 Day4 / 改错别字）就这样发布：**

```powershell
cd 'C:\Users\deepvision\Desktop\Linux_study\knowledge-base'
git add -A
git commit -m "add: Day4 Shell 脚本"
git push
```

> 提交说明带中文时，用 `git commit -m` 在 PowerShell 里可能被转成乱码；写成英文，或用 `git commit -F 消息文件.txt`（文件存成 UTF-8）。

**三个别踩的坑：**

| 坑 | 说明 |
| --- | --- |
| 删掉 `.nojekyll` | GitHub Pages 会改用 Jekyll 构建：`days/_template.js` 这类 `_` 开头的文件被忽略，还多一次构建。留着，它是个空文件 |
| 仓库设为 private | 免费账号的 Pages 只支持 public 仓库。改了 private 网站会 404 |
| 网址大小写 | `Linux-day7-plane` 这个大写 `L` 要保留；改成全小写需同步改仓库名，旧链接会失效 |

**把网址发给别人前**：先看源码里有没有内网 IP / 公司路径，有的话先脱敏（`assets/data.js` 里的 `issues`、`scenarios` 最可能含真实路径）。

---

### 版本记录

| 日期 | 内容 |
| --- | --- |
| 2026-10-25 | Day1 / Day2 / Day3 上线；新增「权限实验室」「全局搜索」「命令速查筛选」；支持按天追加内容（见本手册） |
| 2026-10-25 | 部署到 GitHub Pages（`likewater16888-art.github.io/Linux-day7-plane`），补第 10 节发布 / 更新流程 |

