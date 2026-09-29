/* Harukaze Works — B案 natural（自作・ライブラリなし） */
(function () {
  'use strict';
  var d = document, w = window, body = d.body;
  var reduce = w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in w;
  var fine = w.matchMedia && w.matchMedia('(hover:hover) and (pointer:fine)').matches;
  var $ = function (s, r) { return (r || d).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); };
  var isPC = function () { return w.innerWidth >= 1024; };

  function onView(el, fn, margin) {
    if (!hasIO) { fn(el); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { io.unobserve(e.target); fn(e.target); } });
    }, { threshold: 0, rootMargin: margin || '0px 0px -8% 0px' });
    io.observe(el);
  }
  function watchVis(el, cb) {
    if (!hasIO) { cb(true); return; }
    new IntersectionObserver(function (es) { cb(es[0].isIntersecting); }, { threshold: 0 }).observe(el);
  }
  function pauseOff(el) {
    if (!el) return;
    var vis = true;
    function upd() { el.classList.toggle('is-off', !vis || d.hidden); }
    watchVis(el, function (v) { vis = v; upd(); });
    d.addEventListener('visibilitychange', upd);
  }
  function viewTimer(el, ms, tick) {
    var id = null, vis = !hasIO;
    function start() { if (!id && vis && !d.hidden) id = setInterval(tick, ms); }
    function stop() { if (id) { clearInterval(id); id = null; } }
    watchVis(el, function (v) { vis = v; v ? start() : stop(); });
    d.addEventListener('visibilitychange', function () { d.hidden ? stop() : start(); });
  }

  /* ---------- 見出しを1文字ずつに分ける（読み上げは元の文のまま） ---------- */
  var n = 0;
  $$('.hero__h1 .chars').forEach(function (el) {
    var t = el.textContent, h = '';
    for (var i = 0; i < t.length; i++) { h += '<span class="c" style="--n:' + (n++) + '">' + t[i] + '</span>'; }
    el.innerHTML = h;
  });

  /* ---------- オープニング（タブごとに1回） ---------- */
  var hero = $('.hero');
  function ready() { hero.classList.add('is-ready'); }
  var seen = false;
  try { seen = sessionStorage.getItem('hw-b-op') === '1'; } catch (e) {}
  if (reduce || seen) ready();
  else {
    try { sessionStorage.setItem('hw-b-op', '1'); } catch (e) {}
    var op = d.createElement('div'); op.className = 'op'; op.setAttribute('aria-hidden', 'true');
    op.innerHTML = '<svg viewBox="0 0 1440 800" preserveAspectRatio="none"><path pathLength="1" d="M-20 500 C 300 380, 520 620, 820 480 S 1200 360, 1460 430"/><path pathLength="1" d="M-20 560 C 320 480, 560 660, 860 540 S 1240 440, 1460 500"/><path pathLength="1" d="M-20 300 C 260 240, 480 380, 760 300 S 1160 200, 1460 260"/></svg>' +
      '<p class="op__logo"><img src="images/logo_full_web.png" alt=""></p>';
    body.appendChild(op);
    setTimeout(function () { op.classList.add('is-out'); ready(); }, 1500);
    setTimeout(function () { op.remove(); }, 2500);
  }
  setTimeout(ready, 3000);
  pauseOff(hero);

  /* ---------- ヘッダー・現在地のピル・上へ戻る ---------- */
  var hd = $('#hd'), totop = $('.totop'), pill = $('.pill'), ind = pill && $('.pill__ind', pill);
  var links = pill ? $$('a', pill) : [];
  function moveInd(a) {
    links.forEach(function (x) { x.classList.toggle('is-cur', x === a); });
    if (!a) { pill.classList.remove('has-cur'); return; }
    pill.classList.add('has-cur');
    ind.style.left = a.offsetLeft + 'px'; ind.style.width = a.offsetWidth + 'px';
  }
  if (hasIO && links.length) {
    var secs = links.map(function (a) { return $(a.getAttribute('href')); });
    var cur = null;
    secs.forEach(function (s, i) {
      if (!s) return;
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { cur = links[i]; moveInd(cur); } else if (cur === links[i]) { /* 次の区画が拾う */ } });
      }, { rootMargin: '-45% 0px -54% 0px', threshold: 0 }).observe(s);
    });
    watchVis(hero, function (v) { if (v) { cur = null; moveInd(null); } });
    w.addEventListener('resize', function () { if (cur) moveInd(cur); });
  }

  /* ---------- スマホのメニュー ---------- */
  var mb = $('.menubtn'), sp = $('#spnav');
  function menu(open) {
    mb.setAttribute('aria-expanded', open ? 'true' : 'false');
    body.style.overflow = open ? 'hidden' : '';
    if (open) { sp.hidden = false; requestAnimationFrame(function () { requestAnimationFrame(function () { sp.classList.add('is-open'); }); }); }
    else { sp.classList.remove('is-open'); setTimeout(function () { if (!sp.classList.contains('is-open')) sp.hidden = true; }, reduce ? 0 : 400); }
  }
  mb.addEventListener('click', function () { menu(mb.getAttribute('aria-expanded') !== 'true'); });
  $$('a', sp).forEach(function (a) { a.addEventListener('click', function () { menu(false); }); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && mb.getAttribute('aria-expanded') === 'true') menu(false); });

  /* ---------- 表示（threshold 0、3秒の保険は画面より上にあるものだけ） ---------- */
  var shows = $$('.fade, .st, .ft4');
  function show(el) { el.classList.add('is-in'); }
  if (reduce || !hasIO) shows.forEach(show);
  else {
    shows.forEach(function (el) { onView(el, show); });
    setTimeout(function () { shows.forEach(function (el) { if (el.getBoundingClientRect().top < w.innerHeight) show(el); }); }, 3000);
  }

  /* ---------- 写真の重ね替え ---------- */
  if (!reduce) {
    var cycles = $$('.hero [data-cycle]'), k = 0;
    viewTimer(hero, 4600, function () {
      k++;
      cycles.forEach(function (v) {
        var ims = $$('.cyc', v); if (ims.length < 2) return;
        ims.forEach(function (im, j) { im.classList.toggle('is-on', j === k % ims.length); });
      });
    });
  }

  /* ---------- マグネットのボタン・傾くカード（マウスのときだけ） ---------- */
  if (fine && !reduce) {
    $$('.mag').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * .18).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * .28).toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
    $$('.tilt').forEach(function (c) {
      c.addEventListener('mousemove', function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        c.style.transform = 'perspective(900px) rotateY(' + (x * 8).toFixed(2) + 'deg) rotateX(' + (y * -8).toFixed(2) + 'deg) translateY(-4px)';
      });
      c.addEventListener('mouseleave', function () { c.style.transform = ''; });
    });
  }

  /* ---------- WHY：検索窓に文字が打たれ、結果が入れ替わる ---------- */
  var q = $('.sdemo__q'), hit = $('.sdemo__hit'), sdemo = $('.sdemo');
  var qs = [
    { q: '〇〇駅　カフェ', t: '〇〇カフェ｜〇〇駅の喫茶店', u: 'www.your-shop.jp', ds: '営業時間・メニュー・アクセス。お店の魅力が、探している人にまっすぐ届きます。' },
    { q: '〇〇市　工務店', t: '株式会社〇〇｜〇〇市の工務店', u: 'www.your-company.co.jp', ds: '施工事例・会社概要・許可情報。はじめての方にも、安心して選んでもらえます。' },
    { q: '〇〇町　ピアノ教室', t: '〇〇ピアノ教室｜〇〇町', u: 'www.your-class.jp', ds: 'レッスン内容・料金・体験申込み。保護者の方にも分かりやすくご案内します。' }
  ];
  if (q && !reduce) {
    var qi = 0, typing = null;
    function typeQ() {
      var item = qs[qi], i = 0;
      hit.classList.add('is-swap'); q.textContent = '';
      clearInterval(typing);
      typing = setInterval(function () {
        i++; q.textContent = item.q.slice(0, i);
        if (i >= item.q.length) {
          clearInterval(typing);
          setTimeout(function () {
            $('.sdemo__ttl', hit).textContent = item.t; $('.sdemo__url', hit).textContent = item.u; $('.sdemo__desc', hit).textContent = item.ds;
            hit.classList.remove('is-swap');
          }, 350);
        }
      }, 120);
    }
    viewTimer(sdemo, 5200, function () { qi = (qi + 1) % qs.length; typeQ(); });
  }

  /* ---------- PATTERNS：PCはスクロールで扇が開く／スマホはタブで切り替え ---------- */
  var fan = $('.fan'), items = $$('.fan__item'), tabs = $$('.fan__tabs button');
  pauseOff(fan);
  function fanUpd() {
    if (!fan || reduce) return;
    if (!isPC()) { fan.style.removeProperty('--p'); return; }
    var r = fan.getBoundingClientRect(), total = r.height - w.innerHeight;
    var p = total > 0 ? (-r.top) / (total * .6) : 1; p = Math.max(0, Math.min(1, p));
    var e = 1 - Math.pow(1 - p, 3);
    items.forEach(function (it) { it.style.setProperty('--p', e.toFixed(3)); });
  }
  if (reduce) items.forEach(function (it) { it.style.setProperty('--p', 1); });
  tabs.forEach(function (t) {
    t.addEventListener('click', function () {
      var k = +t.getAttribute('data-k');
      tabs.forEach(function (x, i) { x.setAttribute('aria-selected', i === k ? 'true' : 'false'); });
      items.forEach(function (x, i) { x.classList.toggle('is-cur', i === k); });
    });
  });

  /* ---------- WORKS：PCは縦のスクロールで横に進む ---------- */
  var hs = $('.hs'), track = hs && $('.hs__track', hs), hsBar = hs && $('.hs__bar', hs), hsDist = 0;
  function hsSize() {
    if (!hs) return;
    if (!isPC() || reduce) { hs.style.height = ''; track.style.removeProperty('--x'); hsDist = 0; return; }
    hsDist = Math.max(0, track.scrollWidth - w.innerWidth);
    hs.style.height = (w.innerHeight + hsDist) + 'px';
  }
  function hsUpd() {
    if (!hsDist) return;
    var r = hs.getBoundingClientRect(), p = Math.max(0, Math.min(1, -r.top / hsDist));
    track.style.setProperty('--x', (p * hsDist).toFixed(1));
    hsBar.style.setProperty('--hp', p.toFixed(3));
  }

  /* ---------- 料金：更新回数のつまみ ---------- */
  var rng = $('#simR');
  if (rng) {
    var P = $('#simP'), N = $('#simN'), U = $('#simU'), M = $('#simM'), rows = $$('#simTbl tr');
    var last = '';
    function sim() {
      var v = +rng.value, price, nTxt, msg, row, unit = '円／月', jp = false;
      if (v === 0) { price = '0'; nTxt = '0回（更新しない）'; msg = '月額なしの買い切りでOK'; row = 0; }
      else if (v <= 2) { price = '1,000'; nTxt = '月' + v + '回'; msg = '月1〜2回のプラン'; row = 1; }
      else if (v <= 4) { price = '2,000'; nTxt = '月' + v + '回'; msg = '月3〜4回のプラン'; row = 2; }
      else if (v <= 6) { price = '3,000'; nTxt = '月' + v + '回'; msg = '月5〜6回のプラン'; row = 3; }
      else { price = '応相談'; nTxt = '月7回以上'; msg = '回数に合わせてご相談'; row = 4; unit = ''; jp = true; }
      N.textContent = nTxt; M.textContent = msg; U.textContent = unit;
      P.textContent = price; P.classList.toggle('is-jp', jp);
      rng.style.setProperty('--v', (v / 7).toFixed(3));
      rng.setAttribute('aria-valuetext', nTxt + '：' + (jp ? price : price + '円／月'));
      rows.forEach(function (r, i) { r.classList.toggle('is-cur', i === row); });
      if (price !== last && !reduce) { P.classList.remove('is-pop'); void P.offsetWidth; P.classList.add('is-pop'); setTimeout(function () { P.classList.remove('is-pop'); }, 300); }
      last = price;
    }
    rng.addEventListener('input', sim); sim();
  }

  /* ---------- 数字が増える ---------- */
  $$('.cnt').forEach(function (el) {
    var to = +el.getAttribute('data-count'); if (reduce || to < 2) return;
    el.textContent = '0';
    onView(el, function () {
      var t0 = null;
      (function step(ts) { if (!t0) t0 = ts; var p = Math.min(1, (ts - t0) / 1400); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); })(performance.now());
    });
  });

  /* ---------- FLOW：風の道がスクロールに合わせて伸びる ---------- */
  var road = $('#road'), roadV = road && $('.road__v', road), steps = $$('.step');
  function roadUpd() {
    if (!road || reduce) return;
    var r = road.getBoundingClientRect(), vh = w.innerHeight;
    if (r.bottom < -200 || r.top > vh) return;
    var p = (vh * .75 - r.top) / (r.height * .85); p = Math.max(0, Math.min(1, p));
    if (roadV) roadV.style.setProperty('--p', p.toFixed(3));
    road.style.setProperty('--p', p.toFixed(3));
    steps.forEach(function (s, i) {
      var th = isPC() ? i / (steps.length - 1) * .9 : (s.offsetTop / r.height);
      s.classList.toggle('is-pass', p >= th);
    });
  }
  if (reduce) steps.forEach(function (s) { s.classList.add('is-pass'); });

  /* ---------- FAQ ---------- */
  $$('.qa').forEach(function (qa) {
    var b = $('.qa__q', qa);
    b.addEventListener('click', function () {
      var open = !qa.classList.contains('is-open');
      $$('.qa.is-open').forEach(function (o) { o.classList.remove('is-open'); $('.qa__q', o).setAttribute('aria-expanded', 'false'); });
      qa.classList.toggle('is-open', open); b.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });
  pauseOff($('.contact'));

  /* ---------- スクロールの処理をまとめる ---------- */
  var ticking = false;
  function onScroll() {
    ticking = false;
    var y = w.scrollY, max = d.documentElement.scrollHeight - w.innerHeight;
    hd.classList.toggle('is-scrolled', y > 30);
    totop.classList.toggle('is-on', y > w.innerHeight * .6);
    totop.style.setProperty('--p', max > 0 ? (y / max).toFixed(3) : 0);
    fanUpd(); hsUpd(); roadUpd();
  }
  w.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  var rt = null;
  w.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { hsSize(); onScroll(); }, 150); });
  w.addEventListener('load', function () { hsSize(); onScroll(); });
  hsSize(); onScroll();
})();
