/* Прототип b2bzakup.ru — поведение. Собрано из prototype/js. */

/* ---- js/00-store.js ---- */
/* Состояние прототипа: корзина, избранное, демо-вход, cookie, настройки.
   Всё живёт в localStorage под одним ключом; серверных вызовов нет.
   Любой модуль читает и пишет только через window.B2B.store и слушает
   событие «b2b:change» на document — так счётчики в шапке, мини-корзина
   и страница корзины не расходятся.

   Служебные параметры адреса (в интерфейсе их не видно):
     ?user=client — демо-вход ООО «Ромашка»; ?user=guest — выход;
     ?cookie=reset — снова показать уведомление о cookie;
     ?cart=demo — корзина из пяти позиций демо-данных; ?cart=clear — пустая;
     ?cart=quick — корзина после быстрого заказа: баннер и ошибка МЗП в первой строке;
     ?tab=paste — быстрый заказ сразу на вкладке «Вставить список» (js/pages/quick.js);
     ?tab=1..3 — «Мои заказы» на вкладке группы статусов (js/pages/orders.js);
     ?call=sent — окно «Заказать звонок» открыто в состоянии успеха (js/ui/call.js);
     ?login=error|blocked — вход с плашкой неверной пары или приостановленного доступа;
     ?state=review — «Заявка отправлена» с заголовком «Заявка на проверке» (js/pages/auth.js);
     ?fav=demo — избранное из 12 товаров демо-данных; ?fav=clear — пустое избранное. */
(function () {
  'use strict';

  var KEY = 'b2b-prototype';
  var VERSION = 1;
  var DEFAULTS = {
    v: VERSION,
    user: 'guest',        // guest | client
    cookie: false,        // согласие принято
    cart: {},             // { код 1С: количество в единицах хранения }
    favorites: [],        // [код 1С]
    settings: {}          // режим каталога, колонки, «показать по» и т. п.
  };
  // Состав демо-корзины — раздел 7 демо-данных.
  var DEMO_CART = { '00-00012345': 30, '00-00012301': 25, '00-00012323': 12, '00-00012305': 20, '00-00012313': 40 };
  // Корзина сразу после быстрого заказа: у первой позиции количество меньше МЗП.
  var QUICK_CART = { '00-00012345': 5, '00-00012301': 25, '00-00012323': 12, '00-00012305': 20, '00-00012313': 40 };
  // Демо-избранное — раздел 1 демо-данных. Массив хранит порядок добавления (последний — самый
  // новый), «Дата добавления» показывает новые первыми, поэтому список записан от конца.
  var DEMO_FAVORITES = ['00-00012322', '00-00012302', '00-00012309', '00-00012316', '00-00012307', '00-00012312',
    '00-00012321', '00-00012301', '00-00012305', '00-00012313', '00-00012323', '00-00012345'];

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  function load() {
    try {
      var raw = window.localStorage.getItem(KEY);
      var data = raw ? JSON.parse(raw) : null;
      if (!data || data.v !== VERSION) return clone(DEFAULTS);
      for (var k in DEFAULTS) if (!(k in data)) data[k] = clone(DEFAULTS[k]);
      return data;
    } catch (e) {
      return clone(DEFAULTS);   // приватный режим или заблокированное хранилище
    }
  }

  var state = load();

  function save(reason) {
    try { window.localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* без хранилища — только в памяти */ }
    document.documentElement.setAttribute('data-user', state.user);
    document.dispatchEvent(new CustomEvent('b2b:change', { detail: { reason: reason, state: state } }));
  }

  var store = {
    get: function () { return state; },

    isClient: function () { return state.user === 'client'; },
    login: function () { state.user = 'client'; save('user'); },
    logout: function () { state.user = 'guest'; save('user'); },

    cookieAccepted: function () { return state.cookie; },
    acceptCookie: function () { state.cookie = true; save('cookie'); },

    cartQty: function (code) { return state.cart[code] || 0; },
    cartSet: function (code, qty) {
      if (qty > 0) state.cart[code] = qty; else delete state.cart[code];
      save('cart');
    },
    cartRemove: function (code) { delete state.cart[code]; save('cart'); },
    // Смена фасовки в корзине: новый код встаёт на место прежнего, порядок строк сохраняется
    cartReplace: function (from, to, qty) {
      var next = {};
      Object.keys(state.cart).forEach(function (k) {
        if (k === from) next[to] = qty; else if (k !== to) next[k] = state.cart[k];
      });
      state.cart = next;
      save('cart');
    },
    cartClear: function () { state.cart = {}; save('cart'); },
    cartCount: function () { return Object.keys(state.cart).length; },

    isFavorite: function (code) { return state.favorites.indexOf(code) >= 0; },
    toggleFavorite: function (code) {
      var i = state.favorites.indexOf(code);
      if (i >= 0) state.favorites.splice(i, 1); else state.favorites.push(code);
      save('favorites');
      return i < 0;
    },
    favoritesCount: function () { return state.favorites.length; },
    favoritesClear: function () { state.favorites = []; save('favorites'); },

    setting: function (name, value) {
      if (arguments.length < 2) return state.settings[name];
      state.settings[name] = value;
      save('settings');
    }
  };

  // Служебные параметры адреса применяются до первой отрисовки модулей.
  var params = new URLSearchParams(window.location.search);
  if (params.get('user') === 'client') state.user = 'client';
  if (params.get('user') === 'guest') state.user = 'guest';
  if (params.get('cookie') === 'reset') state.cookie = false;
  if (params.get('cart') === 'demo') state.cart = clone(DEMO_CART);
  if (params.get('cart') === 'quick') state.cart = clone(QUICK_CART);
  if (params.get('cart') === 'clear') state.cart = {};
  if (params.get('fav') === 'demo') state.favorites = DEMO_FAVORITES.slice();
  if (params.get('fav') === 'clear') state.favorites = [];
  try { window.localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* нет хранилища */ }
  document.documentElement.setAttribute('data-user', state.user);

  window.B2B = window.B2B || {};
  window.B2B.store = store;
  window.B2B.params = params;
})();

/* ---- js/05-util.js ---- */
/* Общие помощники: данные, деньги, иконки, запуск модулей.
   Модуль компонента регистрируется через B2B.on('селектор', function (el) {…})
   и запускается один раз для каждого подходящего элемента после загрузки. */
(function () {
  'use strict';

  var B2B = window.B2B;
  var body = document.body;
  var modules = [];

  B2B.root = body ? body.getAttribute('data-root') : './';
  B2B.iconsUrl = body ? body.getAttribute('data-icons') : '';

  B2B.data = function () { return window.DEMO || {}; };

  B2B.product = function (code) {
    var list = B2B.data().products || [];
    for (var i = 0; i < list.length; i++) if (list[i].code === code) return list[i];
    return null;
  };

  // Цена для текущего пользователя (правило «меньшая из двух»):
  // гость — Базовый опт, клиент — Средний опт или индивидуальная, если она ниже.
  B2B.price = function (p) {
    if (!B2B.store.isClient()) return { value: p.prices[0], personal: false };
    var level = p.prices[1];
    if (p.personal && p.personal < level) return { value: p.personal, personal: true };
    return { value: level, personal: false };
  };

  B2B.rub = function (n) {
    return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ₽';
  };

  // Поиск по товарам: точное совпадение кода 1С/штрихкода впереди, затем
  // подстрока в названии, регистронезависимо. Общий движок для панели подсказок
  // (js/ui/header-search.js) и страницы результатов (js/pages/catalog.js).
  // Возвращает [{product, field, index}], field — 'code' | 'barcode' | 'name'.
  B2B.searchMatch = function (query) {
    var q = String(query || '').trim().toLowerCase();
    if (!q) return [];
    var byCode = [], byBarcode = [], byName = [];
    B2B.data().products.forEach(function (p) {
      if (String(p.code).toLowerCase() === q) { byCode.push({ product: p, field: 'code', index: 0 }); return; }
      if (String(p.barcode).toLowerCase() === q) { byBarcode.push({ product: p, field: 'barcode', index: 0 }); return; }
      var i = p.name.toLowerCase().indexOf(q);
      if (i >= 0) byName.push({ product: p, field: 'name', index: i });
    });
    byName.sort(function (a, b) { return a.index - b.index; });
    return byCode.concat(byBarcode, byName);
  };

  // Ошибка у поля (окно звонка, формы входа и регистрации): текст ошибки встаёт вместо подсказки,
  // исходная подсказка возвращается при исправлении; у чекбокса подпись — готовый #<id>-hint.
  function hintFor(input) {
    var id = input.id + '-hint';
    var hint = document.getElementById(id);
    if (!hint) {
      hint = document.createElement('p');
      hint.className = 'field__hint';
      hint.id = id;
      hint.hidden = true;
      input.closest('.field').appendChild(hint);
      input.setAttribute('aria-describedby', id);
    }
    if (!hint.hasAttribute('data-text')) hint.setAttribute('data-text', hint.textContent);
    return hint;
  }

  B2B.fieldError = function (input, message) {
    var hint = input.type === 'checkbox' ? document.getElementById(input.id + '-hint') : hintFor(input);
    var box = input.closest('.field__box');
    var mark = box && box.querySelector('[data-error-icon]');
    if (message) {
      input.setAttribute('aria-invalid', 'true');
      hint.textContent = message;
      hint.classList.add('field__hint--error');
      hint.setAttribute('role', 'alert');
      hint.hidden = false;
      if (box && !mark) {
        box.insertAdjacentHTML('beforeend', B2B.icon('circle-alert'));
        box.lastElementChild.setAttribute('data-error-icon', '');
      }
    } else {
      input.removeAttribute('aria-invalid');
      hint.classList.remove('field__hint--error');
      hint.removeAttribute('role');
      hint.textContent = hint.getAttribute('data-text') || '';
      hint.hidden = !hint.textContent;
      if (mark) mark.remove();
    }
  };

  // Маска +7 (XXX) XXX-XX-XX. Префикс «+7» в поле не считается цифрой номера;
  // в набранном или вставленном без него номере ведущая 7 или 8 отбрасывается.
  B2B.phone = {};
  B2B.phone.digits = function (value) {
    var v = value.trim();
    var d;
    if (/^\+7/.test(v)) d = v.slice(2).replace(/\D/g, '');
    else {
      d = v.replace(/\D/g, '');
      if (d[0] === '7' || d[0] === '8') d = d.slice(1);
    }
    return d.slice(0, 10);
  };
  B2B.phone.format = function (d) {
    if (!d) return '';
    var s = '+7 (' + d.slice(0, 3);
    if (d.length > 3) s += ') ' + d.slice(3, 6);
    if (d.length > 6) s += '-' + d.slice(6, 8);
    if (d.length > 8) s += '-' + d.slice(8, 10);
    return s;
  };

  B2B.icon = function (name, cls) {
    return '<svg class="i ' + (cls || '') + '" aria-hidden="true"><use href="' + B2B.iconsUrl + '#i-' + name + '"/></svg>';
  };

  B2B.on = function (selector, init) { modules.push([selector, init]); };

  function boot() {
    modules.forEach(function (m) {
      document.querySelectorAll(m[0]).forEach(function (el) {
        if (el.__b2b && el.__b2b[m[0]]) return;
        el.__b2b = el.__b2b || {};
        el.__b2b[m[0]] = true;
        m[1](el);
      });
    });
  }
  B2B.boot = boot;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else setTimeout(boot, 0);
})();

/* ---- js/pages/auth.js ---- */
/* Вход, регистрация и восстановление пароля. Отправки на сервер нет: форма [data-auth-form]
   проверяет поля (ошибка у поля, фокус на первое неверное) и ведёт на data-next.
   register — «Подать заявку» активна, когда отмечены оба согласия; ИНН демо-клиента
   подставляет название компании (поле остаётся доступным для ввода); заявка пишется
   в setting('application') и показывается на «Заявка отправлена».
   login — любая пара почты и пароля: демо-вход клиентом. ?login=error|blocked — плашки ошибок.
   reset — переход к новому паролю, как по ссылке из письма. new — проверка пароля и повтора.
   ?state=review на «Заявка отправлена» — заголовок «Заявка на проверке». */
(function () {
  'use strict';

  var B2B = window.B2B;
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function val(form, id) { return form.querySelector('#' + id).value.trim(); }

  function emailError(v) {
    if (!v) return 'Укажите рабочую почту';
    return EMAIL.test(v) ? '' : 'Проверьте адрес почты';
  }
  function passwordError(v) {
    return v.length >= 8 && /\d/.test(v) && /\p{L}/u.test(v) ? '' : 'Минимум 8 символов, включая цифры и буквы';
  }

  // Проверки формы: [id поля, функция → текст ошибки или '']
  var RULES = {
    register: [
      ['reg-inn', function (f) { return /^(\d{10}|\d{12})$/.test(val(f, 'reg-inn')) ? '' : 'ИНН — 10 или 12 цифр'; }],
      ['reg-name', function (f) { return val(f, 'reg-name') ? '' : 'Укажите имя'; }],
      ['reg-phone', function (f) { return B2B.phone.digits(val(f, 'reg-phone')).length === 10 ? '' : 'Укажите номер телефона полностью'; }],
      ['reg-email', function (f) { return emailError(val(f, 'reg-email')); }],
      ['reg-password', function (f) { return passwordError(f.querySelector('#reg-password').value); }],
      ['reg-password2', function (f) { return f.querySelector('#reg-password2').value === f.querySelector('#reg-password').value ? '' : 'Пароли не совпадают'; }],
      ['reg-consent', function (f) { return f.querySelector('#reg-consent').checked ? '' : 'Нужно согласие на обработку персональных данных'; }],
      ['reg-terms', function (f) { return f.querySelector('#reg-terms').checked ? '' : 'Нужно принять условия Пользовательского соглашения'; }]
    ],
    login: [
      ['login-email', function (f) { return emailError(val(f, 'login-email')); }],
      ['login-password', function (f) { return f.querySelector('#login-password').value ? '' : 'Укажите пароль'; }]
    ],
    reset: [
      ['reset-email', function (f) { return emailError(val(f, 'reset-email')); }]
    ],
    'new': [
      ['new-password', function (f) { return passwordError(f.querySelector('#new-password').value); }],
      ['new-password2', function (f) { return f.querySelector('#new-password2').value === f.querySelector('#new-password').value ? '' : 'Пароли не совпадают'; }]
    ]
  };

  function validate(form, rules) {
    var first = null;
    rules.forEach(function (r) {
      var input = form.querySelector('#' + r[0]);
      var message = r[1](form);
      B2B.fieldError(input, message);
      if (message && !first) first = input;
    });
    if (first) first.focus();
    return !first;
  }

  function initRegister(form) {
    var inn = form.querySelector('#reg-inn');
    var company = form.querySelector('#reg-company');
    var phone = form.querySelector('[data-phone]');
    var submit = form.querySelector('[data-auth-submit]');
    var consents = form.querySelectorAll('[data-consent]');

    inn.addEventListener('input', function () {
      inn.value = inn.value.replace(/\D/g, '').slice(0, 12);
      if (inn.value === form.getAttribute('data-client-inn') && !company.value.trim()) {
        company.value = form.getAttribute('data-client-name');
      }
    });
    phone.addEventListener('input', function () {
      phone.value = B2B.phone.format(B2B.phone.digits(phone.value));
    });

    function syncSubmit() {
      submit.disabled = !Array.prototype.every.call(consents, function (c) { return c.checked; });
    }
    form.addEventListener('change', syncSubmit);
    syncSubmit();

    return function () {
      B2B.store.setting('application', {
        inn: inn.value,
        company: company.value.trim(),
        name: val(form, 'reg-name'),
        phone: phone.value,
        email: val(form, 'reg-email')
      });
    };
  }

  B2B.on('[data-auth-form]', function (form) {
    var kind = form.getAttribute('data-auth-form');
    var onSuccess = kind === 'register' ? initRegister(form) : null;

    form.addEventListener('input', function (e) {
      if (e.target.getAttribute('aria-invalid') === 'true') B2B.fieldError(e.target, '');
    });
    form.addEventListener('change', function (e) {
      if (e.target.type === 'checkbox' && e.target.checked && e.target.hasAttribute('aria-invalid')) B2B.fieldError(e.target, '');
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validate(form, RULES[kind])) return;
      if (onSuccess) onSuccess();
      if (kind === 'login') B2B.store.login();
      window.location.href = form.getAttribute('data-next');
    });

    if (kind === 'login') {
      var state = B2B.params.get('login');
      var box = state && document.querySelector('[data-login-alert="' + state + '"]');
      if (box) box.hidden = false;
    }
  });

  B2B.on('[data-auth-sent]', function (root) {
    var app = B2B.store.setting('application');
    if (app) {
      root.querySelectorAll('[data-app]').forEach(function (dd) {
        dd.textContent = app[dd.getAttribute('data-app')] || '—';
      });
    }
    if (B2B.params.get('state') === 'review') {
      root.querySelector('[data-auth-title]').textContent = 'Заявка на проверке';
    }
  });
})();

/* ---- js/pages/cart.js ---- */
/* Корзина и оформление [data-cart-page]. Состав — B2B.store.cart, строки таблицы
   собираются по <template> и не пересоздаются при каждом изменении (как в мини-корзине):
   у степпера в фокусе значение не сбивается, отметки строк сохраняются.
   Цена строки — по уровню пользователя (B2B.price), НДС 20 % справочно, уже в сумме.
   Фасовка — варианты того же товара (общий group): количество переносится, если подходит
   под МЗП и кратность новой фасовки, иначе поднимается до ближайшего допустимого.
   «Оформить заказ» недоступна, пока у строки нарушен МЗП или у выбранной доставки
   не заполнены адрес и телефон. Пустая корзина — блок cart_empty на том же адресе. */
