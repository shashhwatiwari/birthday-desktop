/* ============================================================
   art.js — all the pixel art.
   Sprites are written as text. Each character is one pixel,
   looked up in PAL below. "." means transparent.
   Rows are padded automatically, so a short row won't break things.
   ============================================================ */

const PAL = {
  ".": null,
  K: "#3b2b45",  // hard outline
  k: "#6b5278",  // soft outline
  w: "#fff9fb",  // white
  c: "#ffeedd",  // cream
  s: "#ffd9b8",  // skin
  S: "#e8b48f",  // skin shadow
  h: "#f0a45c",  // hair
  H: "#c9762f",  // hair shadow
  p: "#ffb3c8",  // pastel pink
  P: "#e8759a",  // deep pink
  o: "#ffd7a8",  // pale orange
  O: "#f79a48",  // orange
  Q: "#d97a2b",  // deep orange
  b: "#a8dbf2",  // pastel blue
  B: "#5aa9d6",  // deep blue
  V: "#3d7fa6",  // navy blue
  g: "#8fd18a",  // grass green
  G: "#5fa85c",  // deep green
  j: "#b9e6a8",  // light green
  n: "#9c6b42",  // wood
  N: "#6b4527",  // dark wood
  y: "#ffe9a8",  // yellow
  r: "#ff8fa8",  // rose
  R: "#c94f73",  // deep rose
  z: "#d8cfe0",  // grey-lilac
  Z: "#9a8faa",  // dark grey-lilac
};

/* ---------- sprite compiler ---------- */
const SPRITE_CACHE = new Map();

function makeSprite(rows) {
  const w = Math.max(...rows.map(r => r.length));
  return { rows: rows.map(r => r.padEnd(w, ".")), w, h: rows.length };
}

/** Rasterise a sprite to an offscreen canvas once, then reuse it. */
function bake(sprite, key, flip = false) {
  const ck = key + (flip ? "|f" : "");
  if (SPRITE_CACHE.has(ck)) return SPRITE_CACHE.get(ck);

  const cv = document.createElement("canvas");
  cv.width = sprite.w; cv.height = sprite.h;
  const cx = cv.getContext("2d");

  for (let y = 0; y < sprite.h; y++) {
    const row = sprite.rows[y];
    for (let x = 0; x < sprite.w; x++) {
      const col = PAL[row[x]];
      if (!col) continue;
      cx.fillStyle = col;
      cx.fillRect(flip ? sprite.w - 1 - x : x, y, 1, 1);
    }
  }
  SPRITE_CACHE.set(ck, cv);
  return cv;
}

/* ============================================================
   THE GIRL — 14 x 16, three directions, three frames each.
   side faces right; walking left just mirrors it.
   ============================================================ */

/* ============================================================
   THE GIRL — 16 x 20. Head, body, arms, legs, shoes.
   Three directions; "side" faces right and is mirrored for left.
   Frame 0 is standing, frames 1 and 2 are the two walking steps.
   ============================================================ */

/* head is identical across the three down/side frames, so it's shared */
const HEAD_DOWN = [
  "......KKKK......",
  "....KKhhhhKK....",
  "..KKhhhhhhhhKK..",
  ".KhhhhhhhhhhhhK.",
  ".KhhhssssssshhK.",
  ".KhhssssssssshK.",
  ".KhhsKKsssKKshK.",
  ".KhhsKKsssKKshK.",
  ".KhhsssssssssHK.",
  ".KhhsssPPssssHK.",
  "..KhhhssssshhK..",
  "...KKhhhhhhKK...",
];

const HEAD_UP = [
  "......KKKK......",
  "....KKhhhhKK....",
  "..KKhhhhhhhhKK..",
  ".KhhhhhhhhhhhhK.",
  ".KhhhhhhhhhhhhK.",
  ".KhhhhhHHhhhhhK.",
  ".KhhhhhHHhhhhhK.",
  ".KhhhhhHHhhhhhK.",
  ".KhhhhHHHHhhhhK.",
  ".KhhhhhhhhhhhhK.",
  "..KhhhhhhhhhhK..",
  "...KKhhhhhhKK...",
];

const HEAD_SIDE = [
  "......KKKK......",
  "....KKhhhhKK....",
  "..KKhhhhhhhhKK..",
  ".KhhhhhhhhhhhhK.",
  ".KhhhhhhssssshK.",
  ".KhhhhhssssssK..",
  ".KhhhhhsKKsssK..",
  ".KhhhhhsKKsssK..",
  ".KhhhhhssssssK..",
  ".KhhhhhsssPPsK..",
  "..KhhhhhsssssK..",
  "...KKhhhhhhhKK..",
];

