import { useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import "./AdminClips.css";

const emptyClip = {
  title: "",
  description: "",
  platform: "youtube",
  originalUrl: "",
  thumbnailUrl: "",
  published: true,
};

const getYouTubeId = (videoUrl) => {
  const url = new URL(videoUrl);

  if (url.hostname.includes("youtu.be")) {
    return url.pathname.split("/")[1];
  }

  if (url.searchParams.get("v")) {
    return url.searchParams.get("v");
  }

  const pathParts = url.pathname.split("/").filter(Boolean);

  if (pathParts[0] === "shorts" || pathParts[0] === "embed") {
    return pathParts[1];
  }

  return "";
};

const createVideoInformation = (form) => {
  const originalUrl = form.originalUrl.trim();

  if (form.platform === "youtube") {
    const videoId = getYouTubeId(originalUrl);

    if (!videoId) {
      throw new Error("The YouTube link is not valid.");
    }

    return {
      embedUrl: `https://www.youtube.com/embed/${videoId}`,
      thumbnailUrl:
        form.thumbnailUrl.trim() ||
        `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
    };
  }

  if (form.platform === "vimeo") {
    const videoId = originalUrl.match(/vimeo\.com\/(?:video\/)?(\d+)/)?.[1];

    if (!videoId) {
      throw new Error("The Vimeo link is not valid.");
    }

    return {
      embedUrl: `https://player.vimeo.com/video/${videoId}`,
      thumbnailUrl: form.thumbnailUrl.trim(),
    };
  }

  return {
    embedUrl: originalUrl,
    thumbnailUrl: form.thumbnailUrl.trim(),
  };
};

const AdminClips = () => {
  const [clips, setClips] = useState([]);
  const [form, setForm] = useState(emptyClip);
  const [editingId, setEditingId] = useState("");
  const [selectedClip, setSelectedClip] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [searchText, setSearchText] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    const stopListening = onSnapshot(
      collection(db, "clips"),
      (snapshot) => {
        const clipList = snapshot.docs
          .map((clipDocument) => ({
            id: clipDocument.id,
            ...clipDocument.data(),
          }))
          .sort((firstClip, secondClip) => {
            const firstTime = firstClip.createdAt?.toMillis?.() || 0;

            const secondTime = secondClip.createdAt?.toMillis?.() || 0;

            return secondTime - firstTime;
          });

        setClips(clipList);
      },
      (error) => {
        console.error("Could not load clips:", error);
        setMessage("Could not load clips.");
      },
    );

    return stopListening;
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const openCreateForm = () => {
    setForm(emptyClip);
    setEditingId("");
    setMessage("");
    setShowForm(true);
  };

  const openUpdateForm = (clip) => {
    setForm({
      title: clip.title || "",
      description: clip.description || "",
      platform: clip.platform || "youtube",
      originalUrl: clip.originalUrl || "",
      thumbnailUrl: clip.thumbnailUrl || "",
      published: clip.published !== false,
    });

    setEditingId(clip.id);
    setMessage("");
    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) return;

    setShowForm(false);
    setEditingId("");
    setForm(emptyClip);
    setMessage("");
  };

  const openClipDetails = (clip) => {
    setSelectedClip(clip);
  };

  const closeClipDetails = () => {
    setSelectedClip(null);
  };

  const saveClip = async (event) => {
    event.preventDefault();
    setMessage("");

    if (!form.title.trim() || !form.originalUrl.trim()) {
      setMessage("Enter the clip title and video link.");
      return;
    }

    try {
      setSaving(true);

      const videoInformation = createVideoInformation(form);

      if (form.platform !== "youtube" && !videoInformation.thumbnailUrl) {
        setMessage("Add a thumbnail URL for this platform.");
        return;
      }

      const clipData = {
        title: form.title.trim(),
        description: form.description.trim(),
        platform: form.platform,
        originalUrl: form.originalUrl.trim(),
        embedUrl: videoInformation.embedUrl,
        thumbnailUrl: videoInformation.thumbnailUrl,
        published: form.published,
        updatedAt: serverTimestamp(),
      };

      if (editingId) {
        await updateDoc(doc(db, "clips", editingId), clipData);
      } else {
        await addDoc(collection(db, "clips"), {
          ...clipData,
          createdAt: serverTimestamp(),
        });
      }

      const successMessage = editingId
        ? "Clip updated successfully."
        : "Clip published successfully.";

      setShowForm(false);
      setEditingId("");
      setForm(emptyClip);
      setMessage(successMessage);
    } catch (error) {
      console.error("Could not save clip:", error);
      setMessage(error.message || "Could not save the clip.");
    } finally {
      setSaving(false);
    }
  };

  const deleteClip = async (clip) => {
    const shouldDelete = window.confirm(
      `Delete "${clip.title}"? This cannot be undone.`,
    );

    if (!shouldDelete) return;

    try {
      await deleteDoc(doc(db, "clips", clip.id));

      if (selectedClip?.id === clip.id) {
        setSelectedClip(null);
      }

      setMessage("Clip deleted successfully.");
    } catch (error) {
      console.error("Could not delete clip:", error);
      setMessage("Could not delete the clip.");
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp?.toDate) return "Date unavailable";

    return timestamp.toDate().toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
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

      if (sortOrder === "oldest") {
        return firstTime - secondTime;
      }

      return secondTime - firstTime;
    });
  }, [clips, searchText, sortOrder, selectedDate]);

  const clearFilters = () => {
    setSearchText("");
    setSortOrder("newest");
    setSelectedDate("");
  };
  return (
    <main className="admin-clips-page">
      <div className="admin-clips-heading">
        <div>
          <p>CLIP MANAGEMENT</p>
          <h2>Published Clips</h2>
        </div>

        <div className="admin-clips-heading-actions">
          <span>{clips.length} clips</span>

          <button type="button" onClick={openCreateForm}>
            + Add New Clip
          </button>
        </div>
      </div>

      {message && !showForm && <p className="admin-clips-message">{message}</p>}
      <section className="admin-clips-filters">
        <label className="admin-clips-search">
          Search clips
          <input
            type="search"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Search title, description or platform"
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
          Clear filters
        </button>
      </section>

      {clips.length === 0 ? (
        <section className="admin-clips-empty">
          <h3>No clips have been published</h3>
          <p>Add a YouTube, Vimeo, or direct video link.</p>

          <button type="button" onClick={openCreateForm}>
            Add New Clip
          </button>
        </section>
      ) : (
        <>
          {visibleClips.length === 0 ? (
            <section className="admin-clips-no-results">
              <h3>No matching clips</h3>
              <p>Try another keyword or remove the date filter.</p>

              <button type="button" onClick={clearFilters}>
                Clear filters
              </button>
            </section>
          ) : (
            <section className="admin-clip-grid">
              {visibleClips.map((clip) => (
                <article
                  className="admin-clip-card"
                  key={clip.id}
                  role="button"
                  tabIndex="0"
                  onClick={() => openClipDetails(clip)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      openClipDetails(clip);
                    }
                  }}
                >
                  <div className="admin-clip-thumbnail">
                    <img
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

                    <span className="admin-clip-play-icon">▶</span>

                    {!clip.published && (
                      <span className="admin-clip-draft">Draft</span>
                    )}
                  </div>

                  <div className="admin-clip-card-body">
                    <div className="admin-clip-card-top">
                      <span>{clip.platform}</span>

                      <time>{formatDate(clip.createdAt)}</time>
                    </div>

                    <h3>{clip.title}</h3>

                    <p>{clip.description || "No description provided."}</p>

                    <div className="admin-clip-card-actions">
                      <button
                        className="edit-clip-button"
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          openUpdateForm(clip);
                        }}
                      >
                        Update
                      </button>

                      <button
                        className="delete-clip-button"
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          deleteClip(clip);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </section>
          )}
        </>
      )}

      {selectedClip && (
        <div className="admin-clips-modal" onClick={closeClipDetails}>
          <article
            className="admin-clip-detail-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="admin-clips-modal-close"
              type="button"
              onClick={closeClipDetails}
              aria-label="Close clip details"
            >
              ×
            </button>

            <div className="admin-clip-detail-video">
              {selectedClip.platform === "direct" ? (
                <video controls src={selectedClip.embedUrl}>
                  Your browser does not support video playback.
                </video>
              ) : (
                <iframe
                  src={selectedClip.embedUrl}
                  title={selectedClip.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>

            <div className="admin-clip-detail-content">
              <div className="admin-clip-detail-meta">
                <span>{selectedClip.platform}</span>

                <time>{formatDate(selectedClip.createdAt)}</time>
              </div>

              <h2>{selectedClip.title}</h2>

              <p>
                {selectedClip.description ||
                  "No description was provided for this clip."}
              </p>

              <div className="admin-clip-detail-status">
                Status:{" "}
                <strong>
                  {selectedClip.published ? "Published" : "Draft"}
                </strong>
              </div>

              <div className="admin-clip-detail-actions">
                <a
                  href={selectedClip.originalUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open original video
                </a>

                <button
                  type="button"
                  onClick={() => {
                    closeClipDetails();
                    openUpdateForm(selectedClip);
                  }}
                >
                  Update Clip
                </button>

                <button
                  className="delete-clip-button"
                  type="button"
                  onClick={() => {
                    deleteClip(selectedClip);
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </article>
        </div>
      )}

      {showForm && (
        <div className="admin-clips-modal" onClick={closeForm}>
          <section
            className="admin-clips-modal-content"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="admin-clips-modal-close"
              type="button"
              onClick={closeForm}
              aria-label="Close clip form"
            >
              ×
            </button>

            <div className="admin-clips-form-heading">
              <p>{editingId ? "UPDATE CLIP" : "NEW CLIP"}</p>

              <h2>{editingId ? "Update Clip" : "Add New Clip"}</h2>
            </div>

            <form onSubmit={saveClip}>
              <label>
                Clip title
                <input
                  name="title"
                  type="text"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Best moments from the race"
                  required
                />
              </label>

              <label>
                Video source
                <select
                  name="platform"
                  value={form.platform}
                  onChange={handleChange}
                >
                  <option value="youtube">YouTube</option>
                  <option value="vimeo">Vimeo</option>
                  <option value="direct">Direct MP4 link</option>
                </select>
              </label>

              <label>
                Video link
                <input
                  name="originalUrl"
                  type="url"
                  value={form.originalUrl}
                  onChange={handleChange}
                  placeholder="https://youtube.com/watch?v=..."
                  required
                />
              </label>

              <label>
                Thumbnail image URL
                <input
                  name="thumbnailUrl"
                  type="url"
                  value={form.thumbnailUrl}
                  onChange={handleChange}
                  placeholder="Optional for YouTube"
                />
              </label>

              {form.thumbnailUrl && (
                <img
                  className="admin-clip-thumbnail-preview"
                  src={form.thumbnailUrl}
                  alt="Clip thumbnail preview"
                />
              )}

              <label>
                Description
                <textarea
                  name="description"
                  rows="4"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Write a short description"
                />
              </label>

              <label className="clip-published-checkbox">
                <input
                  name="published"
                  type="checkbox"
                  checked={form.published}
                  onChange={handleChange}
                />
                Visible on the public Clips page
              </label>

              {message && <p className="admin-clips-form-message">{message}</p>}

              <div className="admin-clips-form-actions">
                <button
                  className="admin-clips-cancel-button"
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button type="submit" disabled={saving}>
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Update Clip"
                      : "Publish Clip"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
};

export default AdminClips;
