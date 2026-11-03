import test from 'node:test';
import assert from 'node:assert/strict';
import { createStore, STORAGE_KEY, MAX_TITLE, MAX_CONTENT, MAX_CATEGORY, decode, encode, visibleItems, groupedItems } from '../store.js';

const body = (title = '想法', content = '', categoryId = null) => ({ title, content, categoryId });
const record = overrides => ({ id: 'one', ...body('标题', '详情'), done: false, createdAt: 1, updatedAt: 2, ...overrides });
const document = (items = [], categories = []) => ({ items, categories });
const rawV2 = (items = [], categories = []) => JSON.stringify({ version: 2, items, categories });
const rawV1 = items => JSON.stringify({ version: 1, items });
const legacy = overrides => ({ id: 'old', text: '旧想法', done: true, createdAt: 12, updatedAt: 34, ...overrides });
function fixture(initial = null, injections = {}) {
  let raw = initial;
  let fail = false;
  let failRead = false;
  let writes = 0;
  let reads = 0;
  let i = 0;
  const storage = {
    getItem(key) { assert.equal(key, STORAGE_KEY); reads++; if (failRead) throw new Error('Read denied'); return raw; },
    setItem(key, value) { assert.equal(key, STORAGE_KEY); if (fail) throw new Error('Quota exceeded'); raw = value; writes++; }
  };
  const store = createStore({ storage, id: () => 'id-' + ++i, now: () => 1700000000000 + i, ...injections });
  return { store, storage, raw: () => raw, setRaw(value) { raw = value; }, writes: () => writes, reads: () => reads, fail(value) { fail = value; }, failRead(value) { failRead = value; } };
}

test('empty documents, fixed key and explicit limits; no default categories', () => {
  assert.equal(STORAGE_KEY, 'dsh.local.idea.v1');
  assert.deepEqual([MAX_TITLE, MAX_CONTENT, MAX_CATEGORY], [80, 30000, 40]);
  assert.deepEqual(decode(null), document());
  assert.deepEqual(JSON.parse(encode(document())), { version: 2, items: [], categories: [] });
  const f = fixture();
  assert.deepEqual(f.store.getSnapshot(), { items: [], categories: [], error: null });
  assert.deepEqual(f.store.getDraft(), body('', ''));
  assert.equal(f.writes(), 0);
  assert.equal(f.raw(), null);
  assert.equal(f.store.exportRaw(), encode(document()));
  f.store.dispose();
});

test('v2 encode/decode roundtrip preserves details, metadata and category order without aliases', () => {
  const source = document([record({ content: ' \n<script>alert(1)</script>\r\n末尾  ', categoryId: 'c2' })], [{ id: 'c2', name: '学习' }, { id: 'c1', name: '自定义' }]);
  const decoded = decode(encode(source));
  assert.deepEqual(decoded, source);
  decoded.items[0].title = 'changed';
  decoded.categories[0].name = 'changed';
  assert.equal(source.items[0].title, '标题');
  assert.equal(source.categories[0].name, '学习');
});

test('v1 migration is lossless for multiline and long details, retains IDs/status/timestamps and never writes on read', async () => {
  const text = '  \r\n\t\n  ' + '长'.repeat(100) + '  \r\n' + '细节\n'.repeat(6000) + '  尾部 \n';
  const old = legacy({ text });
  const original = rawV1([old]);
  const f = fixture(original);
  const expected = { id: old.id, title: '长'.repeat(80), content: text, categoryId: null, done: old.done, createdAt: old.createdAt, updatedAt: old.updatedAt };
  assert.deepEqual(f.store.getSnapshot().items, [expected]);
  assert.deepEqual(f.store.getSnapshot().categories, []);
  f.store.reload();
  assert.equal(f.writes(), 0);
  assert.equal(f.raw(), original);
  assert.equal(f.store.exportRaw(), original);
  assert.equal(await f.store.add(body('新想法')), true);
  assert.equal(JSON.parse(f.raw()).version, 2);
  assert.deepEqual(decode(f.raw()).items.find(item => item.id === old.id), expected);
  assert.equal(f.writes(), 1);
});

