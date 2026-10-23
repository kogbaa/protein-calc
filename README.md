# Protein Calc

A small offline-capable protein tracker, built as a static PWA for iPhone.

**Live:** https://kogbaa.github.io/protein-calc/

## Install on iPhone

1. Open the live URL in **Safari**.
2. Tap **Share → Add to Home Screen**.
3. Launch it from the home-screen icon. It runs full-screen and works offline.

Log from the home-screen app rather than a Safari tab; they keep separate storage.

## Files

```
├── index.html              page markup
├── manifest.webmanifest    PWA name, colors, and icons
├── sw.js                   service worker: network-first with an offline cache
├── css/styles.css          styles
├── js/app.js               app logic and storage
└── icons/                  apple-touch-icon.png, icon-192.png, icon-512.png
```

`sw.js` must stay at the root next to `index.html`; a service worker only controls pages at or below its own folder.

## Updating

Edit, commit, and push to `main`. GitHub Pages redeploys in about a minute, and the app picks up changes the next time it opens online.

If you add or rename a file, update the `FILES` list in `sw.js` and bump `CACHE` (e.g. `protein-calc-v2`) so old caches are cleared.

## Data

Everything is stored in the browser's `localStorage` on the phone. Nothing is sent anywhere. Use **The usual → Backup → Export** now and then to keep a copy.

## Local preview

Any static server works, for example:

```
python -m http.server 8000
```

The service worker only registers over HTTPS, so offline caching is active only on the hosted site.
