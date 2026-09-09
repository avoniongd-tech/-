const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const prefersCoarse = matchMedia('(pointer: coarse)').matches;

const loader = document.querySelector('.site-loader');
let loaderDone = false;
function finishLoader(){ if(loaderDone)return; loaderDone=true; loader?.classList.add('is-done'); }
window.setTimeout(finishLoader, 1000);
window.addEventListener('load', finishLoader, {once:true});

const nav = document.querySelector('[data-nav]');
function syncNav(){ nav?.classList.toggle('is-scrolled', window.scrollY > 40); }
window.addEventListener('scroll', syncNav, {passive:true}); syncNav();

const objects = document.querySelector('.objects');
const objectItems = [...document.querySelectorAll('.object-selector__item')];
const objectImages = [...document.querySelectorAll('.object-image')];
const objectLabel = document.querySelector('[data-object-label]');
const objectNames = ['Квартира', 'Загородный дом', 'Таунхаус'];
let selectedObject = -1;
function selectObject(index){
  if(index === selectedObject)return;
  selectedObject=index;
  objectItems.forEach((el,i)=>el.classList.toggle('is-active', i===index));
  objectImages.forEach((el,i)=>el.classList.toggle('is-active', i===index));
  if(objectLabel)objectLabel.textContent=objectNames[index];
}
objectItems.forEach((el,i)=>el.addEventListener('click',()=>selectObject(i)));

const transformation = document.querySelector('.transformation');
const baStage = document.querySelector('.ba-stage');
const baSteps = [...document.querySelectorAll('.ba-step')];
const progressLine = document.querySelector('.transformation__progress span');
let raf=0;
function updateWithoutGsap(){
  raf=0;
  const updatePinned=(section, callback)=>{
    if(!section)return;
    const rect=section.getBoundingClientRect();
    const max=Math.max(1,section.offsetHeight-window.innerHeight);
    callback(Math.max(0,Math.min(1,-rect.top/max)));
  };
  updatePinned(objects,p=>selectObject(Math.min(2,Math.floor(p*3))));
  updatePinned(transformation,p=>{
    const value=p*100;
    baStage?.style.setProperty('--reveal',`${value}%`);
    progressLine?.style.setProperty('width',`${value}%`);
    baSteps.forEach((el,i)=>el.classList.toggle('is-active',i===Math.min(2,Math.floor(p*3))));
  });
  const hero=document.querySelector('.hero'), media=document.querySelector('.hero__media');
  if(hero&&media&&!prefersReduced){
    const r=hero.getBoundingClientRect(),p=Math.max(0,Math.min(1,-r.top/Math.max(1,hero.offsetHeight-innerHeight)));
    media.style.transform=`scale(${1.08-p*.08}) translateY(${-p*2}%)`;
  }
}
function requestFallback(){if(!raf)raf=requestAnimationFrame(updateWithoutGsap)}

if(window.gsap && window.ScrollTrigger && !prefersReduced){
  gsap.registerPlugin(ScrollTrigger);
  const heroMedia=document.querySelector('.hero__media');
  if(heroMedia)gsap.to(heroMedia,{scale:1,filter:'brightness(.3) saturate(.5) blur(2px)',ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});
  gsap.to('.hero__content',{y:-90,opacity:.18,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});
  if(objects)ScrollTrigger.create({trigger:objects,start:'top top',end:'bottom bottom',scrub:true,onUpdate:self=>selectObject(Math.min(2,Math.floor(self.progress*3)))});
  if(transformation&&baStage)ScrollTrigger.create({trigger:transformation,start:'top top',end:'bottom bottom',scrub:true,onUpdate:self=>{const p=self.progress;baStage.style.setProperty('--reveal',`${p*100}%`);progressLine?.style.setProperty('width',`${p*100}%`);baSteps.forEach((el,i)=>el.classList.toggle('is-active',i===Math.min(2,Math.floor(p*3))))}});
  const portfolio=document.querySelector('.portfolio'),track=document.querySelector('.portfolio__track');
  if(portfolio&&track)gsap.to(track,{x:()=>-(Math.max(0,track.scrollWidth-innerWidth+110)),ease:'none',scrollTrigger:{trigger:portfolio,start:'top top',end:'bottom bottom',scrub:1,invalidateOnRefresh:true}});
}else{
  window.addEventListener('scroll',requestFallback,{passive:true});
  window.addEventListener('resize',requestFallback,{passive:true});
  requestFallback();
}

if(!prefersReduced&&!prefersCoarse){
  const visual=document.querySelector('.object-visual');
  visual?.addEventListener('pointermove',e=>{const r=visual.getBoundingClientRect();visual.style.transform=`perspective(1000px) rotateX(${((e.clientY-r.top)/r.height-.5)*-2}deg) rotateY(${((e.clientX-r.left)/r.width-.5)*2}deg)`},{passive:true});
  visual?.addEventListener('pointerleave',()=>{visual.style.transform='';},{passive:true});
}

const form=document.querySelector('#estimate-form');
form?.addEventListener('submit',async e=>{
  e.preventDefault();
  const status=form.querySelector('.form-status'), button=form.querySelector('button[type="submit"]');
  const data=Object.fromEntries(new FormData(form).entries());
  if(status)status.textContent='Отправляем…'; if(button)button.disabled=true;
  try{
    const response=await fetch('/api/lead',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
    if(!response.ok)throw new Error('delivery failed');
    if(status)status.textContent='Заявка принята. Мы свяжемся с вами в ближайшее время.';
    form.reset();
  }catch{ if(status)status.textContent='Позвоните нам: +7 812 642-32-47 — обсудим проект напрямую.'; }
  finally{ if(button)button.disabled=false; }
});