(function () {
  'use strict';

  var B2B = window.B2B;

  function plural(n, one, few, many) {
    var m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return n + ' ' + one;
    if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return n + ' ' + few;
    return n + ' ' + many;
  }

  function fit(qty, p) { return Math.max(p.min, Math.ceil(qty / p.step) * p.step); }

  B2B.on('[data-cart-page]', function (root) {
    var filled = root.querySelector('[data-cart-filled]');
    var emptyBox = root.querySelector('[data-cart-empty]');
    var banner = root.querySelector('[data-cart-banner]');
    var bar = root.querySelector('[data-cart-bar]');
    var table = root.querySelector('[data-cart-table]');
    var list = table.querySelector('[data-cart-rows]');
    var tpl = table.querySelector('[data-cart-row]');
    var href = table.getAttribute('data-product-href');
    var slug = table.getAttribute('data-product-slug');
    var selectAll = [].slice.call(root.querySelectorAll('[data-cart-select-all]'));
    var removeSelected = root.querySelector('[data-cart-remove-selected]');
    var submits = [].slice.call(root.querySelectorAll('[data-cart-submit]'));
    var cards = [].slice.call(root.querySelectorAll('[data-radio-card]'));
    var clearText = root.querySelector('[data-cart-clear-text]');
    var invalid = {};      // код → количество не проходит МЗП или кратность
    var focusPack = null;  // код строки, чей селект фасовки вернуть в фокус после смены
    var packNote = {};     // «1 мешок», «1 коробка» — подпись упаковки из демо-корзины
    (B2B.data().cart || []).forEach(function (c) { if (c.pack_note) packNote[c.code] = c.pack_note; });

    // Баннер быстрого заказа: ?cart=quick или переход из отчёта проверки — тогда
    // числа из setting quickAdded, флаг гасится после показа; source: 'repeat' — повтор заказа
    var quick = B2B.store.setting('quickAdded');
    if (B2B.params.get('cart') === 'quick' || quick) banner.hidden = false;
    if (quick) {
      var bannerText = banner.querySelector('.alert__text');
      bannerText.textContent = plural(quick.added, 'позиция успешно добавлена', 'позиции успешно добавлено', 'позиций успешно добавлено') + '.' +
        (quick.skipped ? ' ' + plural(quick.skipped, 'позиция не добавлена', 'позиции не добавлены', 'позиций не добавлены') + ' из-за отсутствия товара или ошибок при проверке.' : '');
      // Повтор заказа из кабинета — отчёта проверки нет, ссылки на него тоже
      var details = banner.querySelector('.alert__details');
      if (details && quick.source === 'repeat') details.hidden = true;
      B2B.store.setting('quickAdded', null);
    }

    function variants(p) {
      if (!p.group) return [p];
      return B2B.data().products.filter(function (x) { return x.group === p.group; });
    }

    function setStatus(li, valid) {
      var st = li.querySelector('[data-cart-status]');
      st.className = 'cart-row__status cart-row__status--' + (valid ? 'ok' : 'error');
      st.innerHTML = B2B.icon(valid ? 'check' : 'triangle-alert') + (valid ? 'МЗП соблюдено' : 'Нельзя заказать меньше МЗП');
    }

    function makeRow(p) {
      var li = tpl.content.firstElementChild.cloneNode(true);
      var code = p.code;
      var id = 'cart-qty-' + code;
      li.setAttribute('data-code', code);

      var name = li.querySelector('[data-cart-name]');
      name.textContent = p.name;
      name.href = href.replace(slug, p.slug);
      li.querySelector('[data-cart-type]').textContent = p.type || '';
      li.querySelector('[data-cart-codes]').textContent = 'Код: ' + p.code + ' · ШК: ' + p.barcode;
      li.querySelector('[data-cart-pack-m]').textContent = p.pack;
      li.querySelector('[data-cart-step]').textContent = p.step + ' ' + p.unit;
      li.querySelector('[data-cart-step-note]').textContent = packNote[code] ? '(' + packNote[code] + ')' : '';
      li.querySelector('[data-cart-unit]').textContent = p.unit;

      var check = li.querySelector('[data-cart-select]');
      check.setAttribute('aria-label', 'Выбрать: ' + p.name);
      check.addEventListener('change', syncSelection);

      var select = li.querySelector('[data-cart-pack]');
      select.setAttribute('aria-label', 'Фасовка: ' + p.name);
      variants(p).forEach(function (v) {
        var o = document.createElement('option');
        o.value = v.code;
        o.textContent = v.pack;
        o.selected = v.code === code;
        o.disabled = v.stock === 'none' && v.code !== code;
        select.appendChild(o);
      });
      select.addEventListener('change', function () {
        var next = B2B.product(select.value);
        if (!next || next.code === code) return;
        var qty = fit(B2B.store.cartQty(code) + B2B.store.cartQty(next.code), next);
        focusPack = next.code;
        B2B.store.cartReplace(code, next.code, qty);
      });

      var st = li.querySelector('[data-stepper]');
      st.setAttribute('data-min', p.min);
      st.setAttribute('data-step', p.step);
      st.setAttribute('data-unit', p.unit);
      var input = st.querySelector('.stepper__value');
      input.id = id;
      input.name = id;
      input.value = B2B.store.cartQty(code);
      input.setAttribute('aria-label', 'Количество, ' + p.unit + ': ' + p.name);
      input.setAttribute('aria-describedby', id + '-note');
      st.querySelector('[data-step-note]').id = id + '-note';
      st.querySelector('[data-step-down]').setAttribute('aria-label', 'Уменьшить на ' + p.step + ' ' + p.unit);
      st.querySelector('[data-step-up]').setAttribute('aria-label', 'Увеличить на ' + p.step + ' ' + p.unit);
      st.addEventListener('b2b:qty', function (e) {
        if (e.detail.valid) delete invalid[code]; else invalid[code] = true;
        setStatus(li, e.detail.valid);
        if (e.detail.valid && e.detail.value !== B2B.store.cartQty(code)) B2B.store.cartSet(code, e.detail.value);
        else update();
      });

      [].slice.call(li.querySelectorAll('[data-cart-remove]')).forEach(function (btn) {
        btn.setAttribute('aria-label', 'Удалить из корзины: ' + p.name);
        btn.addEventListener('click', function () {
          var nextRow = li.nextElementSibling || li.previousElementSibling;
          B2B.store.cartRemove(code);
          var target = nextRow && nextRow.querySelector('.cart-row__remove-d');
          if (target && target.offsetParent === null) target = nextRow.querySelector('.cart-row__remove-m');
          (target || root.querySelector('.cart__title')).focus();
        });
      });
      return li;
    }

    function rows() { return [].slice.call(list.children); }

    function syncSelection() {
      var checks = rows().map(function (li) { return li.querySelector('[data-cart-select]'); });
      var all = checks.length > 0 && checks.every(function (c) { return c.checked; });
      var some = checks.some(function (c) { return c.checked; });
      selectAll.forEach(function (c) { c.checked = all; });
      removeSelected.disabled = !some;
    }

    function methodReady() {
      var card = cards.filter(function (c) { return c.querySelector('.radio-card__input').checked; })[0];
      if (!card) return false;
      return [].slice.call(card.querySelectorAll('[data-cart-need]')).every(function (f) { return f.value.trim() !== ''; });
    }

    // Суммы, счётчики и доступность «Оформить заказ»
    function update() {
      var cart = B2B.store.get().cart;
      var codes = Object.keys(cart).filter(function (c) { return B2B.product(c); });
      var sum = codes.reduce(function (s, c) { return s + B2B.price(B2B.product(c)).value * cart[c]; }, 0);
      var count = plural(codes.length, 'позиция', 'позиции', 'позиций');
      var vat = 'НДС 20%: ' + B2B.rub(sum * 20 / 120);
      root.querySelectorAll('[data-cart-count]').forEach(function (el) { el.textContent = count; });
      root.querySelectorAll('[data-cart-sum-total], [data-cart-total]').forEach(function (el) { el.textContent = B2B.rub(sum); });
      root.querySelectorAll('[data-cart-vat]').forEach(function (el) { el.textContent = vat; });
      clearText.textContent = count + ' на ' + B2B.rub(sum) + ' будут удалены. Отменить это действие нельзя.';

      var ready = codes.length > 0 && !codes.some(function (c) { return invalid[c]; }) && methodReady();
      submits.forEach(function (a) {
        if (ready) { a.removeAttribute('aria-disabled'); a.removeAttribute('tabindex'); }
        else { a.setAttribute('aria-disabled', 'true'); a.setAttribute('tabindex', '-1'); }
      });
    }

    function render() {
      var cart = B2B.store.get().cart;
      var codes = Object.keys(cart).filter(function (c) { return B2B.product(c); });

      rows().forEach(function (li) {
        var code = li.getAttribute('data-code');
        if (codes.indexOf(code) < 0) { delete invalid[code]; li.remove(); }
      });
      codes.forEach(function (code, i) {
        var p = B2B.product(code);
        var li = list.querySelector('[data-code="' + code + '"]') || makeRow(p);
        if (list.children[i] !== li) list.insertBefore(li, list.children[i] || null);
        var price = B2B.price(p);
        li.querySelector('[data-cart-price]').textContent = B2B.rub(price.value);
        li.querySelector('[data-cart-personal]').hidden = !price.personal;
        li.querySelector('[data-cart-price-m]').textContent = B2B.rub(price.value) + ' / ' + p.unit;
        li.querySelector('[data-cart-sum]').textContent = B2B.rub(price.value * cart[code]);
        var input = li.querySelector('.stepper__value');
        if (document.activeElement !== input && Number(input.value) !== cart[code]) {
          input.value = cart[code];
          input.dispatchEvent(new Event('blur'));   // степпер перепроверит значение
        }
      });
      B2B.boot();   // степперы новых строк

      filled.hidden = !codes.length;
      emptyBox.hidden = codes.length > 0;
      bar.hidden = !codes.length;
      if (!codes.length) banner.hidden = true;
      root.classList.toggle('cart--has-bar', codes.length > 0);

      if (focusPack) {
        var sel = list.querySelector('[data-code="' + focusPack + '"] [data-cart-pack]');
        focusPack = null;
        if (sel) sel.focus();
      }
      syncSelection();
      update();
    }

    selectAll.forEach(function (c) {
      c.addEventListener('change', function () {
        rows().forEach(function (li) { li.querySelector('[data-cart-select]').checked = c.checked; });
        syncSelection();
      });
    });

    removeSelected.addEventListener('click', function () {
      rows().filter(function (li) { return li.querySelector('[data-cart-select]').checked; })
        .forEach(function (li) { B2B.store.cartRemove(li.getAttribute('data-code')); });
    });

    root.querySelector('[data-cart-clear]').addEventListener('click', function () {
      B2B.store.cartClear();
      root.querySelector('.cart__title').focus();
    });

    // Карточка способа получения выбирается кликом или вводом в её поля, не только по радио
    cards.forEach(function (card) {
      var radio = card.querySelector('.radio-card__input');
      function pick() { if (!radio.checked) { radio.checked = true; update(); } }
      card.addEventListener('click', pick);
      card.addEventListener('focusin', pick);
    });
    root.querySelector('[data-cart-pickup]').addEventListener('input', update);
    root.querySelector('[data-cart-pickup]').addEventListener('change', update);

    submits.forEach(function (a) {
      // Оформленный заказ уходит на «Заказ принят» (order-done.js), корзина очищается
      a.addEventListener('click', function (e) {
        if (a.getAttribute('aria-disabled') === 'true') { e.preventDefault(); return; }
        var cart = B2B.store.get().cart;
        var codes = Object.keys(cart).filter(function (c) { return B2B.product(c); });
        var sum = codes.reduce(function (s, c) { return s + B2B.price(B2B.product(c)).value * cart[c]; }, 0);
        B2B.store.setting('lastOrder', { count: codes.length, sum: sum });
        B2B.store.cartClear();
      });
    });

    document.addEventListener('b2b:change', render);
    render();
  });
})();

/* ---- js/pages/catalog.js ---- */
/* Каталог [data-catalog]: вид «Таблица» или «Карточки», фильтры, сортировка, «Показать по»,
   пагинация; в таблице — колонки, выбор строк и проверка количества.
   Карточки и строки уже в разметке, у обоих data-n, data-code и data-f-<ключ> — значения
   фильтров через «|»; модуль только прячет и переставляет их.
   Фильтры: одно применённое состояние на оба вида. Сайдбар карточек — изменение пересчитывает
   «Показать N товаров», применяются по кнопке; панель над таблицей применяет выбор сразу.
   Фильтр в заголовке колонки таблицы — по «Применить», «Сбросить» снимает его сразу; ключи,
   которых нет в сайдбаре (код, штрихкод, цена), сайдбар не трогает. Несколько значений там,
   где в сайдбаре или панели выпадающий список, показываются «Все» и сохраняются, пока список
   не выбран заново. Фильтр по цене — по цене текущего пользователя, смена входа его снимает.
   Внутри фильтра значения объединяются «или», между фильтрами — «и».
   ?season=osen|vesna отмечает сезон и сразу применяет фильтр.
   Настройки: setting('perPage') — товаров на странице, setting('catalogView') — вид
   (table по умолчанию), setting('catalogCols') — скрытые колонки таблицы
   (по умолчанию — служебные).
   Панель выбранных (data-cat-selected-bar): появляется с первой отмеченной строкой, сумма —
   по цене текущего пользователя (priceOf) и значению степпера строки (qtyOf); сбрасывается
   вместе с чекбоксами при смене фильтров (apply → clearSelection).
   На телефоне (ДС 9.15): секции фильтров живут в двух местах — сайдбар «Карточки» и шторка
   #catalog-filters-sheet, filterPanels/filters/applyBtns работают с обоими сразу; счётчик
   на кнопке «Фильтры» и в шапке шторки — renderFilterCount (число групп фильтров, без цены).
   Панель корзины (data-cat-cart-panel) заменяет панель выбранных — там нет выбора строк,
   вместо этого фактическое содержимое B2B.store.cart, как у мини-корзины.
   Избранное (маршрут favorites, ДС 9.21): та же разметка со всеми товарами, отложенные —
   синтетический фильтр data-f-fav поверх matches(); сортировка «Дата добавления» — по порядку
   в B2B.store.favorites, новые первыми; вид — setting('favoritesView'), по умолчанию «Карточки»;
   пустой список — пустое состояние страницы [data-fav-empty]. */
