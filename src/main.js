const state = {
  frameCount: 4,
  selectedFrameId: 1,
  frames: [],
  stream: null,
  activeRecorders: new Map(),
  recordings: new Map(),
  midiAccess: null,
  midiInputId: "",
  midiConnected: false
};

const els = {
  cameraSelect: document.querySelector("#cameraSelect"),
  frameCountInput: document.querySelector("#frameCountInput"),
  loopLengthInput: document.querySelector("#loopLengthInput"),
  tempoInput: document.querySelector("#tempoInput"),
  recordSelectedButton: document.querySelector("#recordSelectedButton"),
  recordAllButton: document.querySelector("#recordAllButton"),
  stopButton: document.querySelector("#stopButton"),
  frameGrid: document.querySelector("#frameGrid"),
  routingList: document.querySelector("#routingList"),
  audioImport: document.querySelector("#audioImport"),
  sessionAudio: document.querySelector("#sessionAudio"),
  audioStatus: document.querySelector("#audioStatus"),
  cameraStatus: document.querySelector("#cameraStatus"),
  bridgeStatus: document.querySelector("#bridgeStatus"),
  connectMidiButton: document.querySelector("#connectMidiButton"),
  midiInputSelect: document.querySelector("#midiInputSelect"),
  midiLog: document.querySelector("#midiLog")
};

function makeFrames(count) {
  const existing = new Map(state.frames.map((frame) => [frame.id, frame]));
  state.frames = Array.from({ length: count }, (_, index) => {
    const id = index + 1;
    return existing.get(id) || {
      id,
      trackName: `Ableton Track ${id}`,
      armed: id === 1,
      muted: false
    };
  });
}

function render() {
  const cols = Math.ceil(Math.sqrt(state.frameCount));
  els.frameGrid.style.setProperty("--cols", String(cols));

  els.frameGrid.innerHTML = state.frames.map((frame) => {
    const recording = state.recordings.get(frame.id);
    const isSelected = frame.id === state.selectedFrameId;
    const isRecording = state.activeRecorders.has(frame.id);
    return `
      <article class="frame ${isSelected ? "selected" : ""}" data-frame-id="${frame.id}">
        <div class="video-shell">
          ${
            recording
              ? `<video src="${recording.url}" autoplay loop muted playsinline></video>`
              : `<video class="live-preview" autoplay muted playsinline></video>`
          }
          <div class="frame-badge">${isRecording ? "Recording" : `Frame ${frame.id}`}</div>
        </div>
        <div class="frame-meta">
          <strong>${frame.trackName}</strong>
          <span>${frame.armed ? "Armed" : "Idle"}${frame.muted ? " / Muted" : ""}</span>
        </div>
      </article>
    `;
  }).join("");

  els.routingList.innerHTML = state.frames.map((frame) => `
    <div class="route-row ${frame.id === state.selectedFrameId ? "active" : ""}" data-route-id="${frame.id}">
      <button class="select-frame" type="button">Frame ${frame.id}</button>
      <input value="${escapeAttribute(frame.trackName)}" aria-label="Track name for frame ${frame.id}">
      <label class="toggle">
        <input type="checkbox" ${frame.armed ? "checked" : ""} data-arm-id="${frame.id}">
        Arm
      </label>
      <label class="toggle">
        <input type="checkbox" ${frame.muted ? "checked" : ""} data-mute-id="${frame.id}">
        Mute
      </label>
    </div>
  `).join("");

  attachLiveStreamToEmptyFrames();
}

function escapeAttribute(value) {
  return value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;");
}

async function initializeCamera(deviceId) {
  if (state.stream) {
    state.stream.getTracks().forEach((track) => track.stop());
  }

  const constraints = {
    video: deviceId ? { deviceId: { exact: deviceId } } : true,
    audio: false
  };

  state.stream = await navigator.mediaDevices.getUserMedia(constraints);
  els.cameraStatus.textContent = "Camera connected. Empty frames show the live preview.";
  await refreshCameras();
  attachLiveStreamToEmptyFrames();
  updateTransport(false);
}

