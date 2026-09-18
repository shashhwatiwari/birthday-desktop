/* ============================================================
   content.js — THE ONLY FILE YOU NEED TO EDIT.
   Everything on the site is generated from the object below.
   Change the words, add your photos, write your notes. Save. Done.
   ============================================================ */

const CONTENT = {
  /* ---------- 1. THE BASICS ---------- */
  partnerName: "Your Person",       // shows up all over the site
  yourName: "Me",                   // signature on the notes
  pageTitle: "happy birthday ♥",    // browser tab title

  // The day you two started. Used for the "days together" counter.
  // Format: YYYY-MM-DD
  startDate: "2023-05-14",

  /* ---------- 2. THE SONG ---------- */
  song: {
    // Paste the ID from the YouTube URL of the track.
    // e.g. youtube.com/watch?v=KtlgYxa6BMU  ->  "KtlgYxa6BMU"
    youtubeId: "KtlgYxa6BMU",
    title: "The Night We Met",
    artist: "Lord Huron",
    // Start a few seconds in if you want to skip an intro. 0 = from the top.
    startAt: 0,
  },

  /* ---------- 3. THE BOOT SCREEN ---------- */
  // Lines that type out on the retro boot screen before the desktop loads.
  bootLines: [
    "MEMORY OS v1.0 — booting…",
    "checking heart............. OK",
    "mounting /our/memories..... OK",
    "loading photographs........ OK",
    "decrypting love letters.... OK",
    "cueing: the night we met... OK",
    "",
    "1 birthday found.",
  ],

  /* ---------- 4. THE OPENING WINDOW ---------- */
  hero: {
    windowTitle: "read_me_first.txt",
    headline: "happy birthday",
    // Each string is its own paragraph.
    body: [
      "I built you a little corner of the internet.",
      "Everything here is ours — scroll down, poke around, click on things. The photos get bigger. The envelopes open.",
      "Press play on the song before you start. You know the one.",
    ],
    scrollHint: "scroll down ↓",
  },

  /* ---------- 5. THE PHOTOS ---------- */
  // Drop your image files into the /images folder, then list them here.
  // `rotate` is the tilt in degrees — keep it between -8 and 8 for a pinned look.
  // `pin` can be: "tape", "pushpin", or "clip".
  photos: [
    { src: "images/photo1.jpg", caption: "the first one",        date: "may 2023",  rotate: -4, pin: "tape" },
    { src: "images/photo2.jpg", caption: "you, laughing",        date: "aug 2023",  rotate:  3, pin: "pushpin" },
    { src: "images/photo3.jpg", caption: "that terrible diner",  date: "oct 2023",  rotate: -2, pin: "clip" },
    { src: "images/photo4.jpg", caption: "3am, no reason",       date: "jan 2024",  rotate:  5, pin: "tape" },
    { src: "images/photo5.jpg", caption: "the good trip",        date: "jun 2024",  rotate: -6, pin: "pushpin" },
    { src: "images/photo6.jpg", caption: "my favourite face",    date: "today",     rotate:  2, pin: "tape" },
  ],

  /* ---------- 6. THE LOVE NOTES ---------- */
  // Each one becomes a sealed envelope on the desktop.
  // `label` is the text under the envelope icon.
  // `body` — each string is a paragraph.
  notes: [
    {
      label: "open me first",
      title: "a letter, for your birthday",
      body: [
        "I'm not good at saying this out loud, so I typed it instead.",
        "Write the real thing here. Take your time with it — this is the one they'll read twice.",
      ],
      ps: "p.s. there are more of these. keep clicking.",
    },
    {
      label: "the day we met",
      title: "the night we met",
      body: [
        "Tell the story. The version only you two know.",
      ],
    },
    {
      label: "things i love",
      title: "an incomplete list",
      body: [
        "1. the thing you do with your hands when you're thinking",
        "2. your laugh, specifically the ugly one",
        "3. ",
        "4. ",
        "5. ",
      ],
      ps: "the list keeps going. it always does.",
    },
    {
      label: "when you're sad",
      title: "open on a bad day",
      body: [
        "Save this one for a hard day. Say the thing you'd want them to hear.",
      ],
    },
    {
      label: "a promise",
      title: "a promise",
      body: [
        "Something you mean. Keep it short.",
      ],
    },
    {
      label: "one more",
      title: "last one",
      body: [
        "Happy birthday.",
      ],
      ps: "that's all of them. go find me. ♥",
    },
  ],

  /* ---------- 7. THE ENDING ---------- */
  finale: {
    windowTitle: "goodbye.txt",
    headline: "that's the whole desktop",
    body: [
      "You've opened everything. I'd do it all again.",
    ],
    signature: "— always,",
  },
};

/* makes CONTENT visible to main.js — leave this line alone */
window.CONTENT = CONTENT;
