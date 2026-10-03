/* =====================================================================
   ORBITS.IO — MAIN MENU
   Путь: Блоки/menu.js
   ===================================================================== */
(function () {
  'use strict';

  const ASSETS = {
    bg:       'https://cdn.jsdelivr.net/gh/Daniil160111/ORBITS.IO@main/%D0%A4%D0%BE%D0%BD1.jpg',
    flag:     'https://cdn.jsdelivr.net/gh/Daniil160111/ORBITS.IO@main/%D0%A4%D0%BB%D0%B0%D0%B32.jpg',
    logo:     'icon/name.png',
    music:    'https://cdn.jsdelivr.net/gh/Daniil160111/ORBITS.IO@main/%D0%A2%D0%B8%D1%82%D1%83%D0%BB%D1%8C%D0%BD%D1%8B%D0%B9.mp3',
    sfxNext:  'https://cdn.jsdelivr.net/gh/Daniil160111/ORBITS.IO@main/%D0%94%D0%B0%D0%BB%D0%B5%D0%B5.mp3',
    sfxError: 'https://cdn.jsdelivr.net/gh/Daniil160111/ORBITS.IO@main/%D0%9E%D1%88%D0%B8%D0%B1%D0%BA%D0%B0.mp3'
  };

  if (window.ORBITS && ORBITS.registerAssets) {
    ORBITS.registerAssets([
      { key: 'menu_bg',       url: ASSETS.bg },
      { key: 'menu_flag',     url: ASSETS.flag },
      { key: 'menu_music',    url: ASSETS.music },
      { key: 'menu_sfx_next', url: ASSETS.sfxNext },
      { key: 'menu_sfx_err',  url: ASSETS.sfxError }
    ]);
  }

  // =====================================================================
  // ЯЗЫКИ — 4 варианта
  // =====================================================================
  const DICT = {
    ru: {
      solo: 'Одиночная игра',
      online: 'Игра онлайн',
      shop: 'Магазин',
      score: 'Рекорды',
      settings: 'Настройки',
      back: 'На титульный',
      tap: 'Нажмите на экран'
    },
    en: {
      solo: 'Single player',
      online: 'Online game',
      shop: 'Shop',
      score: 'Scores',
      settings: 'Settings',
      back: 'To title',
      tap: 'Tap the screen'
    },
    fr: {
      solo: 'Solo',
      online: 'Jeu en ligne',
      shop: 'Boutique',
      score: 'Scores',
      settings: 'Paramètres',
      back: 'Au titre',
      tap: 'Touchez l\'écran'
    },
    es: {
      solo: 'Un jugador',
      online: 'Juego en línea',
      shop: 'Tienda',
      score: 'Récords',
      settings: 'Ajustes',
      back: 'Al título',
      tap: 'Toca la pantalla'
    }
  };
  function lang() {
    const l = (window.Settings && Settings.get('language')) || 'ru';
    return DICT[l] ? l : 'ru';
  }
  function T(key) {
    const d = DICT[lang()] || DICT.ru;
    return d[key] || DICT.ru[key] || key;
  }

  // ★ Кнопка "Карты" убрана
  const BLOCK_MAP = {
    solo:     'offline',
    online:   'online',
    shop:     'shop',
    score:    'score',
    settings: 'settings'
  };

  const MUSIC_LOOP_START = 6.8;
  const MUSIC_TAIL_TRIM  = 0.012;
  const VOL_SUB_BASE     = 0.5;
  const VOL_TITLE_BASE   = 0.9;

  const RIPPLE_MOVE_MS = 1000;
  const RIPPLE_FADE_MS = 1300;
  const SUB_APPEAR_MS  = 1000;

  let container = null;
  let persistentBg = null;
  let whiteOverlay = null;
  let rippleWrap = null;
  let currentScreen = 'none';
  let assetsLoaded = false;
  let titleLock = false;
  let subLock = false;
  let musicPlayedOnce = false;

  let rippleCanvas = null, rippleGl = null, rippleProgram = null,
      rippleUniforms = {}, rippleTexture = null, rippleRaf = 0,
      rippleCenter = [0.5, 0.5], rippleStart = 0, rippleActive = false,
      rippleInitialized = false;

  let vibeTimeouts = [];

  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const el = (tag, cls, html) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  };

  function getS(key) { return (window.Settings && window.Settings.get) ? window.Settings.get(key) : undefined; }
  function sfxVolume()   { const v = getS('sfxVolume');   return (typeof v === 'number') ? v : 0.8; }
  function musicVolume() { const v = getS('musicVolume'); return (typeof v === 'number') ? v : 0.8; }
  function vibeEnabled() { const v = getS('vibration');   return (typeof v === 'boolean') ? v : true; }

  function sfx(name, baseVolume = 1.0) {
    if (!window.Sound) return;
    try {
      if (!Sound.hasBuffer(name)) return;
      Sound.playSFX(name, { volume: baseVolume * sfxVolume(), fadeIn: 0 });
    } catch (e) {}
  }

  const canVibrate = () => !!navigator.vibrate && vibeEnabled();
  function stopVibrate() {
    vibeTimeouts.forEach(t => clearTimeout(t));
    vibeTimeouts = [];
    if (canVibrate()) { try { navigator.vibrate(0); } catch (e) {} }
  }
  function vibrateWave() {
    if (!canVibrate()) return;
    stopVibrate();
    const pulses = [
      { dur: 7, pause: 40 }, { dur: 6, pause: 55 }, { dur: 5, pause: 70 },
      { dur: 4, pause: 90 }, { dur: 3, pause: 110 }, { dur: 3, pause: 130 },
      { dur: 2, pause: 160 }, { dur: 2, pause: 200 }, { dur: 1, pause: 250 }
    ];
    let t = 0;
    pulses.forEach((p) => {
      const id = setTimeout(() => {
        if (canVibrate()) { try { navigator.vibrate(p.dur); } catch (e) {} }
      }, t);
      vibeTimeouts.push(id);
      t += p.dur + p.pause;
    });
  }
  function vibrateButton() {
    if (!canVibrate()) return;
    stopVibrate();
    try { navigator.vibrate([13, 30, 13]); } catch (e) {}
  }
  function vibrateSensor() {
    if (!canVibrate()) return;
    try { navigator.vibrate([7, 30, 7]); } catch (e) {}
  }

  async function loadAssets() {
    if (assetsLoaded) return;
    if (window.Sound) {
      await Promise.all([
        Sound.loadBuffer('menu_sfx_next', ASSETS.sfxNext).catch(() => {}),
        Sound.loadBuffer('menu_sfx_err',  ASSETS.sfxError).catch(() => {}),
        Sound.loadBuffer('menu_music',    ASSETS.music).catch(() => {})
      ]);
    }
    await Promise.all([loadImage(ASSETS.bg), loadImage(ASSETS.flag), loadImage(ASSETS.logo)]);
    assetsLoaded = true;
  }
  function loadImage(url) {
    return new Promise(resolve => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = url;
    });
  }

  // ===== МУЗЫКА =====
  async function playMenuMusicFirstTime() {
    if (!window.Sound) return;
    try {
      if (!Sound.hasBuffer('menu_music')) await Sound.loadBuffer('menu_music', ASSETS.music);
      await Sound.playMusicIntroLoop('menu_music', {
        loopStart: MUSIC_LOOP_START,
        volume: VOL_TITLE_BASE * musicVolume(),
        fadeIn: 0.5,
        tailTrim: MUSIC_TAIL_TRIM
      });
    } catch (e) { console.warn('menu music error:', e.message); }
  }

  async function playMenuMusicLoopOnly() {
    if (!window.Sound) return;
    try {
      if (!Sound.hasBuffer('menu_music')) await Sound.loadBuffer('menu_music', ASSETS.music);
      Sound.stopMusic(0);
      await Sound.playMusic('menu_music', {
        loop: true,
        loopStart: MUSIC_LOOP_START,
        startAt: MUSIC_LOOP_START,
        volume: VOL_SUB_BASE * musicVolume(),
        fadeIn: 0.25,
        tailTrim: MUSIC_TAIL_TRIM
      });
    } catch (e) { console.warn('menu music loop error:', e.message); }
  }

  function musicQuiet() { if (window.Sound) Sound.setMusicVolume(VOL_SUB_BASE * musicVolume(), 0.7); }
  function musicLoud()  { if (window.Sound) Sound.setMusicVolume(VOL_TITLE_BASE * musicVolume(), 0.7); }

  if (window.Settings && Settings.onChange) {
    Settings.onChange((key) => {
      if (key === 'musicVolume') {
        const v = musicVolume();
        if (currentScreen === 'sub') Sound.setMusicVolume(VOL_SUB_BASE * v, 0.2);
        else if (currentScreen === 'title') Sound.setMusicVolume(VOL_TITLE_BASE * v, 0.2);
      }
      if (key === 'vibration' && !getS('vibration')) stopVibrate();
    });
  }

  // ===== ФОН =====
  async function ensurePersistentBg() {
    if (persistentBg && persistentBg.parentNode === container) return;
    persistentBg = el('div', 'orbits-persistent-bg');
    persistentBg.style.backgroundImage = "url('" + ASSETS.bg + "')";
    container.appendChild(persistentBg);
    await sleep(50);
    persistentBg.classList.add('show');
  }

  // ===== БЕЛЫЙ ПЕРЕХОД =====
  function getWhiteOverlay() {
    if (whiteOverlay && whiteOverlay.parentNode === container) return whiteOverlay;
    whiteOverlay = el('div', 'orbits-white-overlay');
    container.appendChild(whiteOverlay);
    return whiteOverlay;
  }
  async function fadeToWhite(duration = 1000) {
    const ov = getWhiteOverlay();
    ov.style.transition = 'opacity ' + duration + 'ms ease';
    void ov.offsetWidth;
    ov.classList.add('show');
    await sleep(duration);
  }
  async function fadeFromWhite(duration = 1000) {
    if (!whiteOverlay) return;
    whiteOverlay.style.transition = 'opacity ' + duration + 'ms ease';
    whiteOverlay.classList.remove('show');
    await sleep(duration);
  }

  // ===== РЯБЬ =====
  const RIPPLE_VERT = "attribute vec2 a_pos; varying vec2 v_uv; void main() { v_uv = a_pos * 0.5 + 0.5; gl_Position = vec4(a_pos, 0.0, 1.0); }";
  const RIPPLE_FRAG = `
    precision highp float;
    uniform sampler2D u_tex;
    uniform vec2 u_center;
    uniform float u_time;
    uniform float u_fade;
    uniform vec2 u_resolution;
    varying vec2 v_uv;
    float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    float noise(vec2 p) {
      vec2 i = floor(p); vec2 f = fract(p);
      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
    }
    void main() {
      vec2 uv = v_uv;
      vec2 aspectVec = vec2(u_resolution.x / u_resolution.y, 1.0);
      vec2 toCenter = (uv - u_center) * aspectVec;
      float dist = length(toCenter);
      float t = u_time;
      float radius = t * 0.45;
      float ringWidth = 0.10 * (1.0 - t * 0.5);
      float crestWidth = 0.025 * (1.0 - t * 0.7);
      float ringMain = smoothstep(crestWidth, 0.0, abs(dist - radius));
      float ring2 = smoothstep(crestWidth * 0.7, 0.0, abs(dist - radius * 0.65));
      float ring3 = smoothstep(crestWidth * 0.4, 0.0, abs(dist - radius * 1.35));
      float distortZone = smoothstep(ringWidth, 0.0, abs(dist - radius));
      float innerZone = smoothstep(radius + ringWidth, 0.0, dist) * 0.15;
      float distortMask = clamp(distortZone + innerZone, 0.0, 1.0);
      vec2 dir = normalize(toCenter + vec2(0.0001));
      vec2 tangent = vec2(-dir.y, dir.x);
      float radialAmount = (ringMain * 1.0 + ring2 * 0.5 + ring3 * 0.3) * 0.06;
      radialAmount += distortZone * 0.015;
      float tangentAmount = (ring2 * 0.5 - ringMain * 0.3) * 0.035;
      float nz = noise(uv * 45.0 + t * 2.5) * 0.012 * distortMask;
      vec2 distortedUV = uv
        - dir * radialAmount * distortMask / aspectVec
        + tangent * tangentAmount * distortMask / aspectVec
        + vec2(nz);
      vec4 bgColor = texture2D(u_tex, distortedUV);
      float ca = ringMain * 0.010 * distortMask;
      vec4 bgR = texture2D(u_tex, distortedUV + dir * ca / aspectVec);
      vec4 bgB = texture2D(u_tex, distortedUV - dir * ca / aspectVec);
      bgColor = vec4(bgR.r, bgColor.g, bgB.b, 1.0);
      vec3 h1 = vec3(1.0, 0.99, 1.0) * ringMain * 0.95;
      vec3 h2 = vec3(0.9, 0.95, 1.0) * ring2 * 0.55;
      vec3 h3 = vec3(0.85, 0.9, 1.0) * ring3 * 0.35;
      float crest = smoothstep(crestWidth * 0.25, 0.0, abs(dist - radius));
      vec3 crestH = vec3(1.0, 1.0, 1.0) * crest * 1.4;
      float innerShadow = smoothstep(radius + crestWidth * 0.6, radius - crestWidth * 2.5, dist);
      vec3 innerDark = vec3(0.0, 0.0, 0.06) * 0.4 * innerShadow * (1.0 - t);
      float outerShadow = smoothstep(radius - crestWidth * 0.5, radius + crestWidth * 2.5, dist);
      outerShadow *= smoothstep(radius + crestWidth * 5.0, radius + crestWidth * 1.5, dist);
      vec3 outerDark = vec3(0.0, 0.0, 0.06) * 0.22 * outerShadow;
      float glow = smoothstep(radius + 0.25, radius, dist) * 0.20;
      vec3 glowColor = vec3(0.6, 0.8, 1.0) * glow * (1.0 - t);
      vec3 effect = h1 + h2 + h3 + crestH + innerDark + outerDark + glowColor;
      vec3 finalColor = bgColor.rgb + effect * distortMask;
      float fadeAmt = smoothstep(0.66, 1.0, u_fade);
      float fade = 1.0 - fadeAmt;
      vec3 result = mix(bgColor.rgb, finalColor, fade);
      gl_FragColor = vec4(result, 1.0);
    }
  `;

  function compileShader(gl, type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) return null;
    return s;
  }

  async function initRippleGL() {
    if (!rippleWrap || rippleWrap.parentNode !== container) {
      rippleWrap = el('div', 'orbits-ripple-wrap');
      container.appendChild(rippleWrap);
    }
    if (rippleCanvas && rippleCanvas.parentNode === rippleWrap && rippleGl) return true;
    if (rippleInitialized && !rippleGl) return false;
    rippleInitialized = true;

    rippleCanvas = el('canvas', 'orbits-ripple-canvas');
    rippleWrap.appendChild(rippleCanvas);

    const gl = rippleCanvas.getContext('webgl', { antialias: false, alpha: true, premultipliedAlpha: false });
    if (!gl) { rippleCanvas.remove(); rippleCanvas = null; return false; }
    rippleGl = gl;

    const vs = compileShader(gl, gl.VERTEX_SHADER, RIPPLE_VERT);
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, RIPPLE_FRAG);
    if (!vs || !fs) return false;

    rippleProgram = gl.createProgram();
    gl.attachShader(rippleProgram, vs);
    gl.attachShader(rippleProgram, fs);
    gl.linkProgram(rippleProgram);
    if (!gl.getProgramParameter(rippleProgram, gl.LINK_STATUS)) return false;
    gl.useProgram(rippleProgram);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);

    const aPos = gl.getAttribLocation(rippleProgram, 'a_pos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    rippleUniforms.uTex        = gl.getUniformLocation(rippleProgram, 'u_tex');
    rippleUniforms.uCenter     = gl.getUniformLocation(rippleProgram, 'u_center');
    rippleUniforms.uTime       = gl.getUniformLocation(rippleProgram, 'u_time');
    rippleUniforms.uFade       = gl.getUniformLocation(rippleProgram, 'u_fade');
    rippleUniforms.uResolution = gl.getUniformLocation(rippleProgram, 'u_resolution');

    rippleTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, rippleTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.uniform1i(rippleUniforms.uTex, 0);

    const img = await loadImage(ASSETS.bg);
    if (img) {
      gl.bindTexture(gl.TEXTURE_2D, rippleTexture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    }

    function resize() {
      if (!rippleCanvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      rippleCanvas.width = Math.floor(window.innerWidth * dpr);
      rippleCanvas.height = Math.floor(window.innerHeight * dpr);
      gl.viewport(0, 0, rippleCanvas.width, rippleCanvas.height);
    }
    resize();
    window.addEventListener('resize', resize);
    return true;
  }

  function waterRipple(x, y) {
    return new Promise(async (resolve) => {
      const ok = await initRippleGL();
      if (!ok || !rippleCanvas) { resolve(); return; }
      const nx = x / window.innerWidth;
      const ny = 1.0 - y / window.innerHeight;
      rippleCenter = [nx, ny];
      rippleStart = performance.now();
      rippleActive = true;
      if (rippleRaf) cancelAnimationFrame(rippleRaf);
      rippleCanvas.style.opacity = '1';

      function finish() {
        rippleActive = false;
        if (rippleCanvas) rippleCanvas.style.opacity = '0';
        resolve();
      }
      function frame(now) {
        if (!rippleActive || !rippleGl || !rippleCanvas) { finish(); return; }
        const elapsed = now - rippleStart;
        const tMove = Math.min(1, elapsed / RIPPLE_MOVE_MS);
        const tFade = Math.min(1, elapsed / RIPPLE_FADE_MS);
        rippleGl.uniform2f(rippleUniforms.uCenter, rippleCenter[0], rippleCenter[1]);
        rippleGl.uniform1f(rippleUniforms.uTime, tMove);
        rippleGl.uniform1f(rippleUniforms.uFade, tFade);
        rippleGl.uniform2f(rippleUniforms.uResolution, rippleCanvas.width, rippleCanvas.height);
        rippleGl.clearColor(0, 0, 0, 0);
        rippleGl.clear(rippleGl.COLOR_BUFFER_BIT);
        rippleGl.drawArrays(rippleGl.TRIANGLES, 0, 6);
        if (tFade < 1) rippleRaf = requestAnimationFrame(frame);
        else finish();
      }
      rippleRaf = requestAnimationFrame(frame);
    });
  }

  // ===== ЭКРАНЫ =====
  function buildTitleScreen() {
    const screen = el('div', 'orbits-title-screen');
    const title = el('div', 'orbits-title-name');
    const titleImg = el('img', 'orbits-title-img');
    titleImg.src = ASSETS.logo;
    titleImg.alt = 'ORBITS.IO';
    title.appendChild(titleImg);
    screen.appendChild(title);
    const hint = el('div', 'orbits-tap-hint', T('tap'));
    screen.appendChild(hint);
    return screen;
  }

  async function showTitleScreen(isFirstTime = false) {
    currentScreen = 'title';
    titleLock = true;
    const oldTitle = container.querySelector('.orbits-title-screen');
    if (oldTitle) oldTitle.remove();
    const oldSub = container.querySelector('.orbits-sub-screen');
    if (oldSub) oldSub.remove();

    await ensurePersistentBg();
    const screen = buildTitleScreen();
    container.appendChild(screen);
    initRippleGL();

    await sleep(50);
    if (isFirstTime && !musicPlayedOnce) {
      await sleep(500);
      playMenuMusicFirstTime();
      musicPlayedOnce = true;
    }
    await sleep(500);
    const title = screen.querySelector('.orbits-title-name');
    title.classList.add('show');
    await sleep(1300);
    const hint = screen.querySelector('.orbits-tap-hint');
    hint.classList.add('show');
    vibrateSensor();
    await sleep(700);
    titleLock = false;

    const onTap = async (e) => {
      if (titleLock) return;
      if (currentScreen !== 'title') return;
      titleLock = true;
      vibrateWave();
      sfx('menu_sfx_next', 1.0);
      const point = getPointer(e);
      if (point) waterRipple(point.x, point.y);
      setTimeout(() => goToSubScreen(), SUB_APPEAR_MS);
    };
    screen.addEventListener('click', onTap, { once: true });
    screen.addEventListener('touchend', (e) => {
      e.preventDefault();
      onTap(e);
    }, { once: true, passive: false });
  }

  // Возврат из блока — сразу подменю
  async function showSubScreenDirect() {
    currentScreen = 'sub';
    titleLock = false;
    subLock = false;

    const oldTitle = container.querySelector('.orbits-title-screen');
    if (oldTitle) oldTitle.remove();
    const oldSub = container.querySelector('.orbits-sub-screen');
    if (oldSub) oldSub.remove();

    await ensurePersistentBg();
    initRippleGL();

    const sub = buildSubScreen();
    container.appendChild(sub);
    attachButtonHandlers(sub);

    await sleep(50);
    sub.classList.add('fade-in');

    await playMenuMusicLoopOnly();
  }

  function getPointer(e) {
    if (e.touches && e.touches[0]) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    if (e.changedTouches && e.changedTouches[0]) return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
    if (typeof e.clientX === 'number') return { x: e.clientX, y: e.clientY };
    return null;
  }

  function buildSubScreen() {
    const screen = el('div', 'orbits-sub-screen');
    const veil = el('div', 'orbits-veil');
    screen.appendChild(veil);
    const stripes = el('div', 'orbits-stripes');
    const sL = el('div', 'orbits-stripe orbits-stripe-left');
    const sR = el('div', 'orbits-stripe orbits-stripe-right');
    sL.style.backgroundImage = "url('" + ASSETS.flag + "')";
    sR.style.backgroundImage = "url('" + ASSETS.flag + "')";
    stripes.appendChild(sL); stripes.appendChild(sR);
    screen.appendChild(stripes);

    const wrap = el('div', 'orbits-buttons');
    // ★ "Карты" больше нет
    const items = [
      { label: T('solo'),     id: 'solo' },
      { label: T('online'),   id: 'online' },
      { label: T('shop'),     id: 'shop' },
      { label: T('score'),    id: 'score' },
      { label: T('settings'), id: 'settings' }
    ];
    items.forEach((b) => {
      const btn = el('div', 'orbits-btn');
      btn.dataset.id = b.id;
      btn.innerHTML = '<span class="orbits-btn-label">' + b.label + '</span>';
      wrap.appendChild(btn);
    });
    screen.appendChild(wrap);

    const back = el('div', 'orbits-back-btn', T('back'));
    screen.appendChild(back);
    return screen;
  }

  function attachButtonHandlers(screen) {
    const buttons = screen.querySelectorAll('.orbits-btn');
    const touchInside = (btn, touch) => {
      const r = btn.getBoundingClientRect();
      return touch.clientX >= r.left && touch.clientX <= r.right &&
             touch.clientY >= r.top && touch.clientY <= r.bottom;
    };
    let anyClicked = false;
    const lockAll = () => { anyClicked = true; };

    buttons.forEach((btn, index) => {
      let active = false;
      const setHover = (on) => {
        if (anyClicked) return;
        if (on && !active) { active = true; btn.classList.add('hover'); }
        else if (!on && active) { active = false; btn.classList.remove('hover'); }
      };
      setTimeout(() => btn.classList.add('appear'), 100 + index * 180);

      const doOpen = (e) => {
        if (e) e.preventDefault();
        if (subLock || anyClicked) return;
        lockAll();
        subLock = true;
        vibrateButton();
        sfx('menu_sfx_next', 1.0);
        btn.classList.add('clicked');
        const blockName = BLOCK_MAP[btn.dataset.id];
        if (blockName && window.ORBITS && ORBITS.openBlock) {
          setTimeout(() => ORBITS.openBlock(blockName), 180);
        } else {
          subLock = false;
        }
      };

      btn.addEventListener('touchstart', (e) => {
        if (touchInside(btn, e.touches[0])) setHover(true);
      }, { passive: true });
      btn.addEventListener('touchmove', (e) => {
        if (touchInside(btn, e.touches[0])) setHover(true);
        else setHover(false);
      }, { passive: true });
      btn.addEventListener('touchend', (e) => {
        if (active) doOpen(e);
        setTimeout(() => setHover(false), 200);
      });
      btn.addEventListener('touchcancel', () => setHover(false));
      btn.addEventListener('mouseenter', () => setHover(true));
      btn.addEventListener('mouseleave', () => setHover(false));
      btn.addEventListener('click', doOpen);
    });

    const back = screen.querySelector('.orbits-back-btn');
    const goBack = (e) => {
      if (e) e.preventDefault();
      if (subLock || anyClicked) return;
      lockAll();
      subLock = true;
      vibrateButton();
      sfx('menu_sfx_err', 0.9);
      goToTitleScreen();
    };
    back.addEventListener('click', goBack);
    back.addEventListener('touchend', goBack);
  }

  async function goToSubScreen() {
    if (currentScreen === 'sub') return;
    const title = container.querySelector('.orbits-title-screen');
    const hint  = container.querySelector('.orbits-tap-hint');
    const name  = container.querySelector('.orbits-title-name');
    musicQuiet();
    if (hint) { hint.style.transition = 'opacity 0.5s ease'; hint.classList.remove('show'); hint.style.opacity = '0'; }
    if (name) { name.style.transition = 'opacity 0.5s ease, transform 0.5s ease'; name.classList.remove('show'); name.style.opacity = '0'; }
    const sub = buildSubScreen();
    container.appendChild(sub);
    attachButtonHandlers(sub);
    await sleep(50);
    sub.classList.add('fade-in');
    setTimeout(() => { if (title) title.remove(); }, 500);
    currentScreen = 'sub';
    titleLock = false;
    subLock = false;
  }

  async function goToTitleScreen() {
    const sub = container.querySelector('.orbits-sub-screen');
    if (!sub) { await showTitleScreen(false); return; }
    sub.classList.remove('fade-in');
    musicLoud();
    await sleep(900);
    sub.remove();
    currentScreen = 'title';
    titleLock = false;
    subLock = false;
    await showTitleScreen(false);
  }

  // ===== СТИЛИ =====
  function injectStyles() {
    if (document.getElementById('orbits-menu-styles')) return;
    const css = `
      .orbits-persistent-bg {
        position: absolute; inset: 0;
        background-size: cover; background-position: center;
        opacity: 0; filter: brightness(1.5);
        transition: opacity 1.2s ease; z-index: 1;
      }
      .orbits-persistent-bg.show { opacity: 1; }
      .orbits-ripple-wrap { position: absolute; inset: 0; z-index: 999; pointer-events: none; }
      .orbits-white-overlay {
        position: absolute; inset: 0; background: #ffffff;
        z-index: 9999; opacity: 0; pointer-events: none; will-change: opacity;
      }
      .orbits-white-overlay.show { opacity: 1; }
      .orbits-title-screen, .orbits-sub-screen {
        position: absolute; inset: 0; overflow: hidden;
        color: #fff; z-index: 5; pointer-events: auto;
        transition: opacity 0.7s ease;
      }
      .orbits-title-screen { cursor: pointer; opacity: 1; }
      .orbits-sub-screen { opacity: 0; }
      .orbits-sub-screen.fade-in { opacity: 1; }
      .orbits-title-name {
        position: absolute; left: 6vw; bottom: 12vh;
        width: min(48vw, 600px); z-index: 5;
        opacity: 0; transform: translateX(-30px);
        transition: opacity 1s ease, transform 1s cubic-bezier(0.16,1,0.3,1);
      }
      .orbits-title-name.show { opacity: 1; transform: translateX(0); }
      .orbits-title-img {
        display: block; width: 100%; height: auto;
        filter: brightness(1.5) drop-shadow(0 0 30px rgba(160,100,255,1));
      }
      .orbits-tap-hint {
        position: absolute; left: 50%; bottom: 6vh;
        transform: translateX(-50%);
        font-size: 21px; letter-spacing: 4px; text-transform: uppercase;
        color: #fff; opacity: 0;
        transition: opacity 0.7s ease;
        text-shadow: 0 0 14px rgba(180,120,255,1);
        animation: orbits-hint-pulse 2.2s ease-in-out infinite;
        z-index: 6; white-space: nowrap;
      }
      .orbits-tap-hint.show { opacity: 0.95; }
      @keyframes orbits-hint-pulse { 0%,100% { opacity: 0.55; } 50% { opacity: 1; } }
      .orbits-ripple-canvas {
        position: absolute; inset: 0; width: 100%; height: 100%;
        pointer-events: none; opacity: 0; transition: opacity 0.3s ease;
      }
      .orbits-veil {
        position: absolute; inset: 0;
        background: linear-gradient(135deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0) 55%);
        z-index: 2; pointer-events: none;
      }
      .orbits-stripes { position: absolute; inset: 0; z-index: 3; pointer-events: none; overflow: hidden; }
      .orbits-stripe {
        position: absolute; top: 0; bottom: 0; width: 30%;
        background-size: 180px 180px; background-repeat: repeat;
        opacity: 0.15;
        filter: invert(1) brightness(1.6) contrast(1.1);
        mix-blend-mode: screen;
        animation: orbits-stripe-move 36s linear infinite;
        transition: transform 1.4s cubic-bezier(0.22, 1, 0.36, 1);
        will-change: transform;
      }
      .orbits-stripe-left  { left: -10%; transform: skewX(-8deg) translateY(-100%) translateX(-4%); }
      .orbits-stripe-right { right: -15%; transform: skewX(-8deg) translateY(100%) translateX(4%); }
      .orbits-sub-screen.fade-in .orbits-stripe-left  { transform: skewX(-8deg) translateY(0) translateX(-4%); }
      .orbits-sub-screen.fade-in .orbits-stripe-right { transform: skewX(-8deg) translateY(0) translateX(4%); }
      @keyframes orbits-stripe-move { 0% { background-position: 0 0; } 100% { background-position: 360px -360px; } }
      .orbits-buttons {
        position: absolute; left: 6vw; top: 16vh;
        width: min(48vw, 600px);
        display: flex; flex-direction: column; gap: 2.2vh;
        z-index: 5;
      }
      .orbits-btn {
        position: relative; display: flex; align-items: center;
        padding: 1.4vh 2.4vh;
        background: rgba(230, 230, 240, 0.75);
        color: #2a2a3a; font-size: 18px; letter-spacing: 1px;
        border-radius: 6px; cursor: pointer;
        transform-origin: left center;
        opacity: 0; transform: translateX(-60px) scale(0.9);
        filter: brightness(0.4);
        transition:
          transform 0.5s cubic-bezier(0.16,1,0.3,1),
          opacity 0.5s ease, filter 0.5s ease,
          background 0.25s ease, color 0.25s ease, box-shadow 0.25s ease;
        user-select: none;
        clip-path: polygon(0 0, 96% 0, 100% 50%, 96% 100%, 0 100%);
      }
      .orbits-btn.appear { opacity: 1; transform: translateX(0) scale(1); filter: brightness(1); }
      .orbits-btn.hover, .orbits-btn.clicked {
        background: #ffb800; color: #1a1a22;
        transform: scale(1.2, 1.3);
        transform-origin: left center;
        box-shadow: 0 0 32px rgba(255,184,0,0.9);
      }
      .orbits-btn-label { pointer-events: none; }
      .orbits-back-btn {
        position: absolute; left: 50%; bottom: 4vh;
        transform: translateX(-50%);
        padding: 1.4vh 3.6vh;
        background: rgba(230, 230, 240, 0.6);
        color: #2a2a3a; font-size: 20px;
        letter-spacing: 2px; text-transform: uppercase;
        border-radius: 10px; cursor: pointer;
        z-index: 6; opacity: 0;
        transition: opacity 0.7s ease, transform 0.2s ease, background 0.2s ease;
        user-select: none;
      }
      .orbits-sub-screen.fade-in .orbits-back-btn { opacity: 1; }
      .orbits-back-btn:hover, .orbits-back-btn:active {
        background: #ffb800;
        transform: translateX(-50%) scale(1.05);
      }
    `;
    const style = document.createElement('style');
    style.id = 'orbits-menu-styles';
    style.textContent = css;
    document.head.appendChild(style);
  }

  async function start() {
    container = document.getElementById('game-container') || document.body;
    container.style.position = 'absolute';
    container.style.inset = '0';
    container.style.background = 'transparent';
    container.style.overflow = 'hidden';

    injectStyles();
    await loadAssets();
    await ensurePersistentBg();

    const returning = !!window.__ORBITS_RETURNING__;
    window.__ORBITS_RETURNING__ = false;

    if (returning) {
      await showSubScreenDirect();
    } else {
      await showTitleScreen(true);
    }
  }

  start();
})();