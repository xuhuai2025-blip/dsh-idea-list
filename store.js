export const STORAGE_KEY = 'dsh.local.idea.v1';
export const MAX_TITLE = 80;
export const MAX_CONTENT = 30000;
export const MAX_CATEGORY = 40;

const MAX_TIMESTAMP = 8640000000000000;
const emptyDocument = () => ({ items: [], categories: [] });
const validId = value => typeof value === 'string' && !!value.trim() && value === value.trim() && !/[\u0000-\u001f\u007f]/u.test(value);
const validTimestamp = value => Number.isSafeInteger(value) && value >= 0 && value <= MAX_TIMESTAMP;
const categoryKey = name => name.trim().normalize('NFKC').toLowerCase();
const failure = message => new Error(message + ' 已保留原始数据。');

function checkIdentity(item, ids, label) {
  if (!item || typeof item !== 'object' || Array.isArray(item) || !validId(item.id)) throw failure(`${label} ID 无效。`);
  if (ids.has(item.id)) throw failure(`${label} ID 重复。`);
  ids.add(item.id);
}
function checkDates(item) {
  // Legacy records may span a system-clock rollback; validate epochs, not their ordering.
  if (!validTimestamp(item.createdAt) || !validTimestamp(item.updatedAt)) throw failure('记录时间无效。');
  if (typeof item.done !== 'boolean') throw failure('记录完成状态必须为布尔值。');
}
function titleValue(title) {
  if (typeof title !== 'string') throw new Error('标题必须是文本。');
  if (title.length > MAX_TITLE) throw new Error(`标题最多 ${MAX_TITLE} 字。`);
  const value = title.trim();
  if (!value) throw new Error('请填写标题。');
  return value;
}
function contentValue(content) {
  if (typeof content !== 'string') throw new Error('详情必须是文本。');
  if (content.length > MAX_CONTENT) throw new Error(`详情最多 ${MAX_CONTENT} 字。`);
  return content;
}
function categoryName(name) {
  if (typeof name !== 'string') throw new Error('分类名称必须是文本。');
  const value = name.trim().normalize('NFC');
  if (!value) throw new Error('请填写分类名称。');
  if (value.length > MAX_CATEGORY) throw new Error(`分类名称最多 ${MAX_CATEGORY} 字。`);
  if (categoryKey(value) === '未分类') throw new Error('“未分类”是系统保留名称，请使用其他分类名称。');
  return value;
}
function validateDocument(data) {
  if (!data || typeof data !== 'object' || !Array.isArray(data.items) || !Array.isArray(data.categories)) throw failure('记录或分类格式无法识别。');
  const categoryIds = new Set();
  const names = new Set();
  const categories = data.categories.map(category => {
    checkIdentity(category, categoryIds, '分类');
    const name = categoryName(category.name);
    const key = categoryKey(name);
    if (names.has(key)) throw failure('分类名称重复（不区分大小写）。');
    names.add(key);
    return { id: category.id, name };
  });
  const ids = new Set();
  const items = data.items.map(item => {
    checkIdentity(item, ids, '记录');
    checkDates(item);
    titleValue(item.title);
    contentValue(item.content);
    if (item.categoryId !== null && (!validId(item.categoryId) || !categoryIds.has(item.categoryId))) throw failure('记录引用的分类不存在。');
    return { id: item.id, title: item.title, content: item.content, categoryId: item.categoryId, done: item.done, createdAt: item.createdAt, updatedAt: item.updatedAt };
  });
  return { items, categories };
}

