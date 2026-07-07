# Cecilia &amp; Oliver — Wedding Invitation

A single-page, mobile-first digital wedding invitation microsite. Built with plain
**HTML + CSS + JavaScript** — no build step, no dependencies. A faithful recreation of an
elegant vintage invitation: envelope intro, live countdown, timeline, hotels and RSVP.

## Run locally

No build needed — just serve the folder over HTTP (needed so the fonts/relative paths load):

```bash
# Python
python -m http.server 8000

# or Node
npx serve .
```

Then open <http://localhost:8000>.

## Edit your details

Almost everything lives in two files:

- **`js/config.js`** — the dynamic bits: wedding **date/time** (drives the countdown),
  **RSVP** link (Google Form), **contact e-mail**, and hotel **website** links.
- **`index.html`** — all section text: couple names, welcome message, Our Story,
  date &amp; venue, timeline rows, and hotel details. Search for the section comments
  (e.g. `<!-- ---------- Timeline ---------- -->`).

### RSVP

Set `rsvpUrl` in `config.js` to your Google Form URL. If you leave it blank, the RSVP
button falls back to a `mailto:` using `contactEmail`.

## Photos

The framed photos (heart locket, Our Story heart, venue oval) currently use soft grayscale
**placeholders** drawn in SVG. To use real photos, replace the `<rect fill="url(#g-photo)">`
inside each frame in `index.html` with an `<image href="assets/img/your-photo.jpg" .../>`
(kept inside the same `clip-path`). Drop the image files in `assets/img/`.

## Structure

```
index.html          all sections + inline SVG art
css/  reset · tokens · styles · animations
js/   config · main · countdown · envelope · reveal
```

## Colophon

Fonts (Google Fonts): Cinzel, Cormorant Garamond, Pinyon Script, Tangerine.
All ornaments (crest, flourishes, envelope, frames, timeline icons) are hand-drawn SVG —
no third-party image assets.
