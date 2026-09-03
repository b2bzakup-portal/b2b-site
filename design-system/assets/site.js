/* Дизайн-система b2bzakup.ru — поведение страницы согласования.
 * Две вещи: подсветка активного раздела в боковом меню и лайтбокс референсов. */

(function () {
  'use strict';

  /* --- Подсветка активного раздела -------------------------------------- */

  var toc = document.getElementById('toc');
  if (toc) {
    var links = Array.prototype.slice.call(toc.querySelectorAll('a'));
    var sections = links
      .map(function (a) { return document.querySelector(a.getAttribute('href')); })
      .filter(Boolean);

    if (sections.length) {
      /* Активен последний раздел, чей верх уже прошёл линию под шапкой.
       * Так подсветка совпадает с тем, что человек читает, и не отстаёт на шаг. */
      var LINE = 140;
      var ticking = false;

      var setActive = function () {
        ticking = false;
        var active = sections[0];
        for (var i = 0; i < sections.length; i++) {
          if (sections[i].getBoundingClientRect().top <= LINE) active = sections[i];
        }
        links.forEach(function (a) {
          a.classList.toggle('is-active', a.getAttribute('href') === '#' + active.id);
        });
      };

      var onScroll = function () {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(setActive);
      };

      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll);
      setActive();
    }
  }

  /* --- Лайтбокс --------------------------------------------------------- */

  var lightbox = document.getElementById('lightbox');
  if (!lightbox) return;

  var frames = Array.prototype.slice.call(document.querySelectorAll('.ref__frame'));
  if (!frames.length) return;

  var img = lightbox.querySelector('.lightbox__img');
  var caption = lightbox.querySelector('.lightbox__caption');
  var counter = lightbox.querySelector('.lightbox__counter');
  var current = 0;
  var lastFocused = null;

  function show(index) {
    current = (index + frames.length) % frames.length;
    var frame = frames[current];
    var thumb = frame.querySelector('img');
    img.src = thumb.getAttribute('src');
    img.alt = thumb.getAttribute('alt');
    caption.textContent = frame.getAttribute('data-title') || '';
    counter.textContent = (current + 1) + ' / ' + frames.length;
  }

  function open(index) {
    lastFocused = document.activeElement;
    show(index);
    lightbox.setAttribute('open', '');
    document.body.style.overflow = 'hidden';
    lightbox.querySelector('.lightbox__close').focus();
  }

  function close() {
    lightbox.removeAttribute('open');
    document.body.style.overflow = '';
    img.removeAttribute('src');
    if (lastFocused) lastFocused.focus();
  }

  frames.forEach(function (frame, i) {
    frame.addEventListener('click', function (event) {
      event.preventDefault();
      open(i);
    });
  });

  lightbox.querySelector('.lightbox__close').addEventListener('click', close);
  lightbox.querySelector('.lightbox__nav--prev').addEventListener('click', function () { show(current - 1); });
  lightbox.querySelector('.lightbox__nav--next').addEventListener('click', function () { show(current + 1); });

  lightbox.addEventListener('click', function (event) {
    if (event.target === lightbox) close();
  });

  document.addEventListener('keydown', function (event) {
    if (!lightbox.hasAttribute('open')) return;
    if (event.key === 'Escape') close();
    else if (event.key === 'ArrowLeft') show(current - 1);
    else if (event.key === 'ArrowRight') show(current + 1);
  });

  /* Свайп на тач-экранах: стрелки на телефоне мелкие, листать удобнее жестом */
  var touchX = null;

  lightbox.addEventListener('touchstart', function (event) {
    touchX = event.changedTouches[0].clientX;
  }, { passive: true });

  lightbox.addEventListener('touchend', function (event) {
    if (touchX === null) return;
    var dx = event.changedTouches[0].clientX - touchX;
    touchX = null;
    if (Math.abs(dx) < 50) return;
    show(dx < 0 ? current + 1 : current - 1);
  });
})();
