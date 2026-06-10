# Ableton MIDI Bridge Setup

This first bridge connects Ableton Live to the prototype with MIDI. It lets
Ableton select/arm frames and start/stop video recording in the app.

## 1. Enable a virtual MIDI port on macOS

1. Open **Audio MIDI Setup**.
2. In the menu bar, choose **Window > Show MIDI Studio**.
3. Double-click **IAC Driver**.
4. Check **Device is online**.
5. Add or keep one port, for example **Bus 1**.

## 2. Enable the port in Ableton

1. Open **Ableton Live > Settings > Link, Tempo & MIDI**.
2. Find **Output: IAC Driver Bus 1**.
3. Turn on **Track**.
4. Turn on **Sync** if you want Ableton transport Start/Stop messages to reach
   the app.

## 3. Connect the app

1. Run the prototype with `npm run dev`.
2. Open `http://localhost:4173` in Chrome or Edge.
3. Allow camera permission.
4. Click **Connect MIDI**.
5. Choose **IAC Driver Bus 1** as the MIDI input.

## 4. Trigger frames from Ableton

Create a MIDI track in Ableton and set its output to **IAC Driver Bus 1**.

The app maps MIDI notes to frames like this:

| Note | MIDI number | Frame |
| --- | ---: | ---: |
| C1 | 36 | 1 |
| C#1 | 37 | 2 |
| D1 | 38 | 3 |
| D#1 | 39 | 4 |
| E1 | 40 | 5 |
| F1 | 41 | 6 |
| F#1 | 42 | 7 |
| G1 | 43 | 8 |
| G#1 | 44 | 9 |
| A1 | 45 | 10 |
| A#1 | 46 | 11 |
| B1 | 47 | 12 |
| C2 | 48 | 13 |
| C#2 | 49 | 14 |
| D2 | 50 | 15 |
| D#2 | 51 | 16 |

When the app receives one of those notes, it selects and arms that frame.

## 5. Transport behavior

The app has an **Ableton transport** mode selector:

- **Record armed frames**: MIDI Start records the currently armed frames.
- **Play video wall**: MIDI Start restarts recorded frame videos and imported
  audio from the beginning.
- MIDI Stop stops the active recording or stops playback and resets to the
  beginning.

This keeps Ableton as the audio recorder/mixer and the companion app as the
video recorder. The next milestone is automatic audio refresh from Ableton mix
exports.
