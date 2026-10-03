/* =====================================================================
   ORBITS.IO — TROLL (HUD + термоконтроль)
   Путь: troll.js

   Независимый блок:
   - Показывает HUD слева сверху: батарея, состояние, FPS, разрешение.
   - Плавно регулирует FPS и разрешение по состоянию.
   - SVG-значки батареи и градусника с изменяемым уровнем.
   ===================================================================== */
(function () {
  'use strict';

  const HUD_ID = 'orbits-troll-hud';

  // ===== Состояния =====
  const STATES = ['Nominal', 'Fair', 'Serious', 'Critical'];
  const FPS_TARGET = {
    Nominal:  null,   // native (120/60)
    Fair:     60,
    Serious:  60,
    Critical: 30
  };
  const RES_TARGET = {
    Nominal:  1.00,   // native
    Fair:     1.00,
    Serious:  0.75,   // ~1080p / 1440p * 0.75
    Critical: 0.55    // ~720p
  };

  const COLORS = {
    Nominal:  '#4ade80',
    Fair:     '#fbbf24',
    Serious:  '#f97316',
    Critical: '#ef4444'
  };

  // ===== Состояние =====
  let currentState = 'Nominal';
  let currentFPS = null;         // native
  let currentRes = 1.0;
  let targetFPS = null;
  let targetRes = 1.0;
  let batteryLevel = null;
  let batteryCharging = false;
  let fpsActual = 0;
  let frameTimes = [];
  let lastFrameTime = performance.now();
  let fpsInterval = 0;
  let fpsCounter = 0;

  const subscribers = [];

  function notifySubscribers() {
    subscribers.forEach(cb => {
      try { cb(currentState, targetFPS, targetRes, fpsActual, batteryLevel); } catch (e) {}
    });
  }

  function subscribe(cb) {
    if (typeof cb === 'function') subscribers.push(cb);
    cb(currentState, targetFPS, targetRes, fpsActual, batteryLevel);
  }

  // ===== Измерения =====
  function measureFPS() {
    const now = performance.now();
    const dt = now - lastFrameTime;
    lastFrameTime = now;
    frameTimes.push(dt);
    if (frameTimes.length > 60) frameTimes.shift();
    fpsCounter++;
    if (now - fpsInterval >= 500) {
      fpsActual = Math.round((fpsCounter / (now - fpsInterval)) * 1000);
      fpsCounter = 0;
      fpsInterval = now;
    }
  }

  function averageFrameTime() {
    if (!frameTimes.length) return 16;
    return frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
  }

  // ===== Классификация состояния =====
  function classify() {
    const avg = averageFrameTime();
    // На основе среднего frame time
    // <16.7 мс → Nominal, 16.7-20 → Fair, 20-25 → Serious, >25 → Critical
    let state = 'Nominal';
    if (avg > 25) state = 'Critical';
    else if (avg > 20) state = 'Serious';
    else if (avg > 17.5) state = 'Fair';

    // Thermal API — если доступно
    if ('thermal' in navigator && navigator.thermal) {
      try {
        if (navigator.thermal.state) {
          const t = navigator.thermal.state;
          if (t === 'critical') state = 'Critical';
          else if (t === 'serious') state = 'Serious';
          else if (t === 'fair') state = 'Fair';
        }
      } catch (e) {}
    }

    return state;
  }

  // ===== Батарея =====
  async function initBattery() {
    if (!navigator.getBattery) return;
    try {
      const battery = await navigator.getBattery();
      function update() {
        batteryLevel = Math.round(battery.level * 100);
        batteryCharging = battery.charging;
        renderHUD();
      }
      update();
      battery.addEventListener('levelchange', update);
      battery.addEventListener('chargingchange', update);
    } catch (e) {}
  }

  // ===== SVG: Батарея =====
  function svgBattery(level, charging) {
    if (level === null) return '<span class="troll-icon">--</span>';
    const fillW = Math.max(2, (level / 100) * 20);
    const color = level < 20 ? '#ef4444' : level < 50 ? '#fbbf24' : '#4ade80';
    const bolt = charging
      ? '<path d="M 11 4 L 9 9 L 12 9 L 10 14" stroke="#fff" stroke-width="1.2" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.9"/>'
      : '';
    return `
      <svg class="troll-icon" viewBox="0 0 26 14" width="26" height="14">
        <rect x="0.5" y="0.5" width="23" height="12" rx="2.5"
              fill="none" stroke="currentColor" stroke-width="1.2" opacity="0.5"/>
        <rect x="2" y="2" width="${fillW}" height="9" rx="1.2" fill="${color}" opacity="0.85"/>
        <rect x="24" y="4.5" width="1.5" height="4" rx="0.7" fill="currentColor" opacity="0.5"/>
        ${bolt}
      </svg>`;
  }

  // ===== SVG: Градусник =====
  function svgThermometer(state) {
    const idx = Math.max(0, STATES.indexOf(state));
    const fillH = 4 + (idx / 3) * 8;
    const color = COLORS[state];
    return `
      <svg class="troll-icon" viewBox="0 0 10 18" width="10" height="18">
        <rect x="3" y="1" width="4" height="12" rx="2"
              fill="none" stroke="currentColor" stroke-width="1.1" opacity="0.55"/>
        <circle cx="5" cy="15" r="2.5"
                fill="none" stroke="currentColor" stroke-width="1.1" opacity="0.55"/>
        <rect x="4" y="${15 - fillH + 2}" width="2" height="${fillH}" rx="1" fill="${color}" opacity="0.9"/>
        <circle cx="5" cy="15" r="1.6" fill="${color}" opacity="0.9"/>
      </svg>`;
  }

  // ===== HUD =====
  function injectStyles() {
    if (document.getElementById('orbits-troll-styles')) return;
    const css = `
      #${HUD_ID} {
        position: fixed;
        top: 8px; left: 10px;
        z-index: 2147482000;
        display: flex; align-items: center; gap: 12px;
        padding: 5px 12px;
        background: rgba(0,0,0,0.38);
        border: 1px solid rgba(255,255,255,0.18);
        border-radius: 12px;
        backdrop-filter: blur(10px) saturate(160%);
        -webkit-backdrop-filter: blur(10px) saturate(160%);
        color: #fff;
        font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.5px;
        pointer-events: none;
        user-select: none;
        opacity: 0.95;
        white-space: nowrap;
        text-shadow: 0 1px 2px rgba(0,0,0,0.7);
      }
      #${HUD_ID} .troll-item {
        display: inline-flex; align-items: center; gap: 4px;
      }
      #${HUD_ID} .troll-item .troll-label {
        color: rgba(255,255,255,0.85);
      }
      #${HUD_ID} .troll-item .troll-val {
        color: #fff;
      }
      #${HUD_ID} .troll-state-Nominal  { color: #4ade80; }
      #${HUD_ID} .troll-state-Fair     { color: #fbbf24; }
      #${HUD_ID} .troll-state-Serious  { color: #f97316; }
      #${HUD_ID} .troll-state-Critical { color: #ef4444; }
      #${HUD_ID} .troll-icon {
        opacity: 0.6;
        color: #fff;
        vertical-align: middle;
      }
      #${HUD_ID}.hidden { display: none; }
    `;
    const style = document.createElement('style');
    style.id = 'orbits-troll-styles';
    style.textContent = css;
    document.head.appendChild(style);
  }

  function createHUD() {
    if (document.getElementById(HUD_ID)) return;
    const hud = document.createElement('div');
    hud.id = HUD_ID;
    document.body.appendChild(hud);
  }

  function renderHUD() {
    const hud = document.getElementById(HUD_ID);
    if (!hud) return;

    const battLevel = (batteryLevel !== null) ? batteryLevel + '%' : '--';
    const state = currentState;
    const fps = (fpsActual > 0) ? fpsActual + ' FPS' : '--';
    const res = currentRes.toFixed(1) + 'x';

    hud.innerHTML = `
      <span class="troll-item">
        ${svgBattery(batteryLevel, batteryCharging)}
        <span class="troll-val">${battLevel}</span>
      </span>
      <span class="troll-item">
        ${svgThermometer(state)}
        <span class="troll-val troll-state-${state}">${state}</span>
      </span>
      <span class="troll-item">
        <span class="troll-val">${fps}</span>
      </span>
      <span class="troll-item">
        <span class="troll-val">${res}</span>
      </span>
    `;
  }

  // ===== Плавная регулировка =====
  function smoothAdjust() {
    const newState = classify();
    if (newState !== currentState) {
      currentState = newState;
      targetFPS = FPS_TARGET[newState];
      targetRes = RES_TARGET[newState];
    }
    // Плавно двигаем currentRes к targetRes
    const resStep = 0.01;
    if (currentRes > targetRes) currentRes = Math.max(targetRes, currentRes - resStep);
    else if (currentRes < targetRes) currentRes = Math.min(targetRes, currentRes + resStep * 0.5);

    notifySubscribers();
    renderHUD();
  }

  // ===== Старт =====
  function start() {
    injectStyles();
    createHUD();
    initBattery();

    function loop() {
      measureFPS();
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);

    setInterval(smoothAdjust, 500);
    setTimeout(smoothAdjust, 100);
  }

  // ===== Публичный API =====
  window.Troll = {
    getState: () => currentState,
    getFPSTarget: () => targetFPS,
    getResolutionScale: () => currentRes,
    getFPSActual: () => fpsActual,
    getBattery: () => batteryLevel,
    subscribe: subscribe,
    show: () => { const h = document.getElementById(HUD_ID); if (h) h.classList.remove('hidden'); },
    hide: () => { const h = document.getElementById(HUD_ID); if (h) h.classList.add('hidden'); },
    setVisible: (v) => v ? window.Troll.show() : window.Troll.hide()
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();