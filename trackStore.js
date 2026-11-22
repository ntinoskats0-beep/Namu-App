const STORAGE_KEY = "namu_user_tracks_v1";

// Generates a valid playable silent/ambient WAV data URL as fallback demo when no external stream is attached
function createDemoWavDataUrl(freq = 220, seconds = 2) {
  const sampleRate = 8000;
  const numSamples = sampleRate * seconds;
  const buffer = new ArrayBuffer(44 + numSamples);
  const view = new DataView(buffer);

  const writeStr = (offset, str) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeStr(0, "RIFF");
  view.setUint32(4, 36 + numSamples, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate, true);
  view.setUint16(32, 1, true);
  view.setUint16(34, 8, true); // 8-bit
  writeStr(36, "data");
  view.setUint32(40, numSamples, true);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const envelope = Math.min(1, t * 8) * Math.max(0, 1 - t / seconds);
    const sample = Math.sin(2 * Math.PI * freq * t) * 0.25 * envelope;
    view.setUint8(44 + i, Math.floor(128 + sample * 127));
  }

  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return "data:audio/wav;base64," + btoa(binary);
}

export const INITIAL_TRACKS = [
  {
    id: "demo-1",
    title: "Anagenisi",
    artist: "Kats",
    genre: "Pop",
    uploadedByUser: true,
    audioUrl: createDemoWavDataUrl(261.63, 2),
    createdAt: Date.now() - 3600000 * 4,
  },
  {
    id: "demo-2",
    title: "I Kardia Mou espase",
    artist: "NAMU Artist",
    genre: "Pop",
    uploadedByUser: true,
    audioUrl: createDemoWavDataUrl(293.66, 2),
    createdAt: Date.now() - 3600000 * 3,
  },
  {
    id: "demo-3",
    title: "Glenti",
    artist: "Athens Crew",
    genre: "Hip-Hop",
    uploadedByUser: true,
    audioUrl: createDemoWavDataUrl(329.63, 2),
    createdAt: Date.now() - 3600000 * 2,
  },
  {
    id: "demo-4",
    title: "Katabra",
    artist: "Studio R",
    genre: "Rap",
    uploadedByUser: true,
    audioUrl: createDemoWavDataUrl(392.0, 2),
    createdAt: Date.now() - 3600000,
  },
];

export function loadUserTracks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_TRACKS;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return INITIAL_TRACKS;
    return parsed.filter((t) => t && typeof t.audioUrl === "string" && t.audioUrl.length > 0);
  } catch {
    return INITIAL_TRACKS;
  }
}

export function saveUserTracks(tracks) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tracks));
  } catch {
    // Ignore quota errors on very large base64 files; in-memory tracks still play immediately
  }
}

export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Αποτυχία ανάγνωσης αρχείου ήχου."));
    reader.readAsDataURL(file);
  });
}
