// Smooth anchors
document.addEventListener('click', e=>{
  const a = e.target.closest('a[href^="#"]');
  if(a){e.preventDefault(); document.querySelector(a.getAttribute('href'))?.scrollIntoView({behavior:'smooth'});}
});
// Burger
const burger=document.querySelector('.burger'); const nav=document.getElementById('nav');
if(burger){burger.addEventListener('click',()=>{nav.style.display=nav.style.display==='flex'?'none':'flex';});}
// Reveal
const io = new IntersectionObserver(es=>es.forEach(e=>e.isIntersecting&&e.target.classList.add('visible')), {threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
// Lightbox
const lb=document.getElementById('lightbox'); const lbImg=document.getElementById('lbImg'); const lbClose=document.getElementById('lbClose');
document.addEventListener('click',e=>{const t=e.target;if(t.matches('.portfolio img')){lb.hidden=false;lbImg.src=t.currentSrc||t.src;}}); if(lbClose){lbClose.onclick=()=>lb.hidden=true;}
document.addEventListener('keydown',e=>{if(e.key==='Escape') lb.hidden=true;});
// Filters
document.querySelectorAll('.filter').forEach(btn=>btn.addEventListener('click',()=>{
  const on = btn.getAttribute('aria-pressed')==='true'?false:true;
  document.querySelectorAll('.filter').forEach(b=>b.setAttribute('aria-pressed','false'));
  btn.setAttribute('aria-pressed', on?'true':'false');
  const cat = on?btn.dataset.cat:'';
  document.querySelectorAll('.portfolio figure').forEach(f=>{
     const show = !cat || f.dataset.cat===cat;
     f.style.display = show ? '' : 'none';
  });
}));
// Counters
function animateNum(el, to){
  const start = 0; const dur = 1400 + Math.random()*600; const t0 = performance.now();
  function step(t){const p = Math.min(1,(t-t0)/dur); el.textContent = Math.floor(start + (to-start)*p).toLocaleString('ru-RU'); if(p<1) requestAnimationFrame(step);}
  requestAnimationFrame(step);
}
fetch('assets/data/content.json').then(r=>r.json()).then(cfg=>{
  const s = cfg.stats||{years:0,projects:0,clients:0};
  const yearsEl = document.querySelector('[data-stat="years"]'); const projEl=document.querySelector('[data-stat="projects"]'); const cliEl=document.querySelector('[data-stat="clients"]');
  const io2=new IntersectionObserver((es)=>{if(es[0].isIntersecting){animateNum(yearsEl,s.years||0);animateNum(projEl,s.projects||0);animateNum(cliEl,s.clients||0); io2.disconnect();}}, {threshold:.5});
  const box=document.getElementById('stats'); if(box) io2.observe(box);
});