(function () {
  'use strict';

  var B2B = window.B2B;
  var ALL = 'Все';

  function plural(n, one, few, many) {
    var m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return n + ' ' + one;
    if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return n + ' ' + few;
    return n + ' ' + many;
  }

  // Выбрать пункт селекта по подписи, не поднимая b2b:select
  function setSelect(root, text) {
    root.querySelectorAll('[role="option"]').forEach(function (o) {
      o.setAttribute('aria-selected', o.getAttribute('data-value') === text ? 'true' : 'false');
    });
    root.querySelector('[data-dropdown-value]').textContent = text;
  }

  B2B.on('[data-catalog]', function (root) {
    var grid = root.querySelector('[data-cat-grid]');
    if (!grid) return;   // раздел без товаров

    var tbody = root.querySelector('[data-cat-rows]');
    var table = root.querySelector('[data-cat-table]');
    var tableWrap = root.querySelector('[data-cat-table-wrap]');
    var lists = [
      { box: grid, items: [].slice.call(grid.querySelectorAll('.catalog__cell')) },
      { box: tbody, items: [].slice.call(tbody.querySelectorAll('.cat-table__row')) }
    ];
    var rows = lists[1].items;
    var sidebar = root.querySelector('[data-cat-filters]');
    var filterSheet = root.querySelector('#catalog-filters-sheet');
    var filterPanels = [sidebar, filterSheet].filter(Boolean);
    var filters = [].slice.call(root.querySelectorAll('[data-filter]'));
    var applyBtns = [].slice.call(root.querySelectorAll('[data-filters-apply]'));
    var bar = root.querySelector('[data-cat-bar]');
    var barItems = [].slice.call(bar.querySelectorAll('[data-bar-filter]'));
    var nones = root.querySelectorAll('[data-cat-none]');
    var pager = root.querySelector('[data-cat-pager]');
    var info = pager.querySelector('[data-pager-info]');
    var list = pager.querySelector('[data-pager-list]');
    var prev = pager.querySelector('[data-pager-prev]');
    var next = pager.querySelector('[data-pager-next]');
    var perTop = root.querySelector('#cat-per').closest('[data-dropdown]');
    var perBottom = root.querySelector('#cat-per-bottom').closest('[data-dropdown]');
    var perMobileEl = root.querySelector('#cat-per-mobile');
    var perMobile = perMobileEl && perMobileEl.closest('[data-dropdown]');
    var sortBox = root.querySelector('#cat-sort').closest('[data-dropdown]');

    var sideKeys = filters.map(function (f) { return f.getAttribute('data-filter'); });
    var xfItems = [].slice.call(table.querySelectorAll('[data-xf]'));

    // ---------------------------------------------------------------- поиск (прогон 16)
    // Страница результатов (маршрут search) переиспользует эту же разметку и модуль:
    // запрос из ?q= — синтетический фильтр data-f-q="1"/"0" поверх обычного движка matches(),
    // тем же приёмом, что уже применён к ?season= ниже. Блок целиком под гейтом searchMode,
    // остальной catalog.js не меняет поведение для catalog/category/subcategory.
    var searchMode = document.body.dataset.page === 'search';
    var query = searchMode ? (B2B.params.get('q') || '').trim() : '';
    var found = query ? B2B.searchMatch(query) : [];
    var foundByCode = {}, foundRank = {};
    found.forEach(function (m, i) { foundByCode[m.product.code] = m; foundRank[m.product.code] = i; });
    if (searchMode) {
      lists.forEach(function (l) {
        l.items.forEach(function (el) {
          el.setAttribute('data-f-q', foundByCode[el.getAttribute('data-code')] ? '1' : '0');
        });
      });
      // «По релевантности» — только для поиска, общий список сортировок каталога не трогаем
      var sortList = sortBox.querySelector('.menu__list');
      var sampleSort = sortList.querySelector('[role="option"]');
      var relOpt = sampleSort.cloneNode(true);
      relOpt.setAttribute('data-value', 'По релевантности');
      relOpt.querySelector('span').textContent = 'По релевантности';
      sortList.insertBefore(relOpt, sortList.firstChild);
    }

    // ---------------------------------------------------------------- избранное (прогон 26)
    var favMode = document.body.dataset.page === 'favorites';
    function favIndex(el) { return B2B.store.get().favorites.indexOf(el.getAttribute('data-code')); }
    function markFavorites() {
      lists.forEach(function (l) {
        l.items.forEach(function (el) { el.setAttribute('data-f-fav', favIndex(el) >= 0 ? '1' : '0'); });
      });
    }

    var applied = {};
    var touched = {};   // списки сайдбара, выбранные после последней синхронизации
    var sort = searchMode ? 'По релевантности' : (favMode ? 'Дата добавления' : 'По популярности');
    var per = Number(B2B.store.setting('perPage')) || 10;
    var page = 1;

    // ---------------------------------------------------------------- фильтры
    // Сайдбар и шторка видны по очереди, никогда вместе (десктоп/телефон), но оба всегда
    // в DOM — черновик считается только по элементам панели, которая реально редактируется,
    // иначе невидимая копия перетирала бы правки видимой (одинаковый data-filter в обеих).
    function panelFilters(panel) {
      return filters.filter(function (f) { return panel.contains(f); });
    }

    function readDraft(list) {
      list = list || filters;
      var draft = {};
      list.forEach(function (f) {
        var key = f.getAttribute('data-filter');
        var values = [];
        if (f.getAttribute('data-filter-kind') === 'facet') {
          f.querySelectorAll('input[type="checkbox"]:checked').forEach(function (c) { values.push(c.value); });
        } else {
          var v = f.querySelector('[data-dropdown-value]').textContent.trim();
          if (v !== ALL) values.push(v);
          else if (!touched[key] && (applied[key] || []).length > 1) values = applied[key].slice();
        }
        if (values.length) draft[key] = values;
      });
      // Фильтры колонок, которых в сайдбаре нет, остаются как были
      Object.keys(applied).forEach(function (key) {
        if (sideKeys.indexOf(key) < 0) draft[key] = applied[key];
      });
      return draft;
    }

    function matches(el, set) {
      return Object.keys(set).every(function (key) {
        var own = (el.getAttribute('data-f-' + key) || '').split('|');
        return set[key].some(function (v) { return own.indexOf(v) >= 0; });
      });
    }

    function countDraft(list) {
      var draft = readDraft(list);
      if (favMode) return;   // у избранного постоянная подпись «Применить фильтры»
      var n = rows.filter(function (r) { return matches(r, draft); }).length;
      var text = 'Показать ' + plural(n, 'товар', 'товара', 'товаров');
      applyBtns.forEach(function (b) { b.textContent = text; });
    }

    // Сайдбар по применённому состоянию: фасет — отмеченные значения, список — единственное
    function syncSidebar() {
      touched = {};
      filters.forEach(function (f) {
        var vals = applied[f.getAttribute('data-filter')] || [];
        f.querySelectorAll('input[type="checkbox"]').forEach(function (c) { c.checked = vals.indexOf(c.value) >= 0; });
        var dd = f.querySelector('[data-dropdown]');
        if (dd) setSelect(dd, vals.length === 1 ? vals[0] : ALL);
      });
      countDraft();
    }

    // Панель над таблицей: одно значение — его подпись, ни одного или несколько — «Все»
    function barValues(item) { return item.getAttribute('data-bar-values').split('|'); }
    function barLabels(item) {
      return [].slice.call(item.querySelectorAll('[role="option"]')).map(function (o) { return o.getAttribute('data-value'); }).slice(1);
    }
    function syncBar() {
      barItems.forEach(function (item) {
        var vals = applied[item.getAttribute('data-bar-filter')] || [];
        var i = vals.length === 1 ? barValues(item).indexOf(vals[0]) : -1;
        setSelect(item.querySelector('[data-dropdown]'), i >= 0 ? barLabels(item)[i] : ALL);
      });
    }

    // Фильтры колонок по применённому состоянию; у триггера — включён ли фильтр
    function syncExcel() {
      xfItems.forEach(function (item) {
        var vals = (applied[item.getAttribute('data-xf')] || []).map(String);
        item.querySelectorAll('[data-filter-value]').forEach(function (c) { c.checked = vals.indexOf(c.value) >= 0; });
        item.querySelector('.th-filter .visually-hidden').textContent = vals.length ? ', фильтр включён' : ', фильтр';
      });
    }

    // Счётчик на кнопке «Фильтры» и в шапке шторки (телефон, ДС 9.15): число применённых
    // групп фильтров, без цены — она не привязана к сайдбару/шторке. Поведение без источника.
    var mobileFiltersCount = root.querySelector('[data-cat-filters-count]');
    var sheetCount = filterSheet && filterSheet.querySelector('[data-sheet-count]');
    var mobileFiltersReset = root.querySelector('[data-mobile-filters-reset]');
    function renderFilterCount() {
      var n = Object.keys(applied).filter(function (k) { return k !== 'price' && k !== 'q' && k !== 'fav'; }).length;
      [mobileFiltersCount, sheetCount].forEach(function (el) {
        if (!el) return;
        el.textContent = n;
        el.hidden = n === 0;
      });
      // На выдаче поиска фильтры изначально не применены (query — не фильтр сайдбара),
      // поэтому «Сбросить фильтры» на телефоне не показывается, пока их не выбрали (ДС 9.18)
      if (searchMode) mobileFiltersReset.hidden = n === 0;
    }

    function apply(set) {
      applied = set;
      page = 1;
      clearSelection();
      syncExcel();
      renderFilterCount();
      render();
    }

    // Применить с любого входа и выставить остальные два
    function commit(set) {
      apply(set);
      syncSidebar();
      syncBar();
    }

    function reset() { commit(searchMode && query ? { q: ['1'] } : (favMode ? { fav: ['1'] } : {})); }

    filterPanels.forEach(function (panel) {
      var pf = panelFilters(panel);
      panel.addEventListener('change', function () { countDraft(pf); });
      panel.addEventListener('b2b:select', function (e) {
        var f = e.target.closest('[data-filter]');
        if (f) touched[f.getAttribute('data-filter')] = true;
        countDraft(pf);
      });
    });
    applyBtns.forEach(function (b) {
      var owner = filterPanels.filter(function (p) { return p.contains(b); })[0];
      b.addEventListener('click', function () { apply(readDraft(owner && panelFilters(owner))); syncBar(); });
    });
    sidebar.querySelector('[data-filters-reset]').addEventListener('click', reset);

    bar.addEventListener('b2b:select', function (e) {
      var item = e.target.closest('[data-bar-filter]');
      if (!item) return;
      var key = item.getAttribute('data-bar-filter');
      var i = barLabels(item).indexOf(e.detail.value);
      var set = Object.assign({}, applied);
      if (i >= 0) set[key] = [barValues(item)[i]]; else delete set[key];
      apply(set);
      syncSidebar();
    });
    bar.querySelector('[data-bar-reset]').addEventListener('click', reset);
    root.querySelector('[data-mobile-filters-reset]').addEventListener('click', reset);

    // ---------------------------------------------------------------- фильтры колонок
    xfItems.forEach(function (item) {
      var key = item.getAttribute('data-xf');
      var search = item.querySelector('[data-filter-search]');

      // Открытие — флажки из применённого состояния, поиск пустой: черновик без «Применить» не живёт
      item.addEventListener('b2b:open', function () {
        syncExcel();
        search.value = '';
        search.dispatchEvent(new Event('input'));
      });

      item.addEventListener('click', function (e) {
        var set = Object.assign({}, applied);
        if (e.target.closest('[data-dropdown-close]')) {
          var boxes = [].slice.call(item.querySelectorAll('[data-filter-value]:not(:disabled)'));
          var on = boxes.filter(function (c) { return c.checked; }).map(function (c) { return c.value; });
          if (on.length && on.length < boxes.length) set[key] = on; else delete set[key];
          commit(set);
        } else if (e.target.closest('[data-filter-reset]')) {
          delete set[key];
          commit(set);
          item.querySelector('[data-dropdown-trigger]').click();   // закрыть, фокус на заголовок
        }
      });
    });

    // Цена зависит от входа: значения фильтра и data-f-price считаются по текущей цене
    var priceXf = table.querySelector('[data-xf="price"]');
    function renderPrices() {
      var counts = {};
      lists.forEach(function (l, i) {
        l.items.forEach(function (el) {
          var v = String(priceOf(el));
          el.setAttribute('data-f-price', v);
          if (i === 1) counts[v] = (counts[v] || 0) + 1;
        });
      });
      if (!priceXf) return;
      var box = priceXf.querySelector('.menu__list');
      var sample = box.querySelector('label');
      box.innerHTML = '';
      Object.keys(counts).sort(function (a, b) { return a - b; }).forEach(function (v) {
        var row = sample.cloneNode(true);
        var input = row.querySelector('input');
        input.value = v;
        input.checked = false;
        input.setAttribute('data-filter-value', B2B.rub(Number(v)));
        var text = row.querySelector('.check__text');
        text.firstChild.nodeValue = B2B.rub(Number(v)) + ' ';
        text.querySelector('.check__count').textContent = '(' + counts[v] + ')';
        row.hidden = false;
        box.appendChild(row);
      });
    }

    // Поиск по значениям внутри фасета: прячет строки, в которых нет запроса
    root.querySelectorAll('[data-facet]').forEach(function (facet) {
      var search = facet.querySelector('input[type="search"]');
      if (!search) return;
      var more = facet.querySelector('[data-facet-toggle]');
      search.addEventListener('input', function () {
        var q = search.value.trim().toLowerCase();
        var open = more && more.getAttribute('aria-expanded') === 'true';
        facet.querySelectorAll('.facet__row').forEach(function (row) {
          var text = row.querySelector('.check__text').textContent.toLowerCase();
          var extra = row.hasAttribute('data-facet-extra');
          row.hidden = q ? text.indexOf(q) < 0 : (extra && !open);
        });
        if (more) more.hidden = !!q;
      });
    });

    // ---------------------------------------------------------------- сортировка
    function priceOf(el) {
      var p = B2B.product(el.getAttribute('data-code'));
      return p ? B2B.price(p).value : 0;
    }
    function nameOf(el) { return el.querySelector('.pcard__name, [data-name]').textContent.replace(/[«»"]/g, ''); }
    function rankOf(code) { return code in foundRank ? foundRank[code] : found.length; }

    function ordered(items) {
      var arr = items.slice();
      if (sort === 'Сначала дешевле') arr.sort(function (a, b) { return priceOf(a) - priceOf(b); });
      else if (sort === 'Сначала дороже') arr.sort(function (a, b) { return priceOf(b) - priceOf(a); });
      else if (sort === 'По названию') arr.sort(function (a, b) { return nameOf(a).localeCompare(nameOf(b), 'ru'); });
      else if (sort === 'По релевантности') arr.sort(function (a, b) {
        return rankOf(a.getAttribute('data-code')) - rankOf(b.getAttribute('data-code'));
      });
      else if (sort === 'Дата добавления') arr.sort(function (a, b) { return favIndex(b) - favIndex(a); });
      else arr.sort(function (a, b) { return a.getAttribute('data-n') - b.getAttribute('data-n'); });
      return arr;
    }

    sortBox.addEventListener('b2b:select', function (e) { sort = e.detail.value; page = 1; render(); });

    // ---------------------------------------------------------------- показать по
    function setPer(n) {
      per = n;
      setSelect(perTop, 'Показать по: ' + n);
      setSelect(perBottom, n + ' на странице');
      if (perMobile) setSelect(perMobile, 'Показать по: ' + n);
      B2B.store.setting('perPage', n);
      page = 1;
      render();
    }
    perTop.addEventListener('b2b:select', function (e) { setPer(parseInt(e.detail.value.replace(/\D/g, ''), 10)); });
    perBottom.addEventListener('b2b:select', function (e) { setPer(parseInt(e.detail.value, 10)); });
    if (perMobile) perMobile.addEventListener('b2b:select', function (e) { setPer(parseInt(e.detail.value.replace(/\D/g, ''), 10)); });

    // ---------------------------------------------------------------- пагинация
    // Номера страниц: до семи — все; дальше первая, последняя и окно у текущей
    function pageItems(total) {
      if (total <= 7) return Array.from({ length: total }, function (_, i) { return i + 1; });
      if (page <= 4) return [1, 2, 3, 4, 0, total];
      if (page >= total - 3) return [1, 0, total - 3, total - 2, total - 1, total];
      return [1, 0, page - 1, page, page + 1, 0, total];
    }

    function renderPages(total, focus) {
      list.innerHTML = '';
      pageItems(total).forEach(function (n) {
        var li = document.createElement('li');
        if (n === 0) {
          li.innerHTML = '<span class="cat-pager__gap" aria-hidden="true">…</span>';
        } else {
          var b = document.createElement('button');
          b.type = 'button';
          b.className = 'cat-pager__page';
          b.textContent = n;
          b.setAttribute('data-page-n', n);
          b.setAttribute('aria-label', 'Страница ' + n);
          if (n === page) b.setAttribute('aria-current', 'page');
          li.appendChild(b);
        }
        list.appendChild(li);
      });
      if (focus) {
        var cur = list.querySelector('[aria-current]');
        if (cur) cur.focus();
      }
    }

    function goTo(n, focus) {
      page = n;
      render(focus);
      root.querySelector('.catalog__title').scrollIntoView({ block: 'start' });
    }

    list.addEventListener('click', function (e) {
      var b = e.target.closest('[data-page-n]');
      if (b) goTo(Number(b.getAttribute('data-page-n')), true);
    });
    prev.addEventListener('click', function () { if (page > 1) goTo(page - 1); });
    next.addEventListener('click', function () { goTo(page + 1); });

    // ---------------------------------------------------------------- отрисовка
    function render(focus) {
      var total = 0, from = 0, pages = 1;
      lists.forEach(function (l, i) {
        var all = ordered(l.items);
        var shown = all.filter(function (el) { return matches(el, applied); });
        if (i === 0) {
          total = shown.length;
          pages = Math.max(1, Math.ceil(total / per));
          page = Math.min(Math.max(1, page), pages);
          from = (page - 1) * per;
        }
        all.forEach(function (el) { l.box.appendChild(el); el.hidden = true; });
        shown.slice(from, from + per).forEach(function (el) { el.hidden = false; });
      });

      grid.hidden = total === 0;
      tableWrap.hidden = total === 0;
      nones.forEach(function (n) { n.hidden = total > 0; });
      info.textContent = total
        ? 'Показано ' + (from + 1) + '–' + Math.min(from + per, total) + ' из ' + plural(total, 'товара', 'товаров', 'товаров')
        : 'Показано 0 из 0 товаров';
      renderPages(pages, focus);
      prev.disabled = page <= 1;
      next.disabled = page >= pages;
      renderSelection();
      if (searchMode && query) renderSearchState(total, pages);
      if (favMode) renderFavState();
    }

    // ---------------------------------------------------------------- поиск: состояние страницы
    // H1/подзаголовок, переключение результатов ⇄ «Ничего не найдено» (со своими крошками —
    // ДС и кадр search-empty расходятся с кадром выдачи: «Каталог товаров» вместо «Поиск»),
    // скрытие номеров пагинации на единственной странице (ДС 9.18).
    var subtitleEl = root.querySelector('[data-cat-subtitle]');
    var resultsBox = root.querySelector('[data-cat-results]');
    var ctaBox = document.querySelector('[data-search-cta]');
    var searchEmptyBox = document.querySelector('[data-search-empty]');
    var searchEmptyText = searchEmptyBox && searchEmptyBox.querySelector('.empty__text');
    var crumbsFound = document.querySelector('[data-search-crumbs="found"]');
    var crumbsEmptyBox = document.querySelector('[data-search-crumbs="empty"]');
    var pagerPages = pager.querySelector('.cat-pager__pages');

    function renderSearchState(total, pages) {
      if (subtitleEl) {
        subtitleEl.hidden = total === 0;
        if (total) subtitleEl.textContent = 'По запросу «' + query + '» найдено ' + plural(total, 'товар', 'товара', 'товаров');
      }
      if (resultsBox) resultsBox.hidden = total === 0;
      if (ctaBox) ctaBox.hidden = total === 0;
      if (searchEmptyBox) searchEmptyBox.hidden = total > 0;
      if (crumbsFound) crumbsFound.hidden = total === 0;
      if (crumbsEmptyBox) crumbsEmptyBox.hidden = total > 0;
      if (searchEmptyText && total === 0) {
        searchEmptyText.textContent = 'По вашему запросу «' + query + '» ничего не найдено. Попробуйте изменить запрос или воспользоваться подсказками ниже.';
      }
      if (pagerPages) pagerPages.hidden = pages <= 1;
    }

    // Сайдбар/панель — только встреченные по выдаче значения со счётчиками (ДС 9.18);
    // считает один раз по товарам с data-f-q="1" — запрос не меняется без перезагрузки.
    function renderSearchFacetCounts(flag) {
      var matchedRows = rows.filter(function (r) { return r.getAttribute('data-f-' + (flag || 'q')) === '1'; });
      root.querySelectorAll('.cat-filter[data-filter-kind="facet"]').forEach(function (filterEl) {
        var key = filterEl.getAttribute('data-filter');
        filterEl.querySelectorAll('.facet__row').forEach(function (row) {
          var box = row.querySelector('.check__input');
          var count = matchedRows.filter(function (r) {
            return (r.getAttribute('data-f-' + key) || '').split('|').indexOf(box.value) >= 0;
          }).length;
          var countEl = row.querySelector('.check__count');
          if (countEl) countEl.textContent = '(' + count + ')';
          box.disabled = count === 0;
          if (count === 0) row.hidden = true;
          else if (!row.hasAttribute('data-facet-extra')) row.hidden = false;
        });
      });
    }

    // ---------------------------------------------------------------- избранное: состояние страницы
    // Счётчик «В вашем списке N товаров», список ⇄ пустое состояние; в списках фильтров —
    // только значения, встреченные у отложенных товаров (счётчики фасетов — как у поиска).
    var favCount = document.querySelector('[data-fav-count]');
    var favEmpty = document.querySelector('[data-fav-empty]');
    var favListOnly = [].slice.call(document.querySelectorAll('[data-fav-list-only]'));

    function renderFavState() {
      var n = rows.filter(function (r) { return r.getAttribute('data-f-fav') === '1'; }).length;
      if (favCount) favCount.textContent = 'В вашем списке ' + plural(n, 'товар', 'товара', 'товаров');
      if (resultsBox) resultsBox.hidden = n === 0;
      if (favEmpty) favEmpty.hidden = n > 0;
      favListOnly.forEach(function (el) { el.hidden = n === 0; });
    }

    function renderFavCounts() {
      renderSearchFacetCounts('fav');
      var favRows = rows.filter(function (r) { return r.getAttribute('data-f-fav') === '1'; });
      function has(key, value) {
        return favRows.some(function (r) { return (r.getAttribute('data-f-' + key) || '').split('|').indexOf(value) >= 0; });
      }
      root.querySelectorAll('.cat-filter[data-filter-kind="select"]').forEach(function (f) {
        var key = f.getAttribute('data-filter');
        f.querySelectorAll('[role="option"]').forEach(function (o) {
          var v = o.getAttribute('data-value');
          o.hidden = v !== ALL && !has(key, v);
        });
      });
      barItems.forEach(function (item) {
        var key = item.getAttribute('data-bar-filter');
        var values = barValues(item);
        [].slice.call(item.querySelectorAll('[role="option"]')).slice(1).forEach(function (o, i) {
          o.hidden = !has(key, values[i]);
        });
      });
    }

    // Атрибуты категории (Тип товара/Вид животного/Бренд — korma; Культура — udobreniya)
    // показываются только когда вся выдача — одна категория; иначе только общий
    // набор _root (Производитель/Сезон/Наличие). Считает один раз по found.
    function applyCategoryScope() {
      var cats = {};
      found.forEach(function (m) { cats[m.product.category] = true; });
      var only = Object.keys(cats).length === 1 ? Object.keys(cats)[0] : null;
      root.querySelectorAll('[data-filter-scope]').forEach(function (el) {
        var show = el.getAttribute('data-filter-scope') === only;
        var wrap = el.closest('.acc__item') || el;
        wrap.hidden = !show;
      });
    }

    // Подсветка совпадения (ДС 9.18): один раз по всем найденным товарам во всех их
    // представлениях (карточка-сетка, карточка-строка, строка таблицы) — набор найденного
    // не меняется без перезагрузки страницы, повторный вызов задвоил бы <mark>.
    function wrapValue(el, value) {
      if (!el) return;
      var esc = String(value).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; });
      var html = el.innerHTML;
      var i = html.indexOf(esc);
      if (i < 0) return;
      el.innerHTML = html.slice(0, i) + '<mark class="search-hit">' + esc + '</mark>' + html.slice(i + esc.length);
    }
    function wrapName(el, name, index, len) {
      if (!el) return;
      function esc(s) { return s.replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
      el.innerHTML = esc(name.slice(0, index)) + '<mark class="search-hit">' + esc(name.slice(index, index + len)) + '</mark>' + esc(name.slice(index + len));
    }
    function applyHighlight() {
      rows.forEach(function (r) {
        var m = foundByCode[r.getAttribute('data-code')];
        if (!m) return;
        var code = r.getAttribute('data-code');
        var cell = grid.querySelector('.catalog__cell[data-code="' + code + '"]');
        var nameEls = [r.querySelector('[data-name]')].concat(cell ? [].slice.call(cell.querySelectorAll('.pcard__name')) : []);
        var codeEls = cell ? [].slice.call(cell.querySelectorAll('.pcard__code')) : [];
        if (m.field === 'name') {
          nameEls.forEach(function (el) { wrapName(el, m.product.name, m.index, query.length); });
        } else if (m.field === 'code') {
          wrapValue(r.querySelector('td[data-col="code"] .code-1c'), m.product.code);
          codeEls.forEach(function (el) { wrapValue(el, m.product.code); });
        } else if (m.field === 'barcode') {
          wrapValue(r.querySelector('td[data-col="barcode"] .code-1c'), m.product.barcode);
          codeEls.forEach(function (el) { wrapValue(el, m.product.barcode); });
        }
      });
    }

    // ---------------------------------------------------------------- вид
    var viewBox = root.querySelector('[data-cat-view]');
    function setView(v) {
      root.setAttribute('data-view', v);
      viewBox.querySelectorAll('[data-view]').forEach(function (b) {
        b.setAttribute('aria-pressed', b.getAttribute('data-view') === v ? 'true' : 'false');
      });
    }
    var viewSetting = favMode ? 'favoritesView' : 'catalogView';
    viewBox.addEventListener('click', function (e) {
      var b = e.target.closest('[data-view]');
      if (!b) return;
      setView(b.getAttribute('data-view'));
      B2B.store.setting(viewSetting, b.getAttribute('data-view'));
    });

    // ---------------------------------------------------------------- колонки
    var colsToggle = root.querySelector('[data-cols-toggle]');
    var colChecks = [].slice.call(root.querySelectorAll('[data-col-check]'));
    var service = [].slice.call(table.querySelectorAll('thead [data-col-service]')).map(function (th) { return th.getAttribute('data-col'); });
    var saved = B2B.store.setting('catalogCols');
    var hiddenCols = Array.isArray(saved) ? saved : service.slice();

    function renderCols() {
      table.querySelectorAll('[data-col]').forEach(function (el) {
        el.hidden = hiddenCols.indexOf(el.getAttribute('data-col')) >= 0;
      });
      var anyService = service.some(function (k) { return hiddenCols.indexOf(k) < 0; });
      table.setAttribute('data-cols', anyService ? 'full' : 'trade');
      colsToggle.textContent = anyService ? 'Скрыть служебные колонки' : 'Показать служебные колонки';
      colChecks.forEach(function (c) { c.checked = hiddenCols.indexOf(c.value) < 0; });
    }
    function saveCols() {
      B2B.store.setting('catalogCols', hiddenCols);
      renderCols();
    }

    colsToggle.addEventListener('click', function () {
      var anyService = service.some(function (k) { return hiddenCols.indexOf(k) < 0; });
      hiddenCols = hiddenCols.filter(function (k) { return service.indexOf(k) < 0; });
      if (anyService) hiddenCols = hiddenCols.concat(service);
      saveCols();
    });
    colChecks.forEach(function (c) {
      c.addEventListener('change', function () {
        hiddenCols = hiddenCols.filter(function (k) { return k !== c.value; });
        if (!c.checked) hiddenCols.push(c.value);
        saveCols();
      });
    });

    // ---------------------------------------------------------------- выбор строк
    var selectAll = table.querySelector('[data-select-all]');
    var selectedOut = root.querySelector('[data-cat-selected]');
    var selBar = root.querySelector('[data-cat-selected-bar]');
    var selCount = selBar.querySelector('[data-cat-selected-count]');
    var selSum = selBar.querySelector('[data-cat-selected-sum]');
    var selClear = selBar.querySelector('[data-cat-selected-clear]');
    var selCollapse = selBar.querySelector('[data-cat-selected-collapse]');

    function rowBox(r) { return r.querySelector('[data-select-row]'); }
    function qtyOf(r) {
      var el = r.querySelector('.stepper__value');
      var n = parseInt(el ? String(el.value).replace(/\D/g, '') : '', 10);
      return isNaN(n) ? 0 : n;
    }

    // Свёрнутая панель (ДС свёрнутое состояние не описывает) — только счётчики
    function setCollapsed(v) {
      selBar.classList.toggle('is-collapsed', v);
      selCollapse.setAttribute('aria-expanded', String(!v));
      selCollapse.setAttribute('aria-label', v ? 'Развернуть панель выбранных' : 'Свернуть панель выбранных');
    }

    function renderSelection() {
      var checked = rows.filter(function (r) { return rowBox(r).checked; });
      var n = checked.length;
      var visible = rows.filter(function (r) { return !r.hidden; });
      var on = visible.filter(function (r) { return rowBox(r).checked; }).length;
      selectAll.checked = visible.length > 0 && on === visible.length;
      selectAll.indeterminate = on > 0 && on < visible.length;
      selectedOut.textContent = 'Выбрано: ' + n;
      selectedOut.classList.toggle('is-on', n > 0);

      selCount.textContent = 'Выбрано товаров: ' + n;
      selSum.textContent = 'на сумму: ' + B2B.rub(checked.reduce(function (s, r) { return s + priceOf(r) * qtyOf(r); }, 0));
      root.classList.toggle('catalog--has-selected', n > 0);
      if (n > 0) selBar.hidden = false;
      else { selBar.hidden = true; setCollapsed(false); }
    }
    function clearSelection() { rows.forEach(function (r) { rowBox(r).checked = false; }); }

    tbody.addEventListener('change', function (e) { if (e.target.matches('[data-select-row]')) renderSelection(); });
    selectAll.addEventListener('change', function () {
      rows.forEach(function (r) { if (!r.hidden) rowBox(r).checked = selectAll.checked; });
      renderSelection();
    });
    selClear.addEventListener('click', function () { clearSelection(); renderSelection(); });
    selCollapse.addEventListener('click', function () { setCollapsed(!selBar.classList.contains('is-collapsed')); });

    // ---------------------------------------------------------------- количество в строке
    // Нарушение МЗП или кратности красит строку, «В корзину» гаснет (product-card.js
    // слушает то же b2b:qty на самой строке); под таблицей — сводная плашка
    var errorBox = root.querySelector('[data-cat-error]');
    var errorText = errorBox.querySelector('[data-cat-error-text]');

    function renderErrors() {
      var bad = rows.filter(function (r) { return r.hasAttribute('data-invalid'); });
      errorBox.hidden = bad.length === 0;
      errorText.textContent = bad.map(function (r) {
        var p = B2B.product(r.getAttribute('data-code'));
        return p.name + ' — от ' + p.min + ' ' + p.unit + ', кратно ' + p.step + ' ' + p.unit;
      }).join('; ');
    }

    tbody.addEventListener('b2b:qty', function (e) {
      var r = e.target.closest('.cat-table__row');
      if (e.detail.valid) r.removeAttribute('data-invalid'); else r.setAttribute('data-invalid', '');
      renderErrors();
      renderSelection();
    });

    // Вход и выход меняют цены: список фильтра цены пересобирается, сам фильтр снимается;
    // при сортировке по цене меняется и порядок
    document.addEventListener('b2b:change', function (e) {
      if (!e.detail || e.detail.reason !== 'user') return;
      renderPrices();
      if (applied.price) {
        var set = Object.assign({}, applied);
        delete set.price;
        commit(set);
      } else if (sort !== 'По популярности') render();
    });

    // На телефоне секции фильтров (сайдбар и шторка) стартуют свёрнутыми
    if (window.matchMedia('(width < 768px)').matches) {
      filterPanels.forEach(function (panel) {
        panel.querySelectorAll('.acc__head').forEach(function (h) {
          h.setAttribute('aria-expanded', 'false');
          document.getElementById(h.getAttribute('aria-controls')).hidden = true;
        });
      });
    }

    // ---------------------------------------------------------------- панель корзины (телефон)
    // Заменяет .cat-selected на мобильном (ДС 9.15): там нет выбора строк чекбоксами, поэтому
    // внизу — фактическое содержимое корзины, как у мини-корзины (js/ui/mini-cart.js), а не
    // сумма отмеченных. Появляется, когда в корзине есть товары.
    var cartPanel = root.querySelector('[data-cat-cart-panel]');
    var cartPanelCount = cartPanel.querySelector('[data-cat-cart-count]');
    var cartPanelSum = cartPanel.querySelector('[data-cat-cart-sum]');

    function renderCartPanel() {
      var cart = B2B.store.get().cart;
      var codes = Object.keys(cart).filter(function (c) { return B2B.product(c); });
      var sum = codes.reduce(function (s, c) { return s + B2B.price(B2B.product(c)).value * cart[c]; }, 0);
      cartPanelCount.textContent = 'В корзине ' + plural(codes.length, 'товар', 'товара', 'товаров');
      cartPanelSum.textContent = 'На сумму ' + B2B.rub(sum);
      cartPanel.hidden = codes.length === 0;
      root.classList.toggle('catalog--has-cart-panel', codes.length > 0);
    }
    document.addEventListener('b2b:change', renderCartPanel);

    // Избранное: снятое сердце убирает товар из списка сразу, очистка — из окна подтверждения
    if (favMode) {
      document.addEventListener('b2b:change', function (e) {
        if (!e.detail || e.detail.reason !== 'favorites') return;
        markFavorites();
        renderFavCounts();
        render();
      });
      document.querySelectorAll('[data-fav-clear]').forEach(function (b) {
        b.addEventListener('click', function () { B2B.store.favoritesClear(); });
      });
    }

    // ---------------------------------------------------------------- старт
    // data-view-lock (страница бренда, ДС 9.24): всегда «Карточки», не подчиняется
    // общей на все страницы каталога настройке catalogView.
    var savedView = B2B.store.setting(viewSetting);
    setView(root.getAttribute('data-view-lock') || (favMode ? (savedView === 'table' ? 'table' : 'cards') : (savedView === 'cards' ? 'cards' : 'table')));
    renderCols();
    renderPrices();
    renderCartPanel();
    if (per !== 10) {
      setSelect(perTop, 'Показать по: ' + per);
      setSelect(perBottom, per + ' на странице');
      if (perMobile) setSelect(perMobile, 'Показать по: ' + per);
    }
    var season = B2B.params.get('season');
    if (season) {
      var box = sidebar.querySelector('[data-filter="season"] input[value="' + season.replace(/[^a-z]/g, '') + '"]');
      if (box && !box.disabled) box.checked = true;
    }
    if (searchMode && query) {
      applied.q = ['1'];
      setSelect(sortBox, 'По релевантности');
      applyCategoryScope();
      renderSearchFacetCounts();
    }
    if (favMode) {
      markFavorites();
      applied.fav = ['1'];
      renderFavCounts();
    }
    apply(readDraft());
    syncSidebar();
    syncBar();
    if (searchMode && query) applyHighlight();
  });
})();

/* ---- js/pages/home.js ---- */
/* Главная: вкладки-чипы подборок [data-sol-chips] — выбран один чип (aria-pressed).
   В демо-данных одна подборка, поэтому ряд товаров при переключении не меняется.
   «Добавить подборку в заказ» [data-set-add]: коды подборки не входят в clientData
   (window.DEMO знает только products/brands/categories), поэтому список приходит
   с сервера через data-set-codes — тот же приём, что data-product-href в мини-корзине
   и подсказке поиска. По клику — весь набор в корзину, каждый товар по МЗП (своего
   степпера у кнопки нет). */
(function () {
  'use strict';

  var B2B = window.B2B;

  B2B.on('[data-sol-chips]', function (row) {
    row.addEventListener('click', function (e) {
      var chip = e.target.closest('.sol-chip');
      if (!chip) return;
      row.querySelectorAll('.sol-chip').forEach(function (c) { c.setAttribute('aria-pressed', c === chip ? 'true' : 'false'); });
    });
  });

  B2B.on('[data-set-add]', function (btn) {
    var codes = (btn.getAttribute('data-set-codes') || '').split(',').filter(Boolean);
    btn.addEventListener('click', function () {
      codes.forEach(function (code) {
        var p = B2B.product(code);
        if (p) B2B.store.cartSet(code, B2B.store.cartQty(code) + p.min);
      });
    });
  });
})();

/* ---- js/pages/order-done.js ---- */
/* «Заказ принят»: число позиций и суммы последнего оформленного заказа — setting('lastOrder')
   {count, sum}, его пишет корзина по «Оформить заказ» (cart.js). Без него остаются числа
   демо-данных из разметки. НДС справочно, уже в сумме: sum × 20 / 120, как в корзине. */
(function () {
  'use strict';

  var B2B = window.B2B;

  B2B.on('[data-order-done]', function (root) {
    var last = B2B.store.setting('lastOrder');
    if (!last || !last.count) return;
    root.querySelector('[data-done-count]').textContent = last.count;
    root.querySelector('[data-done-sum]').textContent = B2B.rub(last.sum);
    root.querySelector('[data-done-vat]').textContent = B2B.rub(last.sum * 20 / 120);
    root.querySelector('[data-done-total]').textContent = B2B.rub(last.sum);
  });
})();

/* ---- js/pages/orders.js ---- */
/* «Мои заказы» и детализация заказа.
   Список: поиск по номеру, ID и товару, «Период» — месяц, квартал, год от даты последнего
   заказа; фильтр действует во всех вкладках, «Заказы не найдены» — когда во вкладке пусто.
   ?tab=N — открыть вкладку N (ссылки групп статусов в сайдбаре кабинета).
   «Посмотреть состав →» раскрывает позиции под строкой.
   «Повторить заказ»: позиции исходного заказа прибавляются к корзине, товары «Нет в наличии»
   пропускаются; итог — в setting quickAdded, его показывает баннер корзины. */
(function () {
  'use strict';

  var B2B = window.B2B;
  var MONTHS = { 'Все время': 0, 'Месяц': 1, 'Квартал': 3, 'Год': 12 };

  function plural(n, one, few, many) {
    var m10 = n % 10, m100 = n % 100;
    return n + ' ' + (m10 === 1 && m100 !== 11 ? one : (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14) ? few : many));
  }

  function isoMinusMonths(iso, months) {
    var d = new Date(iso + 'T00:00:00');
    d.setMonth(d.getMonth() - months);
    return d.toISOString().slice(0, 10);
  }

  B2B.on('[data-orders]', function (root) {
    var search = document.querySelector('[data-orders-search]');
    var period = document.querySelector('[data-orders-period]');
    var info = root.querySelector('[data-orders-info]');
    var pages = root.querySelector('[data-orders-pages]');
    var perBox = root.querySelector('[data-orders-per]');
    var tabs = [].slice.call(root.querySelectorAll('[role="tab"]'));
    var dates = [].map.call(root.querySelectorAll('[data-order-row]'), function (r) { return r.getAttribute('data-date'); });
    var latest = dates.sort().pop();
    var months = 0, per = 10;

    function activePanel() {
      var tab = tabs.filter(function (t) { return t.getAttribute('aria-selected') === 'true'; })[0] || tabs[0];
      return document.getElementById(tab.getAttribute('aria-controls'));
    }

    function render() {
      var q = (search.value || '').trim().toLowerCase();
      var from = months ? isoMinusMonths(latest, months) : '';
      root.querySelectorAll('[data-orders-rows]').forEach(function (list) {
        var shown = 0;
        list.querySelectorAll('[data-order-row]').forEach(function (row) {
          var ok = (!q || row.getAttribute('data-search').indexOf(q) >= 0) && (!from || row.getAttribute('data-date') >= from);
          row.hidden = !ok;
          if (ok) shown++;
        });
        list.hidden = !shown;
        list.parentNode.querySelector('[data-orders-none]').hidden = !!shown;
      });
      var panel = activePanel();
      var list = panel.querySelector('[data-orders-rows]');
      var shown = list.querySelectorAll('[data-order-row]:not([hidden])').length;
      var total = (q || from) ? shown : parseInt(list.getAttribute('data-total'), 10);
      info.textContent = shown ? 'Показано 1–' + Math.min(shown, per) + ' из ' + plural(total, 'заказа', 'заказов', 'заказов') : 'Заказов не найдено';
      var count = Math.max(1, Math.ceil(total / per));
      pages.innerHTML = '';
      for (var i = 1; i <= count; i++) {
        var li = document.createElement('li');
        li.innerHTML = '<button class="cat-pager__page" type="button"' + (i === 1 ? ' aria-current="page"' : '') + '>' + i + '</button>';
        pages.appendChild(li);
      }
      root.querySelector('.cat-pager__pages .cat-pager__arrow:last-child').disabled = count < 2;
    }

    search.addEventListener('input', render);
    period.addEventListener('b2b:select', function (e) { months = MONTHS[e.detail.value] || 0; render(); });
    perBox.addEventListener('b2b:select', function (e) { per = parseInt(e.detail.value, 10) || 10; render(); });
    // Пересчёт после того, как tabs.js переключит вкладку
    var tablist = root.querySelector('[data-tabs]');
    function later() { setTimeout(render, 0); }
    tablist.addEventListener('click', later);
    tablist.addEventListener('keydown', later);

    var start = parseInt(B2B.params.get('tab'), 10);
    if (tabs[start]) {
      tabs.forEach(function (t, i) {
        t.setAttribute('aria-selected', i === start ? 'true' : 'false');
        t.tabIndex = i === start ? 0 : -1;
        document.getElementById(t.getAttribute('aria-controls')).hidden = i !== start;
      });
    }
    render();
  });

  B2B.on('[data-order-lines]', function (btn) {
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.getElementById(btn.getAttribute('aria-controls')).hidden = !open;
    });
  });

  B2B.on('[data-order-repeat]', function (btn) {
    btn.addEventListener('click', function () {
      var number = btn.getAttribute('data-order-repeat');
      var order = (B2B.data().orders || []).filter(function (o) { return o.number === number; })[0];
      if (!order || !order.detail) return;
      var added = 0, skipped = 0;
      order.detail.rows.forEach(function (r) {
        var p = B2B.product(r.code);
        if (!p || p.stock === 'none') { skipped++; return; }
        B2B.store.cartSet(r.code, B2B.store.cartQty(r.code) + r.src_qty);
        added++;
      });
      B2B.store.setting('quickAdded', { added: added, skipped: skipped, source: 'repeat' });
      location.href = btn.getAttribute('data-cart-href');
    });
  });
})();

