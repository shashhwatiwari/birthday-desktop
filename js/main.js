/* ============================================================
   main.js — builds the whole desktop from CONTENT (js/content.js).
   You shouldn't need to edit this file.
   ============================================================ */
(function () {
  "use strict";

  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const C = window.CONTENT || {};

  /* ══════════════ 1. BOOT SCREEN ══════════════ */
  function runBoot() {
    const boot    = $("#boot");
    const log     = $("#boot-log");
    const btn     = $("#boot-btn");
    const lines   = C.bootLines || ["booting…"];

    const finish = () => {
      log.classList.add("is-done");
      btn.hidden = false;
    };

    if (reduceMotion) {
      log.textContent = lines.join("\n");
      finish();
    } else {
      let li = 0, ci = 0, out = "";
      (function type() {
        if (li >= lines.length) return finish();
        const line = lines[li];
        if (ci < line.length) {
          out += line[ci++];
          log.textContent = out;
          setTimeout(type, 16 + Math.random() * 22);
        } else {
          out += "\n"; li++; ci = 0;
          log.textContent = out;
          setTimeout(type, 180);
        }
      })();
    }

    btn.addEventListener("click", () => {
      boot.classList.add("is-gone");
      document.body.classList.remove("is-booting");
      document.body.classList.add("is-ready");
      $("#player").hidden = false;
      // The click is the user gesture browsers require before audio may start.
      Music.play();
      setTimeout(() => boot.remove(), 900);
    });
  }

  /* ══════════════ 2. TEXT + MENU BAR ══════════════ */
  function fillText() {
    document.title = C.pageTitle || "happy birthday";

    $("#menubar-title").textContent = (C.partnerName || "you") + "'s birthday";
    $("#hero-wintitle").textContent = C.hero?.windowTitle || "read_me.txt";
    $("#hero-headline").textContent = C.hero?.headline || "happy birthday";
    $("#hero-name").textContent     = C.partnerName || "";
    $("#hero-hint").textContent     = C.hero?.scrollHint || "scroll down ↓";
    paragraphs($("#hero-text"), C.hero?.body);

    $("#finale-wintitle").textContent = C.finale?.windowTitle || "goodbye.txt";
    $("#finale-headline").textContent = C.finale?.headline || "";
    paragraphs($("#finale-text"), C.finale?.body);
    $("#finale-sigline").textContent  = C.finale?.signature || "— always,";
    $("#finale-name").textContent     = C.yourName || "";
    $("#footer-text").textContent     = "made by hand, for " + (C.partnerName || "you") + " ♥";

    // clock
    const clock = $("#menubar-clock");
    const tick = () => {
      const d = new Date();
      let h = d.getHours(), m = String(d.getMinutes()).padStart(2, "0");
      const ap = h >= 12 ? "PM" : "AM";
      h = h % 12 || 12;
      clock.textContent = `${h}:${m} ${ap}`;
    };
    tick(); setInterval(tick, 10000);
  }

  function paragraphs(el, arr) {
    if (!el) return;
    el.innerHTML = "";
    (arr || []).forEach(t => {
      const p = document.createElement("p");
      p.textContent = t;
      el.appendChild(p);
    });
  }

  /* ══════════════ 3. DAYS TOGETHER ══════════════ */
  function daysTogether() {
    const start = new Date(C.startDate || Date.now());
    const days  = Math.max(0, Math.floor((Date.now() - start.getTime()) / 86400000));
    $("#menubar-days").textContent = days.toLocaleString() + " days";
    $("#counter-sub").textContent  = "…and counting.";

    const numEl = $("#counter-num");
    const render = v => numEl.textContent = String(Math.floor(v)).padStart(4, "0");
    render(days);

    // count up when it scrolls into view
    if (reduceMotion) return;
    let done = false;
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting || done) return;
        done = true;
        const t0 = performance.now(), dur = 1600;
        (function step(now) {
          const p = Math.min(1, (now - t0) / dur);
          render(days * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(step);
        })(t0);
      });
    }, { threshold: 0.5 });
    io.observe($("#sec-counter"));
  }

  /* ══════════════ 4. PHOTOS ══════════════ */
  function buildPhotos() {
    const board = $("#corkboard");
    (C.photos || []).forEach((p, i) => {
      const btn = document.createElement("button");
      btn.className = "polaroid";
      btn.type = "button";
      btn.style.transform = `rotate(${p.rotate || 0}deg)`;
      btn.setAttribute("data-reveal", "");
      btn.style.transitionDelay = `${Math.min(i * 70, 420)}ms`;

      btn.innerHTML = `
        <span class="pin pin--${p.pin || "tape"}"></span>
        <span class="polaroid__frame">
          <img alt="${escapeAttr(p.caption || "a photo of us")}" loading="lazy" />
          <span class="polaroid__ph">drop<br />${escapeAttr(basename(p.src))}<br />in /images</span>
        </span>
        <span class="polaroid__cap">${escapeHtml(p.caption || "")}
          <span class="polaroid__date">${escapeHtml(p.date || "")}</span>
        </span>`;

      const img   = $("img", btn);
      const frame = $(".polaroid__frame", btn);
      img.addEventListener("error", () => frame.classList.add("is-empty"));
      img.src = p.src;

      btn.addEventListener("click", () => openPhoto(p, frame.classList.contains("is-empty")));
      board.appendChild(btn);
    });
  }

  function openPhoto(p, isEmpty) {
    if (isEmpty) return;
    $("#photo-img").src = p.src;
    $("#photo-img").alt = p.caption || "";
    $("#photo-title").textContent = basename(p.src);
    $("#photo-cap").innerHTML =
      escapeHtml(p.caption || "") +
      (p.date ? `<span class="polaroid__date">${escapeHtml(p.date)}</span>` : "");
    openOverlay("photo-overlay");
  }

  /* ══════════════ 5. ENVELOPES ══════════════ */
  const OPENED_KEY = "bday.opened.v1";
  let opened = new Set();
  try { opened = new Set(JSON.parse(localStorage.getItem(OPENED_KEY) || "[]")); } catch (_) {}

  function buildNotes() {
    const wrap  = $("#envelopes");
    const notes = C.notes || [];

    notes.forEach((n, i) => {
      const btn = document.createElement("button");
      btn.className = "envelope" + (opened.has(i) ? " is-open" : "");
      btn.type = "button";
      btn.setAttribute("data-reveal", "");
      btn.style.transitionDelay = `${Math.min(i * 70, 420)}ms`;
      btn.innerHTML = `
        <span class="envelope__icon">
          <span class="envelope__paper"></span>
          <span class="envelope__seal">♥</span>
        </span>
        <span class="envelope__label">${escapeHtml(n.label || "note " + (i + 1))}
          <span class="envelope__tick">✓</span>
        </span>`;

      btn.addEventListener("click", () => {
        btn.classList.add("is-open");
        opened.add(i);
        try { localStorage.setItem(OPENED_KEY, JSON.stringify([...opened])); } catch (_) {}
        const wasLast = updateProgress();
        setTimeout(() => openNote(n), reduceMotion ? 0 : 420);
        if (wasLast) document.dispatchEvent(new CustomEvent("all-notes-open"));
      });

      wrap.appendChild(btn);
    });

    updateProgress();
  }

  function updateProgress() {
    const total = (C.notes || []).length;
    const el = $("#notes-progress");
    el.textContent = `${opened.size} of ${total} opened`;
    $(".section__sub", $("#sec-notes")).firstChild.textContent =
      `${total} sealed envelope${total === 1 ? "" : "s"}. `;
    const allOpen = total > 0 && opened.size === total;
    if (allOpen) el.textContent += " — all of them ♥";
    return allOpen;
  }

  function openNote(n) {
    $("#note-wintitle").textContent = slug(n.label || "letter") + ".txt";
    $("#note-title").textContent    = n.title || "";
    paragraphs($("#note-body"), n.body);
    $("#note-ps").textContent  = n.ps || "";
    $("#note-sig").textContent = "— " + (C.yourName || "");
    openOverlay("note-overlay");
  }

  /* ══════════════ 6. OVERLAYS ══════════════ */
  function openOverlay(id) {
    $("#" + id).hidden = false;
    document.body.classList.add("is-locked");
    const close = $(`[data-close="${id}"]`);
    if (close) close.focus();
  }
  function closeOverlay(el) {
    el.hidden = true;
    document.body.classList.remove("is-locked");
    if (el.id === "photo-overlay") $("#photo-img").src = "";
  }
  function wireOverlays() {
    $$(".overlay").forEach(ov => {
      ov.addEventListener("click", e => { if (e.target === ov) closeOverlay(ov); });
    });
    $$("[data-close]").forEach(b => {
      b.addEventListener("click", () => closeOverlay($("#" + b.dataset.close)));
    });
    document.addEventListener("keydown", e => {
      if (e.key !== "Escape") return;
      $$(".overlay").forEach(ov => { if (!ov.hidden) closeOverlay(ov); });
    });
  }

  /* ══════════════ 7. MUSIC (hidden YouTube player) ══════════════ */
  const Music = (function () {
    let yt = null, ready = false, wantPlay = false, timer = null;
    const song = C.song || {};
    const el = {
      root:    () => $("#player"),
      play:    () => $("#player-play"),
      status:  () => $("#player-status"),
      time:    () => $("#player-time"),
      viz:     () => $("#player-viz"),
    };

    function initAPI() {
      $("#player-track").textContent =
        `${song.title || "our song"} — ${song.artist || ""}  ✦  ${song.title || ""} — ${song.artist || ""}  ✦  `;

      if (!song.youtubeId) { el.status().textContent = "no track set"; return; }

      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);

      window.onYouTubeIframeAPIReady = function () {
        yt = new YT.Player("yt-player", {
          height: "1", width: "1",
          videoId: song.youtubeId,
          playerVars: {
            autoplay: 0, controls: 0, disablekb: 1, modestbranding: 1,
            playsinline: 1, rel: 0, start: song.startAt || 0,
            loop: 1, playlist: song.youtubeId,   // loop a single video
          },
          events: {
            onReady: () => {
              ready = true;
              yt.setVolume(Number($("#player-vol").value));
              if (wantPlay) yt.playVideo();
            },
            onStateChange: e => {
              if (e.data === YT.PlayerState.PLAYING)      setPlaying(true);
              else if (e.data === YT.PlayerState.ENDED)   { yt.seekTo(song.startAt || 0); yt.playVideo(); }
              else                                        setPlaying(false);
            },
            onError: () => { el.status().textContent = "track unavailable"; },
          },
        });
      };
    }

    function setPlaying(on) {
      el.root().classList.toggle("is-playing", on);
      el.play().textContent = on ? "❚❚" : "▶";
      el.status().textContent = on ? "playing" : "paused";
      if (on) startViz(); else stopViz();
    }

    /* Decorative bars — YouTube audio can't be read cross-origin, so these
       are animated, not a real spectrum. */
    let vizTimer = null;
    function buildViz() {
      const v = el.viz();
      for (let i = 0; i < 22; i++) v.appendChild(document.createElement("i"));
    }
    function startViz() {
      if (reduceMotion || vizTimer) return;
      const bars = $$("i", el.viz());
      vizTimer = setInterval(() => {
        bars.forEach(b => b.style.height = (12 + Math.random() * 88) + "%");
      }, 130);
    }
    function stopViz() {
      clearInterval(vizTimer); vizTimer = null;
      $$("i", el.viz()).forEach(b => b.style.height = "12%");
    }

    function fmt(s) {
      s = Math.max(0, Math.floor(s || 0));
      return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
    }

    function wire() {
      buildViz();
      el.play().addEventListener("click", () => {
        if (!ready) { wantPlay = true; return; }
        const st = yt.getPlayerState();
        if (st === YT.PlayerState.PLAYING) yt.pauseVideo(); else yt.playVideo();
      });
      $("#player-restart").addEventListener("click", () => {
        if (!ready) return;
        yt.seekTo(song.startAt || 0); yt.playVideo();
      });
      $("#player-vol").addEventListener("input", e => { if (ready) yt.setVolume(Number(e.target.value)); });
      $("#player-min").addEventListener("click", () => el.root().classList.toggle("is-min"));

      timer = setInterval(() => {
        if (ready && yt.getCurrentTime) el.time().textContent = fmt(yt.getCurrentTime());
      }, 500);

      makeDraggable(el.root(), $("#player-drag"));
    }

    return {
      init() { initAPI(); wire(); },
      play() { wantPlay = true; if (ready) yt.playVideo(); },
    };
  })();

  /* ══════════════ 8. DRAGGABLE WINDOW ══════════════ */
  function makeDraggable(win, handle) {
    let sx = 0, sy = 0, ox = 0, oy = 0, dragging = false;

    const down = e => {
      if (e.target.closest("button")) return;
      const pt = e.touches ? e.touches[0] : e;
      const r = win.getBoundingClientRect();
      // switch from bottom/right anchoring to absolute top/left
      win.style.left = r.left + "px";
      win.style.top  = r.top + "px";
      win.style.bottom = "auto";
      win.style.right  = "auto";
      win.style.width  = r.width + "px";
      sx = pt.clientX; sy = pt.clientY; ox = r.left; oy = r.top;
      dragging = true;
      e.preventDefault();
    };

    const move = e => {
      if (!dragging) return;
      const pt = e.touches ? e.touches[0] : e;
      const w = win.offsetWidth, h = win.offsetHeight;
      const x = clamp(ox + pt.clientX - sx, 4, window.innerWidth  - w - 4);
      const y = clamp(oy + pt.clientY - sy, 34, window.innerHeight - h - 4);
      win.style.left = x + "px";
      win.style.top  = y + "px";
    };

    const up = () => { dragging = false; };

    handle.addEventListener("mousedown", down);
    handle.addEventListener("touchstart", down, { passive: false });
    window.addEventListener("mousemove", move);
    window.addEventListener("touchmove", move, { passive: false });
    window.addEventListener("mouseup", up);
    window.addEventListener("touchend", up);
  }

  /* ══════════════ 9. SCROLL REVEALS ══════════════ */
  function wireReveals() {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        e.target.classList.add("is-in");
        obs.unobserve(e.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    $$("[data-reveal]").forEach(el => io.observe(el));
  }

  /* ══════════════ 10. HEARTS ══════════════ */
  function wireHearts() {
    const glyphs = ["♥", "💖", "💗", "💘", "🤍", "♡"];
    const burst = (n = 26) => {
      for (let i = 0; i < n; i++) {
        setTimeout(() => {
          const h = document.createElement("span");
          h.className = "heart-float";
          h.textContent = glyphs[(Math.random() * glyphs.length) | 0];
          h.style.left = (Math.random() * 96) + "vw";
          h.style.bottom = "-40px";
          h.style.fontSize = (18 + Math.random() * 26) + "px";
          h.style.animationDuration = (3.2 + Math.random() * 2.4) + "s";
          document.body.appendChild(h);
          setTimeout(() => h.remove(), 6000);
        }, i * 55);
      }
    };
    $("#hearts-btn").addEventListener("click", () => burst());

    // a quiet burst when the last envelope is opened
    document.addEventListener("all-notes-open", () => burst(40));
  }

  /* ══════════════ helpers ══════════════ */
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const basename = p => String(p || "").split("/").pop();
  const slug = s => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
  const escapeHtml = s => String(s ?? "").replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const escapeAttr = escapeHtml;

  /* ══════════════ GO ══════════════ */
  document.addEventListener("DOMContentLoaded", () => {
    fillText();
    buildPhotos();
    buildNotes();
    daysTogether();
    wireOverlays();
    wireReveals();
    wireHearts();
    Music.init();
    runBoot();
  });
})();