export function decode(raw) {
  if (raw === null) return emptyDocument();
  if (typeof raw !== 'string') throw failure('本地记录必须是 JSON 文本。');
  let data;
  try { data = JSON.parse(raw); }
  catch { throw failure('本地记录不是有效的 JSON。'); }
  if (!data || (data.version !== 1 && data.version !== 2) || !Array.isArray(data.items)) throw failure('记录版本或格式无法识别，请先备份后再处理。');
  if (data.version === 2) return validateDocument(data);
  const ids = new Set();
  const items = data.items.map(item => {
    checkIdentity(item, ids, '记录');
    checkDates(item);
    const content = contentValue(item.text);
    const firstLine = content.split(/\r\n|[\n\r\u2028\u2029]/u).find(line => line.trim());
    // Avoid a dangling UTF-16 high surrogate when capping a legacy title.
    const title = (firstLine?.trim().slice(0, MAX_TITLE).replace(/[\ud800-\udbff]$/u, '') || '未命名想法');
    return { id: item.id, title, content, categoryId: null, done: item.done, createdAt: item.createdAt, updatedAt: item.updatedAt };
  });
  return { items, categories: [] };
}
export function encode(document) {
  const { items, categories } = validateDocument(document);
  return JSON.stringify({ version: 2, items, categories });
}
export function visibleItems(items, filter = 'all', query = '') {
  const keyword = query.trim().toLocaleLowerCase();
  return items.filter(item => (filter === 'all' || item.done === (filter === 'done')) &&
    (!keyword || item.title.toLocaleLowerCase().includes(keyword) || item.content.toLocaleLowerCase().includes(keyword)))
    .sort((a, b) => Number(a.done) - Number(b.done) || (a.done ? b.updatedAt - a.updatedAt : b.createdAt - a.createdAt));
}
export function groupedItems(items, categories) {
  const grouped = new Map(categories.map(category => [category.id, []]));
  const unclassified = [];
  for (const item of items) (grouped.get(item.categoryId) ?? unclassified).push(item);
  const groups = categories.filter(category => grouped.get(category.id).length)
    .map(category => ({ id: category.id, name: category.name, items: grouped.get(category.id) }));
  if (unclassified.length) groups.push({ id: null, name: '未分类', items: unclassified });
  return groups;
}

function draftCopy(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || typeof value.title !== 'string' || typeof value.content !== 'string' ||
    (value.categoryId !== null && !validId(value.categoryId))) throw new Error('草稿需要文本标题、文本详情和有效分类 ID（或 null）。');
  return { title: value.title, content: value.content, categoryId: value.categoryId };
}
function immutableDocument(document) {
  return {
    items: Object.freeze(document.items.map(item => Object.freeze({ ...item }))),
    categories: Object.freeze(document.categories.map(category => Object.freeze({ ...category })))
  };
}