/* ---- js/pages/product.js ---- */
/* Карточка товара [data-product]: цена (data-price — в блоке покупки и в компактной
   панели на телефоне, .pbuy-bar) пересчитывается по уровню пользователя (B2B.price,
   как у карточек каталога, product-card.js); «Цена по вашему соглашению» заменяет
   обычную подпись уровня, когда выигрывает индивидуальная цена. «В избранное» — через
   B2B.store, как сердце карточек. Плитки фасовки — обычные ссылки, JS не нужен.
   «В корзину» есть в двух местах — [data-purchase] и [data-buybar], каждое со своим
   степпером (панели не синхронизированы, это два независимых способа задать «сколько
   добавить»); клик прибавляет значение своего степпера к тому, что уже в корзине. */
(function () {
  'use strict';

  var B2B = window.B2B;

  function wireAdd(box, code, p) {
    var add = box && box.querySelector('[data-cart-add]');
    if (!add) return;
    box.addEventListener('b2b:qty', function (e) { add.disabled = !e.detail.valid; });
    add.addEventListener('click', function () {
      if (add.disabled || !p) return;
      var input = box.querySelector('[data-stepper] .stepper__value');
      var qty = input ? parseInt(input.value, 10) : p.min;
      if (!qty) return;
      B2B.store.cartSet(code, B2B.store.cartQty(code) + qty);
    });
  }

  B2B.on('[data-product]', function (root) {
    var purchase = root.querySelector('[data-purchase]');
    if (!purchase) return;
    var code = purchase.getAttribute('data-code');
    var p = B2B.product(code);
    var prices = root.querySelectorAll('[data-price]');
    var normal = root.querySelector('[data-level-normal]');
    var personal = root.querySelector('[data-level-personal]');
    var fav = root.querySelector('[data-fav-btn]');

    function render() {
      if (!p) return;
      var price = B2B.price(p);
      prices.forEach(function (el) { el.textContent = B2B.rub(price.value); });
      if (normal && personal) {
        normal.hidden = price.personal;
        personal.hidden = !price.personal;
      }
      if (fav) fav.setAttribute('aria-pressed', B2B.store.isFavorite(code) ? 'true' : 'false');
    }

    if (fav) fav.addEventListener('click', function () { B2B.store.toggleFavorite(code); });
    wireAdd(purchase, code, p);
    wireAdd(root.querySelector('[data-buybar]'), code, p);
    document.addEventListener('b2b:change', render);
    render();
  });
})();

