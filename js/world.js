/* ============================================================
   world.js — builds the map and decides where everything sits.
   Tweak MAP_W / MAP_H and the zone coordinates to redraw the island.
   ============================================================ */

const MAP_W = 56;
const MAP_H = 40;

/* ---------- little map-drawing helpers ---------- */
function rect(map, x0, y0, x1, y1, type) {
  for (let y = y0; y <= y1; y++)
    for (let x = x0; x <= x1; x++)
      if (inBounds(x, y)) map[y][x] = type;
}
function hLine(map, x0, x1, y, type, thick = 2) {
  for (let t = 0; t < thick; t++) rect(map, x0, y + t, x1, y + t, type);
}
function vLine(map, y0, y1, x, type, thick = 2) {
  for (let t = 0; t < thick; t++) rect(map, x + t, y0, x + t, y1, type);
}
function inBounds(x, y) { return x >= 0 && y >= 0 && x < MAP_W && y < MAP_H; }

/* ---------- zones, so the game and the map agree on coordinates ---------- */
const ZONE = {
  spawn:   { x: 11, y: 21 },
  pond:    { x0: 33, y0: 11, x1: 43, y1: 18 },
  park:    { x0: 16, y0: 11, x1: 27, y1: 18 },   // the green playground
  gallery: { x0: 6,  y0: 25, x1: 20, y1: 33 },   // photo room
  plaza:   { x0: 40, y0: 25, x1: 50, y1: 33 },   // finale
};

/* Hand-picked spots for the envelopes, following the path loop.
   If there are more notes than spots, extras get placed automatically. */
const NOTE_SPOTS = [
  { x: 14, y: 22 }, { x: 21, y: 9 },  { x: 30, y: 9 },
  { x: 47, y: 14 }, { x: 47, y: 22 }, { x: 30, y: 35 },
  { x: 21, y: 35 }, { x: 37, y: 22 },
];

/* Frames live inside the gallery, along both walls. */
const PHOTO_SPOTS = [
  { x: 8,  y: 27 }, { x: 11, y: 27 }, { x: 14, y: 27 }, { x: 17, y: 27 },
  { x: 8,  y: 31 }, { x: 11, y: 31 }, { x: 14, y: 31 }, { x: 17, y: 31 },
];

