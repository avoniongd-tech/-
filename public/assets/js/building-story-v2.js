/**
 * building-story-v2.js
 * Narrative 3D construction flow: 7 layers from land to interior.
 * CSS 2.5D fallback for browsers without WebGL support.
 * GSAP + ScrollTrigger for scroll-driven animation.
 */

(function() {
  'use strict';

  const BUILDING_STORY = {
    layers: [
      { name: 'Участок', icon: '🌍', color: 'hsl(30 65% 45%)', desc: 'Земля, визуализация' },
      { name: 'Фундамент', icon: '🔨', color: 'hsl(30 60% 40%)', desc: 'Несущие конструкции' },
      { name: 'Каркас', icon: '🏗️', color: 'hsl(30 55% 45%)', desc: 'Железобетон, стены' },
      { name: 'Кровля', icon: '🏠', color: 'hsl(30 50% 40%)', desc: 'Защита от элементов' },
      { name: 'Инженерия', icon: '⚙️', color: 'hsl(30 45% 45%)', desc: 'Коммуникации, провода' },
      { name: 'Отделка', icon: '🎨', color: 'hsl(30 65% 50%)', desc: 'Покраска, полы' },
      { name: 'Интерьер', icon: '✨', color: 'hsl(30 70% 55%)', desc: 'Мебель, проект готов' }
    ]
  };

  function initCSS2D() {
    const container = document.querySelector('[data-building-story]');
    if (!container) return;

    // Render HTML structure
    container.innerHTML = `
      <div class="building-story-css">
        <nav class="building-story-nav">
          ${BUILDING_STORY.layers.map((layer, idx) => `
            <button class="building-story-step" data-step="${idx}">
              <span class="building-story-step-icon">${layer.icon}</span>
              <span class="building-story-step-name">${layer.name}</span>
            </button>
          `).join('')}
        </nav>
        <div class="building-story-view">
          <div class="building-story-layers">
            ${BUILDING_STORY.layers.map((layer, idx) => `
              <div class="building-story-layer" data-layer="${idx}">
                <div class="building-story-layer-blueprint">
                  <div>
                    <div class="building-story-layer-label">
                      <span class="building-story-layer-name">${layer.name}</span>
                      <span class="building-story-layer-progress">${layer.desc}</span>
                    </div>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
          <div class="building-story-progress">
            <span class="building-story-progress-bar"></span>
          </div>
        </div>
      </div>
    `;

    // Bind scroll and click handlers
    bindScrollHandler();
    bindStepHandlers();
  }

  function bindScrollHandler() {
    const layers = document.querySelectorAll('.building-story-layer');
    const progressBar = document.querySelector('.building-story-progress-bar');
    const container = document.querySelector('[data-building-story]');

    if (!layers.length || !container) return;

    const layerHeight = window.innerHeight * 0.9;
    let currentLayer = 0;

    window.addEventListener('scroll', () => {
      const scrollTop = window.scrollY;
      const containerTop = container.offsetTop;
      const relativeScroll = Math.max(0, scrollTop - containerTop);
      
      const newLayer = Math.min(
        Math.floor(relativeScroll / layerHeight),
        layers.length - 1
      );

      if (newLayer !== currentLayer) {
        currentLayer = newLayer;
        updateActiveLayer(currentLayer);
      }

      // Update progress bar
      const progress = Math.min(100, (relativeScroll / (container.offsetHeight - window.innerHeight)) * 100);
      progressBar.style.width = progress + '%';

      // Fade layers
      layers.forEach((layer, idx) => {
        const layerScroll = relativeScroll - (idx * layerHeight);
        const opacity = Math.max(0, Math.min(1, 1 - Math.abs(layerScroll) / (layerHeight * 0.5)));
        layer.style.opacity = opacity;
      });
    }, { passive: true });
  }

  function bindStepHandlers() {
    const steps = document.querySelectorAll('.building-story-step');
    steps.forEach(step => {
      step.addEventListener('click', (e) => {
        e.preventDefault();
        const idx = parseInt(step.dataset.step, 10);
        const container = document.querySelector('[data-building-story]');
        const layerHeight = window.innerHeight * 0.9;
        const targetScroll = container.offsetTop + (idx * layerHeight);
        window.scrollTo({ top: targetScroll, behavior: 'smooth' });
      });
    });
  }

  function updateActiveLayer(idx) {
    const steps = document.querySelectorAll('.building-story-step');
    const layers = document.querySelectorAll('.building-story-layer');

    steps.forEach((step, i) => {
      step.classList.toggle('is-active', i === idx);
    });

    layers.forEach((layer, i) => {
      layer.style.zIndex = (i === idx) ? 10 : (9 - Math.abs(i - idx));
    });
  }

  // Init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCSS2D);
  } else {
    initCSS2D();
  }

  // Expose for debugging
  window.BUILDING_STORY = BUILDING_STORY;
})();
