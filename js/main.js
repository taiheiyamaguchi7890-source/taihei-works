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
  var n = 0, h1el = $('.hero__h1');
  if (h1el) h1el.setAttribute('aria-label', h1el.textContent.replace(/\s+/g, ''));
  $$('.hero__h1 .chars').forEach(function (el) {
    var t = el.textContent, h = '';
    for (var i = 0; i < t.length; i++) { h += '<span class="c" style="--n:' + (n++) + '" aria-hidden="true">' + t[i] + '</span>'; }
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
      '<p class="op__logo"><img src="' + (function () { var l = $('.logo img'); return l ? l.getAttribute('src').replace('logo.png', 'logo_full_web.png') : 'images/logo_full_web.png'; })() + '" alt=""></p>';
    body.appendChild(op);
    /* v1.6：線 2.2秒 → ロゴ 0.6秒から 1.5秒 → 2.2秒から幕が上へ 1.5秒で抜ける（タブごとに1回） */
    setTimeout(function () { op.classList.add('is-out'); ready(); }, 2200);
    setTimeout(function () { op.remove(); }, 3900);
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
    viewTimer(hero, 6900, function () {
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

/* ===== カーソル（PCのみ・動きを減らす設定では出さない） ===== */
(function () {
  var mq = window.matchMedia('(hover:hover) and (pointer:fine)');
  if (!mq.matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.addEventListener('DOMContentLoaded', function () {
    var cur = document.createElement('div'); cur.className = 'cur'; cur.setAttribute('aria-hidden', 'true'); cur.innerHTML = '<span>view</span>';
    document.body.appendChild(cur); document.documentElement.classList.add('has-cur');
    var mx = 0, my = 0, x = 0, y = 0, run = false;
    function loop() { x += (mx - x) * .2; y += (my - y) * .2; cur.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)'; if (Math.abs(mx - x) + Math.abs(my - y) > .3) requestAnimationFrame(loop); else run = false; }
    document.addEventListener('mousemove', function (e) { mx = e.clientX; my = e.clientY; cur.classList.add('is-on'); if (!run) { run = true; requestAnimationFrame(loop); } });
    document.documentElement.addEventListener('mouseleave', function () { cur.classList.remove('is-on'); });
    document.addEventListener('mouseover', function (e) {
      var v = e.target.closest('[data-view],.wk__card');
      var l = e.target.closest('a,button,summary,input,select,textarea,label,[role="tab"]');
      cur.classList.toggle('is-view', !!v); cur.classList.toggle('is-link', !!l && !v);
    });
  });
})();

/* =====================================================================
   2026-10-18 改修で足した動き
   ・ヒーローの④奥行き／第一印象チェック（タブ・自動送り・検索窓に文字）
   ・mo-E-06 灰色の文が1行ずつ濃く／mo-A-07 流れる文字の帯（止めるボタン）
   ・mo-U-05 文字が流れる問い合わせボタン／フォームを開くリンク
   ・計測：LINE・電話・メール・Instagram・フォーム送信のクリック（GA4 があれば gtag、なければ dataLayer）
   ===================================================================== */
(function () {
  'use strict';
  var d = document, w = window;
  var reduce = w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in w;
  var $ = function (s, r) { return (r || d).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); };
  var clamp = function (v) { return Math.max(0, Math.min(1, v)); };
  function watch(el, cb, opt) { if (!el) return; if (!hasIO) { cb(true); return; } new IntersectionObserver(function (es) { cb(es[0].isIntersecting); }, opt || { threshold: 0 }).observe(el); }

  /* ---------- 計測 ---------- */
  function track(name, params) {
    try {
      if (typeof w.gtag === 'function') w.gtag('event', name, params);
      else { w.dataLayer = w.dataLayer || []; var o = { event: name }; for (var k in params) o[k] = params[k]; w.dataLayer.push(o); }
    } catch (e) {}
  }
  d.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('[data-track]'); if (!a) return;
    var m = a.getAttribute('data-track');
    track(m + '_click', { cta_position: a.getAttribute('data-pos') || '', page_path: location.pathname });
  });
  $$('form[data-track-form]').forEach(function (f) { f.addEventListener('submit', function () { track('form_submit', { cta_position: 'contact', page_path: location.pathname }); }); });

  /* ---------- フォームを開くリンク ---------- */
  $$('[data-form-open]').forEach(function (a) { a.addEventListener('click', function () { var f = $('#form'); if (f) f.open = true; track('form_open', { cta_position: 'contact', page_path: location.pathname }); }); });

  /* ---------- ヒーロー：④スクロールの奥行き ---------- */
  var hero = $('.hero'), hc = hero && $('.hero__copy', hero), hv = hero && $('.hero__vis', hero);
  if (hero && !reduce) {
    var tk = false;
    var depth = function () {
      tk = false;
      var r = hero.getBoundingClientRect(); if (r.bottom < 0) return;
      var p = clamp(-r.top / (r.height || 1));
      if (hc) { hc.style.transform = 'translateY(' + (-p * 60).toFixed(1) + 'px)'; hc.style.opacity = String(Math.max(0.05, 1 - p * 1.1)); }
      if (hv) hv.style.transform = 'translateY(' + (p * 90).toFixed(1) + 'px)';
    };
    w.addEventListener('scroll', function () { if (!tk) { tk = true; requestAnimationFrame(depth); } }, { passive: true });
  }

  /* ---------- 第一印象チェック ---------- */
  var chk = $('.chk');
  if (chk) {
    var rows = $$('.chk__row', chk), scr = $$('.cd', chk), cur = 0, timer = null, vis = false, MS = 7800, typing = null;
    var qEl = $('.cd__q', chk), qTxt = qEl ? qEl.getAttribute('data-q') : '';
    chk.style.setProperty('--chk-ms', MS + 'ms');
    function typeQ() {
      if (!qEl || reduce) return;
      clearInterval(typing); var i = 0; qEl.textContent = '';
      typing = setInterval(function () { i++; qEl.textContent = qTxt.slice(0, i); if (i >= qTxt.length) clearInterval(typing); }, 160);
    }
    function show(k, auto) {
      cur = k;
      rows.forEach(function (r, i) {
        r.classList.toggle('is-cur', i === k); r.classList.toggle('is-done', i < k);
        r.setAttribute('aria-selected', i === k ? 'true' : 'false'); r.tabIndex = i === k ? 0 : -1;
        r.classList.remove('is-run');
      });
      scr.forEach(function (s, i) { s.classList.toggle('is-on', i === k); });
      if (k === 0) typeQ();
      /* 進み線のアニメーションをやり直す */
      var rr = rows[k]; if (rr) { rr.style.animation = 'none'; void rr.offsetWidth; rr.style.animation = ''; }
    }
    function stop() { clearInterval(timer); timer = null; }
    function start() { if (reduce || timer || !vis || d.hidden) return; chk.classList.add('is-auto'); timer = setInterval(function () { show((cur + 1) % rows.length, true); }, MS); }
    rows.forEach(function (r, i) {
      r.addEventListener('click', function () { stop(); show(i); start(); });
      r.addEventListener('keydown', function (e) {
        var k = null;
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') k = (cur + 1) % rows.length;
        if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') k = (cur - 1 + rows.length) % rows.length;
        if (k !== null) { e.preventDefault(); stop(); show(k); rows[k].focus(); start(); }
      });
    });
    show(0);
    watch(chk, function (v) { vis = v; chk.classList.toggle('is-off', !v); if (v) { show(cur); start(); } else stop(); });
    d.addEventListener('visibilitychange', function () { d.hidden ? stop() : start(); });
  }

  /* ---------- mo-E-06：灰色の文が1行ずつ濃くなる ---------- */
  var e6 = $('[data-e6]');
  if (e6 && !reduce) {
    var ls = $$('.e6__l', e6), t6 = false, on6 = !hasIO;
    var f6 = function () {
      t6 = false; if (!on6) return;
      var vh = w.innerHeight;
      ls.forEach(function (l) {
        var r = l.getBoundingClientRect(), c = r.top + r.height / 2;
        var p = clamp((vh * 0.85 - c) / (vh * 0.35));
        l.style.setProperty('--p', p.toFixed(3));
      });
    };
    watch(e6, function (v) { on6 = v; if (v) f6(); }, { threshold: 0, rootMargin: '20% 0px 20% 0px' });
    w.addEventListener('scroll', function () { if (!t6) { t6 = true; requestAnimationFrame(f6); } }, { passive: true });
    f6();
  }

  /* ---------- mo-A-07：流れる文字の帯 ---------- */
  var mq = $('[data-mq]'), mqb = $('[data-mq-pause]');
  if (mq) {
    watch(mq, function (v) { mq.classList.toggle('is-off', !v || d.hidden); });
    if (mqb) mqb.addEventListener('click', function () {
      var p = mqb.getAttribute('aria-pressed') !== 'true';
      mqb.setAttribute('aria-pressed', p ? 'true' : 'false'); mqb.textContent = p ? '流れる文字を動かす' : '流れる文字を止める';
      mq.classList.toggle('is-paused', p);
    });
  }

  /* ---------- mo-U-05：文字が流れる問い合わせボタン ---------- */
  var u5 = $('.u5'), ct = $('#contact');
  if (u5) {
    var past = false, inCt = false;
    var upd = function () { u5.classList.toggle('is-on', past && !inCt); };
    var sc = function () { var p = w.scrollY > w.innerHeight * 0.6; if (p !== past) { past = p; upd(); } };
    w.addEventListener('scroll', sc, { passive: true }); sc();
    if (ct) watch(ct, function (v) { inCt = v; upd(); }, { threshold: 0, rootMargin: '0px 0px -30% 0px' });
    d.addEventListener('visibilitychange', function () { u5.classList.toggle('is-off', d.hidden); });
    var mb = $('.menubtn');
    if (mb && 'MutationObserver' in w) new MutationObserver(function () { d.body.classList.toggle('is-menu', mb.getAttribute('aria-expanded') === 'true'); }).observe(mb, { attributes: true, attributeFilter: ['aria-expanded'] });
  }
})();

/* ===== 工務店ページ：見られる3点（mo-S-05）・ヒーローの検索窓 ===== */
(function () {
  'use strict';
  var d = document, w = window;
  var reduce = w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || d).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); };
  var img = $('.k3__img'), blks = $$('[data-k3]');
  if (img && blks.length && 'IntersectionObserver' in w) {
    var setK = function (b) {
      blks.forEach(function (x) { x.classList.toggle('is-cur', x === b); });
      img.style.objectPosition = '50% ' + b.getAttribute('data-k3') + '%';
    };
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) setK(e.target); }); }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
    blks.forEach(function (b) { io.observe(b); });
  }
  /* 検索窓に文字が打たれる（mo-I-02） */
  var q = $('.khv__q'), res = $('.khv__res');
  if (q && !reduce) {
    var txt = q.getAttribute('data-q'), i = 0;
    q.textContent = ''; if (res) res.classList.add('is-wait');
    setTimeout(function () {
      var id = setInterval(function () { i++; q.textContent = txt.slice(0, i); if (i >= txt.length) { clearInterval(id); setTimeout(function () { if (res) res.classList.remove('is-wait'); }, 530); } }, 160);
    }, 2600);
  }
})();
