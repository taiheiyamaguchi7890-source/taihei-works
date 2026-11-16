/* Harukaze Works ― main.js（v3 2026-11-16）
   作法（小杉結型）：IO threshold 0・rootMargin -6%／html.js のときだけ隠す／3秒の保険／
   reduced-motion で即表示（画面の入れ替わりはフェードで続ける）／画面外とタブ非表示で止める */
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in window;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- 数え上がるカウンター（事実の数字「150」） ---------- */
  function countUp(el) {
    var to = parseInt(el.getAttribute('data-count'), 10) || 0;
    if (reduce) { el.textContent = to; return; }
    var t0 = null, dur = 2000;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(to * e);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var counters = $$('[data-count]');
  if (!reduce) counters.forEach(function (c) { c.textContent = '0'; });

  /* ---------- 表示の動き ---------- */
  var shows = $$('.a03e,.m01e');
  function show(el) {
    if (el.classList.contains('is-in')) return;
    el.classList.add('is-in');
    $$('[data-count]', el).forEach(countUp);
  }
  if (reduce || !hasIO) { shows.forEach(show); }
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { io.unobserve(e.target); show(e.target); } });
    }, { threshold: 0, rootMargin: '0px 0px -6% 0px' });
    shows.forEach(function (el) { io.observe(el); });
    // 保険：画面に入っている・上へ通り過ぎたものは必ず出す
    var sweep = function () {
      var lim = innerHeight * 0.94;
      shows.forEach(function (el) { if (!el.classList.contains('is-in') && el.getBoundingClientRect().top < lim) show(el); });
    };
    setTimeout(sweep, 3000);
    var sw = false;
    addEventListener('scroll', function () { if (!sw) { sw = true; setTimeout(function () { sw = false; sweep(); }, 400); } }, { passive: true });
    addEventListener('resize', sweep);
    addEventListener('load', sweep);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(sweep);
  }

  /* ---------- 進め方の線：00 の番号から 05 の番号までの長さにする ---------- */
  var fl = $('.flow__line');
  if (fl) {
    var fitLine = function () {
      // 浮かび上がりの移動に影響されないよう offsetTop で測る
      var nos = $$('.flow__no');
      if (nos.length < 2) return;
      var y = function (n) { return n.parentNode.offsetTop + n.offsetTop; };
      var a = y(nos[0]), z = y(nos[nos.length - 1]);
      fl.style.top = (a + nos[0].offsetHeight / 2) + 'px';
      fl.style.height = (z - a) + 'px';
      fl.style.bottom = 'auto';
    };
    fitLine(); addEventListener('resize', fitLine); addEventListener('load', fitLine);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitLine);
  }

  /* ---------- ヘッダー：下にスクロールで隠れ、上に戻すと出る ---------- */
  var hd = $('#hd'), lastY = scrollY;
  if (hd) {
    var onScroll = function () {
      var y = scrollY;
      hd.classList.toggle('is-bg', y > 24);
      if (!document.documentElement.classList.contains('menu-open')) {
        hd.classList.toggle('is-hide', y > 200 && y > lastY);
      }
      lastY = y;
    };
    addEventListener('scroll', onScroll, { passive: true }); onScroll();
  }
  var menu = $('.hd__menu'), sp = $('#spnav');
  if (menu && sp) {
    var setMenu = function (o) {
      menu.setAttribute('aria-expanded', o ? 'true' : 'false'); sp.hidden = !o;
      document.documentElement.classList.toggle('menu-open', o); document.body.style.overflow = o ? 'hidden' : '';
    };
    menu.addEventListener('click', function () { setMenu(menu.getAttribute('aria-expanded') !== 'true'); });
    $$('a', sp).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  }

  /* ---------- 画像の読み込みに失敗したら、淡い面で代える ---------- */
  $$('img').forEach(function (img) {
    img.addEventListener('error', function () { if (img.parentNode) img.parentNode.classList.add('photo-empty'); });
  });

  /* ---------- ヒーロー：開幕・画面の入れ替わり・止めるボタン・奥行き ---------- */
  var hero = $('#hero');
  if (!hero) return;
  var phs = $$('.hero__ph', hero), cur = 0, timer = null, armed = false, vis = true, paused = false;
  var btn = $('.hero__pause', hero);
  function next() {
    if (phs.length < 2) return;
    var j = (cur + 1) % phs.length;
    var img = $('img', phs[j]); if (img && img.loading === 'lazy') img.loading = 'eager';
    phs.forEach(function (p) { p.classList.remove('is-prev'); });
    phs[cur].classList.remove('is-on', 'is-anim'); phs[cur].classList.add('is-prev');
    void phs[j].offsetWidth; phs[j].classList.add('is-on', 'is-anim'); cur = j;
  }
  function start() { if (armed && !timer && vis && !paused && !document.hidden) timer = setInterval(next, 7500); }
  function stop() { if (timer) { clearInterval(timer); timer = null; } }
  function arm() { armed = true; stop(); start(); }
  // 2枚目以降を先に読み込んでおく（入れ替わりで空の画面を出さない）
  addEventListener('load', function () { phs.forEach(function (p) { var i = $('img', p); if (i && i.loading === 'lazy') i.loading = 'eager'; }); });
  if (hasIO) new IntersectionObserver(function (es) { vis = es[0].isIntersecting; hero.classList.toggle('is-off', !vis); vis ? start() : stop(); }, { threshold: 0 }).observe(hero);
  document.addEventListener('visibilitychange', function () { document.hidden ? stop() : start(); });
  if (btn) btn.addEventListener('click', function () {
    paused = !paused;
    btn.setAttribute('aria-pressed', paused ? 'true' : 'false');
    btn.setAttribute('aria-label', paused ? '画面の入れ替わりを再生する' : '画面の入れ替わりを止める');
    $('.hero__pause-t', btn).textContent = paused ? '再生' : '止める';
    hero.classList.toggle('is-paused', paused);
    paused ? stop() : start();
  });

  var once = hero.getAttribute('data-once'), seen = false;
  try { seen = !!sessionStorage.getItem(once); } catch (e) {}
  if (reduce || seen) { hero.classList.add('is-static', 'is-done'); arm(); }
  else {
    try { sessionStorage.setItem(once, '1'); } catch (e) {}
    hero.classList.add('is-play');
    setTimeout(function () { hero.classList.add('is-done'); }, 4600);
    setTimeout(arm, 6000);
  }

  if (!reduce) {
    var copy = $('.hero__copy', hero), pics = $('.hero__photos', hero), ticking = false;
    var depth = function () {
      ticking = false;
      if (innerWidth < 768) { copy.style.transform = ''; copy.style.opacity = ''; pics.style.transform = ''; return; }
      var r = hero.getBoundingClientRect(); if (r.bottom < 0) return;
      var p = Math.max(0, Math.min(1, -r.top / (r.height || 1)));
      pics.style.transform = 'translateY(' + (p * 18).toFixed(2) + '%)';
      copy.style.transform = 'translateY(' + (-p * 60).toFixed(1) + 'px)';
      copy.style.opacity = String(Math.max(0.05, 1 - p * 1.1));
    };
    addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(depth); } }, { passive: true });
  }
})();
