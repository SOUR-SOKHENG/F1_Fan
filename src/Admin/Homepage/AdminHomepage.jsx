import { useEffect, useState } from "react";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";

function AdminHomepage() {
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
    return <p className="py-10 text-center text-gray-500">Loading homepage settings...</p>;
  }

  return (
    <section className="w-full">
      <div className="mb-[25px] flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
        <div>
          <p className="mb-[5px] text-xs font-extrabold tracking-[1.5px] text-[#e10600]">
            WEBSITE CONTENT
          </p>
          <h2 className="m-0 text-[30px] text-[#17181c]">Manage Homepage</h2>
        </div>

        <a className="rounded-lg bg-[#202229] px-4 py-2.5 text-sm font-bold text-white no-underline hover:bg-[#e10600]" href="/F1_Fan/Home" target="_blank" rel="noreferrer">
          Preview homepage
        </a>
      </div>

      <form className="grid gap-[22px]" onSubmit={handleSave}>
        <div className="grid gap-[11px] rounded-[14px] border border-gray-200 bg-white p-[18px] shadow-md sm:p-6">
          <h3 className="m-0 text-xl text-[#1b1d22]">Announcement</h3>
          <p className="mb-[5px] text-sm text-gray-500">
            Leave this empty when you do not want an announcement on the
            homepage.
          </p>

          <label className="mt-[7px] text-sm font-bold text-gray-700" htmlFor="announcement">Announcement message</label>
          <input className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3.5 py-3 outline-none focus:border-[#e10600] focus:bg-white focus:ring-4 focus:ring-red-100" id="announcement" name="announcement" type="text" value={homepage.announcement} onChange={handleChange} placeholder="Example: The next race begins this Sunday" />
        </div>
        <div className="grid gap-[11px] rounded-[14px] border border-gray-200 bg-white p-[18px] shadow-md sm:p-6">
          <h3 className="m-0 text-xl text-[#1b1d22]">Carousel Images</h3>
          <p className="mb-[5px] text-sm text-gray-500">Paste three direct image links for the homepage carousel.</p>

          <label className="mt-[7px] text-sm font-bold text-gray-700" htmlFor="firstImageUrl">First image URL</label>
          <input className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3.5 py-3 outline-none focus:border-[#e10600] focus:bg-white focus:ring-4 focus:ring-red-100" id="firstImageUrl" name="firstImageUrl" type="url" value={homepage.firstImageUrl} onChange={handleChange} placeholder="https://example.com/image-one.jpg" />

          {homepage.firstImageUrl && (
            <img className="mt-1 h-[170px] w-full max-w-[520px] rounded-[10px] bg-gray-200 object-cover sm:h-[220px]" src={homepage.firstImageUrl} alt="First carousel preview" />
          )}

          <label className="mt-[7px] text-sm font-bold text-gray-700" htmlFor="secondImageUrl">Second image URL</label>
          <input className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3.5 py-3 outline-none focus:border-[#e10600] focus:bg-white focus:ring-4 focus:ring-red-100" id="secondImageUrl" name="secondImageUrl" type="url" value={homepage.secondImageUrl} onChange={handleChange} placeholder="https://example.com/image-two.jpg" />

          {homepage.secondImageUrl && (
            <img className="mt-1 h-[170px] w-full max-w-[520px] rounded-[10px] bg-gray-200 object-cover sm:h-[220px]" src={homepage.secondImageUrl} alt="Second carousel preview" />
          )}

          <label className="mt-[7px] text-sm font-bold text-gray-700" htmlFor="thirdImageUrl">Third image URL</label>
          <input className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3.5 py-3 outline-none focus:border-[#e10600] focus:bg-white focus:ring-4 focus:ring-red-100" id="thirdImageUrl" name="thirdImageUrl" type="url" value={homepage.thirdImageUrl} onChange={handleChange} placeholder="https://example.com/image-three.jpg" />

          {homepage.thirdImageUrl && (
            <img className="mt-1 h-[170px] w-full max-w-[520px] rounded-[10px] bg-gray-200 object-cover sm:h-[220px]" src={homepage.thirdImageUrl} alt="Third carousel preview" />
          )}
        </div>

        {message && <p className="m-0 rounded-md border-l-4 border-[#e10600] bg-white px-4 py-[13px] text-gray-700">{message}</p>}

        <button className="w-fit rounded-lg border-0 bg-[#e10600] px-6 py-3 text-[15px] font-extrabold text-white hover:bg-[#b80500] disabled:cursor-not-allowed disabled:opacity-65" type="submit" disabled={saving} >
          {saving ? "Saving..." : "Save homepage"}
        </button>
      </form>
    </section>
  );
}

export default AdminHomepage;