/* ---- js/pages/profile.js ---- */
/* Профиль компании (ДС 9.21): реквизиты только на чтение; контактное лицо — «Редактировать»
   открывает форму вместо пар, «Сохранить» проверяет поля (ошибка у поля, фокус на первое
   неверное) и пишет setting('contact'), «Отмена» возвращает пары; смена пароля — проверка
   трёх полей и плашка успеха, поля очищаются. Отправки на сервер нет. Тексты ошибок — как
   у форм входа и регистрации (js/pages/auth.js). */
(function () {
  'use strict';

  var B2B = window.B2B;
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Проверить список [поле, текст ошибки или '']: ошибки у полей, фокус на первое неверное
  function check(pairs) {
    var first = null;
    pairs.forEach(function (p) {
      B2B.fieldError(p[0], p[1]);
      if (p[1] && !first) first = p[0];
    });
    if (first) first.focus();
    return !first;
  }

  B2B.on('[data-contact-card]', function (card) {
    var edit = card.querySelector('[data-contact-edit]');
    var view = card.querySelector('[data-contact-view]');
    var form = card.querySelector('[data-contact-form]');
    var inputs = {};
    form.querySelectorAll('[data-contact-field]').forEach(function (i) { inputs[i.getAttribute('data-contact-field')] = i; });

    function values() {
      var saved = B2B.store.setting('contact') || {};
      var out = {};
      card.querySelectorAll('[data-contact]').forEach(function (dd) {
        var k = dd.getAttribute('data-contact');
        if (!dd.hasAttribute('data-initial')) dd.setAttribute('data-initial', dd.textContent);
        out[k] = saved[k] || dd.getAttribute('data-initial');
      });
      return out;
    }

    function renderView() {
      var v = values();
      card.querySelectorAll('[data-contact]').forEach(function (dd) { dd.textContent = v[dd.getAttribute('data-contact')]; });
    }

    function setEditing(on) {
      view.hidden = on;
      form.hidden = !on;
      edit.hidden = on;
      edit.setAttribute('aria-expanded', String(on));
      if (on) {
        var v = values();
        Object.keys(inputs).forEach(function (k) { inputs[k].value = v[k]; B2B.fieldError(inputs[k], ''); });
        inputs.name.focus();
      } else {
        edit.focus();
      }
    }

    inputs.phone.addEventListener('input', function () {
      inputs.phone.value = B2B.phone.format(B2B.phone.digits(inputs.phone.value));
    });

    edit.addEventListener('click', function () { setEditing(true); });
    form.querySelector('[data-contact-cancel]').addEventListener('click', function () { setEditing(false); });
    form.addEventListener('keydown', function (e) { if (e.key === 'Escape') setEditing(false); });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = inputs.email.value.trim();
      var ok = check([
        [inputs.name, inputs.name.value.trim() ? '' : 'Укажите имя'],
        [inputs.phone, B2B.phone.digits(inputs.phone.value).length === 10 ? '' : 'Укажите номер телефона полностью'],
        [inputs.email, !email ? 'Укажите рабочую почту' : (EMAIL.test(email) ? '' : 'Проверьте адрес почты')]
      ]);
      if (!ok) return;
      var saved = {};
      Object.keys(inputs).forEach(function (k) { saved[k] = inputs[k].value.trim(); });
      B2B.store.setting('contact', saved);
      renderView();
      setEditing(false);
    });

    renderView();
  });

  B2B.on('[data-password-form]', function (form) {
    var current = form.querySelector('#password-current');
    var next = form.querySelector('#password-next');
    var repeat = form.querySelector('#password-repeat');
    var done = form.querySelector('[data-password-done]');

    form.addEventListener('input', function () { done.hidden = true; });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = next.value;
      var ok = check([
        [current, current.value ? '' : 'Укажите текущий пароль'],
        [next, v.length >= 8 && /\d/.test(v) && /\p{L}/u.test(v) ? '' : 'Минимум 8 символов, включая цифры и буквы'],
        [repeat, repeat.value === v ? '' : 'Пароли не совпадают']
      ]);
      done.hidden = !ok;
      if (!ok) return;
      [current, next, repeat].forEach(function (i) { i.value = ''; });
    });
  });
})();

/* ---- js/pages/quick-report.js ---- */
/* Отчёт проверки быстрого заказа [data-quick-report]. Строки приходят готовыми из
   data.quick_report, состояние правок живёт в памяти страницы:
   «Исправить» — выбранное количество становится запрошенным, строка готова;
   «Принять цену» — строка готова по новой цене; «Удалить из списка» — строки больше нет.
   После каждого действия пересчитываются сводка, счётчики фильтров и панель добавления.
   Фильтры: видны строки отмеченных групп, ни одной отметки — видны все; «Показать»
   дополнительно сужает до готовых или проблемных.
   «Добавить доступные товары в корзину» прибавляет готовые строки к корзине, запоминает
   для баннера корзины, сколько добавлено и сколько нет (setting quickAdded), и ведёт в корзину. */
(function () {
  'use strict';

  var B2B = window.B2B;
  var READY = { ok: true, price: true };
  var GROUP = { ok: 'ok', short: 'short', price: 'price', none: 'bad', missing: 'bad' };
  var SHOW = { 'все позиции': 'all', 'готовые к добавлению': 'ready', 'с проблемами': 'problems' };

  function plural(n, one, few, many) {
    var m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return one;
    if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
    return many;
  }

  function qtyText(n, unit) {
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + (unit ? ' ' + unit : '');
  }

  B2B.on('[data-quick-report]', function (root) {
    var report = B2B.data().quick_report || { rows: [] };
    var rows = {};
    report.rows.forEach(function (r) { rows[r.n] = Object.assign({}, r); });
    var loaded = report.rows.length;
    var show = 'all';

    var tableWrap = root.querySelector('[data-qr-table]');
    var none = root.querySelector('[data-qr-none]');
    var emptyBox = root.querySelector('[data-qr-empty]');
    var hint = root.querySelector('[data-qr-hint]');
    var add = root.querySelector('[data-qr-add]');
    var filters = [].slice.call(root.querySelectorAll('[data-qr-filter]'));

    function live() { return Object.keys(rows).map(function (k) { return rows[k]; }); }
    function rowEl(n) { return root.querySelector('[data-qr-row][data-n="' + n + '"]'); }
    function setText(sel, text) { var el = root.querySelector(sel); if (el) el.textContent = text; }

    function render() {
      var list = live();
      var ready = list.filter(function (r) { return READY[r.status]; });
      var groups = { ok: 0, short: 0, price: 0, bad: 0 };
      list.forEach(function (r) { groups[GROUP[r.status]]++; });

      setText('[data-qr-count="rows"]', loaded);
      setText('[data-qr-count="recognized"]', list.filter(function (r) { return r.status !== 'missing'; }).length);
      setText('[data-qr-count="ready"]', ready.length);
      setText('[data-qr-count="problems"]', list.length - ready.length);
      filters.forEach(function (input) {
        var count = input.closest('label').querySelector('.check__count');
        if (count) count.textContent = '(' + groups[input.value] + ')';
      });

      setText('[data-qr-ready-text]', ready.length + ' ' + plural(ready.length, 'позиция', 'позиции', 'позиций'));
      setText('[data-qr-total]', B2B.rub(ready.reduce(function (s, r) { return s + r.sum; }, 0)));
      add.disabled = ready.length === 0;

      // Видимость строк: отмеченные группы (ни одной — все) и «Показать»
      var checked = filters.filter(function (f) { return f.checked; }).map(function (f) { return f.value; });
      var shown = 0;
      list.forEach(function (r) {
        var inGroup = !checked.length || checked.indexOf(GROUP[r.status]) !== -1;
        var inShow = show === 'all' || (show === 'ready') === !!READY[r.status];
        var visible = inGroup && inShow;
        rowEl(r.n).hidden = !visible;
        if (visible) shown++;
      });

      var hasRows = list.length > 0;
      tableWrap.hidden = !hasRows;
      emptyBox.hidden = hasRows;
      none.hidden = !hasRows || shown > 0;
      hint.hidden = list.length === ready.length;
    }

    // Строка стала готовой: заливка и подпись результата, действие убирается
    function markReady(tr, r) {
      r.status = 'ok';
      tr.className = 'qr-row qr-row--ok';
      tr.setAttribute('data-status', 'ok');
      var result = tr.querySelector('[data-qr-result]');
      result.textContent = 'Готово';
      var action = tr.querySelector('.qr-fix, [data-qr-accept]');
      if (action) action.remove();
      result.tabIndex = -1;
      result.focus();
    }

    function cell(tr, name, label, html) {
      tr.querySelector('.qr-row__' + name).innerHTML = '<span class="qr-row__label">' + label + '</span>' + html;
    }

    root.addEventListener('click', function (e) {
      var tr = e.target.closest('[data-qr-row]');
      if (!tr) return;
      var r = rows[tr.getAttribute('data-n')];

      var fix = e.target.closest('[data-qr-fix]');
      if (fix) {
        var q = Number(fix.getAttribute('data-qr-fix'));
        r.requested = q;
        r.available = q;
        r.sum = q * r.price;
        cell(tr, 'req', 'Запрошено', qtyText(q, r.unit));
        cell(tr, 'avail', 'Доступно', qtyText(q, r.unit));
        cell(tr, 'sum', 'Сумма', B2B.rub(r.sum));
        markReady(tr, r);
        render();
        return;
      }

      if (e.target.closest('[data-qr-accept]')) {
        r.old_price = null;
        r.old_sum = null;
        cell(tr, 'price', 'Цена за ед.', B2B.rub(r.price));
        cell(tr, 'sum', 'Сумма', B2B.rub(r.sum));
        markReady(tr, r);
        render();
        return;
      }

      if (e.target.closest('[data-qr-remove]')) {
        // Фокус — на следующую видимую строку, иначе на предыдущую, иначе на сводку
        var next = tr.nextElementSibling;
        while (next && next.hidden) next = next.nextElementSibling;
        var prev = tr.previousElementSibling;
        while (prev && prev.hidden) prev = prev.previousElementSibling;
        var target = next || prev;
        delete rows[r.n];
        tr.remove();
        render();
        var focusEl = target ? target.querySelector('[data-qr-result]') : root.querySelector('.account__title');
        focusEl.tabIndex = -1;
        focusEl.focus();
      }
    });

    filters.forEach(function (f) { f.addEventListener('change', render); });
    root.querySelector('[data-qr-show]').addEventListener('b2b:select', function (e) {
      show = SHOW[e.detail.value] || 'all';
      render();
    });

    add.addEventListener('click', function () {
      var list = live();
      var ready = list.filter(function (r) { return READY[r.status] && B2B.product(r.code); });
      ready.forEach(function (r) {
        B2B.store.cartSet(r.code, B2B.store.cartQty(r.code) + r.requested);
      });
      B2B.store.setting('quickAdded', { added: ready.length, skipped: loaded - ready.length });
      window.location.href = add.getAttribute('data-cart-href');
    });

    render();
  });
})();

/* ---- js/pages/quick.js ---- */
/* Быстрый заказ: ?tab=paste открывает вкладку «Вставить список» без переноса фокуса.
   Файл не разбирается — перетаскивание гасит поведение браузера (иначе файл откроется
   во вкладке) и подсвечивает область атрибутом data-dragover. */
(function () {
  'use strict';

  var B2B = window.B2B;

  B2B.on('[data-quick]', function (root) {
    if (B2B.params.get('tab') === 'paste') {
      var tabs = [].slice.call(root.querySelectorAll('[role="tab"]'));
      tabs.forEach(function (t, i) {
        var on = i === 1;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
      });
    }

    var drop = root.querySelector('[data-quick-drop]');
    function off() { drop.removeAttribute('data-dragover'); }
    drop.addEventListener('dragover', function (e) { e.preventDefault(); drop.setAttribute('data-dragover', ''); });
    drop.addEventListener('dragleave', off);
    drop.addEventListener('drop', function (e) { e.preventDefault(); off(); });
  });
})();

/* ---- js/ui/00-layer.js ---- */
/* Наложения: выпадающие списки, поповеры, тултипы, окна и шторки.
   Открытое наложение регистрируется в стеке: Esc закрывает верхнее,
   клик вне закрывает немодальные сверху вниз, до первого модального.
   B2B.layer.fit(панель) сдвигает панель влево, если она вышла за правый край окна. */
