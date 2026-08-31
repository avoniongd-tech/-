(() => {
  const set = (selector, value) => { const el=document.querySelector(selector); if(el && typeof value==='string' && value.trim()) el.textContent=value; };
  fetch('/data/content.json',{cache:'no-store'}).then(r=>r.ok?r.json():null).then(data=>{
    if(!data?.site) return;
    set('#hero-title',data.site.heroTitle);
    set('.hero__sub',data.site.heroSubtitle);
    set('.footer__brand-text',data.site.footerText);
  }).catch(()=>{});
})();