/** Save before publishing; every queued transaction reads the latest disk state under the supplied lock. */
export function createStore({ storage, subscribeStorage = () => () => {}, lock = run => run(), id = () => crypto.randomUUID(), now = () => Date.now() }) {
  let snapshot = Object.freeze({ ...immutableDocument(emptyDocument()), error: null });
  let draft = { title: '', content: '', categoryId: null };
  let undo = null;
  let tail = Promise.resolve();
  let disposed = false;
  const listeners = new Set();
  function publish(document, error = null) {
    snapshot = Object.freeze({ ...immutableDocument(document), error });
    if (!disposed) for (const listener of listeners) {
      // Observer failures must never turn a successful disk write into a failed transaction.
      try { listener(); } catch { /* Isolate subscriber errors. */ }
    }
  }
  function reload() {
    if (disposed) return;
    try { publish(decode(storage.getItem(STORAGE_KEY))); }
    catch (error) { publish(snapshot, '本地记录读取失败：' + error.message); }
  }
  const unsubscribe = subscribeStorage(event => {
    if (event.key === STORAGE_KEY || event.key === null) reload();
  });
  reload();
  function transaction(change, committed = () => {}) {
    const operation = tail.then(async () => {
      if (disposed) return false;
      try {
        return await lock(() => {
          if (disposed) return false;
          const latest = decode(storage.getItem(STORAGE_KEY));
          const next = change(latest);
          const raw = encode(next);
          const validated = decode(raw);
          storage.setItem(STORAGE_KEY, raw);
          committed();
          publish(validated);
          return true;
        });
      } catch (error) {
        publish(snapshot, '未保存，请重试：' + error.message);
        return false;
      }
    });
    tail = operation;
    return operation;
  }
  function itemInput(value, document) {
    const copy = draftCopy(value);
    const title = titleValue(copy.title);
    const content = contentValue(copy.content);
    if (copy.categoryId !== null && !document.categories.some(category => category.id === copy.categoryId)) throw new Error('所选分类已在其他窗口删除，请重新选择。');
    return { title, content, categoryId: copy.categoryId };
  }
  function findItem(document, itemId) {
    const item = document.items.find(item => item.id === itemId);
    if (!item) throw new Error('这条想法已在其他窗口删除。');
    return item;
  }
  function updateTime(item) { return Math.max(now(), item.createdAt, item.updatedAt); }
  function uniqueCategory(name, document, exceptId) {
    const cleaned = categoryName(name);
    if (document.categories.some(category => category.id !== exceptId && categoryKey(category.name) === categoryKey(cleaned))) throw new Error('分类名称已存在（不区分大小写）。');
    return cleaned;
  }
  // Capture caller-owned input before queued work starts, without throwing outside Promise<boolean>.
  const capture = value => value && typeof value === 'object' ? { title: value.title, content: value.content, categoryId: value.categoryId } : value;
  return {
    getSnapshot: () => snapshot,
    subscribe(listener) { if (disposed) return () => {}; listeners.add(listener); return () => listeners.delete(listener); },
    reload,
    getDraft: () => ({ ...draft }),
    setDraft(value) { draft = draftCopy(value); },
    getUndo: () => undo ? { ...undo } : null,
    dismissUndo() { if (undo) { undo = null; publish(snapshot, snapshot.error); } },
    add(value) {
      const input = capture(value);
      return transaction(document => {
        const body = itemInput(input, document);
        const timestamp = now();
        return { ...document, items: [{ id: id(), ...body, done: false, createdAt: timestamp, updatedAt: timestamp }, ...document.items] };
      });
    },
    edit(itemId, value) {
      const input = capture(value);
      return transaction(document => {
        const item = findItem(document, itemId);
        const body = itemInput(input, document);
        return { ...document, items: document.items.map(existing => existing.id === itemId ? { ...item, ...body, updatedAt: updateTime(item) } : existing) };
      });
    },
    toggle(itemId) {
      return transaction(document => {
        const item = findItem(document, itemId);
        return { ...document, items: document.items.map(existing => existing.id === itemId ? { ...item, done: !item.done, updatedAt: updateTime(item) } : existing) };
      });
    },
    remove(itemId) {
      let removed;
      return transaction(document => {
        removed = findItem(document, itemId);
        return { ...document, items: document.items.filter(item => item.id !== itemId) };
      }, () => { undo = { ...removed }; });
    },
    restore() {
      const item = undo;
      if (!item) return Promise.resolve(false);
      return transaction(document => {
        if (document.items.some(existing => existing.id === item.id)) return document;
        const categoryId = document.categories.some(category => category.id === item.categoryId) ? item.categoryId : null;
        return { ...document, items: [{ ...item, categoryId }, ...document.items] };
      }, () => { if (undo === item) undo = null; });
    },
    addCategory(name) {
      return transaction(document => ({ ...document, categories: [...document.categories, { id: id(), name: uniqueCategory(name, document) }] }));
    },
    renameCategory(categoryId, name) {
      return transaction(document => {
        if (!document.categories.some(category => category.id === categoryId)) throw new Error('这个分类已在其他窗口删除。');
        const cleaned = uniqueCategory(name, document, categoryId);
        return { ...document, categories: document.categories.map(category => category.id === categoryId ? { ...category, name: cleaned } : category) };
      });
    },
    removeCategory(categoryId) {
      return transaction(document => {
        if (!document.categories.some(category => category.id === categoryId)) throw new Error('这个分类已在其他窗口删除。');
        return {
          categories: document.categories.filter(category => category.id !== categoryId),
          items: document.items.map(item => item.categoryId === categoryId ? { ...item, categoryId: null, updatedAt: updateTime(item) } : item)
        };
      });
    },
    exportRaw: () => storage.getItem(STORAGE_KEY) ?? encode(emptyDocument()),
    dispose() { if (disposed) return; disposed = true; unsubscribe(); listeners.clear(); }
  };
}
