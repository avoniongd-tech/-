/* ===== VK RENOVATION — MAIN JS ===== */
'use strict';

/* ---------- SITE PRELOADER ---------- */
(() => {
  const loader = document.getElementById('site-preloader');
  if (!loader) return;
  const video = document.getElementById('site-preloader-video');
  const fill = document.getElementById('site-preloader-fill');
  const percent = document.getElementById('site-preloader-percent');
  const skip = document.getElementById('site-preloader-skip');
  let closed = false;
  const started = performance.now();
  const fallbackMs = 4500;

  const close = () => {
    if (closed) return;
    closed = true;
    if (fill) fill.style.width = '100%';
    if (percent) percent.textContent = '100%';
    loader.classList.add('is-hidden');
    window.setTimeout(() => loader.remove(), 800);
  };

  skip?.addEventListener('click', close);
  video?.addEventListener('ended', close);
  video?.addEventListener('error', close);
  video?.addEventListener('stalled', () => { window.setTimeout(() => { if (!video.readyState) close(); }, 1800); }, {once:true});
  video?.play?.().catch(() => {});

  const tick = () => {
    if (closed) return;
    const duration = Number.isFinite(video?.duration) && video.duration > 0 ? video.duration : null;
    const value = duration ? (video.currentTime / duration) * 100 : ((performance.now() - started) / fallbackMs) * 100;
    const progress = Math.min(99, Math.max(0, value));
    if (fill) fill.style.width = progress + '%';
    if (percent) percent.textContent = Math.round(progress) + '%';
    if (value >= 100) close();
    else window.setTimeout(tick, 60);
  };
  tick();
})();

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
form?.addEventListener('submit', (e) => {
  e.preventDefault();
  const btn = form.querySelector('[type=submit]');
  btn.disabled = true;
  btn.textContent = 'Отправляем…';
  setTimeout(() => {
    btn.textContent = 'Заявка отправлена ✓';
    btn.style.background = 'linear-gradient(135deg,#2a6b3c,#3a8f52)';
    form.reset();
    setTimeout(() => {
      btn.disabled = false;
      btn.textContent = 'Отправить заявку';
      btn.style.background = '';
    }, 4000);
  }, 1200);
});

/* Parallax intentionally disabled: keeps video smooth on mobile. */

/* ---------- SYNCHRONIZED HERO / LOGO VIDEO ---------- */
(() => {
  const videos = [...document.querySelectorAll('video[data-sync-group="hero"]')];
  if (videos.length < 2) return;
  const align = () => {
    const master = videos[1];
    if (!master || !Number.isFinite(master.currentTime)) return;
    videos.forEach(video => {
      if (video !== master && Math.abs(video.currentTime - master.currentTime) > 0.08) {
        try { video.currentTime = master.currentTime; } catch (_) {}
      }
    });
  };
  videos.forEach(video => {
    video.muted = true;
    video.playsInline = true;
    video.addEventListener('loadedmetadata', align, {once:false});
    video.addEventListener('play', () => { videos.forEach(v => v.play().catch(() => {})); align(); }, {once:true});
  });
})();

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

/* Cursor glow disabled for smoother scrolling and lower GPU usage. */

/* ---------- CONTACT CTA ---------- */
document.querySelectorAll('a[href="#contact"]').forEach(link => {
  link.addEventListener('click', () => {
    const target = document.getElementById('contact');
    if (!target) return;
    window.setTimeout(() => {
      const first = target.querySelector('input,select,textarea');
      first?.focus({preventScroll:true});
    }, 450);
  });
});

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
