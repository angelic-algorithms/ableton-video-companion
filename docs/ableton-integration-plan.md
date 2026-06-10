# Ableton Video Companion Plan

## First working version

This project should start as a Mac-first companion app for Ableton Live Suite.
Ableton stays responsible for recording and mixing audio. The companion app records
camera video per frame, keeps each frame mapped to an Ableton track, previews the
grid, and exports the final video.

The browser prototype proves the core UX before we move into a packaged desktop
app.

## Why not a traditional plugin first?

Video capture, camera permissions, file watching, and video export are awkward
inside an audio plugin. A standalone app can use camera APIs and FFmpeg directly,
while Ableton can still control it through Max for Live, MIDI, OSC, or Ableton
Link.

## Recommended architecture

1. Desktop companion app
   - Tauri or Electron shell.
   - Camera capture and video-take management.
   - 1 to 16 frame grid.
   - FFmpeg export pipeline.
   - Watches an Ableton mix export file and reloads audio automatically.

2. Ableton bridge
   - Max for Live device because you have Ableton Suite.
   - Sends transport events: play, stop, record, bar position, tempo.
   - Sends selected track names and frame assignments.
   - Can trigger recording one frame at a time or multiple armed frames.

3. Sync model
   - Start simple: shared count-in and bar-length loop settings.
   - Next: MIDI Clock or OSC transport messages from Max for Live.
   - Later: Ableton Link SDK for tempo and phase sync.

4. Audio model
   - Ableton is the source of truth for audio.
   - For the prototype, the user manually imports a rough mix.
   - For the desktop app, the app watches a chosen exported mix path.
   - Later, each frame can optionally reference a stem exported from its matching
     Ableton track.

## Milestones

### Milestone 1: Local video-wall prototype

- Select camera.
- Configure 1 to 16 frames.
- Map each frame to an Ableton track name.
- Record selected frame.
- Record all armed frames.
- Import Ableton mix audio manually.
- Preview the combined wall.

### Milestone 2: Desktop app

- Package for macOS.
- Store projects on disk.
- Save takes per frame.
- Watch the Ableton mix file and refresh automatically.
- Add FFmpeg export to MP4.

### Milestone 3: Max for Live bridge

- Build a small Max for Live device.
- Send OSC messages to the companion app.
- Reflect Ableton tempo and transport.
- Trigger recording from Live.
- Pull track names from Live into frame routing.

### Milestone 4: Shareable release

- Code signing and notarization for macOS.
- Installer or DMG.
- Example Ableton Live Set.
- Example Max for Live bridge device.
- Basic onboarding inside the app.

## Suggested first Ableton workflow

1. Create up to 16 audio or MIDI tracks in Ableton.
2. Name each track for the frame: Vocal, Guitar, Keys, Percussion, etc.
3. In the companion app, create the same number of frames.
4. Map each frame to the matching Ableton track.
5. Record a frame while recording the audio into Ableton.
6. Export or bounce the Ableton mix to the watched audio file.
7. Preview and export the final video from the companion app.