/* body rows 12-17; legs and shoes are rows 18-19 and change per frame */
const BODY_DOWN = [
  "....KKppppKK....",
  ".KsKKppppppKKsK.",
  ".KsKpwwwwwwpKsK.",
  ".KsKppppppppKsK.",
  ".KKpppppppppppK.",
  ".KppppppppppppK.",
];

const BODY_SIDE = [
  "....KKppppKK....",
  "..KKppppppppKK..",
  "..KppwwwwwwppKs.",
  "..KppppppppppKs.",
  ".KKppppppppppKK.",
  ".KppppppppppppK.",
];

/* legs + shoes, rows 18-21: [standing, step A, step B] */
const LEGS_DOWN = [
  ["...KKssKKssKK...", "...KKssKKssKK...", "...KBBBKKBBBK...", "...KBBBKKBBBK..."],
  ["...KKssKKssKK...", "...KKssKKssKK...", "..KBBBK.KBBBK...", "..KBBBK.KBBBK..."],
  ["...KKssKKssKK...", "...KKssKKssKK...", "...KBBBK.KBBBK..", "...KBBBK.KBBBK.."],
];

const LEGS_SIDE = [
  ["....KKssssKK....", "....KKssssKK....", "....KBBBBBBK....", "....KBBBBBBK...."],
  ["...KKssssKK.....", "...KKssssKK.....", "..KBBBBBBK......", "..KBBBBBBK......"],
  [".....KKssssKK...", ".....KKssssKK...", "......KBBBBBBK..", "......KBBBBBBK.."],
];

const girlFrame = (head, body, legs) => makeSprite([...head, ...body, ...legs]);

const GIRL = {
  down: LEGS_DOWN.map(l => girlFrame(HEAD_DOWN, BODY_DOWN, l)),
  up:   LEGS_DOWN.map(l => girlFrame(HEAD_UP,   BODY_DOWN, l)),
  side: LEGS_SIDE.map(l => girlFrame(HEAD_SIDE, BODY_SIDE, l)),
};

/* ============================================================
   WORLD OBJECTS
   ============================================================ */

