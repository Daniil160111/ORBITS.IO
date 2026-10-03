/* =====================================================================
   ORBITS.IO — SETTINGS MANAGER
   Путь: Блоки/settings-manager.js
   ===================================================================== */
(function (global) {
  'use strict';

  const STORAGE_KEY = 'orbits_settings';

  const DEFAULTS = {
    sfxVolume:   0.8,
    musicVolume: 0.8,
    vibration:   true,
    nickname:    '',
    brightness:  100,
    language:    'ru'
  };

  const LANGUAGES = ['ru', 'en', 'fr', 'es'];

  const VALIDATORS = {
    sfxVolume:   (v) => typeof v === 'number' && v >= 0 && v <= 1,
    musicVolume: (v) => typeof v === 'number' && v >= 0 && v <= 1,
    vibration:   (v) => typeof v === 'boolean',
    nickname:    (v) => typeof v === 'string' && v.length <= 32,
    brightness:  (v) => typeof v === 'number' && v >= 0 && v <= 150,
    language:    (v) => typeof v === 'string' && LANGUAGES.includes(v)
  };

  let data = Object.assign({}, DEFAULTS);
  const listeners = [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      for (const key of Object.keys(DEFAULTS)) {
        if (key in parsed && VALIDATORS[key](parsed[key])) data[key] = parsed[key];
      }
    }
  } catch (e) {
    console.warn('[Settings] localStorage:', e.message);
  }

  function persist() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) {}
  }
  function notify(key, value) {
    listeners.forEach(cb => { try { cb(key, value, data); } catch (e) {} });
  }

  const Settings = {
    DEFAULTS: Object.assign({}, DEFAULTS),
    LANGUAGES: LANGUAGES.slice(),

    get(key) { return (key in data) ? data[key] : undefined; },
    getAll() { return Object.assign({}, data); },

    set(key, value) {
      if (!(key in DEFAULTS)) { console.warn('[Settings] Неизвестный ключ:', key); return false; }
      if (!VALIDATORS[key](value)) { console.warn('[Settings] Неверное значение для', key, ':', value); return false; }
      data[key] = value;
      persist();
      notify(key, value);
      return true;
    },

    reset() {
      data = Object.assign({}, DEFAULTS);
      persist();
      for (const key of Object.keys(DEFAULTS)) notify(key, data[key]);
      return true;
    },

    onChange(cb) {
      if (typeof cb !== 'function') return () => {};
      listeners.push(cb);
      return () => { const i = listeners.indexOf(cb); if (i >= 0) listeners.splice(i, 1); };
    }
  };

  global.Settings = Settings;
})(window);