test('v1 title uses first nonempty line, safe fallback and no split surrogate', () => {
  for (const [text, title] of [['\n\r\n  首行  \n后来', '首行'], ['', '未命名想法'], [' \t\r\n ', '未命名想法'], ['a'.repeat(79) + '😀\nbody', 'a'.repeat(79)]]) {
    const decoded = decode(rawV1([legacy({ text })]));
    assert.equal(decoded.items[0].title, title);
    assert.equal(decoded.items[0].content, text);
    assert.ok(decoded.items[0].title.length <= MAX_TITLE);
  }
});

test('migration retains valid legacy timestamps across system-clock rollback and epoch boundaries', async () => {
  const oldItems = [legacy({ id: 'rollback', createdAt: 100, updatedAt: 10 }), legacy({ id: 'epoch', createdAt: 0, updatedAt: 0 }), legacy({ id: 'max', createdAt: 8640000000000000, updatedAt: 8640000000000000 })];
  const f = fixture(rawV1(oldItems));
  for (const old of oldItems) {
    const item = f.store.getSnapshot().items.find(item => item.id === old.id);
    assert.equal(item.createdAt, old.createdAt);
    assert.equal(item.updatedAt, old.updatedAt);
  }
  assert.equal(await f.store.addCategory('迁移'), true);
  for (const old of oldItems) {
    const item = decode(f.raw()).items.find(item => item.id === old.id);
    assert.equal(item.createdAt, old.createdAt);
    assert.equal(item.updatedAt, old.updatedAt);
  }
});

test('failed migration transaction leaves v1 bytes unchanged; read/export/draft/dismiss do not migrate', async () => {
  const original = rawV1([legacy()]);
  const f = fixture(original);
  f.store.setDraft(body('draft', ' details '));
  f.store.dismissUndo();
  assert.equal(await f.store.add(body('')), false);
  assert.equal(f.writes(), 0);
  f.fail(true);
  assert.equal(await f.store.toggle('old'), false);
  assert.equal(f.raw(), original);
  assert.equal(f.store.getSnapshot().items[0].done, true);
  f.fail(false);
  assert.equal(await f.store.toggle('old'), true);
  assert.equal(JSON.parse(f.raw()).version, 2);
});

test('add trims titles, preserves original content and saves before publishing', async () => {
  const f = fixture();
  let notifications = 0;
  f.store.subscribe(() => {
    notifications++;
    if (f.store.getSnapshot().error === null) assert.deepEqual(decode(f.raw()), document(f.store.getSnapshot().items, f.store.getSnapshot().categories));
  });
  const details = '  首行\n\n第二行  \r\n';
  assert.equal(await f.store.add(body('  写一个想法  ', details)), true);
  assert.equal(f.store.getSnapshot().items[0].title, '写一个想法');
  assert.equal(f.store.getSnapshot().items[0].content, details);
  assert.equal(f.store.getSnapshot().items[0].categoryId, null);
  assert.equal(f.store.getSnapshot().items[0].done, false);
  assert.equal(notifications, 1);
});

test('title/detail limits accept exact boundaries, long details and empty details; reject invalid body types', async () => {
  const f = fixture();
  assert.equal(await f.store.add(body('字'.repeat(MAX_TITLE), '详'.repeat(MAX_CONTENT))), true);
  assert.equal(await f.store.add(body('只有标题')), true);
  const original = f.raw();
  const invalid = [null, 'old text API', {}, [], body(''), body(' \t '), body('a'.repeat(MAX_TITLE + 1)), body('ok', 'a'.repeat(MAX_CONTENT + 1)), body(1), body('ok', null), body('ok', {}), { title: 'ok', content: '', categoryId: undefined }, body('ok', '', 3)];
  // Explicitly missing categoryId is not the implicit unclassified value; callers must pass null.
  invalid.push({ title: 'ok', content: '' });
  for (const value of invalid) {
    assert.equal(await f.store.add(value), false, JSON.stringify(value));
    assert.equal(f.raw(), original);
  }
  assert.match(f.store.getSnapshot().error, /未保存/);
  assert.equal(decode(f.raw()).items[1].content.length, MAX_CONTENT);
});

