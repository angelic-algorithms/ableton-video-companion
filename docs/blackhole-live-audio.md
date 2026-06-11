# BlackHole Live Audio Setup

This setup lets the browser prototype hear Ableton in real time by treating
BlackHole as an audio input.

## 1. Route Ableton audio to BlackHole

In Ableton:

1. Open **Live > Settings > Audio**.
2. Set **Audio Output Device** to **BlackHole**.

With this basic setting, Ableton sends audio to BlackHole only. That means you
usually will not hear Ableton directly through your speakers/headphones.

If you also want to hear Ableton through your speakers/headphones at the same
time, create a macOS **Multi-Output Device**:

1. Open **Audio MIDI Setup**.
2. Click the **+** button and choose **Create Multi-Output Device**.
3. Check your normal output device and **BlackHole**.
4. In Ableton, choose that Multi-Output Device as the audio output.

## 2. Select BlackHole in the app

1. Run the app with `npm run dev`.
2. Open `http://localhost:4173` in Chrome or Edge.
3. Allow camera and microphone permissions when prompted.
4. In **Ableton audio input**, choose **BlackHole**.
5. Click **Connect Audio**.
6. **Monitor live audio** is on by default. Leave it on if you want to hear the
   incoming Ableton audio through the app.

**IAC Driver Bus 1** is the MIDI bridge. It should appear in the MIDI input
dropdown, not the Ableton audio input dropdown. BlackHole should appear in
**Ableton audio input** after Chrome/Edge has microphone permission.

## 3. Record with live Ableton audio

When BlackHole is selected, new frame recordings include:

- camera video
- the selected Ableton audio input

The video tiles stay muted so multiple frame videos do not all play duplicate
audio at the same time. During **Play video wall**, the app plays audio in this
priority order:

1. live Ableton audio from BlackHole, if connected
2. otherwise, the imported **Ableton mix**, if one is loaded
3. otherwise, audio from the first recorded take that contains captured audio

This means Ableton remains the living audio source. If you change effects, volume,
panning, or processing on the Ableton track, the app hears the updated audio
through BlackHole without needing a new video take. If you rerecord the part, the
app should create a new video take for that frame.

## Frame and track model

Use one frame for one lasting Ableton track/part. Add another frame only when:

1. you are stacking a new loop or performance on top of the original video
2. you are recording more than one track or performer at the same time

Do not add a new frame just because you changed effects in Ableton. Effects should
stay in Ableton and update through the live BlackHole audio path.

## Soloing a tile

Recorded tiles with captured audio show a **Solo** button. Soloing a tile pauses
the shared live/mix audio and unmutes that tile's recorded media so you can hear
the part by itself.

This solo audio is the audio captured at recording time. With a normal stereo
BlackHole feed, the app cannot isolate one Ableton track from the live mix after
the fact. For live per-track solo that always reflects current Ableton effects,
the next architecture step is separate per-track routing, such as multiple
BlackHole channels, stems, or a deeper Max for Live/desktop bridge.

## Current limitations

- Browser audio device names may stay generic until camera/microphone permission
  is granted.
- Captured audio is a live stereo feed from Ableton, not separated per Ableton
  track.
- If you record one frame at a time, each take captures whatever Ableton was
  outputting during that pass.
