import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { NavLink } from "react-router-dom";
import { db } from "../lib/firebase";
import { useAuth } from "../context/useAuth";

const ACTIVE_TIME = 5 * 60 * 1000;

const AdminDashboard = () => {
  const { user: adminUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stopListening = onSnapshot(
      collection(db, "users"),
      (snapshot) => {
        const userList = snapshot.docs
          .map((userDocument) => ({
            id: userDocument.id,
            ...userDocument.data(),
          }))
          .filter((profile) => profile.id !== adminUser?.uid);

        setUsers(userList);
        setLoading(false);
      },
      (error) => {
        console.error("Could not load users:", error);
        setLoading(false);
      },
    );

    return stopListening;
  }, [adminUser]);

  useEffect(() => {
    const timeUpdater = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60 * 1000);

    return () => clearInterval(timeUpdater);
  }, []);

  const activeUsers = users.filter((profile) => {
    const lastActiveTime = profile.lastActiveAt?.toMillis?.();

    if (!lastActiveTime) return false;

    return currentTime - lastActiveTime <= ACTIVE_TIME;
  });

  const bannedUsers = users.filter((profile) => profile.banned === true);

  const completedProfiles = users.filter((profile) => {
    return (
      profile.displayName &&
      profile.driverIdol &&
      profile.favoriteTeam &&
      profile.racingNumber
    );
  });

  const completionPercentage =
    users.length === 0
      ? 0
      : Math.round((completedProfiles.length / users.length) * 100);

  const recentUsers = [...users]
    .sort((firstUser, secondUser) => {
      const firstDate = firstUser.createdAt?.toMillis?.() || 0;
      const secondDate = secondUser.createdAt?.toMillis?.() || 0;

      return secondDate - firstDate;
    })
    .slice(0, 5);

  const formatJoinDate = (timestamp) => {
    if (!timestamp?.toDate) return "Unknown date";

    return timestamp.toDate().toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <main className="admin-dashboard">
      <section className="dashboard-hero">
        <div className="dashboard-hero-content">
          <p>F1 FAN MEDIA CONTROL CENTRE</p>
          <h2>Race Control Dashboard</h2>
          <span>{today}</span>
        </div>

        <div className="dashboard-live-status">
          <span></span>
          Firebase live
        </div>
      </section>

      <section className="dashboard-stat-grid">
        <article className="dashboard-stat-card total">
          <div className="dashboard-stat-icon">U</div>
          <div>
            <span>Total users</span>
            <strong>{loading ? "—" : users.length}</strong>
            <p>Registered fan profiles</p>
          </div>
        </article>

        <article className="dashboard-stat-card active">
          <div className="dashboard-stat-icon">A</div>
          <div>
            <span>Active now</span>
            <strong>{loading ? "—" : activeUsers.length}</strong>
            <p>Active in the last five minutes</p>
          </div>
        </article>

        <article className="dashboard-stat-card banned">
          <div className="dashboard-stat-icon">!</div>
          <div>
            <span>Banned accounts</span>
            <strong>{loading ? "—" : bannedUsers.length}</strong>
            <p>Restricted user accounts</p>
          </div>
        </article>

        <article className="dashboard-stat-card completed">
          <div className="dashboard-stat-icon">#</div>
          <div>
            <span>Completed profiles</span>
            <strong>{loading ? "—" : completedProfiles.length}</strong>
            <p>Fans with a racing identity</p>
          </div>
        </article>
      </section>

      <section className="dashboard-main-grid">
        <article className="dashboard-profile-progress">
          <div className="dashboard-section-heading">
            <div>
              <p>COMMUNITY PROGRESS</p>
              <h3>Fan profile completion</h3>
            </div>

            <strong>{completionPercentage}%</strong>
          </div>

          <div className="dashboard-progress-track">
            <span style={{ width: `${completionPercentage}%` }}></span>
          </div>

          <p>
            {completedProfiles.length} of {users.length} users have completed
            their F1 fan identity.
          </p>

          <NavLink to="/Admin/Users">Manage users</NavLink>
        </article>

        <article className="dashboard-quick-actions">
          <div className="dashboard-section-heading">
            <div>
              <p>QUICK ACCESS</p>
              <h3>Manage platform</h3>
            </div>
          </div>

          <div className="dashboard-action-grid">
            <NavLink to="/Admin/News">
              <span>01</span>
              Manage News
            </NavLink>

            <NavLink to="/Admin/Clips">
              <span>02</span>
              Manage Clips
            </NavLink>

            <NavLink to="/Admin/Teams">
              <span>03</span>
              Manage Teams
            </NavLink>

            <NavLink to="/Admin/Guides">
              <span>04</span>
              Manage Guides
            </NavLink>

            <NavLink to="/Admin/Homepage">
              <span>05</span>
              Manage Homepage
            </NavLink>

            <NavLink to="/Admin/Users">
              <span>06</span>
              Manage Users
            </NavLink>
          </div>
        </article>
      </section>

      <section className="dashboard-recent-users">
        <div className="dashboard-section-heading">
          <div>
            <p>NEW PADDOCK MEMBERS</p>
            <h3>Recently registered users</h3>
          </div>

          <NavLink to="/Admin/Users">View all users</NavLink>
        </div>

        {loading && <p>Loading recent users...</p>}

        {!loading && recentUsers.length === 0 && (
          <p>No users have registered yet.</p>
        )}

        <div className="dashboard-user-list">
          {recentUsers.map((profile) => (
            <div className="dashboard-user-row" key={profile.id}>
              <div className="dashboard-user-number">
                {profile.racingNumber || "00"}
              </div>

              <div className="dashboard-user-name">
                <strong>
                  {profile.username ? `#${profile.username}` : "No username"}
                </strong>

                <span>{profile.displayName || "Profile not completed"}</span>
              </div>

              <span
                className={
                  profile.banned
                    ? "dashboard-user-status banned"
                    : "dashboard-user-status"
                }
              >
                {profile.banned ? "Banned" : "Active"}
              </span>

              <time>{formatJoinDate(profile.createdAt)}</time>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

export default AdminDashboard;
