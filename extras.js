/* ===== Upgrade layer v3 ===== */
(function () {
  const C = window.CONFIG;
  const $ = (s) => document.querySelector(s);
  const boom = (o) => { try { if (window.confetti) window.confetti(o); } catch (e) {} };
  const song = $('#song');
  let started = false;
  const afterGo = (fn, ms) => document.addEventListener('intro-go', () => setTimeout(fn, ms));

  // ---- names / avatars
  $('#gate__h').textContent = 'Queen ' + C.herName + ', ye tumhare liye 🎁';
  $('.name span').textContent = C.herFull || C.herName;
  $('#chat__name').textContent = C.herName;

  // ---- countdown pill
  (function () {
    const el = $('#countdown');
    if (!C.dob) { el.textContent = '🎉 Aaj ka din tumhara hai! 🎉'; return; }
    const now = new Date(), today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let next = new Date(now.getFullYear(), C.dob.m - 1, C.dob.d);
    if (next < today) next = new Date(now.getFullYear() + 1, C.dob.m - 1, C.dob.d);
    const days = Math.round((next - today) / 86400000);
    const age = C.dob.y ? next.getFullYear() - C.dob.y : null;
    if (days === 0) { el.textContent = '🎉 Aaj hai tera din, ' + C.herName + '! 🎉'; afterGo(() => party(), 17500); }
    else el.textContent = '🎂 ' + (age ? 'Turning ' + age + ' in ' : 'Birthday in ') + days + ' days';
  })();

  // ---- confetti helpers
  function party() {
    const end = Date.now() + 2500;
    (function f() {
      boom({ particleCount: 5, angle: 60, spread: 60, origin: { x: 0, y: .8 }, colors: C.colors });
      boom({ particleCount: 5, angle: 120, spread: 60, origin: { x: 1, y: .8 }, colors: C.colors });
      if (Date.now() < end) requestAnimationFrame(f);
    })();
  }
  function fireworks() {
    for (let i = 0; i < 6; i++) setTimeout(() => boom({ particleCount: 90, spread: 360, startVelocity: 30, ticks: 70,
      gravity: .8, origin: { x: Math.random() * .6 + .2, y: Math.random() * .4 + .1 }, colors: C.colors }), i * 350);
  }

  // ---- music (your mp3)
  function setMusic(on) {
    const b = $('#music__toggle');
    if (on) { song.volume = .85; song.play().catch(() => {}); } else song.pause();
    b.classList.toggle('on', on); b.textContent = on ? '🔊' : '🎵';
  }
  $('#music__toggle').addEventListener('click', () => setMusic(song.paused));

  // ---- gate: tap to open (fireworks, then intro + music)
  // ---- opening fireworks (pataka) with synthesized sound
  function fireworks(ms) {
    return new Promise((res) => {
      const cv = document.createElement('canvas');
      cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:99999;background:#05020c;transition:opacity 1s';
      const tt = document.createElement('div'); tt.textContent = '🎆 Happy Birthday ' + C.herName + ' 🎆';
      tt.style.cssText = 'position:fixed;left:0;right:0;top:42%;text-align:center;z-index:100000;color:#ffd166;font:700 clamp(1.4rem,6vw,2.6rem) system-ui;text-shadow:0 0 18px #ff3366;opacity:0;transition:opacity 1.2s;pointer-events:none';
      document.body.append(cv, tt); setTimeout(() => (tt.style.opacity = 1), 1200);
      const x = cv.getContext('2d'), dpr = Math.min(devicePixelRatio || 1, 2);
      const W = (cv.width = innerWidth * dpr), H = (cv.height = innerHeight * dpr);
      let ac; try { ac = new (window.AudioContext || window.webkitAudioContext)(); ac.resume(); } catch (e) {}
      const noise = (dur, f0, f1, vol) => {
        if (!ac) return; const n = ac.createBuffer(1, ac.sampleRate * dur, ac.sampleRate), d = n.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
        const s = ac.createBufferSource(); s.buffer = n; const f = ac.createBiquadFilter(); f.type = 'lowpass';
        f.frequency.setValueAtTime(f0, ac.currentTime); f.frequency.exponentialRampToValueAtTime(f1, ac.currentTime + dur);
        const g = ac.createGain(); g.gain.value = vol; s.connect(f); f.connect(g); g.connect(ac.destination); s.start();
      };
      const tone = (f0, f1, dur, vol, type) => {
        if (!ac) return; const o = ac.createOscillator(), g = ac.createGain(); o.type = type || 'sine';
        o.frequency.setValueAtTime(f0, ac.currentTime); o.frequency.exponentialRampToValueAtTime(f1, ac.currentTime + dur);
        g.gain.setValueAtTime(vol, ac.currentTime); g.gain.exponentialRampToValueAtTime(.001, ac.currentTime + dur);
        o.connect(g); g.connect(ac.destination); o.start(); o.stop(ac.currentTime + dur);
      };
      const rockets = [], parts = [];
      const launch = (big) => { const tx = W * (.15 + Math.random() * .7), ty = H * (.15 + Math.random() * .3); rockets.push({ x: tx + (Math.random() - .5) * 60 * dpr, y: H, tx, ty, vy: -(H - ty) / 55, big }); tone(500, 1700, .7, .05, 'triangle'); };
      const burst = (px, py, big) => {
        const hue = Math.random() * 360, n = big ? 150 : 95, ring = Math.random() < .4;
        for (let i = 0; i < n; i++) { const a = Math.PI * 2 * i / n, sp = (ring ? 5 : 1 + Math.random() * 6) * dpr * (big ? 1.25 : 1); parts.push({ x: px, y: py, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, l: 1, h: hue + Math.random() * 50, s: Math.random() < .2 }); }
        noise(1.3, 1400, 90, .55); tone(110, 35, .5, .6);
        for (let i = 0; i < 8; i++) setTimeout(() => noise(.05, 5000, 3000, .2), 150 + Math.random() * 900);
      };
      [200, 700, 1300, 1900, 2500, 3000, 3500, 4100].forEach((t) => setTimeout(() => launch(false), t));
      [4700, 4950, 5200].forEach((t) => setTimeout(() => launch(true), t));
      let alive = true;
      const tick = () => {
        if (!alive) return;
        x.globalCompositeOperation = 'source-over'; x.fillStyle = 'rgba(5,2,12,.2)'; x.fillRect(0, 0, W, H); x.globalCompositeOperation = 'lighter';
        for (let i = rockets.length - 1; i >= 0; i--) {
          const r = rockets[i]; r.y += r.vy; r.x += (r.tx - r.x) * .03; x.fillStyle = '#ffe9a8'; x.fillRect(r.x, r.y, 3 * dpr, 8 * dpr);
          if (r.y <= r.ty) { burst(r.x, r.y, r.big); rockets.splice(i, 1); }
        }
        for (let i = parts.length - 1; i >= 0; i--) {
          const p = parts[i]; p.x += p.vx; p.y += p.vy; p.vy += .045 * dpr; p.vx *= .985; p.vy *= .985; p.l -= .011;
          if (p.l <= 0) { parts.splice(i, 1); continue; }
          x.fillStyle = 'hsla(' + p.h + ',100%,' + (p.s ? 90 : 60) + '%,' + p.l + ')'; x.fillRect(p.x, p.y, 2.2 * dpr, 2.2 * dpr);
        }
        requestAnimationFrame(tick);
      };
      tick();
      setTimeout(() => { cv.style.opacity = 0; tt.style.opacity = 0; }, ms - 900);
      setTimeout(() => { alive = false; cv.remove(); tt.remove(); if (ac) ac.close().catch(() => {}); res(); }, ms);
    });
  }

  $('#gate__btn').addEventListener('click', async () => {
    if (started) return; started = true;
    if (C.fireworks !== false) {
      song.volume = 0; song.play().then(() => { song.pause(); song.currentTime = 0; }).catch(() => {});
      await fireworks(6500);
    }
    document.body.classList.add('go');
    $('#gate').classList.add('hide');
    if (C.autoMusic) setMusic(true);
    document.dispatchEvent(new Event('intro-go'));
  });

  afterGo(party, 16200);

  // ---- floating balloons
  const wrapper = $('#wrapper'), emojis = ['🎈', '🎈', '🎈', '💖', '🎀', '👻'];
  function spawnBalloon() {
    const b = document.createElement('div');
    b.className = 'float__balloon';
    b.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    b.style.left = Math.random() * 92 + '%';
    b.style.setProperty('--d', 9 + Math.random() * 6 + 's');
    b.addEventListener('click', (e) => {
      boom({ particleCount: 25, spread: 70, startVelocity: 22, origin: { x: e.clientX / innerWidth, y: e.clientY / innerHeight }, colors: C.colors });
      b.remove();
    });
    b.addEventListener('animationend', () => b.remove());
    wrapper.appendChild(b);
  }
  afterGo(() => { spawnBalloon(); setInterval(spawnBalloon, 1800); }, 16000);

  $('#btn__letter').addEventListener('click', () => setTimeout(party, 2600));

  // ---- cake scene: Tafu waits, Dolly walks in, cuts, feeds, emoji blast
  const overlay = $('#cake__overlay'), stage = $('#stage');
  let run = 0;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const T = (t) => (t || '').replace('{me}', C.myName).replace('{name}', C.herName);
  const pos = (el, x, y) => { el.style.left = x + '%'; el.style.top = y + '%'; };
  // positions are % of the bitmoji picture (cake, mouth, heads)
  const CAKE = [47.5, 66.5], MOUTH = [73.7, 31.6];
  function say(id, text, ms) {
    const b = $(id); b.textContent = T(text); b.classList.add('show');
    if (ms) setTimeout(() => b.classList.remove('show'), ms);
  }
  const hide = (id) => $(id).classList.remove('show');
  function caption(title, text) { if (title) $('#cake__title').textContent = T(title); $('#wish__text').textContent = ''; }
  function emojiBlast() {
    const list = ['🎉', '🎊', '🥳', '🎂', '🎈', '💖', '✨', '👻', '🎁', '🔥', '🍰', '😍'];
    const r = stage.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height * .4;
    for (let i = 0; i < 46; i++) {
      const e = document.createElement('div');
      e.textContent = list[i % list.length];
      const size = 30 + Math.random() * 40;
      e.style.cssText = 'position:fixed;z-index:80;pointer-events:none;font-size:' + size + 'px;left:' + cx + 'px;top:' + cy + 'px';
      document.body.appendChild(e);
      const ang = Math.random() * Math.PI * 2, dist = 160 + Math.random() * Math.min(innerWidth, 700) * .5;
      e.animate([
        { transform: 'translate(-50%,-50%) scale(.2) rotate(0)', opacity: 1 },
        { transform: 'translate(' + Math.cos(ang) * dist + 'px,' + (Math.sin(ang) * dist - 60) + 'px) scale(1.2) rotate(' + (Math.random() * 360 - 180) + 'deg)', opacity: 1, offset: .65 },
        { transform: 'translate(' + Math.cos(ang) * dist * 1.1 + 'px,' + (Math.sin(ang) * dist + 140) + 'px) scale(1) rotate(' + (Math.random() * 360 - 180) + 'deg)', opacity: 0 }
      ], { duration: 1900 + Math.random() * 700, delay: Math.random() * 350, easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'forwards' }).onfinish = () => e.remove();
    }
    try {
      const shapes = list.map((t) => window.confetti.shapeFromText({ text: t, scalar: 3 }));
      for (let i = 0; i < 4; i++) setTimeout(() => boom({ shapes, scalar: 3, particleCount: 14, spread: 100, startVelocity: 38,
        origin: { x: .15 + i * .23, y: .85 }, ticks: 200, gravity: .8 }), i * 300);
    } catch (e) {}
    fireworks(); party();
  }
  function bounce(el) { el.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-26px) rotate(-2deg)' }, { transform: 'translateY(0)' }, { transform: 'translateY(-14px) rotate(2deg)' }, { transform: 'translateY(0)' }], { duration: 900, iterations: 2 }); }

  new Image().src = 'Images/him_neutral.png';
  function breath() {
    for (let i = 0; i < 7; i++) {
      const d = document.createElement('div'); d.className = 'puff'; d.style.left = '27.5%'; d.style.top = '28%'; stage.appendChild(d);
      const dx = .225 * stage.clientWidth, dy = .27 * stage.clientHeight;
      d.animate([{ opacity: 0, transform: 'translate(0,0) scale(.4)' }, { opacity: .8, offset: .3 }, { opacity: 0, transform: 'translate(' + dx + 'px,' + (dy + i * 4) + 'px) scale(2.2)' }], { duration: 950, delay: i * 90, fill: 'forwards' }).onfinish = () => d.remove();
    }
  }

  async function playScene() {
    const me = ++run, ok = () => me === run; if (window.speechSynthesis) speechSynthesis.cancel();
    $('#wcard').style.display = 'none';
    const her = $('#w_her'), him = $('#w_him'), her_img = $('#c_her');
    ['#b_her', '#b_him'].forEach(hide);
    $('#s_knife').style.opacity = 0; $('#s_slice').style.opacity = 0; $('#s_cake').classList.remove('blowing', 'out', 'cut'); $('#c_him').src = 'Images/him_full.png';
    $('#selfie').style.display = 'none';
    her.getAnimations().forEach((a) => a.cancel());
    her.style.transform = 'translateX(-135%)'; her.style.opacity = 1;
    caption(C.scene.title, C.scene.intro);
    await sleep(900); if (!ok()) return;
    say('#b_him', C.scene.meSay);
    await sleep(1800); if (!ok()) return;
    // Dolly walks in
    her_img.classList.add('walking'); hide('#b_him');
    const walk = her.animate([{ transform: 'translateX(-135%)' }, { transform: 'translateX(9%)' }], { duration: 5200, easing: 'cubic-bezier(.25,.6,.35,1)', fill: 'forwards' });
    await walk.finished.catch(() => {}); if (!ok()) return;
    her_img.classList.remove('walking');
    say('#b_her', C.scene.herSay, 1800);
    await sleep(1000); if (!ok()) return;
    caption(null, C.scene.wish);
    boom({ particleCount: 40, spread: 360, startVelocity: 18, gravity: .4, scalar: .8, origin: { x: .5, y: .45 }, colors: C.colors });
    await sleep(1900); if (!ok()) return;
    caption(null, C.scene.blow);
    const cake = $('#s_cake');
    await sleep(800); if (!ok()) return;
    say('#b_her', 'Phoooonk! 💨', 1600); cake.classList.add('blowing'); breath();
    await sleep(1000); if (!ok()) return;
    cake.classList.add('out');
    boom({ particleCount: 25, spread: 70, startVelocity: 16, gravity: .5, origin: { x: .5, y: .5 }, colors: ['#ffd166', '#ffffff'], shapes: ['star'] });
    await sleep(1800); if (!ok()) return;
    // Dolly cuts with her own hand
    caption(null, C.scene.cutting);
    $('#c_him').src = 'Images/him_neutral.png'; const k = $('#s_knife'); k.style.opacity = 1;
    setTimeout(() => { if (ok()) cake.classList.add('cut'); }, 1700);
    await k.animate([{ transform: 'rotate(80deg)' }, { transform: 'rotate(58deg)', offset: .2 }, { transform: 'rotate(66deg)', offset: .35 }, { transform: 'rotate(58deg)', offset: .5 }, { transform: 'rotate(66deg)', offset: .65 }, { transform: 'rotate(58deg)', offset: .8 }, { transform: 'rotate(80deg)' }], { duration: 3200 }).finished.catch(() => {});
    k.style.opacity = 0; if (!ok()) return; $('#c_him').src = 'Images/him_full.png';
    // cut hote hi seedha birthday card + wishes
    hide('#b_her'); hide('#b_him'); emojiBlast(); $('#selfie').style.display = '';
    showCard(me);
  }
  async function showCard(me) {
    const card = $('#wcard'), box = $('#wcard__lines');
    box.innerHTML = ''; $('#wcard__title').textContent = T(C.finalTitle);
    $('#wcard__sign').textContent = ''; $('#wcard__sign').style.opacity = 0;
    document.querySelectorAll('.wcard__btns button').forEach((b) => (b.style.opacity = 0));
    card.style.display = 'flex'; card.classList.remove('in'); void card.offsetWidth; card.classList.add('in');
    for (const line of C.finalLines) {
      await sleep(1500); if (me !== run) return;
      const p = document.createElement('p'); p.className = 'wl'; p.textContent = T(line); box.appendChild(p);
      requestAnimationFrame(() => p.classList.add('show'));
      boom({ particleCount: 8, spread: 50, startVelocity: 14, gravity: .5, scalar: .8, origin: { x: .5, y: .3 }, colors: C.colors, shapes: ['star'] });
    }
    await sleep(1400); if (me !== run) return;
    const sg = $('#wcard__sign'); sg.style.whiteSpace = 'pre-line'; sg.textContent = [T(C.finalSign), '👻 Snapchat: ' + C.snapId].filter(Boolean).join('\n'); sg.style.opacity = 1;
    party();
    document.querySelectorAll('.wcard__btns button').forEach((b) => (b.style.opacity = 1));
  }
  function selfie() {
    const f = $('#flash'); f.classList.remove('go'); void f.offsetWidth; f.classList.add('go');
    bounce($('#w_her')); bounce($('#w_him'));
    emojiBlast();
    const t = $('#snaptoast'); t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 2200);
  }
  $('#btn__cake').addEventListener('click', () => { overlay.style.display = 'flex'; playScene(); });
  $('#relight').addEventListener('click', playScene);
  $('#selfie').addEventListener('click', selfie);
  $('#cake__close').addEventListener('click', () => { run++; $('#wcard').style.display = 'none'; overlay.style.display = 'none'; });
  $('#wc_close').addEventListener('click', () => { run++; $('#wcard').style.display = 'none'; overlay.style.display = 'none'; });
  $('#wc_replay').addEventListener('click', playScene);
  $('#wc_selfie').addEventListener('click', selfie);

  // ---- Snapchat style wishes chat
  const chat = $('#chat__overlay'), cbody = $('#chat__body');
  let chatRun = 0;
  function playChat() {
    const run = ++chatRun;
    cbody.innerHTML = '';
    const wishes = C.wishes.map((w) => w.replace('{name}', C.herName));
    let i = 0;
    (function next() {
      if (run !== chatRun) return;
      if (i >= wishes.length) { boom({ particleCount: 100, spread: 90, origin: { y: .7 }, colors: C.colors }); return; }
      const dots = document.createElement('div'); dots.className = 'typing'; dots.innerHTML = '<i></i><i></i><i></i>';
      cbody.appendChild(dots); cbody.scrollTop = cbody.scrollHeight;
      setTimeout(() => {
        if (run !== chatRun) return;
        dots.remove();
        const m = document.createElement('div'); m.className = 'msg';
        m.innerHTML = '<small>' + C.myName.toUpperCase() + '</small><span></span>';
        m.lastChild.textContent = wishes[i]; cbody.appendChild(m); cbody.scrollTop = cbody.scrollHeight;
        if (i === 0) boom({ particleCount: 60, spread: 70, origin: { y: .5 }, colors: C.colors });
        i++; setTimeout(next, 900);
      }, 1100);
    })();
  }
  $('#btn__snap').addEventListener('click', () => { chat.style.display = 'flex'; playChat(); });

  // ---- our video (video/our_video.mp4)
  const vo = $('#vid__overlay'), vid = $('#vid'); let musicWas = false;
  $('#btn__video').addEventListener('click', () => {
    musicWas = !song.paused; if (musicWas) setMusic(false);
    $('#vid__err').style.display = 'none'; vo.style.display = 'flex'; vid.play().catch(() => {});
  });
  vid.addEventListener('error', () => { $('#vid__err').style.display = 'block'; vid.style.display = 'none'; });
  $('#vid__close').addEventListener('click', () => { vid.pause(); vo.style.display = 'none'; if (musicWas) setMusic(true); });
  $('#chat__replay').addEventListener('click', playChat);
  $('#chat__close').addEventListener('click', () => { chatRun++; chat.style.display = 'none'; });
})();
