import { useCallback, useEffect, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import "./AdminGuides.css";

const emptyCategory = {
  title: "",
  description: "",
  layout: "grid",
  order: 1,
};

const emptyCard = {
  label: "",
  title: "",
  description: "",
  type: "text",
  videoUrl: "",
  order: 1,
};

const existingGuideCategories = [
  {
    title: "THE GRAND PRIX FORMAT",
    description:
      "Every Grand Prix takes place over a high-stakes three-day weekend event.",
    layout: "grid",
    order: 1,
    cards: [
      {
        label: "DAY 1",
        title: "FRIDAY: PRACTICE",
        description:
          "Two practice sessions (FP1 and FP2) allow teams to dial in setups, test tyre compounds and analyse data on track grip.",
        type: "text",
        videoUrl: "",
        order: 1,
      },
      {
        label: "DAY 2",
        title: "SATURDAY: QUALIFYING",
        description:
          "A thrilling three-stage knockout session (Q1, Q2 and Q3). Drivers push for the absolute fastest lap to claim pole position for Sunday's starting grid.",
        type: "text",
        videoUrl: "",
        order: 2,
      },
      {
        label: "DAY 3",
        title: "SUNDAY: THE RACE",
        description:
          "The main event. Lights out and wheel-to-wheel combat across roughly 5.15 kilometres or 3.2 miles per lap. A race usually has around 50 to 100 laps and requires split-second pit-stop strategies.",
        type: "text",
        videoUrl: "",
        order: 3,
      },
    ],
  },
  {
    title: "F1 BASICS EXPLAINED",
    description:
      "Swipe or scroll right to watch beginner guides directly from the track.",
    layout: "slider",
    order: 2,
    cards: [
      {
        label: "",
        title: "2026 Regulations Guide",
        description: "",
        type: "video",
        videoUrl: "https://www.youtube.com/watch?v=eksv7obPEsw",
        order: 1,
      },
      {
        label: "",
        title: "How Pit Stops Work",
        description: "",
        type: "video",
        videoUrl: "https://www.youtube.com/watch?v=E__Yxf21EV8",
        order: 2,
      },
      {
        label: "",
        title: "Understanding Qualifying",
        description: "",
        type: "video",
        videoUrl: "https://www.youtube.com/watch?v=drEjTIp-8V0",
        order: 3,
      },
      {
        label: "",
        title: "Understanding Sprint Race",
        description: "",
        type: "video",
        videoUrl: "https://www.youtube.com/watch?v=VIFCbG2vAlU",
        order: 4,
      },
      {
        label: "",
        title: "Tyre Compounds Explained",
        description: "",
        type: "video",
        videoUrl: "https://www.youtube.com/watch?v=YOha7BudrdQ",
        order: 5,
      },
    ],
  },
  {
    title: "CHAMPIONS",
    description: "One season, two championships.",
    layout: "grid",
    order: 3,
    cards: [
      {
        label: "",
        title: "DRIVERS' CHAMPIONSHIP",
        description:
          "Awarded to the individual driver who scores the highest total points throughout the Grand Prix calendar year. Points are earned by finishing in the top ten on race day, with 25 points awarded to the race winner.",
        type: "text",
        videoUrl: "",
        order: 1,
      },
      {
        label: "",
        title: "CONSTRUCTORS' CHAMPIONSHIP",
        description:
          "Awarded to the manufacturing team that scores the highest combined points from both of its active cars. This championship also decides the distribution of prize money between teams.",
        type: "text",
        videoUrl: "",
        order: 2,
      },
    ],
  },
  {
    title: "ESSENTIAL TRACK SLANG",
    description:
      "Common phrases heard in radio communication between a driver and their race engineer.",
    layout: "grid",
    order: 4,
    cards: [
      {
        label: "",
        title: "De-Rate or Clipping",
        description:
          "Because the new regulations require more power to come from the electrical system, the battery can run low and cause the car to lose power and speed. This can make it vulnerable to a car behind with more available energy.",
        type: "text",
        videoUrl: "",
        order: 1,
      },
      {
        label: "",
        title: "Box, Box, Box",
        description:
          "The race engineer is telling the driver to enter the pit lane for a tyre change, repairs or another adjustment.",
        type: "text",
        videoUrl: "",
        order: 2,
      },
      {
        label: "",
        title: "Use Overtake",
        description:
          "The driver is instructed to use an additional electrical power mode. It can be used to attack the car ahead or defend against a car behind.",
        type: "text",
        videoUrl: "",
        order: 3,
      },
      {
        label: "",
        title: "Charge Level Critical",
        description:
          "The battery charge is too low. The race engineer may tell the driver to harvest or recharge by lifting off the accelerator earlier and recovering energy under braking.",
        type: "text",
        videoUrl: "",
        order: 4,
      },
      {
        label: "",
        title: "Confirm Straight Mode / Corner Mode",
        description:
          "This refers to active aerodynamic systems. Straight mode reduces drag on a straight, while corner mode returns the wings to a configuration that produces more downforce for turning.",
        type: "text",
        videoUrl: "",
        order: 5,
      },
    ],
  },
];

const getYouTubeEmbedUrl = (url) => {
  if (!url) return "";

  try {
    const parsedUrl = new URL(url);
    let videoId = "";

    if (parsedUrl.hostname.includes("youtu.be")) {
      videoId = parsedUrl.pathname.slice(1);
    } else if (parsedUrl.pathname.includes("/embed/")) {
      videoId = parsedUrl.pathname.split("/embed/")[1];
    } else if (parsedUrl.pathname.includes("/shorts/")) {
      videoId = parsedUrl.pathname.split("/shorts/")[1];
    } else {
      videoId = parsedUrl.searchParams.get("v");
    }

    return videoId
      ? `https://www.youtube.com/embed/${videoId.split("?")[0]}`
      : "";
  } catch {
    return "";
  }
};

const AdminGuides = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [categoryForm, setCategoryForm] = useState(emptyCategory);
  const [cardForm, setCardForm] = useState(emptyCard);
  const [editingCategoryId, setEditingCategoryId] = useState("");
  const [editingCardId, setEditingCardId] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loadCategories = useCallback(async () => {
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
            .sort((firstCard, secondCard) => {
              return Number(firstCard.order) - Number(secondCard.order);
            });

          return {
            id: categoryDocument.id,
            ...categoryDocument.data(),
            cards,
          };
        })
      );

      categoryList.sort((firstCategory, secondCategory) => {
        return Number(firstCategory.order) - Number(secondCategory.order);
      });

      setCategories(categoryList);
    } catch (error) {
      console.error("Unable to load guide categories:", error);
      setMessage("Could not load the guide categories.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleCategoryChange = (event) => {
    const { name, value } = event.target;

    setCategoryForm((currentForm) => ({
      ...currentForm,
      [name]: name === "order" ? Number(value) : value,
    }));
  };

  const handleCardChange = (event) => {
    const { name, value } = event.target;

    setCardForm((currentForm) => ({
      ...currentForm,
      [name]: name === "order" ? Number(value) : value,
    }));
  };

  const resetCategoryForm = () => {
    setCategoryForm(emptyCategory);
    setEditingCategoryId("");
  };

  const resetCardForm = () => {
    setCardForm(emptyCard);
    setEditingCardId("");
  };

  const saveCategory = async (event) => {
    event.preventDefault();
    setMessage("");

    try {
      if (editingCategoryId) {
        await updateDoc(
          doc(db, "guideCategories", editingCategoryId),
          {
            ...categoryForm,
            updatedAt: serverTimestamp(),
          }
        );

        setMessage("Category updated successfully.");
      } else {
        await addDoc(collection(db, "guideCategories"), {
          ...categoryForm,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        setMessage("Category added successfully.");
      }

      resetCategoryForm();
      await loadCategories();
    } catch (error) {
      console.error("Unable to save category:", error);
      setMessage("Could not save the category.");
    }
  };

  const editCategory = (category) => {
    setEditingCategoryId(category.id);
    setCategoryForm({
      title: category.title || "",
      description: category.description || "",
      layout: category.layout || "grid",
      order: Number(category.order) || 1,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const removeCategory = async (category) => {
    const shouldDelete = window.confirm(
      `Delete "${category.title}" and all of its cards?`
    );

    if (!shouldDelete) return;

    try {
      const batch = writeBatch(db);

      category.cards.forEach((card) => {
        batch.delete(
          doc(
            db,
            "guideCategories",
            category.id,
            "cards",
            card.id
          )
        );
      });

      batch.delete(doc(db, "guideCategories", category.id));
      await batch.commit();

      if (selectedCategoryId === category.id) {
        setSelectedCategoryId("");
        resetCardForm();
      }

      setMessage("Category deleted successfully.");
      await loadCategories();
    } catch (error) {
      console.error("Unable to delete category:", error);
      setMessage("Could not delete the category.");
    }
  };

  const saveCard = async (event) => {
    event.preventDefault();

    if (!selectedCategoryId) {
      setMessage("Select a category before adding a card.");
      return;
    }

    setMessage("");

    const cardData = {
      ...cardForm,
      videoUrl:
        cardForm.type === "video" ? cardForm.videoUrl : "",
      embedUrl:
        cardForm.type === "video"
          ? getYouTubeEmbedUrl(cardForm.videoUrl)
          : "",
      updatedAt: serverTimestamp(),
    };

    try {
      if (editingCardId) {
        await updateDoc(
          doc(
            db,
            "guideCategories",
            selectedCategoryId,
            "cards",
            editingCardId
          ),
          cardData
        );

        setMessage("Card updated successfully.");
      } else {
        await addDoc(
          collection(
            db,
            "guideCategories",
            selectedCategoryId,
            "cards"
          ),
          {
            ...cardData,
            createdAt: serverTimestamp(),
          }
        );

        setMessage("Card added successfully.");
      }

      resetCardForm();
      await loadCategories();
    } catch (error) {
      console.error("Unable to save card:", error);
      setMessage("Could not save the card.");
    }
  };

  const editCard = (categoryId, card) => {
    setSelectedCategoryId(categoryId);
    setEditingCardId(card.id);

    setCardForm({
      label: card.label || "",
      title: card.title || "",
      description: card.description || "",
      type: card.type || "text",
      videoUrl: card.videoUrl || "",
      order: Number(card.order) || 1,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const removeCard = async (categoryId, cardId) => {
    const shouldDelete = window.confirm(
      "Are you sure you want to delete this guide card?"
    );

    if (!shouldDelete) return;

    try {
      await deleteDoc(
        doc(
          db,
          "guideCategories",
          categoryId,
          "cards",
          cardId
        )
      );

      if (editingCardId === cardId) {
        resetCardForm();
      }

      setMessage("Card deleted successfully.");
      await loadCategories();
    } catch (error) {
      console.error("Unable to delete card:", error);
      setMessage("Could not delete the card.");
    }
  };

  const importExistingGuides = async () => {
    if (categories.length > 0) {
      setMessage(
        "Guide categories already exist. Import was stopped to prevent duplicates."
      );
      return;
    }

    try {
      for (const category of existingGuideCategories) {
        const categoryReference = doc(
          collection(db, "guideCategories")
        );

        const batch = writeBatch(db);
        const { cards, ...categoryData } = category;

        batch.set(categoryReference, {
          ...categoryData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        cards.forEach((card) => {
          const cardReference = doc(
            collection(categoryReference, "cards")
          );

          batch.set(cardReference, {
            label: card.label || "",
            title: card.title,
            description: card.description || "",
            type: card.type,
            videoUrl: card.videoUrl || "",
            embedUrl:
              card.type === "video"
                ? getYouTubeEmbedUrl(card.videoUrl)
                : "",
            order: card.order,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        });

        await batch.commit();
      }

      setMessage("Your existing guide cards were imported.");
      await loadCategories();
    } catch (error) {
      console.error("Unable to import existing guides:", error);
      setMessage("Could not import the existing guides.");
    }
  };

  return (
    <section className="admin-guides">
      <div className="admin-guides-heading">
        <div>
          <p>EXISTING GUIDE CONTENT</p>
          <h2>Manage Guide Categories</h2>
        </div>

        {categories.length === 0 && (
          <button
            className="import-guides-button"
            type="button"
            onClick={importExistingGuides}
          >
            Import Existing Guides
          </button>
        )}
      </div>

      {message && <p className="guide-message">{message}</p>}

      <div className="guide-management-forms">
        <form className="guide-form" onSubmit={saveCategory}>
          <div className="guide-form-heading">
            <h3>
              {editingCategoryId
                ? "Update Category"
                : "Add Category"}
            </h3>

            {editingCategoryId && (
              <button type="button" onClick={resetCategoryForm}>
                Cancel
              </button>
            )}
          </div>

          <label>Category title</label>
          <input
            name="title"
            value={categoryForm.title}
            onChange={handleCategoryChange}
            required
          />

          <label>Category description</label>
          <textarea
            name="description"
            value={categoryForm.description}
            onChange={handleCategoryChange}
            rows="3"
          />

          <label>Card layout</label>
          <select
            name="layout"
            value={categoryForm.layout}
            onChange={handleCategoryChange}
          >
            <option value="grid">Grid</option>
            <option value="slider">Horizontal slider</option>
          </select>

          <label>Category order</label>
          <input
            name="order"
            type="number"
            min="1"
            value={categoryForm.order}
            onChange={handleCategoryChange}
            required
          />

          <button className="guide-save-button" type="submit">
            {editingCategoryId
              ? "Update category"
              : "Add category"}
          </button>
        </form>

        <form className="guide-form" onSubmit={saveCard}>
          <div className="guide-form-heading">
            <h3>{editingCardId ? "Update Card" : "Add Card"}</h3>

            {editingCardId && (
              <button type="button" onClick={resetCardForm}>
                Cancel
              </button>
            )}
          </div>

          <label>Choose category</label>
          <select
            value={selectedCategoryId}
            onChange={(event) => {
              setSelectedCategoryId(event.target.value);
              resetCardForm();
            }}
            required
          >
            <option value="">Select category</option>

            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.order}. {category.title}
              </option>
            ))}
          </select>

          <label>Card type</label>
          <select
            name="type"
            value={cardForm.type}
            onChange={handleCardChange}
          >
            <option value="text">Text card</option>
            <option value="video">YouTube video card</option>
          </select>

          <label>Small label</label>
          <input
            name="label"
            value={cardForm.label}
            onChange={handleCardChange}
            placeholder="Example: DAY 1"
          />

          <label>Card title</label>
          <input
            name="title"
            value={cardForm.title}
            onChange={handleCardChange}
            required
          />

          {cardForm.type === "text" && (
            <>
              <label>Description</label>
              <textarea
                name="description"
                value={cardForm.description}
                onChange={handleCardChange}
                rows="4"
              />
            </>
          )}

          {cardForm.type === "video" && (
            <>
              <label>YouTube link</label>
              <input
                name="videoUrl"
                type="url"
                value={cardForm.videoUrl}
                onChange={handleCardChange}
                required
              />
            </>
          )}

          <label>Card order</label>
          <input
            name="order"
            type="number"
            min="1"
            value={cardForm.order}
            onChange={handleCardChange}
            required
          />

          <button className="guide-save-button" type="submit">
            {editingCardId ? "Update card" : "Add card"}
          </button>
        </form>
      </div>

      <div className="guide-category-list">
        {loading && <p>Loading guide categories...</p>}

        {categories.map((category) => (
          <article className="guide-category-admin" key={category.id}>
            <div className="guide-category-admin-heading">
              <div>
                <span>Category {category.order}</span>
                <h3>{category.title}</h3>
                <p>{category.description}</p>
              </div>

              <div className="guide-category-actions">
                <button
                  type="button"
                  onClick={() => editCategory(category)}
                >
                  Edit category
                </button>

                <button
                  className="delete-guide-button"
                  type="button"
                  onClick={() => removeCategory(category)}
                >
                  Delete category
                </button>
              </div>
            </div>

            <div className="admin-guide-grid">
              {category.cards.map((card) => (
                <div className="admin-guide-card" key={card.id}>
                  {card.type === "video" && card.embedUrl && (
                    <iframe
                      src={card.embedUrl}
                      title={card.title}
                      allowFullScreen
                    />
                  )}

                  <div className="admin-guide-card-content">
                    {card.label && <span>{card.label}</span>}
                    <small>Card {card.order}</small>
                    <h4>{card.title}</h4>

                    {card.description && <p>{card.description}</p>}

                    <div className="admin-guide-actions">
                      <button
                        type="button"
                        onClick={() => editCard(category.id, card)}
                      >
                        Edit
                      </button>

                      <button
                        className="delete-guide-button"
                        type="button"
                        onClick={() =>
                          removeCard(category.id, card.id)
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default AdminGuides;