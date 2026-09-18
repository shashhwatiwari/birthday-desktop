/* ============================================================
   content.js — THE ONLY FILE YOU NEED TO EDIT.
   Change the words, add your photos, write your notes. Save. Done.
   ============================================================ */

const CONTENT = {
  /* ---------- 1. THE BASICS ---------- */
  partnerName: "Your Person",       // big name on the title screen
  yourName: "Me",                   // signs the letters
  pageTitle: "happy birthday ♥",    // browser tab title

  // The day you two started — shown on the signpost. Format: YYYY-MM-DD
  startDate: "2023-05-14",

  /* ---------- 2. TITLE SCREEN ---------- */
  title: {
    subtitle: "a small island, made for you",
    hint: "press start",
  },

  /* ---------- 3. THE SIGNPOST (next to where she starts) ---------- */
  sign: {
    body: [
      "welcome to the island.",
      "walk around with the arrow keys. every envelope you find is a letter from me. the frames in the little house are photos of us.",
      "read all the letters, then come find the cake.",
    ],
  },

  /* ---------- 4. THE SONG ---------- */
  song: {
    // Paste the ID from the YouTube URL of the track.
    // e.g. youtube.com/watch?v=KtlgYxa6BMU  ->  "KtlgYxa6BMU"
    youtubeId: "KtlgYxa6BMU",
    title: "The Night We Met",
    artist: "Lord Huron",
    startAt: 0,     // seconds to skip at the start
    volume: 55,     // 0–100
  },

  /* ---------- 5. THE PHOTOS ---------- */
  // Drop your images into the /images folder, then list them here.
  // Each one becomes a picture frame inside the little house.
  photos: [
    { src: "images/photo1.jpg", caption: "the first one",       date: "may 2023" },
    { src: "images/photo2.jpg", caption: "you, laughing",       date: "aug 2023" },
    { src: "images/photo3.jpg", caption: "that terrible diner", date: "oct 2023" },
    { src: "images/photo4.jpg", caption: "3am, no reason",      date: "jan 2024" },
    { src: "images/photo5.jpg", caption: "the good trip",       date: "jun 2024" },
    { src: "images/photo6.jpg", caption: "my favourite face",   date: "today" },
  ],

  /* ---------- 6. THE LETTERS ---------- */
  // Each one becomes an envelope somewhere on the island.
  notes: [
    {
      title: "a letter, for your birthday",
      body: [
        "I'm not good at saying this out loud, so I typed it instead.",
        "Write the real thing here. Take your time with it — this is the one they'll read twice.",
      ],
      ps: "p.s. there are more of these out here. keep walking.",
    },
    {
      title: "the night we met",
      body: ["Tell the story. The version only you two know."],
    },
    {
      title: "an incomplete list",
      body: [
        "things I love, in no order:",
        "the thing you do with your hands when you're thinking. your laugh, specifically the ugly one. the way you say my name when you're half asleep.",
      ],
      ps: "the list keeps going. it always does.",
    },
    {
      title: "open on a bad day",
      body: ["Save this one for a hard day. Say the thing you'd want them to hear."],
    },
    {
      title: "a promise",
      body: ["Something you mean. Keep it short."],
    },
    {
      title: "last one",
      body: ["Happy birthday. Go find the cake."],
      ps: "that's all of them ♥",
    },
  ],

  /* ---------- 7. THE ENDING (at the cake) ---------- */
  finale: {
    headline: "happy birthday",
    body: [
      "You found every letter and walked the whole island.",
      "I'd build it again tomorrow.",
    ],
    ps: "blow out the candle.",
    signature: "— always,",
  },
};

/* makes CONTENT visible to the other scripts — leave this line alone */
window.CONTENT = CONTENT;
