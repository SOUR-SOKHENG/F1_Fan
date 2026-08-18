import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import "./AdminLayout.css";

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/Login");
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span>F1</span>
          <div>
            <strong>FAN MEDIA</strong>
            <small>Admin panel</small>
          </div>
        </div>

        <div className="admin-menu">
          <NavLink
            to="/Admin"
            end
            className={({ isActive }) =>
              isActive ? "admin-link active" : "admin-link"
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/Admin/Users"
            className={({ isActive }) =>
              isActive ? "admin-link active" : "admin-link"
            }
          >
            Manage Users
          </NavLink>
          <NavLink
            to="/Admin/News"
            className={({ isActive }) =>
              isActive ? "admin-link active" : "admin-link"
            }
          >
            Manage News
          </NavLink>
          <NavLink
            to="/Admin/Teams"
            className={({ isActive }) =>
              isActive ? "admin-link active" : "admin-link"
            }
          >
            Manage Teams
          </NavLink>
          <NavLink
            to="/Admin/Clips"
            className={({ isActive }) =>
              isActive ? "admin-link active" : "admin-link"
            }
          >
            Manage Clips
          </NavLink>
          <NavLink
            to="/Admin/Homepage"
            className={({ isActive }) =>
              isActive ? "admin-link active" : "admin-link"
            }
          >
            Manage Homepage
          </NavLink>
          <NavLink
            to="/Admin/Guides"
            className={({ isActive }) =>
              isActive ? "admin-link active" : "admin-link"
            }
          >
            Manage Guides
          </NavLink>

          <NavLink to="/News" className="admin-link">
            Preview Website
          </NavLink>
        </div>

        <button className="admin-logout" type="button" onClick={handleLogout}>
          Log out
        </button>
      </aside>

      <section className="admin-main">
        <header className="admin-header">
          <div>
            <p>Administration</p>
            <h1>F1 Fan Media</h1>
          </div>

          <div className="admin-account">
            <span>A</span>

            <div>
              <strong>Administrator</strong>
              <small>{user?.email}</small>
            </div>
          </div>
        </header>

        <div className="admin-content">
          <Outlet />
        </div>
      </section>
    </div>
  );
};

export default AdminLayout;