test('toggle twice, edit, delete, undo and reload retain details and categories', async () => {
  const f = fixture();
  await f.store.addCategory('自定义');
  await f.store.add(body('first', 'old details', 'id-1'));
  const item = f.store.getSnapshot().items[0];
  assert.equal(await f.store.toggle(item.id), true);
  assert.equal(decode(f.raw()).items[0].done, true);
  await f.store.toggle(item.id);
  assert.equal(decode(f.raw()).items[0].done, false);
  await f.store.edit(item.id, body(' edited ', ' changed details ', 'id-1'));
  assert.equal(decode(f.raw()).items[0].title, 'edited');
  assert.equal(decode(f.raw()).items[0].content, ' changed details ');
  assert.equal(await f.store.remove(item.id), true);
  assert.equal(decode(f.raw()).items.length, 0);
  assert.equal(f.store.getUndo().title, 'edited');
  assert.equal(await f.store.restore(), true);
  assert.equal(f.store.getUndo(), null);
  assert.equal(await f.store.restore(), false);
  const second = createStore({ storage: f.storage });
  assert.deepEqual(second.getSnapshot(), f.store.getSnapshot());
  f.store.dispose(); second.dispose();
});

test('category create/rename uses trim + normalized case-insensitive uniqueness and length limits', async () => {
  const f = fixture();
  assert.equal(await f.store.addCategory('  Work  '), true);
  assert.deepEqual(f.store.getSnapshot().categories, [{ id: 'id-1', name: 'Work' }]);
  for (const name of ['work', ' WORK ', 'ＷＯＲＫ', '未分类', '  未分类  ', '', ' \t ', 3, null, 'x'.repeat(MAX_CATEGORY + 1)]) {
    const original = f.raw();
    assert.equal(await f.store.addCategory(name), false, String(name));
    assert.equal(f.raw(), original);
  }
  assert.equal(await f.store.addCategory('e\u0301'), true);
  assert.equal(f.store.getSnapshot().categories[1].name, 'é');
  assert.equal(await f.store.addCategory('É'), false);
  assert.equal(await f.store.addCategory('名'.repeat(MAX_CATEGORY)), true);
  const category = f.store.getSnapshot().categories[0];
  assert.equal(await f.store.renameCategory(category.id, ' wOrK '), true);
  assert.equal(f.store.getSnapshot().categories[0].name, 'wOrK');
  assert.equal(await f.store.renameCategory(category.id, 'É'), false);
  assert.equal(await f.store.renameCategory(category.id, ' 未分类 '), false);
  assert.equal(await f.store.renameCategory('missing', 'new'), false);
  assert.equal(await f.store.renameCategory(category.id, '新分类'), true);
  assert.equal(f.store.getSnapshot().categories[0].name, '新分类');
});

test('category deletion reassigns every member to null without dropping records or affecting other categories', async () => {
  const f = fixture(rawV2([record({ id: 'one', categoryId: 'c1' }), record({ id: 'two', categoryId: 'c1', done: true }), record({ id: 'three', categoryId: 'c2' }), record({ id: 'four' })], [{ id: 'c1', name: 'First' }, { id: 'c2', name: 'Second' }]));
  const before = decode(f.raw());
  assert.equal(await f.store.removeCategory('c1'), true);
  const after = decode(f.raw());
  assert.deepEqual(after.categories, [{ id: 'c2', name: 'Second' }]);
  assert.equal(after.items.length, 4);
  assert.deepEqual(after.items.map(item => item.categoryId), [null, null, 'c2', null]);
  for (const id of ['one', 'two']) {
    const old = before.items.find(item => item.id === id);
    const updated = after.items.find(item => item.id === id);
    assert.deepEqual({ ...updated, updatedAt: old.updatedAt, categoryId: old.categoryId }, old);
    assert.ok(updated.updatedAt >= old.updatedAt);
  }
  assert.deepEqual(after.items.slice(2), before.items.slice(2));
  const raw = f.raw();
  assert.equal(await f.store.removeCategory('c1'), false);
  assert.equal(await f.store.removeCategory(null), false);
  assert.equal(f.raw(), raw);
});

