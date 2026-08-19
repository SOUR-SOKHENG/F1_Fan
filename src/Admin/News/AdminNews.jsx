import { useEffect, useMemo, useState } from "react";
import { addDoc, collection, deleteDoc, doc, onSnapshot, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../context/useAuth";
import "./AdminNews.css";

const emptyForm = {
  newsType: "article",
  title: "",
  summary: "",
  content: "",
  thumbnailUrl: "",
  sourceUrl: "",
};

function AdminNews() {
  const { user } = useAuth();

  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [posting, setPosting] = useState(false);
  const [message, setMessage] = useState("");
  const [searchText, setSearchText] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [selectedDate, setSelectedDate] = useState("");
  useEffect(() => {
    const stopListening = onSnapshot(
      collection(db, "posts"),
      (snapshot) => {
        const postList = snapshot.docs
          .map((postDocument) => ({
            id: postDocument.id,
            ...postDocument.data(),
          }))
          .sort((firstPost, secondPost) => {
            const firstTime = firstPost.createdAt?.toMillis?.() || 0;
            const secondTime = secondPost.createdAt?.toMillis?.() || 0;

            return secondTime - firstTime;
          });

        setPosts(postList);
      },
      (error) => {
        console.error("Could not load news:", error);
        setMessage("Could not load published news.");
      },
    );

    return stopListening;
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };
  const openNewsDetails = (post) => {
    setSelectedPost(post);
  };

  const closeNewsDetails = () => {
    setSelectedPost(null);
  };
  const openCreateForm = () => {
    setForm(emptyForm);
    setEditingId("");
    setMessage("");
    setShowForm(true);
  };

  const openUpdateForm = (post) => {
    setForm({
      newsType: post.type || "article",
      title: post.title || "",
      summary: post.summary || "",
      content: post.content || "",
      thumbnailUrl: post.thumbnailUrl || "",
      sourceUrl: post.sourceUrl || "",
    });

    setEditingId(post.id);
    setMessage("");
    setShowForm(true);
  };

  const closeForm = () => {
    if (posting) return;

    setShowForm(false);
    setEditingId("");
    setForm(emptyForm);
    setMessage("");
  };

  const saveNews = async (event) => {
    event.preventDefault();
    setMessage("");

    if (
      !form.title.trim() ||
      !form.summary.trim() ||
      !form.thumbnailUrl.trim()
    ) {
      setMessage("Please complete the title, summary, and thumbnail.");
      return;
    }

    if (form.newsType === "article" && !form.content.trim()) {
      setMessage("Please write the article content.");
      return;
    }

    if (form.newsType === "external" && !form.sourceUrl.trim()) {
      setMessage("Please provide the original news link.");
      return;
    }

    const postData = {
      type: form.newsType,
      title: form.title.trim(),
      summary: form.summary.trim(),
      content: form.newsType === "article" ? form.content.trim() : "",
      thumbnailUrl: form.thumbnailUrl.trim(),
      sourceUrl: form.newsType === "external" ? form.sourceUrl.trim() : "",
      published: true,
      updatedAt: serverTimestamp(),
    };

    try {
      setPosting(true);

      if (editingId) {
        await updateDoc(doc(db, "posts", editingId), postData);
      } else {
        await addDoc(collection(db, "posts"), {
          ...postData,
          authorId: user.uid,
          createdAt: serverTimestamp(),
        });
      }

      setShowForm(false);
      setEditingId("");
      setForm(emptyForm);

      setMessage(
        editingId
          ? "News updated successfully."
          : "News published successfully.",
      );
    } catch (error) {
      console.error("Could not save news:", error);
      setMessage("Could not save the news. Please try again.");
    } finally {
      setPosting(false);
    }
  };

  const deleteNews = async (post) => {
    const shouldDelete = window.confirm(`Delete "${post.title}"?`);

    if (!shouldDelete) return;

    try {
      await deleteDoc(doc(db, "posts", post.id));
      setMessage("News deleted successfully.");
    } catch (error) {
      console.error("Could not delete news:", error);
      setMessage("Could not delete the news post.");
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
  const getPostTime = (post) =>
    post.createdAt?.toMillis?.() || post.createdAt?.seconds * 1000 || 0;

  const getPostDateValue = (post) => {
    const time = getPostTime(post);

    if (!time) return "";

    const date = new Date(time);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const visiblePosts = useMemo(() => {
    const keywords = searchText
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);

    const filteredPosts = posts.filter((post) => {
      const searchableInformation = [
        post.title,
        post.summary,
        post.content,
        post.type,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        keywords.length === 0 ||
        keywords.every((keyword) => searchableInformation.includes(keyword));

      const matchesDate =
        !selectedDate || getPostDateValue(post) === selectedDate;

      return matchesSearch && matchesDate;
    });

    return [...filteredPosts].sort((firstPost, secondPost) => {
      const firstTime = getPostTime(firstPost);
      const secondTime = getPostTime(secondPost);

      return sortOrder === "oldest"
        ? firstTime - secondTime
        : secondTime - firstTime;
    });
  }, [posts, searchText, sortOrder, selectedDate]);

  const clearFilters = () => {
    setSearchText("");
    setSortOrder("newest");
    setSelectedDate("");
  };
  return (
    <main className="min-h-[75vh] w-full">
      <div className="mb-6 flex flex-col items-start justify-between gap-5 min-[761px]:flex-row min-[761px]:items-center">
        <div>
          <p className="mb-[5px] text-xs font-black tracking-[1.5px] text-[#e10600]">
            NEWS MANAGEMENT
          </p>
          <h2 className="m-0 text-[30px] text-[#191b20]">Published News</h2>
        </div>

        <div className="flex w-full flex-col items-stretch gap-[11px] min-[521px]:w-auto min-[521px]:flex-row min-[521px]:items-center">
          <span className="rounded-[18px] bg-[#202229] px-[13px] py-2 text-center text-xs font-extrabold text-white">
            {posts.length} news
          </span>

          <button className="cursor-pointer rounded-lg border-0 bg-[#e10600] px-4 py-2.5 font-extrabold text-white hover:bg-[#b80500]" type="button" onClick={openCreateForm}>
            + Add New News
          </button>
        </div>
      </div>

      {message && !showForm && <p className="mb-5 rounded-md border-l-4 border-[#e10600] bg-white px-[15px] py-3 text-gray-700">{message}</p>}
      <section className="mb-[27px] grid grid-cols-1 items-end gap-[13px] rounded-xl border border-gray-200 bg-white p-[18px] shadow-md min-[761px]:grid-cols-2 min-[1001px]:grid-cols-[minmax(240px,1fr)_180px_180px_auto]">
        <label className="text-xs font-extrabold text-gray-700">
          Search news
          <input className="mt-[7px] block w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 outline-none focus:border-[#e10600] focus:bg-white focus:ring-4 focus:ring-red-100" type="search" value={searchText} onChange={(event) => setSearchText(event.target.value)} placeholder="Search title, summary or article" />
        </label>

        <label className="text-xs font-extrabold text-gray-700">
          Sort news
          <select className="mt-[7px] block w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 outline-none focus:border-[#e10600] focus:bg-white focus:ring-4 focus:ring-red-100" value={sortOrder} onChange={(event) => setSortOrder(event.target.value)} >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </label>

        <label className="text-xs font-extrabold text-gray-700">
          Date added
          <input className="mt-[7px] block w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 outline-none focus:border-[#e10600] focus:bg-white focus:ring-4 focus:ring-red-100" type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} />
        </label>

        <button className="cursor-pointer rounded-lg border-0 bg-gray-200 px-[15px] py-2.5 font-extrabold text-gray-700 hover:bg-[#25272d] hover:text-white" type="button" onClick={clearFilters}>
          Clear filters
        </button>
      </section>
      {posts.length === 0 ? (
        <section className="admin-news-empty">
          <h3>No news has been published</h3>
          <p>Create the first news card for your platform.</p>

          <button type="button" onClick={openCreateForm}>
            Add New News
          </button>
        </section>
      ) : (
        <>
          {visiblePosts.length === 0 ? (
            <section className="admin-news-no-results">
              <h3>No matching news</h3>
              <p>Try another keyword or remove the date filter.</p>

              <button type="button" onClick={clearFilters}>
                Clear filters
              </button>
            </section>
          ) : (
            <section className="admin-news-grid">
              {visiblePosts.map((post) => (
                <article className="admin-news-card" key={post.id} role="button" tabIndex="0" onClick={() => openNewsDetails(post)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { openNewsDetails(post); } }} >
                  <img className="admin-news-card-thumbnail" src={post.thumbnailUrl} alt={post.title} />

                  <div className="admin-news-card-body">
                    <div className="admin-news-card-top">
                      <span>
                        {post.type === "external" ? "External" : "Article"}
                      </span>

                      <time>{formatDate(post.createdAt)}</time>
                    </div>

                    <h3>{post.title}</h3>
                    <p>{post.summary}</p>

                    <div className="admin-news-card-actions">
                      <button className="edit-news-btn" type="button" onClick={(event) => { event.stopPropagation(); openUpdateForm(post); }} >
                        Update
                      </button>

                      <button className="delete-news-btn" type="button" onClick={(event) => { event.stopPropagation(); deleteNews(post); }} >
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

      {selectedPost && (
        <div className="admin-news-modal" onClick={closeNewsDetails}>
          <article className="admin-news-detail-modal" onClick={(event) => event.stopPropagation()} >
            <button className="admin-news-modal-close" type="button" onClick={closeNewsDetails} aria-label="Close news details" >
              ×
            </button>

            <img className="admin-news-detail-image" src={selectedPost.thumbnailUrl} alt={selectedPost.title} />

            <div className="admin-news-detail-content">
              <div className="admin-news-detail-meta">
                <span>
                  {selectedPost.type === "external"
                    ? "External News"
                    : "F1 Article"}
                </span>

                <time>{formatDate(selectedPost.createdAt)}</time>
              </div>

              <h2>{selectedPost.title}</h2>
              <p className="admin-news-detail-summary">
                {selectedPost.summary}
              </p>

              {selectedPost.type === "article" && selectedPost.content && (
                <p className="admin-news-detail-article">
                  {selectedPost.content}
                </p>
              )}

              {selectedPost.type === "external" && selectedPost.sourceUrl && (
                <a className="admin-news-detail-link" href={selectedPost.sourceUrl} target="_blank" rel="noreferrer" >
                  Open original news
                </a>
              )}

              <div className="admin-news-detail-actions">
                <button type="button" onClick={() => { closeNewsDetails(); openUpdateForm(selectedPost); }} >
                  Update News
                </button>

                <button className="delete-news-btn" type="button" onClick={() => { deleteNews(selectedPost); closeNewsDetails(); }} >
                  Delete
                </button>
              </div>
            </div>
          </article>
        </div>
      )}
      {showForm && (
        <div className="admin-news-modal" onClick={closeForm}>
          <section className="admin-news-modal-content" onClick={(event) => event.stopPropagation()} >
            <button className="admin-news-modal-close" type="button" onClick={closeForm} aria-label="Close news form" >
              ×
            </button>

            <div className="admin-news-form-heading">
              <p>{editingId ? "UPDATE CONTENT" : "NEW CONTENT"}</p>

              <h2>{editingId ? "Update News" : "Add New News"}</h2>
            </div>

            <form onSubmit={saveNews}>
              <label>
                News type
                <select name="newsType" value={form.newsType} onChange={handleChange} >
                  <option value="article">Write an article</option>

                  <option value="external">Share external news</option>
                </select>
              </label>

              <label>
                Title
                <input name="title" type="text" value={form.title} onChange={handleChange} placeholder="Enter the news title" required />
              </label>

              <label>
                Short summary
                <textarea name="summary" value={form.summary} onChange={handleChange} placeholder="Write a short introduction" rows="3" required />
              </label>

              {form.newsType === "article" && (
                <label>
                  Article
                  <textarea name="content" value={form.content} onChange={handleChange} placeholder="Write the full article" rows="8" required />
                </label>
              )}

              {form.newsType === "external" && (
                <label>
                  Original news link
                  <input name="sourceUrl" type="url" value={form.sourceUrl} onChange={handleChange} placeholder="https://example.com/news" required />
                </label>
              )}

              <label>
                Thumbnail image URL
                <input name="thumbnailUrl" type="url" value={form.thumbnailUrl} onChange={handleChange} placeholder="https://example.com/image.jpg" required />
              </label>

              {form.thumbnailUrl && (
                <img className="admin-news-thumbnail-preview" src={form.thumbnailUrl} alt="News thumbnail preview" />
              )}

              {message && <p className="admin-news-form-message">{message}</p>}

              <div className="admin-news-form-actions">
                <button className="admin-news-cancel-btn" type="button" onClick={closeForm} disabled={posting} >
                  Cancel
                </button>

                <button type="submit" disabled={posting}>
                  {posting
                    ? "Saving..."
                    : editingId
                      ? "Update News"
                      : "Publish News"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}

export default AdminNews;
