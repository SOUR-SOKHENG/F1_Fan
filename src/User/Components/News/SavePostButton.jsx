import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { useAuth } from "../../../context/useAuth";

const SavePostButton = ({ postId }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      setIsSaved(false);
      return;
    }

    const savedPostRef = doc(db, "users", user.uid, "savedPosts", postId);

    const stopListening = onSnapshot(savedPostRef, (savedPostDocument) => {
      setIsSaved(savedPostDocument.exists());
    });

    return stopListening;
  }, [user, postId]);

  const handleSave = async () => {
    if (!user) {
      navigate("/Login");
      return;
    }

    const savedPostRef = doc(db, "users", user.uid, "savedPosts", postId);

    try {
      setSaving(true);

      if (isSaved) {
        await deleteDoc(savedPostRef);
      } else {
        await setDoc(savedPostRef, {
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
    <button
      className={isSaved ? "save-post-button saved" : "save-post-button"}
      type="button"
      onClick={handleSave}
      disabled={saving}
    >
      {isSaved ? "Saved" : "Save for later"}
    </button>
  );
};

export default SavePostButton;