test('undo restores into unclassified when its category was deleted in another panel', async () => {
  const f = fixture(rawV2([record({ categoryId: 'c' })], [{ id: 'c', name: '分类' }]));
  await f.store.remove('one');
  const saved = f.store.getUndo();
  const second = createStore({ storage: f.storage });
  await second.removeCategory('c');
  assert.equal(f.store.getSnapshot().categories.length, 1); // deliberately stale
  assert.equal(await f.store.restore(), true);
  const restored = decode(f.raw()).items[0];
  assert.deepEqual(restored, { ...saved, categoryId: null });
  assert.deepEqual(f.store.getSnapshot().categories, []);
  assert.equal(f.store.getUndo(), null);
});

test('dismissUndo is local, emits once, does not write or clear a storage error', async () => {
  const f = fixture();
  await f.store.add(body('remove me'));
  await f.store.remove('id-1');
  f.fail(true);
  await f.store.add(body('failed'));
  const error = f.store.getSnapshot().error;
  const writes = f.writes();
  let notifications = 0;
  f.store.subscribe(() => { notifications++; });
  f.store.dismissUndo();
  assert.equal(f.store.getUndo(), null);
  assert.equal(f.writes(), writes);
  assert.equal(f.store.getSnapshot().error, error);
  assert.equal(notifications, 1);
  f.store.dismissUndo();
  assert.equal(notifications, 1);
});

test('quota failure publishes no changed records/categories/drafts/undo and can recover', async () => {
  const f = fixture();
  await f.store.addCategory('分类');
  await f.store.add(body('safe', 'details', 'id-1'));
  await f.store.add(body('undo source'));
  await f.store.remove('id-3');
  f.store.setDraft(body('unsaved', 'draft details', 'id-1'));
  const original = f.raw();
  const before = f.store.getSnapshot();
  const undo = f.store.getUndo();
  f.fail(true);
  for (const action of [() => f.store.add(body('bad')), () => f.store.edit('id-2', body('changed')), () => f.store.toggle('id-2'), () => f.store.remove('id-2'), () => f.store.restore(), () => f.store.addCategory('new'), () => f.store.renameCategory('id-1', 'renamed'), () => f.store.removeCategory('id-1')]) {
    assert.equal(await action(), false);
    assert.equal(f.raw(), original);
    assert.deepEqual(f.store.getSnapshot().items, before.items);
    assert.deepEqual(f.store.getSnapshot().categories, before.categories);
    assert.deepEqual(f.store.getUndo(), undo);
    assert.deepEqual(f.store.getDraft(), body('unsaved', 'draft details', 'id-1'));
    assert.match(f.store.getSnapshot().error, /Quota exceeded/);
  }
  f.fail(false);
  f.store.reload();
  assert.equal(f.store.getSnapshot().error, null);
  assert.equal(await f.store.restore(), true);
  assert.equal(f.store.getUndo(), null);
});

test('corrupt, unsupported and invalid references never overwrite raw data', async () => {
  const invalid = ['not json', '', 'null', '[]', '{}', '{"version":3,"items":[],"categories":[]}', '{"version":2,"items":[]}', rawV2([{}]), rawV2([record({ categoryId: 'missing' })]), rawV1([{}])];
  for (const raw of invalid) {
    const f = fixture(raw);
    assert.match(f.store.getSnapshot().error, /读取失败/);
    assert.deepEqual(f.store.getSnapshot().items, []);
    assert.equal(await f.store.add(body('new')), false);
    assert.equal(await f.store.addCategory('new'), false);
    assert.equal(f.writes(), 0);
    assert.equal(f.raw(), raw);
    assert.equal(f.store.exportRaw(), raw);
  }
});

