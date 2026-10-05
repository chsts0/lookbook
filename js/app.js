/* ДСГН ПСВТ TV · лукбук · логика мини аппа */
(function () {
  'use strict';

  const LOOKS = window.LOOKS || [];
  const PALETTE = ['#FFFFFF', '#FEFB54', '#01ACD0', '#75FB4E', '#E934F5', '#E83224', '#0001F2'];
  const $ = (id) => document.getElementById(id);
  const pad = (n) => String(n).padStart(2, '0');
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- Telegram ---------------- */
  const tg = window.Telegram && window.Telegram.WebApp;
  const inTG = !!(tg && tg.initData);

  function tgSetup() {
    if (!tg) return;
    try {
      tg.ready();
      tg.expand();
      if (tg.isVersionAtLeast('6.1')) { tg.setHeaderColor('#000000'); tg.setBackgroundColor('#000000'); }
      if (tg.isVersionAtLeast('7.10')) tg.setBottomBarColor('#000000');
      if (tg.isVersionAtLeast('7.7')) tg.disableVerticalSwipes();
      const mobile = ['ios', 'android', 'android_x'].includes(tg.platform);
      if (mobile && tg.isVersionAtLeast('8.0')) tg.requestFullscreen();
      if (tg.isVersionAtLeast('6.1')) tg.BackButton.onClick(goBack);
    } catch (e) { /* в браузере или старой версии телеги просто пропускаем */ }
  }

  const haptic = {
    tap() { try { tg && tg.HapticFeedback && tg.HapticFeedback.selectionChanged(); } catch (e) {} },
    bump() { try { tg && tg.HapticFeedback && tg.HapticFeedback.impactOccurred('light'); } catch (e) {} },
    heavy() {
      try {
        if (tg && tg.HapticFeedback) tg.HapticFeedback.impactOccurred('heavy');
        else if (navigator.vibrate) navigator.vibrate(60);
      } catch (e) {}
    },
    error() {
      try {
        if (tg && tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('error');
        else if (navigator.vibrate) navigator.vibrate([80, 40, 80]);
      } catch (e) {}
    },
  };

  /* ---------------- утилиты цвета ---------------- */
  function inkFor(hex) {
    const n = parseInt(hex.slice(1), 16);
    const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    return lum > 0.3 ? '#000000' : '#FFFFFF';
  }
  function shade(hex, k) { // k < 1 темнее
    const n = parseInt(hex.slice(1), 16);
    const f = (v) => Math.max(0, Math.min(255, Math.round(v * k)));
    return '#' + [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(f).map((v) => v.toString(16).padStart(2, '0')).join('');
  }
  const photoSrc = (p) => (p ? (typeof p === 'string' ? p : p.src) : null);
  const photoPos = (p) => (p && typeof p === 'object' && p.pos) ? p.pos : '50% 50%';

  /* значки ♀ ♂ (вектором, не эмодзи) */
  const ICON = {
    f: (w = 10) => `<svg class="sex-ic" viewBox="0 0 12 17" width="${w}" height="${Math.round(w * 17 / 12)}" aria-hidden="true"><circle cx="6" cy="5.6" r="4.6" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M6 10.2V16.5M2.8 13.4H9.2" stroke="currentColor" stroke-width="1.7"/></svg>`,
    m: (w = 12) => `<svg class="sex-ic" viewBox="0 0 16 16" width="${w}" height="${w}" aria-hidden="true"><circle cx="6.2" cy="9.8" r="4.6" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M9.6 6.4L14.6 1.4M10 1.4H14.6V6" fill="none" stroke="currentColor" stroke-width="1.7"/></svg>`,
  };
  const SEX_LABEL = { f: 'девушка', m: 'парень' };

  /* остановки эфира: одиночный канал = 1 остановка, парный = 2 (сначала девушка) */
  const STOPS = [];
  LOOKS.forEach((l, ci) => {
    if (l.duo && l.duo.length) l.duo.forEach((p, si) => STOPS.push({ ci, si }));
    else STOPS.push({ ci, si: -1 });
  });
  const personOf = (stop) => { const l = LOOKS[stop.ci]; return stop.si < 0 ? l : l.duo[stop.si]; };
  const stopIndex = (ci, si = 0) => {
    const l = LOOKS[ci]; const want = l.duo && l.duo.length ? si : -1;
    const i = STOPS.findIndex((s) => s.ci === ci && s.si === want);
    return i < 0 ? 0 : i;
  };

  /* ---------------- хедер ---------------- */
  function osd(status, channel) {
    if (status != null) $('plate').textContent = status;
    if (channel != null) $('chLabel').textContent = channel;
  }

  /* ---------------- навигация ---------------- */
  const SCREENS = ['splash', 'cover', 'guide', 'channel'];
  let stack = [];

  function show(id) {
    SCREENS.forEach((s) => $(s).classList.toggle('active', s === id));
    const canBack = stack.length > 1;
    if (inTG && tg.isVersionAtLeast('6.1')) {
      canBack ? tg.BackButton.show() : tg.BackButton.hide();
    } else {
      $('backChip').classList.toggle('show', canBack);
    }
    if (id === 'cover') { osd('ON AIR', 'channel 1'); startTvCycle(); } else stopTvCycle();
    if (id === 'guide') { osd('ТЕЛЕГИД', 'program'); renderGuide(); }
  }
  function go(id) { stack.push(id); show(id); }
  function goBack() {
    if (stack.length <= 1) return;
    stack.pop();
    const id = stack[stack.length - 1];
    show(id);
    if (id === 'channel') enterChannel(cur, { signal: false });
  }
  $('backChip').addEventListener('click', goBack);

  /* ---------------- 01 заставка ---------------- */
  async function splash() {
    osd('NO SIGNAL', 'channel 0');
    const urls = [];
    STOPS.forEach((st) => { const p = personOf(st); ['full', 'd1', 'd2'].forEach((k) => { const s = photoSrc(p[k]); if (s) urls.push(s); }); });
    // сначала грузим первый канал, остальные догружаются фоном
    const first = urls.slice(0, 3);
    let done = 0;
    const total = Math.max(first.length, 1);
    const ring = $('ringFg'), pct = $('ringPct');
    const CIRC = 364.4;
    let shown = 0;
    const setP = (p) => { ring.style.strokeDashoffset = String(CIRC * (1 - p)); pct.textContent = Math.round(p * 100) + '%'; };
    const loads = first.map((u) => new Promise((res) => { const im = new Image(); im.onload = im.onerror = () => { done++; res(); }; im.src = u; }));
    const t0 = performance.now();
    const MIN = reduceMotion ? 300 : 1300;
    await new Promise((resolve) => {
      function tick(t) {
        const real = first.length ? done / total : 1;
        const timeP = Math.min(1, (t - t0) / MIN);
        const target = Math.min(real, timeP);
        shown += (target - shown) * 0.25;
        if (target >= 1 && shown > 0.995) shown = 1;
        setP(shown);
        if (shown >= 1) resolve(); else requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
    await Promise.all(loads);
    urls.slice(3).forEach((u) => { const im = new Image(); im.src = u; });
    await sleep(180);
  }

  /* ---------------- 02 обложка ---------------- */
  let tvTimer = null, tvIdx = 1;
  function startTvCycle() {
    if (tvTimer || reduceMotion) return;
    tvTimer = setInterval(() => {
      tvIdx = (tvIdx + 1) % PALETTE.length;
      if (PALETTE[tvIdx] === '#FFFFFF' || PALETTE[tvIdx] === '#0001F2') tvIdx = (tvIdx + 1) % PALETTE.length;
      document.documentElement.style.setProperty('--tv', PALETTE[tvIdx]);
    }, 2400);
  }
  function stopTvCycle() { clearInterval(tvTimer); tvTimer = null; }

  $('ctaWatch').addEventListener('click', () => { haptic.bump(); openStop(0); });
  $('toGuide').addEventListener('click', () => { haptic.tap(); go('guide'); });

  /* ---------------- 03 телегид ---------------- */
  let watched = -1;
  function renderGuide() {
    const list = $('guideList');
    list.innerHTML = '';
    LOOKS.forEach((l, i) => {
      const li = document.createElement('li');
      const live = i === (watched < 0 ? 0 : watched);
      const ink = inkFor(l.color);
      const people = l.duo && l.duo.length ? l.duo : [l];
      const thumbs = people.map((p) => {
        const src = photoSrc(p.full);
        const tag = p.sex ? `<span class="g-sex">${ICON[p.sex](p.sex === 'f' ? 8 : 10)}</span>` : '';
        return `<span class="g-half">${src
          ? `<img src="${src}" alt="" style="object-position:${photoPos(p.full)}" loading="lazy">`
          : `<span class="ph" style="--ph:${shade(l.color, p.sex === 'm' ? 0.8 : 1)};color:${ink}">${people.length > 1 ? '' : `<span class="ph-lbl">CH ${pad(i + 1)}</span>`}</span>`}${tag}</span>`;
      }).join('');
      const marks = people.length > 1
        ? `<span class="g-marks">${people.map((p) => `<span class="g-mark" style="color:${ink}">${ICON[p.sex]()}</span>`).join('')}</span>` : '';
      li.innerHTML =
        `<button class="g-row" type="button" style="--c:${l.color};--c-ink:${ink}">
          <span class="g-thumb${people.length > 1 ? ' duo' : ''}">${thumbs}</span>
          <span class="g-text"><span class="g-ch">CH ${pad(i + 1)}</span><span class="g-name${l.name.length > 10 ? ' long' : ''}" style="color:${ink === '#FFFFFF' ? '#FFFFFF' : l.color}">${l.name}</span>${marks}</span>
          <span class="g-state ${live ? 'live' : ''}">${live ? '● ON AIR'
            : '<svg viewBox="0 0 8 10" width="8" height="10" aria-hidden="true"><path d="M0 0l8 5-8 5z" fill="currentColor"/></svg>'}</span>
        </button>`;
      li.firstElementChild.addEventListener('click', () => { haptic.tap(); openStop(stopIndex(i, 0)); });
      list.appendChild(li);
    });
  }

  /* ---------------- 04 канал ---------------- */
  const stage = $('stage');
  const frameMain = $('frameMain');
  let cur = 0;      // индекс в STOPS
  let current = 0;  // индекс канала в LOOKS
  let mainKey = 'full';
  let cards = {};
  let busy = false;

  const LABELS = {
    full: (i, sex) => ({ big: `CH ${pad(i + 1)}${sex ? ' ' + ICON[sex](sex === 'f' ? 14 : 17) : ''}`, lbl: 'ПОЛНЫЙ РОСТ' + (sex ? ' · ' + SEX_LABEL[sex] : '') }),
    d1: () => ({ big: '01', lbl: 'ДЕТАЛЬ 1' }),
    d2: () => ({ big: '02', lbl: 'ДЕТАЛЬ 2' }),
  };
  const TONES = { full: 1, d1: 0.86, d2: 0.74 };

  function buildCards(stop) {
    Object.values(cards).forEach((c) => c.remove());
    cards = {};
    const i = stop.ci;
    const look = LOOKS[i];
    const person = personOf(stop);
    ['full', 'd1', 'd2'].forEach((k) => {
      const el = document.createElement('div');
      el.className = 'card';
      el.dataset.key = k;
      const src = photoSrc(person[k]);
      if (src) {
        el.innerHTML = `<img src="${src}" alt="" style="object-position:${photoPos(person[k])}" decoding="async">`;
      } else {
        const t = LABELS[k](i, person.sex);
        const bg = shade(look.color, TONES[k] * (person.sex === 'm' ? 0.88 : 1));
        el.innerHTML = `<div class="ph" style="--ph:${bg};color:${inkFor(bg)}"><span class="ph-big">${t.big}</span><span class="ph-lbl">${t.lbl}</span></div>`;
      }
      el.addEventListener('click', () => {
        if (suppressClick || k === mainKey) return;
        haptic.tap();
        mainKey = k;
        layout(true);
      });
      stage.insertBefore(el, frameMain);
      cards[k] = el;
    });
  }

  // раскладка Б: большой кадр слева, две детали столбиком справа
  function layout(animate) {
    const W = stage.clientWidth, H = stage.clientHeight;
    const gap = 8;
    const smallW = Math.round(W * 0.29);
    const mainW = W - smallW - gap;
    const smallH = (H - gap) / 2;
    const order = mainKey === 'full' ? ['full', 'd1', 'd2'] : mainKey === 'd1' ? ['d1', 'full', 'd2'] : ['d2', 'full', 'd1'];
    const rects = [
      { l: 0, t: 0, w: mainW, h: H },
      { l: mainW + gap, t: 0, w: smallW, h: smallH },
      { l: mainW + gap, t: smallH + gap, w: smallW, h: smallH },
    ];
    order.forEach((k, idx) => {
      const c = cards[k]; if (!c) return;
      if (!animate) c.style.transition = 'none';
      const r = rects[idx];
      Object.assign(c.style, { left: r.l + 'px', top: r.t + 'px', width: r.w + 'px', height: r.h + 'px' });
      c.classList.toggle('is-main', idx === 0);
      c.classList.toggle('is-small', idx !== 0);
      if (!animate) { void c.offsetWidth; c.style.transition = ''; }
    });
    if (!animate) frameMain.style.transition = 'none';
    Object.assign(frameMain.style, { left: '0px', top: '0px', width: mainW + 'px', height: H + 'px' });
    if (!animate) { void frameMain.offsetWidth; frameMain.style.transition = ''; }
  }
  window.addEventListener('resize', () => { if ($('channel').classList.contains('active')) layout(false); });

  function fitName() {
    const el = $('panelName');
    el.style.fontSize = '';
    let size = parseFloat(getComputedStyle(el).fontSize);
    while (el.scrollWidth > el.clientWidth && size > 20) { size = Math.floor(size - 1); el.style.fontSize = size + 'px'; }
  }

  function applyChannelChrome(stop) {
    const look = LOOKS[stop.ci];
    const person = personOf(stop);
    const root = document.documentElement.style;
    root.setProperty('--ch', look.color);
    root.setProperty('--ch-ink', inkFor(look.color));
    $('panelCh').textContent = `CH ${pad(stop.ci + 1)} / ${pad(LOOKS.length)}`;
    $('panelName').textContent = person.title || look.name;
    const sex = $('panelSex');
    sex.innerHTML = '';
    if (look.duo && look.duo.length) {
      look.duo.forEach((p, si) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'sex-seg' + (si === stop.si ? ' on' : '');
        b.setAttribute('role', 'tab');
        b.setAttribute('aria-selected', si === stop.si ? 'true' : 'false');
        b.setAttribute('aria-label', SEX_LABEL[p.sex]);
        b.innerHTML = ICON[p.sex]();
        b.addEventListener('click', () => { if (si !== stop.si) jumpTo(stopIndex(stop.ci, si)); });
        sex.appendChild(b);
      });
    }
    fitName();
  }

  async function enterChannel(si, opts = {}) {
    cur = (si + STOPS.length) % STOPS.length;
    const stop = STOPS[cur];
    current = stop.ci;
    watched = current;
    mainKey = 'full';
    applyChannelChrome(stop);
    buildCards(stop);
    layout(false);
    if (opts.signal !== false) {
      osd('NO SIGNAL', `channel ${current + 1}`);
      await tuneIn();
    }
    osd(`CH ${pad(current + 1)}`, `channel ${current + 1}`);
  }

  function openStop(si) {
    if (stack[stack.length - 1] !== 'channel') go('channel');
    enterChannel(si);
    flashOSD(STOPS[(si + STOPS.length) % STOPS.length]);
  }

  async function jumpTo(si) {
    if (busy) return;
    busy = true;
    const next = (si + STOPS.length) % STOPS.length;
    if (STOPS[next].ci === STOPS[cur].ci) {
      // тот же канал, другой человек: без помех и без большой цифры канала
      haptic.tap();
      stage.classList.add('swap');
      await sleep(170);
      enterChannel(next, { signal: false });
      stage.classList.remove('swap');
      await sleep(180);
    } else {
      haptic.bump();
      await staticBurst(240);
      enterChannel(next);
      flashOSD(STOPS[next]);
      await sleep(300);
    }
    busy = false;
  }
  const switchChannel = (dir) => jumpTo(cur + dir);

  $('nextBtn').addEventListener('click', () => switchChannel(1));
  $('prevBtn').addEventListener('click', () => switchChannel(-1));

  // свайп по фото = переключение канала
  let sx = 0, sy = 0, st = 0, suppressClick = false;
  stage.addEventListener('touchstart', (e) => { const t = e.touches[0]; sx = t.clientX; sy = t.clientY; st = Date.now(); suppressClick = false; }, { passive: true });
  stage.addEventListener('touchend', (e) => {
    const t = e.changedTouches[0];
    const dx = t.clientX - sx, dy = t.clientY - sy;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5 && Date.now() - st < 700) {
      suppressClick = true;
      setTimeout(() => { suppressClick = false; }, 350);
      switchChannel(dx < 0 ? 1 : -1);
    }
  }, { passive: true });

  /* ---------------- эффекты: помехи, сигнал, OSD ---------------- */
  function drawNoise(ctx, w, h, strength) {
    ctx.clearRect(0, 0, w, h);
    // зерно
    const g = Math.floor(w * h * 0.035 * strength);
    for (let i = 0; i < g; i++) {
      const v = Math.random() > 0.5 ? 255 : 0;
      ctx.fillStyle = `rgba(${v},${v},${v},${0.35 + Math.random() * 0.5})`;
      ctx.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 2, 1);
    }
    // полосы
    const bars = 6 + Math.floor(Math.random() * 8);
    for (let i = 0; i < bars; i++) {
      const c = PALETTE[Math.floor(Math.random() * PALETTE.length)];
      ctx.globalAlpha = (0.15 + Math.random() * 0.7) * strength;
      ctx.fillStyle = c;
      const bh = Math.random() < 0.7 ? 1 + Math.random() * 4 : 6 + Math.random() * h * 0.08;
      ctx.fillRect(-10 + Math.random() * 20, Math.random() * h, w + 20, bh);
    }
    ctx.globalAlpha = 1;
  }

  function runCanvas(canvas, ms, opts = {}) {
    return new Promise((resolve) => {
      if (reduceMotion) { resolve(); return; }
      const scale = 0.5; // пониженное разрешение = более «телевизионное» зерно
      const w = Math.max(1, Math.floor(canvas.clientWidth * scale));
      const h = Math.max(1, Math.floor(canvas.clientHeight * scale));
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext('2d');
      canvas.classList.add('on');
      const t0 = performance.now();
      (function frame(t) {
        const p = (t - t0) / ms;
        if (opts.fill) { ctx.fillStyle = '#000'; }
        drawNoise(ctx, w, h, opts.fade ? Math.max(0.15, 1 - p) : 1);
        if (opts.dim) { ctx.globalAlpha = 0.35; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, w, h); ctx.globalAlpha = 1; }
        if (p < 1) requestAnimationFrame(frame);
        else { canvas.classList.remove('on'); resolve(); }
      })(t0);
    });
  }

  // «ловим сигнал»: фото в дизере + помехи, потом проявляется
  async function tuneIn() {
    stage.classList.add('tuning');
    await runCanvas($('signal'), reduceMotion ? 1 : 700, { fade: true });
    stage.classList.remove('tuning');
  }
  async function staticBurst(ms) {
    const c = $('static');
    c.style.background = 'rgba(0,0,0,.55)';
    await runCanvas(c, ms);
    c.style.background = '';
  }
  let osdTimer = null;
  function flashOSD(stop) {
    const el = $('osdBig');
    el.textContent = `CH ${pad(stop.ci + 1)}`;
    el.classList.add('on');
    clearTimeout(osdTimer);
    osdTimer = setTimeout(() => el.classList.remove('on'), 1100);
  }

  /* ---------------- пасхалка: сломанный тв ----------------
     Встряхнуть телефон (или долго держать палец на плашке сверху / на лого):
     экран глючит, цвета разъезжаются, TV в лого мигает всей палитрой, телефон вибрирует. */
  let glitching = false;
  async function glitch() {
    if (glitching || reduceMotion) return;
    glitching = true;
    const root = document.documentElement;
    const plateWas = $('plate').textContent;
    const chWas = getComputedStyle(root).getPropertyValue('--ch').trim();
    const tvWas = getComputedStyle(root).getPropertyValue('--tv').trim();
    osd('SIGNAL LOST');
    document.body.classList.add('glitch');
    haptic.error();
    // вибро-очередь: тряска «телевизора»
    const buzz = [120, 260, 380, 560, 700, 900];
    buzz.forEach((t) => setTimeout(haptic.heavy, t));
    // цвета мигают всей палитрой
    let k = 0;
    const colorTimer = setInterval(() => {
      const c = PALETTE[k++ % PALETTE.length];
      root.style.setProperty('--ch', c);
      root.style.setProperty('--ch-ink', inkFor(c));
      root.style.setProperty('--tv', c);
    }, 70);
    await runCanvas($('static'), 1300, { fade: true });
    clearInterval(colorTimer);
    root.style.setProperty('--ch', chWas);
    root.style.setProperty('--ch-ink', inkFor(chWas || '#FEFB54'));
    root.style.setProperty('--tv', tvWas || PALETTE[1]);
    document.body.classList.remove('glitch');
    osd(plateWas);
    haptic.bump();
    setTimeout(() => { glitching = false; }, 800);
  }

  // детектор тряски: резкие рывки по осям 3 раза за 0.8 с
  let last = null, peaks = [];
  function onAccel(x, y, z) {
    if (last) {
      const jerk = Math.abs(x - last.x) + Math.abs(y - last.y) + Math.abs(z - last.z);
      if (jerk > 22) {
        const now = Date.now();
        peaks = peaks.filter((t) => now - t < 800);
        if (!peaks.length || now - peaks[peaks.length - 1] > 60) peaks.push(now);
        if (peaks.length >= 3) { peaks = []; glitch(); }
      }
    }
    last = { x, y, z };
  }
  function setupShake() {
    try {
      // в телеге (Bot API 8.0+) есть свой акселерометр, без системных запросов
      if (inTG && tg.isVersionAtLeast('8.0') && tg.Accelerometer) {
        tg.onEvent('accelerometerChanged', () => onAccel(tg.Accelerometer.x, tg.Accelerometer.y, tg.Accelerometer.z));
        tg.Accelerometer.start({ refresh_rate: 60 });
        return;
      }
    } catch (e) { /* падаем на обычный devicemotion */ }
    window.addEventListener('devicemotion', (e) => {
      const a = e.accelerationIncludingGravity;
      if (a && a.x != null) onAccel(a.x, a.y, a.z);
    });
  }
  // на iOS в обычном браузере датчик надо разрешить по тапу
  function askMotionPermission() {
    if (inTG) return;
    const D = window.DeviceMotionEvent;
    if (D && typeof D.requestPermission === 'function') { D.requestPermission().catch(() => {}); }
  }
  document.addEventListener('click', askMotionPermission, { once: true });

  // долгое нажатие: плашка сверху и лого (работает и на компе)
  function longPress(el, ms = 650) {
    let t = null;
    const start = () => { t = setTimeout(glitch, ms); };
    const stop = () => { clearTimeout(t); };
    el.addEventListener('pointerdown', start);
    ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => el.addEventListener(ev, stop));
    el.addEventListener('contextmenu', (e) => e.preventDefault());
  }
  longPress($('plate'));
  longPress(document.querySelector('.logo'));

  /* ---------------- старт ---------------- */
  async function boot() {
    tgSetup();
    stack = ['splash'];
    show('splash');
    await splash();
    setupShake();

    // ссылка вида t.me/<бот>/<app>?startapp=ch02 открывает сразу нужный канал
    const param = (inTG && tg.initDataUnsafe && tg.initDataUnsafe.start_param) || location.hash.replace('#', '');
    let deep = -1;
    const m = /^(ch\d+)([fm])?$/i.exec(param || '');
    if (m) {
      const ci = LOOKS.findIndex((l) => l.id === m[1].toLowerCase());
      if (ci >= 0) { const l = LOOKS[ci]; const si = l.duo && m[2] ? Math.max(0, l.duo.findIndex((p) => p.sex === m[2].toLowerCase())) : 0; deep = stopIndex(ci, si); }
    }

    stack = ['cover'];
    show('cover');
    if (deep >= 0) {
      stack = ['cover', 'guide'];
      openStop(deep);
    }
  }
  boot();
})();
