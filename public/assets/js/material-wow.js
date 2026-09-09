(() => {
  'use strict';
  const hero=document.querySelector('.hero');
  if(!hero)return;
  const video=hero.querySelector('.hero__video');
  const fine=matchMedia('(pointer:fine)').matches;
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let mx=0,my=0,raf=0;
  const paint=()=>{raf=0;hero.style.setProperty('--mx',mx.toFixed(1)+'px');hero.style.setProperty('--my',my.toFixed(1)+'px')};
  if(fine&&!reduce){
    hero.addEventListener('pointermove',e=>{const r=hero.getBoundingClientRect();mx=(e.clientX-r.left-r.width/2)/r.width*34;my=(e.clientY-r.top-r.height/2)/r.height*24;if(!raf)raf=requestAnimationFrame(paint)},{passive:true});
    hero.addEventListener('pointerleave',()=>{mx=0;my=0;if(!raf)raf=requestAnimationFrame(paint)},{passive:true});
  }
  let scrollRaf=0;
  addEventListener('scroll',()=>{if(scrollRaf)return;scrollRaf=requestAnimationFrame(()=>{scrollRaf=0;const r=hero.getBoundingClientRect(),p=Math.max(0,Math.min(1,-r.top/Math.max(1,hero.offsetHeight-innerHeight)));hero.style.setProperty('--hero-progress',p.toFixed(3));if(video&&!reduce)video.style.filter=`brightness(${.72-p*.08}) saturate(${.86-p*.14}) contrast(1.06)`})},{passive:true});
  if(reduce)return;
  const reveal=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('wow-visible');reveal.unobserve(e.target)}}),{threshold:.18});
  document.querySelectorAll('.wow-reveal').forEach(el=>reveal.observe(el));
})();
