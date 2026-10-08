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

  // Чек-лист вопросов: отметки живут в этом браузере
  var KEY = 'obmen-1c:questions';
  var boxes = document.querySelectorAll('[data-q]');
  var count = document.querySelector('[data-q-count]');
  var fill = document.querySelector('[data-q-fill]');
  var reset = document.querySelector('[data-q-reset]');

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; }
  }
  function save(state) {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* без хранилища просто не запоминаем */ }
  }
  function render() {
    var done = 0;
    boxes.forEach(function (b) { if (b.checked) done++; });
    if (count) count.textContent = done + ' из ' + boxes.length;
    if (fill) fill.style.width = (boxes.length ? done / boxes.length * 100 : 0) + '%';
  }

  var state = load();
  boxes.forEach(function (b) {
    b.checked = !!state[b.getAttribute('data-q')];
    b.addEventListener('change', function () {
      state[b.getAttribute('data-q')] = b.checked;
      save(state);
      render();
    });
  });
  if (reset) reset.addEventListener('click', function () {
    state = {};
    save(state);
    boxes.forEach(function (b) { b.checked = false; });
    render();
  });
  render();

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
