import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteDoc, doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { useAuth } from "../../../context/useAuth";

function SavePostBtn({ postId }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      setIsSaved(false);
      return;
    }

    const savedRef = doc(db, "users", user.uid, "savedPosts", postId);

    const stop = onSnapshot(savedRef, (savedDoc) => {
      setIsSaved(savedDoc.exists());
    });

    return stop;
  }, [user, postId]);

  const handleSave = async () => {
    if (!user) {
      navigate("/Login");
      return;
    }

    const savedRef = doc(db, "users", user.uid, "savedPosts", postId);

    try {
      setSaving(true);

      if (isSaved) {
        await deleteDoc(savedRef);
      } else {
        await setDoc(savedRef, {
          postId,
          savedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error("Could not update saved news:", error);
      alert("Could not save this news post.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <button className={isSaved ? "save-post-btn saved" : "save-post-btn"} type="button" onClick={handleSave} disabled={saving} >
      {isSaved ? "Saved" : "Save for later"}
    </button>
  );
}

export default SavePostBtn;
