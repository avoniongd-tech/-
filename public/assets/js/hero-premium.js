(() => {
  'use strict';
  
  // ===== CINEMATIC HERO ENTRANCE =====
  const hero = document.querySelector('.hero');
  const title = document.querySelector('.hero__title');
  const video = document.querySelector('.hero__video');
  
  if (video) {
    video.muted = true;
    video.playsInline = true;
    video.autoplay = true;
    video.loop = true;
    video.play().catch(() => {});
  }
  
  // Parallax on mouse move (desktop only)
  if (matchMedia('(pointer:fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.addEventListener('mousemove', (e) => {
      if (!hero) return;
      const rect = hero.getBoundingClientRect();
      if (rect.top > innerHeight) return;
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      if (video) video.style.transform = `scale(1.02) translateX(${x * 8}px) translateY(${y * 8}px)`;
    });
  }
  
  // ===== SCROLL REVEAL WITH STAGGER =====
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => {
          e.target.classList.add('visible');
          revealObs.unobserve(e.target);
        }, i * 80);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
  
  document.querySelectorAll('.reveal, .stagger-item, .parallax-card').forEach(el => {
    revealObs.observe(el);
  });
  
  // ===== BLUR EFFECT ON SCROLL =====
  let ticking = false;
  const updateBlur = () => {
    const cards = document.querySelectorAll('.blur-on-scroll');
    cards.forEach(card => {
      const rect = card.getBoundingClientRect();
      const dist = Math.abs(rect.top - innerHeight / 2);
      const blur = Math.max(0, Math.min(8, (dist / 200)));
      card.style.filter = `blur(${blur}px)`;
    });
    ticking = false;
  };
  
  addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateBlur);
      ticking = true;
    }
  }, { passive: true });
  
  // ===== FLOATING ANIMATION TRIGGER =====
  const floats = document.querySelectorAll('.float-sm, .float-md, .float-lg');
  const floatObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.animationPlayState = 'running';
      }
    });
  }, { threshold: 0.1 });
  
  floats.forEach(el => floatObs.observe(el));
})();
