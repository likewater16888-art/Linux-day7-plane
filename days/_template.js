/* ============================================================
   days/_template.js —— 新增一天（Day 4 起）的模板
   用法：
     1) 复制本文件 → days/day4.js
     2) 把下面的示例内容换成你的真实总结（字段名别改）
     3) 打开 index.html，找到这一行并去掉注释：
        <script src="days/day4.js"></script>
   说明：
     · 只有 id / title / commands 是必须的，其它字段省略也能渲染（app.js 会自动补默认值）
     · 不想拆文件？把下面整个 { ... } 对象直接粘到 assets/data.js 的 days 数组末尾即可
     · 每个字段的完整含义见 README.md
   ============================================================ */

(window.EXTRA_DAYS = window.EXTRA_DAYS || []).push({
  id: 'day4',                    // 必须唯一，决定网址 #/day4
  num: 'DAY 4',                  // 编号，省略则按数组顺序自动生成
  short: 'Shell 脚本',            // 侧栏短标题（4~6 个字最好看）
  title: 'Shell 脚本与自动化',     // 当天大标题
  tagline: '把一堆命令，写成可复用的脚本',
  icon: '📜',                     // 一个 emoji 图标
  accent: '#f5a524',              // 主题色，省略则自动分配
  summary: '一句话总结今天的收获，会显示在总览卡片和当天页头。',
  goals: [
    '目标一：能写出带参数的脚本',
    '目标二：能看懂 `#!/bin/bash` 与 `$1` 的含义'
  ],
  closing: '教练寄语：写在这一天页面的最下面。',

  /* 命令卡片：cmd（展示+复制）/ full（全称）/ use（用途）/ scene（AI 场景）/ group（分组） */
  commands: [
    { cmd: 'bash', full: 'Bourne Again SHell', use: '执行脚本', scene: '跑训练前的环境准备脚本', group: '脚本' },
    { cmd: 'chmod +x', full: '—', use: '给脚本加执行权限', scene: 'chmod +x run.sh 之后用 ./run.sh 运行', group: '权限' },
    { cmd: 'echo', full: 'Echo', use: '输出文本 / 变量', scene: '在脚本里打印当前 Epoch 与日志路径', group: '脚本' }
  ],

  /* 知识地图：center 是中心词，branches 是分支（name 分支名 + nodes 节点） */
  mindmap: {
    label: 'DAY 4',
    center: '脚本化',
    branches: [
      { name: '写', nodes: ['vim run.sh', '#!/bin/bash'] },
      { name: '跑', nodes: ['bash run.sh', './run.sh'] }
    ]
  },

  /* 排错档案：fix 可以是数组（推荐）也可以是一段文字；支持 `代码` 与 **加粗** 标记 */
  issues: [
    {
      title: '脚本提示 Permission denied',
      op: './run.sh',
      err: 'bash: ./run.sh: Permission denied',
      why: '脚本只有读写权限，没有执行（x）权限，系统拒绝直接运行。',
      fix: ['chmod +x run.sh', '再执行 ./run.sh 验证'],
      lesson: '新写的脚本先 chmod +x，再用 ./ 运行。'
    }
  ],

  /* 避坑口诀：总览页「全局避坑清单」会自动取新增天的前 2 条 */
  tips: [
    '先加权限再运行：chmod +x 是脚本的第一道门。',
    '先 echo 再删文件：调试脚本时把 rm 换成 echo 看一遍。'
  ],

  /* 实战时间线：stage 阶段 / action 真正敲的命令 / result 结果 */
  scenarios: [
    { stage: '写脚本', action: 'vim run.sh', result: '写入 3 条命令' },
    { stage: '加权限', action: 'chmod +x run.sh', result: '获得执行权限' },
    { stage: '验收', action: './run.sh', result: '脚本按顺序执行完毕' }
  ]

  /* ---------- 可选：这一天也讲权限 / 进程时才需要 ----------
     把下面这个注释块的起止标记去掉即可，权限实验室会优先用「第一个带 permissions 的天」做对照表。
  permissions: {
    bits: [
      { k: 'r', name: 'read', val: 4, desc: '对文件可 cat 查看' }
    ],
    who: [
      { k: 'u', name: 'user / Owner', pos: '第 1~3 位', desc: '文件所有者' }
    ],
    presets: [
      { mode: '755', sym: 'rwxr-xr-x', risk: 'safe', desc: '脚本：所有者全权，组和其他只读执行' }
    ],
    compare: [
      { scene: '给脚本加执行权限', sym: 'chmod +x run.sh', oct: 'chmod 755 run.sh', pick: '符号法更直观' }
    ],
    decodeExamples: [
      { str: '-rwxr-xr-x', type: '普通文件', mode: '755', note: '脚本文件的常见权限' }
    ],
    killFlow: [
      { text: 'ps -u $USER', tone: '' },
      { text: 'kill PID', tone: 'cool' }
    ]
  }
  ------------------------------------------------------------ */
});
