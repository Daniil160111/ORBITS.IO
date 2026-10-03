/* =====================================================================
   ORBITS.IO — ERROR MANAGER
   Путь: Блоки/error-manager.js

   Единая точка показа ошибок. Замораживает блоки и музыку,
   показывает окно, по кнопке «Продолжить» возвращает в предыдущий блок.
   ===================================================================== */
(function (global) {
  'use strict';

  const DICT = {
    ru: {
      title: 'Ошибка',
      connection: 'Ошибка соединения с сервером',
      connection_text: 'Не удалось связаться с сервером.\nПроверьте интернет и попробуйте снова.',
      load: 'Ошибка загрузки игры',
      load_text: 'Не удалось загрузить игровые файлы.\nПопробуйте ещё раз.',
      download: 'Ошибка скачивания контента',
      download_text: 'Не удалось скачать часть контента.\nПроверьте интернет и попробуйте снова.',
      timeout: 'Превышено время ожидания',
      timeout_text: 'Игра не отвечает уже больше 40 секунд.\nНажмите «Продолжить».',
      corrupted: 'Повреждение игры',
      corrupted_text: 'Файлы игры повреждены.\nТребуется повторная загрузка.',
      mobile_only: 'Только для мобильных',
      mobile_only_text: 'Запустите игру с мобильного устройства.',
      weak_device: 'Слабое устройство',
      weak_device_text: 'Требуется более мощное устройство.',
      unknown: 'Неизвестная ошибка',
      unknown_text: 'Что-то пошло не так. Попробуйте ещё раз.',
      continue: 'Продолжить'
    },
    en: {
      title: 'Error',
      connection: 'Server connection error',
      connection_text: 'Could not reach the server.\nCheck your internet and try again.',
      load: 'Game loading error',
      load_text: 'Could not load game files.\nPlease try again.',
      download: 'Content download error',
      download_text: 'Could not download some content.\nCheck your internet and try again.',
      timeout: 'Timeout',
      timeout_text: 'The game has not responded for over 40 seconds.\nPress Continue.',
      corrupted: 'Game corruption',
      corrupted_text: 'Game files are corrupted.\nReload is required.',
      mobile_only: 'Mobile only',
      mobile_only_text: 'Launch the game on a mobile device.',
      weak_device: 'Weak device',
      weak_device_text: 'A more powerful device is required.',
      unknown: 'Unknown error',
      unknown_text: 'Something went wrong. Try again.',
      continue: 'Continue'
    },
    fr: {
      title: 'Erreur',
      connection: 'Erreur de connexion au serveur',
      connection_text: 'Impossible de joindre le serveur.\nVérifiez votre connexion et réessayez.',
      load: 'Erreur de chargement du jeu',
      load_text: 'Impossible de charger les fichiers du jeu.\nRéessayez.',
      download: 'Erreur de téléchargement',
      download_text: 'Impossible de télécharger une partie du contenu.\nVérifiez votre connexion et réessayez.',
      timeout: 'Délai dépassé',
      timeout_text: 'Le jeu ne répond pas depuis plus de 40 secondes.\nAppuyez sur Continuer.',
      corrupted: 'Corruption du jeu',
      corrupted_text: 'Les fichiers du jeu sont corrompus.\nRechargement requis.',
      mobile_only: 'Mobile uniquement',
      mobile_only_text: 'Lancez le jeu sur un appareil mobile.',
      weak_device: 'Appareil faible',
      weak_device_text: 'Un appareil plus puissant est requis.',
      unknown: 'Erreur inconnue',
      unknown_text: 'Une erreur est survenue. Réessayez.',
      continue: 'Continuer'
    },
    es: {
      title: 'Error',
      connection: 'Error de conexión con el servidor',
      connection_text: 'No se pudo contactar con el servidor.\nComprueba tu conexión e inténtalo de nuevo.',
      load: 'Error al cargar el juego',
      load_text: 'No se pudieron cargar los archivos del juego.\nInténtalo de nuevo.',
      download: 'Error al descargar contenido',
      download_text: 'No se pudo descargar parte del contenido.\nComprueba tu conexión e inténtalo de nuevo.',
      timeout: 'Tiempo agotado',
      timeout_text: 'El juego no responde desde hace más de 40 segundos.\nPulsa Continuar.',
      corrupted: 'Corrupción del juego',
      corrupted_text: 'Los archivos del juego están corruptos.\nSe requiere recargar.',
      mobile_only: 'Solo móviles',
      mobile_only_text: 'Inicia el juego en un dispositivo móvil.',
      weak_device: 'Dispositivo débil',
      weak_device_text: 'Se requiere un dispositivo más potente.',
      unknown: 'Error desconocido',
      unknown_text: 'Algo salió mal. Inténtalo de nuevo.',
      continue: 'Continuar'
    }
  };

  function currentLang() {
    return (window.Settings && Settings.get('language')) || 'ru';
  }

  function T(key) {
    const lang = currentLang();
    return (DICT[lang] && DICT[lang][key]) || DICT.ru[key] || key;
  }

  let activeOverlay = null;
  let activeCallback = null;

  const ErrorManager = {
    /* Показать окно ошибки.
       opts: { code, detail, onContinue }
       code: 'connection' | 'load' | 'download' | 'timeout' | 'corrupted' | 'mobile_only' | 'weak_device' | 'unknown' */
    show(opts) {
      if (activeOverlay) return;

      const code = (opts && opts.code) || 'unknown';
      const detail = (opts && opts.detail) || '';
      activeCallback = (opts && typeof opts.onContinue === 'function') ? opts.onContinue : null;

      // Замораживаем музыку
      try { if (window.Sound && Sound.pauseAll) Sound.pauseAll(); } catch (e) {}

      // Замораживаем анимации блоков (CSS)
      const freezeStyle = document.createElement('style');
      freezeStyle.id = 'orbits-error-freeze';
      freezeStyle.textContent = `
        *, *::before, *::after {
          animation-play-state: paused !important;
          transition: none !important;
        }
      `;
      document.head.appendChild(freezeStyle);

      // Слой
      const overlay = document.createElement('div');
      overlay.id = 'orbits-error-overlay';
      overlay.innerHTML = `
        <style>
          #orbits-error-overlay {
            position: fixed; inset: 0; z-index: 2147483000;
            display: flex; align-items: center; justify-content: center;
            background: rgba(0,0,0,0); backdrop-filter: blur(0px);
            -webkit-backdrop-filter: blur(0px);
            opacity: 0;
            transition: opacity .55s ease, background .55s ease, backdrop-filter .55s ease;
            font-family: inherit;
          }
          #orbits-error-overlay.show {
            opacity: 1; background: rgba(0,0,0,0.6);
            backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
          }
          #orbits-error-overlay .oe-box {
            width: min(88vw, 480px); padding: 28px 26px;
            background: rgba(20, 15, 35, 0.96);
            border: 1px solid rgba(255,80,80,0.45);
            border-radius: 22px;
            box-shadow: 0 24px 70px rgba(0,0,0,0.9), 0 0 50px rgba(160,90,255,0.35);
            text-align: center; color: #e0d8ff;
            transform: scale(0.6) rotate(-3deg); opacity: 0;
            transition: transform .6s cubic-bezier(0.16,1,0.3,1), opacity .6s ease;
          }
          #orbits-error-overlay.show .oe-box {
            transform: scale(1) rotate(0deg); opacity: 1;
          }
          #orbits-error-overlay h2 {
            font-size: 21px; color: #ff7070; margin-bottom: 14px; letter-spacing: 1px;
          }
          #orbits-error-overlay p {
            font-size: 14px; line-height: 1.6; white-space: pre-line; margin-bottom: 8px;
          }
          #orbits-error-overlay .oe-detail {
            font-size: 12px; color: #a898c8; margin-top: 10px; font-style: italic; word-break: break-word;
          }
          #orbits-error-overlay button {
            margin-top: 22px; padding: 12px 34px;
            background: linear-gradient(135deg, #ff3a3a, #a03030);
            color: #fff; border: none; border-radius: 14px;
            font-weight: 800; font-size: 15px; letter-spacing: 1px;
            cursor: pointer;
            box-shadow: 0 8px 24px rgba(255,60,60,0.5);
            transition: transform .1s ease;
            font-family: inherit;
          }
          #orbits-error-overlay button:active { transform: scale(0.96); }
        </style>
        <div class="oe-box">
          <h2>${T(code) || T('title')}</h2>
          <p>${T(code + '_text') || T('unknown_text')}</p>
          ${detail ? `<div class="oe-detail">${detail}</div>` : ''}
          <button type="button">${T('continue')}</button>
        </div>
      `;

      document.body.appendChild(overlay);
      activeOverlay = overlay;

      requestAnimationFrame(() => overlay.classList.add('show'));

      overlay.querySelector('button').addEventListener('click', () => {
        ErrorManager.hide();
      });

      try {
        if (window.Sound && Sound.hasBuffer && Sound.hasBuffer('error_snd')) {
          const v = (window.Settings && Settings.get('sfxVolume'));
          Sound.playSFX('error_snd', { volume: (typeof v === 'number' ? v : 0.8) });
        }
      } catch (e) {}
    },

    hide() {
      if (!activeOverlay) return;

      try { if (window.Sound && Sound.resumeAll) Sound.resumeAll(); } catch (e) {}

      const fs = document.getElementById('orbits-error-freeze');
      if (fs) fs.remove();

      const ov = activeOverlay;
      ov.classList.remove('show');
      activeOverlay = null;

      setTimeout(() => {
        try { ov.remove(); } catch (e) {}
        const cb = activeCallback;
        activeCallback = null;
        if (typeof cb === 'function') cb();
      }, 600);
    },

    isOpen() { return !!activeOverlay; },

    classify(err, fallback) {
      if (!err) return fallback || 'unknown';
      const msg = (err.message || String(err)).toLowerCase();
      if (msg.includes('mobile_only')) return 'mobile_only';
      if (msg.includes('weak_device')) return 'weak_device';
      if (msg.includes('failed to fetch') || msg.includes('networkerror') ||
          msg.includes('network error') || msg.includes('net::err') ||
          msg.includes('xhr network') || msg.includes('xhr 0')) return 'connection';
      if (msg.includes('http 4') || msg.includes('http 5') ||
          msg.includes('xhr 4') || msg.includes('xhr 5') ||
          msg.includes('range') || msg.includes('download')) return 'download';
      if (msg.includes('timeout') || msg.includes('превышено')) return 'timeout';
      if (msg.includes('хеш') || msg.includes('поврежд') ||
          msg.includes('пустой') || msg.includes('подмен')) return 'corrupted';
      return fallback || 'unknown';
    }
  };

  global.ErrorManager = ErrorManager;
  global.__ORBITS_ERROR__ = (opts) => ErrorManager.show(opts || { code: 'unknown' });
})(window);