async function refreshCameras() {
  const devices = await navigator.mediaDevices.enumerateDevices();
  const cameras = devices.filter((device) => device.kind === "videoinput");
  const currentDeviceId = state.stream?.getVideoTracks()[0]?.getSettings().deviceId;

  els.cameraSelect.innerHTML = cameras.map((camera, index) => `
    <option value="${camera.deviceId}" ${camera.deviceId === currentDeviceId ? "selected" : ""}>
      ${camera.label || `Camera ${index + 1}`}
    </option>
  `).join("");
}

function attachLiveStreamToEmptyFrames() {
  if (!state.stream) return;
  document.querySelectorAll(".live-preview").forEach((video) => {
    if (video.srcObject !== state.stream) {
      video.srcObject = state.stream;
    }
  });
}

function startRecording(frameIds) {
  if (!state.stream || state.activeRecorders.size > 0) return;

  frameIds.forEach((frameId) => {
    const chunks = [];
    const recorder = new MediaRecorder(state.stream, { mimeType: getSupportedMimeType() });
    recorder.addEventListener("dataavailable", (event) => {
      if (event.data.size > 0) chunks.push(event.data);
    });
    recorder.addEventListener("stop", () => {
      const blob = new Blob(chunks, { type: recorder.mimeType });
      const oldRecording = state.recordings.get(frameId);
      if (oldRecording) URL.revokeObjectURL(oldRecording.url);
      state.recordings.set(frameId, { blob, url: URL.createObjectURL(blob), createdAt: Date.now() });
      state.activeRecorders.delete(frameId);
      updateTransport(false);
      render();
    });
    state.activeRecorders.set(frameId, recorder);
    recorder.start();
  });

  updateTransport(true);
  render();
}

function getSupportedMimeType() {
  const types = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"];
  return types.find((type) => MediaRecorder.isTypeSupported(type)) || "";
}

function stopRecording() {
  state.activeRecorders.forEach((recorder) => {
    if (recorder.state !== "inactive") recorder.stop();
  });
}

async function connectMidi() {
  if (!navigator.requestMIDIAccess) {
    els.bridgeStatus.textContent = "Web MIDI is not available in this browser. Try Chrome or Edge.";
    return;
  }

  state.midiAccess = await navigator.requestMIDIAccess({ sysex: false });
  state.midiAccess.addEventListener("statechange", refreshMidiInputs);
  state.midiConnected = true;
  els.bridgeStatus.textContent = "MIDI connected. Choose the Ableton/IAC input below.";
  els.connectMidiButton.textContent = "Refresh MIDI";
  refreshMidiInputs();
}

function refreshMidiInputs() {
  if (!state.midiAccess) return;

  const inputs = Array.from(state.midiAccess.inputs.values());
  els.midiInputSelect.disabled = inputs.length === 0;
  els.midiInputSelect.innerHTML = inputs.length
    ? inputs.map((input) => `
        <option value="${input.id}" ${input.id === state.midiInputId ? "selected" : ""}>
          ${input.name || "Unnamed MIDI input"}
        </option>
      `).join("")
    : "<option>No MIDI inputs found</option>";

  const preferredInput = inputs.find((input) => input.id === state.midiInputId) || inputs[0];
  if (preferredInput) selectMidiInput(preferredInput.id);
}

function selectMidiInput(inputId) {
  if (!state.midiAccess) return;

  state.midiAccess.inputs.forEach((input) => {
    input.onmidimessage = null;
  });

  const input = state.midiAccess.inputs.get(inputId);
  if (!input) return;

  state.midiInputId = inputId;
  input.onmidimessage = handleMidiMessage;
  els.midiInputSelect.value = inputId;
  els.bridgeStatus.textContent = `Listening to ${input.name || "selected MIDI input"}.`;
  addMidiLog(`Listening: ${input.name || inputId}`);
}

function handleMidiMessage(event) {
  const [status, data1 = 0, data2 = 0] = event.data;
  const command = status & 0xf0;
  const messageType = status & 0xff;

  if (messageType === 0xfa) {
    recordArmedFramesFromMidi();
    addMidiLog("MIDI Start -> record armed frames");
    return;
  }

  if (messageType === 0xfc) {
    stopRecording();
    addMidiLog("MIDI Stop -> stop recording");
    return;
  }

  if (command === 0x90 && data2 > 0) {
    const frameId = data1 - 35;
    if (frameId >= 1 && frameId <= state.frameCount) {
      selectAndArmFrame(frameId);
      addMidiLog(`Note ${data1} -> frame ${frameId}`);
    }
  }
}

