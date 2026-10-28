/* 2026-10-27 再改修：A案ヒーローの小さな動き（検索窓の打ち替え・スマホの自動スクロール量・止めるボタン）と、集客の道すじの表示 */
(function () {
  'use strict';
  var d = document, w = window;
  var reduce = w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hero = d.querySelector('.hx'); if (!hero) return;
  var paused = false, live = false;

  function goLive() { if (live) return; live = true; setTimeout(function () { hero.classList.add('is-live'); startTyper(); }, 5000); }
  if (hero.classList.contains('is-ready')) goLive();
  else if ('MutationObserver' in w) new MutationObserver(function () { if (hero.classList.contains('is-ready')) goLive(); }).observe(hero, { attributes: true, attributeFilter: ['class'] });
  setTimeout(goLive, 4000);

  var page = d.querySelector('.hx-phone__page'), screen = d.querySelector('.hx-phone__screen');
  function fit() { if (page && screen && page.offsetHeight) page.style.setProperty('--scroll', -(page.offsetHeight - screen.offsetHeight) + 'px'); }
  if (page) { page.complete ? fit() : page.addEventListener('load', fit); w.addEventListener('resize', fit); }

  /* 検索窓：1文字 0.16秒 → 0.53秒おいて結果を差し替え → 7.8秒ごとに次の語（mo-I-02）。実在の店名は出さない */
  var words = [
    ['近くの 整体院', '〇〇整体院', '徒歩5分・営業中'],
    ['駅前 カフェ', '〇〇カフェ', '席数・メニュー・営業時間'],
    ['大人 ピアノ教室', '〇〇音楽教室', '体験レッスン・料金'],
    ['外壁塗装 地元', '〇〇塗装店', '施工事例・見積もりの目安']
  ];
  var q = d.querySelector('[data-hx-typer]'), res = d.querySelector('[data-hx-res]'), wi = 0;
  function startTyper() { if (reduce || !q) return; setTimeout(next, 7800); }
  function next() {
    if (paused || hero.classList.contains('is-off')) { setTimeout(next, 1000); return; }
    wi = (wi + 1) % words.length;
    var s = words[wi][0], i = 0; q.textContent = ''; res.classList.add('is-swap');
    (function type() {
      if (i < s.length) { q.textContent += s.charAt(i++); setTimeout(type, 160); return; }
      setTimeout(function () {
        var li = res.querySelector('li');
        li.querySelector('b').textContent = words[wi][1];
        li.querySelector('span').textContent = words[wi][2];
        res.classList.remove('is-swap');
        setTimeout(next, 7800);
      }, 530);
    })();
  }

  var btn = d.querySelector('.hx__pause');
  if (btn) btn.addEventListener('click', function () {
    var on = btn.getAttribute('aria-pressed') !== 'true';
    btn.setAttribute('aria-pressed', on); btn.setAttribute('aria-label', on ? '動きを再開する' : '動きを止める');
    paused = on; hero.classList.toggle('is-paused', on);
  });

  /* 集客の道すじ：画面に入ったら線を引き、段階を順に灯す */
  var jr = d.querySelector('[data-jr]');
  if (jr) {
    if (reduce || !('IntersectionObserver' in w)) jr.classList.add('is-in');
    else new IntersectionObserver(function (es, o) { es.forEach(function (e) { if (e.isIntersecting) { jr.classList.add('is-in'); o.disconnect(); } }); }, { threshold: 0, rootMargin: '0px 0px -20% 0px' }).observe(jr);
  }
})();
