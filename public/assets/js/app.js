document.addEventListener('DOMContentLoaded', () => {
  const v = document.getElementById('heroVideo');
  if (!v) return;
  const tryPlay = () => v.play().catch(()=>{});
  v.muted = true; v.setAttribute('playsinline', '');
  tryPlay();
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(e => { if (e.isIntersecting) tryPlay(); else v.pause(); });
    }, {threshold:.2});
    io.observe(v);
  }
});