function selectAndArmFrame(frameId) {
  state.selectedFrameId = frameId;
  state.frames.forEach((frame) => {
    frame.armed = frame.id === frameId;
  });
  render();
}

function recordArmedFramesFromMidi() {
  const armedIds = state.frames.filter((frame) => frame.armed && !frame.muted).map((frame) => frame.id);
  startRecording(armedIds.length ? armedIds : [state.selectedFrameId]);
}

function addMidiLog(message) {
  const item = document.createElement("li");
  item.textContent = `${new Date().toLocaleTimeString()} ${message}`;
  els.midiLog.prepend(item);

  while (els.midiLog.children.length > 8) {
    els.midiLog.lastElementChild?.remove();
  }
}

function updateTransport(isRecording) {
  const cameraReady = Boolean(state.stream);
  els.recordSelectedButton.disabled = isRecording || !cameraReady;
  els.recordAllButton.disabled = isRecording || !cameraReady;
  els.stopButton.disabled = !isRecording;
}

function updateFrameCount() {
  state.frameCount = Math.min(16, Math.max(1, Number(els.frameCountInput.value) || 1));
  els.frameCountInput.value = String(state.frameCount);
  makeFrames(state.frameCount);
  if (state.selectedFrameId > state.frameCount) state.selectedFrameId = state.frameCount;
  render();
}

els.frameCountInput.addEventListener("input", updateFrameCount);
els.frameCountInput.addEventListener("change", updateFrameCount);

els.cameraSelect.addEventListener("change", () => {
  initializeCamera(els.cameraSelect.value).catch(showCameraError);
});

els.recordSelectedButton.addEventListener("click", () => {
  startRecording([state.selectedFrameId]);
});

els.recordAllButton.addEventListener("click", () => {
  const armedIds = state.frames.filter((frame) => frame.armed && !frame.muted).map((frame) => frame.id);
  startRecording(armedIds.length ? armedIds : [state.selectedFrameId]);
});

els.stopButton.addEventListener("click", stopRecording);

els.frameGrid.addEventListener("click", (event) => {
  const frameEl = event.target.closest("[data-frame-id]");
  if (!frameEl) return;
  state.selectedFrameId = Number(frameEl.dataset.frameId);
  render();
});

els.routingList.addEventListener("input", (event) => {
  const row = event.target.closest("[data-route-id]");
  if (!row) return;
  const frame = state.frames.find((item) => item.id === Number(row.dataset.routeId));
  if (!frame) return;

  if (event.target.matches("input[type='text'], input:not([type])")) {
    frame.trackName = event.target.value;
  }
});

els.routingList.addEventListener("change", (event) => {
  const frameId = Number(event.target.dataset.armId || event.target.dataset.muteId);
  const frame = state.frames.find((item) => item.id === frameId);
  if (!frame) return;

  if (event.target.dataset.armId) frame.armed = event.target.checked;
  if (event.target.dataset.muteId) frame.muted = event.target.checked;
  render();
});

els.routingList.addEventListener("click", (event) => {
  const button = event.target.closest(".select-frame");
  if (!button) return;
  const row = button.closest("[data-route-id]");
  state.selectedFrameId = Number(row.dataset.routeId);
  render();
});

els.audioImport.addEventListener("change", () => {
  const file = els.audioImport.files?.[0];
  if (!file) return;
  els.sessionAudio.src = URL.createObjectURL(file);
  els.audioStatus.textContent = `${file.name} loaded. Later, the desktop app will watch Ableton's mix export and refresh this automatically.`;
});

els.connectMidiButton.addEventListener("click", () => {
  connectMidi().catch((error) => {
    els.bridgeStatus.textContent = `MIDI unavailable: ${error.message}`;
  });
});

els.midiInputSelect.addEventListener("change", () => {
  selectMidiInput(els.midiInputSelect.value);
});

function showCameraError(error) {
  state.stream = null;
  els.cameraStatus.textContent = `Camera unavailable: ${error.message}`;
  updateTransport(false);
}

makeFrames(state.frameCount);
render();
updateTransport(false);
initializeCamera().catch(showCameraError);
