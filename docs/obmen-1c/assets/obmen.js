/* Обмен с 1С: фильтр таблицы, вкладки вариантов цены, чек-лист вопросов,
 * подсветка раздела в оглавлении, пауза анимации схемы. */
(function () {
  'use strict';

  // Пауза анимации пакетов: по кнопке и при «уменьшить движение»
  var flows = document.querySelectorAll('.flow svg');
  var toggle = document.querySelector('[data-flow-toggle]');
  var paused = false;

  function setPaused(value) {
    paused = value;
    flows.forEach(function (svg) {
      if (!svg.pauseAnimations) return;
      if (paused) svg.pauseAnimations(); else svg.unpauseAnimations();
    });
    if (toggle) toggle.textContent = paused ? 'Запустить анимацию' : 'Остановить анимацию';
  }

  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    setPaused(true);
  }
  if (toggle) toggle.addEventListener('click', function () { setPaused(!paused); });

  // Фильтр «Кто чем владеет»
  var filters = document.querySelectorAll('[data-filter]');
  var rows = document.querySelectorAll('.own tbody tr');
  filters.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var value = btn.getAttribute('data-filter');
      filters.forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
      rows.forEach(function (row) {
        row.hidden = value !== 'all' && row.getAttribute('data-owner') !== value;
      });
    });
  });

  // Вкладки вариантов цены
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.variants [role="tab"]'));
  function selectTab(tab) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
  }
  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { selectTab(tab); });
    tab.addEventListener('keydown', function (e) {
      var next = null;
      if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
      if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
      if (next) { e.preventDefault(); selectTab(next); next.focus(); }
    });
  });

  // Чек-лист вопросов и комментарии: всё живёт в этом браузере
  var KEY = 'obmen-1c:questions';
  var NOTES_KEY = 'obmen-1c:notes';
  var boxes = document.querySelectorAll('[data-q]');
  var count = document.querySelector('[data-q-count]');
  var fill = document.querySelector('[data-q-fill]');
  var reset = document.querySelector('[data-q-reset]');

  function load(key) {
    try { return JSON.parse(localStorage.getItem(key)) || {}; } catch (e) { return {}; }
  }
  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* без хранилища просто не запоминаем */ }
  }
  function render() {
    var done = 0;
    boxes.forEach(function (b) { if (b.checked) done++; });
    if (count) count.textContent = done + ' из ' + boxes.length;
    if (fill) fill.style.width = (boxes.length ? done / boxes.length * 100 : 0) + '%';
  }

  var state = load(KEY);
  var notes = load(NOTES_KEY);

  function makeMemo(id, placeholder, label) {
    var area = document.createElement('textarea');
    area.className = 'memo';
    area.rows = 1;
    area.placeholder = placeholder;
    area.setAttribute('aria-label', label);
    area.setAttribute('data-note', id);
    return area;
  }

  // Поле комментария под каждым вопросом
  document.querySelectorAll('.qlist .q').forEach(function (label) {
    var id = label.querySelector('[data-q]').getAttribute('data-q');
    var item = document.createElement('div');
    item.className = 'qitem';
    label.parentNode.insertBefore(item, label);
    item.appendChild(label);
    item.appendChild(makeMemo('q:' + id, 'Комментарий…', 'Комментарий к вопросу'));
  });

  // Поле «Что решили» в каждой развилке
  document.querySelectorAll('.fork').forEach(function (fork) {
    var num = fork.querySelector('.fork__num').textContent.trim();
    fork.setAttribute('data-fork', num);
    var wrap = document.createElement('div');
    wrap.className = 'fork__memo';
    var cap = document.createElement('span');
    cap.className = 'fork__memo-label';
    cap.textContent = 'Что решили';
    wrap.appendChild(cap);
    wrap.appendChild(makeMemo('fork:' + num, 'Договорённость, кто делает, срок…', 'Что решили по развилке ' + num));
    fork.appendChild(wrap);
  });

  var memos = document.querySelectorAll('[data-note]');

  function grow(area) {
    area.style.height = 'auto';
    area.style.height = area.scrollHeight + 2 + 'px';
    area.classList.toggle('has-text', area.value.trim() !== '');
  }

  memos.forEach(function (area) {
    area.value = notes[area.getAttribute('data-note')] || '';
    grow(area);
    area.addEventListener('input', function () {
      notes[area.getAttribute('data-note')] = area.value;
      save(NOTES_KEY, notes);
      grow(area);
    });
  });
  window.addEventListener('resize', function () { memos.forEach(grow); });

  boxes.forEach(function (b) {
    b.checked = !!state[b.getAttribute('data-q')];
    b.addEventListener('change', function () {
      state[b.getAttribute('data-q')] = b.checked;
      save(KEY, state);
      render();
    });
  });

  // «Стереть всё» — со второго нажатия, без системных диалогов
  var armTimer = null;
  if (reset) reset.addEventListener('click', function () {
    if (!reset.hasAttribute('data-armed')) {
      reset.setAttribute('data-armed', '');
      reset.textContent = 'Нажмите ещё раз, чтобы стереть';
      armTimer = setTimeout(function () {
        reset.removeAttribute('data-armed');
        reset.textContent = 'Стереть всё';
      }, 3000);
      return;
    }
    clearTimeout(armTimer);
    reset.removeAttribute('data-armed');
    reset.textContent = 'Стереть всё';
    state = {};
    notes = {};
    save(KEY, state);
    save(NOTES_KEY, notes);
    boxes.forEach(function (b) { b.checked = false; });
    memos.forEach(function (area) { area.value = ''; grow(area); });
    render();
    toast('Отметки и комментарии стёрты');
  });
  render();

  // Итоги созвона: текст для блокнота
  function clean(node) {
    return node.textContent.replace(/\s+/g, ' ').trim();
  }
  function pad(n) { return n < 10 ? '0' + n : String(n); }

  function summary() {
    var now = new Date();
    var stamp = pad(now.getDate()) + '.' + pad(now.getMonth() + 1) + '.' + now.getFullYear() +
      ', ' + pad(now.getHours()) + ':' + pad(now.getMinutes());
    var out = ['# Созвон по обмену с 1С — итоги', '', 'Записано: ' + stamp, ''];

    out.push('## Развилки', '');
    document.querySelectorAll('.fork').forEach(function (fork) {
      var num = fork.getAttribute('data-fork');
      out.push('### ' + num + ' ' + clean(fork.querySelector('h3')));
      if (fork.querySelector('.variants')) {
        var tab = fork.querySelector('[role="tab"][aria-selected="true"]');
        if (tab) out.push('Открытый вариант: ' + clean(tab));
      }
      var memo = (notes['fork:' + num] || '').trim();
      out.push(memo ? 'Решили: ' + memo : 'Решили: —', '');
    });

    var done = 0;
    boxes.forEach(function (b) { if (b.checked) done++; });
    out.push('## Вопросы (обсудили ' + done + ' из ' + boxes.length + ')', '');
    document.querySelectorAll('.qgroup').forEach(function (group) {
      var items = group.querySelectorAll('.qitem');
      if (!items.length) return;
      out.push('### ' + clean(group.querySelector('.qgroup__title')));
      items.forEach(function (item) {
        var box = item.querySelector('[data-q]');
        var text = item.querySelector('.q__text').cloneNode(true);
        var hint = text.querySelector('small');
        if (hint) hint.remove();
        var line = '- [' + (box.checked ? 'x' : ' ') + '] ' + clean(item.querySelector('.q__num')) + '. ' + clean(text);
        var memo = (notes['q:' + box.getAttribute('data-q')] || '').trim();
        out.push(line);
        if (memo) out.push('  ' + memo.replace(/\n/g, '\n  '));
      });
      out.push('');
    });

    var general = (notes.general || '').trim();
    out.push('## Общие заметки', '', general || '—', '');
    return out.join('\n');
  }

  // Буфер обмена: современный способ, а где он закрыт — через скрытое поле
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).then(function () { return true; }, function () { return legacyCopy(text); });
    }
    return Promise.resolve(legacyCopy(text));
  }
  function legacyCopy(text) {
    var area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    area.remove();
    return ok;
  }

  var toastEl = document.querySelector('[data-toast]');
  var toastTimer = null;
  function toast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('is-on'); }, 2400);
  }

  document.querySelectorAll('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      copyText(summary()).then(function (ok) {
        toast(ok ? 'Итоги скопированы — вставьте в блокнот' : 'Не удалось скопировать — нажмите «Скачать .md»');
      });
    });
  });

  var download = document.querySelector('[data-download]');
  if (download) download.addEventListener('click', function () {
    var blob = new Blob([summary()], { type: 'text/markdown;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    var d = new Date();
    a.href = url;
    a.download = 'obmen-1c-itogi-' + d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + '.md';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    toast('Файл с итогами сохранён');
  });

  // Подсветка текущего раздела в оглавлении
  var links = document.querySelectorAll('.sidebar a');
  var map = {};
  links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (a) { a.classList.remove('is-active'); });
        var link = map[entry.target.id];
        if (link) link.classList.add('is-active');
      });
    }, { rootMargin: '-30% 0px -60% 0px' });
    document.querySelectorAll('main .section').forEach(function (s) { observer.observe(s); });
  }
})();
