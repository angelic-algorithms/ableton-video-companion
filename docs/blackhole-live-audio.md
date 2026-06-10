# BlackHole Live Audio Setup

This setup lets the browser prototype hear Ableton in real time by treating
BlackHole as an audio input.

## 1. Route Ableton audio to BlackHole

In Ableton:

1. Open **Live > Settings > Audio**.
2. Set **Audio Output Device** to **BlackHole**.

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
5. Turn on **Monitor live audio** if you want to hear the incoming Ableton audio
   through the app.

## 3. Record with live Ableton audio

When BlackHole is selected, new frame recordings include:

- camera video
- the selected Ableton audio input

The video tiles stay muted so multiple frame videos do not all play duplicate
audio at the same time. During **Play video wall**, the app plays:

1. the imported **Ableton mix**, if one is loaded
2. otherwise, audio from the first recorded take that contains captured audio

## Current limitations

- Browser audio device names may stay generic until camera/microphone permission
  is granted.
- Captured audio is a live stereo feed from Ableton, not separated per Ableton
  track.
- If you record one frame at a time, each take captures whatever Ableton was
  outputting during that pass.
