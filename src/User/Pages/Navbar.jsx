import { NavLink } from "react-router-dom";
import F1 from "../../assets/Media/F1_logo.jpg";
import "../Css/Overall.css";
import { useAuth } from "../../context/useAuth";

function Navbar() {
  const { user, isAdmin, logout } = useAuth();

  const closeMenu = () => {
    const toggle = document.getElementById("nav-toggle");

    if (toggle) {
      toggle.checked = false;
    }
  };

  const handleLogout = () => {
    closeMenu();
    logout();
  };

  return (
    <div>
      <nav
        className="navbar sticky top-0 z-[1000] m-0 bg-[rgba(142,3,3,0.944)] p-0 max-sm:h-[9vh]"
        aria-label="Primary"
      >
        <div className="nav_inner mx-auto flex max-w-[1100px] items-center justify-between px-4 py-3">
          <div className="brand">
            <img src={F1} alt="F1 logo" className="F1_logo w-full" />
          </div>
          <input
            id="nav-toggle"
            type="checkbox"
            className="toggle"
            aria-controls="primary-menu"
            aria-expanded="false"
          />
          <label
            htmlFor="nav-toggle"
            className="toggle-label"
            aria-label="Toggle navigation"
          >
            <span />
            <span />
            <span />
          </label>
          <ul id="primary-menu" className="menu">
            <li>
              <NavLink
                to="/Home"
                className="navlink text-decoration-none text-2xl font-TitilliumWeb-BoldItalic"
                onClick={closeMenu}
              >
                Home
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/About"
                className="navlink text-decoration-none text-2xl"
                onClick={closeMenu}
              >
                Guides
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/Team"
                className="navlink text-decoration-none text-2xl"
                onClick={closeMenu}
              >
                Team
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/News"
                className="navlink text-decoration-none text-2xl"
                onClick={closeMenu}
              >
                News
              </NavLink>
            </li>
            {user && (
              <li>
                <NavLink
                  to="/Saved"
                  className="navlink text-decoration-none text-2xl"
                  onClick={closeMenu}
                >
                  Saved
                </NavLink>
              </li>
            )}
            {user && !isAdmin && (
              <li>
                <NavLink
                  to="/Profile"
                  className="navlink text-decoration-none text-2xl"
                  onClick={closeMenu}
                >
                  Profile
                </NavLink>
              </li>
            )}
            <li>
              <NavLink
                to="/Clips"
                className="navlink text-decoration-none text-2xl"
                onClick={closeMenu}
              >
                Clip
              </NavLink>
            </li>
            {user ? (
              <li>
                <button
                  type="button"
                  className="navlink text-2xl border-0 bg-transparent"
                  onClick={handleLogout}
                >
                  Log out
                </button>
              </li>
            ) : (
              <li>
                <NavLink
                  to="/Login"
                  className="navlink text-decoration-none text-2xl"
                  onClick={closeMenu}
                >
                  Log in
                </NavLink>
              </li>
            )}
          </ul>
        </div>
      </nav>

      {isAdmin && (
        <NavLink
          to="/Admin"
          className="fixed bottom-3.5 right-3.5 z-[2500] inline-flex items-center justify-center rounded-3xl border-2 border-white bg-[#e10600] px-[13px] py-[9px] text-xs font-extrabold text-white no-underline shadow-xl transition hover:-translate-y-1 hover:bg-[#202229] hover:text-white sm:bottom-6 sm:right-6 sm:px-4 sm:py-2.5 sm:text-sm"
          aria-label="Back to admin dashboard"
        >
          ← Back
        </NavLink>
      )}
    </div>
  );
}

export default Navbar;
