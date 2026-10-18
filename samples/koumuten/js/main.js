/* こもれび工務店（架空）— 見本サイトの動き（自作・ライブラリなし）
   作法：IO は threshold 0／html.js のときだけ隠す・動かす／3秒の保険／reduced-motion で止める／画面外とタブ非表示で止める */
(function () {
  'use strict';
  var d = document, w = window;
  var reduce = w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in w;
  var $ = function (s, r) { return (r || d).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); };
  var clamp = function (v) { return Math.max(0, Math.min(1, v)); };
  function watch(el, cb, opt) { if (!el) return; if (!hasIO) { cb(true); return; } new IntersectionObserver(function (es) { cb(es[0].isIntersecting); }, opt || { threshold: 0 }).observe(el); }

  /* ---------- 表示（threshold 0・3秒の保険は画面より上だけ） ---------- */
  var shows = $$('.rv, .e1');
  function show(el) { el.classList.add('is-in'); }
  if (reduce || !hasIO) shows.forEach(show);
  else {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { io.unobserve(e.target); show(e.target); } }); }, { threshold: 0, rootMargin: '0px 0px -8% 0px' });
    shows.forEach(function (el) { io.observe(el); });
    setTimeout(function () { shows.forEach(function (el) { if (el.getBoundingClientRect().top < w.innerHeight) show(el); }); }, 3000);
  }

  /* ---------- ヘッダー：白くなる・下へ進む間は隠れる（mo-U-01） ---------- */
  var hd = $('.hd'), last = 0, mb = $('.mbtn'), sp = $('#spnav');
  var totop = $('.totop'), u2 = $('.u2'), hero = $('.op') || $('.ph-hd');
  function menu(open) {
    if (!mb) return;
    mb.setAttribute('aria-expanded', open ? 'true' : 'false');
    sp.hidden = !open; d.body.style.overflow = open ? 'hidden' : '';
    if (hd) hd.classList.toggle('is-solid', open || w.scrollY > 40 || hd.classList.contains('hd--solid'));
  }
  if (mb) {
    mb.addEventListener('click', function () { menu(mb.getAttribute('aria-expanded') !== 'true'); });
    $$('a', sp).forEach(function (a) { a.addEventListener('click', function () { menu(false); }); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape') menu(false); });
  }
  var tk = false;
  function onScroll() {
    tk = false;
    var y = w.scrollY, max = d.documentElement.scrollHeight - w.innerHeight;
    var open = mb && mb.getAttribute('aria-expanded') === 'true';
    if (hd) {
      hd.classList.toggle('is-solid', y > 40 || open || hd.classList.contains('hd--solid'));
      var focusIn = hd.contains(d.activeElement);
      if (!open && !focusIn && y > 400 && y - last > 6) hd.classList.add('is-hide');
      else if (y < last - 6 || y < 400) hd.classList.remove('is-hide');
    }
    last = y;
    if (totop) { totop.classList.toggle('is-on', y > w.innerHeight * .6); totop.style.setProperty('--p', max > 0 ? (y / max).toFixed(3) : 0); }
    if (u2 && hero) u2.classList.toggle('is-on', y > hero.offsetHeight * .6 && !(ct && ctVis));
    depth(); flowUpd();
  }
  w.addEventListener('scroll', function () { if (!tk) { tk = true; requestAnimationFrame(onScroll); } }, { passive: true });
  var ct = $('.cta'), ctVis = false;
  watch(ct, function (v) { ctVis = v; onScroll(); }, { threshold: 0, rootMargin: '0px 0px -20% 0px' });

  /* ---------- 開幕（mo-O-R curtain）＋重ね替え（斜めワイプ）＋④奥行き ---------- */
  var op = $('.op');
  function split(el) {
    var t = el.textContent; el.setAttribute('aria-label', t); el.textContent = '';
    Array.prototype.forEach.call(t, function (c, i) {
      var s = d.createElement('span'); s.className = 'ch'; s.setAttribute('aria-hidden', 'true');
      s.style.setProperty('--i', i); s.textContent = c; el.appendChild(s);
    });
  }
  var pics = op && $('.op__photos', op), copy = op && $('.op__copy', op), mark = op && $('.op__mark', op);
  function depth() {
    if (!op || reduce) return;
    var r = op.getBoundingClientRect(); if (r.bottom < 0) return;
    var p = clamp(-r.top / (r.height || 1));
    pics.style.transform = 'translateY(' + (p * 18).toFixed(2) + '%)';
    copy.style.transform = 'translateY(' + (-p * 60).toFixed(1) + 'px)'; copy.style.opacity = String(Math.max(0.05, 1 - p * 1.1));
    if (mark) mark.style.transform = 'translateX(' + (-p * 12).toFixed(2) + '%)';
  }
  if (op) {
    if (reduce) op.classList.add('is-static');
    else {
      $$('[data-split]', op).forEach(split);
      var ph = $$('.op__ph', op), cur = 0, id = null, vis = true, paused = false, armed = false;
      var next = function () {
        var j = (cur + 1) % ph.length;
        ph.forEach(function (p) { p.classList.remove('is-prev'); });
        ph[cur].classList.remove('is-on', 'is-anim'); ph[cur].classList.add('is-prev');
        void ph[j].offsetWidth; ph[j].classList.add('is-on', 'is-anim'); cur = j;
      };
      var start = function () { if (armed && !paused && vis && !d.hidden && !id) { id = setInterval(next, 9000); op.classList.add('is-cyc'); } };
      var stop = function () { clearInterval(id); id = null; };
      watch(op, function (v) { vis = v; op.classList.toggle('is-off', !v); v ? start() : stop(); });
      d.addEventListener('visibilitychange', function () { d.hidden ? stop() : start(); });
      var pb = $('.op__pause', op);
      if (pb) pb.addEventListener('click', function () {
        paused = !paused; op.classList.toggle('is-paused', paused);
        pb.setAttribute('aria-label', paused ? '写真の切り替えを再開する' : '写真の切り替えを止める');
        paused ? stop() : start();
      });
      var seen = false;
      try { seen = sessionStorage.getItem('kmr-op') === '1'; sessionStorage.setItem('kmr-op', '1'); } catch (e) {}
      if (seen) { op.classList.add('is-static', 'is-done'); armed = true; start(); }
      else {
        op.classList.add('is-play');
        setTimeout(function () { op.classList.add('is-done'); }, 2700);
        setTimeout(function () { armed = true; start(); }, 6000);
      }
    }
  }

  /* ---------- 工事の流れの写真（mo-A-05 縦2列）：2周分に複製・止めるボタン ---------- */
  $$('.a5').forEach(function (a) {
    $$('.a5__col', a).forEach(function (c) { c.innerHTML += c.innerHTML; $$('.a5__item', c).forEach(function (it, i) { if (i >= c.children.length / 2) it.setAttribute('aria-hidden', 'true'); }); });
    watch(a, function (v) { a.classList.toggle('is-off', !v || d.hidden); });
    var b = $('.a5__stop', a);
    if (b) b.addEventListener('click', function () { var p = b.getAttribute('aria-pressed') !== 'true'; b.setAttribute('aria-pressed', p ? 'true' : 'false'); b.textContent = p ? '写真を動かす' : '写真の動きを止める'; a.classList.toggle('is-paused', p); });
  });

  /* ---------- ご相談の流れ：線が伸びて手順が点灯（mo-S-03） ---------- */
  var fl = $('.flow__list'), fsteps = fl ? $$('li', fl) : [];
  function flowUpd() {
    if (!fl || reduce) return;
    var r = fl.getBoundingClientRect(), vh = w.innerHeight;
    if (r.bottom < -100 || r.top > vh) return;
    var p = clamp((vh * .75 - r.top) / (r.height * .85 + 60));
    fl.style.setProperty('--p', p.toFixed(3));
    var col = w.innerWidth > 900;
    fsteps.forEach(function (s, i) { var th = col ? i / (fsteps.length - 1) * .92 : s.offsetTop / r.height; s.classList.toggle('is-pass', p >= th - .001); });
  }
  if (reduce) fsteps.forEach(function (s) { s.classList.add('is-pass'); });

  /* ---------- 施工事例の絞り込み ---------- */
  var flt = $('.flt');
  if (flt) {
    var bs = $$('button', flt), items = $$('.wk__grid--list > li');
    bs.forEach(function (b) {
      b.addEventListener('click', function () {
        var k = b.getAttribute('data-k');
        bs.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        items.forEach(function (it) { it.classList.toggle('is-hide', k !== 'all' && it.getAttribute('data-k') !== k); });
      });
    });
  }

  /* ---------- 見本のフォーム（送信しない） ---------- */
  $$('form[data-demo]').forEach(function (f) { f.addEventListener('submit', function (e) { e.preventDefault(); f.classList.add('is-done'); }); });

  w.addEventListener('resize', function () { onScroll(); });
  onScroll();
})();
