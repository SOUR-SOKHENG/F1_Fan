import { useEffect, useState } from "react";
import {
  collection,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../context/useAuth";
import "./AdminUsers.css";

const MINUTE = 60 * 1000;
const DAY = 24 * 60 * 60 * 1000;

const ACTIVE_TIME = 5 * MINUTE;
const NEW_USER_TIME = 7 * DAY;
const OLD_USER_TIME = 30 * DAY;
const LONG_INACTIVE_TIME = 30 * DAY;
const AdminUsers = () => {
  const { user: adminUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [visibleUsers, setVisibleUsers] = useState([]);
  const [searchUsername, setSearchUsername] = useState("");
  const [searching, setSearching] = useState(false);
  const [filterMode, setFilterMode] = useState("all");
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [updatingId, setUpdatingId] = useState("");
  const [expandedUserId, setExpandedUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const stopListening = onSnapshot(
      collection(db, "users"),
      (snapshot) => {
        const userList = snapshot.docs
          .map((userDocument) => ({
            id: userDocument.id,
            ...userDocument.data(),
          }))
          .filter((profile) => profile.id !== adminUser?.uid)
          .sort((firstUser, secondUser) => {
            const firstName = firstUser.username || "";
            const secondName = secondUser.username || "";

            return firstName.localeCompare(secondName);
          });

        setUsers(userList);

        if (!searching) {
          setVisibleUsers(userList);
        } else {
          const username = cleanUsername(searchUsername);

          setVisibleUsers(
            userList.filter((profile) => profile.username === username),
          );
        }

        setLoading(false);
      },
      (error) => {
        console.error("Unable to load users:", error);
        setMessage("Could not load registered users.");
        setLoading(false);
      },
    );

    return stopListening;
  }, [adminUser, searching, searchUsername]);

  useEffect(() => {
    const timeUpdater = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60 * 1000);

    return () => clearInterval(timeUpdater);
  }, []);

  const cleanUsername = (username) => {
    return username.trim().replace(/^#/, "").toLowerCase();
  };

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchUsername(value);
    setMessage("");

    if (value.trim() === "" || value.trim() === "#") {
      setSearching(false);
      setVisibleUsers(users);
    }
  };

  const searchUser = (event) => {
    event.preventDefault();

    const username = cleanUsername(searchUsername);

    if (!username) {
      setSearching(false);
      setVisibleUsers(users);
      setMessage("");
      return;
    }

    const exactMatches = users.filter(
      (profile) => profile.username === username,
    );

    setSearching(true);
    setVisibleUsers(exactMatches);

    if (exactMatches.length === 0) {
      setMessage(`No user was found with #${username}.`);
    } else {
      setMessage("");
    }
  };

  const showAllUsers = () => {
    setSearchUsername("");
    setSearching(false);
    setVisibleUsers(users);
    setMessage("");
  };
  const openUserDetails = (userId) => {
    setExpandedUserId(userId);
  };

  const closeUserDetails = () => {
    setExpandedUserId("");
  };
  const changeBanStatus = async (profile) => {
    const nextBanStatus = !profile.banned;
    const action = nextBanStatus ? "ban" : "unban";
    const username = profile.username ? `#${profile.username}` : profile.email;

    const shouldContinue = window.confirm(
      `Are you sure you want to ${action} ${username}?`,
    );

    if (!shouldContinue) return;

    setUpdatingId(profile.id);
    setMessage("");

    try {
      await updateDoc(doc(db, "users", profile.id), {
        banned: nextBanStatus,
        banUpdatedAt: serverTimestamp(),
      });

      setMessage(
        nextBanStatus
          ? `${username} has been banned.`
          : `${username} has been unbanned.`,
      );
    } catch (error) {
      console.error("Unable to change ban status:", error);
      setMessage("Could not update this account.");
    } finally {
      setUpdatingId("");
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp?.toDate) return "Not available";

    return timestamp.toDate().toLocaleString();
  };

  const filteredUsers = visibleUsers.filter((profile) => {
    const createdTime = profile.createdAt?.toMillis?.();
    const lastActiveTime = profile.lastActiveAt?.toMillis?.();

    if (filterMode === "new") {
      return createdTime && currentTime - createdTime <= NEW_USER_TIME;
    }

    if (filterMode === "old") {
      return createdTime && currentTime - createdTime > OLD_USER_TIME;
    }

    if (filterMode === "active") {
      return (
        !profile.banned &&
        lastActiveTime &&
        currentTime - lastActiveTime <= ACTIVE_TIME
      );
    }

    if (filterMode === "inactive") {
      return !lastActiveTime || currentTime - lastActiveTime > ACTIVE_TIME;
    }

    if (filterMode === "long-inactive") {
      return (
        !lastActiveTime || currentTime - lastActiveTime >= LONG_INACTIVE_TIME
      );
    }

    if (filterMode === "banned") {
      return profile.banned === true;
    }

    if (filterMode === "incomplete") {
      return !(
        profile.displayName &&
        profile.driverIdol &&
        profile.favoriteTeam &&
        profile.racingNumber
      );
    }

    return true;
  });
  const selectedProfile =
    users.find((profile) => profile.id === expandedUserId) || null;

  return (
    <section className="admin-users">
      <div className="admin-users-heading">
        <div>
          <p>USER MANAGEMENT</p>
          <h2>Registered Users</h2>
        </div>

        <span>{users.length} users</span>
      </div>

      <form className="admin-user-search" onSubmit={searchUser}>
        <label htmlFor="admin-username-search">
          Search by exact unique username
        </label>

        <div className="admin-user-search-row">
          <div className="admin-username-input">
            <span>#</span>

            <input
              id="admin-username-search"
              type="text"
              value={searchUsername}
              onChange={handleSearchChange}
              placeholder="username"
            />
          </div>

          <button type="submit">Search user</button>

          {searching && (
            <button
              className="show-all-users-button"
              type="button"
              onClick={showAllUsers}
            >
              Show all
            </button>
          )}
        </div>
      </form>

      <div className="admin-user-filters">
        <button
          type="button"
          className={filterMode === "all" ? "active" : ""}
          onClick={() => setFilterMode("all")}
        >
          All
        </button>

        <button
          type="button"
          className={filterMode === "new" ? "active" : ""}
          onClick={() => setFilterMode("new")}
        >
          New users
        </button>

        <button
          type="button"
          className={filterMode === "old" ? "active" : ""}
          onClick={() => setFilterMode("old")}
        >
          Old users
        </button>

        <button
          type="button"
          className={filterMode === "active" ? "active" : ""}
          onClick={() => setFilterMode("active")}
        >
          Active now
        </button>

        <button
          type="button"
          className={filterMode === "inactive" ? "active" : ""}
          onClick={() => setFilterMode("inactive")}
        >
          Inactive
        </button>

        <button
          type="button"
          className={filterMode === "long-inactive" ? "active" : ""}
          onClick={() => setFilterMode("long-inactive")}
        >
          Long inactive
        </button>

        <button
          type="button"
          className={filterMode === "banned" ? "active" : ""}
          onClick={() => setFilterMode("banned")}
        >
          Banned
        </button>

        <button
          type="button"
          className={filterMode === "incomplete" ? "active" : ""}
          onClick={() => setFilterMode("incomplete")}
        >
          Incomplete profiles
        </button>

        <span>{filteredUsers.length} shown</span>
      </div>

      {message && <p className="admin-user-message">{message}</p>}

      {loading && <p className="admin-user-message">Loading users...</p>}

      {!loading && filteredUsers.length === 0 && !message && (
        <p className="admin-user-message">
          No registered user profiles were found.
        </p>
      )}

      <div className="admin-user-list">
        {filteredUsers.map((profile) => (
          <button
            className="admin-user-profile admin-user-card-button"
            type="button"
            key={profile.id}
            onClick={() => openUserDetails(profile.id)}
          >
            <div className="admin-user-summary">
              <div>
                <h3>
                  {profile.username ? `#${profile.username}` : "No username"}
                </h3>

                <p>{profile.displayName || "Name not provided"}</p>
              </div>

              <span>View profile →</span>
            </div>
          </button>
        ))}
      </div>

      {selectedProfile && (
        <div className="admin-user-modal" onClick={closeUserDetails}>
          <article
            className="admin-user-modal-content"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="admin-user-modal-close"
              type="button"
              onClick={closeUserDetails}
              aria-label="Close user profile"
            ></button>

            <div className="admin-user-modal-heading">
              <div className="admin-user-number">
                {selectedProfile.racingNumber || "00"}
              </div>

              <div>
                <span
                  className={
                    selectedProfile.banned
                      ? "user-status banned"
                      : "user-status active"
                  }
                >
                  {selectedProfile.banned ? "Banned" : "Active"}
                </span>

                <h3>
                  {selectedProfile.username
                    ? `#${selectedProfile.username}`
                    : "No username"}
                </h3>

                <p>{selectedProfile.email}</p>
              </div>
            </div>

            <div className="admin-user-details">
              <div>
                <span>Name</span>
                <strong>{selectedProfile.displayName || "Not provided"}</strong>
              </div>

              <div>
                <span>Age</span>
                <strong>{selectedProfile.age || "Not provided"}</strong>
              </div>

              <div>
                <span>Driver idol</span>
                <strong>{selectedProfile.driverIdol || "Not selected"}</strong>
              </div>

              <div>
                <span>Favourite team</span>
                <strong>
                  {selectedProfile.favoriteTeam || "Not selected"}
                </strong>
              </div>

              <div>
                <span>Championship pick</span>
                <strong>
                  {selectedProfile.championshipPick || "Not selected"}
                </strong>
              </div>

              <div>
                <span>Racing number</span>
                <strong>
                  {selectedProfile.racingNumber || "Not selected"}
                </strong>
              </div>

              <div>
                <span>Account created</span>
                <strong>{formatDate(selectedProfile.createdAt)}</strong>
              </div>

              <div>
                <span>Last active</span>
                <strong>{formatDate(selectedProfile.lastActiveAt)}</strong>
              </div>
            </div>

            <button
              className={
                selectedProfile.banned
                  ? "admin-ban-button unban"
                  : "admin-ban-button"
              }
              type="button"
              onClick={() => changeBanStatus(selectedProfile)}
              disabled={updatingId === selectedProfile.id}
            >
              {updatingId === selectedProfile.id
                ? "Updating..."
                : selectedProfile.banned
                  ? "Unban user"
                  : "Ban user"}
            </button>
          </article>
        </div>
      )}
    </section>
  );
};

export default AdminUsers;
