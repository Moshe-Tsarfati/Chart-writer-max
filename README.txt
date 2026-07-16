ChordChart Fast — iPhone PWA text-mode fix

Replace these files in the GitHub Pages repository:
- index.html
- styles.css
- app.js
- sw.js

Important: sw.js was versioned and changed to network-first for the main app files so GitHub Pages updates do not remain trapped behind an old offline cache.

After GitHub Pages finishes deploying:
1. Fully close the Home Screen app from the iPhone app switcher.
2. Open it again.
3. Tap Text, then tap the editor once to open the keyboard.

Changes in this version:
- Uses visualViewport height while the iPhone keyboard is open.
- Text editor fills the whole visible area above the keyboard.
- Text button arms editing; one editor tap opens the keyboard reliably.
- Chord insertions do not focus/scroll the readonly editor.
- Utilities and Diatonic headings removed.
- Omit/custom and Base quality/display are open by default.
