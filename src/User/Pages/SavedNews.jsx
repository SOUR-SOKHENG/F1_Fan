import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../context/useAuth";
import SavePostButton from "../Components/News/SavePostButton";
import "../Css/News.css";

const SavedNews = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [savedPosts, setSavedPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user) {
      navigate("/Login");
      return;
    }

    const savedPostsRef = collection(
      db,
      "users",
      user.uid,
      "savedPosts"
    );

    const stopListening = onSnapshot(
      savedPostsRef,
      async (snapshot) => {
        try {
          const postRequests = snapshot.docs.map(async (savedDocument) => {
            const postDocument = await getDoc(
              doc(db, "posts", savedDocument.id)
            );

            if (!postDocument.exists()) {
              return null;
            }

            return {
              id: postDocument.id,
              ...postDocument.data(),
              savedAt: savedDocument.data().savedAt,
            };
          });

          const postList = await Promise.all(postRequests);

          const availablePosts = postList
            .filter((post) => post !== null)
            .sort((firstPost, secondPost) => {
              const firstTime = firstPost.savedAt?.seconds || 0;
              const secondTime = secondPost.savedAt?.seconds || 0;

              return secondTime - firstTime;
            });

          setSavedPosts(availablePosts);
        } catch (error) {
          console.error("Could not load saved news:", error);
        } finally {
          setLoadingPosts(false);
        }
      }
    );

    return stopListening;
  }, [user, loading, navigate]);

  if (loading || loadingPosts) {
    return <p>Loading saved news...</p>;
  }

  return (
    <main className="news-page">
      <h1>Saved News</h1>

      {savedPosts.length === 0 && (
        <p>You have not saved any news yet.</p>
      )}

      <section className="news-list">
        <div className="news-grid">
          {savedPosts.map((post) => (
            <article className="news-card" key={post.id}>
              <img
                className="news-thumbnail"
                src={post.thumbnailUrl}
                alt={post.title}
              />

              <div className="news-card-content">
                <span className="news-type">
                  {post.type === "external"
                    ? "External news"
                    : "F1 article"}
                </span>

                <h3>{post.title}</h3>
                <p>{post.summary}</p>

                {post.type === "article" && (
                  <details>
                    <summary>Read article</summary>
                    <p className="news-article-text">
                      {post.content}
                    </p>
                  </details>
                )}

                {post.type === "external" && (
                  <a
                    href={post.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Read original news
                  </a>
                )}

                <SavePostButton postId={post.id} />
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
};

export default SavedNews;