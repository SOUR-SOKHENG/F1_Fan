import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import "./AdminHomepage.css";

const AdminHomepage = () => {
  const [homepage, setHomepage] = useState({
    announcement: "",
    welcomeTitle: "",
    welcomeText: "",
    firstImageUrl: "",
    secondImageUrl: "",
    thirdImageUrl: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadHomepage = async () => {
      try {
        const homepageReference = doc(db, "siteContent", "home");
        const homepageSnapshot = await getDoc(homepageReference);

        if (homepageSnapshot.exists()) {
          setHomepage((currentHomepage) => ({
            ...currentHomepage,
            ...homepageSnapshot.data(),
          }));
        }
      } catch (error) {
        console.error("Unable to load homepage content:", error);
        setMessage("Could not load the homepage content.");
      } finally {
        setLoading(false);
      }
    };

    loadHomepage();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setHomepage((currentHomepage) => ({
      ...currentHomepage,
      [name]: value,
    }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      await setDoc(
        doc(db, "siteContent", "home"),
        {
          ...homepage,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      setMessage("Homepage content saved successfully.");
    } catch (error) {
      console.error("Unable to save homepage content:", error);
      setMessage("Could not save the homepage content.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p>Loading homepage settings...</p>;
  }

  return (
    <section className="admin-homepage">
      <div className="admin-homepage-heading">
        <div>
          <p>WEBSITE CONTENT</p>
          <h2>Manage Homepage</h2>
        </div>

        <a href="/F1_Fan/Home" target="_blank" rel="noreferrer">
          Preview homepage
        </a>
      </div>

      <form className="homepage-form" onSubmit={handleSave}>
        <div className="homepage-form-section">
          <h3>Announcement</h3>
          <p>
            Leave this empty when you do not want an announcement on the
            homepage.
          </p>

          <label htmlFor="announcement">Announcement message</label>
          <input
            id="announcement"
            name="announcement"
            type="text"
            value={homepage.announcement}
            onChange={handleChange}
            placeholder="Example: The next race begins this Sunday"
          />
        </div>
        <div className="homepage-form-section">
          <h3>Carousel Images</h3>
          <p>Paste three direct image links for the homepage carousel.</p>

          <label htmlFor="firstImageUrl">First image URL</label>
          <input
            id="firstImageUrl"
            name="firstImageUrl"
            type="url"
            value={homepage.firstImageUrl}
            onChange={handleChange}
            placeholder="https://example.com/image-one.jpg"
          />

          {homepage.firstImageUrl && (
            <img
              className="homepage-image-preview"
              src={homepage.firstImageUrl}
              alt="First carousel preview"
            />
          )}

          <label htmlFor="secondImageUrl">Second image URL</label>
          <input
            id="secondImageUrl"
            name="secondImageUrl"
            type="url"
            value={homepage.secondImageUrl}
            onChange={handleChange}
            placeholder="https://example.com/image-two.jpg"
          />

          {homepage.secondImageUrl && (
            <img
              className="homepage-image-preview"
              src={homepage.secondImageUrl}
              alt="Second carousel preview"
            />
          )}

          <label htmlFor="thirdImageUrl">Third image URL</label>
          <input
            id="thirdImageUrl"
            name="thirdImageUrl"
            type="url"
            value={homepage.thirdImageUrl}
            onChange={handleChange}
            placeholder="https://example.com/image-three.jpg"
          />

          {homepage.thirdImageUrl && (
            <img
              className="homepage-image-preview"
              src={homepage.thirdImageUrl}
              alt="Third carousel preview"
            />
          )}
        </div>

        {message && <p className="homepage-save-message">{message}</p>}

        <button
          className="homepage-save-button"
          type="submit"
          disabled={saving}
        >
          {saving ? "Saving..." : "Save homepage"}
        </button>
      </form>
    </section>
  );
};

export default AdminHomepage;