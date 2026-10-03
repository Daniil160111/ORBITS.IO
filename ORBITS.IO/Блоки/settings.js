/* =====================================================================
   ORBITS.IO — SETTINGS BLOCK (v7 — откат v6 + фиксы)
   Путь: Блоки/settings.js

   Что сделано:
   - ВОЗВРАТ к логике v4/v5 buildMultiToggle (как было, до слома)
   - ФИКС: шар стоит под выбранным языком (case-insensitive indexOf)
   - ФИКС: жёсткий clamp — кноб не выходит за пределы трека
   - ФИКС: убраны чёрные точки в жидком стекле
   - Кнопка "Стереть все данные" на 2-й странице
   ===================================================================== */
(function () {
  'use strict';

  const MUSIC_URLS = [
    'https://cdn.jsdelivr.net/gh/Daniil160111/ORBITS.IO@main/%D0%9D1.mp3',
    'https://raw.githubusercontent.com/Daniil160111/ORBITS.IO/refs/heads/main/%D0%9D1.mp3',
    'https://github.com/Daniil160111/ORBITS.IO/raw/refs/heads/main/%D0%9D1.mp3'
  ];

  const ASSETS = {
    bg:        'https://cdn.jsdelivr.net/gh/Daniil160111/ORBITS.IO@main/%D0%A4%D0%BE%D0%BD%D0%BC%D0%B5%D0%BD%D1%8E.jpg',
    sfxAdjust: 'https://cdn.jsdelivr.net/gh/Daniil160111/ORBITS.IO@main/%D0%9A%D0%BD%D0%BE%D0%BF%D0%BA%D0%B0.mp3',
    sfxNext:   'https://cdn.jsdelivr.net/gh/Daniil160111/ORBITS.IO@main/%D0%94%D0%B0%D0%BB%D0%B5%D0%B5.mp3',
    sfxBack:   'https://cdn.jsdelivr.net/gh/Daniil160111/ORBITS.IO@main/%D0%9F%D1%80%D0%BE%D0%B4%D0%BE%D0%BB%D0%B6%D0%B8%D1%82%D1%8C.mp3'
  };

  if (window.ORBITS && ORBITS.registerAssets) {
    ORBITS.registerAssets([
      { key: 'set_bg',         url: ASSETS.bg },
      { key: 'set_sfx_adjust', url: ASSETS.sfxAdjust },
      { key: 'set_sfx_next',   url: ASSETS.sfxNext },
      { key: 'set_sfx_back',   url: ASSETS.sfxBack },
      { key: 'set_music',      url: MUSIC_URLS[0] }
    ]);
  }

  // ===== ЯЗЫКИ =====
  const DICT = {
    ru: {
      title: 'Настройки', back: 'Назад', save: 'Сохранить',
      nickname: 'Ник', music: 'Музыка', sfx: 'Эффекты',
      vibration: 'Вибрация', brightness: 'Яркость',
      lang_title: 'Язык',
      unsaved_title: 'Несохранённые изменения',
      unsaved_text: 'Вы изменили настройки, но не сохранили их.\nЧто сделать?',
      unsaved_save: 'Сохранить и выйти',
      unsaved_discard: 'Не сохранять и выйти',
      unsaved_cancel: 'Отмена',
      reset_btn: 'Стереть все данные',
      reset_title: 'Внимание!',
      reset_text: 'Все данные будут удалены безвозвратно:\nнастройки, кэш, прогресс.\nИгра вернётся к заводским настройкам.',
      reset_yes: 'Да, стереть',
      reset_no: 'Отмена',
      reset_confirm2_title: 'Вы уверены?',
      reset_confirm2_text: 'Это действие нельзя отменить.',
      reset_confirm2_yes: 'Стереть навсегда',
      reset_doing: 'Очистка...'
    },
    en: {
      title: 'Settings', back: 'Back', save: 'Save',
      nickname: 'Nickname', music: 'Music', sfx: 'Effects',
      vibration: 'Vibration', brightness: 'Brightness',
      lang_title: 'Language',
      unsaved_title: 'Unsaved changes',
      unsaved_text: 'You changed settings but didn\'t save them.\nWhat to do?',
      unsaved_save: 'Save and exit',
      unsaved_discard: 'Discard and exit',
      unsaved_cancel: 'Cancel',
      reset_btn: 'Erase all data',
      reset_title: 'Warning!',
      reset_text: 'All data will be permanently deleted:\nsettings, cache, progress.\nThe game will be reset to factory defaults.',
      reset_yes: 'Yes, erase',
      reset_no: 'Cancel',
      reset_confirm2_title: 'Are you sure?',
      reset_confirm2_text: 'This action cannot be undone.',
      reset_confirm2_yes: 'Erase forever',
      reset_doing: 'Erasing...'
    },
    fr: {
      title: 'Paramètres', back: 'Retour', save: 'Enregistrer',
      nickname: 'Pseudo', music: 'Musique', sfx: 'Effets',
      vibration: 'Vibration', brightness: 'Luminosité',
      lang_title: 'Langue',
      unsaved_title: 'Modifications non enregistrées',
      unsaved_text: 'Vous avez modifié les paramètres sans les enregistrer.\nQue faire ?',
      unsaved_save: 'Enregistrer et quitter',
      unsaved_discard: 'Ne pas enregistrer',
      unsaved_cancel: 'Annuler',
      reset_btn: 'Effacer toutes les données',
      reset_title: 'Attention !',
      reset_text: 'Toutes les données seront supprimées définitivement :\nparamètres, cache, progression.\nLe jeu sera réinitialisé aux paramètres d\'usine.',
      reset_yes: 'Oui, effacer',
      reset_no: 'Annuler',
      reset_confirm2_title: 'Êtes-vous sûr ?',
      reset_confirm2_text: 'Cette action est irréversible.',
      reset_confirm2_yes: 'Effacer définitivement',
      reset_doing: 'Suppression...'
    },
    es: {
      title: 'Ajustes', back: 'Atrás', save: 'Guardar',
      nickname: 'Apodo', music: 'Música', sfx: 'Efectos',
      vibration: 'Vibración', brightness: 'Brillo',
      lang_title: 'Idioma',
      unsaved_title: 'Cambios sin guardar',
      unsaved_text: 'Has cambiado los ajustes sin guardarlos.\n¿Qué hacer?',
      unsaved_save: 'Guardar y salir',
      unsaved_discard: 'No guardar y salir',
      unsaved_cancel: 'Cancelar',
      reset_btn: 'Borrar todos los datos',
      reset_title: '¡Atención!',
      reset_text: 'Todos los datos se eliminarán permanentemente:\najustes, caché, progreso.\nEl juego volverá a la configuración de fábrica.',
      reset_yes: 'Sí, borrar',
      reset_no: 'Cancelar',
      reset_confirm2_title: '¿Estás seguro?',
      reset_confirm2_text: 'Esta acción no se puede deshacer.',
      reset_confirm2_yes: 'Borrar para siempre',
      reset_doing: 'Borrando...'
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

  const LANG_LIST = ['ru', 'en', 'fr', 'es'];
  const LANG_LABELS = ['RU', 'EN', 'FR', 'ES'];

  const BLOCK_MUSIC_VOLUME = 0.7;
  const MUSIC_KEY = 'set_music';

  let container = null;
  let root = null;
  let viewportEl = null;
  let savedSnapshot = null;
  let working = null;
  let dirty = false;
  let modalOpen = false;
  let currentPage = 'main';

  let vibeTimeouts = [];

  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const el = (tag, cls, html) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  };

  function getS(key) { return (window.Settings && window.Settings.get) ? window.Settings.get(key) : undefined; }

  // ===== ВИБРАЦИЯ =====
  function vibeEnabled() { const v = getS('vibration'); return (typeof v === 'boolean') ? v : true; }
  const canVibrate = () => !!navigator.vibrate && vibeEnabled();
  function stopVibrate() {
    vibeTimeouts.forEach(t => clearTimeout(t));
    vibeTimeouts = [];
    if (canVibrate()) { try { navigator.vibrate(0); } catch (e) {} }
  }
  let lastVibeTime = 0;
  function vibrateScroll(speedPxPerSec) {
    if (!canVibrate()) return;
    const now = performance.now();
    if (now - lastVibeTime < 40) return;
    lastVibeTime = now;
    const strength = Math.max(1, Math.min(12, Math.round(speedPxPerSec / 180)));
    try { navigator.vibrate(strength); } catch (e) {}
  }
  function vibrateButton() {
    if (!canVibrate()) return;
    stopVibrate();
    const pulses = [
      { dur: 12, pause: 28 }, { dur: 9, pause: 40 }, { dur: 6, pause: 55 },
      { dur: 4, pause: 75 }, { dur: 3, pause: 100 }, { dur: 2, pause: 140 }
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
  function vibrateToggle() {
    if (!canVibrate()) return;
    stopVibrate();
    const pulses = [
      { dur: 8, pause: 25 }, { dur: 6, pause: 35 }, { dur: 5, pause: 50 },
      { dur: 4, pause: 70 }, { dur: 3, pause: 95 }, { dur: 2, pause: 130 }
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

  // ===== SFX =====
  async function loadSounds() {
    if (!window.Sound) return;
    await Promise.all([
      Sound.loadBuffer('set_sfx_adjust', ASSETS.sfxAdjust).catch(() => {}),
      Sound.loadBuffer('set_sfx_next',   ASSETS.sfxNext).catch(() => {}),
      Sound.loadBuffer('set_sfx_back',   ASSETS.sfxBack).catch(() => {})
    ]);
  }
  function playSFX(key, base = 1.0) {
    if (!window.Sound) return;
    try {
      if (!Sound.hasBuffer(key)) return;
      const v = (typeof getS('sfxVolume') === 'number') ? getS('sfxVolume') : 0.8;
      Sound.playSFX(key, { volume: base * v, fadeIn: 0 });
    } catch (e) {}
  }

  // ===== МУЗЫКА =====
  async function loadBlockMusicWithFallback() {
    if (!window.Sound) throw new Error('Sound не загружен');
    if (Sound.hasBuffer(MUSIC_KEY)) return true;
    for (let i = 0; i < MUSIC_URLS.length; i++) {
      const url = MUSIC_URLS[i];
      try {
        await Sound.loadBuffer(MUSIC_KEY, url);
        if (Sound.getDuration(MUSIC_KEY) > 0) return true;
      } catch (e) {}
    }
    throw new Error('Все URL музыки не сработали');
  }
  async function startBlockMusic() {
    if (!window.Sound) return;
    try {
      try { Sound.stopMusic(0); } catch (e) {}
      await loadBlockMusicWithFallback();
      const v = BLOCK_MUSIC_VOLUME * ((typeof getS('musicVolume') === 'number') ? getS('musicVolume') : 0.8);
      await Sound.playMusic(MUSIC_KEY, { loop: true, volume: v, fadeIn: 0.3 });
    } catch (e) {}
  }
  function setBlockMusicVolume(musicVol01) {
    if (!window.Sound) return;
    try { Sound.setMusicVolume(BLOCK_MUSIC_VOLUME * musicVol01, 0); } catch (e) {}
  }

  // ===== SNAPSHOT =====
  function takeSnapshot() {
    const all = (window.Settings && Settings.getAll) ? Settings.getAll() : {};
    return {
      musicVolume01: (typeof all.musicVolume === 'number') ? all.musicVolume : 0.8,
      sfxVolume01:   (typeof all.sfxVolume   === 'number') ? all.sfxVolume   : 0.8,
      vibration:     (typeof all.vibration   === 'boolean') ? all.vibration   : true,
      nickname:      (typeof all.nickname    === 'string')  ? all.nickname    : '',
      brightness:    (typeof all.brightness  === 'number')  ? all.brightness  : 100,
      language:      (typeof all.language    === 'string')  ? all.language    : 'ru'
    };
  }
  function recomputeDirty() {
    dirty =
      working.musicVolume !== Math.round(savedSnapshot.musicVolume01 * 100) ||
      working.sfxVolume   !== Math.round(savedSnapshot.sfxVolume01   * 100) ||
      working.vibration   !== savedSnapshot.vibration ||
      working.nickname    !== savedSnapshot.nickname ||
      working.brightness  !== savedSnapshot.brightness ||
      working.language    !== savedSnapshot.language;
  }
  function applyPreview(key, uiValue) {
    if (key === 'musicVolume') setBlockMusicVolume(uiValue / 100);
    if (key === 'brightness')  applyBrightness(uiValue);
  }
  function revertToSaved(key) {
    if (key === 'musicVolume') setBlockMusicVolume(savedSnapshot.musicVolume01);
    if (key === 'brightness')  applyBrightness(savedSnapshot.brightness);
  }
  function applyBrightness(v) {
    const b = Math.max(0, Math.min(150, v)) / 100;
    document.documentElement.style.filter = 'brightness(' + b + ')';
  }

  // ===== SLIDER =====
  function buildSlider(key, label, min, max, uiValue, formatter) {
    const row = el('div', 'st-row st-slider-row');
    row.dataset.key = key;
    row.appendChild(el('div', 'st-label', label));

    const trackWrap = el('div', 'st-slider-track');
    const track = el('div', 'st-slider-track-inner');
    const fill = el('div', 'st-slider-fill');
    const knob = el('div', 'st-slider-knob');
    const shine = el('div', 'st-slider-knob-shine');
    const refl = el('div', 'st-slider-knob-reflect');
    knob.appendChild(refl);
    knob.appendChild(shine);
    track.appendChild(fill); track.appendChild(knob);
    trackWrap.appendChild(track);
    row.appendChild(trackWrap);
    const valBox = el('div', 'st-value', formatter(uiValue));
    row.appendChild(valBox);

    let dragging = false;
    let previewUiValue = uiValue;
    let lastMoveTime = 0, lastMoveX = 0;

    function updateUI(v) {
      const ratio = (v - min) / (max - min);
      const w = Math.max(0, Math.min(1, ratio));
      fill.style.width = (w * 100) + '%';
      knob.style.left = (w * 100) + '%';
      valBox.textContent = formatter(v);
    }
    function valueFromClientX(clientX) {
      const rect = track.getBoundingClientRect();
      const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
      return Math.round(min + (x / rect.width) * (max - min));
    }
    function onStart(e) {
      dragging = true;
      previewUiValue = working[key];
      knob.classList.add('st-knob-active');
      lastMoveTime = performance.now();
      const p = e.touches ? e.touches[0] : e;
      lastMoveX = p.clientX;
      e.preventDefault();
    }
    function onMove(e) {
      if (!dragging) return;
      const p = e.touches ? e.touches[0] : e;
      const now = performance.now();
      const dt = Math.max(1, now - lastMoveTime);
      const dx = Math.abs(p.clientX - lastMoveX);
      const speed = (dx / dt) * 1000;
      lastMoveTime = now; lastMoveX = p.clientX;
      vibrateScroll(speed);
      const v = valueFromClientX(p.clientX);
      previewUiValue = v;
      updateUI(v);
      applyPreview(key, v);
      e.preventDefault();
    }
    function onEnd(e) {
      if (!dragging) return;
      dragging = false;
      knob.classList.remove('st-knob-active');
      working[key] = previewUiValue;
      updateUI(previewUiValue);
      revertToSaved(key);
      recomputeDirty();
      if (e) e.preventDefault();
    }
    trackWrap.addEventListener('touchstart', onStart, { passive: false });
    trackWrap.addEventListener('touchmove',  onMove,  { passive: false });
    trackWrap.addEventListener('touchend',   onEnd);
    trackWrap.addEventListener('touchcancel',onEnd);
    trackWrap.addEventListener('mousedown', onStart);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);

    updateUI(uiValue);
    return row;
  }

  // ===== MINI TOGGLE =====
  function buildMiniToggle(key, label, value) {
    const row = el('div', 'st-row st-mini-row');
    row.dataset.key = key;
    row.appendChild(el('div', 'st-label', label));

    const trackWrap = el('div', 'st-mini-track');
    const knob = el('div', 'st-mini-knob');
    const shine = el('div', 'st-mini-shine');
    const refl = el('div', 'st-mini-reflect');
    knob.appendChild(refl);
    knob.appendChild(shine);
    trackWrap.appendChild(knob);
    row.appendChild(trackWrap);

    const KNOB_TRAVEL = 34;
    let dragging = false;
    let lastMoveTime = 0, lastMoveX = 0;
    let currentPos = value ? 1 : 0;

    function applyTrackState(p) {
      const on = p >= 0.5;
      trackWrap.classList.toggle('on', on);
    }
    function setPos(p, animate) {
      p = Math.max(0, Math.min(1, p));
      currentPos = p;
      const x = KNOB_TRAVEL * p;
      const scale = dragging ? 1.4 : 1;
      knob.style.transition = animate
        ? 'transform 0.42s cubic-bezier(0.16,1,0.3,1), box-shadow 0.35s ease'
        : 'transform 0.06s linear, box-shadow 0.3s ease';
      knob.style.transform = 'translateY(-50%) translateX(' + x + 'px) scale(' + scale + ')';
      applyTrackState(p);
    }
    function commitValue(v) {
      const changed = working[key] !== v;
      working[key] = v;
      if (v) vibrateToggle();
      playSFX('set_sfx_adjust', 1.0);
      if (changed) recomputeDirty();
    }
    function onStart(e) {
      dragging = true;
      trackWrap.classList.add('st-mini-hold');
      knob.classList.add('st-mini-knob-active');
      const p = e.touches ? e.touches[0] : e;
      lastMoveX = p.clientX;
      lastMoveTime = performance.now();
      setPos(currentPos, false);
      e.preventDefault();
    }
    function onMove(e) {
      if (!dragging) return;
      const p = e.touches ? e.touches[0] : e;
      const now = performance.now();
      const dt = Math.max(1, now - lastMoveTime);
      const dx = p.clientX - lastMoveX;
      const speed = (Math.abs(dx) / dt) * 1000;
      lastMoveX = p.clientX; lastMoveTime = now;
      if (speed > 0) vibrateScroll(speed);
      const rect = trackWrap.getBoundingClientRect();
      const rel = (p.clientX - rect.left - 13) / KNOB_TRAVEL;
      setPos(rel, false);
      e.preventDefault();
    }
    function onEnd(e) {
      if (!dragging) return;
      dragging = false;
      trackWrap.classList.remove('st-mini-hold');
      knob.classList.remove('st-mini-knob-active');
      const target = currentPos < 0.5 ? 0 : 1;
      setPos(target, true);
      commitValue(!!target);
      if (e) e.preventDefault();
    }
    let tapStart = 0;
    trackWrap.addEventListener('touchstart', (e) => {
      tapStart = performance.now();
      onStart(e);
    }, { passive: false });
    trackWrap.addEventListener('touchmove', onMove, { passive: false });
    trackWrap.addEventListener('touchend', (e) => {
      const dt = performance.now() - tapStart;
      const moved = Math.abs(currentPos - (value ? 1 : 0)) > 0.1;
      if (dt < 200 && !moved) {
        dragging = false;
        trackWrap.classList.remove('st-mini-hold');
        knob.classList.remove('st-mini-knob-active');
        const nv = !working[key];
        setPos(nv ? 1 : 0, true);
        commitValue(nv);
        if (e) e.preventDefault();
        return;
      }
      onEnd(e);
    });
    trackWrap.addEventListener('touchcancel', onEnd);

    trackWrap.addEventListener('mousedown', (e) => {
      tapStart = performance.now();
      onStart(e);
    });
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', (e) => {
      const dt = performance.now() - tapStart;
      const moved = Math.abs(currentPos - (value ? 1 : 0)) > 0.1;
      if (dt < 200 && !moved) {
        dragging = false;
        trackWrap.classList.remove('st-mini-hold');
        knob.classList.remove('st-mini-knob-active');
        const nv = !working[key];
        setPos(nv ? 1 : 0, true);
        commitValue(nv);
        return;
      }
      onEnd(e);
    });

    setPos(value ? 1 : 0, false);
    return row;
  }

  // =====================================================================
  // ★ MULTI TOGGLE — ВОЗВРАТ к старой логике (v4/v5)
  //   Единственный фикс: initialIndex по toLowerCase
  // =====================================================================
  function buildMultiToggle(key, labels, value) {
    const row = el('div', 'st-row st-multi-row');
    row.dataset.key = key;

    const wrap = el('div', 'st-multi-wrap');
    const labelsRow = el('div', 'st-multi-labels');
    const labelEls = [];
    labels.forEach(l => {
      const lb = el('div', 'st-multi-label', l);
      labelsRow.appendChild(lb);
      labelEls.push(lb);
    });
    wrap.appendChild(labelsRow);

    const trackWrap = el('div', 'st-multi-track');
    const knob = el('div', 'st-multi-knob');
    const shine = el('div', 'st-multi-shine');
    const refl = el('div', 'st-multi-reflect');
    knob.appendChild(refl);
    knob.appendChild(shine);
    trackWrap.appendChild(knob);
    wrap.appendChild(trackWrap);
    row.appendChild(wrap);

    const N = labels.length;
    const KNOB_SIZE = 26;
    const KNOB_LEFT_PAD = 3;

    let dragging = false;
    let lastMoveTime = 0, lastMoveX = 0;
    let currentPos = 0;
    let movedFar = false;

    // ★ ФИКС: indexOf case-insensitive
    let initialIndex = 0;
    if (typeof value === 'string') {
      const lower = value.toLowerCase();
      const found = labels.findIndex(l => l.toLowerCase() === lower);
      initialIndex = found >= 0 ? found : 0;
    }
    currentPos = initialIndex / (N - 1);

    // ★ ЖЁСТКИЙ clamp: X кноба всегда в [0, width - knobW]
    function knobXForIndexFloat(iFloat) {
      const rect = trackWrap.getBoundingClientRect();
      const w = rect.width;
      if (!w) return 0;
      const center = ((iFloat + 0.5) / N) * w;
      const x = center - KNOB_SIZE / 2 - KNOB_LEFT_PAD;
      const maxX = w - KNOB_SIZE - KNOB_LEFT_PAD * 2;
      return Math.max(0, Math.min(maxX, x));
    }

    // Свободная прокрутка — X по пальцу, с clamp
    function setPosFree(clientX) {
      const rect = trackWrap.getBoundingClientRect();
      const w = rect.width;
      if (!w) return;
      let x = clientX - rect.left - KNOB_SIZE / 2 - KNOB_LEFT_PAD;
      const maxX = w - KNOB_SIZE - KNOB_LEFT_PAD * 2;
      x = Math.max(0, Math.min(maxX, x));
      const p = w > 0 ? (x + KNOB_SIZE / 2 + KNOB_LEFT_PAD) / w : 0;
      currentPos = Math.max(0, Math.min(1, p * N / N - 0.5 / N));
      // ↑ упрощённо: p — позиция центра кноба в 0..1
      // Найдём по этому центру индекс:
      const center = (x + KNOB_SIZE / 2 + KNOB_LEFT_PAD) / w;
      const idx = Math.round(center * N - 0.5);
      const clampedIdx = Math.max(0, Math.min(N - 1, idx));
      currentPos = clampedIdx / (N - 1);
      const scale = dragging ? 1.5 : 1;
      knob.style.transition = 'transform 0.05s linear, box-shadow 0.3s ease';
      knob.style.transform = 'translateY(-50%) translateX(' + x + 'px) scale(' + scale + ')';
      labelEls.forEach((it, i) => it.classList.toggle('active', i === clampedIdx));
    }

    // Snap к индексу
    function setPos(p, animate) {
      p = Math.max(0, Math.min(1, p));
      currentPos = p;
      const iFloat = p * (N - 1);
      const x = knobXForIndexFloat(iFloat);
      const scale = dragging ? 1.5 : 1;
      knob.style.transition = animate
        ? 'transform 0.45s cubic-bezier(0.16,1,0.3,1), box-shadow 0.35s ease'
        : 'transform 0.06s linear, box-shadow 0.3s ease';
      knob.style.transform = 'translateY(-50%) translateX(' + x + 'px) scale(' + scale + ')';
      const idx = Math.round(p * (N - 1));
      labelEls.forEach((it, i) => it.classList.toggle('active', i === idx));
    }

    function commitIndex(idx) {
      if (idx < 0 || idx >= N) return;
      const newLangKey = LANG_LIST[idx];
      const changed = working[key] !== newLangKey;
      working[key] = newLangKey;
      playSFX('set_sfx_adjust', 1.0);
      if (changed) recomputeDirty();
      // ★ НЕ вызываем rebuildPagesContent — только по Save
    }

    function onStart(e) {
      dragging = true;
      movedFar = false;
      trackWrap.classList.add('st-multi-hold');
      knob.classList.add('st-multi-knob-active');
      const p = e.touches ? e.touches[0] : e;
      lastMoveX = p.clientX;
      lastMoveTime = performance.now();
      setPos(currentPos, false);
      e.preventDefault();
    }

    function onMove(e) {
      if (!dragging) return;
      const p = e.touches ? e.touches[0] : e;
      const now = performance.now();
      const dt = Math.max(1, now - lastMoveTime);
      const dx = p.clientX - lastMoveX;
      const speed = (Math.abs(dx) / dt) * 1000;
      if (Math.abs(dx) > 3) movedFar = true;
      lastMoveX = p.clientX; lastMoveTime = now;

      if (speed > 0) vibrateScroll(speed);
      setPosFree(p.clientX);
      e.preventDefault();
    }

    function onEnd(e) {
      if (!dragging) return;
      dragging = false;
      trackWrap.classList.remove('st-multi-hold');
      knob.classList.remove('st-multi-knob-active');
      const idx = Math.round(currentPos * (N - 1));
      setPos(idx / (N - 1), true);
      commitIndex(idx);
      if (e) e.preventDefault();
    }

    let tapStart = 0;
    trackWrap.addEventListener('touchstart', (e) => {
      tapStart = performance.now();
      movedFar = false;
      onStart(e);
    }, { passive: false });
    trackWrap.addEventListener('touchmove', onMove, { passive: false });
    trackWrap.addEventListener('touchend', (e) => {
      const dt = performance.now() - tapStart;
      if (dt < 200 && !movedFar) {
        dragging = false;
        trackWrap.classList.remove('st-multi-hold');
        knob.classList.remove('st-multi-knob-active');
        const cur = Math.round(currentPos * (N - 1));
        const next = (cur + 1) % N;
        setPos(next / (N - 1), true);
        commitIndex(next);
        if (e) e.preventDefault();
        return;
      }
      onEnd(e);
    });
    trackWrap.addEventListener('touchcancel', onEnd);

    labelEls.forEach((lb, i) => {
      lb.addEventListener('click', () => {
        setPos(i / (N - 1), true);
        commitIndex(i);
      });
    });

    window.addEventListener('resize', () => setPos(currentPos, false));
    requestAnimationFrame(() => setPos(currentPos, false));

    return row;
  }

  // ===== NICK =====
  function buildNickInput(value) {
    const row = el('div', 'st-row st-nick-row');
    row.appendChild(el('div', 'st-label', T('nickname')));
    const wrap = el('div', 'st-nick-wrap');
    const inp = el('input', 'st-nick-input');
    inp.type = 'text';
    inp.maxLength = 16;
    inp.autocomplete = 'off';
    inp.spellcheck = false;
    inp.value = value || '';
    wrap.appendChild(inp);
    row.appendChild(wrap);
    inp.addEventListener('input', () => {
      working.nickname = inp.value;
      recomputeDirty();
    });
    return row;
  }

  function buildGlassButton(label, cls) {
    const btn = el('button', 'st-btn ' + (cls || ''));
    btn.type = 'button';
    btn.textContent = label;
    return btn;
  }

  // ===== COMMIT / ROLLBACK =====
  function commit() {
    if (!window.Settings) return;
    Settings.set('musicVolume', working.musicVolume / 100);
    Settings.set('sfxVolume',   working.sfxVolume   / 100);
    Settings.set('vibration',   working.vibration);
    Settings.set('nickname',    working.nickname || '');
    Settings.set('brightness',  working.brightness);
    Settings.set('language',    working.language);

    setBlockMusicVolume(working.musicVolume / 100);
    applyBrightness(working.brightness);

    savedSnapshot = takeSnapshot();
    dirty = false;

    setTimeout(() => rebuildPagesContent(), 80);
  }

  function rollback() {
    if (!window.Settings) return;
    Settings.set('musicVolume', savedSnapshot.musicVolume01);
    Settings.set('sfxVolume',   savedSnapshot.sfxVolume01);
    Settings.set('vibration',   savedSnapshot.vibration);
    Settings.set('nickname',    savedSnapshot.nickname);
    Settings.set('brightness',  savedSnapshot.brightness);
    Settings.set('language',    savedSnapshot.language);

    setBlockMusicVolume(savedSnapshot.musicVolume01);
    applyBrightness(savedSnapshot.brightness);
    dirty = false;

    setTimeout(() => rebuildPagesContent(), 80);
  }

  // ===== MODAL: UNSAVED =====
  function showUnsavedModal() {
    if (modalOpen) return;
    modalOpen = true;
    const overlay = el('div', 'st-modal');
    const box = el('div', 'st-modal-box');
    box.innerHTML = '<h3>' + T('unsaved_title') + '</h3>' +
                    '<p>' + T('unsaved_text').replace('\n', '<br>') + '</p>';
    const btnSave   = buildGlassButton(T('unsaved_save'), 'st-btn-primary');
    const btnNoSave = buildGlassButton(T('unsaved_discard'), 'st-btn-danger');
    const btnCancel = buildGlassButton(T('unsaved_cancel'), 'st-btn-secondary');

    btnSave.addEventListener('click', () => {
      playSFX('set_sfx_back', 0.9); vibrateButton();
      commit(); hideModalOverlay(); exitToMenu();
    });
    btnNoSave.addEventListener('click', () => {
      playSFX('set_sfx_back', 0.9); vibrateButton();
      rollback(); hideModalOverlay(); exitToMenu();
    });
    btnCancel.addEventListener('click', () => {
      playSFX('set_sfx_adjust', 1.0); vibrateButton();
      hideModalOverlay();
    });

    box.appendChild(btnSave);
    box.appendChild(btnNoSave);
    box.appendChild(btnCancel);
    overlay.appendChild(box);
    root.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('show'));
  }

  function hideModalOverlay() {
    const overlay = root.querySelector('.st-modal');
    if (!overlay) return;
    overlay.classList.remove('show');
    setTimeout(() => { overlay.remove(); modalOpen = false; }, 500);
  }

  // ===== MODAL: RESET (2 шага) =====
  function showResetModal1() {
    if (modalOpen) return;
    modalOpen = true;
    const overlay = el('div', 'st-modal');
    const box = el('div', 'st-modal-box st-modal-danger');
    box.innerHTML = '<h3>' + T('reset_title') + '</h3>' +
                    '<p>' + T('reset_text').replace(/\n/g, '<br>') + '</p>';

    const btnYes = buildGlassButton(T('reset_yes'), 'st-btn-danger');
    const btnNo  = buildGlassButton(T('reset_no'),  'st-btn-secondary');

    btnYes.addEventListener('click', () => {
      vibrateButton();
      playSFX('set_sfx_back', 0.9);
      overlay.classList.remove('show');
      setTimeout(() => {
        overlay.remove();
        modalOpen = false;
        showResetModal2();
      }, 400);
    });
    btnNo.addEventListener('click', () => {
      vibrateButton();
      playSFX('set_sfx_adjust', 1.0);
      overlay.classList.remove('show');
      setTimeout(() => { overlay.remove(); modalOpen = false; }, 500);
    });

    box.appendChild(btnYes);
    box.appendChild(btnNo);
    overlay.appendChild(box);
    root.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('show'));
  }

  function showResetModal2() {
    if (modalOpen) return;
    modalOpen = true;
    const overlay = el('div', 'st-modal');
    const box = el('div', 'st-modal-box st-modal-danger');
    box.innerHTML = '<h3>' + T('reset_confirm2_title') + '</h3>' +
                    '<p>' + T('reset_confirm2_text') + '</p>';

    const btnYes = buildGlassButton(T('reset_confirm2_yes'), 'st-btn-danger');
    const btnNo  = buildGlassButton(T('reset_no'), 'st-btn-secondary');

    btnYes.addEventListener('click', async () => {
      vibrateButton();
      box.innerHTML = '<h3>' + T('reset_doing') + '</h3>' +
                      '<p>...</p>';
      try { playSFX('set_sfx_back', 1.0); } catch (e) {}
      await doFullReset();
    });
    btnNo.addEventListener('click', () => {
      vibrateButton();
      playSFX('set_sfx_adjust', 1.0);
      overlay.classList.remove('show');
      setTimeout(() => { overlay.remove(); modalOpen = false; }, 500);
    });

    box.appendChild(btnYes);
    box.appendChild(btnNo);
    overlay.appendChild(box);
    root.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('show'));
  }

  async function doFullReset() {
    try { if (window.Sound) Sound.stopMusic(0); } catch (e) {}
    try { if (window.Sound && Sound.unloadAll) Sound.unloadAll(); } catch (e) {}
    try { if (window.Sound && Sound.pauseAll)  Sound.pauseAll();  } catch (e) {}

    try { localStorage.clear(); } catch (e) {}
    try { sessionStorage.clear(); } catch (e) {}

    try {
      await new Promise((resolve) => {
        const req = indexedDB.deleteDatabase('orbits_io');
        req.onsuccess = () => resolve();
        req.onerror = () => resolve();
        req.onblocked = () => resolve();
      });
    } catch (e) {}

    try {
      if (window.caches && caches.keys) {
        const keys = await caches.keys();
        for (const k of keys) {
          try { await caches.delete(k); } catch (e) {}
        }
      }
    } catch (e) {}

    try {
      if (navigator.serviceWorker) {
        const regs = await navigator.serviceWorker.getRegistrations();
        for (const r of regs) {
          try { await r.unregister(); } catch (e) {}
        }
      }
    } catch (e) {}

    await sleep(350);

    try {
      const base = location.origin + location.pathname;
      location.replace(base + '?fresh=' + Date.now());
    } catch (e) {
      try { location.reload(); } catch (e2) { location.href = location.href; }
    }
  }

  // ===== EXIT =====
  async function exitToMenu() {
    if (window.Sound) { try { Sound.stopMusic(0.4); } catch (e) {} }
    if (root) {
      root.classList.remove('show');
      await sleep(400);
      root.remove();
      root = null;
    }
    if (window.ORBITS && ORBITS.back) {
      await ORBITS.back();
    }
  }

  // =====================================================================
  // СТИЛИ v7 — те же, что v4/v5, но без чёрных точек
  // =====================================================================
  function injectStyles() {
    if (document.getElementById('orbits-settings-styles-v7')) return;
    const css = `
      .st-root {
        position: absolute; inset: 0; z-index: 50;
        overflow: hidden; opacity: 0;
        transition: opacity 0.85s cubic-bezier(0.16,1,0.3,1);
        pointer-events: auto; color: #fff;
      }
      .st-root.show { opacity: 1; }

      .st-bg {
        position: absolute; inset: 0;
        background-size: cover; background-position: center;
        filter: brightness(1.28) saturate(1.08) contrast(1.02);
        z-index: 1;
      }
      .st-bg-overlay {
        position: absolute; inset: 0;
        background:
          radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 55%),
          radial-gradient(ellipse at 80% 90%, rgba(120,80,220,0.15) 0%, rgba(0,0,0,0) 60%),
          linear-gradient(135deg, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.42) 100%);
        z-index: 2; pointer-events: none;
      }

      /* КАРУСЕЛЬ */
      .st-viewport {
        position: absolute; inset: 0;
        overflow: hidden; z-index: 5;
      }
      .st-page {
        position: absolute; inset: 0;
        transition: transform 0.62s cubic-bezier(0.22, 1, 0.36, 1);
        will-change: transform;
      }
      .st-page-main { transform: translateX(0); }
      .st-page-lang { transform: translateX(100%); }
      .st-viewport[data-page="lang"] .st-page-main { transform: translateX(-100%); }
      .st-viewport[data-page="lang"] .st-page-lang { transform: translateX(0); }

      /* ШАПКА */
      .st-header {
        position: absolute; top: 1.2vh; left: 0; right: 0;
        display: flex; align-items: center; justify-content: center;
        z-index: 8; gap: 18px; pointer-events: none;
      }
      .st-title {
        font-size: 30px; font-weight: 900;
        letter-spacing: 7px; text-transform: uppercase;
        color: #fff;
        text-shadow:
          0 0 14px rgba(180,120,255,0.95),
          0 0 34px rgba(120,60,255,0.7),
          0 2px 0 rgba(0,0,0,0.5);
        opacity: 0;
        transition: opacity 0.65s cubic-bezier(0.16,1,0.3,1), letter-spacing 0.4s ease;
      }
      .st-title.show { opacity: 1; }
      .st-title.fade-out { opacity: 0; letter-spacing: 14px; }

      /* СТРЕЛКИ */
      .st-arrow {
        pointer-events: auto;
        width: 46px; height: 46px;
        display: flex; align-items: center; justify-content: center;
        background:
          linear-gradient(140deg,
            rgba(255,255,255,0.32) 0%,
            rgba(255,255,255,0.08) 40%,
            rgba(180,140,255,0.10) 70%,
            rgba(120,80,220,0.14) 100%);
        border: 1px solid rgba(255,255,255,0.42);
        border-radius: 50%;
        color: #fff;
        font-size: 26px; font-weight: 900;
        line-height: 1;
        cursor: pointer;
        backdrop-filter: blur(22px) saturate(200%) contrast(115%);
        -webkit-backdrop-filter: blur(22px) saturate(200%) contrast(115%);
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,0.7),
          inset 0 -1px 0 rgba(0,0,0,0.3),
          0 8px 24px rgba(0,0,0,0.55),
          0 0 24px rgba(120,80,220,0.3);
        transition:
          transform 0.35s cubic-bezier(0.16,1,0.3,1),
          background 0.35s ease,
          opacity 0.35s ease;
        position: relative;
        overflow: hidden;
      }
      /* ★ УБРАЛ ::before с radial — там чёрные точки */
      .st-arrow:active { transform: scale(0.9); }
      .st-arrow.inactive {
        opacity: 0.28;
        pointer-events: none;
        filter: saturate(0.5);
      }
      .st-arrow-left { padding-right: 3px; }
      .st-arrow-right { padding-left: 3px; }

      /* СПИСОК */
      .st-list {
        position: absolute; top: 12vh; left: 50%;
        transform: translateX(-50%);
        width: min(80vw, 820px);
        display: flex; flex-direction: column; gap: 1.5vh;
        z-index: 5;
      }

      /* ★ ЖИДКОЕ СТЕКЛО — БЕЗ ЧЁРНЫХ ТОЧЕК
         Убрал ::before с radial-gradient и blur,
         оставил только linear-gradient блик сверху + снизу */
      .st-row {
        position: relative;
        display: flex; align-items: center; gap: 2vw;
        padding: 1.25vh 2.4vh;
        border-radius: 26px;
        background:
          linear-gradient(155deg,
            rgba(255,255,255,0.24) 0%,
            rgba(255,255,255,0.09) 32%,
            rgba(180,140,255,0.07) 68%,
            rgba(120,80,220,0.13) 100%);
        border: 1px solid rgba(255,255,255,0.34);
        backdrop-filter: blur(30px) saturate(210%) contrast(118%);
        -webkit-backdrop-filter: blur(30px) saturate(210%) contrast(118%);
        box-shadow:
          inset 0 1.5px 0 rgba(255,255,255,0.65),
          inset 0 -1px 0 rgba(0,0,0,0.3),
          inset 1.5px 0 0 rgba(255,255,255,0.2),
          inset -1.5px 0 0 rgba(120,80,200,0.25),
          0 14px 44px rgba(0,0,0,0.5),
          0 4px 14px rgba(60,20,120,0.42);
        overflow: hidden;
        opacity: 0;
        transform: translateX(-40px) scale(0.96);
        transition:
          opacity 0.75s cubic-bezier(0.16,1,0.3,1),
          transform 0.75s cubic-bezier(0.16,1,0.3,1),
          box-shadow 0.35s ease;
      }
      /* Блик сверху — ТОЛЬКО linear, без blur, без radial */
      .st-row::before {
        content: '';
        position: absolute;
        left: 4%; right: 4%; top: 0;
        height: 42%;
        background: linear-gradient(180deg,
          rgba(255,255,255,0.42) 0%,
          rgba(255,255,255,0.10) 60%,
          rgba(255,255,255,0) 100%);
        pointer-events: none;
      }
      /* Блик снизу — отражение */
      .st-row::after {
        content: '';
        position: absolute;
        left: 8%; right: 8%; bottom: 0;
        height: 25%;
        background: linear-gradient(0deg,
          rgba(255,255,255,0.10) 0%,
          rgba(255,255,255,0) 100%);
        pointer-events: none;
      }
      .st-row.show { opacity: 1; transform: translateX(0) scale(1); }
      .st-row:active {
        box-shadow:
          inset 0 1.5px 0 rgba(255,255,255,0.75),
          inset 0 -1px 0 rgba(0,0,0,0.32),
          0 18px 54px rgba(0,0,0,0.6),
          0 6px 20px rgba(60,20,120,0.52),
          0 0 32px rgba(160,100,255,0.35);
      }

      .st-label {
        flex: 0 0 26%; font-size: 14px;
        letter-spacing: 2.4px; text-transform: uppercase;
        color: #f0eaff;
        text-shadow:
          0 0 10px rgba(180,120,255,0.85),
          0 1px 0 rgba(0,0,0,0.45);
        position: relative; z-index: 2;
        font-weight: 800;
      }

      /* СЛАЙДЕР */
      .st-slider-track {
        position: relative; flex: 1 1 auto; height: 46px;
        display: flex; align-items: center; padding: 0 22px;
        touch-action: none;
      }
      .st-slider-track-inner {
        position: relative; width: 100%; height: 15px;
        background: linear-gradient(180deg,
          rgba(0,0,0,0.42) 0%,
          rgba(60,30,120,0.32) 40%,
          rgba(255,255,255,0.10) 100%);
        border: 1px solid rgba(255,255,255,0.18);
        border-radius: 20px;
        box-shadow:
          inset 0 3px 8px rgba(0,0,0,0.6),
          inset 0 -1px 0 rgba(255,255,255,0.2);
        overflow: visible;
      }
      .st-slider-fill {
        position: absolute; left: 0; top: 0; bottom: 0;
        background:
          linear-gradient(90deg,
            rgba(106,58,255,1) 0%,
            rgba(176,107,255,1) 50%,
            rgba(170,150,255,1) 100%);
        border-radius: 20px;
        box-shadow:
          0 0 22px rgba(160,80,255,1),
          0 0 42px rgba(140,70,220,0.55),
          inset 0 1px 0 rgba(255,255,255,0.6),
          inset 0 -1.5px 0 rgba(0,0,0,0.3);
        pointer-events: none;
        transition: width 0.08s linear;
      }
      .st-slider-knob {
        position: absolute; top: 50%; left: 0;
        width: 32px; height: 32px; border-radius: 50%;
        background:
          radial-gradient(circle at 32% 26%,
            rgba(255,255,255,0.98) 0%,
            rgba(240,225,255,0.75) 20%,
            rgba(210,180,255,0.55) 50%,
            rgba(170,130,250,0.6) 80%,
            rgba(140,100,220,0.65) 100%);
        border: 1.5px solid rgba(255,255,255,0.85);
        box-shadow:
          inset 0 0 14px rgba(255,255,255,1),
          inset 0 -5px 10px rgba(140,100,220,0.45),
          inset 0 5px 10px rgba(255,255,255,0.7),
          0 0 26px rgba(180,120,255,1),
          0 0 52px rgba(140,80,255,0.6),
          0 8px 20px rgba(0,0,0,0.5);
        transform: translate(-50%, -50%) scale(1);
        pointer-events: none; overflow: hidden;
        backdrop-filter: blur(10px) saturate(200%);
        -webkit-backdrop-filter: blur(10px) saturate(200%);
        transition:
          transform 0.35s cubic-bezier(0.16,1,0.3,1),
          box-shadow 0.35s ease;
      }
      .st-slider-knob-shine {
        position: absolute; top: 8%; left: 15%;
        width: 60%; height: 42%;
        background: radial-gradient(ellipse at 35% 30%,
          rgba(255,255,255,1) 0%,
          rgba(255,255,255,0.65) 40%,
          rgba(255,255,255,0) 82%);
        border-radius: 50%; pointer-events: none;
      }
      .st-slider-knob-reflect {
        position: absolute; bottom: 6%; right: 12%;
        width: 40%; height: 30%;
        background: radial-gradient(ellipse at 60% 60%,
          rgba(200,160,255,0.6) 0%,
          rgba(200,160,255,0) 80%);
        border-radius: 50%; pointer-events: none;
      }
      .st-slider-knob.st-knob-active {
        transform: translate(-50%, -50%) scale(1.7);
        box-shadow:
          inset 0 0 20px rgba(255,255,255,1),
          inset 0 -8px 16px rgba(140,100,220,0.55),
          inset 0 8px 16px rgba(255,255,255,0.85),
          0 0 48px rgba(220,180,255,1),
          0 0 96px rgba(160,100,255,0.9),
          0 14px 34px rgba(0,0,0,0.6);
      }

      .st-value {
        flex: 0 0 10%; text-align: right;
        font-size: 13px; color: #fff;
        text-shadow:
          0 0 10px rgba(180,120,255,0.9),
          0 1px 0 rgba(0,0,0,0.45);
        font-variant-numeric: tabular-nums;
        position: relative; z-index: 2;
        font-weight: 700;
      }

      /* MINI TOGGLE */
      .st-mini-track {
        position: relative; flex: 0 0 66px; height: 32px;
        background:
          linear-gradient(180deg,
            rgba(0,0,0,0.42) 0%,
            rgba(60,30,120,0.28) 45%,
            rgba(255,255,255,0.14) 100%);
        border: 1px solid rgba(255,255,255,0.26);
        border-radius: 40px; cursor: pointer;
        backdrop-filter: blur(22px) saturate(200%);
        -webkit-backdrop-filter: blur(22px) saturate(200%);
        box-shadow:
          inset 0 3px 8px rgba(0,0,0,0.55),
          inset 0 -1px 0 rgba(255,255,255,0.22),
          0 6px 18px rgba(0,0,0,0.45);
        transition:
          background 0.5s ease,
          box-shadow 0.5s ease,
          transform 0.3s cubic-bezier(0.16,1,0.3,1);
        touch-action: none;
      }
      .st-mini-track:active, .st-mini-track.st-mini-hold { transform: scale(1.08); }
      .st-mini-track.on {
        background:
          linear-gradient(135deg,
            rgba(140,70,255,0.95) 0%,
            rgba(190,110,255,0.95) 100%);
        box-shadow:
          inset 0 3px 8px rgba(0,0,0,0.28),
          inset 0 -1px 0 rgba(255,255,255,0.55),
          0 0 28px rgba(190,110,255,1),
          0 0 56px rgba(140,80,255,0.7),
          0 6px 20px rgba(60,20,120,0.55);
      }
      .st-mini-knob, .st-multi-knob {
        position: absolute; top: 50%; left: 3px;
        width: 26px; height: 26px; border-radius: 50%;
        background:
          radial-gradient(circle at 32% 26%,
            rgba(255,255,255,1) 0%,
            rgba(240,225,255,0.8) 22%,
            rgba(210,180,255,0.55) 52%,
            rgba(170,130,250,0.55) 82%,
            rgba(140,100,220,0.6) 100%);
        border: 1.5px solid rgba(255,255,255,0.85);
        box-shadow:
          inset 0 0 12px rgba(255,255,255,1),
          inset 0 -4px 8px rgba(140,100,220,0.45),
          inset 0 4px 8px rgba(255,255,255,0.6),
          0 0 20px rgba(180,120,255,1),
          0 0 40px rgba(140,80,255,0.55),
          0 5px 12px rgba(0,0,0,0.5);
        transform: translateY(-50%) translateX(0);
        overflow: hidden; pointer-events: none;
        will-change: transform;
      }
      .st-mini-shine, .st-multi-shine {
        position: absolute; top: 10%; left: 18%;
        width: 55%; height: 40%;
        background: radial-gradient(ellipse at 35% 30%,
          rgba(255,255,255,1) 0%,
          rgba(255,255,255,0.55) 45%,
          rgba(255,255,255,0) 82%);
        border-radius: 50%; pointer-events: none;
      }
      .st-mini-reflect, .st-multi-reflect {
        position: absolute; bottom: 8%; right: 15%;
        width: 38%; height: 28%;
        background: radial-gradient(ellipse at 60% 60%,
          rgba(200,160,255,0.55) 0%,
          rgba(200,160,255,0) 80%);
        border-radius: 50%; pointer-events: none;
      }

      /* MULTI TOGGLE */
      .st-multi-wrap {
        flex: 1 1 auto;
        display: flex; flex-direction: column; gap: 8px;
        min-width: 0;
      }
      .st-multi-labels {
        display: flex;
        padding: 0;
        font-size: 14px; letter-spacing: 2.4px;
        color: rgba(255,255,255,0.55);
        text-shadow: 0 1px 0 rgba(0,0,0,0.5);
        font-weight: 800;
        user-select: none;
      }
      .st-multi-label {
        flex: 1 1 0;
        text-align: center;
        cursor: pointer;
        transition: color 0.35s ease, text-shadow 0.35s ease, transform 0.35s cubic-bezier(0.16,1,0.3,1);
        position: relative;
      }
      .st-multi-label.active {
        color: #fff;
        text-shadow:
          0 0 14px rgba(220,170,255,1),
          0 0 30px rgba(170,100,255,0.9),
          0 0 60px rgba(140,80,220,0.5);
        transform: translateY(-1px);
      }
      .st-multi-track {
        position: relative; height: 32px;
        background:
          linear-gradient(180deg,
            rgba(0,0,0,0.42) 0%,
            rgba(60,30,120,0.28) 45%,
            rgba(255,255,255,0.14) 100%);
        border: 1px solid rgba(255,255,255,0.26);
        border-radius: 40px; cursor: pointer;
        backdrop-filter: blur(22px) saturate(200%);
        -webkit-backdrop-filter: blur(22px) saturate(200%);
        box-shadow:
          inset 0 3px 8px rgba(0,0,0,0.55),
          inset 0 -1px 0 rgba(255,255,255,0.22),
          0 6px 18px rgba(0,0,0,0.45);
        transition: transform 0.3s cubic-bezier(0.16,1,0.3,1);
        touch-action: none;
        width: 100%;
        margin: 0;
        overflow: hidden;
      }
      .st-multi-track:active, .st-multi-track.st-multi-hold { transform: scale(1.03); }
      .st-multi-knob.st-multi-knob-active {
        transform: translateY(-50%) scale(1.5);
        box-shadow:
          inset 0 0 16px rgba(255,255,255,1),
          inset 0 -6px 12px rgba(140,100,220,0.55),
          inset 0 6px 12px rgba(255,255,255,0.7),
          0 0 36px rgba(220,180,255,1),
          0 0 72px rgba(160,100,255,0.85),
          0 10px 24px rgba(0,0,0,0.55);
      }

      /* НИК */
      .st-nick-wrap { flex: 1 1 auto; position: relative; z-index: 2; }
      .st-nick-input {
        width: 100%; padding: 10px 18px;
        background:
          linear-gradient(180deg,
            rgba(0,0,0,0.32) 0%,
            rgba(60,30,120,0.22) 50%,
            rgba(255,255,255,0.10) 100%);
        border: 1px solid rgba(255,255,255,0.28);
        border-radius: 18px; color: #fff; font-size: 15px;
        letter-spacing: 1px; outline: none;
        backdrop-filter: blur(16px) saturate(200%);
        -webkit-backdrop-filter: blur(16px) saturate(200%);
        box-shadow:
          inset 0 3px 8px rgba(0,0,0,0.5),
          inset 0 -1px 0 rgba(255,255,255,0.22);
        transition: border 0.3s ease, box-shadow 0.3s ease;
      }
      .st-nick-input:focus {
        border-color: rgba(200,150,255,0.95);
        box-shadow:
          inset 0 3px 8px rgba(0,0,0,0.5),
          0 0 24px rgba(180,100,255,0.8),
          0 0 48px rgba(150,80,255,0.4);
      }

      /* НИЖНИЕ КНОПКИ */
      .st-btn-back, .st-btn-save {
        position: absolute; bottom: 4vh;
        padding: 1.3vh 3.6vh;
        color: #fff; font-family: inherit;
        font-size: 18px; letter-spacing: 2.5px;
        text-transform: uppercase; font-weight: 900;
        border-radius: 22px; cursor: pointer;
        z-index: 8;
        backdrop-filter: blur(24px) saturate(210%);
        -webkit-backdrop-filter: blur(24px) saturate(210%);
        transition:
          transform 0.28s cubic-bezier(0.16,1,0.3,1),
          background 0.3s ease,
          box-shadow 0.3s ease;
        overflow: hidden;
      }
      /* ★ Только linear блик, без blur */
      .st-btn-back::before, .st-btn-save::before {
        content: '';
        position: absolute; left: 8%; right: 8%; top: 0;
        height: 45%;
        background: linear-gradient(180deg,
          rgba(255,255,255,0.5) 0%,
          rgba(255,255,255,0.05) 70%,
          rgba(255,255,255,0) 100%);
        pointer-events: none;
      }
      .st-btn-back {
        left: 4vw;
        background:
          linear-gradient(135deg,
            rgba(255,255,255,0.26) 0%,
            rgba(255,255,255,0.08) 100%);
        border: 1px solid rgba(255,255,255,0.42);
        box-shadow:
          inset 0 1.5px 0 rgba(255,255,255,0.7),
          inset 0 -1px 0 rgba(0,0,0,0.3),
          0 10px 30px rgba(0,0,0,0.55);
      }
      .st-btn-back:active {
        transform: scale(0.94) translateY(2px);
        background:
          linear-gradient(135deg,
            rgba(255,200,60,0.95) 0%,
            rgba(210,150,0,0.95) 100%);
        box-shadow:
          inset 0 1.5px 0 rgba(255,255,255,0.8),
          0 8px 24px rgba(255,180,40,0.55),
          0 0 40px rgba(255,180,40,0.4);
      }
      .st-btn-save {
        right: 4vw;
        background:
          linear-gradient(135deg,
            rgba(140,70,255,0.95) 0%,
            rgba(190,110,255,0.95) 100%);
        border: 1px solid rgba(220,180,255,0.75);
        box-shadow:
          inset 0 1.5px 0 rgba(255,255,255,0.75),
          inset 0 -1px 0 rgba(0,0,0,0.3),
          0 12px 34px rgba(130,60,255,0.75),
          0 0 48px rgba(160,90,255,0.5);
      }
      .st-btn-save:active {
        transform: scale(0.94) translateY(2px);
        box-shadow:
          inset 0 1.5px 0 rgba(255,255,255,0.85),
          0 8px 24px rgba(130,60,255,0.9),
          0 0 60px rgba(180,100,255,0.6);
      }

      /* РЕСЕТ-КНОПКА */
      .st-reset-row {
        justify-content: center;
        padding: 1.2vh 2.4vh;
        background:
          linear-gradient(155deg,
            rgba(255,80,80,0.14) 0%,
            rgba(200,50,50,0.08) 50%,
            rgba(150,30,30,0.12) 100%);
        border: 1px solid rgba(255,120,120,0.4);
      }
      .st-reset-btn {
        width: 100%;
        padding: 13px 26px;
        font-family: inherit;
        font-size: 15px;
        letter-spacing: 2.4px;
        text-transform: uppercase;
        font-weight: 900;
        color: #ffb8b8;
        background:
          linear-gradient(135deg,
            rgba(255,80,80,0.25) 0%,
            rgba(200,50,50,0.20) 100%);
        border: 1px solid rgba(255,140,140,0.55);
        border-radius: 16px;
        cursor: pointer;
        text-shadow: 0 0 12px rgba(255,80,80,0.8);
        box-shadow:
          inset 0 1.5px 0 rgba(255,255,255,0.3),
          inset 0 -1px 0 rgba(0,0,0,0.3),
          0 8px 24px rgba(120,20,20,0.55),
          0 0 32px rgba(255,60,60,0.3);
        transition:
          transform 0.24s cubic-bezier(0.16,1,0.3,1),
          background 0.3s ease,
          color 0.3s ease,
          box-shadow 0.3s ease;
      }
      .st-reset-btn:active {
        transform: scale(0.96) translateY(1px);
        background:
          linear-gradient(135deg,
            rgba(255,50,50,0.95) 0%,
            rgba(180,30,30,0.95) 100%);
        color: #fff;
        box-shadow:
          inset 0 1.5px 0 rgba(255,255,255,0.5),
          0 10px 30px rgba(255,40,40,0.75),
          0 0 60px rgba(255,60,60,0.55);
      }

      /* МОДАЛКА */
      .st-modal {
        position: absolute; inset: 0; z-index: 200;
        display: flex; align-items: center; justify-content: center;
        background: rgba(0,0,0,0); backdrop-filter: blur(0px);
        -webkit-backdrop-filter: blur(0px);
        opacity: 0;
        transition:
          opacity 0.55s ease,
          background 0.55s ease,
          backdrop-filter 0.55s ease;
      }
      .st-modal.show {
        opacity: 1; background: rgba(0,0,0,0.62);
        backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px);
      }
      .st-modal-box {
        width: min(88vw, 480px); padding: 30px 26px;
        background:
          linear-gradient(155deg,
            rgba(45,30,75,0.96) 0%,
            rgba(65,40,110,0.96) 100%);
        border: 1px solid rgba(220,180,255,0.65);
        border-radius: 30px; text-align: center;
        color: #e0d8ff;
        backdrop-filter: blur(24px) saturate(200%);
        -webkit-backdrop-filter: blur(24px) saturate(200%);
        box-shadow:
          inset 0 1.5px 0 rgba(255,255,255,0.4),
          inset 0 -1px 0 rgba(0,0,0,0.35),
          0 0 60px rgba(160,90,255,0.5),
          0 24px 80px rgba(0,0,0,0.9);
        transform: scale(0.55) rotate(-3deg);
        opacity: 0;
        transition:
          transform 0.6s cubic-bezier(0.16,1,0.3,1),
          opacity 0.6s ease;
        position: relative;
        overflow: hidden;
      }
      .st-modal-box::before {
        content: '';
        position: absolute; left: 10%; right: 10%; top: 0;
        height: 40%;
        background: linear-gradient(180deg,
          rgba(255,255,255,0.4) 0%,
          rgba(255,255,255,0.05) 70%,
          rgba(255,255,255,0) 100%);
        pointer-events: none;
      }
      .st-modal.show .st-modal-box {
        transform: scale(1) rotate(0deg);
        opacity: 1;
      }
      .st-modal-box h3 { font-size: 21px; margin-bottom: 14px; color: #fff; }
      .st-modal-box p { font-size: 14px; line-height: 1.65; margin-bottom: 22px; }
      .st-modal-box .st-btn { display: block; width: 100%; margin-top: 10px; font-size: 15px; padding: 13px 22px; }

      .st-modal-danger {
        border-color: rgba(255,100,100,0.75) !important;
        background:
          linear-gradient(155deg,
            rgba(60,20,25,0.98) 0%,
            rgba(40,15,20,0.98) 100%) !important;
      }
      .st-modal-danger h3 {
        color: #ff7070 !important;
        text-shadow: 0 0 14px rgba(255,80,80,0.85);
      }
      .st-modal-danger p { color: #ffd0d0 !important; }

      .st-btn {
        padding: 15px 34px;
        font-family: inherit;
        font-size: 17px; letter-spacing: 2.4px;
        text-transform: uppercase; font-weight: 900;
        color: #fff; background: rgba(255,255,255,0.10);
        border: 1px solid rgba(255,255,255,0.32);
        border-radius: 22px; cursor: pointer;
        backdrop-filter: blur(18px) saturate(200%);
        -webkit-backdrop-filter: blur(18px) saturate(200%);
        box-shadow:
          inset 0 1.5px 0 rgba(255,255,255,0.5),
          0 8px 26px rgba(0,0,0,0.5);
        transition:
          transform 0.24s cubic-bezier(0.16,1,0.3,1),
          background 0.28s ease,
          box-shadow 0.28s ease;
      }
      .st-btn:active {
        transform: scale(0.95) translateY(1px);
        background: rgba(190,150,255,0.35);
      }
      .st-btn-primary {
        background:
          linear-gradient(135deg,
            rgba(140,70,255,0.95),
            rgba(190,110,255,0.95));
        border-color: rgba(220,180,255,0.8);
      }
      .st-btn-primary:active {
        box-shadow:
          inset 0 1.5px 0 rgba(255,255,255,0.85),
          0 10px 30px rgba(130,60,255,0.85),
          0 0 50px rgba(180,100,255,0.6);
      }
      .st-btn-danger {
        background:
          linear-gradient(135deg,
            rgba(255,80,80,0.92),
            rgba(210,50,50,0.92));
        border-color: rgba(255,170,170,0.75);
      }
      .st-btn-danger:active {
        box-shadow:
          inset 0 1.5px 0 rgba(255,255,255,0.75),
          0 10px 30px rgba(255,60,60,0.7),
          0 0 50px rgba(255,80,80,0.5);
      }
      .st-btn-secondary { background: rgba(255,255,255,0.10); }
    `;
    const style = document.createElement('style');
    style.id = 'orbits-settings-styles-v7';
    style.textContent = css;
    document.head.appendChild(style);
  }

  // =====================================================================
  // СТРАНИЦЫ
  // =====================================================================
  function buildBg() {
    const bg = el('div', 'st-bg');
    bg.style.backgroundImage = "url('" + ASSETS.bg + "')";
    root.appendChild(bg);
    root.appendChild(el('div', 'st-bg-overlay'));
  }

  function buildHeader() {
    const header = el('div', 'st-header');

    const arrowLeft = el('div', 'st-arrow st-arrow-left', '‹');
    arrowLeft.addEventListener('click', () => {
      vibrateButton();
      playSFX('set_sfx_back', 0.9);
      goToPage('main');
    });
    header.appendChild(arrowLeft);

    const title = el('div', 'st-title', '');
    title.textContent = currentPage === 'lang' ? T('lang_title') : T('title');
    header.appendChild(title);

    const arrowRight = el('div', 'st-arrow st-arrow-right', '›');
    arrowRight.addEventListener('click', () => {
      vibrateButton();
      playSFX('set_sfx_next', 0.9);
      goToPage('lang');
    });
    header.appendChild(arrowRight);

    root.appendChild(header);
    requestAnimationFrame(() => title.classList.add('show'));
    updateHeaderArrows(arrowLeft, arrowRight, title);
  }

  function updateHeaderArrows(left, right, title) {
    if (currentPage === 'main') {
      left.classList.add('inactive');
      right.classList.remove('inactive');
    } else {
      left.classList.remove('inactive');
      right.classList.add('inactive');
    }
    if (title) {
      title.textContent = currentPage === 'lang' ? T('lang_title') : T('title');
    }
  }

  function buildMainPageInto(pageEl) {
    const list = el('div', 'st-list');
    pageEl.appendChild(list);

    const rowNick   = buildNickInput(working.nickname);
    const rowMusic  = buildSlider('musicVolume', T('music'), 0, 100, working.musicVolume, v => v + '%');
    const rowSfx    = buildSlider('sfxVolume',   T('sfx'),   0, 100, working.sfxVolume,   v => v + '%');
    const rowVibe   = buildMiniToggle('vibration', T('vibration'), working.vibration);
    const rowBright = buildSlider('brightness',  T('brightness'), 0, 150, working.brightness, v => v);

    list.appendChild(rowNick);
    list.appendChild(rowMusic);
    list.appendChild(rowSfx);
    list.appendChild(rowVibe);
    list.appendChild(rowBright);

    const rows = [rowNick, rowMusic, rowSfx, rowVibe, rowBright];
    rows.forEach((r, i) => {
      setTimeout(() => r.classList.add('show'), 100 + i * 130);
    });
  }

  function buildLangPageInto(pageEl) {
    const list = el('div', 'st-list');
    pageEl.appendChild(list);

    const rowLang = buildMultiToggle('language', LANG_LABELS, working.language);
    list.appendChild(rowLang);

    const rowReset = el('div', 'st-row st-reset-row');
    const resetBtn = el('button', 'st-reset-btn');
    resetBtn.type = 'button';
    resetBtn.textContent = T('reset_btn');
    resetBtn.addEventListener('click', () => {
      vibrateButton();
      playSFX('set_sfx_adjust', 1.0);
      showResetModal1();
    });
    rowReset.appendChild(resetBtn);
    list.appendChild(rowReset);

    setTimeout(() => {
      rowLang.classList.add('show');
      setTimeout(() => rowReset.classList.add('show'), 140);
    }, 100);
  }

  function buildBottomButtons() {
    const btnBack = el('button', 'st-btn-back');
    btnBack.type = 'button';
    btnBack.textContent = T('back');
    root.appendChild(btnBack);

    const btnSave = el('button', 'st-btn-save');
    btnSave.type = 'button';
    btnSave.textContent = T('save');
    root.appendChild(btnSave);

    btnBack.addEventListener('click', () => {
      vibrateButton();
      if (dirty) {
        playSFX('set_sfx_adjust', 1.0);
        showUnsavedModal();
      } else {
        playSFX('set_sfx_back', 0.9);
        exitToMenu();
      }
    });

    btnSave.addEventListener('click', () => {
      playSFX('set_sfx_next', 1.0);
      vibrateButton();
      commit();
      btnSave.style.transform = 'scale(0.9) translateY(2px)';
      setTimeout(() => { btnSave.style.transform = ''; }, 200);
    });
  }

  async function buildAll() {
    root.innerHTML = '';
    buildBg();

    viewportEl = el('div', 'st-viewport');
    viewportEl.dataset.page = currentPage;
    root.appendChild(viewportEl);

    const mainPage = el('div', 'st-page st-page-main');
    const langPage = el('div', 'st-page st-page-lang');
    viewportEl.appendChild(mainPage);
    viewportEl.appendChild(langPage);

    buildMainPageInto(mainPage);
    buildLangPageInto(langPage);

    buildHeader();
    buildBottomButtons();
  }

  async function rebuildPagesContent() {
    if (!viewportEl) return;
    const main = viewportEl.querySelector('.st-page-main');
    const lang = viewportEl.querySelector('.st-page-lang');
    if (!main || !lang) return;

    main.innerHTML = '';
    lang.innerHTML = '';
    buildMainPageInto(main);
    buildLangPageInto(lang);

    const btnBack = root.querySelector('.st-btn-back');
    const btnSave = root.querySelector('.st-btn-save');
    if (btnBack) btnBack.textContent = T('back');
    if (btnSave) btnSave.textContent = T('save');

    const title = root.querySelector('.st-title');
    if (title) title.textContent = currentPage === 'lang' ? T('lang_title') : T('title');
  }

  async function goToPage(page) {
    if (page === currentPage) return;
    const title = root.querySelector('.st-title');
    if (title) {
      title.classList.add('fade-out');
      await sleep(300);
    }
    currentPage = page;
    viewportEl.dataset.page = page;
    if (title) {
      title.textContent = page === 'lang' ? T('lang_title') : T('title');
      title.classList.remove('fade-out');
    }
    const left = root.querySelector('.st-arrow-left');
    const right = root.querySelector('.st-arrow-right');
    updateHeaderArrows(left, right, title);
  }

  async function start() {
    ['orbits-settings-styles',
     'orbits-settings-styles-v2',
     'orbits-settings-styles-v3',
     'orbits-settings-styles-v4',
     'orbits-settings-styles-v5',
     'orbits-settings-styles-v6'].forEach(id => {
      const old = document.getElementById(id);
      if (old) old.remove();
    });

    container = document.getElementById('game-container') || document.body;

    injectStyles();
    await loadSounds();

    savedSnapshot = takeSnapshot();
    working = {
      musicVolume: Math.round(savedSnapshot.musicVolume01 * 100),
      sfxVolume:   Math.round(savedSnapshot.sfxVolume01   * 100),
      vibration:   savedSnapshot.vibration,
      nickname:    savedSnapshot.nickname,
      brightness:  savedSnapshot.brightness,
      language:    savedSnapshot.language
    };
    dirty = false;
    currentPage = 'main';

    applyBrightness(working.brightness);

    root = el('div', 'st-root');
    container.appendChild(root);

    await buildAll();

    requestAnimationFrame(() => root.classList.add('show'));
    await sleep(200);
    await startBlockMusic();
  }

  start();
})();