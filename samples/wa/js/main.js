(function(){
  var html=document.documentElement;
  html.classList.add('js');
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO='IntersectionObserver' in window;
  var seen=false;
  try{seen=sessionStorage.getItem('komorebi-wa-open')==='1';}catch(e){}
  if(seen||reduce)html.classList.add('no-opening');

  document.addEventListener('DOMContentLoaded',function(){
    // オープニング（紋と縦書きの一文）
    var op=document.querySelector('.opening'),delay=0;
    if(op&&!html.classList.contains('no-opening')){
      delay=2600;
      requestAnimationFrame(function(){op.classList.add('is-show');});
      setTimeout(function(){op.classList.add('is-done');},delay);
      try{sessionStorage.setItem('komorebi-wa-open','1');}catch(e){}
    }

    // 写真の連続（6秒ごと）
    var imgs=[].slice.call(document.querySelectorAll('.hero__stage img')),dots=[].slice.call(document.querySelectorAll('.hero__dots i')),cur=0;
    function go(n){imgs.forEach(function(im,i){im.classList.toggle('is-on',i===n);});dots.forEach(function(d,i){d.classList.toggle('is-on',i===n);});}
    if(imgs.length){
      go(0);
      if(!reduce&&imgs.length>1){setInterval(function(){if(document.hidden)return;cur=(cur+1)%imgs.length;go(cur);},6000);}
    }

    // にじみ表示（threshold 0）
    var targets=[].slice.call(document.querySelectorAll('.rv,.vline'));
    function show(el){el.classList.add('is-in');}
    if(reduce||!hasIO){targets.forEach(show);}
    else{
      setTimeout(function(){
        var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){show(e.target);io.unobserve(e.target);}});},{threshold:0});
        targets.forEach(function(t){io.observe(t);});
      },delay?delay-400:0);
      setTimeout(function(){targets.forEach(function(t){if(t.getBoundingClientRect().top<window.innerHeight)show(t);});},delay+3000);
    }

    // 縦タブ
    var tab=document.querySelector('.vtab');
    function onScroll(){if(tab)tab.classList.toggle('is-show',window.scrollY>window.innerHeight*.8);}
    window.addEventListener('scroll',onScroll,{passive:true});onScroll();

    // スマホのメニュー
    var mb=document.querySelector('.menu-btn');
    if(mb){
      mb.addEventListener('click',function(){var open=!html.classList.contains('menu-open');html.classList.toggle('menu-open',open);mb.setAttribute('aria-expanded',open);});
      [].forEach.call(document.querySelectorAll('.drawer a'),function(a){a.addEventListener('click',function(){html.classList.remove('menu-open');mb.setAttribute('aria-expanded','false');});});
    }

    // 見本のフォーム
    var form=document.querySelector('.form');
    if(form){form.addEventListener('submit',function(e){e.preventDefault();var m=form.querySelector('.form__msg');if(m){m.classList.add('is-show');m.focus();}});}
  });
})();
