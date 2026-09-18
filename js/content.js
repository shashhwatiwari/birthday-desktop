/* ============================================================
   content.js — THE ONLY FILE YOU NEED TO EDIT.
   Change the words, swap the photos, rewrite the letters. Save. Done.
   ============================================================ */

const CONTENT = {
  /* ---------- 1. THE BASICS ---------- */
  partnerName: "Buns",              // big name on the title screen
  yourName: "Shashwat",             // signs the letters
  pageTitle: "happy birthday ♥",    // browser tab title

  // The day you two started — adds a "N days together" line to the signpost.
  // Left blank on purpose: fill it in (YYYY-MM-DD) and the line appears.
  startDate: "",

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
  // These become picture frames inside the little house.
  // Captions are my guesses from the photos — rewrite them in your own words.
  photos: [
    { src: "images/photo1.jpg", caption: "us",                        date: "" },
    { src: "images/photo2.jpg", caption: "walking back at golden hour", date: "" },
    { src: "images/photo3.jpg", caption: "birthday girl",             date: "" },
    { src: "images/photo4.jpg", caption: "you, laughing",             date: "" },
    { src: "images/photo5.jpg", caption: "caught you mid-smile",      date: "" },
    { src: "images/photo6.jpg", caption: "the ball night",            date: "" },
  ],

  /* ---------- 6. THE LETTERS ---------- */
  // The first one sits closest to where she starts, so she'll find it first.
  notes: [
    {
      title: "a letter, for your birthday",
      body: [
        "Hi Buns! The website may be AI generated but my feelings behind are surely real.",
        "I hope you have the best birthday, I'm sorry for not being around for the last few. I miss you dearly. Love you",
      ],
      ps: "p.s. there are more of these out here. keep walking.",
    },
    {
      title: "the night we met",
      body: [
        "I know we started talking online but looking back at it i think a lot of the moments we have shared could be scenes from a show, like the dancing at stables, the goli goli on SARC terrace, the ball night.",
        "We've had our little main character moments all throughout and im glad we did, gives me a lot of memories to cherish",
      ],
    },
    {
      title: "things i love",
      body: [
        "You imitating me for no reason at times like a kid almost, kinda funny and also good because i can call you stupid",
        "You being there for every little thing and caring about it as much as i do, if not more",
        "Those weird faces and sounds you make (i like them if im in a good enough mood though fair warning dont just start doing more of that)",
      ],
    },
    {
      title: "open on a bad day",
      body: [
        "youre brave and capable, youve gone through so much, never panic, never fret, youve helped me through some of my worst days.",
        "you say it yourself, you can learn and get past everything, never hesitate to ask for help either, we are all here and we all love you, youre more than enough and never alone",
      ],
    },
    {
      title: "something i mean",
      body: [
        "Youre the most valuable person that has ever come to my life, despite my actions conveying otherwise at times.",
        "youre my best friend and beyond, i love you, sorry about everything and also a big thank you for everything",
      ],
      ps: "that's all of them ♥ go find the cake.",
    },
  ],

  /* ---------- 7. THE ENDING (at the cake) ---------- */
  // These are my words, not yours — swap them for something you'd say.
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
