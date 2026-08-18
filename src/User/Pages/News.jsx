import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../context/useAuth";
import SavePostButton from "../Components/News/SavePostButton";
import "../Css/News.css";

const News = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [likesByPost, setLikesByPost] = useState({});

  const handleShare = async (post) => {
    const articleLink =
      post.type === "external"
        ? post.sourceUrl
        : `${window.location.origin}${window.location.pathname}#post-${post.id}`;

    const shareData = {
      title: post.title,
      text: post.summary,
      url: articleLink,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(articleLink);
        alert("News link copied.");
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Could not share news:", error);
        alert("Could not share this news post.");
      }
    }
  };
  useEffect(() => {
    const postsQuery = query(
      collection(db, "posts"),
      where("published", "==", true),
    );

    const stopListening = onSnapshot(
      postsQuery,
      (snapshot) => {
        const postList = snapshot.docs.map((postDocument) => ({
          id: postDocument.id,
          ...postDocument.data(),
        }));

        postList.sort((firstPost, secondPost) => {
          const firstTime = firstPost.createdAt?.seconds || 0;
          const secondTime = secondPost.createdAt?.seconds || 0;

          return secondTime - firstTime;
        });

        setPosts(postList);
        setLoadingPosts(false);
      },
      (error) => {
        console.error("Could not load news:", error);
        setLoadingPosts(false);
      },
    );

    return stopListening;
  }, []);
  useEffect(() => {
    if (posts.length === 0) {
      setLikesByPost({});
      return;
    }

    const stopListeners = posts.map((post) => {
      const likesRef = collection(db, "posts", post.id, "likes");

      return onSnapshot(likesRef, (snapshot) => {
        const likedByCurrentUser = user
          ? snapshot.docs.some((likeDocument) => likeDocument.id === user.uid)
          : false;

        setLikesByPost((currentLikes) => ({
          ...currentLikes,
          [post.id]: {
            count: snapshot.size,
            liked: likedByCurrentUser,
          },
        }));
      });
    });

    return () => {
      stopListeners.forEach((stopListening) => stopListening());
    };
  }, [posts, user]);
  const handleLike = async (postId) => {
    if (!user) {
      navigate("/Login");
      return;
    }

    const likeRef = doc(db, "posts", postId, "likes", user.uid);
    const alreadyLiked = likesByPost[postId]?.liked;

    try {
      if (alreadyLiked) {
        await deleteDoc(likeRef);
      } else {
        await setDoc(likeRef, {
          userId: user.uid,
          likedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error("Could not update like:", error);
      alert("Could not update your like.");
    }
  };
  return (
    <main className="news-page">
      <h1>F1 News</h1>

      <section className="news-list">
        <h2>Latest News</h2>

        {loadingPosts && <p>Loading latest news...</p>}

        {!loadingPosts && posts.length === 0 && (
          <p>No news has been published yet.</p>
        )}

        <div className="news-grid">
          {posts.map((post) => (
            <article className="news-card" id={`post-${post.id}`} key={post.id}>
              <img
                className="news-thumbnail"
                src={post.thumbnailUrl}
                alt={post.title}
              />

              <div className="news-card-content">
                <span className="news-type">
                  {post.type === "external" ? "External news" : "F1 article"}
                </span>

                <h3>{post.title}</h3>
                <p>{post.summary}</p>

                {post.type === "article" && (
                  <details>
                    <summary>Read article</summary>
                    <p className="news-article-text">{post.content}</p>
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

                <div className="news-user-actions">
                  <SavePostButton postId={post.id} />
                  <button
                    className="share-post-button"
                    type="button"
                    onClick={() => handleShare(post)}
                  >
                    Share
                  </button>
                  <button
                    className={
                      likesByPost[post.id]?.liked
                        ? "like-post-button liked"
                        : "like-post-button"
                    }
                    type="button"
                    onClick={() => handleLike(post.id)}>
                    Like · {likesByPost[post.id]?.count || 0}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
};

export default News;