test('invalid IDs, duplicates, timestamps, states, field types and field lengths fail closed', () => {
  const badRecords = [
    { id: '' }, { id: ' ' }, { id: ' padded ' }, { id: 'bad\nID' }, { id: 1 }, { done: 'false' },
    { createdAt: -1 }, { createdAt: 1.5 }, { updatedAt: -1 }, { updatedAt: 1.5 }, { updatedAt: 8640000000000001 }, { updatedAt: Number.MAX_SAFE_INTEGER + 1 },
    { title: '' }, { title: '  ' }, { title: 1 }, { title: 'x'.repeat(MAX_TITLE + 1) }, { content: null }, { content: [] }, { content: 'x'.repeat(MAX_CONTENT + 1) },
    { categoryId: undefined }, { categoryId: '' }, { categoryId: 3 }, { categoryId: 'absent' }
  ];
  for (const fields of badRecords) assert.throws(() => decode(rawV2([record(fields)])), undefined, JSON.stringify(fields));
  assert.throws(() => decode(rawV2([record(), record()])));
  for (const categories of [[{ id: '', name: 'ok' }], [{ id: 'c', name: '' }], [{ id: 'c', name: 2 }], [{ id: 'c', name: 'x'.repeat(MAX_CATEGORY + 1) }], [{ id: 'c', name: 'A' }, { id: 'c', name: 'B' }], [{ id: 'c', name: 'Ａ' }, { id: 'd', name: ' a ' }]]) assert.throws(() => decode(rawV2([], categories)));
  for (const fields of [{ id: '' }, { done: 'true' }, { text: {} }, { text: 'x'.repeat(MAX_CONTENT + 1) }, { createdAt: -1 }, { updatedAt: -1 }]) assert.throws(() => decode(rawV1([legacy(fields)])));
  assert.throws(() => decode(rawV1([legacy(), legacy()])));
  assert.throws(() => encode(document([record({ categoryId: 'missing' })])));
});

test('external corruption/read failure retains the last good snapshot and blocks all writes until fixed', async () => {
  const f = fixture();
  await f.store.add(body('safe'));
  const goodRaw = f.raw();
  const before = f.store.getSnapshot();
  f.setRaw('{broken');
  f.store.reload();
  assert.deepEqual(f.store.getSnapshot().items, before.items);
  assert.equal(await f.store.toggle('id-1'), false);
  assert.equal(f.raw(), '{broken');
  f.setRaw(goodRaw);
  f.failRead(true);
  f.store.reload();
  assert.match(f.store.getSnapshot().error, /Read denied/);
  assert.equal(await f.store.add(body('bad')), false);
  assert.equal(f.raw(), goodRaw);
  f.failRead(false);
  f.store.reload();
  assert.equal(f.store.getSnapshot().error, null);
});

test('stale panels merge current documents, preserve categories and reject stale deleted IDs/categories', async () => {
  const f = fixture();
  const second = createStore({ storage: f.storage, id: () => 'second', now: () => 1800000000000 });
  await f.store.addCategory('shared');
  await second.add(body('second', '', 'id-1'));
  await f.store.add(body('first'));
  assert.equal(decode(f.raw()).items.length, 2);
  assert.equal(decode(f.raw()).categories.length, 1);
  await f.store.toggle('second');
  assert.equal(decode(f.raw()).items.find(item => item.id === 'second').done, true);
  await f.store.removeCategory('id-1');
  const before = f.raw();
  assert.equal(await second.add(body('stale category', '', 'id-1')), false);
  assert.equal(await second.edit('second', body('stale edit', '', 'id-1')), false);
  assert.equal(f.raw(), before);
  await f.store.remove('second');
  assert.equal(await second.edit('second', body('missing')), false);
  assert.equal(await second.toggle('second'), false);
  assert.equal(await second.remove('second'), false);
  assert.equal(await second.renameCategory('id-1', 'gone'), false);
  assert.equal(decode(f.raw()).items.length, 1);
  f.store.dispose(); second.dispose();
});

test('queued mutations retain every item, snapshot inputs and execute under the supplied async lock', async () => {
  let locked = false;
  let lockCalls = 0;
  const lock = async run => {
    assert.equal(locked, false);
    locked = true;
    lockCalls++;
    await Promise.resolve();
    try { return run(); } finally { locked = false; }
  };
  const f = fixture(null, { lock });
  const input = body('captured', 'original');
  const first = f.store.add(input);
  input.title = 'mutated'; input.content = 'mutated'; input.categoryId = 'missing';
  const results = await Promise.all([first, ...Array.from({ length: 30 }, (_, i) => f.store.add(body('item ' + i)))]);
  assert.ok(results.every(Boolean));
  assert.equal(lockCalls, 31);
  assert.equal(decode(f.raw()).items.length, 31);
  assert.equal(new Set(decode(f.raw()).items.map(item => item.id)).size, 31);
  assert.equal(decode(f.raw()).items.find(item => item.id === 'id-1').title, 'captured');
  assert.equal(decode(f.raw()).items.find(item => item.id === 'id-1').content, 'original');
});

