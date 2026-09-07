(() => {
  'use strict';
  const film=document.querySelector('.scroll-film');
  if(!film)return;
  const stage=film.querySelector('.scroll-film__stage'),canvas=film.querySelector('.scroll-film__canvas'),ctx=canvas?.getContext('2d',{alpha:false}),progress=film.querySelector('.scroll-film__progress'),counter=film.querySelector('.scroll-film__counter'),title=film.querySelector('.scroll-film__title'),copy=film.querySelector('.scroll-film__copy');
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const frames=[
   {title:'Замысел',copy:'Начинаем с задачи, ритма жизни и архитектуры пространства.'},
   {title:'Подготовка',copy:'Выверяем геометрию, инженерные решения и будущую смету.'},
   {title:'Работа',copy:'Преобразуем пространство поэтапно — с контролем деталей.'},
   {title:'Финиш',copy:'Передаём интерьер, в котором всё на своём месте.'}
  ];
  let raf=0,ready=false;
  const draw=()=>{if(!ctx||!canvas)return;const w=canvas.clientWidth||innerWidth,h=canvas.clientHeight||innerHeight,dpr=Math.min(devicePixelRatio||1,2),cw=Math.round(w*dpr),ch=Math.round(h*dpr);if(canvas.width!==cw||canvas.height!==ch){canvas.width=cw;canvas.height=ch}ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);const vw=innerWidth<=700?1.03:1.16, vh=innerWidth<=700?1.18:1.04, scale=Math.max(w/720*vw,h/1280*vh),dw=720*scale,dh=1280*scale;ctx.drawImage(canvas._video,(w-dw)/2,(h-dh)/2,dw,dh)};
  const update=()=>{raf=0;if(!stage)return;const rect=stage.getBoundingClientRect(),max=Math.max(1,stage.offsetHeight-innerHeight),p=Math.max(0,Math.min(1,-rect.top/max));const i=Math.min(frames.length-1,Math.floor(p*frames.length));if(progress)progress.style.width=(p*100)+'%';if(counter)counter.textContent=String(i+1).padStart(2,'0')+' / 04';if(title&&title.textContent!==frames[i].title)title.textContent=frames[i].title;if(copy&&copy.textContent!==frames[i].copy)copy.textContent=frames[i].copy;if(canvas?._video?.readyState>=2)draw()};
  const request=()=>{if(!raf)raf=requestAnimationFrame(update)};addEventListener('scroll',request,{passive:true});addEventListener('resize',()=>{draw();request()},{passive:true});
  if(reduce){update();return}
  const video=document.createElement('video');video.muted=true;video.playsInline=true;video.preload='metadata';video.src='assets/video/hero.mp4';video.setAttribute('aria-hidden','true');video.style.display='none';if(canvas)canvas._video=video;video.addEventListener('loadeddata',()=>{ready=true;draw();request()});video.addEventListener('error',()=>{canvas?.classList.add('is-fallback')});video.load();request();
})();
