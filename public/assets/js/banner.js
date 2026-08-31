
// Simple loader that plays a pre-rendered composited video if present.
// If the file is missing, a poster image remains visible.
document.addEventListener('DOMContentLoaded', () => {
  const video = document.getElementById('heroGirlVideo');
  if (!video) return;
  video.addEventListener('error', () => {
    console.warn('hero_girl_brick.mp4 missing or cannot be loaded. Poster will be shown.');
  });
  // If you want to loop only a hammer segment, set data-start / data-end seconds
  const start = parseFloat(video.dataset.start || '0');
  const end = parseFloat(video.dataset.end || '8');
  if (!isNaN(start) && !isNaN(end)) {
    video.currentTime = start;
    video.addEventListener('timeupdate', () => {
      if (video.currentTime >= end) video.currentTime = start;
    });
  }
});
