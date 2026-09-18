# birthday-desktop 💌

A scrollable retro-desktop / digital-scrapbook birthday page: pinned polaroids on a
corkboard, a draggable Winamp-style player looping "our song," and sealed envelopes
that open into handwritten love notes.

No build step, no frameworks, no dependencies. Three files and a folder of photos.

---

## 1. Make it yours

**Everything you edit lives in one file: [`js/content.js`](js/content.js).**

Open it and change:

| What | Where |
|---|---|
| Their name, your name, tab title | `partnerName`, `yourName`, `pageTitle` |
| The "days together" counter | `startDate` (format `YYYY-MM-DD`) |
| The song | `song.youtubeId` |
| The boot-screen text | `bootLines` |
| The opening letter | `hero` |
| The photos | `photos` |
| The envelopes / love notes | `notes` |
| The closing message | `finale` |

### Photos

1. Drop your images into the `images/` folder.
2. List them in the `photos` array:

```js
{ src: "images/photo1.jpg", caption: "the first one", date: "may 2023", rotate: -4, pin: "tape" }
```

- `rotate` — tilt in degrees, keep it between `-8` and `8`
- `pin` — `"tape"`, `"pushpin"`, or `"clip"`

Square-ish images look best (they're cropped to a square in the polaroid frame).
Resize anything huge down to ~1600px wide first so the page loads fast.

If a photo file is missing, that polaroid shows a "drop it in /images" placeholder
instead of breaking — so you can preview the site before you've gathered the pictures.

### Notes

Each entry in `notes` becomes one sealed envelope. Add or remove as many as you like —
the grid and the "x of y opened" counter adjust on their own.

```js
{
  label: "open me first",          // text under the envelope
  title: "a letter, for your birthday",
  body: ["paragraph one", "paragraph two"],
  ps: "optional p.s. line",
}
```

Opened envelopes are remembered in `localStorage`, so they stay unsealed if they
come back to the page later.

### The song

`song.youtubeId` is the `v=` part of a YouTube URL:

```
https://www.youtube.com/watch?v=KtlgYxa6BMU
                                 ^^^^^^^^^^^ this bit
```

The page plays it through a hidden YouTube player behind the custom retro UI, so
nothing copyrighted is stored in this repo. **Check the ID before you send the link** —
open the YouTube page for the track you want and copy its ID.

Browsers block audio until someone interacts with the page. That's what the
"press to begin" button on the boot screen is for — the click starts the music.

---

## 2. Preview it locally

Just open `index.html` in a browser, or run a tiny local server:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

---

## 3. Put it on GitHub Pages

```bash
git add -A && git commit -m "make it ours" && git push
```

Then in the repo: **Settings → Pages → Source: `Deploy from a branch` → `main` / `root` → Save.**

A minute later it's live at:

```
https://<your-username>.github.io/birthday-desktop/
```

> **Heads up:** a public repo means the photos and letters are public too. If you want
> it private, GitHub Pages on private repos needs a paid GitHub plan — the free
> alternative is dragging this folder onto [netlify.com/drop](https://app.netlify.com/drop),
> which gives you an unlisted URL from a private folder in seconds.

---

## Structure

```
index.html        page skeleton (you shouldn't need to touch it)
css/style.css     the whole look — retro palette lives in :root
js/content.js     ← YOUR CONTENT GOES HERE
js/main.js        builds the page from content.js
images/           your photos
```

## Reskinning

Every colour is a CSS variable at the top of `css/style.css`. Change `--pink`,
`--amber`, `--mint` and the wallpaper gradient (`--bg-deep` / `--bg-mid` / `--bg-warm`)
and the entire site shifts mood.