(function () {
  'use strict';

  var B2B = window.B2B;
  var stack = [];
  var EDGE = 16;

  B2B.layer = {
    push: function (el, close, modal) {
      B2B.layer.remove(el);
      stack.push({ el: el, close: close, modal: !!modal });
    },
    remove: function (el) {
      stack = stack.filter(function (l) { return l.el !== el; });
    },
    fit: function (panel) {
      panel.style.left = '';
      var base = parseFloat(getComputedStyle(panel).left) || 0;
      var r = panel.getBoundingClientRect();
      var shift = 0;
      if (r.right > window.innerWidth - EDGE) shift = window.innerWidth - EDGE - r.right;
      if (r.left + shift < EDGE) shift = EDGE - r.left;
      if (shift) panel.style.left = (base + shift) + 'px';
    }
  };

  // Фокусируемые элементы внутри контейнера — для ловушки фокуса и первого фокуса
  B2B.focusables = function (root) {
    var sel = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    return [].slice.call(root.querySelectorAll(sel)).filter(function (el) {
      return !el.closest('[hidden]') && el.getClientRects().length > 0;
    });
  };

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape' || !stack.length) return;
    e.preventDefault();
    stack[stack.length - 1].close(true);
  });

  document.addEventListener('pointerdown', function (e) {
    for (var i = stack.length - 1; i >= 0; i--) {
      var l = stack[i];
      if (l.modal || l.el.contains(e.target)) break;
      l.close(false);
    }
  });
})();

/* ---- js/ui/accordion.js ---- */
/* Аккордеон: заголовок раскрывает и сворачивает свою секцию, остальные не трогает.
   Состояние секций сохраняется в пределах вкладки браузера (sessionStorage). */
(function () {
  'use strict';

  var B2B = window.B2B;
  var PREFIX = 'b2b-acc:' + (document.body.getAttribute('data-page') || '') + ':';

  function remember(id, open) {
    try { window.sessionStorage.setItem(PREFIX + id, open ? '1' : '0'); } catch (e) { /* без хранилища */ }
  }
  function recall(id) {
    try { return window.sessionStorage.getItem(PREFIX + id); } catch (e) { return null; }
  }

  B2B.on('.acc__head', function (head) {
    var body = document.getElementById(head.getAttribute('aria-controls'));
    var id = head.getAttribute('data-acc-id');

    function set(open) {
      head.setAttribute('aria-expanded', open ? 'true' : 'false');
      body.hidden = !open;
    }

    var saved = recall(id);
    if (saved !== null) set(saved === '1');

    head.addEventListener('click', function () {
      var open = head.getAttribute('aria-expanded') !== 'true';
      set(open);
      remember(id, open);
    });
  });
})();

/* ---- js/ui/account.js ---- */
/* Сайдбар кабинета и меню «Разделы кабинета»: «Выйти» — демо-выход, как в меню аккаунта
   шапки (header.js); у разделов account* после выхода — переход на главную (data-home). */
(function () {
  'use strict';

  var B2B = window.B2B;

  B2B.on('[data-account-nav], .account-sections', function (root) {
    root.querySelectorAll('[data-logout]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        B2B.store.logout();
        var home = btn.getAttribute('data-home');
        if (home) window.location.href = home;
      });
    });
  });
})();

/* ---- js/ui/call.js ---- */
/* Окно «Заказать звонок». Открывают все [data-call-open]: служебная строка, футер,
   блок «Нужна помощь?». Отправка без сервера: проверка имени, телефона и согласия,
   затем в том же окне — плашка успеха. После успеха следующее открытие начинает с пустой формы.
   ?call=sent — окно сразу открыто в состоянии успеха. */
(function () {
  'use strict';

  var B2B = window.B2B;
  var ID = 'call';

  function parts() {
    var dialog = document.getElementById(ID);
    if (!dialog) return null;
    return {
      form: dialog.querySelector('[data-call-form]'),
      done: dialog.querySelector('[data-call-success]')
    };
  }

  function validate(form) {
    var name = form.querySelector('#call-name');
    var phone = form.querySelector('#call-phone');
    var consent = form.querySelector('#call-consent');
    var checks = [
      [name, name.value.trim() ? '' : 'Укажите имя'],
      [phone, B2B.phone.digits(phone.value).length === 10 ? '' : 'Укажите номер телефона полностью'],
      [consent, consent.checked ? '' : 'Нужно согласие на обработку персональных данных']
    ];
    var first = null;
    checks.forEach(function (c) {
      B2B.fieldError(c[0], c[1]);
      if (c[1] && !first) first = c[0];
    });
    if (first) first.focus();
    return !first;
  }

  function showDone(p, done) {
    p.form.hidden = done;
    p.done.hidden = !done;
  }

  function reset(p) {
    p.form.reset();
    p.form.querySelectorAll('[aria-invalid]').forEach(function (el) { B2B.fieldError(el, ''); });
    showDone(p, false);
  }

  B2B.on('[data-call-form]', function (form) {
    var p = parts();
    var phone = form.querySelector('[data-phone]');

    phone.addEventListener('input', function () {
      phone.value = B2B.phone.format(B2B.phone.digits(phone.value));
    });

    form.addEventListener('input', function (e) {
      if (e.target.getAttribute('aria-invalid') === 'true') B2B.fieldError(e.target, '');
    });
    form.addEventListener('change', function (e) {
      if (e.target.type === 'checkbox' && e.target.checked) B2B.fieldError(e.target, '');
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validate(form)) return;
      showDone(p, true);
      var close = p.done.querySelector('[data-dialog-close]');
      if (close) close.focus();
    });

    if (B2B.params.get('call') === 'sent') {
      showDone(p, true);
      B2B.dialog.open(ID, document.querySelector('[data-call-open]'));
      var btn = p.done.querySelector('[data-dialog-close]');
      if (btn) btn.focus();
    }
  });

  B2B.on('[data-call-open]', function (trigger) {
    trigger.addEventListener('click', function (e) {
      e.preventDefault();
      var p = parts();
      if (!p) return;
      if (!p.done.hidden) reset(p);
      B2B.dialog.open(ID, trigger);
    });
  });
})();

/* ---- js/ui/carousel.js ---- */
/* Ряд карточек со стрелками (главная): [data-carousel] — секция, [data-carousel-track] —
   прокручиваемый ряд, [data-carousel-prev|next] — стрелки. Стрелка листает на одну
   карточку с промежутком; у края и когда ряд помещается целиком — отключена.
   На телефоне стрелки скрыты стилями, ряд листается пальцем. */
(function () {
  'use strict';

  var B2B = window.B2B;

  B2B.on('[data-carousel]', function (box) {
    var track = box.querySelector('[data-carousel-track]');
    var prev = box.querySelector('[data-carousel-prev]');
    var next = box.querySelector('[data-carousel-next]');
    if (!track || !prev || !next) return;

    function stepSize() {
      var item = track.firstElementChild;
      var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      return item ? item.getBoundingClientRect().width + gap : track.clientWidth;
    }

    function refresh() {
      var max = track.scrollWidth - track.clientWidth;
      prev.disabled = track.scrollLeft <= 1;
      next.disabled = track.scrollLeft >= max - 1;
    }

    prev.addEventListener('click', function () { track.scrollBy({ left: -stepSize() }); });
    next.addEventListener('click', function () { track.scrollBy({ left: stepSize() }); });
    track.addEventListener('scroll', refresh, { passive: true });
    window.addEventListener('resize', refresh);
    refresh();
  });
})();

/* ---- js/ui/catalog-menu.js ---- */
/* Меню каталога: кнопка «Каталог товаров» в шапке открывает панель #catalog-menu.
   Закрывают повторное нажатие, Esc (фокус возвращается на кнопку) и клик вне —
   через стек B2B.layer. Фокус заперт в панели. Категория с подкатегориями
   становится активной при наведении, фокусе или нажатии; стрелки ↑ ↓, Home, End
   ходят по списку, → и Enter — в правую часть, ← — обратно к категории.
   До 767 кнопка открывает не панель, а шторку #catalog-sheet (catalog-sheet.js);
   открытая панель закрывается, когда окно становится уже 768. */
(function () {
  'use strict';

  var B2B = window.B2B;

  B2B.on('[data-catalog-toggle]', function (toggle) {
    var panel = document.getElementById(toggle.getAttribute('aria-controls'));
    if (!panel) return;
    var cats = [].slice.call(panel.querySelectorAll('[data-menu-cat]'));
    // Для стека наложений «внутри» — и панель, и кнопка: клик по кнопке закрывает
    // меню её собственным обработчиком, а не как клик вне
    var zone = { contains: function (el) { return panel.contains(el) || toggle.contains(el); } };

    function isOpen() { return !panel.hidden; }
    function current() { return panel.querySelector('[data-menu-cat][aria-expanded="true"]'); }
    function section(cat) { return document.getElementById(cat.getAttribute('aria-controls')); }

    function activate(cat) {
      if (!cat || !cat.hasAttribute('aria-controls')) return;
      cats.forEach(function (c) {
        if (!c.hasAttribute('aria-controls')) return;
        var on = c === cat;
        c.setAttribute('aria-expanded', on ? 'true' : 'false');
        section(c).hidden = !on;
      });
    }

    function open() {
      panel.hidden = false;
      toggle.setAttribute('aria-expanded', 'true');
      B2B.layer.push(zone, close);
      (current() || cats[0]).focus();
    }

    function close(returnFocus) {
      if (!isOpen()) return;
      panel.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
      B2B.layer.remove(zone);
      if (returnFocus) toggle.focus();
    }

    var phone = window.matchMedia('(width < 768px)');

    toggle.addEventListener('click', function () {
      if (phone.matches) { B2B.dialog.open('catalog-sheet', toggle); return; }
      isOpen() ? close(true) : open();
    });
    phone.addEventListener('change', function () { if (phone.matches) close(false); });

    panel.addEventListener('pointerover', function (e) {
      if (e.pointerType === 'mouse') activate(e.target.closest('[data-menu-cat]'));
    });
    panel.addEventListener('focusin', function (e) {
      if (e.target.matches('[data-menu-cat]')) activate(e.target);
    });

    panel.addEventListener('keydown', function (e) {
      var el = document.activeElement;

      if (e.key === 'Tab') {
        var f = B2B.focusables(panel);
        if (e.shiftKey && el === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && el === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
        return;
      }

      var inCats = cats.indexOf(el) !== -1;
      var list = inCats ? cats : B2B.focusables(el.closest('.catalog-menu__section') || panel);
      var i = list.indexOf(el);
      var next = null;
      if (e.key === 'ArrowDown') next = list[Math.min(i + 1, list.length - 1)];
      else if (e.key === 'ArrowUp') next = list[Math.max(i - 1, 0)];
      else if (e.key === 'Home') next = list[0];
      else if (e.key === 'End') next = list[list.length - 1];
      else if (inCats && el.hasAttribute('aria-controls') && (e.key === 'ArrowRight' || e.key === 'Enter' || e.key === ' ')) {
        activate(el);
        next = B2B.focusables(section(el))[0];
      } else if (!inCats && e.key === 'ArrowLeft') next = current();
      if (next) { e.preventDefault(); next.focus(); }
    });

    // Фокус ушёл из меню мимо ловушки (Ctrl + / в поиск) — меню закрывается
    document.addEventListener('focusin', function (e) {
      if (isOpen() && !zone.contains(e.target)) close(false);
    });

    // Возврат на страницу кнопкой «Назад» — меню закрыто
    window.addEventListener('pageshow', function () { close(false); });
  });
})();

/* ---- js/ui/catalog-sheet.js ---- */
/* Меню каталога на телефоне: шторка #catalog-sheet. Открывают и закрывают dialog.js
   (кнопка «Каталог» шапки до 767 — через catalog-menu.js, пункт таб-бара — data-dialog-open).
   Категория с подкатегориями [data-sheet-open] показывает свой экран, «Назад» [data-sheet-back]
   возвращает к списку, фокус — на первую ссылку экрана или обратно на категорию.
   Каждое открытие начинается с первого экрана; от 768 открытая шторка закрывается. */
(function () {
  'use strict';

  var B2B = window.B2B;

  B2B.on('[data-catalog-sheet]', function (overlay) {
    var screens = [].slice.call(overlay.querySelectorAll('[data-sheet-screen]'));
    var root = screens[0];
    var from = null;

    function show(screen) {
      screens.forEach(function (s) { s.hidden = s !== screen; });
    }

    overlay.addEventListener('click', function (e) {
      var opener = e.target.closest('[data-sheet-open]');
      if (opener) {
        var screen = document.getElementById(opener.getAttribute('aria-controls'));
        from = opener;
        show(screen);
        var list = B2B.focusables(screen).filter(function (el) { return !el.matches('.btn-icon'); });
        if (list[0]) list[0].focus();
        return;
      }
      if (e.target.closest('[data-sheet-back]')) {
        show(root);
        if (from) from.focus();
      }
    });

    // Скрыта снова — следующее открытие с первого экрана
    new MutationObserver(function () {
      if (overlay.hidden) { show(root); from = null; }
    }).observe(overlay, { attributes: true, attributeFilter: ['hidden'] });

    var wide = window.matchMedia('(width >= 768px)');
    wide.addEventListener('change', function () {
      if (wide.matches && !overlay.hidden) B2B.dialog.close(overlay.id);
    });
  });
})();

/* ---- js/ui/chips.js ---- */
/* Чипы-фильтры: крестик снимает чип, «Сбросить все» ([data-chips-reset]) — все чипы ряда.
   Фокус переходит на соседний чип, а если чипов не осталось — на ряд.
   Изменение поднимает b2b:chips { count } на ряду [data-chips]. */
(function () {
  'use strict';

  var B2B = window.B2B;

  B2B.on('[data-chips]', function (row) {
    row.tabIndex = -1;

    function refresh() {
      var left = row.querySelectorAll('[data-chip]').length;
      var reset = row.querySelector('[data-chips-reset]');
      if (reset) reset.hidden = left === 0;
      row.dispatchEvent(new CustomEvent('b2b:chips', { bubbles: true, detail: { count: left } }));
    }

    row.addEventListener('click', function (e) {
      var remove = e.target.closest('[data-chip-remove]');
      if (remove) {
        var chip = remove.closest('[data-chip]');
        var sibling = chip.nextElementSibling;
        var next = sibling && sibling.matches('[data-chip]') ? sibling.querySelector('[data-chip-remove]') : null;
        chip.remove();
        (next || row.querySelector('[data-chip-remove]') || row).focus();
        refresh();
      }
      if (e.target.closest('[data-chips-reset]')) {
        row.querySelectorAll('[data-chip]').forEach(function (c) { c.remove(); });
        row.focus();
        refresh();
      }
    });
  });
})();

/* ---- js/ui/cookie.js ---- */
/* Уведомление о cookie: показывается, пока согласие не принято (B2B.store).
   «Принять» сохраняет согласие и прячет плашку; фокус уходит на содержимое страницы. */
(function () {
  'use strict';

  var B2B = window.B2B;

  B2B.on('[data-cookie]', function (bar) {
    if (B2B.store.cookieAccepted()) return;
    bar.hidden = false;
    bar.querySelector('[data-cookie-accept]').addEventListener('click', function () {
      B2B.store.acceptCookie();
      bar.hidden = true;
      var main = document.getElementById('main');
      if (main) main.focus({ preventScroll: true });
    });
  });
})();

/* ---- js/ui/copy.js ---- */
/* Копирование в буфер обмена: [data-copy="значение"] — icon_button('copy', …) у кода
   и штрихкода карточки товара. На ~1,5 с меняет иконку на check и подпись — на
   «Скопировано», потом возвращает исходные. */
(function () {
  'use strict';

  var B2B = window.B2B;

  B2B.on('[data-copy]', function (btn) {
    var use = btn.querySelector('use');
    var label = btn.getAttribute('aria-label');
    var timer = null;

    btn.addEventListener('click', function () {
      var value = btn.getAttribute('data-copy');
      if (!value || !navigator.clipboard) return;
      navigator.clipboard.writeText(value).then(function () {
        btn.classList.add('is-copied');
        btn.setAttribute('aria-label', 'Скопировано');
        if (use) use.setAttribute('href', B2B.iconsUrl + '#i-check');
        clearTimeout(timer);
        timer = setTimeout(function () {
          btn.classList.remove('is-copied');
          btn.setAttribute('aria-label', label);
          if (use) use.setAttribute('href', B2B.iconsUrl + '#i-copy');
        }, 1500);
      });
    });
  });
})();

/* ---- js/ui/dialog.js ---- */
/* Модальное окно и шторка. Открывает любая кнопка [data-dialog-open="id"]
   или B2B.dialog.open(id). Закрывают ✕ [data-dialog-close], Esc и клик по подложке.
   Фокус заперт внутри и возвращается на кнопку, которая открыла окно;
   страница под наложением не прокручивается (html[data-locked]). */
(function () {
  'use strict';

  var B2B = window.B2B;
  var openers = {};

  function openCount() { return document.querySelectorAll('[data-dialog]:not([hidden])').length; }

  function close(overlay, returnFocus) {
    if (overlay.hidden) return;
    overlay.hidden = true;
    B2B.layer.remove(overlay);
    if (!openCount()) document.documentElement.removeAttribute('data-locked');
    var opener = openers[overlay.id];
    if (returnFocus !== false && opener && document.contains(opener)) opener.focus();
  }

  function open(id, opener) {
    var overlay = document.getElementById(id);
    if (!overlay) return;
    openers[id] = opener || document.activeElement;
    overlay.hidden = false;
    document.documentElement.setAttribute('data-locked', '');
    B2B.layer.push(overlay, function () { close(overlay, true); }, true);
    var list = B2B.focusables(overlay.querySelector('[role="dialog"]'));
    // Первый фокус — не на ✕ в шапке: в окне подтверждения это «Отмена»
    var first = list.filter(function (el) { return !el.matches('.btn-icon[data-dialog-close]'); })[0] || list[0];
    if (first) first.focus();
  }

  B2B.dialog = {
    open: open,
    close: function (id) { var o = document.getElementById(id); if (o) close(o, true); }
  };

  B2B.on('[data-dialog-open]', function (btn) {
    btn.addEventListener('click', function () { open(btn.getAttribute('data-dialog-open'), btn); });
  });

  B2B.on('[data-dialog]', function (overlay) {
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay || e.target.closest('[data-dialog-close]')) close(overlay, true);
    });
    overlay.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var list = B2B.focusables(overlay.querySelector('[role="dialog"]'));
      if (!list.length) return;
      var first = list[0];
      var last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  });
})();

