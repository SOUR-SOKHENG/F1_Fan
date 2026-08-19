import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";
import "../Css/Overall.css";
import "../Css/About.css";

function About() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadGuides = async () => {
      try {
        const categorySnap = await getDocs(
          collection(db, "guideCategories")
        );
        const categoryList = await Promise.all(
          categorySnap.docs.map(async (categoryDoc) => {
            const cardsSnap = await getDocs(
              collection(
                db,
                "guideCategories",
                categoryDoc.id,
                "cards"
              )
            );

            const cards = cardsSnap.docs
              .map((cardDoc) => ({
                id: cardDoc.id,
                ...cardDoc.data(),
                }))
              .sort(
                (firstCard, secondCard) =>
                  Number(firstCard.order) - Number(secondCard.order)
                );
            return {
              id: categoryDoc.id,
              ...categoryDoc.data(),
              cards,
            };
          })
        );
        categoryList.sort(
          (firstCategory, secondCategory) =>
            Number(firstCategory.order) - Number(secondCategory.order)
        );
        setCategories(categoryList);
        setError("");
      } catch (requestError) {
        console.error("Unable to load guide content:", requestError);
        setError("Could not load the F1 guides.");
      } finally {
        setLoading(false);
      }
    };
    loadGuides();
  }, []);
  return (
    <div className="min-h-screen bg-[#f4f5f8] pb-[70px]">
      <article className="container-fluid px-5 pb-6 pt-10 text-center sm:px-[30px] sm:pb-[35px] sm:pt-[55px]">
        <h1 className="mb-[18px] text-[clamp(34px,5vw,62px)] font-black italic text-[#20232a]">
          WHAT IS <span className="text-[#e10600]">FORMULA 1</span>?
        </h1>
        <p className="mx-auto w-full max-w-[1100px] text-center text-base leading-relaxed text-[#292c33] sm:text-lg">
          Welcome to the pinnacle of motorsport. 11 teams, 22 elite drivers,
          and cutting-edge open-wheel engineering reaching speeds over 350
          km/h on a straight line and over 200 km/h in corners in a global
          battle for ultimate glory.
        </p>
      </article>
      {loading && (
        <p className="px-5 py-[60px] text-center text-gray-600">
          Loading guides...
        </p>
      )}
      {error && (
        <p className="px-5 py-[60px] text-center text-gray-600">{error}</p>
      )}
      {!loading &&
        !error &&
        categories.map((category) => (
          <div className="dynamic-guide-category" key={category.id}>
            <article className="Title-section mt-5">
              <h2>{category.title}</h2>
              <p>{category.description}</p>
            </article>
            <section
              className={
                category.layout === "slider"
                  ? "container-fluid guide-cards guide-slider"
                  : "container-fluid guide-cards guide-grid"
              }
            >
              {category.cards.map((card) => (
                <div
                  key={card.id}
                  className={
                    card.type === "video"
                      ? "box guide-card video-guide-card"
                      : "box guide-card text-guide-card"
                  }
                >
                  {card.type === "video" && card.embedUrl && (
                    <iframe src={card.embedUrl} title={card.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen />
                  )}

                  <div className="guide-card-content">
                    {card.label && (
                      <p className="guide-card-label">{card.label}</p>
                    )}

                    <h3>{card.title}</h3>

                    {card.description && <p>{card.description}</p>}
                  </div>
                </div>
              ))}
            </section>
          </div>
        ))}
    </div>
  );
}

export default About;