const OBJ = {
  /* a round pastel tree — 18 wide so the canopy overhangs its tile */
  tree: makeSprite([
    ".....GGGGGG.....",
    "...GGjjjjjjGG...",
    "..GjjjggggjjjG..",
    ".GjjggggggggjjG.",
    ".GjggggggggggjG.",
    "GjggggGGggggggjG",
    "GjgggggggggGggjG",
    "GjggGgggggggggjG",
    ".GjggggggGgggjG.",
    ".GGjggggggggjGG.",
    "..GGjjggggjjGG..",
    "....GGjjjjGG....",
    "......NnnN......",
    "......NnnN......",
    "......NnnN......",
    ".....NNnnNN.....",
  ]),

  /* a sealed envelope, floating slightly */
  envelope: makeSprite([
    "..KKKKKKKKKKKK..",
    ".KccccccccccccK.",
    ".KcKcccccccKccK.",
    ".KccKcccccKcccK.",
    ".KcccKcccKccccK.",
    ".KccccKcKcccccK.",
    ".KcccccRRccccck.",
    ".KccccRRRRcccck.",
    ".KcccccRRccccck.",
    ".Kcccccccccccck.",
    "..KKKKKKKKKKKK..",
  ]),

  /* read: the letter has been pulled half out of the envelope */
  envelopeOpen: makeSprite([
    "....KKKKKKKK....",
    "....KwwwwwwK....",
    "....KwPPPPwK....",
    "....KwwwwwwK....",
    "....KwPPPPwK....",
    "..KKKwwwwwwKKK..",
    ".KccKKKKKKKKccK.",
    ".Kcccccccccccck.",
    ".Kcccccccccccck.",
    ".Kcccccccccccck.",
    "..KKKKKKKKKKKK..",
  ]),

  /* a picture frame on a stand */
  frame: makeSprite([
    "KKKKKKKKKKKKKKKK",
    "KOOOOOOOOOOOOOOK",
    "KOKKKKKKKKKKKKOK",
    "KOKbbbbbbbbbbKOK",
    "KOKbbbbwwbbbbKOK",
    "KOKbbbwwwwbbbKOK",
    "KOKbbggggggbbKOK",
    "KOKbgggGGgggbKOK",
    "KOKggGGggGGgggOK",
    "KOKKKKKKKKKKKKOK",
    "KOOOOOOOOOOOOOOK",
    "KKKKKKKKKKKKKKKK",
    "......NnnN......",
    ".....NNnnNN.....",
  ]),

  /* jukebox / radio */
  jukebox: makeSprite([
    "..KKKKKKKKKK..",
    ".KPPPPPPPPPPK.",
    ".KPbbbbbbbbPK.",
    ".KPbKKKKKKbPK.",
    ".KPbKyyyyKbPK.",
    ".KPbKKKKKKbPK.",
    ".KPbbbbbbbbPK.",
    ".KPKKPPPPKKPK.",
    ".KPKZzzzzZKPK.",
    ".KPKzZZZZzKPK.",
    ".KPKZzzzzZKPK.",
    ".KPKKKKKKKKPK.",
    ".KPPPPPPPPPPK.",
    "..KKKKKKKKKK..",
    "...K......K...",
  ]),

  /* wooden signpost */
  sign: makeSprite([
    "KKKKKKKKKKKK",
    "KnnnnnnnnnnK",
    "KnKKKKKKKKnK",
    "KnKccccccKnK",
    "KnKccccccKnK",
    "KnKccccccKnK",
    "KnKKKKKKKKnK",
    "KnnnnnnnnnnK",
    "KKKKKKKKKKKK",
    "....NnnN....",
    "....NnnN....",
    "...NNnnNN...",
  ]),

  /* birthday cake, the finale */
  cake: makeSprite([
    ".......y.......",
    "......yOy......",
    "......yOy......",
    ".......K.......",
    "...KKKKKKKKK...",
    "..KwwwwwwwwwK..",
    "..KwPPwwPPwwK..",
    ".KpppppppppppK.",
    ".KpwppwppwppwK.",
    ".KpppppppppppK.",
    "KbbbbbbbbbbbbbK",
    "KbwbbwbbwbbwbbK",
    "KbbbbbbbbbbbbbK",
    "KKKKKKKKKKKKKKK",
  ]),

  /* small heart, used for particles and the HUD */
  heart: makeSprite([
    ".KK.KK.",
    "KppKppK",
    "KpppppK",
    "KpppppK",
    ".KpppK.",
    "..KpK..",
    "...K...",
  ]),

  /* flowers scattered on the grass */
  flowerPink: makeSprite([
    ".p.p.",
    "ppppp",
    ".pyp.",
    "ppppp",
    ".G.G.",
  ]),
  flowerBlue: makeSprite([
    ".b.b.",
    "bbbbb",
    ".byb.",
    "bbbbb",
    ".G.G.",
  ]),
  flowerOrange: makeSprite([
    ".O.O.",
    "OOOOO",
    ".OyO.",
    "OOOOO",
    ".G.G.",
  ]),

  /* a little bench for the park */
  bench: makeSprite([
    "KKKKKKKKKKKKKK",
    "KnnnnnnnnnnnnK",
    "KKKKKKKKKKKKKK",
    "KnnnnnnnnnnnnK",
    "KKKKKKKKKKKKKK",
    ".K..........K.",
    ".K..........K.",
  ]),

  /* balloon, floats over the finale plaza */
  balloon: makeSprite([
    "..KKKK..",
    ".KppppK.",
    "KppppppK",
    "KppwpppK",
    "KppppppK",
    ".KppppK.",
    "..KppK..",
    "...KK...",
    "...k....",
    "....k...",
    "...k....",
  ]),
};

/* ============================================================
   TILES — drawn procedurally into the pre-rendered world canvas.
   ============================================================ */

const T = {
  GRASS: 0, PATH: 1, WATER: 2, FLOWERBED: 3, TREE: 4,
  FENCE: 5, WALL: 6, FLOOR: 7, SAND: 8, CARPET: 9, HEDGE: 10,
};

// which tiles you can't walk through
const SOLID = new Set([T.WATER, T.TREE, T.FENCE, T.WALL, T.HEDGE]);

const TILE = 16;

/* deterministic per-tile noise so the texture never flickers */
function tileRand(x, y, salt = 0) {
  let n = (x * 374761393 + y * 668265263 + salt * 1442695040) | 0;
  n = (n ^ (n >> 13)) * 1274126177;
  return ((n ^ (n >> 16)) >>> 0) / 4294967295;
}

function speckle(cx, px, py, tx, ty, colors, count, salt) {
  for (let i = 0; i < count; i++) {
    const r1 = tileRand(tx, ty, salt + i * 7);
    const r2 = tileRand(tx, ty, salt + i * 13 + 3);
    const r3 = tileRand(tx, ty, salt + i * 29 + 5);
    cx.fillStyle = colors[(r3 * colors.length) | 0];
    cx.fillRect(px + ((r1 * TILE) | 0), py + ((r2 * TILE) | 0), 1, 1);
  }
}