/* ---- js/ui/dropdown.js ---- */
/* Выпадающий список: селект, меню действий, Excel-фильтр.
   Разметка — components/ui/dropdown.html. Выбор в селекте поднимает событие
   b2b:select { value } на корне [data-dropdown]; открытие — b2b:open.
   data-dropdown-float — панель стоит над страницей по месту триггера и не обрезается
   прокручиваемым контейнером (заголовок таблицы); при прокрутке и смене размера окна
   панель идёт за триггером, а когда триггер уходит за край контейнера — закрывается. */
(function () {
  'use strict';

  var B2B = window.B2B;
  var GAP = 6, EDGE = 16;

  B2B.on('[data-dropdown]', function (root) {
    var kind = root.getAttribute('data-dropdown');
    var floating = root.hasAttribute('data-dropdown-float');
    var trigger = root.querySelector('[data-dropdown-trigger]');
    var panel = document.getElementById(trigger.getAttribute('aria-controls'));

    // Ближайший предок с горизонтальной прокруткой
    function scroller() {
      for (var el = root.parentElement; el && el !== document.body; el = el.parentElement) {
        if (getComputedStyle(el).overflowX !== 'visible') return el;
      }
      return null;
    }

    // Под триггером; не помещается снизу — над ним; по горизонтали — в окне с полями
    function place() {
      var t = trigger.getBoundingClientRect();
      var box = scroller();
      if (box) {
        var b = box.getBoundingClientRect();
        if (t.right <= b.left || t.left >= b.right) {
          var inside = panel.contains(document.activeElement);
          close(false);
          if (inside) trigger.focus({ preventScroll: true });
          return;
        }
      }
      panel.style.setProperty('--menu-min', t.width + 'px');   // не уже триггера
      var w = document.documentElement.clientWidth, h = window.innerHeight;
      var left = Math.max(EDGE, Math.min(t.left, w - EDGE - panel.offsetWidth));
      var top = t.bottom + GAP;
      if (top + panel.offsetHeight > h - EDGE && t.top - GAP - panel.offsetHeight >= EDGE) top = t.top - GAP - panel.offsetHeight;
      panel.style.left = left + 'px';
      panel.style.top = top + 'px';
    }
    function onScroll(e) { if (!panel.contains(e.target)) place(); }

    function items() {
      // Скрытые стилями пункты (например, «Ещё» навигации по категориям) не в счёт
      return [].slice.call(panel.querySelectorAll('[role="option"], [role="menuitem"]')).filter(function (el) {
        return el.getAttribute('aria-disabled') !== 'true' && el.getClientRects().length > 0;
      });
    }

    function isOpen() { return !panel.hidden; }

    function open() {
      panel.hidden = false;
      trigger.setAttribute('aria-expanded', 'true');
      root.dispatchEvent(new CustomEvent('b2b:open', { bubbles: true }));
      if (floating) {
        place();
        window.addEventListener('scroll', onScroll, true);
        window.addEventListener('resize', place);
      } else {
        B2B.layer.fit(panel);
      }
      B2B.layer.push(root, close);
      if (kind === 'filter') {
        var search = panel.querySelector('[data-filter-search]');
        if (search) search.focus({ preventScroll: true });
        return;
      }
      var list = items();
      var current = panel.querySelector('[aria-selected="true"]') || list[0];
      if (current) current.focus();
    }

    function close(returnFocus) {
      if (!isOpen()) return;
      panel.hidden = true;
      trigger.setAttribute('aria-expanded', 'false');
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', place);
      B2B.layer.remove(root);
      if (returnFocus) trigger.focus();
    }

    function choose(item) {
      if (kind === 'select') {
        panel.querySelectorAll('[role="option"]').forEach(function (o) {
          o.setAttribute('aria-selected', o === item ? 'true' : 'false');
        });
        var value = root.querySelector('[data-dropdown-value]');
        value.textContent = item.getAttribute('data-value');
        value.removeAttribute('data-empty');
        root.dispatchEvent(new CustomEvent('b2b:select', { bubbles: true, detail: { value: item.getAttribute('data-value') } }));
      }
      close(true);
    }

    trigger.addEventListener('click', function () { isOpen() ? close(true) : open(); });
    trigger.addEventListener('keydown', function (e) {
      if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && !isOpen()) { e.preventDefault(); open(); }
    });

    panel.addEventListener('click', function (e) {
      var item = e.target.closest('[role="option"], [role="menuitem"]');
      if (item && item.getAttribute('aria-disabled') !== 'true') choose(item);
      if (e.target.closest('[data-dropdown-close]')) close(true);
      if (e.target.closest('[data-filter-reset]')) {
        panel.querySelectorAll('input[type="checkbox"]:not(:disabled)').forEach(function (c) { c.checked = false; });
      }
    });

    panel.addEventListener('keydown', function (e) {
      if (e.key === 'Tab' && kind !== 'filter') { close(false); return; }
      var list = items();
      if (!list.length) return;
      var i = list.indexOf(document.activeElement);
      var next = null;
      if (e.key === 'ArrowDown') next = list[Math.min(i + 1, list.length - 1)];
      else if (e.key === 'ArrowUp') next = list[Math.max(i - 1, 0)];
      else if (e.key === 'Home') next = list[0];
      else if (e.key === 'End') next = list[list.length - 1];
      else if ((e.key === 'Enter' || e.key === ' ') && i >= 0) {
        e.preventDefault();
        // Меню действий: пункт срабатывает обычным кликом — ссылка переходит, кнопка
        // вызывает свой обработчик; закрывает панель обработчик клика ниже
        if (kind === 'menu') list[i].click(); else choose(list[i]);
        return;
      }
      if (next) { e.preventDefault(); next.focus(); }
    });

    // Excel-фильтр: поиск по значениям колонки
    var search = panel.querySelector('[data-filter-search]');
    if (search) {
      var empty = panel.querySelector('[data-filter-empty]');
      search.addEventListener('input', function () {
        var q = search.value.trim().toLowerCase();
        var shown = 0;
        panel.querySelectorAll('[data-filter-value]').forEach(function (input) {
          var row = input.closest('label');
          var hit = input.getAttribute('data-filter-value').toLowerCase().indexOf(q) !== -1;
          row.hidden = !hit;
          if (hit) shown++;
        });
        if (empty) empty.hidden = shown > 0;
      });
    }
  });
})();

/* ---- js/ui/facet.js ---- */
/* Фасет фильтра: «Показать ещё (N)» раскрывает значения после шестого, «Свернуть» прячет. */
(function () {
  'use strict';

  window.B2B.on('[data-facet-toggle]', function (btn) {
    var facet = btn.closest('[data-facet]');
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') !== 'true';
      facet.querySelectorAll('[data-facet-extra]').forEach(function (row) { row.hidden = !open; });
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.textContent = btn.getAttribute(open ? 'data-less' : 'data-more');
    });
  });
})();

/* ---- js/ui/field.js ---- */
/* Поля: счётчик символов многострочного поля «N / макс.» (data-count)
   и кнопка «Показать пароль» (data-reveal). */
(function () {
  'use strict';

  var B2B = window.B2B;

  B2B.on('[data-count]', function (input) {
    var out = document.getElementById(input.getAttribute('aria-describedby'));
    var max = input.getAttribute('maxlength');
    if (!out) return;
    function update() { out.textContent = input.value.length + ' / ' + max; }
    input.addEventListener('input', update);
    input.form && input.form.addEventListener('reset', function () { setTimeout(update, 0); });
    update();
  });

  // Показать и спрятать пароль: кнопка [data-reveal] в поле, aria-pressed и подпись меняются вместе с иконкой.
  B2B.on('[data-reveal]', function (btn) {
    var input = document.getElementById(btn.getAttribute('aria-controls'));
    var use = btn.querySelector('use');
    btn.addEventListener('click', function () {
      var show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      btn.setAttribute('aria-pressed', String(show));
      btn.setAttribute('aria-label', show ? 'Скрыть пароль' : 'Показать пароль');
      use.setAttribute('href', B2B.iconsUrl + '#i-' + (show ? 'eye-off' : 'eye'));
    });
  });
})();

/* ---- js/ui/gallery.js ---- */
/* Галерея карточки товара [data-gallery]: клик по миниатюре или стрелкам переключает
   активную (aria-current), у края стрелка отключена (тот же приём, что carousel.js).
   Реального фото нет — переключение видно по рамке миниатюры и озвучивается
   [data-gallery-status] для скринридера. */
(function () {
  'use strict';

  var B2B = window.B2B;

  B2B.on('[data-gallery]', function (box) {
    var thumbs = Array.prototype.slice.call(box.querySelectorAll('[data-thumb]'));
    var prev = box.querySelector('[data-gallery-prev]');
    var next = box.querySelector('[data-gallery-next]');
    var status = box.querySelector('[data-gallery-status]');
    if (!thumbs.length) return;
    var active = 0;

    function render() {
      thumbs.forEach(function (t, i) {
        if (i === active) t.setAttribute('aria-current', 'true');
        else t.removeAttribute('aria-current');
      });
      if (prev) prev.disabled = active === 0;
      if (next) next.disabled = active === thumbs.length - 1;
      if (status) status.textContent = 'Показано фото ' + (active + 1) + ' из ' + thumbs.length;
    }

    thumbs.forEach(function (t, i) {
      t.addEventListener('click', function () { active = i; render(); });
    });
    if (prev) prev.addEventListener('click', function () { if (active > 0) { active -= 1; render(); } });
    if (next) next.addEventListener('click', function () { if (active < thumbs.length - 1) { active += 1; render(); } });

    render();
  });
})();

/* ---- js/ui/header-search.js ---- */
/* Панель живых подсказок поиска [data-header] (ДС 9.18): debounce ввода в
   #header-search, B2B.searchMatch считает совпадения (код 1С, штрихкод — точно; название —
   подстрока), рендер мини-карточек из <template> данными window.DEMO (товар неизвестен при
   сборке), подсветка найденного, открытие/закрытие панели через B2B.layer (тот же стек, что
   у поповера и меню). Не строгий listbox/combobox — внутри строк интерактивные виджеты
   (степпер, кнопки), паттерн option такое не допускает; вместо этого — обычный Tab-порядок
   и aria-expanded/aria-controls на поле (поведение без источника, раздел 7 промта).
   Лимит панели — 5 карточек, остальное — по ссылке «Посмотреть все результаты (N)»
   (тоже без источника: кадр даёт пример только на одно совпадение).
   Кнопки корзины/избранного в подсказке — data-product-card, подключаются
   js/ui/product-card.js после B2B.boot() в конце render(). */
(function () {
  'use strict';

  var B2B = window.B2B;
  var LIMIT = 5;
  var DEBOUNCE = 200;

  var STOCK = {
    in: { cls: 'in', text: 'В наличии' },
    order: { cls: 'order', text: 'Под заказ' },
    none: { cls: 'none', text: 'Нет в наличии' }
  };

  function plural(n, one, few, many) {
    var m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return n + ' ' + one;
    if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return n + ' ' + few;
    return n + ' ' + many;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; });
  }

  function markAll(text) { return '<mark class="search-hit">' + escapeHtml(text) + '</mark>'; }

  // Оборачивает первое вхождение query в text подсветкой; вне совпадения — просто текст
  function highlight(text, query) {
    var i = String(text).toLowerCase().indexOf(query.toLowerCase());
    if (i < 0) return escapeHtml(text);
    return escapeHtml(text.slice(0, i)) + markAll(text.slice(i, i + query.length)) + escapeHtml(text.slice(i + query.length));
  }

  B2B.on('[data-header]', function (root) {
    var form = root.querySelector('[data-search]');
    if (!form) return;
    var input = form.querySelector('#header-search');
    var clearBtn = form.querySelector('[data-search-clear]');
    var kbd = form.querySelector('.header__kbd');
    var panel = form.querySelector('[data-search-suggest]');
    var countEl = panel.querySelector('[data-search-suggest-count]');
    var list = panel.querySelector('[data-search-suggest-list]');
    var emptyBox = panel.querySelector('[data-search-suggest-empty]');
    var emptyText = panel.querySelector('[data-search-suggest-empty-text]');
    var more = panel.querySelector('[data-search-suggest-more]');
    var tpl = panel.querySelector('[data-search-suggest-row]');
    var timer = null;

    // Адрес товара — образец ссылки на первый товар, slug подменяется (приём mini-cart.js)
    var productHref = panel.getAttribute('data-product-href');
    var productSlug = panel.getAttribute('data-product-slug');
    function productUrl(p) { return productHref.replace(productSlug, p.slug); }

    function close(focusReturn) {
      if (panel.hidden) return;
      panel.hidden = true;
      input.setAttribute('aria-expanded', 'false');
      B2B.layer.remove(panel);
      if (focusReturn) input.focus();
    }

    function open() {
      if (!panel.hidden) return;
      panel.hidden = false;
      input.setAttribute('aria-expanded', 'true');
      B2B.layer.push(panel, close, false);
    }

    function makeRow(m, q) {
      var p = m.product;
      var li = tpl.content.firstElementChild.cloneNode(true);
      var href = productUrl(p);
      li.setAttribute('data-code', p.code);
      li.querySelector('.search-suggest__photo').setAttribute('href', href);
      var name = li.querySelector('[data-search-suggest-name]');
      name.setAttribute('href', href);
      name.innerHTML = m.field === 'name' ? highlight(p.name, q) : escapeHtml(p.name);
      var codeEl = li.querySelector('[data-search-suggest-code]');
      codeEl.innerHTML = 'Код: ' + (m.field === 'code' ? highlight(p.code, q) : escapeHtml(p.code))
        + ' ШК: ' + (m.field === 'barcode' ? highlight(p.barcode, q) : escapeHtml(p.barcode));
      var tags = li.querySelector('[data-search-suggest-tags]');
      [p.type, Array.isArray(p.animals) ? p.animals[0] : ''].filter(Boolean).forEach(function (t) {
        var span = document.createElement('span');
        span.className = 'badge badge--tag';
        span.textContent = t;
        tags.appendChild(span);
      });
      var s = STOCK[p.stock] || STOCK.none;
      var stockEl = li.querySelector('[data-search-suggest-stock]');
      stockEl.className = 'search-suggest__stock search-suggest__stock--' + s.cls;
      stockEl.querySelector('[data-search-suggest-stock-text]').textContent = s.text;
      var price = B2B.price(p);
      li.querySelector('[data-search-suggest-price]').textContent = B2B.rub(price.value) + ' / ' + p.unit;
      li.querySelector('[data-search-suggest-min]').textContent = 'от ' + p.min + ' ' + p.unit;

      var off = p.stock === 'none';
      var id = 'search-suggest-qty-' + p.code;
      var stWrap = li.querySelector('[data-stepper]');
      stWrap.setAttribute('data-min', p.min);
      stWrap.setAttribute('data-step', p.step);
      stWrap.setAttribute('data-unit', p.unit);
      var stInput = stWrap.querySelector('.stepper__value');
      stInput.id = id;
      stInput.name = id;
      stInput.value = p.min;
      stInput.setAttribute('aria-label', 'Количество, ' + p.unit + ': ' + p.name);
      stInput.setAttribute('aria-describedby', id + '-note');
      stWrap.querySelector('[data-step-note]').id = id + '-note';
      var down = stWrap.querySelector('[data-step-down]');
      var up = stWrap.querySelector('[data-step-up]');
      down.setAttribute('aria-label', 'Уменьшить на ' + p.step + ' ' + p.unit);
      up.setAttribute('aria-label', 'Увеличить на ' + p.step + ' ' + p.unit);
      var addBtn = li.querySelector('[data-cart-add]');
      var favBtn = li.querySelector('[data-fav]');
      favBtn.setAttribute('aria-label', 'В избранное: ' + p.name);
      if (off) { stInput.disabled = true; down.disabled = true; up.disabled = true; addBtn.disabled = true; }
      return li;
    }

    function render(q) {
      var found = q ? B2B.searchMatch(q) : [];
      list.innerHTML = '';
      if (!q) { close(); return; }
      if (!found.length) {
        countEl.hidden = true;
        list.hidden = true;
        more.hidden = true;
        emptyBox.hidden = false;
        emptyText.textContent = 'По вашему запросу «' + q + '» ничего не найдено. Попробуйте изменить запрос или воспользоваться подсказками ниже.';
        open();
        return;
      }
      emptyBox.hidden = true;
      list.hidden = false;
      var exact = found.length === 1 && found[0].field !== 'name';
      if (exact) {
        var val = found[0].field === 'code' ? found[0].product.code : found[0].product.barcode;
        var label = found[0].field === 'code' ? 'коду 1С' : 'штрихкоду';
        countEl.innerHTML = 'Найден 1 товар по ' + label + ' «' + markAll(val) + '»';
      } else {
        countEl.innerHTML = 'По запросу «' + markAll(q) + '» найдено ' + plural(found.length, 'товар', 'товара', 'товаров');
      }
      countEl.hidden = false;
      found.slice(0, LIMIT).forEach(function (m) { list.appendChild(makeRow(m, q)); });
      B2B.boot();
      more.setAttribute('href', form.getAttribute('action') + '?q=' + encodeURIComponent(q));
      more.textContent = 'Посмотреть все результаты (' + found.length + ')';
      more.hidden = false;
      open();
    }

    function syncClear() {
      var has = !!input.value.trim();
      clearBtn.hidden = !has;
      if (kbd) kbd.hidden = has;
    }

    input.addEventListener('input', function () {
      syncClear();
      clearTimeout(timer);
      var q = input.value.trim();
      timer = setTimeout(function () { render(q); }, DEBOUNCE);
    });
    input.addEventListener('focus', function () { if (input.value.trim()) render(input.value.trim()); });
    clearBtn.addEventListener('click', function () {
      input.value = '';
      syncClear();
      close(true);
    });

    var qParam = B2B.params.get('q');
    if (qParam && !input.value) input.value = qParam;
    syncClear();
  });
})();

/* ---- js/ui/header.js ---- */
/* Шапка полная: счётчики избранного и корзины из B2B.store (в шапке и таб-баре),
   Ctrl + / и пункт «Поиск» таб-бара — в поле поиска, пустой запрос не отправляется,
   «Выйти» — выход из демо-входа.
   Меню аккаунта открывает dropdown.js; гость и клиент переключаются по html[data-user]. */
