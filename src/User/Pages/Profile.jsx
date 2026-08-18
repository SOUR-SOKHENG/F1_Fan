import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../context/useAuth";
import "../Css/Profile.css";

const Profile = () => {
  const { user, loading: authLoading } = useAuth();

  const [profile, setProfile] = useState({
    displayName: "",
    age: "",
    driverIdol: "",
    favoriteTeam: "",
    championshipPick: "",
    racingNumber: "",
  });

  const [teams, setTeams] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
  if (!user) return;

  const loadProfile = async () => {
    try {
      const [
        profileSnapshot,
        teamsResponse,
        driversResponse,
      ] = await Promise.all([
        getDoc(doc(db, "users", user.uid)),
        fetch(
          "https://api.jolpi.ca/ergast/f1/current/constructors/"
        ),
        fetch(
          "https://api.jolpi.ca/ergast/f1/current/drivers/"
        ),
      ]);

      if (!teamsResponse.ok || !driversResponse.ok) {
        throw new Error("Could not load current F1 teams and drivers.");
      }

      const teamsData = await teamsResponse.json();
      const driversData = await driversResponse.json();

      if (profileSnapshot.exists()) {
        const profileData = profileSnapshot.data();

        setProfile({
          displayName:
            profileData.displayName || user.displayName || "",
          age: profileData.age || "",
          driverIdol: profileData.driverIdol || "",
          favoriteTeam: profileData.favoriteTeam || "",
          championshipPick: profileData.championshipPick || "",
          racingNumber: profileData.racingNumber || "",
        });
      } else {
        setProfile((currentProfile) => ({
          ...currentProfile,
          displayName: user.displayName || "",
        }));
      }

      const constructorList =
        teamsData?.MRData?.ConstructorTable?.Constructors || [];

      const currentTeams = constructorList
        .map((constructor) => ({
          id: constructor.constructorId,
          name: constructor.name,
        }))
        .sort((firstTeam, secondTeam) =>
          firstTeam.name.localeCompare(secondTeam.name)
        );

      const apiDriverList =
        driversData?.MRData?.DriverTable?.Drivers || [];

      const currentDrivers = apiDriverList
        .map(
          (driver) =>
            `${driver.givenName} ${driver.familyName}`
        )
        .sort();

      setTeams(currentTeams);
      setDrivers(currentDrivers);
    } catch (error) {
      console.error("Unable to load profile:", error);
      setMessage("Could not load current F1 teams and drivers.");
    } finally {
      setLoading(false);
    }
  };

  loadProfile();
}, [user]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setProfile((currentProfile) => ({
      ...currentProfile,
      [name]: value,
    }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    const age = Number(profile.age);
    const racingNumber = Number(profile.racingNumber);

    if (age < 1 || age > 120) {
      setMessage("Please enter a valid age.");
      setSaving(false);
      return;
    }

    if (racingNumber < 1 || racingNumber > 99) {
      setMessage("Your racing number must be between 1 and 99.");
      setSaving(false);
      return;
    }

    try {
      await setDoc(
        doc(db, "users", user.uid),
        {
          displayName: profile.displayName.trim(),
          age,
          driverIdol: profile.driverIdol.trim(),
          favoriteTeam: profile.favoriteTeam,
          championshipPick: profile.championshipPick,
          racingNumber,
          email: user.email,
          profileUpdatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      setMessage("Your F1 profile has been saved.");
    } catch (error) {
      console.error("Unable to save profile:", error);
      setMessage("Could not save your profile.");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return <p className="profile-status">Checking your account...</p>;
  }

  if (!user) {
    return <Navigate to="/Login" replace />;
  }

  if (loading) {
    return <p className="profile-status">Loading your profile...</p>;
  }

  return (
    <main className="profile-page">
      <section className="profile-preview">
        <p className="profile-small-title">F1 FAN PROFILE</p>

        <div className="profile-number">
          {profile.racingNumber || "00"}
        </div>

        <h1>{profile.displayName || "F1 Fan"}</h1>

        <p className="profile-email">{user.email}</p>

        <div className="profile-preview-information">
          <div>
            <span>Driver idol</span>
            <strong>{profile.driverIdol || "Not selected"}</strong>
          </div>

          <div>
            <span>Favourite team</span>
            <strong>{profile.favoriteTeam || "Not selected"}</strong>
          </div>

          <div>
            <span>Championship pick</span>
            <strong>
              {profile.championshipPick || "Not selected"}
            </strong>
          </div>
        </div>
      </section>

      <form className="profile-form" onSubmit={handleSave}>
        <div className="profile-form-heading">
          <p>PERSONAL DETAILS</p>
          <h2>Edit Your Profile</h2>
        </div>

        <label htmlFor="profile-name">Your name</label>
        <input
          id="profile-name"
          name="displayName"
          type="text"
          value={profile.displayName}
          onChange={handleChange}
          required
        />

        <label htmlFor="profile-age">Age</label>
        <input
          id="profile-age"
          name="age"
          type="number"
          min="1"
          max="120"
          value={profile.age}
          onChange={handleChange}
          required
        />

        <label htmlFor="driver-idol">Driver idol</label>
        <input
          id="driver-idol"
          name="driverIdol"
          type="text"
          list="current-drivers"
          value={profile.driverIdol}
          onChange={handleChange}
          placeholder="Example: Michael Schumacher"
          required
        />

        <datalist id="current-drivers">
          {drivers.map((driver) => (
            <option value={driver} key={driver} />
          ))}
        </datalist>

        <label htmlFor="favorite-team">
          Favourite team on the grid
        </label>
        <select
          id="favorite-team"
          name="favoriteTeam"
          value={profile.favoriteTeam}
          onChange={handleChange}
          required
        >
          <option value="">Choose your favourite team</option>

          {teams.map((team) => (
            <option value={team.name} key={team.id}>
              {team.name}
            </option>
          ))}
        </select>

        <label htmlFor="championship-pick">
          Team you want to win
        </label>
        <select
          id="championship-pick"
          name="championshipPick"
          value={profile.championshipPick}
          onChange={handleChange}
          required
        >
          <option value="">Choose your championship team</option>

          {teams.map((team) => (
            <option value={team.name} key={team.id}>
              {team.name}
            </option>
          ))}
        </select>

        <label htmlFor="racing-number">
          Your personal racing number
        </label>
        <input
          id="racing-number"
          name="racingNumber"
          type="number"
          min="1"
          max="99"
          value={profile.racingNumber}
          onChange={handleChange}
          placeholder="1–99"
          required
        />

        <small className="racing-number-help">
          Choose a number from 1 to 99, like an F1 driver.
        </small>

        {message && <p className="profile-message">{message}</p>}

        <button
          className="profile-save-button"
          type="submit"
          disabled={saving}
        >
          {saving ? "Saving..." : "Save profile"}
        </button>
      </form>
    </main>
  );
};

export default Profile;