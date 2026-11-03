// Built by build.mjs; store.js is inlined before this loader.
window.__ModuleLoader__.load({
  id: 'dsh-idea-list',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
    const CSS = `
.idea-page{height:100%;min-height:0;overflow:auto;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font:inherit;font-family:var(--dsh-font-family-text,inherit)}
.idea-page *{box-sizing:border-box}
.idea-wrap{max-width:1000px;margin:0 auto;padding:36px 32px}
.idea-page button,.idea-page input,.idea-page textarea,.idea-page select{font:inherit}
.idea-page button{cursor:pointer}
.idea-page button:disabled{opacity:.5;cursor:default}
.idea-page button:focus-visible,.idea-page input:focus-visible,.idea-page textarea:focus-visible,.idea-page select:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:3px}
.idea-top{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:24px}
.idea-title{font-size:23px;line-height:1.4;font-weight:600;margin:0}
.idea-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:8px 12px;min-height:34px;border:1px solid var(--dsw-alias-border-l1);border-radius:8px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font-size:12px!important;white-space:nowrap}
.idea-btn:hover{background:var(--dsw-alias-bg-layer-2)}
.idea-primary{background:var(--dsw-alias-brand-primary);color:var(--dsw-alias-bg-base);border-color:var(--dsw-alias-brand-primary);font-weight:600}
.idea-primary:hover{background:var(--dsw-alias-brand-primary);filter:brightness(1.08)}
.idea-composer{border:1px solid var(--dsw-alias-border-l2);border-radius:12px;background:var(--dsw-alias-bg-layer-1);overflow:hidden;margin-bottom:24px}
.idea-composer:focus-within{border-color:var(--dsw-alias-brand-primary)}
.idea-title-input{display:block;width:100%;border:0;background:transparent;color:inherit;padding:16px 18px 10px;font-size:15px!important;font-weight:600!important}
.idea-content-input{display:block;width:100%;resize:vertical;min-height:92px;max-height:320px;border:0;background:transparent;color:inherit;padding:4px 18px 12px;line-height:1.7;font-size:13px!important}
.idea-title-input::placeholder,.idea-content-input::placeholder,.idea-search::placeholder{color:var(--dsw-alias-label-secondary);opacity:.8}
.idea-composer .idea-title-input:focus-visible,.idea-composer .idea-content-input:focus-visible{outline:0}
.idea-composer-foot{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:6px 14px 14px}
.idea-category-tools{display:flex;align-items:center;gap:8px;min-width:0}
.idea-select{min-height:34px;max-width:200px;min-width:100px;border:1px solid var(--dsw-alias-border-l1);border-radius:7px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);padding:6px 9px;font-size:12px!important}
.idea-toolbar{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-bottom:26px}
.idea-filters{display:flex;gap:4px;background:var(--dsw-alias-bg-layer-2);padding:4px;border-radius:9px}
.idea-tab{border:0;border-radius:6px;background:transparent;color:var(--dsw-alias-label-secondary);padding:7px 11px;font-size:12px!important;display:flex;gap:8px;align-items:center}
.idea-tab[aria-pressed=true]{background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font-weight:600}
.idea-count{font-size:10px;color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums;font-weight:400}
.idea-searchbox{display:flex;gap:8px;align-items:center;color:var(--dsw-alias-label-secondary);max-width:220px;flex:1;min-width:150px}
.idea-search{border:0;border-radius:7px;background:transparent;color:var(--dsw-alias-label-primary);width:100%;min-width:0;padding:8px 4px;font-size:12px!important}
.idea-group{margin:0 0 28px}
.idea-group-head{display:flex;align-items:center;gap:9px;margin:0 0 14px;padding-bottom:9px;border-bottom:1px solid var(--dsw-alias-border-l1)}
.idea-group-title{font-size:13px;font-weight:600;line-height:1.5;margin:0;overflow-wrap:anywhere}
.idea-list{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:14px 12px;padding:0;margin:0;list-style:none}
.idea-card{display:flex;align-items:center;gap:0;min-width:0;min-height:60px;padding-left:14px;border:1px solid var(--dsw-alias-border-l1);border-radius:9px;background:var(--dsw-alias-bg-layer-1)}
.idea-card:hover{border-color:var(--dsw-alias-brand-primary)}
.idea-card-check{accent-color:var(--dsw-alias-brand-primary);width:16px;height:16px;flex:0 0 16px;margin:0;cursor:pointer}
.idea-card-open{display:block;flex:1;min-width:0;min-height:60px;align-self:stretch;text-align:left;border:0;border-radius:inherit;background:transparent;color:inherit;padding:17px 12px;font-size:13px!important;line-height:1.65}
.idea-card-label{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden;overflow-wrap:anywhere}
.idea-card[data-done=true] .idea-card-label{text-decoration:line-through;color:var(--dsw-alias-label-secondary)}
.idea-notice{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 12px;border:1px solid var(--dsw-alias-border-l2);border-radius:9px;margin:12px 0;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-1);font-size:12px;line-height:1.7}
.idea-notice[data-error=true]{border-color:var(--dsw-alias-state-error-primary);color:var(--dsw-alias-state-error-primary)}
.idea-icon-btn{display:grid;place-items:center;flex-shrink:0;width:30px;height:30px;border:0;border-radius:7px;color:var(--dsw-alias-label-secondary);background:transparent}
.idea-icon-btn:hover{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary)}
.idea-danger{color:var(--dsw-alias-state-error-primary)!important}
.idea-sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap;border:0}
.idea-dialog{width:min(680px,calc(100vw - 32px));max-width:none;max-height:86vh;padding:0;border:1px solid var(--dsw-alias-border-l2);border-radius:14px;background:var(--dsw-alias-bg-overlay);color:var(--dsw-alias-label-primary);font:inherit;box-shadow:0 20px 70px color-mix(in srgb,var(--dsw-alias-label-primary) 18%,transparent)}
.idea-dialog::backdrop{background:color-mix(in srgb,var(--dsw-alias-bg-base) 45%,transparent);backdrop-filter:blur(4px)}
.idea-modal-sheet{display:flex;flex-direction:column;max-height:84vh;min-height:0}
.idea-modal-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;padding:22px 24px 16px}
.idea-modal-title{font-size:19px;line-height:1.6;font-weight:600;margin:0;overflow-wrap:anywhere;white-space:pre-wrap}
.idea-modal-content{overflow:auto;min-height:0;padding:0 24px 22px}
.idea-detail-meta{font-size:12px;color:var(--dsw-alias-label-secondary);margin-bottom:18px}
.idea-detail-text{font-size:14px;line-height:1.9;white-space:pre-wrap;overflow-wrap:anywhere;margin:0}
.idea-modal-foot{display:flex;align-items:center;justify-content:flex-end;gap:8px;flex-wrap:wrap;padding:14px 24px;border-top:1px solid var(--dsw-alias-border-l1)}
.idea-modal-foot .idea-danger{margin-right:auto}
.idea-field{display:flex;flex-direction:column;gap:8px;margin-bottom:16px;font-size:12px;color:var(--dsw-alias-label-secondary)}
.idea-field-input{display:block;width:100%;min-height:38px;padding:10px 12px;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font-size:14px!important;line-height:1.7}
textarea.idea-field-input{min-height:200px;resize:vertical}
.idea-category-list{list-style:none;padding:0;margin:0 0 18px}
.idea-category-row{display:flex;align-items:center;gap:8px;padding:10px 0;border-bottom:1px solid var(--dsw-alias-border-l1)}
.idea-category-name{flex:1;min-width:0;font-size:14px;overflow-wrap:anywhere}
.idea-category-add{display:flex;align-items:center;gap:8px}
.idea-category-add input{min-width:0;flex:1}
@media(max-width:640px){.idea-wrap{padding:24px 18px}.idea-title{font-size:21px}.idea-top{gap:8px}.idea-composer-foot{flex-wrap:wrap}.idea-category-tools{flex:1}.idea-select{max-width:160px}.idea-toolbar{gap:12px}.idea-searchbox{max-width:none}.idea-tab{padding:7px 9px}.idea-list{grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.idea-card-open{padding:16px 12px}.idea-modal-head{padding:18px 18px 14px}.idea-modal-content{padding:0 18px 18px}.idea-modal-foot{padding:12px 18px}.idea-category-add{flex-wrap:wrap}}
@media(max-width:380px){.idea-list{grid-template-columns:1fr}}
@media(prefers-reduced-motion:reduce){.idea-page *{scroll-behavior:auto}}
`;
    function Icon({ name = 'bulb', size = 20 }) {
      const paths = {
        bulb: 'M9 18h6M10 21h4M8.5 14.5C7 13.4 6 11.8 6 9.5a6 6 0 0 1 12 0c0 2.3-1 3.9-2.5 5-.7.5-.9 1.2-.9 2.5H9.4c0-1.3-.2-2-.9-2.5ZM10 9.5l1.5 1.5L14 8',
        plus: 'M12 5v14M5 12h14',
        search: 'M21 21l-4.5-4.5M19 10.5a8.5 8.5 0 1 1-17 0 8.5 8.5 0 0 1 17 0Z',
        download: 'M12 3v12m-4-4 4 4 4-4M4 16v5h16v-5',
        close: 'm6 6 12 12M6 18 18 6'
      };
      return h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }, h('path', { d: paths[name] }));
    }
    function Dialog({ label, onClose, children }) {
      const ref = React.useRef(null);
      React.useEffect(() => {
        const dialog = ref.current;
        dialog.showModal();
        return () => { if (dialog.open) dialog.close(); };
      }, []);
      return h('dialog', { ref, className: 'idea-dialog', 'aria-label': label, onCancel: event => { event.preventDefault(); onClose(); }, onClick: event => { if (event.target === ref.current) onClose(); } }, h('div', { className: 'idea-modal-sheet' }, children));
    }
    function CloseButton({ onClick }) {
      return h('button', { className: 'idea-icon-btn', type: 'button', 'aria-label': '关闭弹窗', onClick }, h(Icon, { name: 'close', size: 18 }));
    }
    function CategorySelect({ categories, value, onChange, label = '选择分类', disabled = false }) {
      return h('select', { className: 'idea-select', 'aria-label': label, value: value || '', disabled, onChange: event => onChange(event.target.value || null) },
        h('option', { value: '' }, '未分类'), categories.map(category => h('option', { key: category.id, value: category.id }, category.name)));
    }
    return {
      inject: ['slots'],
      apply(ctx) {
        const store = createStore({
          storage: { getItem: key => window.localStorage.getItem(key), setItem: (key, value) => window.localStorage.setItem(key, value) },
          subscribeStorage(listener) { window.addEventListener('storage', listener); return () => window.removeEventListener('storage', listener); },
          lock: run => window.navigator.locks ? window.navigator.locks.request(STORAGE_KEY, run) : run()
        });
        ctx.effect(() => () => store.dispose());
        function Detail({ item, categories, busy, error, run, onClose, onMessage }) {
          const [editing, setEditing] = React.useState(false);
          const [discarding, setDiscarding] = React.useState(false);
          const [draft, setDraft] = React.useState(() => ({ title: item.title, content: item.content, categoryId: item.categoryId }));
          function beginEdit() { setDraft({ title: item.title, content: item.content, categoryId: item.categoryId }); setDiscarding(false); setEditing(true); }
          function requestClose() {
            if (editing && (draft.title !== item.title || draft.content !== item.content || draft.categoryId !== item.categoryId)) setDiscarding(true);
            else onClose();
          }
          function change(field, value) { setDraft(current => ({ ...current, [field]: value })); }
          return h(Dialog, { label: editing ? '编辑灵感' : '灵感详情', onClose: requestClose },
            h('div', { className: 'idea-modal-head' }, h('h2', { className: 'idea-modal-title' }, editing ? '编辑灵感' : item.title), h(CloseButton, { onClick: requestClose })),
            h('div', { className: 'idea-modal-content' },
              error ? h('div', { className: 'idea-notice', 'data-error': true, role: 'alert' }, error, h('button', { className: 'idea-btn', type: 'button', onClick: store.reload }, '重试读取')) : null,
              discarding ? h('div', { className: 'idea-notice', role: 'alert' }, h('span', null, '放弃未保存的修改？'), h('button', { className: 'idea-btn', type: 'button', onClick: () => setDiscarding(false) }, '继续编辑'), h('button', { className: 'idea-btn idea-danger', type: 'button', onClick: onClose }, '放弃修改')) : null,
              editing ? h('div', null,
                h('label', { className: 'idea-field' }, '标题', h('input', { className: 'idea-field-input', 'aria-label': '编辑标题', maxLength: MAX_TITLE, value: draft.title, onChange: event => change('title', event.target.value) })),
                h('label', { className: 'idea-field' }, '具体内容', h('textarea', { className: 'idea-field-input', 'aria-label': '编辑具体内容', maxLength: MAX_CONTENT, value: draft.content, onChange: event => change('content', event.target.value) })),
                h('label', { className: 'idea-field' }, '分类', h(CategorySelect, { categories, label: '编辑分类', value: categories.some(category => category.id === draft.categoryId) ? draft.categoryId : null, onChange: value => change('categoryId', value) }))) :
                h('div', null, h('div', { className: 'idea-detail-meta' }, categories.find(category => category.id === item.categoryId)?.name || '未分类'), h('div', { className: 'idea-detail-text' }, item.content))),
            h('div', { className: 'idea-modal-foot' }, editing ?
              h(React.Fragment, null,
                h('button', { className: 'idea-btn', type: 'button', disabled: busy, onClick: () => { setEditing(false); setDiscarding(false); } }, '取消编辑'),
                h('button', { className: 'idea-btn idea-primary', type: 'button', disabled: busy || !draft.title.trim(), onClick: () => run(() => store.edit(item.id, { ...draft, categoryId: categories.some(category => category.id === draft.categoryId) ? draft.categoryId : null }), () => { setEditing(false); setDiscarding(false); onMessage('修改已保存。'); }) }, '保存修改')) :
              h(React.Fragment, null,
                h('button', { className: 'idea-btn idea-danger', type: 'button', disabled: busy, onClick: () => run(() => store.remove(item.id), () => { onClose(); onMessage('已删除，可撤销。'); }) }, '删除'),
                h('button', { className: 'idea-btn', type: 'button', disabled: busy, onClick: beginEdit }, '编辑'),
                h('button', { className: 'idea-btn idea-primary', type: 'button', disabled: busy, onClick: () => run(() => store.toggle(item.id), () => onMessage(item.done ? '已移回未完成。' : '已完成。')) }, item.done ? '标为未完成' : '标为已完成'))));
        }
        function CategoryManager({ categories, busy, run, onClose, onCreated }) {
          const [name, setName] = React.useState('');
          const [renaming, setRenaming] = React.useState(null);
          const [renameValue, setRenameValue] = React.useState('');
          const [deleting, setDeleting] = React.useState(null);
          function addCategory() {
            const submitted = name;
            run(() => store.addCategory(submitted), () => { setName(''); onCreated(store.getSnapshot().categories.find(category => category.name === submitted.trim().normalize('NFC'))?.id || null); });
          }
          return h(Dialog, { label: '管理分类', onClose },
            h('div', { className: 'idea-modal-head' }, h('h2', { className: 'idea-modal-title' }, '管理分类'), h(CloseButton, { onClick: onClose })),
            h('div', { className: 'idea-modal-content' },
              error ? h('div', { className: 'idea-notice', 'data-error': true, role: 'alert' }, error, h('button', { className: 'idea-btn', type: 'button', onClick: store.reload }, '重试读取')) : null,
              h('ul', { className: 'idea-category-list' }, categories.map(category => h('li', { key: category.id, className: 'idea-category-row' },
                renaming === category.id ? h(React.Fragment, null,
                  h('input', { className: 'idea-field-input', 'aria-label': '重命名分类', maxLength: MAX_CATEGORY, value: renameValue, onChange: event => setRenameValue(event.target.value) }),
                  h('button', { className: 'idea-btn', type: 'button', disabled: busy || !renameValue.trim(), onClick: () => run(() => store.renameCategory(category.id, renameValue), () => setRenaming(null)) }, '保存分类名称'),
                  h('button', { className: 'idea-icon-btn', type: 'button', 'aria-label': '取消重命名', onClick: () => setRenaming(null) }, h(Icon, { name: 'close', size: 15 }))) :
                  h(React.Fragment, null,
                    h('span', { className: 'idea-category-name' }, category.name), h('span', { className: 'idea-count' }, items.filter(item => item.categoryId === category.id).length),
                    h('button', { className: 'idea-icon-btn', type: 'button', 'aria-label': '重命名分类：' + category.name, disabled: busy, onClick: () => { setRenaming(category.id); setRenameValue(category.name); setDeleting(null); } }, h(Icon, { name: 'edit', size: 15 })),
                    h('button', { className: 'idea-icon-btn idea-danger', type: 'button', 'aria-label': '删除分类：' + category.name, disabled: busy, onClick: () => { setDeleting(category.id); setRenaming(null); } }, h(Icon, { name: 'trash', size: 15 })))))),
              deleting && categories.some(category => category.id === deleting) ? h('div', { className: 'idea-notice' }, h('span', null, '删除分类后，其中的条目移至「未分类」，不会删除。'),
                h('button', { className: 'idea-btn idea-danger', type: 'button', disabled: busy, onClick: () => run(() => store.removeCategory(deleting), () => setDeleting(null)) }, '确认删除分类'),
                h('button', { className: 'idea-btn', type: 'button', onClick: () => setDeleting(null) }, '取消')) : null,
              h('div', { className: 'idea-category-add' },
                h('input', { className: 'idea-field-input', 'aria-label': '新分类名称', placeholder: '新分类名称', maxLength: MAX_CATEGORY, value: name, onChange: event => setName(event.target.value), onKeyDown: event => { if (event.key === 'Enter' && !event.nativeEvent.isComposing && name.trim()) { event.preventDefault(); addCategory(); } } }),
                h('button', { className: 'idea-btn idea-primary', type: 'button', disabled: busy || !name.trim(), onClick: addCategory }, '新增分类'))));
        }
        function Panel() {
          const { items, categories, error } = React.useSyncExternalStore(store.subscribe, store.getSnapshot);
          const [draft, setDraft] = React.useState(store.getDraft);
          const [filter, setFilter] = React.useState('open');
          const [query, setQuery] = React.useState('');
          const [selectedId, setSelectedId] = React.useState(null);
          const [managing, setManaging] = React.useState(false);
          const [busy, setBusy] = React.useState(false);
          const [message, setMessage] = React.useState('');
          const [exportError, setExportError] = React.useState('');
          const input = React.useRef(null);
          const pending = React.useRef(false);
          const selected = items.find(item => item.id === selectedId);
          const done = items.filter(item => item.done).length;
          const visible = visibleItems(items, filter, query);
          const groups = groupedItems(visible, categories);
          const undo = store.getUndo();
          const categoryId = categories.some(category => category.id === draft.categoryId) ? draft.categoryId : null;
          function changeDraft(field, value) {
            setDraft(current => { const next = { ...current, [field]: value }; store.setDraft(next); return next; });
          }
          async function run(action, after) {
            if (pending.current) return false;
            pending.current = true; setBusy(true);
            try { const ok = await action(); if (ok) after?.(); return ok; }
            finally { pending.current = false; setBusy(false); }
          }
          function add() {
            if (!draft.title.trim()) { input.current?.focus(); return; }
            const submitted = { ...draft, categoryId };
            run(() => store.add(submitted), () => {
              setDraft(current => {
                if (current.title !== submitted.title || current.content !== submitted.content) return current;
                const next = { title: '', content: '', categoryId: current.categoryId }; store.setDraft(next); return next;
              });
              setFilter('open'); setQuery(''); setMessage('已记下。'); input.current?.focus();
            });
          }
          function exportBackup() {
            try {
              const blob = new Blob([store.exportRaw()], { type: 'application/json;charset=utf-8' });
              const url = URL.createObjectURL(blob); const link = document.createElement('a');
              link.href = url; link.download = 'idea-backup-' + new Date().toISOString().slice(0, 10) + '.json';
              link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); setExportError(''); setMessage('已发起备份下载。');
            } catch (failure) { setExportError('备份失败：' + failure.message); }
          }
          const failure = error || exportError;
          return h('section', { className: 'idea-page', 'aria-label': '灵感清单', 'data-stylelab-scope': 'inspiration' },
            h('style', null, CSS),
            h('div', { className: 'idea-wrap' },
              h('header', { className: 'idea-top' },
                h('h1', { className: 'idea-title' }, '灵感清单'),
                h('button', { className: 'idea-btn', 'data-stylelab-surface': 'control', type: 'button', onClick: exportBackup }, h(Icon, { name: 'download', size: 15 }), '导出备份')),
              h('div', { className: 'idea-composer', 'data-stylelab-surface': 'composer', onKeyDown: event => { if (!event.nativeEvent.isComposing && (event.ctrlKey || event.metaKey) && event.key === 'Enter') { event.preventDefault(); add(); } } },
                h('input', { ref: input, className: 'idea-title-input', 'aria-label': '灵感标题', placeholder: '标题', maxLength: MAX_TITLE, value: draft.title, onChange: event => changeDraft('title', event.target.value) }),
                h('textarea', { className: 'idea-content-input', 'aria-label': '具体内容', placeholder: '具体内容', maxLength: MAX_CONTENT, value: draft.content, onChange: event => changeDraft('content', event.target.value) }),
                h('div', { className: 'idea-composer-foot' },
                  h('div', { className: 'idea-category-tools' }, h(CategorySelect, { categories, value: categoryId, onChange: value => changeDraft('categoryId', value) }),
                    h('button', { className: 'idea-btn', type: 'button', onClick: () => setManaging(true) }, '管理分类')),
                  h('button', { className: 'idea-btn idea-primary', type: 'button', title: 'Ctrl / ⌘ + Enter', disabled: busy || !draft.title.trim() || !!error, onClick: add }, h(Icon, { name: 'plus', size: 15 }), '记下想法'))),
              failure ? h('div', { className: 'idea-notice', 'data-error': true, role: 'alert' }, failure, h('button', { className: 'idea-btn', type: 'button', onClick: () => { store.reload(); setExportError(''); } }, '重试读取')) : null,
              h('div', { className: 'idea-toolbar' },
                h('div', { className: 'idea-filters', role: 'group', 'aria-label': '按完成状态筛选' },
                  [['open', '未完成', items.length - done], ['done', '已完成', done], ['all', '全部', items.length]].map(([key, label, count]) =>
                    h('button', { key, className: 'idea-tab', type: 'button', 'aria-pressed': filter === key, onClick: () => setFilter(key) }, label, h('span', { className: 'idea-count' }, count)))),
                h('div', { className: 'idea-searchbox' }, h(Icon, { name: 'search', size: 16 }), h('input', { className: 'idea-search', type: 'search', 'aria-label': '搜索想法', placeholder: '搜索标题或内容…', value: query, onChange: event => setQuery(event.target.value) }))),
              undo ? h('div', { className: 'idea-notice', role: 'status' }, h('span', null, '已删除。'),
                h('button', { className: 'idea-btn', type: 'button', disabled: busy, onClick: () => run(() => store.restore(), () => setMessage('已撤销删除。')) }, '撤销删除'),
                h('button', { className: 'idea-icon-btn', type: 'button', 'aria-label': '关闭删除提示', onClick: store.dismissUndo }, h(Icon, { name: 'close', size: 14 }))) : null,
              groups.map(group => h('section', { key: group.id === null ? 'uncategorized' : 'category-' + group.id, className: 'idea-group', 'aria-label': '分类：' + group.name },
                h('div', { className: 'idea-group-head' }, h('h2', { className: 'idea-group-title' }, group.name), h('span', { className: 'idea-count' }, group.items.length)),
                h('ul', { className: 'idea-list', 'aria-label': group.name + '的想法', 'data-stylelab-collection': 'notes' }, group.items.map(item =>
                  h('li', { key: item.id, className: 'idea-card', 'data-done': item.done, 'data-stylelab-surface': 'note' },
                    h('input', { className: 'idea-card-check', type: 'checkbox', checked: item.done, disabled: busy || !!error, 'aria-label': (item.done ? '标为未完成：' : '标为已完成：') + item.title, onChange: () => run(() => store.toggle(item.id), () => setMessage(item.done ? '已移回未完成。' : '已完成。')) }),
                    h('button', { className: 'idea-card-open', type: 'button', 'aria-label': '查看详情：' + item.title, 'aria-haspopup': 'dialog', onClick: () => setSelectedId(item.id) }, h('span', { className: 'idea-card-label' }, item.title))))))),
              h('p', { role: 'status', 'aria-live': 'polite', className: 'idea-sr-only' }, message)),
            selected ? h(Detail, { key: selected.id, item: selected, categories, busy, error, run, onClose: () => setSelectedId(null), onMessage: setMessage }) : null,
            managing ? h(CategoryManager, { categories, busy, run, onClose: () => setManaging(false), onCreated: value => changeDraft('categoryId', value) }) : null);
        }
        ctx.slots.inject('main', () => ctx.slots.register({ name: 'main', key: 'idea' }, Panel));
        ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({ name: 'sidebar.panellist', id: 'idea', order: 21, label: '灵感清单' }, Icon));
      }
    };
  }
});