(function () {
  'use strict';

  var B2B = window.B2B;

  // Счётчик [data-counter] в шапке и таб-баре: число из store, ноль скрыт,
  // число — в aria-label ссылки (у пункта таб-бара основа — data-counted)
  B2B.on('[data-counter]', function (el) {
    var host = el.closest('a, button');
    var base = host.getAttribute('data-counted') || host.getAttribute('aria-label').split(':')[0];
    var kind = el.getAttribute('data-counter');
    function paint() {
      var n = kind === 'cart' ? B2B.store.cartCount() : B2B.store.favoritesCount();
      el.textContent = n;
      el.hidden = n === 0;
      if (n) host.setAttribute('aria-label', base + ': ' + n);
      else if (host.hasAttribute('data-counted')) host.removeAttribute('aria-label');
      else host.setAttribute('aria-label', base);
    }
    paint();
    document.addEventListener('b2b:change', paint);
  });

  // «Поиск» таб-бара: к шапке и фокус в поле; на страницах без поля в шапке — страница поиска
  B2B.on('[data-tab-search]', function (btn) {
    btn.addEventListener('click', function () {
      var input = document.getElementById('header-search');
      if (!input) { window.location.href = btn.getAttribute('data-href'); return; }
      window.scrollTo(0, 0);
      input.focus();
      input.select();
    });
  });

  B2B.on('[data-header]', function (header) {
    var form = header.querySelector('[data-search]');
    var input = form && form.querySelector('input[name="q"]');
    if (form) {
      form.addEventListener('submit', function (e) {
        if (!input.value.trim()) { e.preventDefault(); input.focus(); }
      });
      document.addEventListener('keydown', function (e) {
        if ((e.ctrlKey || e.metaKey) && (e.key === '/' || e.code === 'Slash')) {
          e.preventDefault();
          input.focus();
          input.select();
        }
      });
    }

    var logout = header.querySelector('[data-logout]');
    if (logout) {
      logout.addEventListener('click', function () {
        B2B.store.logout();
        var home = logout.getAttribute('data-home');
        if (home) window.location.href = home;
      });
    }
  });
})();

/* ---- js/ui/mini-cart.js ---- */
/* Мини-корзина [data-mini-cart]: заголовок «N товаров на S ₽», первые три позиции
   корзины из B2B.store, «Итого». Цена позиции — по уровню пользователя (B2B.price).
   Степпер позиции меняет количество (cartSet), ✕ убирает позицию (cartRemove).
   Строки не пересоздаются при каждом изменении: у степпера в фокусе значение не сбивается.
   Пустая корзина — подсказка вместо списка, «Перейти в корзину» отключена. */
(function () {
  'use strict';

  var B2B = window.B2B;
  var SHOWN = 3;

  function plural(n, one, few, many) {
    var m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return n + ' ' + one;
    if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return n + ' ' + few;
    return n + ' ' + many;
  }

  B2B.on('[data-mini-cart]', function (root) {
    var list = root.querySelector('[data-mcart-list]');
    var tpl = root.querySelector('[data-mcart-row]');
    var count = root.querySelector('[data-mcart-count]');
    var empty = root.querySelector('[data-mcart-empty]');
    var totalRow = root.querySelector('[data-mcart-total-row]');
    var total = root.querySelector('[data-mcart-total]');
    var go = root.querySelector('[data-mcart-go]');
    // Адрес товара: образец ссылки на первый товар, slug подменяется
    var href = root.getAttribute('data-product-href');
    var slug = root.getAttribute('data-product-slug');

    function lineSum(p, qty) { return B2B.price(p).value * qty; }

    function makeRow(p) {
      var li = tpl.content.firstElementChild.cloneNode(true);
      var id = 'mcart-qty-' + p.code;
      li.setAttribute('data-code', p.code);
      var name = li.querySelector('[data-mcart-name]');
      name.textContent = p.name;
      name.href = href.replace(slug, p.slug);
      li.querySelector('[data-mcart-pack]').textContent = p.pack;

      var st = li.querySelector('[data-stepper]');
      st.setAttribute('data-min', p.min);
      st.setAttribute('data-step', p.step);
      st.setAttribute('data-unit', p.unit);
      var input = st.querySelector('.stepper__value');
      input.id = id;
      input.name = id;
      input.value = B2B.store.cartQty(p.code);
      input.setAttribute('aria-label', 'Количество, ' + p.unit + ': ' + p.name);
      input.setAttribute('aria-describedby', id + '-note');
      st.querySelector('[data-step-note]').id = id + '-note';
      st.querySelector('[data-step-down]').setAttribute('aria-label', 'Уменьшить на ' + p.step + ' ' + p.unit);
      st.querySelector('[data-step-up]').setAttribute('aria-label', 'Увеличить на ' + p.step + ' ' + p.unit);
      st.addEventListener('b2b:qty', function (e) {
        if (e.detail.valid && e.detail.value !== B2B.store.cartQty(p.code)) B2B.store.cartSet(p.code, e.detail.value);
      });

      var remove = li.querySelector('[data-mcart-remove]');
      remove.setAttribute('aria-label', 'Удалить из корзины: ' + p.name);
      remove.addEventListener('click', function () {
        B2B.store.cartRemove(p.code);
        var first = root.querySelector('[data-mcart-remove]');
        (first || count).focus();
      });
      return li;
    }

    function render() {
      var cart = B2B.store.get().cart;
      var codes = Object.keys(cart).filter(function (c) { return B2B.product(c); });
      var sum = codes.reduce(function (s, c) { return s + lineSum(B2B.product(c), cart[c]); }, 0);
      var shown = codes.slice(0, SHOWN);

      [].slice.call(list.children).forEach(function (li) {
        if (shown.indexOf(li.getAttribute('data-code')) < 0) li.remove();
      });
      shown.forEach(function (code, i) {
        var p = B2B.product(code);
        var li = list.querySelector('[data-code="' + code + '"]') || makeRow(p);
        if (list.children[i] !== li) list.insertBefore(li, list.children[i] || null);
        var price = B2B.price(p);
        li.querySelector('[data-mcart-unit]').textContent = B2B.rub(price.value) + ' / ' + p.unit;
        li.querySelector('[data-mcart-sum]').textContent = B2B.rub(lineSum(p, cart[code]));
        var input = li.querySelector('.stepper__value');
        if (document.activeElement !== input && Number(input.value) !== cart[code]) input.value = cart[code];
      });
      B2B.boot();   // степперы новых строк

      count.textContent = plural(codes.length, 'товар', 'товара', 'товаров') + (codes.length ? ' на ' + B2B.rub(sum) : '');
      total.textContent = B2B.rub(sum);
      totalRow.hidden = !codes.length;
      empty.hidden = codes.length > 0;
      if (codes.length) { go.removeAttribute('aria-disabled'); go.removeAttribute('tabindex'); }
      else { go.setAttribute('aria-disabled', 'true'); go.setAttribute('tabindex', '-1'); }
    }

    go.addEventListener('click', function (e) { if (go.getAttribute('aria-disabled') === 'true') e.preventDefault(); });
    document.addEventListener('b2b:change', render);
    render();
  });
})();

/* ---- js/ui/popover.js ---- */
/* Тултип — при наведении и фокусе, закрывается сам и по Esc.
   Поповер — по клику, закрывается ✕, Esc и кликом вне; не выходит за край окна. */
(function () {
  'use strict';

  var B2B = window.B2B;

  B2B.on('[data-tooltip]', function (anchor) {
    var tip = anchor.querySelector('[role="tooltip"]');
    function show() { tip.hidden = false; B2B.layer.fit(tip); B2B.layer.push(anchor, hide); }
    function hide() { tip.hidden = true; B2B.layer.remove(anchor); }
    anchor.addEventListener('mouseenter', show);
    anchor.addEventListener('mouseleave', function () { if (!anchor.contains(document.activeElement)) hide(); });
    anchor.addEventListener('focusin', show);
    anchor.addEventListener('focusout', hide);
  });

  B2B.on('[data-popover]', function (anchor) {
    var trigger = anchor.querySelector('[data-popover-trigger]');
    var panel = document.getElementById(trigger.getAttribute('aria-controls'));

    function open() {
      panel.hidden = false;
      trigger.setAttribute('aria-expanded', 'true');
      B2B.layer.fit(panel);
      B2B.layer.push(anchor, close);
    }
    function close(returnFocus) {
      if (panel.hidden) return;
      panel.hidden = true;
      trigger.setAttribute('aria-expanded', 'false');
      B2B.layer.remove(anchor);
      if (returnFocus) trigger.focus();
    }

    trigger.addEventListener('click', function () { if (panel.hidden) open(); else close(true); });
    panel.querySelector('[data-popover-close]').addEventListener('click', function () { close(true); });
  });
})();

/* ---- js/ui/product-card.js ---- */
/* Карточка товара [data-product-card data-code]: цена по уровню пользователя
   (гость — Базовый опт, клиент — Средний или индивидуальная ниже, B2B.price)
   и сердце «В избранное» ([data-fav], aria-pressed) через B2B.store. Та же разметка —
   у строки таблицы каталога и у карточки в подсказке поиска; цена с data-price-bare —
   без «/ ед.». «В корзину» [data-cart-add] прибавляет количество из степпера рядом
   (вариант compact без степпера — прибавляет МЗП) к тому, что уже в корзине: степпер
   тут не отражает содержимое корзины, а задаёт «сколько добавить». Невалидное
   количество (b2b:qty от [data-stepper]) гасит кнопку. */
(function () {
  'use strict';

  var B2B = window.B2B;

  B2B.on('[data-product-card]', function (card) {
    var code = card.getAttribute('data-code');
    var p = B2B.product(code);
    var sum = card.querySelector('[data-price]');
    var fav = card.querySelector('[data-fav]');
    var add = card.querySelector('[data-cart-add]');
    var qtyInput = card.querySelector('[data-stepper] .stepper__value');

    function render() {
      if (p && sum) sum.textContent = B2B.rub(B2B.price(p).value) + (sum.hasAttribute('data-price-bare') ? '' : ' / ' + p.unit);
      if (fav) {
        var on = B2B.store.isFavorite(code);
        fav.setAttribute('aria-pressed', on ? 'true' : 'false');
        fav.setAttribute('aria-label', (on ? 'Убрать из избранного: ' : 'В избранное: ') + (p ? p.name : ''));
      }
    }

    if (fav) fav.addEventListener('click', function () { B2B.store.toggleFavorite(code); });
    if (add) {
      card.addEventListener('b2b:qty', function (e) { add.disabled = !e.detail.valid; });
      add.addEventListener('click', function () {
        if (add.disabled || !p) return;
        var qty = qtyInput ? parseInt(qtyInput.value, 10) : p.min;
        if (!qty) return;
        B2B.store.cartSet(code, B2B.store.cartQty(code) + qty);
      });
    }
    document.addEventListener('b2b:change', render);
    render();
  });
})();

/* ---- js/ui/range.js ---- */
/* Слайдер диапазона: поля «от» и «до» связаны с ручками. Ручки тянутся мышью
   и пальцем, с клавиатуры — стрелками с шагом 1 % диапазона, Home и End.
   Ручки не заходят друг за друга. Изменение поднимает b2b:range { from, to }. */
(function () {
  'use strict';

  var B2B = window.B2B;

  B2B.on('[data-range]', function (root) {
    var min = Number(root.getAttribute('data-min'));
    var max = Number(root.getAttribute('data-max'));
    var span = max - min || 1;
    var step = Math.max(1, Math.round(span / 100));
    var track = root.querySelector('[data-range-track]');
    var fill = root.querySelector('[data-range-fill]');
    var thumbs = { from: root.querySelector('[data-thumb="from"]'), to: root.querySelector('[data-thumb="to"]') };
    var fields = { from: root.querySelector('[data-range-from]'), to: root.querySelector('[data-range-to]') };
    var value = { from: Number(fields.from.value) || min, to: Number(fields.to.value) || max };

    function pct(v) { return (v - min) / span * 100; }

    function render() {
      thumbs.from.style.left = pct(value.from) + '%';
      thumbs.to.style.left = pct(value.to) + '%';
      fill.style.left = pct(value.from) + '%';
      fill.style.right = (100 - pct(value.to)) + '%';
      ['from', 'to'].forEach(function (k) {
        thumbs[k].setAttribute('aria-valuenow', value[k]);
        thumbs[k].setAttribute('aria-valuetext', B2B.rub(value[k]));
      });
    }

    function set(which, v, syncField) {
      v = Math.round(Math.min(max, Math.max(min, v)));
      v = which === 'from' ? Math.min(v, value.to) : Math.max(v, value.from);
      value[which] = v;
      if (syncField !== false) fields[which].value = v;
      render();
      root.dispatchEvent(new CustomEvent('b2b:range', { bubbles: true, detail: { from: value.from, to: value.to } }));
    }

    function fromPointer(x) {
      var r = track.getBoundingClientRect();
      return min + Math.min(1, Math.max(0, (x - r.left) / r.width)) * span;
    }

    ['from', 'to'].forEach(function (which) {
      var t = thumbs[which];
      var field = fields[which];

      t.addEventListener('pointerdown', function (e) {
        e.preventDefault();
        e.stopPropagation();
        t.setPointerCapture(e.pointerId);
        t.setAttribute('data-drag', '');
        t.focus();
      });
      t.addEventListener('pointermove', function (e) {
        if (t.hasAttribute('data-drag')) set(which, fromPointer(e.clientX));
      });
      t.addEventListener('pointerup', function () { t.removeAttribute('data-drag'); });
      t.addEventListener('pointercancel', function () { t.removeAttribute('data-drag'); });
      t.addEventListener('keydown', function (e) {
        var d = { ArrowRight: step, ArrowUp: step, ArrowLeft: -step, ArrowDown: -step, PageUp: step * 10, PageDown: -step * 10 }[e.key];
        if (d) { e.preventDefault(); set(which, value[which] + d); }
        if (e.key === 'Home') { e.preventDefault(); set(which, min); }
        if (e.key === 'End') { e.preventDefault(); set(which, max); }
      });

      field.addEventListener('input', function () {
        var n = parseInt(field.value.replace(/\D/g, ''), 10);
        if (!isNaN(n)) set(which, n, false);
      });
      field.addEventListener('blur', function () { field.value = value[which]; });
    });

    // Клик по треку двигает ближайшую ручку
    track.addEventListener('pointerdown', function (e) {
      var v = fromPointer(e.clientX);
      var which = Math.abs(v - value.from) <= Math.abs(v - value.to) ? 'from' : 'to';
      set(which, v);
      thumbs[which].focus();
    });

    render();
  });
})();

/* ---- js/ui/stepper.js ---- */
/* Степпер количества: старт с МЗП, ± на кратность, ручной ввод округляется вверх
   до кратности при потере фокуса. Значение меньше МЗП не поднимается само:
   поле получает aria-invalid, под степпером — подпись с требуемым количеством.
   Каждое изменение поднимает b2b:qty { value, valid } на корне [data-stepper]. */
(function () {
  'use strict';

  var B2B = window.B2B;

  B2B.on('[data-stepper]', function (root) {
    var min = Number(root.getAttribute('data-min'));
    var step = Number(root.getAttribute('data-step')) || 1;
    var unit = root.getAttribute('data-unit') || '';
    var input = root.querySelector('.stepper__value');
    var note = root.querySelector('[data-step-note]');

    function ceilStep(n) { return Math.ceil(n / step) * step; }

    function current() {
      var n = parseInt(String(input.value).replace(/\D/g, ''), 10);
      return isNaN(n) ? 0 : n;
    }

    function set(value) {
      var valid = value >= min && value % step === 0;
      input.value = value;
      if (valid) {
        input.removeAttribute('aria-invalid');
        note.hidden = true;
        note.textContent = '';
      } else {
        input.setAttribute('aria-invalid', 'true');
        note.hidden = false;
        note.textContent = 'Минимум ' + min + ' ' + unit;
      }
      root.dispatchEvent(new CustomEvent('b2b:qty', { bubbles: true, detail: { value: value, valid: valid } }));
    }

    function up() {
      var n = current();
      set(n < min ? min : ceilStep(n) + (n % step === 0 ? step : 0));
    }
    function down() { set(Math.max(min, ceilStep(current()) - step)); }

    root.querySelector('[data-step-down]').addEventListener('click', down);
    root.querySelector('[data-step-up]').addEventListener('click', up);
    input.addEventListener('blur', function () {
      if (!input.disabled) set(ceilStep(current()));
    });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); input.blur(); }
      if (e.key === 'ArrowUp') { e.preventDefault(); up(); }
      if (e.key === 'ArrowDown') { e.preventDefault(); down(); }
    });

    // Начальное значение из разметки проверяется сразу: ошибка видна без клика
    if (!input.disabled) set(current());
  });
})();

/* ---- js/ui/tabs.js ---- */
/* Вкладки: клик, стрелки влево и вправо, Home и End. Активная вкладка —
   aria-selected="true" и tabindex 0; её панель без hidden, остальные скрыты.
   Ряд, который не помещается, прокручивается к активной вкладке. */
(function () {
  'use strict';

  var B2B = window.B2B;

  B2B.on('[data-tabs]', function (list) {
    var tabs = [].slice.call(list.querySelectorAll('[role="tab"]'));

    function select(tab) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        var panel = document.getElementById(t.getAttribute('aria-controls'));
        if (panel) panel.hidden = !on;
      });
      tab.focus();
      var left = tab.offsetLeft - list.offsetLeft;
      if (left < list.scrollLeft || left + tab.offsetWidth > list.scrollLeft + list.clientWidth) list.scrollLeft = left;
    }

    list.addEventListener('click', function (e) {
      var tab = e.target.closest('[role="tab"]');
      if (tab) select(tab);
    });

    list.addEventListener('keydown', function (e) {
      var i = tabs.indexOf(document.activeElement);
      if (i < 0) return;
      var next = {
        ArrowRight: tabs[(i + 1) % tabs.length],
        ArrowLeft: tabs[(i - 1 + tabs.length) % tabs.length],
        Home: tabs[0],
        End: tabs[tabs.length - 1]
      }[e.key];
      if (next) { e.preventDefault(); select(next); }
    });
  });
})();
