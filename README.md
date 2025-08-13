# Smart Med Lookup (Netlify-ready)

A simple, educational web app to search a condition and see suggested medicines with **timings**, **frequency**, **precautions**, and **food/lifestyle** guidance. It combines a **Netlify serverless function** (attempts real-time names via the public OpenFDA API) with a curated `data.json` for clear, tabular details.

> ⚠️ **Disclaimer:** This project is for learning. It is **not medical advice**. Always consult a qualified healthcare professional.

## Files
- `index.html` – structure of the site
- `style.css` – attractive styling & layout
- `script.js` – frontend fetch & rendering
- `netlify/functions/getMedicines.js` – serverless function for real-time name suggestions (OpenFDA)
- `data.json` – curated medicine details (timings, precautions, food suggestions)
- `netlify.toml` – local dev & deploy config

## Local Dev
You can use any static server for local preview, but the Netlify function will only run in a Netlify environment.

```bash
# Option 1: Netlify CLI (recommended)
npm i -g netlify-cli
netlify dev
# then open the local URL
```

## Deploy to Netlify
1. Create a new site from this folder (drag-and-drop or connect a repo).
2. Build settings: **no build command**, publish directory: **root** (the folder containing index.html).
3. Ensure the function directory is auto-detected: `netlify/functions`.
4. Deploy. The frontend calls `/.netlify/functions/getMedicines?disease=...`.

If OpenFDA rate-limits or returns nothing, the app still works using `data.json`.

---

Made with ❤️ for educational purposes.