function buildWorld(content) {
  /* ---------- 1. terrain ---------- */
  const map = Array.from({ length: MAP_H }, () => new Array(MAP_W).fill(T.GRASS));

  // tree wall around the whole island
  rect(map, 0, 0, MAP_W - 1, 1, T.TREE);
  rect(map, 0, MAP_H - 2, MAP_W - 1, MAP_H - 1, T.TREE);
  rect(map, 0, 0, 1, MAP_H - 1, T.TREE);
  rect(map, MAP_W - 2, 0, MAP_W - 1, MAP_H - 1, T.TREE);

  // the path loop + the cross through the middle
  hLine(map, 6, 50, 8,  T.PATH);
  hLine(map, 6, 50, 34, T.PATH);
  vLine(map, 8, 35, 6,  T.PATH);
  vLine(map, 8, 35, 49, T.PATH);
  hLine(map, 6, 50, 21, T.PATH);
  vLine(map, 8, 35, 28, T.PATH);

  // pond, with a sandy rim
  const p = ZONE.pond;
  rect(map, p.x0 - 1, p.y0 - 1, p.x1 + 1, p.y1 + 1, T.SAND);
  rect(map, p.x0, p.y0, p.x1, p.y1, T.WATER);
  // a little jetty poking in from the left
  rect(map, p.x0 - 1, 14, p.x0 + 2, 15, T.FLOOR);

  // the green playground: hedge ring with two openings
  const k = ZONE.park;
  rect(map, k.x0, k.y0, k.x1, k.y0, T.HEDGE);
  rect(map, k.x0, k.y1, k.x1, k.y1, T.HEDGE);
  rect(map, k.x0, k.y0, k.x0, k.y1, T.HEDGE);
  rect(map, k.x1, k.y0, k.x1, k.y1, T.HEDGE);
  rect(map, k.x0 + 5, k.y0, k.x0 + 6, k.y0, T.GRASS);   // top gate
  rect(map, k.x0 + 5, k.y1, k.x0 + 6, k.y1, T.GRASS);   // bottom gate
  rect(map, k.x0 + 1, k.y0 + 1, k.x1 - 1, k.y1 - 1, T.FLOWERBED);
  rect(map, k.x0 + 4, k.y0 + 3, k.x1 - 4, k.y1 - 3, T.GRASS);

  // gallery building
  const g = ZONE.gallery;
  rect(map, g.x0, g.y0, g.x1, g.y1, T.WALL);
  rect(map, g.x0 + 1, g.y0 + 1, g.x1 - 1, g.y1 - 1, T.FLOOR);
  rect(map, g.x0 + 5, g.y0 + 2, g.x1 - 5, g.y1 - 2, T.CARPET);
  // a wide doorway — narrow ones are easy to lose track of once you're inside
  const door = Math.floor((g.x0 + g.x1) / 2);
  rect(map, door - 1, g.y0, door + 2, g.y0, T.FLOOR);
  rect(map, door - 1, g.y0 - 3, door + 2, g.y0 - 1, T.PATH);   // path up to it
  rect(map, door - 1, g.y0 + 1, door + 2, g.y0 + 1, T.CARPET); // mat, so the exit reads from inside

  // finale plaza
  const z = ZONE.plaza;
  rect(map, z.x0, z.y0, z.x1, z.y1, T.SAND);
  rect(map, z.x0 + 2, z.y0 + 2, z.x1 - 2, z.y1 - 2, T.CARPET);
  rect(map, 45, z.y0 - 4, 46, z.y0 - 1, T.PATH);        // path down into it

  /* ---------- 2. things you can bump into or talk to ---------- */
  const ents = [];
  const used = new Set();
  const key = (x, y) => x + "," + y;

  /* keep a spot walkable and reserve it */
  function clearSpot(x, y, r = 1) {
    for (let dy = -r; dy <= r; dy++)
      for (let dx = -r; dx <= r; dx++)
        if (inBounds(x + dx, y + dy) && SOLID.has(map[y + dy][x + dx]))
          map[y + dy][x + dx] = T.GRASS;
    used.add(key(x, y));
  }

  function add(type, tx, ty, data, sprite, opts = {}) {
    ents.push({
      type, tx, ty,
      x: tx * TILE + (opts.ox || 0),
      y: ty * TILE + (opts.oy || 0),
      sprite, data,
      solid: !!opts.solid,
      bob: opts.bob || 0,
      w: sprite.w, h: sprite.h,
    });
  }

  /* --- trees: fill the border band and scatter a few inland --- */
  for (let y = 0; y < MAP_H; y++) {
    for (let x = 0; x < MAP_W; x++) {
      if (map[y][x] !== T.TREE) continue;
      if (tileRand(x, y, 4242) > 0.55) continue;      // thin them out visually
      add("tree", x, y, null, OBJ.tree, { ox: -1, oy: -6 });
    }
  }
  const scatter = [
    [9, 12], [12, 15], [24, 25], [26, 30], [34, 27], [38, 31],
    [45, 10], [9, 18], [52, 20], [4, 22], [33, 5], [20, 4],
  ];
  scatter.forEach(([x, y]) => {
    if (!inBounds(x, y) || map[y][x] !== T.GRASS) return;
    map[y][x] = T.TREE;
    add("tree", x, y, null, OBJ.tree, { ox: -1, oy: -6 });
  });

  /* --- flowers on grass, purely decorative --- */
  const flowers = [OBJ.flowerPink, OBJ.flowerBlue, OBJ.flowerOrange];
  for (let y = 2; y < MAP_H - 2; y++) {
    for (let x = 2; x < MAP_W - 2; x++) {
      if (map[y][x] !== T.GRASS && map[y][x] !== T.FLOWERBED) continue;
      const r = tileRand(x, y, 31337);
      if (r > 0.90) {
        add("deco", x, y, null, flowers[(tileRand(x, y, 77) * 3) | 0],
            { ox: 5, oy: 6 });
      }
    }
  }

  /* --- benches in the park --- */
  add("deco", k.x0 + 2, k.y0 + 2, null, OBJ.bench, { ox: 0, oy: 4 });
  add("deco", k.x1 - 3, k.y1 - 2, null, OBJ.bench, { ox: 0, oy: 4 });

  /* --- the signpost by the spawn --- */
  const sp = ZONE.spawn;
  clearSpot(sp.x + 2, sp.y - 2);
  const signBody = (content.sign?.body || ["arrows or WASD to walk.", "space to look at things."]).slice();
  if (content.startDate) {
    const days = Math.floor((Date.now() - new Date(content.startDate).getTime()) / 86400000);
    if (days > 0) signBody.push(`(${days.toLocaleString()} days together, as of today.)`);
  }
  add("sign", sp.x + 2, sp.y - 2, { title: "welcome", body: signBody },
      OBJ.sign, { ox: 2, oy: -4, solid: true });

  /* --- the jukebox --- */
  clearSpot(sp.x + 5, sp.y + 2);
  add("jukebox", sp.x + 5, sp.y + 2, null, OBJ.jukebox, { ox: 1, oy: -2, solid: true });

  /* --- envelopes --- */
  const notes = content.notes || [];
  const noteSpots = spotsFor(notes.length, NOTE_SPOTS, map, used, 3);
  notes.forEach((n, i) => {
    const s = noteSpots[i];
    clearSpot(s.x, s.y);
    add("note", s.x, s.y, { index: i, note: n }, OBJ.envelope, { ox: 0, oy: -6, bob: 1 });
  });

  /* --- picture frames --- */
  const photos = content.photos || [];
  const photoSpots = spotsFor(photos.length, PHOTO_SPOTS, map, used, 2);
  photos.forEach((ph, i) => {
    const s = photoSpots[i];
    clearSpot(s.x, s.y, 0);
    add("photo", s.x, s.y, { index: i, photo: ph }, OBJ.frame,
        { ox: 0, oy: -8, solid: true });
  });

  /* --- the cake, in the middle of the plaza --- */
  const cx = Math.floor((z.x0 + z.x1) / 2), cy = Math.floor((z.y0 + z.y1) / 2);
  clearSpot(cx, cy, 1);
  add("cake", cx, cy, null, OBJ.cake, { ox: 0, oy: -6, solid: true });
  add("deco", z.x0 + 2, z.y0 + 2, null, OBJ.balloon, { ox: 4, oy: -12 });
  add("deco", z.x1 - 2, z.y0 + 2, null, OBJ.balloon, { ox: 4, oy: -10 });

  /* draw order: things lower on the screen go in front */
  ents.sort((a, b) => (a.y + a.h) - (b.y + b.h));

  return {
    map, ents,
    w: MAP_W, h: MAP_H,
    spawn: { x: sp.x * TILE + TILE / 2, y: sp.y * TILE + TILE / 2 },
  };
}

/* Take as many hand-placed spots as we need; if the user added more
   notes or photos than there are spots, find open ground for the rest. */
function spotsFor(count, preferred, map, used, minGap) {
  const out = [];
  const key = (x, y) => x + "," + y;

  for (const s of preferred) {
    if (out.length >= count) break;
    out.push(s); used.add(key(s.x, s.y));
  }

  let guard = 0;
  while (out.length < count && guard++ < 4000) {
    const x = 4 + ((tileRand(guard, out.length, 8080) * (MAP_W - 8)) | 0);
    const y = 4 + ((tileRand(out.length, guard, 9090) * (MAP_H - 8)) | 0);
    if (!inBounds(x, y)) continue;
    if (SOLID.has(map[y][x])) continue;
    if (used.has(key(x, y))) continue;
    const tooClose = out.some(s => Math.abs(s.x - x) + Math.abs(s.y - y) < minGap);
    if (tooClose) continue;
    out.push({ x, y }); used.add(key(x, y));
  }

  // absolute fallback so we never return fewer spots than items
  while (out.length < count) out.push({ x: 10 + out.length, y: 22 });
  return out;
}
