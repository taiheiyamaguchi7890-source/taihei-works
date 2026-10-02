(function(){
  var html=document.documentElement;
  html.classList.add('js');
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.addEventListener('DOMContentLoaded',function(){
    // ヒーロー
    var hero=document.querySelector('.hero');
    if(hero){requestAnimationFrame(function(){hero.classList.add('is-ready');});}

    // 表示アニメ（threshold 0）
    var targets=[].slice.call(document.querySelectorAll('.rv,.mask-open'));
    function show(el){el.classList.add('is-in');}
    if(reduce||!('IntersectionObserver' in window)){targets.forEach(show);}
    else{
      var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){show(e.target);io.unobserve(e.target);}});},{threshold:0});
      targets.forEach(function(t){io.observe(t);});
      // 3秒の保険：画面より上にあるものは表示
      setTimeout(function(){targets.forEach(function(t){if(t.getBoundingClientRect().top<window.innerHeight)show(t);});if(hero)hero.classList.add('is-ready');},3000);
    }

    // ヘッダーの線・固定タブ
    var hd=document.querySelector('.hd'),tab=document.querySelector('.fixed-tab');
    function onScroll(){
      var y=window.scrollY;
      if(hd)hd.classList.toggle('is-scrolled',y>8);
      if(tab)tab.classList.toggle('is-show',y>window.innerHeight*.8);
    }
    window.addEventListener('scroll',onScroll,{passive:true});onScroll();

    // スマホのメニュー
    var mb=document.querySelector('.menu-btn');
    if(mb){
      mb.addEventListener('click',function(){
        var open=!html.classList.contains('menu-open');
        html.classList.toggle('menu-open',open);mb.setAttribute('aria-expanded',open);
      });
      [].forEach.call(document.querySelectorAll('.drawer a'),function(a){a.addEventListener('click',function(){html.classList.remove('menu-open');mb.setAttribute('aria-expanded','false');});});
    }

    // 流れる帯：画面外・タブ非表示で停止、一時停止ボタン
    [].forEach.call(document.querySelectorAll('.flow'),function(f){
      var b=f.querySelector('.flow__btn');
      if(b){b.addEventListener('click',function(){var p=f.classList.toggle('is-paused');b.textContent=p?'再生':'一時停止';b.setAttribute('aria-pressed',p);});}
      if('IntersectionObserver' in window){new IntersectionObserver(function(es){es.forEach(function(e){f.classList.toggle('is-off',!e.isIntersecting);});},{threshold:0}).observe(f);}
    });
    document.addEventListener('visibilitychange',function(){[].forEach.call(document.querySelectorAll('.flow'),function(f){f.classList.toggle('is-off',document.hidden);});});

    // 見本のフォーム
    var form=document.querySelector('.form');
    if(form){form.addEventListener('submit',function(e){e.preventDefault();var m=form.querySelector('.form__msg');if(m){m.classList.add('is-show');m.focus();}});}
  });
})();