test('two panels using shared queued lock preserve independently queued writes', async () => {
  let lockTail = Promise.resolve();
  const lock = run => {
    const result = lockTail.then(run);
    lockTail = result.catch(() => {});
    return result;
  };
  const f = fixture(null, { lock });
  let i = 0;
  const second = createStore({ storage: f.storage, lock, id: () => 'second-' + ++i, now: () => 1800000000000 });
  await Promise.all(Array.from({ length: 15 }, (_, n) => Promise.all([f.store.add(body('first ' + n)), second.add(body('second ' + n))])));
  assert.equal(decode(f.raw()).items.length, 30);
  assert.equal(new Set(decode(f.raw()).items.map(item => item.id)).size, 30);
  f.store.dispose(); second.dispose();
});

test('lock failure resolves false without poisoning subsequent queue operations', async () => {
  let fail = true;
  const f = fixture(null, { lock: async run => { if (fail) throw new Error('Lock unavailable'); return run(); } });
  assert.equal(await f.store.add(body('failed')), false);
  assert.equal(f.raw(), null);
  assert.match(f.store.getSnapshot().error, /Lock unavailable/);
  fail = false;
  assert.equal(await f.store.add(body('saved')), true);
});

test('invalid generated IDs/timestamps and ID collisions are rejected before writes', async () => {
  for (const injections of [{ id: () => '' }, { now: () => -1 }, { now: () => 1.5 }, { now: () => Infinity }]) {
    const f = fixture(null, injections);
    assert.equal(await f.store.add(body('bad')), false);
    assert.equal(f.writes(), 0);
  }
  const f = fixture(rawV2([record()]), { id: () => 'one' });
  const original = f.raw();
  assert.equal(await f.store.add(body('collision')), false);
  assert.equal(f.raw(), original);
});

test('clock rollback does not generate invalid updatedAt values', async () => {
  const f = fixture(rawV2([record({ createdAt: 100, updatedAt: 200 })]), { now: () => 1 });
  assert.equal(await f.store.edit('one', body('edited')), true);
  assert.equal(decode(f.raw()).items[0].updatedAt, 200);
  assert.equal(await f.store.toggle('one'), true);
  assert.equal(decode(f.raw()).items[0].updatedAt, 200);
});

test('draft, undo and snapshot access cannot mutate store or caller-owned values', async () => {
  const f = fixture();
  const input = body('', 'pending');
  f.store.setDraft(input);
  input.content = 'changed';
  const draft = f.store.getDraft();
  draft.content = 'changed again';
  assert.deepEqual(f.store.getDraft(), body('', 'pending'));
  for (const value of [null, '', {}, body(1), body('', [], null), body('', '', ' ')]) assert.throws(() => f.store.setDraft(value), /草稿/);
  assert.deepEqual(f.store.getDraft(), body('', 'pending'));
  f.store.setDraft(body('x'.repeat(100), 'x'.repeat(31000)));
  assert.equal(f.store.getDraft().title.length, 100); // incomplete/oversized drafts are recoverable, but cannot be saved
  await f.store.add(body('safe'));
  assert.throws(() => { f.store.getSnapshot().items[0].title = 'corrupt'; }, TypeError);
  assert.throws(() => { f.store.getSnapshot().items.push(record()); }, TypeError);
  await f.store.remove('id-1');
  const undo = f.store.getUndo();
  undo.title = 'corrupt';
  await f.store.restore();
  assert.equal(decode(f.raw()).items[0].title, 'safe');
});

test('undo collision keeps current record instead of duplicating or overwriting it', async () => {
  const f = fixture(rawV2([record()]));
  await f.store.remove('one');
  f.setRaw(rawV2([record({ title: 'external current' })]));
  assert.equal(await f.store.restore(), true);
  assert.equal(decode(f.raw()).items.length, 1);
  assert.equal(decode(f.raw()).items[0].title, 'external current');
  assert.equal(f.store.getUndo(), null);
});

