import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../../lib/firebase";
import "../Css/Clip.css";

const Clip = () => {
  const [clips, setClips] = useState([]);
  const [selectedClip, setSelectedClip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [selectedDate, setSelectedDate] = useState("");
  useEffect(() => {
    const clipsQuery = query(
      collection(db, "clips"),
      where("published", "==", true),
    );

    const unsubscribe = onSnapshot(
      clipsQuery,
      (snapshot) => {
        const clipList = snapshot.docs.map((clipDocument) => ({
          id: clipDocument.id,
          ...clipDocument.data(),
        }));

        clipList.sort((firstClip, secondClip) => {
          const firstDate = firstClip.createdAt?.toMillis?.() || 0;
          const secondDate = secondClip.createdAt?.toMillis?.() || 0;

          return secondDate - firstDate;
        });

        setClips(clipList);
        setLoading(false);
      },
      (error) => {
        console.error("Unable to load clips:", error);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, []);

  const openClip = (clip) => {
    setSelectedClip(clip);
  };

  const closeClip = () => {
    setSelectedClip(null);
  };

  const displayPlatform = (platform) => {
    if (platform === "youtube") return "YouTube";
    if (platform === "vimeo") return "Vimeo";
    if (platform === "direct") return "Video";

    return platform || "Video";
  };

  const renderPlayer = (clip) => {
    if (clip.platform === "direct") {
      return (
        <video className="clip-player" controls autoPlay>
          <source src={clip.embedUrl || clip.originalUrl} />
          Your browser does not support this video.
        </video>
      );
    }

    return (
      <iframe
        className="clip-player"
        src={clip.embedUrl}
        title={clip.title}
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
      />
    );
  };
  const getClipTime = (clip) =>
    clip.createdAt?.toMillis?.() || clip.createdAt?.seconds * 1000 || 0;

  const getClipDateValue = (clip) => {
    const time = getClipTime(clip);

    if (!time) return "";

    const date = new Date(time);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const visibleClips = useMemo(() => {
    const keywords = searchText
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);

    const filteredClips = clips.filter((clip) => {
      const searchableInformation = [
        clip.title,
        clip.description,
        clip.platform,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        keywords.length === 0 ||
        keywords.every((keyword) => searchableInformation.includes(keyword));

      const matchesDate =
        !selectedDate || getClipDateValue(clip) === selectedDate;

      return matchesSearch && matchesDate;
    });

    return [...filteredClips].sort((firstClip, secondClip) => {
      const firstTime = getClipTime(firstClip);
      const secondTime = getClipTime(secondClip);

      return sortOrder === "oldest"
        ? firstTime - secondTime
        : secondTime - firstTime;
    });
  }, [clips, searchText, sortOrder, selectedDate]);

  const clearFilters = () => {
    setSearchText("");
    setSortOrder("newest");
    setSelectedDate("");
  };
  return (
    <main className="clips-page">
      <section className="clips-heading">
        <p className="clips-label">F1 VIDEOS</p>
        <h1>Latest Clips</h1>
        <p>
          Watch race highlights, interviews, team updates and other Formula 1
          videos.
        </p>
      </section>
      <section className="clips-filters">
        <label className="clips-search">
          Search clips
          <input
            type="search"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Search clips by keyword"
          />
        </label>

        <label>
          Sort clips
          <select
            value={sortOrder}
            onChange={(event) => setSortOrder(event.target.value)}
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </label>

        <label>
          Date added
          <input
            type="date"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
          />
        </label>

        <button type="button" onClick={clearFilters}>
          Clear
        </button>
      </section>
      {loading && <p className="clips-message">Loading clips...</p>}

      {!loading && clips.length === 0 && (
        <p className="clips-message">No clips have been published yet.</p>
      )}
      {!loading && clips.length > 0 && visibleClips.length === 0 && (
        <div className="clips-message">
          <p>No clips match your search.</p>

          <button type="button" onClick={clearFilters}>
            Clear filters
          </button>
        </div>
      )}
      <section className="clips-grid">
        {visibleClips.map((clip) => (
          <article className="clip-card" key={clip.id}>
            <button
              className="clip-thumbnail-button"
              type="button"
              onClick={() => openClip(clip)}
            >
              <img
                className="clip-thumbnail"
                src={clip.thumbnailUrl}
                alt={clip.title}
                onError={(event) => {
                  const videoId = clip.embedUrl
                    ?.split("/embed/")[1]
                    ?.split("?")[0];

                  event.currentTarget.onerror = null;

                  if (videoId) {
                    event.currentTarget.src = `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;
                  } else {
                    event.currentTarget.style.display = "none";
                  }
                }}
              />

              <span className="clip-play-icon">▶</span>
            </button>

            <div className="clip-card-content">
              <span className="clip-platform">
                {displayPlatform(clip.platform)}
              </span>

              <h2>{clip.title}</h2>

              {clip.description && <p>{clip.description}</p>}

              <button
                className="watch-clip-button"
                type="button"
                onClick={() => openClip(clip)}
              >
                Watch clip
              </button>
            </div>
          </article>
        ))}
      </section>

      {selectedClip && (
        <div className="clip-modal" onClick={closeClip}>
          <div
            className="clip-modal-content"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="clip-close-button"
              type="button"
              onClick={closeClip}
              aria-label="Close video"
            >
              ×
            </button>

            <div className="clip-player-container">
              {renderPlayer(selectedClip)}
            </div>

            <div className="clip-modal-information">
              <span className="clip-platform">
                {displayPlatform(selectedClip.platform)}
              </span>

              <h2>{selectedClip.title}</h2>

              {selectedClip.description && <p>{selectedClip.description}</p>}

              {selectedClip.originalUrl && (
                <a
                  href={selectedClip.originalUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  View original video
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Clip;
