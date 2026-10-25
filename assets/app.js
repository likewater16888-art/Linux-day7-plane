/* ============================================================
   Linux 三日通关 · 应用层
   经典脚本（非 ES Module），可直接 file:// 双击打开
   ============================================================ */
/* global KB */
(function () {
  'use strict';

  const $ = (sel, root) => (root || document).querySelector(sel);
  const viewEl = $('#view');
  const searchEl = $('#search');
  const crumbsEl = $('#crumbs');
  const metaEl = $('#topbarMeta');
  const toastEl = $('#toast');
  const dayNavEl = $('#dayNav');

  /* ---------------- 天列表：KB.days + 可选的 days/*.js ----------------
     新增一天 = 往 assets/data.js 的 days 数组里追加一个对象；
     也可以新建 days/day4.js（window.EXTRA_DAYS.push({...})）再到 index.html 打开对应 <script>。
     下面的补全逻辑会让「只写了部分字段」的新一天也能正常渲染。 */
  const ACCENTS = ['#5cc8ff', '#a78bfa', '#3ddc97', '#f5a524', '#ff7b72', '#4fd1c5', '#e879f9'];
  const EXTRA_DAYS = Array.isArray(window.EXTRA_DAYS) ? window.EXTRA_DAYS : [];
  const DAYS = [];

  KB.days.concat(EXTRA_DAYS).forEach(function (raw) {
    const d = raw || {};
    const n = DAYS.length + 1;
    d.id = d.id || 'day' + n;
    if (DAYS.some(function (x) { return x.id === d.id; })) {
      console.warn('[知识库] 重复的 day id「' + d.id + '」已忽略，请检查 data.js / days 目录。');
      return;
    }
    d.num = d.num || 'DAY ' + n;
    d.title = d.title || d.short || ('第 ' + n + ' 天');
    d.short = d.short || d.title;
    d.icon = d.icon || '📘';
    d.accent = d.accent || ACCENTS[(n - 1) % ACCENTS.length];
    d.tagline = d.tagline || '';
    d.summary = d.summary || '';
    d.closing = d.closing || '';
    d.goals = d.goals || [];
    d.tips = d.tips || [];
    d.scenarios = d.scenarios || [];
    d.commands = (d.commands || []).map(function (c) {
      return {
        cmd: c.cmd || '', full: c.full || '—', use: c.use || '',
        scene: c.scene || '', group: c.group || '其他'
      };
    });
    d.issues = (d.issues || []).map(function (it) {
      return {
        title: it.title || '(未命名案例)', op: it.op || '—', err: it.err || '—',
        why: it.why || '—', fix: it.fix == null ? '—' : it.fix, lesson: it.lesson || '—'
      };
    });
    d.mindmap = d.mindmap || {};
    d.mindmap.label = d.mindmap.label || d.num;
    d.mindmap.center = d.mindmap.center || d.short;
    d.mindmap.branches = (d.mindmap.branches || []).map(function (b) {
      return { name: b.name || '', nodes: b.nodes || [] };
    });
    if (d.permissions) {
      ['bits', 'who', 'presets', 'compare', 'decodeExamples', 'killFlow'].forEach(function (k) {
        d.permissions[k] = d.permissions[k] || [];
      });
    }
    DAYS.push(d);
  });

  const DAY_MAP = {};
  DAYS.forEach((d) => { DAY_MAP[d.id] = d; });

  const ALL_COMMANDS = [];
  DAYS.forEach((d) => d.commands.forEach((c) => ALL_COMMANDS.push({ day: d, c: c })));

  const STATS = {
    days: DAYS.length,
    commands: ALL_COMMANDS.length,
    issues: DAYS.reduce((n, d) => n + d.issues.length, 0),
    tips: DAYS.reduce((n, d) => n + d.tips.length, 0)
  };
  const LEVELS = ['未涉及', '入门', '熟练', '精通'];
  const NUM_CN = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
  function cnNum(n) { return NUM_CN[n] || String(n); }

  /* ---------------- 工具函数 ---------------- */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, (m) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[m]));
  }
  function fmt(s) {
    return esc(s)
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  }
  function dayStyle(day) { return '--day:' + ((day && day.accent) || '#3ddc97'); }

  let toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toastEl.classList.remove('show'); }, 1800);
  }

  function copyText(text) {
    const done = function () { toast('已复制：' + text); };
    const fallback = function () {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); done(); } catch (e) { toast('复制失败，请手动选择'); }
      document.body.removeChild(ta);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(fallback);
    } else {
      fallback();
    }
  }

  /* ---------------- 侧边栏：每天入口（按 DAYS 自动生成） ---------------- */
  dayNavEl.innerHTML = DAYS.map((d) => (
    '<a class="nav-item nav-sub" href="#/' + d.id + '" data-view="' + d.id + '" style="' + dayStyle(d) + '">' +
      '<span><span class="nav-day-no">' + esc(d.num) + '</span>' +
      '<span class="nav-title">' + esc(d.short) + '</span></span>' +
      '<span class="dot"></span>' +
    '</a>'
  )).join('');

  /* ---------------- 路由 ---------------- */
  const routes = {
    overview: renderOverview,
    cheatsheet: renderCheatsheet,
    lab: renderLab
  };
  DAYS.forEach((d) => { routes[d.id] = function () { return renderDay(d); }; });

  function currentRoute() {
    const h = (location.hash || '').replace(/^#\/?/, '').trim();
    return routes[h] ? h : 'overview';
  }

  function setChrome(route, query) {
    metaEl.innerHTML =
      '<span class="chip-soft">' + STATS.days + ' 天</span>' +
      '<span class="chip-soft">' + STATS.commands + ' 条命令</span>' +
      '<span class="chip-soft">' + STATS.issues + ' 个排错</span>';

    if (query) {
      crumbsEl.innerHTML = '<b>搜索结果</b> · “' + esc(query) + '”';
    } else if (DAY_MAP[route]) {
      const d = DAY_MAP[route];
      crumbsEl.innerHTML = '<b>' + esc(d.num) + '</b> · ' + esc(d.title);
    } else {
      const map = { overview: '知识地图 · 总览', cheatsheet: '命令速查 · 全部 ' + STATS.days + ' 天', lab: '权限实验室' };
      crumbsEl.innerHTML = '<b>' + esc(map[route] || '知识地图') + '</b>';
    }

    const base = (KB.meta && KB.meta.title) || 'Linux 知识库';
    document.title = (query ? '搜索“' + query + '” · '
      : DAY_MAP[route] ? DAY_MAP[route].num + ' · ' : '') + base;

    Array.prototype.forEach.call(document.querySelectorAll('.nav-item[data-view]'), (a) => {
      const on = a.getAttribute('data-view') === route && !query;
      a.classList.toggle('active', on);
      if (on) { a.setAttribute('aria-current', 'page'); } else { a.removeAttribute('aria-current'); }
    });
  }

  function render() {
    const q = (searchEl.value || '').trim();
    const route = currentRoute();
    viewEl.innerHTML = q ? renderSearch(q) : routes[route]();
    setChrome(route, q);
    bindDecode();
  }

  function go(hash) {
    searchEl.value = '';
    location.hash = hash;
    render();
  }
  /* ---------------- 视图①：总览 ---------------- */
  function renderOverview() {
    const stats = [
      { v: STATS.days, t: '天学习历程' },
      { v: STATS.commands, t: '条命令卡片' },
      { v: STATS.issues, t: '个真实排错' },
      { v: STATS.tips, t: '条避坑口诀' },
      { v: LEVELS.length - 1, t: '层能力进阶' }
    ].map((s) => '<div class="stat"><b>' + s.v + '</b><span>' + s.t + '</span></div>').join('');

    /* 箭头只在「一行放得下」时显示（3 天 + NEXT = 4 个） */
    const hasArrow = DAYS.length + 1 <= 4;
    const path = DAYS.map((d) => (
      '<a class="path-item" href="#/' + d.id + '" style="--c:' + d.accent + '">' +
        '<span class="step">' + esc(d.num) + '</span>' +
        '<h3>' + esc(d.short) + '</h3>' +
        '<p>' + esc(d.tagline) + '</p>' +
        (hasArrow ? '<span class="arrow">›</span>' : '') +
      '</a>'
    )).join('') +
      '<a class="path-item" href="#/cheatsheet" style="--c:#94a3b8">' +
        '<span class="step">NEXT</span><h3>继续进阶</h3>' +
        '<p>环境变量 / 后台训练 / 排查工具</p>' +
        (hasArrow ? '<span class="arrow">›</span>' : '') +
      '</a>';

    const models = KB.mentalModels.map((m) => (
      '<div class="model">' +
        '<div class="model-top"><span class="model-ico">' + m.icon + '</span><h3>' + esc(m.title) + '</h3></div>' +
        '<p>' + fmt(m.body) + '</p>' +
        '<div class="src">来源 · ' + esc(m.from) + '</div>' +
      '</div>'
    )).join('');

    const skillRows = KB.skills.map((s) => {
      const cells = DAYS.map((d, i) => {
        const lv = Math.max(0, Math.min(3, Number(s.levels[i]) || 0));
        const c = d.accent;
        let bars = '';
        for (let k = 1; k <= 3; k++) {
          bars += '<i class="' + (k <= lv ? 'on p' + k : '') + '" style="--c:' + c + '"></i>';
        }
        return '<div class="bar" title="' + esc(d.num + ' · ' + LEVELS[lv]) + '">' + bars + '</div>';
      }).join('');
      return '<div class="skill-row"><span class="skill-name">' + esc(s.name) + '</span>' + cells + '</div>';
    }).join('');
    const dayCards = DAYS.map((d) => (
      '<a class="daycard" href="#/' + d.id + '" style="--c:' + d.accent + '">' +
        '<div class="daycard-top"><span class="daycard-ico">' + d.icon + '</span>' +
          '<span class="daycard-no">' + esc(d.num) + '</span></div>' +
        '<h3>' + esc(d.title) + '</h3>' +
        '<p>' + esc(d.summary) + '</p>' +
        '<div class="daycard-tags">' + d.mindmap.branches.map((b) =>
          '<span class="pill day">' + esc(b.name) + '</span>').join('') + '</div>' +
        '<div class="daycard-foot"><span>' + d.commands.length + ' 命令 · ' + d.issues.length +
          ' 排错 · ' + d.tips.length + ' 口诀</span><span class="go">进入复习 →</span></div>' +
      '</a>'
    )).join('');

    /* 前 3 天用人工挑选的口诀；以后新增的天自动取前 2 条（总上限 12 条） */
    const picked = [];
    [[0, 1], [0, 2], [1, 2], [1, 3], [2, 0], [2, 1], [2, 2], [2, 4]].forEach((pair) => {
      const d = DAYS[pair[0]];
      if (d && d.tips[pair[1]]) { picked.push({ d: d, t: d.tips[pair[1]] }); }
    });
    DAYS.slice(3).forEach((d) => {
      d.tips.slice(0, 2).forEach((t) => picked.push({ d: d, t: t }));
    });
    const avoidPicks = picked.slice(0, 12);
    const avoid = avoidPicks.map((x, i) => (
      '<div class="avoid-item">' +
        '<span class="idx">' + String(i + 1).padStart(2, '0') + '</span>' +
        '<span class="txt">' + fmt(x.t) + '</span>' +
        '<span class="src pill day" style="--day:' + x.d.accent + '">' + esc(x.d.num) + '</span>' +
      '</div>'
    )).join('');

    const next = KB.nextSteps.map((n) => (
      '<div class="model"><div class="model-top"><span class="model-ico">🚀</span><h3>' + esc(n.title) + '</h3></div>' +
      '<p>' + fmt(n.body) + '</p></div>'
    )).join('');

    return '' +
      '<section class="hero">' +
        '<span class="hero-eyebrow">🐧 LINUX · ' + STATS.days + ' DAYS · KNOWLEDGE BASE</span>' +
        '<h1>' + cnNum(STATS.days) + '天，把 Linux 从<span class="grad">「会敲」</span>变成<span class="grad">「会用」</span></h1>' +
        '<p class="hero-lead">' + esc(KB.meta.subtitle) + '</p>' +
        '<div class="hero-actions">' +
          (DAYS[0] ? '<a class="btn primary" href="#/' + DAYS[0].id + '">▶ 从 ' + esc(DAYS[0].num) + ' 开始</a>' : '') +
          '<a class="btn" href="#/cheatsheet">📋 命令速查</a>' +
          '<a class="btn" href="#/lab">🧪 权限实验室</a>' +
        '</div>' +
        '<div class="stats">' + stats + '</div>' +
      '</section>' +

      '<section class="section">' +
        '<div class="section-head"><h2><span class="num">01</span>学习路径</h2><p>点击卡片进入当天详情</p></div>' +
        '<div class="path">' + path + '</div>' +
      '</section>' +

      '<section class="section">' +
        '<div class="section-head"><h2><span class="num">02</span>' + cnNum(KB.mentalModels.length) + '个心智模型</h2>' +
          '<p>比记住命令更重要的，是知道什么时候用它</p></div>' +
        '<div class="grid grid-3">' + models + '</div>' +
      '</section>' +

      '<section class="section">' +
        '<div class="section-head"><h2><span class="num">03</span>' + cnNum(STATS.days) + '日能力矩阵</h2>' +
          '<p>根据 ' + STATS.days + ' 份学习总结的成果描述整理</p></div>' +
        '<div class="card matrix" style="--cols:' + DAYS.length + '">' +
          '<div class="matrix-head"><span>能力项</span>' +
            DAYS.map((d) => '<span>' + esc(d.num) + '</span>').join('') + '</div>' +
          skillRows +
          '<div class="matrix-legend">' +
            DAYS.map((d) => '<span><i style="background:' + d.accent + '"></i>' + esc(d.short) + '</span>').join('') +
            '<span>3 格 = 精通 · 2 格 = 熟练 · 1 格 = 入门</span></div>' +
        '</div>' +
      '</section>' +

      '<section class="section">' +
        '<div class="section-head"><h2><span class="num">04</span>' + cnNum(STATS.days) + '日速览</h2><p>每天一屏，快速回忆</p></div>' +
        '<div class="grid grid-auto">' + dayCards + '</div>' +
      '</section>' +

      '<section class="section">' +
        '<div class="section-head"><h2><span class="num">05</span>全局避坑清单</h2><p>都是从真实报错里换来的</p></div>' +
        '<div class="avoid">' + avoid + '</div>' +
      '</section>' +

      '<section class="section">' +
        '<div class="section-head"><h2><span class="num">06</span>下一步学什么</h2><p>' + STATS.days + ' 份总结指向的进阶方向</p></div>' +
        '<div class="grid grid-3">' + next + '</div>' +
      '</section>';
  }
  /* ---------------- 视图②：单日详情 ---------------- */
  function renderDay(day) {
    const blocks = [];

    blocks.push({
      title: '知识地图',
      note: '一张图看清当天命令的分工',
      html: mindmapHtml(day)
    });

    blocks.push({
      title: '命令卡片',
      note: '点击 ⧉ 直接复制命令',
      html: '<div class="grid grid-auto">' + day.commands.map(cmdCard).join('') + '</div>'
    });

    if (day.permissions) {
      permissionBlocks(day).forEach((b) => blocks.push(b));
    }

    blocks.push({
      title: '排错档案',
      note: '共 ' + day.issues.length + ' 个真实案例，点击标题展开',
      html: '<div class="issues">' + day.issues.map(issueItem).join('') + '</div>'
    });

    blocks.push({
      title: '避坑口诀',
      note: '考前 / 上手前先读一遍',
      html: '<div class="tips">' + day.tips.map((t) => '<div class="tip">' + fmt(t) + '</div>').join('') + '</div>'
    });

    blocks.push({
      title: '实战时间线',
      note: '当天真正敲过的命令链',
      html: '<div class="card" style="padding:20px 22px"><div class="timeline" style="' + dayStyle(day) + '">' +
        day.scenarios.map(timelineItem).join('') + '</div></div>'
    });

    const idx = DAYS.indexOf(day);
    const prev = DAYS[idx - 1];
    const nextDay = DAYS[idx + 1];
    const pager = '<div class="hero-actions" style="margin-top:14px">' +
      (prev ? '<a class="btn" href="#/' + prev.id + '">← ' + esc(prev.num) + ' ' + esc(prev.short) + '</a>' : '') +
      (nextDay
        ? '<a class="btn primary" href="#/' + nextDay.id + '">' + esc(nextDay.num) + ' ' + esc(nextDay.short) + ' →</a>'
        : '<a class="btn primary" href="#/cheatsheet">去命令速查 →</a>') +
      '</div>';

    return '' +
      '<section class="day-hero" style="' + dayStyle(day) + '">' +
        '<span class="day-badge">' + day.icon + ' ' + esc(day.num) + ' · ' + esc(day.tagline) + '</span>' +
        '<h1>' + esc(day.title) + '</h1>' +
        '<p class="lead">' + esc(day.summary) + '</p>' +
        '<ul class="day-goals">' + day.goals.map((g) => '<li>' + fmt(g) + '</li>').join('') + '</ul>' +
        '<div class="day-hero-foot">' +
          '<span class="pill">' + day.commands.length + ' 条命令</span>' +
          '<span class="pill">' + day.issues.length + ' 个排错</span>' +
          '<span class="pill">' + day.tips.length + ' 条口诀</span>' +
          '<a class="btn sm ghost" href="#/cheatsheet">命令速查 →</a>' +
        '</div>' +
      '</section>' +
      blocks.map(sectionBlock).join('') +
      '<section class="section">' +
        '<div class="card" style="padding:20px 22px;border-left:3px solid ' + day.accent + '">' +
          '<div class="faint" style="font-size:11.5px;letter-spacing:1.4px">教练寄语</div>' +
          '<p style="margin:6px 0 0;font-size:13.5px">' + esc(day.closing) + '</p>' +
          (pager) +
        '</div>' +
      '</section>';
  }

  function sectionBlock(b, i) {
    return '<section class="section">' +
      '<div class="section-head"><h2><span class="num">' + String(i + 1).padStart(2, '0') + '</span>' +
      b.title + '</h2><p>' + b.note + '</p></div>' + b.html + '</section>';
  }

  function mindmapHtml(day) {
    return '<div class="card mindmap" style="' + dayStyle(day) + '">' +
      '<div class="map-center"><small>' + esc(day.mindmap.label) + '</small>' + day.mindmap.center + '</div>' +
      '<div class="map-branches">' +
        day.mindmap.branches.map((b) =>
          '<div class="branch"><span class="branch-name">' + esc(b.name) + '</span>' +
          b.nodes.map((nd) => '<span class="node">' + esc(nd) + '</span>').join('') + '</div>'
        ).join('') +
      '</div>' +
    '</div>';
  }

  function cmdCard(c) {
    return '<div class="cmd-card">' +
      '<div class="cmd-top"><span class="cmd-name">' + esc(c.cmd) + '</span>' +
        '<button class="copy-btn" type="button" data-copy="' + esc(c.cmd) + '" title="复制命令" aria-label="复制 ' + esc(c.cmd) + '">⧉</button>' +
      '</div>' +
      '<div class="cmd-full">' + esc(c.full) + ' · ' + esc(c.group) + '</div>' +
      '<div class="cmd-use">' + esc(c.use) + '</div>' +
      '<div class="cmd-scene"><b>AI 场景</b> · ' + fmt(c.scene) + '</div>' +
    '</div>';
  }

  function issueItem(it, i) {
    const fix = Array.isArray(it.fix)
      ? '<ul>' + it.fix.map((f) => '<li>' + fmt(f) + '</li>').join('') + '</ul>'
      : fmt(it.fix);
    return '<details class="issue"' + (i === 0 ? ' open' : '') + '>' +
      '<summary><span class="no">#' + String(i + 1).padStart(2, '0') + '</span>' +
        esc(it.title) + '<span class="chev">▸</span></summary>' +
      '<div class="issue-body">' +
        '<div class="field op"><span class="k">我的操作</span><span class="v">' + fmt(it.op) + '</span></div>' +
        '<div class="field err"><span class="k">系统报错</span><span class="v mono">' + fmt(it.err) + '</span></div>' +
        '<div class="field why"><span class="k">原因分析</span><span class="v">' + fmt(it.why) + '</span></div>' +
        '<div class="field fix"><span class="k">解决步骤</span><span class="v">' + fix + '</span></div>' +
        '<div class="field lesson"><span class="k">教训</span><span class="v">' + fmt(it.lesson) + '</span></div>' +
      '</div>' +
    '</details>';
  }

  function timelineItem(s, i) {
    return '<div class="tl-item">' +
      '<div class="tl-stage">' + String(i + 1).padStart(2, '0') + ' · ' + esc(s.stage) + '</div>' +
      '<div class="tl-action">' + esc(s.action) + '</div>' +
      '<div class="tl-result">' + esc(s.result) + '</div>' +
    '</div>';
  }
  /* ---------------- Day 3 专属：权限 / 进程模块 ---------------- */
  function permissionBlocks(day) {
    const p = day.permissions;
    const blocks = [];

    const bits = p.bits.map((b) =>
      '<div class="info-card"><span class="big">' + b.val + '</span>' +
        '<h4>' + esc(b.k) + ' · ' + esc(b.name) + '</h4><p>' + esc(b.desc) + '</p></div>'
    ).join('');

    const whoRows = p.who.map((w) =>
      '<tr><td class="m" style="color:var(--day)">' + esc(w.k) + '</td>' +
      '<td>' + esc(w.name) + '</td><td class="m">' + esc(w.pos) + '</td>' +
      '<td class="muted">' + esc(w.desc) + '</td></tr>'
    ).join('');

    blocks.push({
      title: '权限三要素：4-2-1',
      note: 'r=4、w=2、x=1，三段相加就是权限值',
      html: '<div class="info-grid">' + bits + '</div>' +
        '<div class="table-wrap" style="margin-top:12px"><table class="tbl">' +
          '<thead><tr><th>标识</th><th>含义</th><th>ls -l 中的位置</th><th>说明</th></tr></thead>' +
          '<tbody>' + whoRows + '</tbody></table></div>' +
        '<div class="tips" style="margin-top:12px"><div class="tip">' +
          '核心口诀：<b>4 = r，2 = w，1 = x</b>。7 = rwx 全开；6 = rw- 读写；5 = r-x 读执行；4 = r-- 只读；1 = --x 只执行。' +
        '</div></div>'
    });

    const presets = p.presets.map((x) =>
      '<button class="perm-card" type="button" data-copy="chmod ' + esc(x.mode) + ' &lt;file&gt;" ' +
        'data-risk="' + esc(x.risk) + '" title="点击复制 chmod ' + esc(x.mode) + ' 命令">' +
        '<span class="mode">' + esc(x.mode) + '</span> ' +
        '<span class="sym">' + esc(x.sym) + '</span>' +
        '<div class="desc">' + esc(x.desc) + '</div>' +
      '</button>'
    ).join('');

    blocks.push({
      title: '八进制速查',
      note: '点击卡片即可复制对应 chmod 命令',
      html: '<div class="perm-grid">' + presets + '</div>' +
        '<div class="hero-actions" style="margin:12px 0 0">' +
          '<a class="btn sm" href="#/lab">🧪 打开权限实验室（可视化试算）→</a>' +
        '</div>'
    });

    const compareRows = p.compare.map((c) =>
      '<tr><td>' + esc(c.scene) + '</td><td class="m">' + esc(c.sym) + '</td>' +
      '<td class="m">' + esc(c.oct) + '</td><td class="muted">' + esc(c.pick) + '</td></tr>'
    ).join('');

    blocks.push({
      title: '符号法 vs 八进制法',
      note: '改一组用符号，设全部用八进制',
      html: '<div class="table-wrap"><table class="tbl">' +
        '<thead><tr><th>场景</th><th>符号法（直观）</th><th>八进制法（简洁）</th><th>推荐</th></tr></thead>' +
        '<tbody>' + compareRows + '</tbody></table></div>'
    });

    const decodeRows = p.decodeExamples.map((d) =>
      '<tr><td class="m" style="color:var(--day)">' + esc(d.str) + '</td>' +
      '<td>' + esc(d.type) + '</td><td class="m">' + esc(d.mode) + '</td>' +
      '<td class="muted">' + esc(d.note) + '</td></tr>'
    ).join('');

    blocks.push({
      title: 'ls -l 权限串解读',
      note: '第 1 位是类型，后 9 位每 3 位一组：u / g / o',
      html: '<div class="table-wrap"><table class="tbl">' +
        '<thead><tr><th>权限串</th><th>类型</th><th>八进制</th><th>拆解</th></tr></thead>' +
        '<tbody>' + decodeRows + '</tbody></table></div>' +
        '<div class="tips" style="margin-top:12px"><div class="tip">' +
          '第 1 位：d=目录、-=普通文件、l=软链接、c=字符设备、b=块设备。' +
        '</div></div>'
    });

    const flow = p.killFlow.map((s, i) =>
      '<span class="flow-step ' + esc(s.tone) + '">' + esc(s.text) + '</span>' +
      (i < p.killFlow.length - 1 ? '<span class="flow-arrow">→</span>' : '')
    ).join('');

    blocks.push({
      title: '进程处理：先礼后兵',
      note: 'Terminated = 正常清理退出；Killed = 内核直接抹除',
      html: '<div class="card" style="padding:18px 20px">' +
        '<div class="flow">' + flow + '</div>' +
        '<p class="faint" style="margin:12px 0 0;font-size:12.5px">' +
          'ps 像雷达一样扫描进程，kill 发 SIGTERM 让程序先存 checkpoint，只有死锁 / 显存泄漏 / 无响应才用 kill -9。' +
        '</p></div>'
    });

    return blocks;
  }
  /* ---------------- 视图③：命令速查 ---------------- */
  function renderCheatsheet() {
    const filters = '<div class="filters" id="csFilters">' +
      '<button class="filter-btn active" type="button" data-filter="all">全部 · ' + ALL_COMMANDS.length + '</button>' +
      DAYS.map((d) => '<button class="filter-btn" type="button" data-filter="' + d.id + '">' +
        esc(d.num) + ' ' + esc(d.short) + ' · ' + d.commands.length + '</button>').join('') +
      '</div>';

    const rows = ALL_COMMANDS.map((x) =>
      '<tr data-day="' + x.day.id + '">' +
        '<td><button class="cs-cmd" type="button" style="color:' + x.day.accent + '" ' +
          'data-copy="' + esc(x.c.cmd) + '" title="点击复制 ' + esc(x.c.cmd) + '">' + esc(x.c.cmd) + '</button></td>' +
        '<td class="m">' + esc(x.c.full) + '</td>' +
        '<td>' + esc(x.c.use) + '</td>' +
        '<td class="muted">' + esc(x.c.scene) + '</td>' +
        '<td><span class="pill day" style="--day:' + x.day.accent + '">' + esc(x.day.num) + '</span></td>' +
      '</tr>').join('');

    return '' +
      '<section class="hero compact">' +
        '<span class="hero-eyebrow">📋 CHEAT SHEET</span>' +
        '<h1>命令速查 · <span class="grad">' + ALL_COMMANDS.length + ' 条</span> 常用命令</h1>' +
        '<p class="hero-lead">' + STATS.days + ' 天内容去重汇总。点击命令名即可复制，也可按天或关键词筛选。</p>' +
      '</section>' +
      '<section class="section">' +
        '<div class="section-head"><h2><span class="num">01</span>筛选</h2><p>支持天 / 关键词双重过滤</p></div>' +
        filters +
        '<div class="cs-search"><input id="csQuery" class="decode-input" type="search" ' +
          'placeholder="在命令、用途、AI 场景中过滤，例如 进程 / 重命名 / 显存" autocomplete="off">' +
        '<span class="faint" id="csCount"></span></div>' +
        '<div class="table-wrap"><table class="tbl cs-table" id="csTable">' +
          '<thead><tr><th>命令</th><th>完整写法</th><th>用途 / 坑</th><th>AI 场景</th><th>来源</th></tr></thead>' +
          '<tbody>' + rows + '</tbody></table></div>' +
      '</section>';
  }
  /* ---------------- 视图④：权限实验室 ---------------- */
  const GROUPS = [
    { k: 'u', name: '所有者 Owner' },
    { k: 'g', name: '组 Group' },
    { k: 'o', name: '其他 Others' }
  ];
  const BITS = [
    { k: 'r', v: 4, label: '读' },
    { k: 'w', v: 2, label: '写' },
    { k: 'x', v: 1, label: '执行' }
  ];
  const DEFAULT_PERM = { u: 'rwx', g: 'r-x', o: 'r-x' };
  /* 实验室用「第一个带 permissions 的天」当配色 / 预设来源，新增天不会影响它 */
  const LAB_DAY = DAYS.filter((d) => d.permissions && d.permissions.presets.length)[0] || DAYS[DAYS.length - 1];
  const PRESETS = (LAB_DAY && LAB_DAY.permissions && LAB_DAY.permissions.presets) || [];
  const PRESET_MAP = {};
  PRESETS.forEach((x) => { PRESET_MAP[x.mode] = x; });

  function renderLab() {
    const groups = GROUPS.map((g) =>
      '<div class="perm-group">' +
        '<h4>' + esc(g.name) + '</h4>' +
        '<span class="who">' + g.k.toUpperCase() + '</span>' +
        '<div class="sub" id="sym-' + g.k + '">' + DEFAULT_PERM[g.k] + '</div>' +
        '<div class="perm-row">' +
          BITS.map((b) =>
            '<label class="tgl"><input type="checkbox" data-g="' + g.k + '" data-p="' + b.k + '"' +
              (DEFAULT_PERM[g.k].indexOf(b.k) >= 0 ? ' checked' : '') + '>' +
              b.k + ' · ' + esc(b.label) + ' +' + b.v + '</label>'
          ).join('') +
        '</div>' +
      '</div>').join('');

    const quick = PRESETS.map((x) =>
      '<button class="btn sm ghost" type="button" data-apply="' + esc(x.mode) + '" data-risk="' + esc(x.risk) + '" ' +
        'title="' + esc(x.desc) + '">' + esc(x.mode) + ' · ' + esc(x.sym) + '</button>'
    ).join('');

    return '' +
      '<section class="hero compact">' +
        '<span class="hero-eyebrow">🧪 PERMISSION LAB</span>' +
        '<h1>权限实验室 · <span class="grad">勾选即可算</span></h1>' +
        '<p class="hero-lead">勾选 u / g / o 的 r、w、x，实时得到八进制、符号串与 chmod 命令；' +
          '也可以把 ls -l 的权限串贴进来反向解读。</p>' +
      '</section>' +
      '<section class="section">' +
        '<div class="section-head"><h2><span class="num">01</span>正向计算器</h2>' +
          '<p>r=4 · w=2 · x=1，每组独立相加</p></div>' +
        '<div class="lab" style="' + dayStyle(LAB_DAY) + '">' +
          '<div class="lab-panel">' +
            '<h3>勾选权限位（u / g / o）</h3>' +
            '<div class="perm-groups">' + groups + '</div>' +
            '<div class="presets">' +
              '<button class="btn sm ghost" type="button" id="labReset">↺ 重置为 755</button>' +
              '<button class="btn sm ghost" type="button" id="labZero">清空全部（000）</button>' +
            '</div>' +
            '<p class="lab-note" id="labNote"></p>' +
          '</div>' +
          '<div class="lab-out">' +
            '<span class="label">OCTAL MODE</span>' +
            '<div class="lab-big" id="labMode">755</div>' +
            '<div class="lab-sym" id="labSym">rwxr-xr-x</div>' +
            '<div class="lab-cmd"><span id="labCmd">chmod 755 &lt;file&gt;</span>' +
              '<button class="copy-btn" id="labCopy" type="button" title="复制命令" aria-label="复制命令">⧉</button>' +
            '</div>' +
            '<div class="presets" id="labPresets">' + quick + '</div>' +
            '<div class="decode-box">' +
              '<label for="decodeInput">反向解读：粘贴 ls -l 的权限串</label>' +
              '<input class="decode-input" id="decodeInput" type="text" spellcheck="false" autocomplete="off" ' +
                'placeholder="drwxr-xr-x  或  rwxr-xr-x  或  755">' +
              '<div class="decode-out" id="decodeOut">等待输入…</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</section>' +
      '<section class="section">' +
        '<div class="section-head"><h2><span class="num">02</span>八进制对照表</h2>' +
          '<p>点击八进制数字即可套用到计算器</p></div>' +
        '<div class="table-wrap"><table class="tbl"><thead><tr>' +
          '<th>八进制</th><th>符号串</th><th>风险</th><th>适用场景</th></tr></thead><tbody>' +
          PRESETS.map((x) => {
            const tag = x.risk === 'danger' ? '<span class="pill danger">高危</span>'
              : x.risk === 'warn' ? '<span class="pill warn">留意</span>'
              : '<span class="pill ok">常用</span>';
            return '<tr><td class="m"><button class="cs-cmd" type="button" data-apply="' + esc(x.mode) + '">' +
              esc(x.mode) + '</button></td><td class="m">' + esc(x.sym) + '</td>' +
              '<td>' + tag + '</td><td class="scene">' + esc(x.desc) + '</td></tr>';
          }).join('') +
        '</tbody></table></div>' +
      '</section>';
  }
  function updateLab() {
    const modeEl = $('#labMode');
    if (!modeEl) { return; }
    let oct = '';
    let sym = '';
    const parts = [];
    GROUPS.forEach((g) => {
      let v = 0;
      let s = '';
      BITS.forEach((b) => {
        const cb = document.querySelector('input[data-g="' + g.k + '"][data-p="' + b.k + '"]');
        if (cb && cb.checked) { v += b.v; s += b.k; } else { s += '-'; }
      });
      oct += v;
      sym += s;
      parts.push(v);
      const symEl = $('#sym-' + g.k);
      if (symEl) { symEl.textContent = s; }
    });

    const preset = PRESET_MAP[oct];
    const risk = preset ? preset.risk : (oct === '777' ? 'danger' : 'warn');
    $('#labMode').textContent = oct;
    $('#labSym').textContent = sym;
    $('#labCmd').innerHTML = 'chmod ' + oct + ' &lt;file&gt;';
    const splitEl = $('#labSplit');
    if (splitEl) { splitEl.textContent = parts.join(' / '); }

    const noteEl = $('#labNote');
    if (noteEl) {
      const tag = !preset ? '⚡ 自定义' : (preset.risk === 'danger' ? '⚠ 高风险' : preset.risk === 'warn' ? '⚡ 需留意' : '✓ 常用');
      const text = preset ? preset.desc : '这个组合不在常见预设中，执行前先确认是否真的需要。';
      noteEl.innerHTML = 'u/g/o = ' + parts.join(' / ') + ' · <b class="' + risk + '">' + tag + '</b> · ' + esc(text);
    }
  }

  function applyMode(mode) {
    if (!/^[0-7]{3}$/.test(mode)) { return; }
    GROUPS.forEach((g, i) => {
      const v = Number(mode.charAt(i));
      BITS.forEach((b) => {
        const cb = document.querySelector('input[data-g="' + g.k + '"][data-p="' + b.k + '"]');
        if (cb) { cb.checked = (v & b.v) === b.v; }
      });
    });
    updateLab();
  }

  function runDecode(raw) {
    const outEl = $('#decodeOut');
    if (!outEl) { return; }
    const s = String(raw || '').trim();
    if (!s) { outEl.innerHTML = '等待输入…'; return; }

    if (/^[0-7]{3}$/.test(s)) {
      const table = ['---', '--x', '-w-', '-wx', 'r--', 'r-x', 'rw-', 'rwx'];
      const sym = s.split('').map((d) => table[Number(d)]).join('');
      outEl.innerHTML = '<span class="ok mono">' + s + '</span> → 符号串 <b class="mono">' + sym + '</b>' +
        groupChips(s) + (PRESET_MAP[s] ? '<div class="decode-note">' + esc(PRESET_MAP[s].desc) + '</div>' : '');
      return;
    }

    let body = s;
    let typeNote = '';
    if (body.length === 10) {
      const types = { d: '目录', '-': '普通文件', l: '软链接', c: '字符设备', b: '块设备', s: '套接字', p: '管道' };
      typeNote = '<span class="pill day">' + esc(types[body.charAt(0)] || '未知类型') + '</span> ';
      body = body.slice(1);
    }
    if (!/^[r-][w-][x-][r-][w-][x-][r-][w-][x-]$/.test(body)) {
      outEl.innerHTML = '<span class="bad">格式不合法</span> · 需要 9 位权限串（可带 1 位类型，如 drwxr-xr-x），或 3 位八进制（如 755）。';
      return;
    }
    const val = (t) => (t.charAt(0) === 'r' ? 4 : 0) + (t.charAt(1) === 'w' ? 2 : 0) + (t.charAt(2) === 'x' ? 1 : 0);
    const oct = '' + val(body.slice(0, 3)) + val(body.slice(3, 6)) + val(body.slice(6, 9));
    outEl.innerHTML = typeNote + '<span class="ok mono">' + body + '</span> → 八进制 <b class="mono">' + oct + '</b>' +
      groupChips(oct) + (PRESET_MAP[oct] ? '<div class="decode-note">' + esc(PRESET_MAP[oct].desc) + '</div>' : '');
  }

  function groupChips(oct) {
    const names = ['u 所有者', 'g 组', 'o 其他'];
    return '<div class="decode-chips">' + oct.split('').map((d, i) =>
      '<span class="dchip"><b>' + names[i] + '</b> = ' + d + '</span>').join('') + '</div>';
  }

  function bindDecode() {
    updateLab();
    const input = $('#decodeInput');
    if (input) { input.addEventListener('input', function () { runDecode(input.value); }); }
    const q = $('#csQuery');
    if (q) { q.addEventListener('input', filterCheatsheet); }
    filterCheatsheet();
  }

  function filterCheatsheet() {
    const table = $('#csTable');
    if (!table) { return; }
    const btn = document.querySelector('.filter-btn.active');
    const day = btn ? btn.getAttribute('data-filter') : 'all';
    const qInput = $('#csQuery');
    const term = qInput ? qInput.value.trim().toLowerCase() : '';
    let shown = 0;
    Array.prototype.forEach.call(table.tBodies[0].rows, (tr) => {
      const okDay = day === 'all' || tr.getAttribute('data-day') === day;
      const okTerm = !term || tr.textContent.toLowerCase().indexOf(term) >= 0;
      const ok = okDay && okTerm;
      tr.style.display = ok ? '' : 'none';
      if (ok) { shown++; }
    });
    const countEl = $('#csCount');
    if (countEl) { countEl.textContent = '显示 ' + shown + ' / ' + ALL_COMMANDS.length + ' 条'; }
  }
  /* ---------------- 全局搜索 ---------------- */
  function hit(text, term) { return String(text || '').toLowerCase().indexOf(term) >= 0; }

  function resultGroup(title, count, items) {
    if (!items.length) { return ''; }
    return '<div class="result-group"><h3>' + title +
      ' <span class="count">' + count + '</span></h3>' + items.join('') + '</div>';
  }

  function renderSearch(q) {
    const term = q.toLowerCase();
    const cmdHits = [];
    const issueHits = [];
    const tipHits = [];

    ALL_COMMANDS.forEach((x) => {
      const c = x.c;
      if (hit(c.cmd, term) || hit(c.full, term) || hit(c.use, term) || hit(c.scene, term) || hit(c.group, term)) {
        cmdHits.push(x);
      }
    });
    DAYS.forEach((d) => {
      d.issues.forEach((it) => {
        if (hit(it.title, term) || hit(it.op, term) || hit(it.err, term) || hit(it.why, term) || hit(it.lesson, term)) {
          issueHits.push({ day: d, it: it });
        }
      });
      d.tips.forEach((t) => {
        if (hit(t, term)) { tipHits.push({ day: d, t: t }); }
      });
    });

    const total = cmdHits.length + issueHits.length + tipHits.length;
    const head = '<section class="hero compact">' +
      '<span class="hero-eyebrow">🔍 SEARCH</span>' +
      '<h1>“' + esc(q) + '” 找到 <span class="grad">' + total + '</span> 条结果</h1>' +
      '<p class="hero-lead">搜索范围：命令名 / 完整写法 / 用途 / AI 场景 / 报错原文 / 教训与口诀。清空搜索框即可返回原页面。</p>' +
      '</section>';

    if (!total) {
      return head + '<div class="empty" style="margin-top:22px">没有匹配内容。试试「权限」「rm」「No such file」「进程」「777」。</div>';
    }

    const pill = (d) => '<span class="pill day" style="--day:' + d.accent + '">' + esc(d.num) + '</span>';

    const cmdItems = cmdHits.map((x) =>
      '<a class="result-item" href="#/' + x.day.id + '">' +
        '<div class="r-head"><strong class="mono">' + esc(x.c.cmd) + '</strong>' + pill(x.day) +
          '<span class="r-sub">' + esc(x.c.use) + '</span></div>' +
        '<div class="r-sub">' + esc(x.c.full) + ' · ' + esc(x.c.scene) + '</div>' +
      '</a>');

    const issueItems = issueHits.map((x) =>
      '<a class="result-item" href="#/' + x.day.id + '">' +
        '<div class="r-head"><strong>🛠 ' + esc(x.it.title) + '</strong>' + pill(x.day) + '</div>' +
        '<div class="r-sub mono">' + esc(x.it.err) + '</div>' +
        '<div class="r-sub">' + esc(x.it.lesson) + '</div>' +
      '</a>');

    const tipItems = tipHits.map((x) =>
      '<a class="result-item" href="#/' + x.day.id + '">' +
        '<div class="r-head"><strong>💡 口诀</strong>' + pill(x.day) + '</div>' +
        '<div class="r-sub">' + fmt(x.t) + '</div>' +
      '</a>');

    return head +
      '<section class="section">' +
        resultGroup('⌨️ 命令', cmdHits.length, cmdItems) +
        resultGroup('🛠 排错档案', issueHits.length, issueItems) +
        resultGroup('💡 避坑口诀', tipHits.length, tipItems) +
      '</section>';
  }
  /* ---------------- 交互绑定 ---------------- */
  const THEME_KEY = 'linux-kb-theme';

  function setTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    try { localStorage.setItem(THEME_KEY, t); } catch (e) { /* file:// 下可能被禁用 */ }
  }
  function closeNav() { document.body.classList.remove('nav-open'); }

  function applyFilter(day) {
    Array.prototype.forEach.call(document.querySelectorAll('.filter-btn'), (b) => {
      b.classList.toggle('active', b.getAttribute('data-filter') === day);
    });
    filterCheatsheet();
  }

  document.addEventListener('click', function (e) {
    const copyEl = e.target.closest('[data-copy]');
    if (copyEl) { copyText(copyEl.getAttribute('data-copy')); return; }

    if (e.target.closest('#labCopy')) {
      const cmd = $('#labCmd');
      if (cmd) { copyText(cmd.textContent); }
      return;
    }

    const applyEl = e.target.closest('[data-apply]');
    if (applyEl) {
      const mode = applyEl.getAttribute('data-apply');
      applyMode(mode);
      toast('已套用 ' + mode);
      return;
    }
    if (e.target.closest('#labReset')) { applyMode('755'); toast('已重置为 755'); return; }
    if (e.target.closest('#labZero')) { applyMode('000'); toast('已清空为 000'); return; }

    const fb = e.target.closest('.filter-btn');
    if (fb) { applyFilter(fb.getAttribute('data-filter')); return; }

    if (e.target.closest('#menuBtn')) { document.body.classList.toggle('nav-open'); return; }
    if (e.target.closest('#themeToggle')) {
      const next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      setTheme(next);
      toast(next === 'light' ? '☀️ 已切换到浅色主题' : '🌙 已切换到深色主题');
      return;
    }
    if (e.target.closest('#printBtn')) { window.print(); return; }

    if (e.target.closest('a[href^="#/"]')) { closeNav(); return; }
    if (document.body.classList.contains('nav-open') && !e.target.closest('.sidebar')) { closeNav(); }
  });

  document.addEventListener('change', function (e) {
    const t = e.target;
    if (t && t.matches && t.matches('input[data-g][data-p]')) { updateLab(); }
  });
  /* ---------------- 搜索输入 / 键盘 / 路由 ---------------- */
  let searchTimer = null;
  searchEl.addEventListener('input', function () {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(render, 110);
  });
  searchEl.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      e.stopPropagation();
      searchEl.value = '';
      render();
      searchEl.blur();
    }
  });

  document.addEventListener('keydown', function (e) {
    const tag = document.activeElement ? document.activeElement.tagName : '';
    const typing = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
    if (e.key === '/' && !typing) {
      e.preventDefault();
      searchEl.focus();
      searchEl.select();
      return;
    }
    if (e.key === 'Escape') {
      if (document.body.classList.contains('nav-open')) { closeNav(); }
      if (searchEl.value) { searchEl.value = ''; render(); }
    }
  });

  window.addEventListener('hashchange', function () {
    closeNav();
    if (searchEl.value) { searchEl.value = ''; }
    render();
    window.scrollTo(0, 0);
  });

  /* ---------------- 启动 ---------------- */
  (function init() {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved === 'light' || saved === 'dark') {
        document.documentElement.setAttribute('data-theme', saved);
      }
    } catch (e) { /* ignore */ }

    const footMeta = $('#footMeta');
    if (footMeta) {
      footMeta.textContent = STATS.commands + ' 条命令 · ' + STATS.issues + ' 个排错 · ' +
        STATS.tips + ' 条口诀 · 整理于 ' + KB.meta.built;
    }

    /* 侧栏 / 页脚文案跟随数据变化：新增天数后不用再改 HTML */
    const kbTitle = (KB.meta && KB.meta.title) || 'Linux 知识库';
    const brandTitle = $('#brandTitle');
    if (brandTitle) { brandTitle.textContent = kbTitle; }
    const footTitle = $('#footTitle');
    if (footTitle) { footTitle.textContent = kbTitle + ' · 可视化知识库'; }
    const daysLabel = $('#navDaysLabel');
    if (daysLabel) { daysLabel.textContent = STATS.days + ' 天历程'; }
    const srcNote = $('#sourceNote');
    if (srcNote && DAYS.length) {
      srcNote.textContent = '内容来源：' + DAYS[0].num + ' – ' + DAYS[DAYS.length - 1].num + ' 学习总结';
    }

    /* 手动新增一天时的自查提示（F12 控制台可见，不影响页面） */
    DAYS.forEach((d) => {
      if (!d.commands.length) { console.warn('[知识库] ' + d.num + ' 还没有 commands 命令卡'); }
      if (!d.tips.length) { console.warn('[知识库] ' + d.num + ' 还没有 tips 口诀'); }
    });
    if ((KB.skills || []).some((s) => (s.levels || []).length < DAYS.length)) {
      console.info('[知识库] 能力矩阵还没填满 ' + STATS.days + ' 天，缺的格子按「未涉及」显示（可在 data.js 的 skills.levels 里补齐）。');
    }

    if (!location.hash) {
      try { history.replaceState(null, '', '#/overview'); } catch (e) { location.hash = '#/overview'; }
    }
    render();
  })();
})();










