import { deleteDoc, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";

function AdminNewsActions({ post }) {
  const handleEditPost = async () => {
    const newTitle = window.prompt("Edit the news title:", post.title);

    if (newTitle === null) {
      return;
    }

    const newSummary = window.prompt(
      "Edit the short summary:",
      post.summary
    );

    if (newSummary === null) {
      return;
    }

    if (!newTitle.trim() || !newSummary.trim()) {
      alert("The title and summary cannot be empty.");
      return;
    }

    try {
      await updateDoc(doc(db, "posts", post.id), {
        title: newTitle.trim(),
        summary: newSummary.trim(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Could not update news:", error);
      alert("Could not update the news post.");
    }
  };

  const handleDeletePost = async () => {
    const shouldDelete = window.confirm(
      "Are you sure you want to delete this news post?"
    );

    if (!shouldDelete) {
      return;
    }

    try {
      await deleteDoc(doc(db, "posts", post.id));
    } catch (error) {
      console.error("Could not delete news:", error);
      alert("Could not delete the news post.");
    }
  };

  return (
    <div className="news-admin-actions">
      <button className="edit-news-btn" type="button" onClick={handleEditPost} >
        Edit
      </button>

      <button className="delete-news-btn" type="button" onClick={handleDeletePost} >
        Delete
      </button>
    </div>
  );
}

export default AdminNewsActions;
