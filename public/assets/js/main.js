/* ===== VK RENOVATION — MAIN JS ===== */
'use strict';

/* ---------- NAV SCROLL ---------- */
const nav = document.querySelector('.nav');
const navLinks = document.querySelector('.nav__links');
const burger = document.querySelector('.nav__burger');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

burger?.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  const spans = burger.querySelectorAll('span');
  const isOpen = navLinks.classList.contains('open');
  spans[0].style.transform = isOpen ? 'rotate(45deg) translate(5px,5px)' : '';
  spans[1].style.opacity = isOpen ? '0' : '1';
  spans[2].style.transform = isOpen ? 'rotate(-45deg) translate(5px,-5px)' : '';
});

document.querySelectorAll('.nav__link').forEach(l => {
  l.addEventListener('click', () => navLinks.classList.remove('open'));
});

/* ---------- REVEAL ON SCROLL ---------- */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      const delay = e.target.dataset.delay || 0;
      setTimeout(() => e.target.classList.add('visible'), delay);
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .process-step').forEach((el, i) => {
  if (!el.dataset.delay) el.dataset.delay = i * 80;
  revealObserver.observe(el);
});

/* ---------- COUNTER ANIMATION ---------- */
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const suffix = el.dataset.suffix || '';
  const duration = 1800;
  const start = performance.now();
  const update = (now) => {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(target * eased) + suffix;
    if (p < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      animateCounter(e.target);
      counterObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('[data-target]').forEach(el => counterObserver.observe(el));

/* ---------- PORTFOLIO FILTER ---------- */
const filterBtns = document.querySelectorAll('.filter-btn');
const portfolioItems = document.querySelectorAll('.portfolio-item');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const cat = btn.dataset.cat;
    portfolioItems.forEach(item => {
      const show = cat === 'all' || item.dataset.cat === cat;
      item.style.transition = 'opacity .3s, transform .3s';
      item.style.opacity = show ? '1' : '0.15';
      item.style.transform = show ? '' : 'scale(0.96)';
      item.style.pointerEvents = show ? '' : 'none';
    });
  });
});

/* ---------- LIGHTBOX ---------- */
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxCaption = document.getElementById('lightbox-caption');

document.querySelectorAll('.portfolio-item[data-src]').forEach(item => {
  item.addEventListener('click', () => {
    lightboxImg.src = item.dataset.src;
    lightboxCaption.textContent = item.dataset.title || '';
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  });
});

lightbox?.addEventListener('click', (e) => {
  if (e.target === lightbox || e.target.classList.contains('lightbox__close')) {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => { lightboxImg.src = ''; }, 300);
  }
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') lightbox?.classList.remove('open');
});

/* ---------- FORM ---------- */
const form = document.getElementById('contact-form');
form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = form.querySelector('[type=submit]');
  const status = form.querySelector('.form-status') || (() => { const x=document.createElement('p'); x.className='form-status'; x.setAttribute('role','status'); form.append(x); return x; })();
  if (!form.name.value.trim() || !form.phone.value.trim() || !form.querySelector('[name=consent]')?.checked) { status.textContent='Укажите имя, телефон и подтвердите согласие на обработку данных.'; status.className='form-status error'; return; }
  btn.disabled = true; btn.textContent = 'Отправляем…'; status.textContent='';
  try {
    const body=Object.fromEntries(new FormData(form).entries());
    const r=await fetch('/api/leads',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    const j=await r.json(); if(!r.ok) throw Error(j.error||'Не удалось отправить заявку');
    status.textContent='Заявка отправлена. Мы свяжемся с вами.'; status.className='form-status success'; form.reset(); btn.textContent='Заявка отправлена ✓';
  } catch(err) { status.textContent=err.message; status.className='form-status error'; btn.textContent='Попробовать ещё раз'; }
  finally { setTimeout(()=>{btn.disabled=false;if(btn.textContent!=='Заявка отправлена ✓')btn.textContent='Отправить заявку'},3500); }
});

/* ---------- HERO VIDEO: fixed centered layer ---------- */
const heroBg = document.querySelector('.hero__video');
if (heroBg) heroBg.style.transform='none';

/* ---------- ACTIVE NAV LINK ---------- */
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav__link[href^="#"]');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      navAnchors.forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id);
      });
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => sectionObserver.observe(s));

/* ---------- CURSOR GLOW (DESKTOP) ---------- */
if (window.matchMedia('(pointer:fine)').matches) {
  const glow = document.createElement('div');
  glow.style.cssText = `
    position:fixed;pointer-events:none;z-index:9999;
    width:300px;height:300px;border-radius:50%;
    background:radial-gradient(circle,oklch(68% 0.14 75 / 0.06) 0%,transparent 70%);
    transform:translate(-50%,-50%);transition:transform .08s linear;
    top:0;left:0;
  `;
  document.body.appendChild(glow);
  window.addEventListener('mousemove', e => {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
  }, { passive: true });
}

/* ---------- SMOOTH ANCHOR ---------- */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