function drawTile(cx, type, tx, ty) {
  const px = tx * TILE, py = ty * TILE;

  switch (type) {
    case T.PATH:
      cx.fillStyle = "#f6dcb8"; cx.fillRect(px, py, TILE, TILE);
      speckle(cx, px, py, tx, ty, ["#e8c79c", "#ffeacb", "#dfb98c"], 14, 100);
      break;

    case T.SAND:
      cx.fillStyle = "#ffe9c9"; cx.fillRect(px, py, TILE, TILE);
      speckle(cx, px, py, tx, ty, ["#f3d7ad", "#fff4e2"], 10, 200);
      break;

    case T.WATER:
      cx.fillStyle = "#79c2e8"; cx.fillRect(px, py, TILE, TILE);
      cx.fillStyle = "#5aa9d6";
      for (let i = 0; i < TILE; i += 4) {
        const off = ((tileRand(tx, ty, i) * 6) | 0);
        cx.fillRect(px + off, py + i + 2, 5, 1);
      }
      speckle(cx, px, py, tx, ty, ["#a8dbf2"], 6, 300);
      break;

    case T.FLOWERBED:
      cx.fillStyle = "#7bc478"; cx.fillRect(px, py, TILE, TILE);
      speckle(cx, px, py, tx, ty, ["#5fa85c", "#8fd18a"], 16, 400);
      speckle(cx, px, py, tx, ty, ["#ffb3c8", "#ffd7a8", "#a8dbf2", "#fff9fb"], 9, 450);
      break;

    case T.FLOOR:
      cx.fillStyle = "#d9a86f"; cx.fillRect(px, py, TILE, TILE);
      cx.fillStyle = "#c08f58";
      cx.fillRect(px, py + (ty % 2 ? 8 : 0), TILE, 1);
      cx.fillStyle = "#e8bd86";
      speckle(cx, px, py, tx, ty, ["#e8bd86", "#c89a63"], 10, 500);
      break;

    case T.CARPET:
      cx.fillStyle = "#f7b8cc"; cx.fillRect(px, py, TILE, TILE);
      cx.fillStyle = "#eda1ba";
      speckle(cx, px, py, tx, ty, ["#eda1ba", "#ffd0de"], 12, 550);
      break;

    case T.WALL:
      cx.fillStyle = "#e9dff0"; cx.fillRect(px, py, TILE, TILE);
      cx.fillStyle = "#c8b8d6";
      cx.fillRect(px, py + 7, TILE, 2);
      cx.fillRect(px, py + 15, TILE, 1);
      cx.fillRect(px + (ty % 2 ? 4 : 12), py, 2, 7);
      cx.fillRect(px + (ty % 2 ? 12 : 4), py + 9, 2, 6);
      break;

    case T.FENCE:
      drawTile(cx, T.GRASS, tx, ty);
      cx.fillStyle = "#9c6b42";
      cx.fillRect(px + 2, py + 4, 2, 11);
      cx.fillRect(px + 11, py + 4, 2, 11);
      cx.fillRect(px, py + 6, TILE, 2);
      cx.fillRect(px, py + 11, TILE, 2);
      cx.fillStyle = "#6b4527";
      cx.fillRect(px, py + 8, TILE, 1);
      cx.fillRect(px, py + 13, TILE, 1);
      break;

    case T.HEDGE:
      cx.fillStyle = "#5fa85c"; cx.fillRect(px, py, TILE, TILE);
      speckle(cx, px, py, tx, ty, ["#4d8c4b", "#7bc478", "#8fd18a"], 26, 600);
      cx.fillStyle = "#4d8c4b";
      cx.fillRect(px, py + 15, TILE, 1);
      break;

    case T.TREE:      // walked-into tile under a tree sprite
    case T.GRASS:
    default:
      cx.fillStyle = "#8fd18a"; cx.fillRect(px, py, TILE, TILE);
      speckle(cx, px, py, tx, ty, ["#7bc478", "#a3dd9c"], 18, 700);
      if (tileRand(tx, ty, 999) > 0.86) {
        cx.fillStyle = "#6fb96c";
        const bx = px + ((tileRand(tx, ty, 11) * 12) | 0);
        const by = py + ((tileRand(tx, ty, 17) * 12) | 0);
        cx.fillRect(bx, by, 1, 3); cx.fillRect(bx + 2, by + 1, 1, 2);
      }
      break;
  }
}
