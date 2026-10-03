/* =====================================================================
   ORBITS.IO — SOUND ENGINE
   Путь: Блоки/sounds.js
   ===================================================================== */
(function (global) {
  'use strict';

  const Sound = {
    ctx: null,
    masterGain: null,
    musicGain: null,
    sfxGain: null,
    unlocked: false,

    _buffers: {},
    _musicNodes: null,
    _sfxPool: [],
    _poolSize: 16,
    _securityInstalled: false,

    init() {
      if (this.ctx) return this.ctx;
      const AC = global.AudioContext || global.webkitAudioContext;
      if (!AC) { console.warn('Web Audio API недоступен'); return null; }
      this.ctx = new AC({ latencyHint: 'interactive' });

      this.masterGain = this.ctx.createGain(); this.masterGain.gain.value = 1.0;
      this.musicGain  = this.ctx.createGain(); this.musicGain.gain.value  = 1.0;
      this.sfxGain    = this.ctx.createGain(); this.sfxGain.gain.value    = 1.0;

      this.musicGain.connect(this.masterGain);
      this.sfxGain.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);

      for (let i = 0; i < this._poolSize; i++) {
        const g = this.ctx.createGain();
        g.connect(this.sfxGain);
        this._sfxPool.push({ gain: g, busy: false, source: null });
      }

      this.installSecurity();
      return this.ctx;
    },

    installSecurity() {
      if (this._securityInstalled) return;
      this._securityInstalled = true;
      const isField = (t) => t === 'input' || t === 'textarea';

      document.addEventListener('contextmenu', (e) => {
        if (isField((e.target.tagName || '').toLowerCase())) return;
        e.preventDefault();
      }, { passive: false });

      document.addEventListener('selectstart', (e) => {
        if (isField((e.target.tagName || '').toLowerCase())) return;
        e.preventDefault();
      }, { passive: false });

      document.addEventListener('copy', (e) => {
        if (isField((e.target.tagName || '').toLowerCase())) return;
        e.preventDefault();
      });
      document.addEventListener('cut', (e) => {
        if (isField((e.target.tagName || '').toLowerCase())) return;
        e.preventDefault();
      });
      document.addEventListener('dragstart', (e) => e.preventDefault());

      document.addEventListener('keydown', (e) => {
        const k = (e.key || '').toLowerCase();
        const ctrl = e.ctrlKey || e.metaKey;
        const shift = e.shiftKey;
        if (k === 'f12') { e.preventDefault(); return; }
        if (ctrl && shift && (k === 'i' || k === 'j' || k === 'c')) { e.preventDefault(); return; }
        if (ctrl && k === 'u') { e.preventDefault(); return; }
        if (ctrl && k === 's') { e.preventDefault(); return; }
        if (ctrl && k === 'p') { e.preventDefault(); return; }
      }, { passive: false });
    },

    async unlock() {
      this.init();
      if (!this.ctx) return false;
      if (this.ctx.state === 'suspended') { try { await this.ctx.resume(); } catch (e) {} }
      const buf = this.ctx.createBuffer(1, 1, 22050);
      const src = this.ctx.createBufferSource();
      src.buffer = buf; src.connect(this.ctx.destination); src.start(0);
      this.unlocked = true;
      return true;
    },

    async loadBuffer(key, source, opts = {}) {
      if (!opts.force && this._buffers[key]) return this._buffers[key];
      this.init();
      if (!this.ctx) return null;

      let arrayBuffer;
      if (source instanceof Uint8Array) {
        arrayBuffer = source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength);
      } else if (source instanceof ArrayBuffer) {
        arrayBuffer = source;
      } else if (source instanceof Blob) {
        arrayBuffer = await source.arrayBuffer();
      } else if (typeof source === 'string') {
        arrayBuffer = await this._fetchAudio(source);
      } else {
        throw new Error('loadBuffer: неподдерживаемый тип source');
      }

      const buffer = await this.ctx.decodeAudioData(arrayBuffer);
      this._buffers[key] = buffer;
      return buffer;
    },

    async _fetchAudio(url) {
      try {
        const resp = await fetch(url, { mode: 'cors', credentials: 'omit' });
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        return await resp.arrayBuffer();
      } catch (e) { console.warn('[Sound] fetch не сработал:', e.message); }
      return await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve(xhr.response);
          else reject(new Error('XHR ' + xhr.status));
        };
        xhr.onerror = () => reject(new Error('XHR network error'));
        xhr.send();
      });
    },

    _stopNode(node, when) { try { node.stop(when); } catch (e) {} },

    async playMusic(key, opts = {}) {
      this.init();
      if (!this.ctx) return null;
      if (this.ctx.state === 'suspended') { try { await this.ctx.resume(); } catch (e) {} }
      this.stopMusic(0);

      const buffer = this._buffers[key];
      if (!buffer) throw new Error('playMusic: буфер "' + key + '" не загружен');

      const tailTrim = (typeof opts.tailTrim === 'number') ? opts.tailTrim : 0;
      const src = this.ctx.createBufferSource();
      src.buffer = buffer;

      const wantLoop = (opts.loop !== false);
      src.loop = wantLoop;

      const loopStart = opts.loopStart ?? 0;
      const loopEndRaw = opts.loopEnd ?? buffer.duration;
      const loopEnd = Math.max(loopStart + 0.01, loopEndRaw - tailTrim);

      if (wantLoop) {
        src.loopStart = Math.max(0, Math.min(loopStart, buffer.duration - 0.01));
        src.loopEnd   = Math.max(src.loopStart + 0.01, Math.min(loopEnd, buffer.duration));
      }

      src.connect(this.musicGain);

      const now = this.ctx.currentTime;
      const startAt = now + (opts.fadeIn || 0);
      src.start(startAt, opts.startAt || 0);

      if (opts.fadeIn) {
        this.musicGain.gain.cancelScheduledValues(now);
        this.musicGain.gain.setValueAtTime(0.0001, now);
        this.musicGain.gain.linearRampToValueAtTime(opts.volume ?? 1.0, startAt + opts.fadeIn);
      } else {
        this.musicGain.gain.value = opts.volume ?? 1.0;
      }

      this._musicNodes = src;
      return src;
    },

    async playMusicIntroLoop(key, opts = {}) {
      this.init();
      if (!this.ctx) return null;
      if (this.ctx.state === 'suspended') { try { await this.ctx.resume(); } catch (e) {} }
      this.stopMusic(0);

      const buffer = this._buffers[key];
      if (!buffer) throw new Error('playMusicIntroLoop: буфер "' + key + '" не загружен');

      const loopStart = opts.loopStart ?? 0;
      const loopEnd   = opts.loopEnd   ?? buffer.duration;
      const volume    = opts.volume    ?? 1.0;
      const fadeIn    = opts.fadeIn    ?? 0;
      const tailTrim  = opts.tailTrim  ?? 0;

      const lStart = Math.max(0, Math.min(loopStart, buffer.duration - 0.01));
      const lEnd   = Math.max(lStart + 0.01, Math.min(loopEnd, buffer.duration - tailTrim));
      const introEnd = Math.max(0.01, buffer.duration - tailTrim);

      const now = this.ctx.currentTime;

      const intro = this.ctx.createBufferSource();
      intro.buffer = buffer;
      intro.loop = false;
      intro.connect(this.musicGain);
      intro.start(now, 0);
      intro.stop(now + introEnd);

      const loop = this.ctx.createBufferSource();
      loop.buffer = buffer;
      loop.loop = true;
      loop.loopStart = lStart;
      loop.loopEnd = lEnd;
      loop.connect(this.musicGain);
      loop.start(now + introEnd, lStart);

      if (fadeIn > 0) {
        this.musicGain.gain.cancelScheduledValues(now);
        this.musicGain.gain.setValueAtTime(0.0001, now);
        this.musicGain.gain.linearRampToValueAtTime(volume, now + fadeIn);
      } else {
        this.musicGain.gain.value = volume;
      }

      this._musicNodes = { intro, loop };
      return this._musicNodes;
    },

    stopMusic(fadeOut = 0) {
      if (!this._musicNodes || !this.ctx) return;
      const src = this._musicNodes;
      const now = this.ctx.currentTime;

      if (fadeOut > 0) {
        this.musicGain.gain.cancelScheduledValues(now);
        this.musicGain.gain.setValueAtTime(this.musicGain.gain.value, now);
        this.musicGain.gain.linearRampToValueAtTime(0.0001, now + fadeOut);
        const stopTime = now + fadeOut + 0.05;
        if (src.intro && src.loop) {
          this._stopNode(src.intro, stopTime);
          this._stopNode(src.loop, stopTime);
        } else {
          this._stopNode(src, stopTime);
        }
      } else {
        if (src.intro && src.loop) {
          this._stopNode(src.intro, now);
          this._stopNode(src.loop, now);
        } else {
          this._stopNode(src, now);
        }
      }
      this._musicNodes = null;
    },

    async playSFX(key, opts = {}) {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') { try { await this.ctx.resume(); } catch (e) {} }

      const buffer = this._buffers[key];
      if (!buffer) { console.warn('playSFX: буфер "' + key + '" не загружен'); return; }

      let slot = this._sfxPool.find(s => !s.busy);
      if (!slot) {
        slot = this._sfxPool[0];
        try { slot.source && slot.source.stop(); } catch (e) {}
      }
      slot.busy = true;

      const src = this.ctx.createBufferSource();
      src.buffer = buffer;
      src.connect(slot.gain);

      slot.gain.gain.cancelScheduledValues(this.ctx.currentTime);
      slot.gain.gain.setValueAtTime(opts.volume ?? 1.0, this.ctx.currentTime);

      if (opts.rate) src.playbackRate.value = opts.rate;

      src.onended = () => { slot.busy = false; slot.source = null; };
      src.start(0);
      slot.source = src;
    },

    setMasterVolume(v, fade = 0) { this._ramp(this.masterGain.gain, v, fade); },
    setMusicVolume(v, fade = 0)  { this._ramp(this.musicGain.gain, v, fade); },
    setSFXVolume(v, fade = 0)    { this._ramp(this.sfxGain.gain, v, fade); },

    _ramp(param, value, duration) {
      if (!this.ctx || !param) return;
      const now = this.ctx.currentTime;
      param.cancelScheduledValues(now);
      param.setValueAtTime(param.value, now);
      if (duration > 0) param.linearRampToValueAtTime(value, now + duration);
      else param.value = value;
    },

    mute(fade = 0.2)   { this.setMasterVolume(0.0001, fade); },
    unmute(fade = 0.2) { this.setMasterVolume(1.0, fade); },
    pauseAll()  { if (this.ctx && this.ctx.state === 'running') this.ctx.suspend(); },
    resumeAll() { if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume(); },

    hasBuffer(key) { return !!this._buffers[key]; },
    getDuration(key) { return this._buffers[key] ? this._buffers[key].duration : 0; },
    unloadBuffer(key) { delete this._buffers[key]; },
    unloadAll() { this._buffers = {}; }
  };

  global.Sound = Sound;
})(window);