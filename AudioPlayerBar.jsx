import React, { useEffect, useRef, useState } from "react";

function formatTime(sec) {
  if (!Number.isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function AudioPlayerBar({
  track,
  isPlaying,
  onTogglePlay,
  onPrev,
  onNext,
  onEnded,
  onPlaybackError,
}) {
  const audioRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!track || !track.audioUrl) {
      audio.pause();
      audio.removeAttribute("src");
      setCurrentTime(0);
      setDuration(0);
      return;
    }

    onPlaybackError("");
    audio.src = track.audioUrl;
    audio.load();
    setCurrentTime(0);

    if (isPlaying) {
      const playPromise = audio.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch((err) => {
          onPlaybackError(
            `Δεν μπόρεσε να ξεκινήσει η αναπαραγωγή (${err?.message || "audio error"}).`
          );
        });
      }
    }
  }, [track?.id, track?.audioUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !track?.audioUrl) return;

    if (isPlaying) {
      const playPromise = audio.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch((err) => {
          onPlaybackError(
            `Σφάλμα play(): ${err?.message || "ελέγξτε το αρχείο ήχου"}.`
          );
        });
      }
    } else {
      audio.pause();
    }
  }, [isPlaying, track?.audioUrl]);

  const handleSeek = (e) => {
    const nextSec = Number(e.target.value);
    setCurrentTime(nextSec);
    if (audioRef.current && Number.isFinite(nextSec)) {
      audioRef.current.currentTime = nextSec;
    }
  };

  return (
    <div className="player-bar">
      <audio
        ref={audioRef}
        preload="metadata"
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime || 0)}
        onEnded={() => {
          setCurrentTime(0);
          onEnded?.();
        }}
        onError={() => {
          onPlaybackError(
            "Το αρχείο ήχου του τραγουδιού δεν φορτώνει ή δεν υποστηρίζεται."
          );
        }}
      />

      <div className="player-top">
        <div className="track-meta">
          <div className="track-title">
            {track ? track.title : "Select a track"}
          </div>
          <div className="track-sub">
            {track ? `${track.artist} • ${track.genre}` : "NAMU Edition"}
          </div>
        </div>

        <div className="player-controls">
          <button
            type="button"
            className="icon-btn"
            onClick={onPrev}
            aria-label="Προηγούμενο"
            disabled={!track}
          >
            |&lt;
          </button>
          <button
            type="button"
            className="play-btn"
            onClick={onTogglePlay}
            aria-label={isPlaying ? "Παύση" : "Αναπαραγωγή"}
            disabled={!track}
          >
            {isPlaying ? "II" : "▶"}
          </button>
          <button
            type="button"
            className="icon-btn"
            onClick={onNext}
            aria-label="Επόμενο"
            disabled={!track}
          >
            &gt;|
          </button>
        </div>
      </div>

      <div className="seek-row">
        <span>{formatTime(currentTime)}</span>
        <input
          type="range"
          min={0}
          max={duration > 0 ? duration : 100}
          step={0.1}
          value={Math.min(currentTime, duration > 0 ? duration : 100)}
          onChange={handleSeek}
          disabled={!track || duration <= 0}
        />
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
}
