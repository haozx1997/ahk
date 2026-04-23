/* MM 宠物护理 —— 共享初始化与数据访问逻辑 */
(function (global) {
  'use strict';

  const STORAGE_KEY = 'petRefreshItems_v3';
  const LINKS_KEY = 'petRefreshLinks_v1';

  // 默认物品清单（顺序即默认显示顺序）
  const DEFAULT_ITEM_NAMES = [
    '猫厕所-倒粑粑',
    '猫厕所-换猫砂',
    '饮水机-小蜜蜂-换水',
    '饮水机-小蜜蜂-清洗',
    '饮水机-不锈钢-换水',
    '饮水机-不锈钢-清洗',
    '猫体外驱虫',
    '猫体内驱虫',
    '悠米洗澡',
    '悠米刷牙'
  ];

  // 默认联动（按名称配对，最终以 ID 形式存储）
  // 两个清洗刷新时，两个换水也一起刷新
  const DEFAULT_LINKS_BY_NAME = {
    '饮水机-小蜜蜂-清洗': ['饮水机-小蜜蜂-换水'],
    '饮水机-不锈钢-清洗': ['饮水机-不锈钢-换水'],
    '猫厕所-换猫砂': ['猫厕所-倒粑粑']
  };

  function generateId() {
    return 'id_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
  }

  function createItem(name) {
    return { id: generateId(), name, current: '', previous: '' };
  }

  function createDefaultItems() {
    return DEFAULT_ITEM_NAMES.map(createItem);
  }

  function loadItems() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const defaults = createDefaultItems();
      saveItems(defaults);
      return defaults;
    }

    try {
      const data = JSON.parse(raw);
      if (Array.isArray(data)) {
        return data.map(item => ({
          id: item.id || generateId(),
          name: item.name || '未命名物品',
          current: item.current || '',
          previous: item.previous || ''
        }));
      }
    } catch (e) {
      console.error('读取 localStorage 失败：', e);
    }

    const defaults = createDefaultItems();
    saveItems(defaults);
    return defaults;
  }

  function saveItems(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }

  // 联动关系存储：{ sourceId: [targetId, ...] }
  function loadLinks(items) {
    const list = items || loadItems();
    const validIds = new Set(list.map(i => i.id));
    const raw = localStorage.getItem(LINKS_KEY);
    if (raw) {
      try {
        const data = JSON.parse(raw);
        if (data && typeof data === 'object') {
          const cleaned = {};
          Object.entries(data).forEach(([sid, targets]) => {
            if (!validIds.has(sid)) return;
            const arr = (Array.isArray(targets) ? targets : [])
              .filter(t => validIds.has(t) && t !== sid);
            if (arr.length) cleaned[sid] = arr;
          });
          return cleaned;
        }
      } catch (e) {
        console.error('读取联动关系失败：', e);
      }
    }

    // 首次初始化：按默认名称配对生成
    const byName = new Map(list.map(i => [i.name, i.id]));
    const defaults = {};
    Object.entries(DEFAULT_LINKS_BY_NAME).forEach(([srcName, targetNames]) => {
      const sid = byName.get(srcName);
      if (!sid) return;
      const tids = targetNames.map(n => byName.get(n)).filter(Boolean);
      if (tids.length) defaults[sid] = tids;
    });
    saveLinks(defaults);
    return defaults;
  }

  function saveLinks(links) {
    localStorage.setItem(LINKS_KEY, JSON.stringify(links));
  }

  function clearLinks() {
    localStorage.removeItem(LINKS_KEY);
  }

  /* ===== 时间相关 ===== */
  function formatDate(date) {
    const yyyy = date.getFullYear();
    const MM = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');
    return `${yyyy}-${MM}-${dd} ${hh}:${mm}:${ss}`;
  }

  function formatNow() {
    return formatDate(new Date());
  }

  function parseDate(str) {
    if (!str) return null;
    const d = new Date(str.replace(' ', 'T'));
    return Number.isNaN(d.getTime()) ? null : d;
  }

  function formatElapsed(str) {
    const d = parseDate(str);
    if (!d) return '';
    const diffMs = Date.now() - d.getTime();
    if (diffMs < 0) return '0天0时';
    const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(totalHours / 24);
    const hours = totalHours % 24;
    return `${days}天${hours}时`;
  }

  function toDatetimeLocalValue(str) {
    if (!str) return '';
    const d = new Date(str.replace(' ', 'T'));
    if (Number.isNaN(d.getTime())) return '';
    const yyyy = d.getFullYear();
    const MM = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${yyyy}-${MM}-${dd}T${hh}:${mm}`;
  }

  function fromDatetimeLocalValue(value) {
    if (!value) return '';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    return formatDate(d);
  }

  /* ===== HTML 转义 ===== */
  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function escapeAttr(text) {
    return escapeHtml(text);
  }

  global.MMCommon = {
    STORAGE_KEY,
    LINKS_KEY,
    DEFAULT_ITEM_NAMES,
    DEFAULT_LINKS_BY_NAME,
    generateId,
    createItem,
    createDefaultItems,
    loadItems,
    saveItems,
    loadLinks,
    saveLinks,
    clearLinks,
    formatDate,
    formatNow,
    parseDate,
    formatElapsed,
    toDatetimeLocalValue,
    fromDatetimeLocalValue,
    escapeHtml,
    escapeAttr
  };
})(window);
