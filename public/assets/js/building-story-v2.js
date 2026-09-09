/* Building Story v2: Narrative 3D construction flow
   Architecture: one scene, 7 layers, real projects, archival language.
   Layers load on-demand. Mobile fallback to 2.5D CSS. No decorative noise. */

const BuildingStory = (() => {
  'use strict';

  const LAYERS = [
    { id: 'site', name: 'Участок', icon: '◼', desc: 'Геодезия и граница участка' },
    { id: 'foundation', name: 'Фундамент', icon: '▢', desc: 'Основание и монолитный каркас' },
    { id: 'shell', name: 'Оболочка', icon: '⌂', desc: 'Стены, перекрытия и проёмы' },
    { id: 'engineering', name: 'Инженерия', icon: '≈', desc: 'Электропроводка, сантехника, вентиляция' },
    { id: 'plaster', name: 'Подготовка', icon: '▨', desc: 'Гипсокартон, шпатлёвка, грунтовка' },
    { id: 'finish', name: 'Отделка', icon: '◆', desc: 'Материалы: плитка, паркет, окраска' },
    { id: 'furnished', name: 'Интерьер', icon: '◈', desc: 'Мебель, текстиль, свет, декор' }
  ];

  const canUse3D = (() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl') || c.getContext('experimental-webgl'));
  })();

  const initCSS25D = () => {
    const container = document.querySelector('[data-building-story]');
    if (!container) return;

    const nav = LAYERS.map((l, i) => `
      <div class="building-story-step" data-step="${i}" aria-label="${l.name}">
        <span class="building-story-step-icon">${l.icon}</span>
        <span class="building-story-step-name">${l.name}</span>
      </div>
    `).join('');

    const layers = LAYERS.map((l, i) => `
      <div class="building-story-layer" data-layer="${i}" style="opacity: ${i === 0 ? 1 : 0}; pointer-events: ${i === 0 ? 'auto' : 'none'};">
        <div class="building-story-layer-blueprint" style="background: linear-gradient(135deg, hsl(0 0% 18%), hsl(0 0% 22%)); display: grid; place-items: center; height: 100%; border: 1px solid rgba(242,238,232,.12);">
          <div style="text-align: center; padding: 40px; max-width: 400px;">
            <p style="font-family: 'DM Mono', monospace; font-size: 11px; letter-spacing: 0.15em; color: rgba(242,238,232,.5); text-transform: uppercase; margin-bottom: 16px;">ЭТАП ${String(i + 1).padStart(2, '0')} / 07</p>
            <p style="font-size: 24px; font-weight: 300; color: rgba(242,238,232,.9); margin-bottom: 8px; letter-spacing: -0.02em;">${l.name}</p>
            <p style="font-size: 13px; color: rgba(242,238,232,.65); line-height: 1.6; margin-bottom: 20px;">${l.desc}</p>
            <div style="height: 1px; background: linear-gradient(90deg, transparent, rgba(200,122,83,.3), transparent); width: 100%;"></div>
          </div>
        </div>
      </div>
    `).join('');

    container.innerHTML = `
      <div class="building-story-css" style="display: grid; grid-template-columns: 140px 1fr; gap: 0; min-height: 700vh; background: linear-gradient(0deg, hsl(0 0% 15%), hsl(0 0% 18%));">
        <nav class="building-story-nav" style="position: sticky; top: 0; height: 100vh; border-right: 1px solid rgba(242,238,232,.08); display: flex; flex-direction: column; padding: 120px 0; gap: 0; background: hsl(0 0% 16%); overflow-y: auto;">
          ${nav}
        </nav>
        <div class="building-story-view" style="position: relative; display: flex; flex-direction: column;">
          <div class="building-story-layers" style="flex: 1; position: relative; overflow: hidden;">
            ${layers}
          </div>
          <div class="building-story-progress" style="position: sticky; bottom: 0; height: 3px; background: rgba(242,238,232,.08); overflow: hidden;">
            <span class="building-story-progress-bar" style="display: block; height: 100%; background: linear-gradient(90deg, hsl(30 60% 50%), hsl(30 55% 45%)); width: 0%; transition: width 0.1s ease;"></span>
          </div>
        </div>
      </div>
    `;

    const steps = container.querySelectorAll('.building-story-step');
    const layers_els = container.querySelectorAll('.building-story-layer');
    const progBar = container.querySelector('.building-story-progress-bar');

    let raf = 0;
    const updateScroll = () => {
      raf = 0;
      const rect = container.getBoundingClientRect();
      const max = Math.max(1, container.offsetHeight - window.innerHeight);
      const p = Math.max(0, Math.min(1, -rect.top / max));
      const activeIdx = Math.min(LAYERS.length - 1, Math.floor(p * LAYERS.length));

      steps.forEach((el, i) => el.classList.toggle('is-active', i === activeIdx));
      layers_els.forEach((el, i) => {
        el.style.opacity = i === activeIdx ? 1 : 0;
        el.style.pointerEvents = i === activeIdx ? 'auto' : 'none';
      });
      progBar.style.width = `${p * 100}%`;
    };

    window.addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(updateScroll); }, {passive: true});
    updateScroll();
  };

  const init3D = () => {
    const container = document.querySelector('[data-building-story]');
    if (!container) return;

    container.innerHTML = `
      <div class="building-story-3d" style="position: relative; width: 100%; height: 700vh; background: linear-gradient(0deg, hsl(0 0% 15%), hsl(0 0% 18%));">
        <div style="position: sticky; top: 0; width: 100%; height: 100vh; display: flex; align-items: center; justify-content: center; color: rgba(242,238,232,.7); font-family: 'Inter Tight', sans-serif; font-size: 14px; text-align: center; padding: 40px;">
          <div style="max-width: 500px;">
            <p style="font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; font-family: 'DM Mono', monospace; margin-bottom: 20px; color: rgba(200,122,83,.8);">Three.js 3D Scene</p>
            <p style="font-size: 24px; font-weight: 300; margin-bottom: 16px; color: rgba(242,238,232,.9); letter-spacing: -0.02em;">Дом, который строится на глазах</p>
            <p style="line-height: 1.6; font-size: 13px; color: rgba(242,238,232,.65); margin-bottom: 24px;">Сцена загрузится здесь: 7 слоёв конструкции, от участка до интерьера. Каждый этап показывает этап работ ВК Реновация.</p>
            <div style="font-family: 'DM Mono', monospace; font-size: 11px; color: rgba(200,122,83,.6);">WebGL инициализация...</div>
          </div>
        </div>
      </div>
    `;

    if (window.gsap && window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
    }
  };

  return {
    init: () => {
      if (!document.querySelector('[data-building-story]')) return;
      canUse3D ? init3D() : initCSS25D();
    },
    getLayers: () => LAYERS,
    canUse3D: () => canUse3D
  };
})();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => BuildingStory.init());
} else {
  BuildingStory.init();
}
