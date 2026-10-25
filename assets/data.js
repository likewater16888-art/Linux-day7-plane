/* ============================================================
   Linux 三日通关 · 数据层
   内容来源：
     · Day1-Linux基础命令实战总结.md
     · Day 2 专属学习总结：Linux 查看、搜索与文本处理.docx
     · Day3学习总结-权限管理与进程控制.md
   说明：在原文基础上做了「去重 + 归类 + 提炼」，保留命令、报错原文与口诀。
   ============================================================ */

const KB = {
  meta: {
    title: 'Linux 三日通关',
    subtitle: '三天，从「文件与目录」到「权限与进程」：把 Linux 常用命令、真实报错与避坑口诀，整理成一张可检索、可回顾、可动手验证的知识地图。',
    built: '2026-10-25',
    sources: [
      'Day1-Linux基础命令实战总结.md',
      'Day 2 专属学习总结：Linux 查看、搜索与文本处理.docx',
      'Day3学习总结-权限管理与进程控制.md'
    ]
  },

  /* 跨天提炼的 5 个「心智模型」 */
  mentalModels: [
    {
      icon: '🌳', title: '目录树定位法', from: 'Day 1 / Day 2',
      body: '用 pwd 确认坐标，用 ls 观察邻居，用 cd 移动。迷路时的固定动作永远是：先 pwd，再 ls。'
    },
    {
      icon: '📦', title: '文件 ≠ 目录', from: 'Day 1',
      body: '创建看命令：touch 建文件、mkdir 建目录；识别看 ls -l 首字符：d 是目录、- 是文件。扩展名不决定类型。'
    },
    {
      icon: '🔗', title: '管道流水线', from: 'Day 2',
      body: 'cat / head / tail 取内容 → grep 过滤 → sed 替换 → wc -l 计数。用 | 把单条命令串成数据处理流水线。'
    },
    {
      icon: '🔐', title: '权限 4-2-1', from: 'Day 3',
      body: 'r=4、w=2、x=1，按 u / g / o 三段相加：755 给脚本、644 给配置、600 给密钥。改一组用符号法，设全部用八进制。'
    },
    {
      icon: '⚙️', title: '进程先礼后兵', from: 'Day 3',
      body: 'ps 找到 PID → kill 发 SIGTERM 让训练先存 checkpoint → 不听话再 kill -9。'
    }
  ],

  /* 三日能力矩阵（1=入门 2=熟练 3=精通，据三份总结的成果描述整理） */
  skills: [
    { name: '路径导航 pwd / cd', levels: [3, 2, 2] },
    { name: '文件与目录创建', levels: [3, 2, 2] },
    { name: '查看与递归浏览 ls', levels: [2, 3, 2] },
    { name: '搜索 / 正则 / 管道', levels: [0, 3, 1] },
    { name: '文本加工 sed / wc', levels: [0, 2, 0] },
    { name: '编辑器 vim / nano', levels: [0, 3, 1] },
    { name: '权限 chown / chmod', levels: [0, 0, 3] },
    { name: '进程 ps / kill', levels: [0, 0, 3] },
    { name: '提权与装包 sudo / apt', levels: [0, 0, 2] },
    { name: '排错与自查', levels: [2, 3, 3] }
  ],

  nextSteps: [
    { title: '环境变量', body: 'export 与 PATH，解决「库装了却找不到」的问题。' },
    { title: '后台运行', body: 'nohup / & / jobs：关掉终端，训练继续。' },
    { title: '文本编辑进阶', body: 'vim 常用操作、nano 快速改配置。' },
    { title: '排查利器', body: 'find / which / df -h / du -sh / top / htop。' },
    { title: '权限进阶', body: 'umask、setgid、sticky bit（/tmp 的 o+t）。' },
    { title: '工程化', body: '把常用命令固化成 shell 脚本或 Makefile。' }
  ],

  days: [
    /* ================= Day 1 ================= */
    {
      id: 'day1',
      num: 'DAY 1',
      short: '基础命令',
      title: 'Linux 基础命令实战',
      tagline: '文件与目录：从「迷路」到「掌控」',
      icon: '📁',
      accent: '#5cc8ff',
      summary: '围绕 Linux 文件与目录的基础操作，把 13 条常用命令练到「本能反应」，并在盲测实战中完成从模仿到主动排错的闭环。',
      goals: [
        '路径导航：pwd / cd / cd .. / cd ~',
        '观察目录：ls / ls -l / ls -R',
        '创建与增删：mkdir / touch / mv / cp -r / rm',
        '文件与目录的区分 + 排错自查习惯'
      ],
      closing: '从模仿操作 → 盲测实战 → 主动排错，完成了一次完整的学习闭环；核心命令已形成本能反应，为后续权限管理与高级操作打下扎实基础。',
      commands: [
        { cmd: 'pwd', full: 'Print Working Directory', use: '查看当前所在路径', scene: '确认代码在哪个目录下运行', group: '导航' },
        { cmd: 'cd', full: 'Change Directory', use: '切换目录', scene: '进入项目根目录或数据集目录', group: '导航' },
        { cmd: 'cd ..', full: '—', use: '回到上一级目录', scene: '从子目录返回项目根目录', group: '导航' },
        { cmd: 'cd ~', full: '—', use: '回到用户家目录', scene: '快速回到起点', group: '导航' },
        { cmd: 'ls', full: 'List', use: '列出当前目录内容', scene: '查看文件清单', group: '查看' },
        { cmd: 'ls -l', full: 'List Long', use: '以长格式列出详情', scene: '查看文件权限、大小、修改时间', group: '查看' },
        { cmd: 'ls -R', full: 'List Recursive', use: '递归列出所有子目录内容', scene: '一次性查看整个项目目录树', group: '查看' },
        { cmd: 'mkdir', full: 'Make Directory', use: '创建文件夹', scene: '创建 models、datasets 等项目目录', group: '创建' },
        { cmd: 'touch', full: 'Touch', use: '创建空文件（或更新时间戳）', scene: '创建 config.yaml、requirements.txt 等配置', group: '创建' },
        { cmd: 'mv', full: 'Move', use: '移动或重命名文件 / 目录', scene: '把配置文件归档到 logs/ 目录', group: '操作' },
        { cmd: 'cp -r', full: 'Copy Recursive', use: '递归复制目录及其内容', scene: '备份模型权重目录', group: '操作' },
        { cmd: 'rm', full: 'Remove', use: '删除文件', scene: '删除临时测试文件', group: '操作' },
        { cmd: 'rm -rf', full: 'Remove Recursive Force', use: '递归强制删除目录及其内容', scene: '清理废弃项目目录（高危）', group: '操作' }
      ],
      mindmap: {
        label: 'DAY 1',
        center: '文件与目录',
        branches: [
          { name: '定位与导航', nodes: ['pwd', 'cd', 'cd ..', 'cd ~'] },
          { name: '观察目录', nodes: ['ls', 'ls -l', 'ls -R'] },
          { name: '创建', nodes: ['mkdir', 'touch'] },
          { name: '移动 / 复制', nodes: ['mv', 'cp -r'] },
          { name: '删除', nodes: ['rm', 'rm -rf'] }
        ]
      },
      issues: [
        {
          title: '对文件执行 cd 命令报错',
          op: 'cd hi（hi 是普通文件，不是目录）',
          err: 'Not a directory',
          why: 'cd 只能进入目录，不能进入普通文件——就像试图钻进一张纸里。',
          fix: ['用 ls -l 看类型：首字符 d 是目录，- 是普通文件', '确认目标是目录后再执行 cd'],
          lesson: '先看清「是不是目录」，再决定要不要 cd。'
        },
        {
          title: 'rm config.yaml 提示文件不存在',
          op: 'rm config.yaml',
          err: 'No such file or directory',
          why: '上一步已用 mv config.yaml logs/ 把文件移到子目录，当前目录中已不存在该文件。',
          fix: ['用 ls -R 递归查看，发现文件在 logs/ 下', 'cd logs 进入对应目录，再执行 rm config.yaml'],
          lesson: '删除文件前先确认确切位置，善用 ls -R 定位。'
        },
        {
          title: 'ls -R 在空目录没有输出',
          op: '清空 logs 目录后执行 ls -R',
          err: '（无任何输出）',
          why: '目录确实为空，没有任何文件或子目录可列出，这是正常行为而非报错。',
          fix: ['用 ls -la 确认目录状态，结合上下文判断'],
          lesson: '无输出 ≠ 出错。'
        },
        {
          title: 'rm 参数顺序写错',
          op: 'rm rf temp_data/',
          err: "rm: cannot remove 'rf': No such file or directory",
          why: 'Linux 把 rf 当成了文件名，而不是参数；参数必须带横杠且写在命令与路径之间。',
          fix: ['正确写法：rm -rf temp_data/'],
          lesson: '参数必须带 - 且连写；rm -rf 是最危险的命令之一，执行前务必确认路径。'
        },
        {
          title: '用 mkdir 创建了「图片文件」',
          op: 'mkdir im001.jpg（本意是建空图片文件）',
          err: '（无报错，但类型完全错了）',
          why: 'mkdir 只会创建目录，结果得到一个名为 im001.jpg 的文件夹。',
          fix: ['rm -r im001.jpg 删除错误目录', 'touch im001.jpg 创建正确的空文件'],
          lesson: 'mkdir 建目录、touch 建文件，两者不可互换。'
        },
        {
          title: '用 mkdir 创建 readme.txt',
          op: 'mkdir readme.txt（本意是建文本说明文件）',
          err: '训练脚本读取时报 Is a directory',
          why: '文件扩展名（.txt）不决定文件类型，创建命令才决定；readme.txt 实际是文件夹。',
          fix: ['rm -rf readme.txt 删除错误文件夹', 'touch readme.txt 创建正确文件'],
          lesson: 'ls -R 输出里带冒号（./readme.txt:）或 ls -l 首字符为 d，就说明它是目录。'
        }
      ],
      tips: [
        '建房子（存东西）用 touch，建仓库（装房子）用 mkdir。',
        'rm 删了就真没了，没有回收站——执行前三思。',
        '参数必须带横杠且连写：rm -rf，不是 rm rf。',
        '无输出不等于报错，结合上下文判断。'
      ],
      scenarios: [
        { stage: '初始探索', action: 'ls -l /home/deepvision', result: '按首字符（d / -）区分文件与目录' },
        { stage: '目录导航', action: 'cd a → pwd', result: '成功进入并确认当前路径' },
        { stage: '搭建项目骨架', action: 'mkdir models；touch config.yaml', result: '目录与文件分别创建成功' },
        { stage: '文件归档', action: 'mv config.yaml logs/', result: '移动成功，原位置不再有该文件' },
        { stage: '备份模型', action: 'cp -r models checkpoints/backup_models', result: '递归复制整个目录' },
        { stage: '清理临时文件', action: 'rm config.yaml（失败）→ cd logs 后删除', result: '先定位再删除，清理成功' },
        { stage: '终极清理', action: 'rm -rf a', result: '项目目录被彻底清除' },
        { stage: '补强训练', action: 'mkdir / touch / rm -rf / ls -R', result: '修正文件与目录混淆后通关' }
      ]
    },
    /* ================= Day 2 ================= */
    {
      id: 'day2',
      num: 'DAY 2',
      short: '查看与文本',
      title: 'Linux 查看、搜索与文本处理',
      tagline: '文本处理三板斧：看内容、过滤、再加工',
      icon: '🔍',
      accent: '#a78bfa',
      summary: '掌握文本处理「三板斧」：cat / head / tail 读内容、grep 过滤、sed / wc 加工，并经历了从「删库惊魂」到「Vim 越狱」的完整闭环。',
      goals: [
        '查看：cat / head / tail（tail -f 实时盯日志）',
        '过滤：grep + 正则 ^ $ + 管道 |',
        '加工：sed 批量替换、wc -l 统计',
        '编辑：nano 快速改配置、vim 模式切换',
        '心法：报错是系统给的提示，不是惩罚'
      ],
      closing: '报错是系统给你的提示，而不是惩罚。把 grep / sed / wc 用管道串起来，你就有了一条属于自己的数据清洗流水线。',
      commands: [
        { cmd: 'cat', full: 'Concatenate', use: '查看文件完整内容', scene: '快速检查 config.json 里的超参数配置', group: '查看' },
        { cmd: 'head', full: 'Head', use: '查看文件前 N 行', scene: '预览 10GB 数据集 train.csv 的前 10 行表头', group: '查看' },
        { cmd: 'tail', full: 'Tail', use: '查看文件后 N 行', scene: 'tail -f training.log 实时盯 Loss 下降', group: '查看' },
        { cmd: 'grep', full: 'Global Regular Expression Print', use: '文本过滤与搜索', scene: 'grep -v "ERROR" 剔除脏数据、提取报错日志', group: '搜索' },
        { cmd: 'sed', full: 'Stream Editor', use: '流编辑器（替换 / 删除）', scene: "sed 's/old/new/g' 批量替换数据集里的错误标签", group: '加工' },
        { cmd: 'wc', full: 'Word Count', use: '统计行数 / 字数', scene: 'wc -l 快速统计清洗后的有效样本总数', group: '加工' },
        { cmd: 'nano', full: "Nano's ANOther editor", use: '终端简易文本编辑器', scene: '快速修改 .env 里的 API Key 或环境变量', group: '编辑' },
        { cmd: 'vim', full: 'Vi IMproved', use: '终端高级文本编辑器', scene: '在服务器上重构 Python 训练脚本逻辑', group: '编辑' }
      ],
      mindmap: {
        label: 'DAY 2',
        center: '查看 / 搜索<br>文本处理',
        branches: [
          { name: '快速查看', nodes: ['cat', 'head -n 10', 'tail -f training.log'] },
          { name: '过滤搜索', nodes: ['grep', 'grep -v', '^ 行首 / $ 行尾', '管道 |'] },
          { name: '文本加工', nodes: ["sed 's/old/new/g'", 'wc -l'] },
          { name: '编辑器', nodes: ['nano', 'vim → Esc → :wq / :q!'] }
        ]
      },
      issues: [
        {
          title: 'Vim 编辑器「卡死」无法退出',
          op: '在 Vim 中直接输入 :q! 或狂按 Ctrl+C',
          err: '输入内容变成普通文本，无法退出，甚至提示 No write since last change',
          why: '陷入了 Vim 的插入模式（Insert Mode），此时系统把指令当成普通字符写进了文件。',
          fix: ['先按 Esc 退回命令模式（确认左下角 -- INSERT -- 消失）', '再输入 :q! 不保存退出，或 :wq 保存退出，然后回车'],
          lesson: '不管发生什么，想退出 Vim 先按 Esc。'
        },
        {
          title: 'Python 脚本运行没有任何输出',
          op: '在文件中写入 epochs = 50，然后执行 python3 test.py',
          err: '光标直接换行，没有任何输出',
          why: 'Python 是执行语言而非展示语言，变量赋值在后台静默完成，没有触发打印。',
          fix: ['在代码中显式加入 print("Epochs:", epochs)', '重新运行即可看到输出'],
          lesson: '没输出不是没运行，是你没让它说话。'
        },
        {
          title: '路径迷失与文件找不到',
          op: '执行 cd home 或 python3 advanced.py',
          err: 'No such file or directory',
          why: 'Linux 严格区分相对路径与绝对路径，且当前工作目录（PWD）可能已不在预期位置。',
          fix: ['操作前先 pwd 确认绝对路径', '用 ls 确认文件是否在当前目录下'],
          lesson: '迷路先定：先 pwd，再 ls。'
        },
        {
          title: '误用 rm -rf 导致目录被清空',
          op: '在 /home 目录下执行 rm -rf deepvision/* 做清理',
          err: '后续 cd / ls 报错，发现用户目录已被清空',
          why: 'rm -rf 是核武器级命令，没有确认提示，且通配符 * 匹配了所有文件。',
          fix: ['永远在 rm -rf 之前先用 ls 预览匹配结果', '养成在用户专属目录（如 ~/deepvision）下操作的习惯'],
          lesson: '删前必看：rm -rf 之前，先 ls 确认目标。'
        }
      ],
      tips: [
        '删前必看：rm -rf 之前，先 ls 确认目标。',
        '迷路先定：不知道在哪时，先 pwd 再 ls。',
        'Vim 先 Esc：无论发生什么，想退出先狂按 Esc。',
        'Python 要 Print：没输出不是没运行，是你没让它说话。',
        '管道出奇迹：grep -v "^#" | grep -v "^$" | wc -l 就是一条清洗流水线。'
      ],
      scenarios: [
        { stage: '探索与破坏', action: 'cd /home → rm -rf deepvision/*', result: '体验文件系统的破坏力，从此「删前必看」' },
        { stage: '数据清洗', action: 'grep -v "^#" file | grep -v "^$"', result: '用正则 + 管道剔除注释行与空行' },
        { stage: '统计验证', action: '... | wc -l 或 grep -c "."', result: '统计清洗后的有效样本数' },
        { stage: '编辑器实战', action: 'vim test.py → Esc → :wq', result: '突破模式限制，写入并保存代码' },
        { stage: '运行验收', action: 'python3 test.py → 输出 hi vim', result: '代码逻辑与执行环境验证通过，Day 2 闭环' }
      ]
    },
    /* ================= Day 3 ================= */
    {
      id: 'day3',
      num: 'DAY 3',
      short: '权限与进程',
      title: '权限管理与进程控制',
      tagline: '权限是 Linux 的基石，进程是 AI 的脉搏',
      icon: '🔐',
      accent: '#3ddc97',
      summary: '掌握文件归属、权限控制与进程生杀大权：从「乱用 777」到「chown 归还 + chmod g+w 精确授权」，并建立「先礼后兵」的进程处理策略。',
      goals: [
        '提权与装包：sudo / apt update && apt install',
        '归属修正：sudo chown $USER:$USER',
        '权限：chmod 八进制（755 / 644 / 600）+ 符号法（g+w / a-x）',
        '进程：ps -u $USER → kill → kill -9',
        '路径：分清 /tmp（重启即焚）与 /home（永久存储）'
      ],
      closing: '今天最大的收获不是记住 chmod 777，而是明白为什么不能乱用 777，以及如何通过 chown 和 chmod g+w 优雅地解决权限问题。这种「知其所以然」的思维，才是成为 AI 工程师的关键。',
      commands: [
        { cmd: 'sudo', full: 'SuperUser Do', use: '临时获取 Root 权限', scene: '安装 CUDA 驱动、系统级依赖（apt install）', group: '权限' },
        { cmd: 'apt', full: 'Advanced Package Tool', use: '软件包管理：安装 / 更新 / 移除', scene: 'apt update 更新包列表；apt install python3-pip 装依赖', group: '软件包' },
        { cmd: 'mkdir -p', full: 'Make Directory (Parents)', use: '递归创建多级目录（父目录不存在也不报错）', scene: 'mkdir -p ~/ai_project/{models,datasets,logs}', group: '创建' },
        { cmd: 'chown', full: 'Change Owner', use: '修改文件 / 目录所有者', scene: '解决 root 创建的目录无法写入，归还所有权', group: '权限' },
        { cmd: 'chmod', full: 'Change Mode', use: '修改读 / 写 / 执行权限', scene: '755 给训练脚本、600 锁定 API Key、g+w 让同组写入共享目录', group: '权限' },
        { cmd: 'ps', full: 'Process Status', use: '查看进程快照', scene: '监控后台训练任务，确认 PID', group: '进程' },
        { cmd: 'kill', full: 'Kill Process', use: '发送终止信号（SIGTERM）', scene: '优雅停止训练，允许保存 Checkpoint', group: '进程' },
        { cmd: 'kill -9', full: 'SIGKILL', use: '强制立即终止', scene: '核武器：处理 GPU 显存泄漏、死锁、无响应进程', group: '进程' }
      ],
      mindmap: {
        label: 'DAY 3',
        center: '权限与进程',
        branches: [
          { name: '提权 / 装包', nodes: ['sudo', 'apt update && apt install'] },
          { name: '归属', nodes: ['chown $USER:$USER', 'ls -ld 验证'] },
          { name: '权限', nodes: ['chmod 755 / 644 / 600', '符号法 g+w / a-x', '4-2-1 法则'] },
          { name: '进程', nodes: ['ps -u $USER', 'kill PID', 'kill -9 PID'] }
        ]
      },
      permissions: {
        bits: [
          { k: 'r', name: 'read', val: 4, desc: '对文件可 cat 查看；对目录可 ls 列出文件名' },
          { k: 'w', name: 'write', val: 2, desc: '对文件可修改内容；对目录可创建/删除文件' },
          { k: 'x', name: 'execute', val: 1, desc: '对文件可运行；对目录可 cd 进入' }
        ],
        who: [
          { k: 'u', name: 'user / Owner', pos: '第 1~3 位', desc: '文件所有者' },
          { k: 'g', name: 'group', pos: '第 4~6 位', desc: '文件所属组' },
          { k: 'o', name: 'others', pos: '第 7~9 位', desc: '其他用户' },
          { k: 'a', name: 'all', pos: 'u + g + o', desc: '所有用户' }
        ],
        presets: [
          { mode: '777', sym: 'rwxrwxrwx', risk: 'danger', desc: '所有人全权限！极度危险，仅临时测试' },
          { mode: '755', sym: 'rwxr-xr-x', risk: 'safe', desc: '脚本 / 程序：所有者全权，组和其他只读执行' },
          { mode: '750', sym: 'rwxr-x---', risk: 'safe', desc: '私有项目：所有者全权，组可读执行，其他无权限' },
          { mode: '700', sym: 'rwx------', risk: 'safe', desc: '个人私密目录：仅所有者全权限' },
          { mode: '644', sym: 'rw-r--r--', risk: 'safe', desc: '普通数据 / 配置文件：所有者读写，其他只读' },
          { mode: '640', sym: 'rw-r-----', risk: 'safe', desc: '共享但保密的数据：所有者读写，组只读' },
          { mode: '600', sym: 'rw-------', risk: 'safe', desc: 'API Key / 密码文件：仅所有者读写' },
          { mode: '660', sym: 'rw-rw----', risk: 'warn', desc: '团队协作数据：所有者和组可读写' },
          { mode: '666', sym: 'rw-rw-rw-', risk: 'warn', desc: '所有人可读可写（不可执行），临时共享草稿' },
          { mode: '421', sym: 'r--w--x', risk: 'warn', desc: '极端场景：只读 / 只写 / 只执行，极少使用' },
          { mode: '400', sym: 'r--------', risk: 'safe', desc: '只读的密钥 / 证书文件' },
          { mode: '000', sym: '---------', risk: 'warn', desc: '无任何权限，用于锁定文件，需配合 chown 恢复' }
        ],
        compare: [
          { scene: '给脚本加执行权限', sym: 'chmod +x script.sh', oct: 'chmod 755 script.sh', pick: '符号法更直观' },
          { scene: '精确设置三类用户权限', sym: 'chmod u=rwx,g=rx,o= file', oct: 'chmod 750 script.sh', pick: '八进制更简洁' },
          { scene: '只给组加写权限', sym: 'chmod g+w dir/', oct: '（八进制无法单独改一组）', pick: '必须用符号法' },
          { scene: '去掉所有人的执行权限', sym: 'chmod a-x file', oct: 'chmod 644 file', pick: '符号法更方便' },
          { scene: '递归设置目录权限', sym: 'chmod -R 755 dir/', oct: 'chmod -R 755 dir/', pick: '八进制 + -R' }
        ],
        decodeExamples: [
          { str: 'drwxr-xr-x', type: '目录', mode: '755', note: '所有者 rwx=7，组 r-x=5，其他 r-x=5' },
          { str: '-rw-------', type: '普通文件', mode: '600', note: 'API Key 等敏感文件的常见权限' }
        ],
        killFlow: [
          { text: 'ps -u $USER', tone: '' },
          { text: '定位 PID', tone: '' },
          { text: 'kill PID（SIGTERM）', tone: 'cool' },
          { text: '进程退出？→ 保存数据', tone: '' },
          { text: 'kill -9 PID（SIGKILL）', tone: 'hot' },
          { text: '仍占 GPU → 检查/重启环境', tone: '' }
        ]
      },
      issues: [
        {
          title: '路径拼写与层级陷阱',
          op: 'sudo mkdir /tem/my-dataset',
          err: 'No such file or directory',
          why: '① 拼写错误：把临时目录 /tmp 误写成 /tem；② 父目录不存在时，mkdir 默认无法递归创建。',
          fix: ['ls / 确认根目录下只有 tmp', '修正路径并加 -p：sudo mkdir -p /tmp/my_dataset'],
          lesson: 'tmp 不是 tem；多级创建记得加 -p。'
        },
        {
          title: '权限归属导致的「只读」困境',
          op: '用 sudo 创建目录后，普通用户尝试写入数据',
          err: 'Permission denied',
          why: 'sudo 创建的目录默认归属 root:root，普通用户没有写权限。',
          fix: ['ls -ld /tmp/my_dataset 确认所有者是 root', '关键一步：sudo chown $USER:$USER /tmp/my_dataset', '再次 ls -ld 验证所有者变为 deepvision'],
          lesson: '借来的权限要归还，chown 之后才安稳。'
        },
        {
          title: 'chmod 权限理解误区',
          op: '用 chmod 777 给目录设置权限（认为最方便）',
          err: '（无报错，但被安全审计 / 代码审查指出风险）',
          why: '777 意味着任何人都有读写执行权限，在包含模型权重和 API 密钥的环境中风险极大。',
          fix: ['改用 chmod 755（脚本）或 chmod 644（文件）', '用 chmod g+w 精确给组加写权限，避免一刀切', '用 ls -la 验证权限位是否正确'],
          lesson: '777 是懒人的陷阱，g+w 才是优雅的选择。'
        },
        {
          title: 'chmod 符号法与八进制法混淆',
          op: '想用八进制只给组加写权限：chmod 2 dir/',
          err: '权限未按预期设置',
          why: '八进制三位分别对应 u/g/o，chmod 2 等价于 chmod 002，即「其他用户只有写权限」，而不是给组加写。',
          fix: ['只改某一类用户时必须用符号法：chmod g+w dir/', '需要一次性设定三类用户时用八进制：chmod 750 dir/'],
          lesson: '改一组用符号，设全部用八进制。'
        },
        {
          title: '僵尸进程与强制终结',
          op: '模拟后台训练，先 kill 后 kill -9',
          err: 'kill 1675 → [1]+ Terminated；kill -9 1728 → [1]+ Killed',
          why: 'Terminated 表示程序收到 SIGTERM，正常清理后退出；Killed 表示内核直接抹除进程，不给保存数据的机会。',
          fix: ['先用 ps -u $USER 找到 PID', '优先 kill PID 让它优雅退出', '无响应 / 显存泄漏再用 kill -9'],
          lesson: '杀进程有度：先礼（kill）后兵（kill -9），数据保存第一。'
        }
      ],
      tips: [
        '路径要看清：tmp 不是 tem，多级创建加 -p。',
        'Sudo 需谨慎：借来的权限要归还，chown 之后才安稳。',
        '杀进程有度：先礼（kill）后兵（kill -9），数据保存第一。',
        '装包先更新：apt install 前先 apt update，避免装到过期版本。',
        'chmod 讲精确：777 是懒人的陷阱，g+w 才是优雅的选择。',
        '改一组用符号，设全部用八进制：chmod g+w 改一组，chmod 755 设全部。',
        '421 是极端值：4=只读，2=只写，1=只执行，别乱用。'
      ],
      scenarios: [
        { stage: '环境准备', action: 'sudo apt update && sudo apt install ...', result: '更新包列表并安装系统依赖，为 AI 环境打底' },
        { stage: '项目初始化', action: 'mkdir -p ~/ai_project/{models,datasets,logs}', result: '搭建规范的项目目录结构' },
        { stage: '资源创建', action: 'sudo mkdir /tmp/my_dataset', result: '在临时目录建立工作区（归属 root）' },
        { stage: '权限修正', action: 'sudo chown $USER:$USER /tmp/my_dataset', result: '所有权从 root 转移给当前用户' },
        { stage: '权限精细化', action: 'chmod 755 train.sh；chmod 600 .env；chmod g+w datasets/', result: '脚本可执行、密钥安全锁定、组内可协作' },
        { stage: '符号法实操', action: 'chmod u+rwx / g+rwx / o-rwx / a+x', result: '练习增加、去掉、赋值三类操作' },
        { stage: '八进制实操', action: 'chmod 777 / 755 / 644 / 600 / 421', result: '练习八进制精确授权（并识别 777 的风险）' },
        { stage: '状态验证', action: 'ls -ld /tmp/my_dataset', result: '看到 drwxr-xr-x deepvision deepvision，验收合格' },
        { stage: '进程模拟', action: 'python3 -c "..." &', result: '模拟后台训练，生成 PID 1675 / 1728' },
        { stage: '监控清理', action: 'ps -u $USER → kill → kill -9', result: '像雷达一样扫描，先礼后兵清理进程、释放资源' }
      ]
    }
  ]
};




