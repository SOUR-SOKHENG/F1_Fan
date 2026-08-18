import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";
import "../Css/Overall.css";
import "../Css/About.css";

const About = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadGuideContent = async () => {
      try {
        const categorySnapshot = await getDocs(
          collection(db, "guideCategories")
        );

        const categoryList = await Promise.all(
          categorySnapshot.docs.map(async (categoryDocument) => {
            const cardsSnapshot = await getDocs(
              collection(
                db,
                "guideCategories",
                categoryDocument.id,
                "cards"
              )
            );

            const cards = cardsSnapshot.docs
              .map((cardDocument) => ({
                id: cardDocument.id,
                ...cardDocument.data(),
              }))
              .sort(
                (firstCard, secondCard) =>
                  Number(firstCard.order) - Number(secondCard.order)
              );

            return {
              id: categoryDocument.id,
              ...categoryDocument.data(),
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

    loadGuideContent();
  }, []);

  return (
    <div className="Big-box guides-page">
      <article className="container-fluid text-center article1">
        <span>
          <h1>
            WHAT IS{" "}
            <span className="text-red-500">FORMULA 1</span>?
          </h1>
        </span>

        <p className="w-1/2 sm:w-full mx-auto text-center">
          Welcome to the pinnacle of motorsport. 11 teams, 22 elite drivers,
          and cutting-edge open-wheel engineering reaching speeds over 350
          km/h on a straight line and over 200 km/h in corners in a global
          battle for ultimate glory.
        </p>
      </article>

      {loading && (
        <p className="guide-loading-message">Loading guides...</p>
      )}

      {error && <p className="guide-loading-message">{error}</p>}

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
                  className={
                    card.type === "video"
                      ? "box guide-card video-guide-card"
                      : "box guide-card text-guide-card"
                  }
                  key={card.id}
                >
                  {card.type === "video" && card.embedUrl && (
                    <iframe
                      src={card.embedUrl}
                      title={card.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    />
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
};

export default About;