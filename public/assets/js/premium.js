(() => {
  'use strict';
  const $=(s,c=document)=>c.querySelector(s), $$=(s,c=document)=>[...c.querySelectorAll(s)];
  const nav=$('.nav'); addEventListener('scroll',()=>nav?.classList.toggle('scrolled',scrollY>20),{passive:true});
  const burger=$('.burger'), links=$('.nav-links');
  const close=()=>{links?.classList.remove('open');burger?.setAttribute('aria-expanded','false');document.body.classList.remove('menu-open')};
  burger?.addEventListener('click',()=>{const open=links.classList.toggle('open');burger.setAttribute('aria-expanded',String(open));document.body.classList.toggle('menu-open',open)});
  $$('.nav-links a[href^="#"]').forEach(a=>a.addEventListener('click',close));
  addEventListener('keydown',e=>{if(e.key==='Escape')close()});
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.1,rootMargin:'0px 0px -30px'}); $$('.reveal').forEach(x=>io.observe(x));
  const loader=$('#preloader'), seen=sessionStorage.getItem('vk_preloader_seen');
  if(seen){loader?.remove()}else if(loader){
    const pv=$('#preloader video'),fill=$('.preloader-line span');let closed=false;
    const hide=()=>{if(closed)return;closed=true;loader.classList.add('hide');sessionStorage.setItem('vk_preloader_seen','1');pv?.pause();setTimeout(()=>loader.remove(),800)};
    pv?.play().catch(()=>{});pv?.addEventListener('ended',hide);pv?.addEventListener('error',hide);$('.preloader-skip')?.addEventListener('click',hide);
    const start=performance.now();const tick=()=>{if(closed)return;const p=pv?.duration?pv.currentTime/pv.duration*100:(performance.now()-start)/4000*100;if(fill)fill.style.width=Math.min(99,p)+'%';if(p>=100)hide();else requestAnimationFrame(tick)};tick();setTimeout(hide,6500);
  }
  const hero=$('.hero-video'); if(hero){hero.muted=true;hero.playsInline=true;hero.play().catch(()=>{});document.addEventListener('visibilitychange',()=>document.hidden?hero.pause():hero.play().catch(()=>{}))}
  const form=$('#lead-form');form?.addEventListener('submit',async e=>{e.preventDefault();const status=$('.form-status');const data=Object.fromEntries(new FormData(form));if(!data.name||!data.phone){status.textContent='Заполните имя и телефон.';return}status.textContent='Отправляем…';try{const r=await fetch('/api/lead',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});if(!r.ok)throw 0;status.textContent='Спасибо. Мы свяжемся с вами в ближайшее время.';form.reset()}catch(_){status.textContent='Не удалось отправить. Позвоните нам: +7 (812) 642-32-47.'}});
  fetch('/data/content.json',{cache:'no-store'}).then(r=>r.ok?r.json():null).then(d=>{
    if(!d?.site)return;
    const map={'[data-content="heroTitle"]':d.site.heroTitle,'[data-content="heroAccent"]':d.site.heroAccent,'[data-content="heroSubtitle"]':d.site.heroSubtitle,'[data-content="footerText"]':d.site.footerText};
    Object.entries(map).forEach(([s,v])=>{if(v&&$(s))$(s).textContent=v});
    if(Array.isArray(d.services)) d.services.forEach((item,i)=>{const card=$$('.service')[i];if(!card)return;const h=$('h3',card),p=$('p',card);if(item.title&&h)h.textContent=item.title;if(item.text&&p)p.textContent=item.text});
  }).catch(()=>{});
})();