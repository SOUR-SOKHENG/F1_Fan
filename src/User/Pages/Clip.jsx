import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../../lib/firebase";
import "../Css/Clip.css";

function Clip() {
  const [clips, setClips] = useState([]);
  const [selectedClip, setSelectedClip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [date, setDate] = useState("");
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

  const getPlatform = (platform) => {
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
      <iframe className="clip-player" src={clip.embedUrl} title={clip.title} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
    );
  };
  const getClipTime = (clip) =>
    clip.createdAt?.toMillis?.() || clip.createdAt?.seconds * 1000 || 0;

  const getClipDate = (clip) => {
    const time = getClipTime(clip);

    if (!time) return "";

    const date = new Date(time);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const visibleClips = useMemo(() => {
    const keywords = search
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);

    const filteredClips = clips.filter((clip) => {
      const clipText = [
        clip.title,
        clip.description,
        clip.platform,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        keywords.length === 0 ||
        keywords.every((keyword) => clipText.includes(keyword));

      const matchesDate =
        !date || getClipDate(clip) === date;

      return matchesSearch && matchesDate;
    });

    return [...filteredClips].sort((firstClip, secondClip) => {
      const firstTime = getClipTime(firstClip);
      const secondTime = getClipTime(secondClip);

      return sortOrder === "oldest"
        ? firstTime - secondTime
        : secondTime - firstTime;
    });
  }, [clips, search, sortOrder, date]);

  const clearFilters = () => {
    setSearch("");
    setSortOrder("newest");
    setDate("");
  };
  return (
    <main className="min-h-screen w-full bg-[#f4f5f7] px-5 py-10 text-[#20232a] sm:px-[6%] sm:py-[60px]">
      <section className="mb-[38px] max-w-[760px]">
        <p className="mb-2 text-sm font-extrabold tracking-[2px] text-[#e10600]">
          F1 VIDEOS
        </p>
        <h1 className="m-0 text-[clamp(36px,5vw,62px)] italic uppercase">
          Latest Clips
        </h1>
        <p className="mt-3.5 text-[17px] leading-relaxed text-gray-600">
          Watch race highlights, interviews, team updates and other Formula 1
          videos.
        </p>
      </section>
      <section className="clips-filters">
        <label className="clips-search">
          Search clips
          <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search clips by keyword" />
        </label>

        <label>
          Sort clips
          <select value={sortOrder} onChange={(event) => setSortOrder(event.target.value)} >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </label>

        <label>
          Date added
          <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
        </label>

        <button type="button" onClick={clearFilters}>
          Clear
        </button>
      </section>
      {loading && (
        <p className="py-10 text-center text-gray-500">Loading clips...</p>
      )}

      {!loading && clips.length === 0 && (
        <p className="py-10 text-center text-gray-500">
          No clips have been published yet.
        </p>
      )}
      {!loading && clips.length > 0 && visibleClips.length === 0 && (
        <div className="py-10 text-center text-gray-500">
          <p>No clips match your search.</p>

          <button
            className="mt-2.5 rounded-lg border-0 bg-[#e10600] px-4 py-2 font-extrabold text-white"
            type="button"
            onClick={clearFilters}
          >
            Clear filters
          </button>
        </div>
      )}
      <section className="clips-grid">
        {visibleClips.map((clip) => (
          <article className="clip-card" key={clip.id}>
            <button className="clip-thumbnail-btn" type="button" onClick={() => openClip(clip)} >
              <img className="clip-thumbnail" src={clip.thumbnailUrl} alt={clip.title} onError={(event) => { const videoId = clip.embedUrl ?.split("/embed/")[1] ?.split("?")[0]; event.currentTarget.onerror = null; if (videoId) { event.currentTarget.src = `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`; } else { event.currentTarget.style.display = "none"; } }} />

              <span className="clip-play-icon">▶</span>
            </button>

            <div className="clip-card-content">
              <span className="clip-platform">
                {getPlatform(clip.platform)}
              </span>

              <h2>{clip.title}</h2>

              {clip.description && <p>{clip.description}</p>}

              <button className="watch-clip-btn" type="button" onClick={() => openClip(clip)} >
                Watch clip
              </button>
            </div>
          </article>
        ))}
      </section>

      {selectedClip && (
        <div className="clip-modal" onClick={closeClip}>
          <div className="clip-modal-content" onClick={(event) => event.stopPropagation()} >
            <button className="clip-close-btn" type="button" onClick={closeClip} aria-label="Close video" >
              ×
            </button>

            <div className="clip-player-container">
              {renderPlayer(selectedClip)}
            </div>

            <div className="clip-modal-information">
              <span className="clip-platform">
                {getPlatform(selectedClip.platform)}
              </span>

              <h2>{selectedClip.title}</h2>

              {selectedClip.description && <p>{selectedClip.description}</p>}

              {selectedClip.originalUrl && (
                <a href={selectedClip.originalUrl} target="_blank" rel="noreferrer" >
                  View original video
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default Clip;
