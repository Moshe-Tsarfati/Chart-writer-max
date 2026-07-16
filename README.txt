ChordChart Fast — iPhone PWA

IMPORTANT
This is an installable web app, not a reliable local-file app. Put this entire folder on an HTTPS host.

Fast free hosting options:
- GitHub Pages
- Netlify Drop
- Cloudflare Pages

Install on iPhone:
1. Open the HTTPS address in Safari.
2. Tap Share.
3. Tap Add to Home Screen.
4. Launch ChordChart from the Home Screen.

Mobile behavior:
- Text mode expands the editor and opens the iPhone keyboard.
- Chord mode keeps the editor visible at the top and puts touch chord controls below it.
- In Chord mode the editor is read-only/inputmode=none so the phone keyboard stays hidden.
- Tap Text to position the cursor/type; tap Chord to return to touch chord entry.
- Projects, settings, enharmonic preferences and backups are stored in browser storage.
- The app also attempts private Origin File System backups under /backups every 60 seconds.

Files:
index.html, styles.css, app.js, manifest.webmanifest, sw.js, icons/
