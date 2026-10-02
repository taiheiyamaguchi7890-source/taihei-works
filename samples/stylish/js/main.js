(function(){
  var html=document.documentElement;
  html.classList.add('js');
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO='IntersectionObserver' in window;

  document.addEventListener('DOMContentLoaded',function(){
    // ヒーロー・下層見出し
    [].forEach.call(document.querySelectorAll('.hero,.phead'),function(h){requestAnimationFrame(function(){h.classList.add('is-ready');});});

    // 表示アニメ（threshold 0）
    var targets=[].slice.call(document.querySelectorAll('.rv,.zoom'));
    function show(el){el.classList.add('is-in');}
    if(reduce||!hasIO){targets.forEach(show);}
    else{
      var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){show(e.target);io.unobserve(e.target);}});},{threshold:0});
      targets.forEach(function(t){io.observe(t);});
      setTimeout(function(){targets.forEach(function(t){if(t.getBoundingClientRect().top<window.innerHeight)show(t);});},3000);
    }

    // 写真固定セクション：段落ごとに写真を入れ替え
    [].forEach.call(document.querySelectorAll('.s01s'),function(sec){
      var imgs=sec.querySelectorAll('.s01s__bg img'),steps=sec.querySelectorAll('.s01s__step');
      if(!imgs.length||!hasIO)return;
      var sio=new IntersectionObserver(function(es){es.forEach(function(e){
        if(e.isIntersecting){var n=+e.target.getAttribute('data-bg')||0;[].forEach.call(imgs,function(im,i){im.classList.toggle('is-on',i===n);});}
      });},{threshold:0,rootMargin:'-45% 0px -45% 0px'});
      [].forEach.call(steps,function(s){sio.observe(s);});
    });

    // 散らした写真のずれ（st-S-02）：画面内だけ計算
    var par=[].slice.call(document.querySelectorAll('[data-speed]'));
    if(par.length&&!reduce&&window.innerWidth>=768){
      var vis=new Set(),ticking=false;
      if(hasIO){var pio=new IntersectionObserver(function(es){es.forEach(function(e){e.isIntersecting?vis.add(e.target):vis.delete(e.target);});},{threshold:0});par.forEach(function(p){pio.observe(p);});}
      function upd(){ticking=false;vis.forEach(function(p){var r=p.getBoundingClientRect(),c=r.top+r.height/2-window.innerHeight/2;var y=Math.max(-80,Math.min(80,-c*parseFloat(p.getAttribute('data-speed'))));p.style.transform='translateY('+y.toFixed(1)+'px)';});}
      window.addEventListener('scroll',function(){if(!ticking){ticking=true;requestAnimationFrame(upd);}},{passive:true});
    }

    // 固定カード
    var fc=document.querySelector('.fcard');
    function onScroll(){if(fc)fc.classList.toggle('is-show',window.scrollY>window.innerHeight*.9);}
    window.addEventListener('scroll',onScroll,{passive:true});onScroll();

    // スマホのメニュー
    var mb=document.querySelector('.menu-btn');
    if(mb){
      mb.addEventListener('click',function(){var open=!html.classList.contains('menu-open');html.classList.toggle('menu-open',open);mb.setAttribute('aria-expanded',open);});
      [].forEach.call(document.querySelectorAll('.drawer a'),function(a){a.addEventListener('click',function(){html.classList.remove('menu-open');mb.setAttribute('aria-expanded','false');});});
    }

    // マーキー
    [].forEach.call(document.querySelectorAll('.mq'),function(m){
      var b=m.querySelector('.mq__btn');
      if(b){b.addEventListener('click',function(){var p=m.classList.toggle('is-paused');b.textContent=p?'再生':'一時停止';b.setAttribute('aria-pressed',p);});}
      if(hasIO){new IntersectionObserver(function(es){es.forEach(function(e){m.classList.toggle('is-off',!e.isIntersecting);});},{threshold:0}).observe(m);}
    });
    document.addEventListener('visibilitychange',function(){[].forEach.call(document.querySelectorAll('.mq,.hero__tag'),function(m){m.classList.toggle('is-off',document.hidden);});});

    // 見本のフォーム
    var form=document.querySelector('.form');
    if(form){form.addEventListener('submit',function(e){e.preventDefault();var m=form.querySelector('.form__msg');if(m){m.classList.add('is-show');m.focus();}});}
  });
})();
