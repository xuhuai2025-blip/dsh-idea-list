import test from 'node:test';
import assert from 'node:assert/strict';
import { copyFile, mkdtemp, readFile, rm } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import vm from 'node:vm';

const root = fileURLToPath(new URL('../', import.meta.url));
test('clean standalone copy builds from any working directory with reproducible bytes', async () => {
  const parent = resolve(root, 'tests');
  const fixture = await mkdtemp(join(parent, '.build-'));
  assert.equal(dirname(fixture), parent);
  try {
    for (const file of ['build.mjs', 'store.js', 'panel.js', 'package.json']) await copyFile(join(root, file), join(fixture, file));
    const build = () => {
      const result = spawnSync(process.execPath, [join(fixture, 'build.mjs')], { cwd: parent, stdio: 'inherit' });
      assert.equal(result.error, undefined);
      assert.equal(result.status, 0);
    };
    build();
    const first = await readFile(join(fixture, 'dist/client.js'), 'utf8');
    build();
    assert.equal(await readFile(join(fixture, 'dist/client.js'), 'utf8'), first);
    assert.equal(await readFile(join(fixture, 'package.json'), 'utf8'), await readFile(join(root, 'package.json'), 'utf8'));
  } finally {
    if (dirname(fixture) !== parent || !fixture.startsWith(join(parent, '.build-'))) throw new Error('Invalid temporary build path');
    await rm(fixture, { recursive: true, force: true });
  }
});

test('built client registers native slots and disposes browser storage listeners', async () => {
  let plugin, removed = 0;
  const registrations = [], disposers = [];
  const window = {
    localStorage: { getItem() { return null; }, setItem() {} }, navigator: {},
    addEventListener() {}, removeEventListener() { removed++; },
    __ModuleLoader__: { load(value) { plugin = value; } },
  };
  vm.runInNewContext(await readFile(join(root, 'dist/client.js'), 'utf8'), { window });
  assert.equal(plugin.id, '@local/dsh-idea');
  plugin.factory(name => { assert.equal(name, 'react'); return { createElement() {} }; }).apply({
    effect(run) { disposers.push(run()); },
    slots: { inject(_slot, run) { run(); }, register(meta) { registrations.push(meta); } },
  });
  assert.equal(registrations.length, 2);
  assert.equal(registrations[0].key, 'idea');
  assert.equal(registrations[1].id, 'idea');
  for (const dispose of disposers) dispose();
  assert.equal(removed, 1);
});
