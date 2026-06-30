/* =========================================================================
   kshift.me — the page is the Shift key.
   A field of characters that SHIFT to their Shift-key form near the cursor.
   The title "kshift" (and your real ⇧ key) ripples the field & flips day/night.
   ========================================================================= */
(() => {
  "use strict";

  const root = document.documentElement;
  const body = document.body;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(pointer: fine)").matches;
  const coarse = matchMedia("(pointer: coarse)").matches;

  /* ---- the wallpaper: a hidden note wearing a hacker disguise ------------ */
  // each cell takes the next letter of MESSAGE, then maybe leet-swaps it
  // (a→4, e→3, o→0, s→5…) or drops in a glitch symbol, so the tiled text looks
  // scrambled & random. the shift hotspot DECODES a region back to clean CAPS.
  const MESSAGE =
    "kshift. a website that only knows one trick. press shift and the quiet " +
    "letters stand up and shout, then sit back down. nothing here ever really " +
    "changes, only the case. no cookies, no analytics, no point. just made on a " +
    "slow afternoon by someone who likes keyboards a little too much. hold shift " +
    "to make the whole wall loud, let go and it goes calm again. that is the " +
    "entire website. thanks for reading the wallpaper. ";

  const LEET = {
    a: "4@", b: "8", c: "<", e: "3", g: "9", h: "#", i: "1!",
    l: "1", o: "0", r: "2", s: "5$", t: "7", x: "%", z: "2",
  };
  const NOISE = "!@#$%^&*<>{}[]/\\=+;:~?|".split("");
  const rand = (n) => {
    const s = Math.sin(n * 12.9898) * 43758.5453;
    return s - Math.floor(s);
  };
  // resting (disguised) glyph for an original message char
  function glitch(ch, seed) {
    const a = rand(seed), b = rand(seed * 1.73 + 4.1);
    if (a < 0.07) return NOISE[(b * NOISE.length) | 0]; // pure glitch artifact
    const v = LEET[ch];
    if (v && a < 0.5) return v[(b * v.length) | 0]; // leet substitution
    return ch;
  }
  // decoded glyph the hotspot reveals: the clean, SHOUTED message
  const decodeOf = (ch) => (ch >= "a" && ch <= "z" ? ch.toUpperCase() : ch);

  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const lerp = (a, b, t) => a + (b - a) * t;
  const mixRGB = (a, b, t) =>
    `rgb(${Math.round(lerp(a[0], b[0], t))},${Math.round(lerp(a[1], b[1], t))},${Math.round(lerp(a[2], b[2], t))})`;

  /* ---- theme ------------------------------------------------------------ */
  let night = root.classList.contains("night");
  const cssVar = (n) => getComputedStyle(root).getPropertyValue(n).trim();
  const hexToRgb = (hex) => {
    hex = (hex || "").replace("#", "");
    if (hex.length === 3) hex = hex.replace(/./g, "$&$&");
    const n = parseInt(hex, 16);
    const rgb = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    return rgb.some((c) => Number.isNaN(c)) ? null : rgb;
  };

  let fgRGB = [24, 21, 15], accentRGB = [199, 242, 59], popRGB = [255, 91, 69];
  const PAL_N = 24;
  let restPal = [], accentPal = [], popPal = [];
  function buildPalettes() {
    restPal = []; accentPal = []; popPal = [];
    for (let b = 0; b < PAL_N; b++) {
      const u = b / (PAL_N - 1);
      restPal.push(mixRGB(fgRGB, accentRGB, u * 0.2));
      accentPal.push(mixRGB(fgRGB, accentRGB, 0.3 + 0.7 * u));
      popPal.push(mixRGB(fgRGB, popRGB, 0.3 + 0.7 * u));
    }
  }
  function refreshColors() {
    fgRGB = hexToRgb(cssVar("--fg")) || fgRGB;
    accentRGB = hexToRgb(cssVar("--accent")) || accentRGB;
    popRGB = hexToRgb(cssVar("--pop")) || popRGB;
    buildPalettes();
    const m = document.querySelector('meta[name="theme-color"]');
    if (m) m.content = cssVar("--bg") || "#f1e9d9";
  }
  function setTheme(toNight) {
    night = toNight;
    root.classList.toggle("night", night);
    try { localStorage.setItem("kshift-theme", night ? "night" : "day"); } catch (e) {}
    refreshColors();
  }

  /* ---- canvas shift-field ----------------------------------------------- */
  const canvas = document.querySelector("[data-field]");
  const ctx = canvas && canvas.getContext("2d");

  let w = 0, h = 0, lastW = 0, lastH = 0;
  let cols = 0, rows = 0, cellW = 0, cellH = 0, fontPx = 20, R = 200;
  let cx = new Float32Array(0), cy = new Float32Array(0);
  let baseChar = [], shiftChar = [];
  let hotArr = new Float32Array(0), waveArr = new Uint8Array(0);
  let fontThin = "300 20px monospace", fontBold = "600 20px monospace";

  const pointer = { x: innerWidth / 2, y: innerHeight / 2 };
  const target = { x: innerWidth / 2, y: innerHeight / 2 };
  const fp = { x: innerWidth / 2, y: innerHeight / 2 };
  let lastMove = -1e9;
  let shiftHeld = false;

  const waves = [];
  const WAVE_DUR = 1200, WAVE_BAND = 110;

  function sizeCanvas() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    w = innerWidth; h = innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function build() {
    if (!ctx) return;
    sizeCanvas();
    lastW = w; lastH = h;
    fontPx = Math.round(clamp(Math.min(w, h) / 24, 17, 30));
    fontThin = `300 ${fontPx}px ${getComputedStyle(root).getPropertyValue("--mono")}`;
    fontBold = `600 ${fontPx}px ${getComputedStyle(root).getPropertyValue("--mono")}`;
    ctx.font = fontBold;
    const glyphW = ctx.measureText("M").width || fontPx * 0.6;
    cellW = glyphW * 1.12;  // near-natural mono spacing so the words actually read
    cellH = fontPx * 1.72;
    cols = Math.ceil(w / cellW) + 2;
    rows = Math.ceil(h / cellH) + 2;
    const ox = (w - cols * cellW) / 2 + cellW / 2;
    const oy = (h - rows * cellH) / 2 + cellH / 2;
    const n = cols * rows;
    cx = new Float32Array(n); cy = new Float32Array(n);
    baseChar = new Array(n); shiftChar = new Array(n);
    hotArr = new Float32Array(n); waveArr = new Uint8Array(n);
    let i = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        cx[i] = ox + c * cellW; cy[i] = oy + r * cellH;
        const seed = r * cols + c;
        const orig = MESSAGE[seed % MESSAGE.length];
        baseChar[i] = glitch(orig, seed);
        shiftChar[i] = decodeOf(orig);
        i++;
      }
    }
    R = Math.max(Math.min(w, h) * 0.3, 170);
  }

  function updateTarget(now) {
    const idle = now - lastMove;
    if (idle < 1400) { target.x = pointer.x; target.y = pointer.y; }
    else {
      // continuous, slow, silky drift across the whole field (idle ambient)
      const t = now / 1000;
      target.x = w * 0.5 + Math.sin(t * 0.105) * w * 0.34 + Math.sin(t * 0.061 + 1.7) * w * 0.1;
      target.y = h * 0.5 + Math.cos(t * 0.123 + 0.6) * h * 0.3 + Math.sin(t * 0.077 + 0.3) * h * 0.09;
    }
  }

  let lastDrawNow = 0;
  function draw(now) {
    if (!ctx) return;
    updateTarget(now);
    if (reduced) { fp.x = target.x; fp.y = target.y; }
    else {
      const dt = lastDrawNow ? now - lastDrawNow : 16;
      const k = 1 - Math.exp(-dt / 150); // gentle, frame-rate-independent trail
      fp.x += (target.x - fp.x) * k;
      fp.y += (target.y - fp.y) * k;
    }
    lastDrawNow = now;

    for (let i = waves.length - 1; i >= 0; i--) {
      const age = now - waves[i].t0;
      if (age > WAVE_DUR) { waves.splice(i, 1); continue; }
      waves[i].rr = (age / WAVE_DUR) * waves[i].max;
      waves[i].fade = 1 - age / WAVE_DUR;
    }

    ctx.clearRect(0, 0, w, h);
    const n = cx.length, fx = fp.x, fy = fp.y, nw = waves.length;

    for (let i = 0; i < n; i++) {
      const dx = cx[i] - fx, dy = cy[i] - fy;
      let t = 1 - Math.sqrt(dx * dx + dy * dy) / R;
      if (t < 0) t = 0;
      t = t * t * (3 - 2 * t);
      if (shiftHeld && t < 0.92) t = 0.92;
      let wv = 0;
      for (let k = 0; k < nw; k++) {
        const wx = cx[i] - waves[k].x, wy = cy[i] - waves[k].y;
        const wd = Math.sqrt(wx * wx + wy * wy);
        let ring = 1 - Math.abs(wd - waves[k].rr) / WAVE_BAND;
        if (ring > 0) { ring *= waves[k].fade; if (ring > wv) wv = ring; }
      }
      if (wv > t) { hotArr[i] = wv > 1 ? 1 : wv; waveArr[i] = 1; }
      else { hotArr[i] = t > 1 ? 1 : t; waveArr[i] = 0; }
    }

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.font = fontThin;
    for (let i = 0; i < n; i++) {
      const hot = hotArr[i];
      if (hot >= 0.5) continue;
      let b = (hot * 2 * (PAL_N - 1)) | 0;
      if (b > PAL_N - 1) b = PAL_N - 1;
      ctx.fillStyle = restPal[b];
      ctx.globalAlpha = 0.1 + hot * 0.6;
      ctx.fillText(baseChar[i], cx[i], cy[i]);
    }

    ctx.font = fontBold;
    for (let i = 0; i < n; i++) {
      const hot = hotArr[i];
      if (hot < 0.5) continue;
      const kk = (hot - 0.5) * 2;
      let b = (kk * (PAL_N - 1)) | 0;
      if (b > PAL_N - 1) b = PAL_N - 1;
      ctx.fillStyle = waveArr[i] ? popPal[b] : accentPal[b];
      ctx.globalAlpha = 0.6 + 0.4 * kk;
      ctx.fillText(shiftChar[i], cx[i], cy[i] - kk * 4);
    }
    ctx.globalAlpha = 1;
  }

  /* ---- loop (continuous while visible; paused when hidden) --------------- */
  let running = false;
  function frame(now) {
    if (!running) return;
    draw(now);
    requestAnimationFrame(frame);
  }
  function start() {
    if (running || reduced || !ctx) return;
    running = true; lastDrawNow = 0;
    requestAnimationFrame(frame);
  }
  const renderOnce = () => draw(performance.now());

  /* ---- the shift gesture (title is the control) ------------------------- */
  const title = document.querySelector("[data-shift]");
  const hint = document.querySelector("[data-hint]");
  const hintKey = document.querySelector("[data-hint-key]");
  const hintLabel = document.querySelector("[data-hint-label]");
  let lastThemeFlip = -1e9;
  let interacted = false;

  function markInteracted() {
    if (interacted) return;
    interacted = true;
    if (hint) hint.classList.add("is-hushed");
  }

  let audio = null;
  function thock() {
    if (reduced) return;
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      const c = audio;
      const play = () => {
        const t0 = c.currentTime, dur = 0.13;
        const buf = c.createBuffer(1, Math.ceil(c.sampleRate * dur), c.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < d.length; i++)
          d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2.6);
        const src = c.createBufferSource(); src.buffer = buf;
        const lp = c.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 1500;
        const g = c.createGain();
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.linearRampToValueAtTime(0.13, t0 + 0.004);
        g.gain.exponentialRampToValueAtTime(0.0008, t0 + dur);
        src.connect(lp).connect(g).connect(c.destination); src.start(t0);
        const o = c.createOscillator(); o.type = "sine";
        o.frequency.setValueAtTime(190, t0);
        o.frequency.exponentialRampToValueAtTime(72, t0 + 0.08);
        const g2 = c.createGain();
        g2.gain.setValueAtTime(0.0001, t0);
        g2.gain.linearRampToValueAtTime(0.15, t0 + 0.004);
        g2.gain.exponentialRampToValueAtTime(0.0008, t0 + 0.11);
        o.connect(g2).connect(c.destination); o.start(t0); o.stop(t0 + 0.12);
      };
      c.state === "suspended" ? c.resume().then(play, () => {}) : play();
    } catch (e) {}
  }
  function spawnWave(x, y) {
    if (reduced) return;
    waves.push({ x, y, t0: performance.now(), rr: 0, fade: 1, max: Math.sqrt(w * w + h * h) * 0.62 });
    if (waves.length > 4) waves.shift();
  }
  function titleCenter() {
    if (!title) return { x: w / 2, y: h * 0.4 };
    const r = title.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }
  function doShift() {
    markInteracted();
    const now = performance.now();
    if (now - lastThemeFlip > 720) { setTheme(!night); lastThemeFlip = now; } // never strobe
    spawnWave(titleCenter().x, titleCenter().y);
    thock();
    reduced ? renderOnce() : start();
  }
  title && title.addEventListener("click", doShift);

  /* ---- input ------------------------------------------------------------ */
  function onPointer(e) {
    pointer.x = e.clientX; pointer.y = e.clientY;
    lastMove = performance.now();
    if (shiftHeld && e.shiftKey === false) releaseShift();
    reduced ? renderOnce() : start();
  }
  addEventListener("pointermove", onPointer, { passive: true });
  addEventListener("pointerdown", onPointer, { passive: true });

  // real ⇧ key: a clean tap/hold is the trick; Shift+key chords are left alone
  let shiftTapClean = false;
  addEventListener("keydown", (e) => {
    if (e.key === "Shift") {
      if (e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
      shiftHeld = true; shiftTapClean = true;
      markInteracted();
      body.classList.add("is-shifting");
      reduced ? renderOnce() : start();
    } else if (shiftHeld) {
      shiftTapClean = false;
    }
  });
  addEventListener("keyup", (e) => {
    if (e.key !== "Shift") return;
    const wasClean = shiftTapClean;
    shiftHeld = false; shiftTapClean = false;
    body.classList.remove("is-shifting");
    if (wasClean) doShift();
    else reduced ? renderOnce() : start();
  });

  function releaseShift() {
    if (!shiftHeld) return;
    shiftHeld = false; shiftTapClean = false;
    body.classList.remove("is-shifting");
  }
  addEventListener("blur", releaseShift);
  document.addEventListener("focusout", releaseShift);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) { releaseShift(); running = false; }
    else if (!reduced) { start(); }
    else renderOnce();
  });

  let resizeTimer = 0;
  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      // pure height twitch (mobile URL bar) → refit canvas, keep the grid
      if (innerWidth === lastW && Math.abs(innerHeight - lastH) <= 120) {
        sizeCanvas(); lastH = innerHeight;
      } else { build(); }
      reduced ? renderOnce() : start();
    }, 150);
  }
  addEventListener("resize", onResize);
  if (window.visualViewport) visualViewport.addEventListener("resize", onResize);

  /* ---- boot ------------------------------------------------------------- */
  if (hint) {
    if (coarse && !fine) {
      if (hintKey) hintKey.textContent = "↑";
      if (hintLabel) hintLabel.textContent = "tap kshift";
    } else {
      if (hintKey) hintKey.textContent = "⇧";
      if (hintLabel) hintLabel.textContent = "press shift";
    }
  }
  refreshColors();
  build();
  renderOnce();
  start();
  addEventListener("load", () => { build(); reduced ? renderOnce() : start(); });
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => { build(); reduced ? renderOnce() : start(); });
  }
})();
