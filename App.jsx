import React, { useEffect, useMemo, useState } from "react";
import AudioPlayerBar from "./components/AudioPlayerBar";
import {
  fileToDataUrl,
  loadUserTracks,
  saveUserTracks,
} from "./store/trackStore";

const GENRES = ["All", "Pop", "Hip-Hop", "Rap", "Rock"];

export default function App() {
  // Active tab: "home" | "videos" | "library" | "upload" | "live" | "messages" | "track_detail"
  const [activeTab, setActiveTab] = useState("home");
  const [selectedTrackId, setSelectedTrackId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");

  const [tracks, setTracks] = useState(() => loadUserTracks());
  const [currentTrackId, setCurrentTrackId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackError, setPlaybackError] = useState("");
  const [followingIds, setFollowingIds] = useState({});

  // Upload form state
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [genre, setGenre] = useState("Pop");
  const [audioFile, setAudioFile] = useState(null);
  const [externalUrl, setExternalUrl] = useState("");
  const [uploadStatus, setUploadStatus] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Download banner state (shown ONLY on Home)
  const [showInstallHint, setShowInstallHint] = useState(false);

  useEffect(() => {
    saveUserTracks(tracks);
  }, [tracks]);

  const userUploadedTracks = useMemo(
    () => tracks.filter((t) => t.uploadedByUser !== false),
    [tracks]
  );

  const filteredTracks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return userUploadedTracks.filter((t) => {
      const matchesGenre = selectedGenre === "All" || t.genre === selectedGenre;
      const matchesQuery =
        !q ||
        t.title.toLowerCase().includes(q) ||
        t.artist.toLowerCase().includes(q) ||
        t.genre.toLowerCase().includes(q);
      return matchesGenre && matchesQuery;
    });
  }, [userUploadedTracks, searchQuery, selectedGenre]);

  const currentTrack = useMemo(
    () => tracks.find((t) => t.id === currentTrackId) || null,
    [tracks, currentTrackId]
  );

  const inspectedTrack = useMemo(
    () => tracks.find((t) => t.id === selectedTrackId) || null,
    [tracks, selectedTrackId]
  );

  // ONLY Home ("home") renders the Download card; entering a track or another tab hides it completely
  const isHomePage = activeTab === "home";

  const playTrack = (track) => {
    if (!track || !track.audioUrl) {
      setPlaybackError("Δεν υπάρχει έγκυρο αρχείο ήχου για αυτό το κομμάτι.");
      return;
    }
    setPlaybackError("");
    if (currentTrackId === track.id) {
      setIsPlaying((prev) => !prev);
    } else {
      setCurrentTrackId(track.id);
      setIsPlaying(true);
    }
  };

  const openTrackDetail = (track) => {
    setSelectedTrackId(track.id);
    setActiveTab("track_detail");
    playTrack(track);
  };

  const handlePrev = () => {
    if (!filteredTracks.length || !currentTrack) return;
    const idx = filteredTracks.findIndex((t) => t.id === currentTrack.id);
    const prevIdx = idx <= 0 ? filteredTracks.length - 1 : idx - 1;
    setCurrentTrackId(filteredTracks[prevIdx].id);
    setIsPlaying(true);
  };

  const handleNext = () => {
    if (!filteredTracks.length || !currentTrack) return;
    const idx = filteredTracks.findIndex((t) => t.id === currentTrack.id);
    const nextIdx = idx < 0 || idx >= filteredTracks.length - 1 ? 0 : idx + 1;
    setCurrentTrackId(filteredTracks[nextIdx].id);
    setIsPlaying(true);
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    setUploadError("");
    setUploadStatus("");

    const cleanTitle = title.trim();
    const cleanArtist = (artist.trim() || "User Upload");
    const cleanUrl = externalUrl.trim();

    if (!cleanTitle) {
      setUploadError("Βάλε τίτλο τραγουδιού.");
      return;
    }

    if (!audioFile && !cleanUrl) {
      setUploadError("Επίλεξε αρχείο ήχου (MP3/WAV/OGG) ή δώσε έγκυρο audio URL.");
      return;
    }

    setIsUploading(true);
    try {
      let resolvedAudioUrl = cleanUrl;
      if (audioFile) {
        if (!audioFile.type.startsWith("audio/")) {
          throw new Error("Το επιλεγμένο αρχείο δεν είναι αρχείο ήχου.");
        }
        resolvedAudioUrl = await fileToDataUrl(audioFile);
      }

      const newTrack = {
        id: `user-${Date.now()}`,
        title: cleanTitle,
        artist: cleanArtist,
        genre,
        uploadedByUser: true,
        audioUrl: resolvedAudioUrl,
        createdAt: Date.now(),
      };

      setTracks((prev) => [newTrack, ...prev]);
      setCurrentTrackId(newTrack.id);
      setIsPlaying(true);
      setTitle("");
      setArtist("");
      setExternalUrl("");
      setAudioFile(null);
      setUploadStatus("Το τραγούδι ανέβηκε και ξεκίνησε αναπαραγωγή.");
      setActiveTab("home");
    } catch (err) {
      setUploadError(err?.message || "Αποτυχία ανεβάσματος τραγουδιού.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <button
          type="button"
          className="brand"
          onClick={() => setActiveTab("home")}
        >
          <span>NAMU</span>
        </button>

        <div className="topbar-actions">
          <button
            type="button"
            className="pill-btn live"
            onClick={() => setActiveTab("live")}
          >
            ● LIVE
          </button>
          <button
            type="button"
            className="pill-btn"
            onClick={() => setActiveTab("upload")}
          >
            + Upload
          </button>
          <button
            type="button"
            className="pill-btn"
            onClick={() => setActiveTab("library")}
          >
            R
          </button>
        </div>
      </header>

      <input
        type="search"
        className="search-input"
        placeholder="Search user tracks..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <div className="genre-row">
        {GENRES.map((g) => (
          <button
            key={g}
            type="button"
            className={`genre-chip ${selectedGenre === g ? "active" : ""}`}
            onClick={() => setSelectedGenre(g)}
          >
            {g}
          </button>
        ))}
      </div>

      {playbackError && <div className="error-box">{playbackError}</div>}

      {/* HOME VIEW — Download card exists ONLY here */}
      {isHomePage && (
        <>
          <section>
            <h2 className="section-title">Popular Tracks</h2>

            <div className="download-card">
              <button
                type="button"
                className="download-btn"
                onClick={() => setShowInstallHint((prev) => !prev)}
              >
                📱 Download The App
              </button>
              {showInstallHint && (
                <p className="download-hint">
                  Για εγκατάσταση: πάτα το μενού του browser (⋮) και επίλεξε
                  &quot;Εγκατάσταση εφαρμογής&quot; ή &quot;Προσθήκη στην αρχική οθόνη&quot;.
                </p>
              )}
            </div>
          </section>

          <section>
            <div className="track-grid">
              {filteredTracks.map((track) => {
                const active = currentTrackId === track.id && isPlaying;
                return (
                  <button
                    key={track.id}
                    type="button"
                    className={`track-tile ${active ? "playing" : ""}`}
                    onClick={() => playTrack(track)}
                  >
                    <div className="cover-badge">
                      {active ? "II" : track.title.slice(0, 1).toUpperCase()}
                    </div>
                    <div className="track-meta">
                      <div className="track-title">{track.title}</div>
                      <div className="track-sub">{track.artist}</div>
                    </div>
                  </button>
                );
              })}
            </div>
            {filteredTracks.length === 0 && (
              <p className="download-hint">
                Δεν βρέθηκαν τραγούδια χρηστών για αυτό το φίλτρο.
              </p>
            )}
          </section>

          <section>
            <h2 className="section-title">New Releases</h2>
            <div className="release-list">
              {filteredTracks.map((track) => {
                const isFollowing = Boolean(followingIds[track.id]);
                return (
                  <div key={track.id} className="release-row">
                    <button
                      type="button"
                      className="release-main"
                      onClick={() => openTrackDetail(track)}
                    >
                      <div className="cover-badge">♪</div>
                      <div className="track-meta">
                        <div className="track-title">{track.title}</div>
                        <div className="track-sub">
                          {track.artist} • {track.genre}
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      className="pill-btn"
                      onClick={() =>
                        setFollowingIds((prev) => ({
                          ...prev,
                          [track.id]: !prev[track.id],
                        }))
                      }
                    >
                      {isFollowing ? "✓ Following" : "Follow"}
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}

      {/* TRACK DETAIL VIEW (inside a track — NO Download card) */}
      {activeTab === "track_detail" && inspectedTrack && (
        <section className="upload-card">
          <button
            type="button"
            className="pill-btn"
            onClick={() => setActiveTab("home")}
          >
            ← Πίσω στην Αρχική
          </button>
          <div className="cover-badge">♪</div>
          <h2 className="section-title">{inspectedTrack.title}</h2>
          <div className="track-sub">
            Καλλιτέχνης: {inspectedTrack.artist} • Κατηγορία: {inspectedTrack.genre}
          </div>
          <button
            type="button"
            className="pill-btn primary"
            onClick={() => playTrack(inspectedTrack)}
          >
            {currentTrackId === inspectedTrack.id && isPlaying ? "Παύση" : "Αναπαραγωγή"}
          </button>
        </section>
      )}

      {/* UPLOAD VIEW — Users upload audio files or URLs */}
      {activeTab === "upload" && (
        <section>
          <h2 className="section-title">Ανέβασμα Τραγουδιού Χρήστη</h2>
          <form className="upload-card" onSubmit={handleUploadSubmit}>
            <label className="field-label">
              Τίτλος κομματιού *
              <input
                type="text"
                className="field-input"
                placeholder="π.χ. Nyxta sto Limani"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </label>

            <label className="field-label">
              Καλλιτέχνης / Χρήστης
              <input
                type="text"
                className="field-input"
                placeholder="Όνομα δημιουργού"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
              />
            </label>

            <label className="field-label">
              Είδος μουσικής
              <select
                className="field-select"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
              >
                {GENRES.filter((g) => g !== "All").map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </label>

            <label className="field-label">
              Αρχείο ήχου από τη συσκευή (MP3, WAV, OGG)
              <input
                type="file"
                accept="audio/*"
                className="field-input"
                onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
              />
            </label>

            <label className="field-label">
              Ή απευθείας Audio URL (προαιρετικό)
              <input
                type="url"
                className="field-input"
                placeholder="https://example.com/track.mp3"
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
              />
            </label>

            {uploadError && <div className="error-box">{uploadError}</div>}
            {uploadStatus && <div className="ok-box">{uploadStatus}</div>}

            <button
              type="submit"
              className="pill-btn primary"
              disabled={isUploading}
            >
              {isUploading ? "Ανέβασμα..." : "Δημοσίευση & Αναπαραγωγή"}
            </button>
          </form>
        </section>
      )}

      {/* OTHER TABS (NO Download card) */}
      {!isHomePage &&
        activeTab !== "track_detail" &&
        activeTab !== "upload" && (
          <section className="upload-card">
            <h2 className="section-title">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h2>
            <p className="download-hint">
              Ενότητα {activeTab}. Τα τραγούδια χρηστών συνεχίζουν να παίζουν κανονικά από το player.
            </p>
          </section>
        )}

      <footer className="docked-footer">
        <div className="docked-inner">
          <AudioPlayerBar
            track={currentTrack}
            isPlaying={isPlaying}
            onTogglePlay={() => {
              if (!currentTrack && filteredTracks[0]) {
                setCurrentTrackId(filteredTracks[0].id);
                setIsPlaying(true);
              } else if (currentTrack) {
                setIsPlaying((prev) => !prev);
              }
            }}
            onPrev={handlePrev}
            onNext={handleNext}
            onEnded={handleNext}
            onPlaybackError={setPlaybackError}
          />

          <nav className="bottom-nav" aria-label="Κύρια πλοήγηση">
            {[
              { id: "home", label: "Home", icon: "⌂" },
              { id: "videos", label: "Videos", icon: "▶" },
              { id: "library", label: "Library", icon: "☰" },
              { id: "upload", label: "Upload", icon: "+" },
              { id: "live", label: "Live", icon: "◉" },
              { id: "messages", label: "Messages", icon: "✉" },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                className={`nav-item ${activeTab === item.id ? "active" : ""}`}
                onClick={() => setActiveTab(item.id)}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  );
}
