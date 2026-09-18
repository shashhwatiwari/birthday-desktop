# birthday-desktop 💌

A tiny top-down pixel game, made as a birthday present.

She starts on a small island. She walks around with the arrow keys, finds sealed
envelopes scattered along the paths — each one is a letter — and picture frames in
a little gallery holding your photos. A jukebox plays your song on a loop. When
she's read every letter, the cake at the far end of the island has something to say.

Hand-drawn pixel art, no sprite sheets, no engine, no build step, no dependencies.
Everything is drawn from text in `js/art.js` at runtime.

---

## 1. Make it yours

**Everything you edit lives in one file: [`js/content.js`](js/content.js).**

| What | Where |
|---|---|
| Her name, your name, tab title | `partnerName`, `yourName`, `pageTitle` |
| "days together" on the signpost | `startDate` (`YYYY-MM-DD`) |
| Title screen wording | `title` |
| The signpost by the start | `sign` |
| The song | `song.youtubeId` |
| The photos | `photos` |
| The letters | `notes` |
| What the cake says at the end | `finale` |

### Photos

Drop your images into `images/`, then list them:

```js
{ src: "images/photo1.jpg", caption: "the first one", date: "may 2023" }
```

Each photo becomes a picture frame inside the gallery. Square-ish images look best.
Resize anything huge down to ~1600px wide so the page stays quick.

If a file isn't there yet, the frame still works and the panel says
*"photo1.jpg isn't in /images yet"* — so you can walk the island before you've
gathered the pictures.

### Letters

Each entry in `notes` becomes one envelope somewhere on the island:

```js
{
  title: "a letter, for your birthday",
  body: ["paragraph one", "paragraph two"],
  ps: "optional p.s. line",
}
```

Add or remove as many as you like. There are eight hand-placed spots along the
paths; past that, extras get placed automatically on open ground. The "letters
x/y" counter and the cake's unlock condition both follow the length of the list.

Opened envelopes are remembered in `localStorage` — they stay unsealed, and the
envelope sprite changes to show the letter pulled out.

### The song

`song.youtubeId` is the `v=` part of a YouTube URL:

```
https://www.youtube.com/watch?v=KtlgYxa6BMU
                                 ^^^^^^^^^^^ this bit
```

It plays through a hidden YouTube player behind the jukebox, so nothing
copyrighted is stored in this repo. **Check the ID before you send the link** —
open the YouTube page for the version you actually want and copy its ID.

Browsers block audio until someone interacts with the page. That's what the
"press start" button is for — the click starts the music.

---

## 2. Controls

| | |
|---|---|
| Walk | arrow keys or `WASD` |
| Look at something | `space`, `enter` or `E` |
| Close a letter | `space` again (press once more to skip the typing) |
| On a phone | the D-pad and the ♥ button |

The game pauses itself when the tab isn't visible.

---

## 3. Preview it locally

Open `index.html` in a browser, or:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

---

## 4. Put it on GitHub Pages

```bash
git add -A && git commit -m "make it ours" && git push
```

In the repo: **Settings → Pages → Source: `Deploy from a branch` → `main` / `root`.**

> **After every push, bump the `?v=` number** on the script and stylesheet tags
> at the top and bottom of `index.html` (they're all the same number). GitHub
> Pages tells browsers to cache those files, so anyone who has already opened
> the page can otherwise keep seeing the old version. Changing the number makes
> it a new URL, which forces a fresh download.

Live a minute later at `https://<your-username>.github.io/birthday-desktop/`.

> **Heads up:** a public repo means the photos and letters are public too. If you'd
> rather they weren't, GitHub Pages on a private repo needs a paid plan — the free
> alternative is dragging this folder onto [netlify.com/drop](https://app.netlify.com/drop),
> which gives an unlisted URL from a private folder in seconds.

---

## Structure

```
index.html        page shell — canvas, HUD, dialog, title screen
css/style.css     the pastel pixel UI. every colour is a variable at the top
js/content.js     ← YOUR CONTENT GOES HERE
js/art.js         pixel art: sprites written as text, plus the tile painters
js/world.js       builds the map and decides where everything sits
js/game.js        the engine: movement, collision, camera, dialogs, music
images/           your photos
```

## Redrawing things

**Colours.** Every colour in the UI is a CSS variable at the top of
`css/style.css` (`--pink`, `--orange`, `--blue`). The in-game palette is the `PAL`
table at the top of `js/art.js` — the two use matching values.

**Sprites** are plain text. One character per pixel, `.` is transparent:

```js
flowerPink: makeSprite([
  ".p.p.",
  "ppppp",
  ".pyp.",
  "ppppp",
  ".G.G.",
]),
```

Rows are padded automatically, so a short row won't break anything.

**The map** is drawn in code in `js/world.js` using `rect`, `hLine` and `vLine`
over a tile grid. The zones (pond, park, gallery, plaza) are coordinates in the
`ZONE` object — move those and the island rearranges itself.
