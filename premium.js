(function(){
  var html=document.documentElement;
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine=window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  var hasIO='IntersectionObserver' in window;

  document.addEventListener('DOMContentLoaded',function(){
    // オープニング（1回だけ）
    var op=document.querySelector('.op');
    if(op&&!html.classList.contains('no-op')){
      setTimeout(function(){op.classList.add('is-done');},1900);
      setTimeout(function(){op.style.display='none';},3000);
      try{sessionStorage.setItem('komorebi-pm-open','1');}catch(e){}
    }

    // ヒーロー：写真の入れ替え
    var hs=[].slice.call(document.querySelectorAll('.pm-hero .hero__main img')),hi=0,cnt=document.querySelector('.hero__count b');
    if(hs.length>1&&!reduce){setInterval(function(){if(document.hidden)return;hs[hi].classList.remove('is-on');hi=(hi+1)%hs.length;hs[hi].classList.add('is-on');if(cnt)cnt.textContent='0'+(hi+1);},5000);}

    // 読んだ量のバー
    var pb=document.querySelector('.progress');
    // 横スクロール
    var hsec=document.querySelector('.hs'),track=hsec&&hsec.querySelector('.hs__track'),hbar=hsec&&hsec.querySelector('.hs__bar i');
    function hsOn(){return hsec&&!reduce&&window.innerWidth>=1024;}
    function hsSize(){
      if(!hsec)return;
      if(hsOn()){var d=track.scrollWidth-window.innerWidth;hsec.style.height=(window.innerHeight+Math.max(0,d))+'px';}
      else{hsec.style.height='';track.style.transform='';}
    }
    var tick=false;
    function frame(){
      tick=false;
      var y=window.scrollY,H=document.documentElement.scrollHeight-window.innerHeight;
      if(pb&&!reduce)pb.style.transform='scaleX('+(H>0?y/H:0)+')';
      if(hsOn()){
        var r=hsec.getBoundingClientRect(),d=track.scrollWidth-window.innerWidth,p=Math.min(1,Math.max(0,-r.top/(hsec.offsetHeight-window.innerHeight||1)));
        track.style.transform='translate3d('+(-d*p).toFixed(1)+'px,0,0)';
        if(hbar)hbar.style.transform='scaleX('+p+')';
      }
    }
    window.addEventListener('scroll',function(){if(!tick){tick=true;requestAnimationFrame(frame);}},{passive:true});
    window.addEventListener('resize',function(){hsSize();frame();});
    hsSize();frame();
    window.addEventListener('load',function(){hsSize();frame();});

    // 数字が増える
    var nums=[].slice.call(document.querySelectorAll('[data-count]'));
    function countUp(el){
      var to=+el.getAttribute('data-count'),t0=null,dur=1400;
      if(reduce){el.textContent=to;return;}
      function st(t){if(!t0)t0=t;var k=Math.min(1,(t-t0)/dur);el.textContent=Math.round(to*(1-Math.pow(1-k,3)));if(k<1)requestAnimationFrame(st);}
      requestAnimationFrame(st);
    }
    if(hasIO){var nio=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){countUp(e.target);nio.unobserve(e.target);}});},{threshold:0});nums.forEach(function(n){nio.observe(n);});}
    else nums.forEach(function(n){n.textContent=n.getAttribute('data-count');});

    // 流れる写真カード：画面外で停止
    var strip=document.querySelector('.strip');
    if(strip&&hasIO){new IntersectionObserver(function(es){strip.classList.toggle('is-off',!es[0].isIntersecting);},{threshold:0}).observe(strip);}

    // ストーリー：章ごとに左の写真を替える
    var sx=[].slice.call(document.querySelectorAll('.story-x__fix img')),lab=document.querySelector('.story-x__label');
    if(sx.length&&hasIO){
      var cio=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){var n=+e.target.getAttribute('data-i');sx.forEach(function(im,i){im.classList.toggle('is-on',i===n);});if(lab)lab.textContent=e.target.getAttribute('data-label');}});},{threshold:0,rootMargin:'-45% 0px -45% 0px'});
      [].forEach.call(document.querySelectorAll('.chap[data-i]'),function(c){cio.observe(c);});
    }

    if(!fine||reduce)return;
    // ここから下はPCだけの演出

    // マウスで小写真が動く
    var hero=document.querySelector('.pm-hero'),deps=hero?[].slice.call(hero.querySelectorAll('[data-depth]')):[];
    if(hero&&deps.length){hero.addEventListener('mousemove',function(e){var cx=e.clientX/window.innerWidth-.5,cy=e.clientY/window.innerHeight-.5;deps.forEach(function(d){var k=+d.getAttribute('data-depth');d.style.translate=(cx*k).toFixed(1)+'px '+(cy*k).toFixed(1)+'px';});});}

    // カーソル
    var cur=document.createElement('div');cur.className='cur';cur.innerHTML='<span>view</span>';document.body.appendChild(cur);html.classList.add('has-cur');
    var mx=0,my=0,cx2=0,cy2=0;
    document.addEventListener('mousemove',function(e){mx=e.clientX;my=e.clientY;cur.classList.add('is-on');});
    document.addEventListener('mouseleave',function(){cur.classList.remove('is-on');});
    (function loop(){cx2+=(mx-cx2)*.2;cy2+=(my-cy2)*.2;cur.style.transform='translate('+cx2+'px,'+cy2+'px)';requestAnimationFrame(loop);})();
    document.addEventListener('mouseover',function(e){var t=e.target.closest('a,button,summary,input,select,textarea');cur.classList.toggle('is-link',!!t&&!t.closest('[data-view]'));cur.classList.toggle('is-view',!!e.target.closest('[data-view]'));});

    // お品書き：写真がカーソルについてくる
    var hm=document.querySelector('.hover-menu'),fp=document.querySelector('.float-ph');
    if(hm&&fp){
      var fimgs=fp.querySelectorAll('img'),fx=0,fy=0,tx=0,ty=0;
      [].forEach.call(hm.querySelectorAll('a'),function(a,i){
        a.addEventListener('mouseenter',function(){fp.classList.add('is-on');[].forEach.call(fimgs,function(im,j){im.classList.toggle('is-on',i===j);});});
        a.addEventListener('mouseleave',function(){fp.classList.remove('is-on');});
      });
      hm.addEventListener('mousemove',function(e){tx=e.clientX+240;ty=e.clientY-20;});
      (function fl(){fx+=(tx-fx)*.14;fy+=(ty-fy)*.14;fp.style.left=fx+'px';fp.style.top=fy+'px';requestAnimationFrame(fl);})();
    }

    // マグネットのボタン
    [].forEach.call(document.querySelectorAll('.btn-soft,.btn-line,.cta__arrow,.more i'),function(b){
      b.addEventListener('mousemove',function(e){var r=b.getBoundingClientRect();b.style.translate=((e.clientX-r.left-r.width/2)*.25).toFixed(1)+'px '+((e.clientY-r.top-r.height/2)*.35).toFixed(1)+'px';});
      b.addEventListener('mouseleave',function(){b.style.translate='';});
    });

    // カードの立体的な傾き
    [].forEach.call(document.querySelectorAll('.tilt'),function(c){
      c.addEventListener('mousemove',function(e){var r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;c.style.transform='perspective(900px) rotateY('+(x*8).toFixed(2)+'deg) rotateX('+(-y*8).toFixed(2)+'deg)';});
      c.addEventListener('mouseleave',function(){c.style.transform='';});
    });
  });
})();
