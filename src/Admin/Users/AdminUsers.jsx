import { useEffect, useState } from "react";
import { collection, doc, onSnapshot, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../context/useAuth";
import "./AdminUsers.css";

const MINUTE = 60 * 1000;
const DAY = 24 * 60 * 60 * 1000;

const ACTIVE_TIME = 5 * MINUTE;
const NEW_USER_TIME = 7 * DAY;
const OLD_USER_TIME = 30 * DAY;
const LONG_INACTIVE_TIME = 30 * DAY;
function AdminUsers() {
  const { user: adminUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [visibleUsers, setVisibleUsers] = useState([]);
  const [searchUsername, setSearchUsername] = useState("");
  const [searching, setSearching] = useState(false);
  const [filterMode, setFilterMode] = useState("all");
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const [updatingId, setUpdatingId] = useState("");
  const [expandedUserId, setExpandedUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const cleanUsername = (username) => {
    return username.trim().replace(/^#/, "").toLowerCase();
  };
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

  const getFilterButtonClass = (filterName) => {
    const basicClass =
      "cursor-pointer rounded-[18px] border border-transparent px-[13px] py-2 text-xs font-extrabold";

    return filterMode === filterName
      ? `${basicClass} bg-[#e10600] text-white`
      : `${basicClass} bg-gray-100 text-gray-600 hover:border-red-200 hover:text-[#e10600]`;
  };

  return (
    <section className="w-full">
      <div className="mb-6 flex flex-col items-start justify-between gap-5 min-[701px]:flex-row min-[701px]:items-center">
        <div>
          <p className="mb-[5px] text-xs font-extrabold tracking-[1.5px] text-[#e10600]">
            USER MANAGEMENT
          </p>
          <h2 className="m-0 text-[30px] text-[#191b20]">Registered Users</h2>
        </div>

        <span className="rounded-[20px] bg-[#202229] px-3.5 py-2 text-[13px] font-extrabold text-white">
          {users.length} users
        </span>
      </div>

      <form className="rounded-[14px] border border-gray-200 bg-white p-6 shadow-md" onSubmit={searchUser}>
        <label className="mb-[9px] block text-sm font-bold text-gray-700" htmlFor="admin-username-search">
          Search by exact unique username
        </label>

        <div className="flex flex-col gap-3 min-[701px]:flex-row">
          <div className="flex flex-1 items-center overflow-hidden rounded-lg border border-gray-300 bg-gray-50 focus-within:border-[#e10600] focus-within:bg-white focus-within:ring-4 focus-within:ring-red-100">
            <span className="pl-3.5 text-lg font-black text-[#e10600]">#</span>

            <input className="flex-1 border-0 bg-transparent p-3 outline-none" id="admin-username-search" type="text" value={searchUsername} onChange={handleSearchChange} placeholder="username" />
          </div>

          <button className="cursor-pointer rounded-lg border-0 rounded-3 bg-[#202229] px-5 py-[11px] font-extrabold text-white hover:bg-[#e10600]" type="submit">Search user</button>

          {searching && (
            <button className="cursor-pointer rounded-lg border-0 bg-gray-200 px-5 py-[11px] font-extrabold text-[#202229] hover:bg-gray-500 hover:text-white" type="button" onClick={showAllUsers} >
              Show all
            </button>
          )}
        </div>
      </form>

      <div className="mt-[18px] flex flex-wrap items-center gap-[9px] rounded-[11px] border border-gray-200 bg-white p-3.5 shadow-sm">
        <button type="button" className={getFilterButtonClass("all")} onClick={() => setFilterMode("all")} >
          All
        </button>

        <button type="button" className={getFilterButtonClass("new")} onClick={() => setFilterMode("new")} >
          New users
        </button>

        <button type="button" className={getFilterButtonClass("old")} onClick={() => setFilterMode("old")} >
          Old users
        </button>

        <button type="button" className={getFilterButtonClass("active")} onClick={() => setFilterMode("active")} >
          Active now
        </button>

        <button type="button" className={getFilterButtonClass("inactive")} onClick={() => setFilterMode("inactive")} >
          Inactive
        </button>

        <button type="button" className={getFilterButtonClass("long-inactive")} onClick={() => setFilterMode("long-inactive")} >
          Long inactive
        </button>
        <button type="button" className={getFilterButtonClass("banned")} onClick={() => setFilterMode("banned")} >
          Banned
        </button>

        <button type="button" className={getFilterButtonClass("incomplete")} onClick={() => setFilterMode("incomplete")} >
          Incomplete profiles
        </button>
        <span className="ml-0 w-full rounded-[15px] bg-[#202229] px-[11px] py-[7px] text-center text-[11px] font-extrabold text-white sm:ml-auto sm:w-auto">
          {filteredUsers.length} shown
        </span>
      </div>

      {message && <p className="mb-0 mt-5 rounded-md border-l-4 border-[#e10600] bg-white px-[15px] py-3 text-gray-700">{message}</p>}

      {loading && <p className="mb-0 mt-5 rounded-md border-l-4 border-[#e10600] bg-white px-[15px] py-3 text-gray-700">Loading users...</p>}

      {!loading && filteredUsers.length === 0 && !message && (
        <p className="mb-0 mt-5 rounded-md border-l-4 border-[#e10600] bg-white px-[15px] py-3 text-gray-700">
          No registered user profiles were found.
        </p>
      )}

      <div className="admin-user-list">
        {filteredUsers.map((profile) => (
          <button className="admin-user-profile admin-user-card-btn" type="button" key={profile.id} onClick={() => openUserDetails(profile.id)} >
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
          <article className="admin-user-modal-content" onClick={(event) => event.stopPropagation()} >
            <button className="admin-user-modal-close" type="button" onClick={closeUserDetails} aria-label="Close user profile" ></button>

            <div className="admin-user-modal-heading">
              <div className="admin-user-number">
                {selectedProfile.racingNumber || "00"}
              </div>

              <div>
                <span className={ selectedProfile.banned ? "user-status banned" : "user-status active" } >
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

            <button className={ selectedProfile.banned ? "admin-ban-btn unban" : "admin-ban-btn" } type="button" onClick={() => changeBanStatus(selectedProfile)} disabled={updatingId === selectedProfile.id} >
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
}
export default AdminUsers;
