# Ableton Video Companion

A Mac-first prototype for recording acapella-style video frames while Ableton Live
handles audio recording and mixing.

## Run the prototype

```sh
npm run dev
```

Then open:

```text
http://localhost:4173
```

The browser will ask for camera permission. Recording stays disabled until a
camera stream is available.

## What works now

- Select a camera source.
- Configure 1 to 16 video frames.
- Map each frame to an Ableton track name.
- Arm or mute individual frames.
- Record the selected frame.
- Record all armed frames from the current camera source.
- Import an Ableton mix or rough audio file for preview.

## Important prototype limits

- This is currently a local web prototype, not a packaged macOS app.
- The Ableton mix is imported manually for now.
- Automatic audio refresh requires the next desktop-app milestone, where the app
  can watch a chosen Ableton export path on disk.
- Max for Live control is planned but not implemented yet.
- Final MP4 export is planned for the desktop version with FFmpeg.

## Sensible next steps

1. Test the first Ableton MIDI bridge with the Mac IAC Driver.
2. Move the prototype into a desktop shell, most likely Tauri or Electron.
3. Add project save/load so takes, frame routing, and audio paths persist.
4. Add file watching for a chosen Ableton mix export.
5. Add FFmpeg composition/export for the 1 to 16 frame video wall.
6. Build a small Max for Live bridge device for transport, tempo, track names,
   and record triggers.

See [docs/ableton-integration-plan.md](./docs/ableton-integration-plan.md) for the
full roadmap.
See [docs/ableton-midi-setup.md](./docs/ableton-midi-setup.md) for the first MIDI
bridge setup.