test('status filters search both title and content case-insensitively with non-mutating newest-first order', () => {
  const items = [record({ id: 'old', title: 'Title IDEA', content: '', createdAt: 1, updatedAt: 1 }), record({ id: 'done-old', title: '完成', content: 'Hidden NEEDLE', done: true, createdAt: 2, updatedAt: 3 }), record({ id: 'new', title: '新', content: 'needle in details', createdAt: 4, updatedAt: 4 }), record({ id: 'done-new', title: 'Done', done: true, createdAt: 2, updatedAt: 9 })];
  const original = [...items];
  assert.deepEqual(visibleItems(items, 'all', '').map(item => item.id), ['new', 'old', 'done-new', 'done-old']);
  assert.deepEqual(visibleItems(items, 'open', '').map(item => item.id), ['new', 'old']);
  assert.deepEqual(visibleItems(items, 'all', ' needle ').map(item => item.id), ['new', 'done-old']);
  assert.deepEqual(visibleItems(items, 'done', 'NEEDLE').map(item => item.id), ['done-old']);
  assert.deepEqual(visibleItems(items, 'open', ' IDEA ').map(item => item.id), ['old']);
  assert.deepEqual(visibleItems(items, 'done', 'IDEA'), []);
  assert.deepEqual(items, original);
});

test('grouping uses category order, omits empty groups, preserves input order and puts unclassified last', () => {
  const categories = [{ id: 'c2', name: 'Second' }, { id: 'empty', name: 'Empty' }, { id: 'c1', name: 'First' }];
  const items = [record({ id: 'unclassified' }), record({ id: 'first', categoryId: 'c1' }), record({ id: 'second-a', categoryId: 'c2' }), record({ id: 'second-b', categoryId: 'c2' })];
  const groups = groupedItems(items, categories);
  assert.deepEqual(groups.map(({ id, name }) => ({ id, name })), [{ id: 'c2', name: 'Second' }, { id: 'c1', name: 'First' }, { id: null, name: '未分类' }]);
  assert.deepEqual(groups.map(group => group.items.map(item => item.id)), [['second-a', 'second-b'], ['first'], ['unclassified']]);
  assert.deepEqual(groupedItems([], categories), []);
  assert.deepEqual(groupedItems([items[0]], []), [{ id: null, name: '未分类', items: [items[0]] }]);
  assert.equal(items[0].id, 'unclassified');
  assert.equal(categories[0].id, 'c2');
});

test('storage events sync both arrays, ignore unrelated keys, reload on clear and clean up exactly once', async () => {
  let listener;
  let unsubscribes = 0;
  const f = fixture(null, { subscribeStorage(fn) { listener = fn; return () => { unsubscribes++; }; } });
  let notifications = 0;
  const unsubscribe = f.store.subscribe(() => { notifications++; });
  f.setRaw(rawV2([record({ content: '<script>alert(1)</script>', categoryId: 'c' })], [{ id: 'c', name: '自定义' }]));
  listener({ key: 'unrelated' });
  assert.equal(notifications, 0);
  listener({ key: STORAGE_KEY });
  assert.equal(f.store.getSnapshot().items[0].content, '<script>alert(1)</script>');
  assert.equal(f.store.getSnapshot().categories[0].name, '自定义');
  assert.equal(f.writes(), 0);
  f.setRaw(null);
  listener({ key: null });
  assert.deepEqual(f.store.getSnapshot(), { ...document(), error: null });
  assert.equal(notifications, 2);
  unsubscribe();
  f.store.reload();
  assert.equal(notifications, 2);
  f.store.dispose(); f.store.dispose();
  assert.equal(unsubscribes, 1);
  const reads = f.reads();
  listener({ key: STORAGE_KEY });
  f.store.reload();
  assert.equal(f.reads(), reads);
  assert.equal(await f.store.add(body('after dispose')), false);
  assert.equal(f.writes(), 0);
});

test('a throwing subscriber cannot convert an already saved transaction to failure', async () => {
  const f = fixture();
  let observed = 0;
  f.store.subscribe(() => { throw new Error('observer failure'); });
  f.store.subscribe(() => { observed++; });
  assert.equal(await f.store.add(body('saved')), true);
  assert.equal(decode(f.raw()).items[0].title, 'saved');
  assert.equal(f.store.getSnapshot().error, null);
  assert.equal(observed, 1);
});
