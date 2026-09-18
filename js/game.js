/* ============================================================
   game.js — the engine. Movement, camera, collisions, dialogs, music.
   You shouldn't need to edit this file; content lives in content.js.
   ============================================================ */
(function () {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const C = window.CONTENT || {};
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* internal resolution — everything is drawn at this size, then scaled up */
  const VIEW_W = 320, VIEW_H = 192;

  const canvas = $("#screen");
  const ctx = canvas.getContext("2d", { alpha: false });
  canvas.width = VIEW_W; canvas.height = VIEW_H;
  ctx.imageSmoothingEnabled = false;

  let world, worldCanvas, waterTiles = [];
  let running = false, tPrev = 0, tick = 0;

  const player = {
    x: 0, y: 0, dir: "down", moving: false,
    speed: 62,            // pixels per second
    frame: 0, anim: 0,
    hw: 5, hh: 4,         // half-width / half-height of the feet hitbox
  };

  const camera = { x: 0, y: 0 };

  /* ══════════════ INPUT ══════════════ */
  const keys = { up: 0, down: 0, left: 0, right: 0, action: 0 };
  const KEYMAP = {
    ArrowUp: "up", KeyW: "up",
    ArrowDown: "down", KeyS: "down",
    ArrowLeft: "left", KeyA: "left",
    ArrowRight: "right", KeyD: "right",
    Space: "action", Enter: "action", KeyE: "action",
  };

  let actionEdge = false;   // true for one frame when action is newly pressed

  addEventListener("keydown", e => {
    const k = KEYMAP[e.code];
    if (!k) return;
    e.preventDefault();
    if (k === "action" && !keys.action) actionEdge = true;
    keys[k] = 1;
  });
  addEventListener("keyup", e => {
    const k = KEYMAP[e.code];
    if (!k) return;
    e.preventDefault();
    keys[k] = 0;
  });
  addEventListener("blur", () => Object.keys(keys).forEach(k => keys[k] = 0));

  function wireTouchControls() {
    $$("[data-key]").forEach(btn => {
      const k = btn.dataset.key;
      const press = e => {
        e.preventDefault();
        if (k === "action" && !keys.action) actionEdge = true;
        keys[k] = 1; btn.classList.add("is-down");
      };
      const release = e => { e.preventDefault(); keys[k] = 0; btn.classList.remove("is-down"); };
      btn.addEventListener("touchstart", press, { passive: false });
      btn.addEventListener("touchend", release);
      btn.addEventListener("touchcancel", release);
      btn.addEventListener("mousedown", press);
      btn.addEventListener("mouseup", release);
      btn.addEventListener("mouseleave", release);
    });
  }

  /* ══════════════ WORLD SET-UP ══════════════ */
  function prerenderWorld() {
    worldCanvas = document.createElement("canvas");
    worldCanvas.width = world.w * TILE;
    worldCanvas.height = world.h * TILE;
    const wx = worldCanvas.getContext("2d");
    for (let y = 0; y < world.h; y++) {
      for (let x = 0; x < world.w; x++) {
        drawTile(wx, world.map[y][x], x, y);
        if (world.map[y][x] === T.WATER) waterTiles.push([x, y]);
      }
    }
  }

  /* ══════════════ COLLISION ══════════════ */
  function tileSolidAt(px, py) {
    const tx = Math.floor(px / TILE), ty = Math.floor(py / TILE);
    if (tx < 0 || ty < 0 || tx >= world.w || ty >= world.h) return true;
    return SOLID.has(world.map[ty][tx]);
  }

  /** the little box at an entity's feet that you actually bump into */
  function entBox(e) {
    return {
      x0: e.x + 2, x1: e.x + e.w - 2,
      y0: e.y + e.h - 7, y1: e.y + e.h - 1,
    };
  }

  function blocked(nx, ny) {
    const l = nx - player.hw, r = nx + player.hw;
    const t = ny - player.hh, b = ny + player.hh;
    if (tileSolidAt(l, t) || tileSolidAt(r, t) ||
        tileSolidAt(l, b) || tileSolidAt(r, b)) return true;

    for (const e of world.ents) {
      if (!e.solid) continue;
      const bx = entBox(e);
      if (r > bx.x0 && l < bx.x1 && b > bx.y0 && t < bx.y1) return true;
    }
    return false;
  }

  /* ══════════════ UPDATE ══════════════ */
  function update(dt) {
    const dx = (keys.right - keys.left);
    const dy = (keys.down - keys.up);

    player.moving = !!(dx || dy) && !dialogOpen();

    if (player.moving) {
      // normalise so diagonals aren't faster
      const len = Math.hypot(dx, dy) || 1;
      const step = player.speed * dt;
      const vx = (dx / len) * step, vy = (dy / len) * step;

      if (vx && !blocked(player.x + vx, player.y)) player.x += vx;
      if (vy && !blocked(player.x, player.y + vy)) player.y += vy;

      // facing: whichever axis is dominant
      if (Math.abs(dx) > Math.abs(dy)) player.dir = dx > 0 ? "right" : "left";
      else if (dy) player.dir = dy > 0 ? "down" : "up";

      player.anim += dt * 7.5;
      player.frame = 1 + (Math.floor(player.anim) % 2);
    } else {
      player.anim = 0; player.frame = 0;
    }

    // camera follows, then stops at the edges of the map
    camera.x = clamp(player.x - VIEW_W / 2, 0, world.w * TILE - VIEW_W);
    camera.y = clamp(player.y - VIEW_H / 2, 0, world.h * TILE - VIEW_H);

    updateInteraction();
  }

  /* ══════════════ INTERACTION ══════════════ */
  const INTERACTIVE = new Set(["note", "photo", "jukebox", "sign", "cake"]);
  let target = null;

  function updateInteraction() {
    // while a letter is open, swallow the action press so it can't leak
    // through and immediately re-open whatever we're standing on
    if (dialogOpen()) { target = null; setPrompt(null); actionEdge = false; return; }

    let best = null, bestD = 26;      // reach, in pixels
    for (const e of world.ents) {
      if (!INTERACTIVE.has(e.type)) continue;
      const ex = e.x + e.w / 2, ey = e.y + e.h - 4;
      const d = Math.hypot(ex - player.x, ey - player.y);
      if (d < bestD) { bestD = d; best = e; }
    }
    target = best;
    setPrompt(best);

    if (best && actionEdge) interact(best);
    actionEdge = false;
  }

  function setPrompt(e) {
    const el = $("#prompt");
    if (!e) { el.hidden = true; return; }
    el.hidden = false;
    $("#prompt-label").textContent = promptLabel(e);
  }

  function promptLabel(e) {
    switch (e.type) {
      case "note":    return opened.has(e.data.index) ? "read again" : "open the letter";
      case "photo":   return "look at the photo";
      case "jukebox": return Music.isPlaying() ? "stop the music" : "play our song";
      case "sign":    return "read the sign";
      case "cake":    return "the cake";
    }
    return "look";
  }

  function interact(e) {
    switch (e.type) {
      case "note": {
        opened.add(e.data.index);
        saveOpened();
        e.sprite = OBJ.envelopeOpen;
        updateHud();
        openDialog({
          kind: "letter",
          title: e.data.note.title || "",
          body: e.data.note.body || [],
          ps: e.data.note.ps || "",
          sign: "— " + (C.yourName || ""),
        });
        if (allOpened()) burstHearts(30);
        break;
      }
      case "photo":
        openDialog({
          kind: "photo",
          title: e.data.photo.caption || "a photo",
          sub: e.data.photo.date || "",
          src: e.data.photo.src,
        });
        break;
      case "jukebox": {
        const turningOn = Music.toggle();
        openDialog({
          kind: "letter",
          title: "the jukebox",
          body: [turningOn
            ? `now playing — ${C.song?.title || "our song"} by ${C.song?.artist || ""}.`
            : "the music stops. the island goes quiet."],
        });
        break;
      }
      case "sign":
        openDialog({ kind: "letter", title: e.data.title, body: e.data.body });
        break;
      case "cake": {
        const total = (C.notes || []).length;
        if (!allOpened()) {
          openDialog({
            kind: "letter",
            title: "not yet",
            body: [
              `there are still letters out there. ${opened.size} of ${total} opened.`,
              "find the rest, then come back here.",
            ],
          });
        } else {
          burstHearts(60);
          openDialog({
            kind: "letter",
            title: C.finale?.headline || "happy birthday",
            body: C.finale?.body || [],
            ps: C.finale?.ps || "",
            sign: (C.finale?.signature || "— always,") + " " + (C.yourName || ""),
          });
        }
        break;
      }
    }
  }

  /* ══════════════ SAVED PROGRESS ══════════════ */
  const SAVE_KEY = "bday.opened.v2";
  let opened = new Set();
  try { opened = new Set(JSON.parse(localStorage.getItem(SAVE_KEY) || "[]")); } catch (_) {}
  const saveOpened = () => {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify([...opened])); } catch (_) {}
  };
  const allOpened = () => {
    const total = (C.notes || []).length;
    return total > 0 && opened.size >= total;
  };

  function updateHud() {
    const total = (C.notes || []).length;
    $("#hud-count").textContent = `${opened.size}/${total}`;
    $("#hud-bar").style.width = total ? (opened.size / total * 100) + "%" : "0%";
  }

  /* ══════════════ DIALOG ══════════════ */
  let typing = null, typingFull = "";

  const dialogOpen = () => !$("#dialog").hidden;

  function openDialog(d) {
    const box = $("#dialog");
    $("#dlg-title").textContent = d.title || "";
    const bodyEl = $("#dlg-body");
    const photoEl = $("#dlg-photo");

    if (d.kind === "photo") {
      bodyEl.hidden = true;
      photoEl.hidden = false;
      const img = $("#dlg-img");
      const miss = $("#dlg-missing");
      img.hidden = false; miss.hidden = true;
      img.onerror = () => {
        img.hidden = true; miss.hidden = false;
        miss.textContent = `${basename(d.src)} isn't in /images yet`;
      };
      img.src = d.src; img.alt = d.title;
      $("#dlg-sub").textContent = d.sub || "";
      $("#dlg-ps").textContent = "";
      $("#dlg-sign").textContent = "";
    } else {
      photoEl.hidden = true;
      bodyEl.hidden = false;
      $("#dlg-ps").textContent = d.ps || "";
      $("#dlg-sign").textContent = d.sign || "";
      typeOut(bodyEl, (d.body || []).join("\n\n"));
    }

    box.hidden = false;
    $("#prompt").hidden = true;
  }

  function typeOut(el, text) {
    clearInterval(typing);
    typingFull = text;
    if (reduceMotion) { el.textContent = text; typing = null; return; }
    el.textContent = "";
    let i = 0;
    typing = setInterval(() => {
      el.textContent = text.slice(0, ++i);
      if (i >= text.length) { clearInterval(typing); typing = null; }
    }, 11);
  }

  function closeDialog() {
    // first press finishes the typing, second press actually closes
    if (typing) {
      clearInterval(typing); typing = null;
      $("#dlg-body").textContent = typingFull;
      actionEdge = false;
      return;
    }
    $("#dialog").hidden = true;
    keys.action = 0;
    actionEdge = false;   // the press that closed it must not re-open it
  }

  function wireDialog() {
    $("#dlg-close").addEventListener("click", closeDialog);
    $("#dialog").addEventListener("click", e => {
      if (e.target.id === "dialog") closeDialog();
    });
    addEventListener("keydown", e => {
      if (!dialogOpen()) return;
      if (["Space", "Enter", "Escape", "KeyE"].includes(e.code)) {
        e.preventDefault(); closeDialog();
      }
    });
  }

  /* ══════════════ RENDER ══════════════ */
  function render() {
    const cx = Math.round(camera.x), cy = Math.round(camera.y);

    ctx.drawImage(worldCanvas, cx, cy, VIEW_W, VIEW_H, 0, 0, VIEW_W, VIEW_H);

    drawWaterShimmer(cx, cy);

    // everything that has a position, sorted so nearer things overlap farther ones
    const list = [];
    for (const e of world.ents) {
      if (e.x + e.w < cx - 8 || e.x > cx + VIEW_W + 8) continue;
      if (e.y + e.h < cy - 8 || e.y > cy + VIEW_H + 24) continue;
      list.push(e);
    }
    list.push(player);
    list.sort((a, b) => baseline(a) - baseline(b));

    for (const item of list) {
      if (item === player) drawPlayer(cx, cy);
      else drawEntity(item, cx, cy);
    }

    if (target) drawMarker(target, cx, cy);
  }

  const baseline = o => (o === player ? o.y : o.y + o.h);

  function drawEntity(e, cx, cy) {
    const bob = e.bob && !reduceMotion ? Math.round(Math.sin(tick / 22 + e.x) * 1.5) : 0;
    const img = bake(e.sprite, spriteKey(e));
    ctx.drawImage(img, Math.round(e.x - cx), Math.round(e.y - cy + bob));
  }

  /* cache key has to change when a sealed envelope becomes an opened one */
  function spriteKey(e) {
    return e.type + ":" + e.sprite.w + "x" + e.sprite.h + ":" + e.sprite.rows[1];
  }

  function drawPlayer(cx, cy) {
    const set = player.dir === "up" ? GIRL.up
              : player.dir === "down" ? GIRL.down
              : GIRL.side;
    const spr = set[player.frame] || set[0];
    const flip = player.dir === "left";
    const img = bake(spr, "girl:" + player.dir.replace("left", "side").replace("right", "side") + player.frame, flip);
    // a 1px bounce on the middle walk frame, so she has some spring
    const hop = player.frame === 1 && !reduceMotion ? -1 : 0;
    ctx.drawImage(img,
      Math.round(player.x - cx - spr.w / 2),
      Math.round(player.y - cy - spr.h + player.hh + hop));
  }

  function drawMarker(e, cx, cy) {
    if (reduceMotion) return;
    const bob = Math.round(Math.sin(tick / 9) * 1.5);
    const x = Math.round(e.x + e.w / 2 - cx - 3);
    const y = Math.round(e.y - cy - 8 + bob);
    ctx.fillStyle = "#3b2b45";
    ctx.fillRect(x - 1, y - 1, 8, 6);
    ctx.fillStyle = "#ffd7a8";
    ctx.fillRect(x, y, 6, 2);
    ctx.fillRect(x + 1, y + 2, 4, 1);
    ctx.fillRect(x + 2, y + 3, 2, 1);
  }

  function drawWaterShimmer(cx, cy) {
    if (reduceMotion) return;
    ctx.fillStyle = "#cfeeff";
    for (const [tx, ty] of waterTiles) {
      const px = tx * TILE - cx, py = ty * TILE - cy;
      if (px < -TILE || py < -TILE || px > VIEW_W || py > VIEW_H) continue;
      const phase = Math.sin(tick / 30 + tx * 0.7 + ty * 1.3);
      if (phase > 0.72) ctx.fillRect(px + 3 + ((phase * 6) | 0), py + 6, 4, 1);
      if (phase < -0.8) ctx.fillRect(px + 9, py + 11, 3, 1);
    }
  }

  /* ══════════════ MAIN LOOP ══════════════ */
  function loop(t) {
    if (!running) return;
    const dt = Math.min(0.05, (t - tPrev) / 1000 || 0);
    tPrev = t; tick++;
    update(dt);
    render();
    requestAnimationFrame(loop);
  }

  /* ══════════════ SCALING ══════════════ */
  function fit() {
    const wrap = $("#stage");
    const cs = getComputedStyle(wrap);
    const availW = wrap.clientWidth  - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    const availH = wrap.clientHeight - parseFloat(cs.paddingTop)  - parseFloat(cs.paddingBottom);

    const raw = Math.min(availW / VIEW_W, availH / VIEW_H);
    const stepped = Math.floor(raw * 2) / 2;

    /* Half-integer steps keep the pixel grid even, which matters on a big
       screen. On a phone there's no room to throw away, so fill the space
       exactly — slightly uneven pixels beat a postage-stamp-sized island. */
    const scale = Math.max(1, stepped >= 1.5 ? stepped : raw);

    canvas.style.width = Math.round(VIEW_W * scale) + "px";
    canvas.style.height = Math.round(VIEW_H * scale) + "px";
  }

  /* ══════════════ HEARTS ══════════════ */
  function burstHearts(n) {
    if (reduceMotion) return;
    const layer = $("#hearts");
    for (let i = 0; i < n; i++) {
      setTimeout(() => {
        const s = document.createElement("span");
        s.className = "heart";
        s.textContent = ["♥", "♡"][i % 2];
        s.style.left = (Math.random() * 96) + "vw";
        s.style.animationDuration = (2.8 + Math.random() * 2.2) + "s";
        s.style.fontSize = (10 + Math.random() * 16) + "px";
        layer.appendChild(s);
        setTimeout(() => s.remove(), 5200);
      }, i * 45);
    }
  }

  /* ══════════════ MUSIC ══════════════ */
  const Music = (function () {
    const song = C.song || {};
    let yt = null, ready = false, wantPlay = false, playing = false;

    function init() {
      // written twice so the scroll can loop seamlessly at -50%
      const label = `${song.title || "our song"} · ${song.artist || ""}`;
      $("#hud-track").textContent = `${label}   ♪   ${label}   ♪   `;
      if (!song.youtubeId) return;

      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);

      window.onYouTubeIframeAPIReady = () => {
        yt = new YT.Player("yt-player", {
          height: "1", width: "1", videoId: song.youtubeId,
          playerVars: {
            autoplay: 0, controls: 0, disablekb: 1, modestbranding: 1,
            playsinline: 1, rel: 0, start: song.startAt || 0,
            loop: 1, playlist: song.youtubeId,
          },
          events: {
            onReady: () => {
              ready = true;
              yt.setVolume(song.volume ?? 55);
              if (wantPlay) yt.playVideo();
            },
            onStateChange: e => {
              if (e.data === YT.PlayerState.PLAYING) setState(true);
              else if (e.data === YT.PlayerState.ENDED) { yt.seekTo(song.startAt || 0); yt.playVideo(); }
              else setState(false);
            },
          },
        });
      };
    }

    function setState(on) {
      playing = on;
      $("#hud-music").classList.toggle("is-playing", on);
      $("#hud-note").textContent = on ? "♪" : "·";
    }

    return {
      init,
      isPlaying: () => playing,
      play() { wantPlay = true; if (ready) yt.playVideo(); },
      /* returns the state we're heading into — YouTube reports the real
         change asynchronously, so callers can't just read isPlaying() after */
      toggle() {
        if (!ready) { wantPlay = !wantPlay; return wantPlay; }
        if (playing) { yt.pauseVideo(); return false; }
        yt.playVideo(); return true;
      },
    };
  })();

  /* ══════════════ TITLE SCREEN ══════════════ */
  function wireTitle() {
    $("#title-name").textContent = C.partnerName || "you";
    $("#title-sub").textContent = C.title?.subtitle || "a small island, made for you";
    $("#title-hint").textContent = C.title?.hint || "press start";

    const start = () => {
      $("#title").classList.add("is-gone");
      setTimeout(() => { $("#title").hidden = true; }, 600);
      document.body.classList.add("is-playing");
      Music.play();
      if (!running) { running = true; tPrev = performance.now(); requestAnimationFrame(loop); }
      fit();
    };

    $("#start-btn").addEventListener("click", start);
    addEventListener("keydown", function once(e) {
      if ($("#title").hidden) return;
      if (["Space", "Enter"].includes(e.code)) { e.preventDefault(); start(); removeEventListener("keydown", once); }
    });
  }

  /* ══════════════ helpers ══════════════ */
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const basename = p => String(p || "").split("/").pop();

  /* ══════════════ GO ══════════════ */
  document.addEventListener("DOMContentLoaded", () => {
    document.title = C.pageTitle || "happy birthday";

    world = buildWorld(C);
    player.x = world.spawn.x;
    player.y = world.spawn.y;

    // re-open any envelopes that were already read
    world.ents.forEach(e => {
      if (e.type === "note" && opened.has(e.data.index)) e.sprite = OBJ.envelopeOpen;
    });

    prerenderWorld();
    wireTouchControls();
    wireDialog();
    wireTitle();
    updateHud();
    Music.init();

    fit();
    addEventListener("resize", fit);

    render();   // paint one frame behind the title screen
  });
})();
