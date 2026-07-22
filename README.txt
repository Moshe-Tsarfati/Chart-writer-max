ChordChart Fast iPhone PWA V11

New structured chart format:
- Lines created/marked in Chord mode are saved with a gentle "> " prefix.
- The prefix is hidden inside the editor and View mode.
- View mode transposes only recognized chords on marked chord rows.
- Roots, slash basses, beat marks, superscripts, ellipses, bars and repeat notation are supported.
- Global sharp/flat spelling preferences apply to modulation.

Hosted chart search on iPhone:
1. Put structured TXT chart files in the repository's /charts folder.
2. Add each file to charts/index.json, for example:
   {"charts":[{"title":"Artist - Song","path":"Artist - Song.txt"}]}
3. Deploy with GitHub Pages.

Where supported, Connect root can read root/charts directly. iPhone Safari normally uses charts/index.json instead.
