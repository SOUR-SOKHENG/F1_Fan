import { NavLink } from "react-router-dom";
import F1 from "../../assets/Media/F1_logo.jpg";
import "../Css/Overall.css";
import { useAuth } from "../../context/useAuth";

const Navbar = () => {
  const { user, isAdmin, logout } = useAuth();
  const closeMenu = () => {
    const toggle = document.getElementById("nav-toggle");
    if (toggle) toggle.checked = false;
  };

  return (
    <div>
      <nav className="navbar " aria-label="Primary">
        <div className="nav_inner">
          <div className="brand">
            <img src={F1} alt="F1_logo" className="F1_logo w-full  " />
          </div>
          <input
            type="checkbox"
            aria-controls="primary-menu"
            aria-expanded="false"
            id="nav-toggle"
            className="toggle"
          />
          <label
            htmlFor="nav-toggle"
            className="toggle-label"
            aria-label="Toggle navigation"
          >
            <span></span>
            <span></span>
            <span></span>
          </label>
          <ul id="primary-menu" className="menu">
            <li>
              {" "}
              <NavLink to={"/"}></NavLink>
            </li>
            <li>
              <NavLink
                to={"/Home"}
                className=" navlink text-decoration-none text-2xl  font-TitilliumWeb-BoldItalic "
                onClick={closeMenu}
              >
                Home
              </NavLink>
            </li>
            <li>
              <NavLink
                className="  navlink text-decoration-none text-2xl "
                to={"/About"}
                onClick={closeMenu}
              >
                Guides
              </NavLink>
            </li>
            <li>
              <NavLink
                className="  navlink text-decoration-none text-2xl  "
                to={"/Team"}
                onClick={closeMenu}
              >
                Team
              </NavLink>
            </li>
            <li>
              <NavLink
                className=" navlink text-decoration-none text-2xl "
                to={"/News"}
                onClick={closeMenu}
              >
                News
              </NavLink>
            </li>
            {user && (
              <li>
                <NavLink
                  className="navlink text-decoration-none text-2xl"
                  to={"/Saved"}
                  onClick={closeMenu}
                >
                  Saved
                </NavLink>
              </li>
            )}
            {user && !isAdmin && (
              <li>
                <NavLink
                  className="navlink text-decoration-none text-2xl"
                  to={"/Profile"}
                  onClick={closeMenu}
                >
                  Profile
                </NavLink>
              </li>
            )}
            <li>
              <NavLink
                className=" navlink text-decoration-none text-2xl "
                to={"/Clips"}
                onClick={closeMenu}
              >
                Clip
              </NavLink>
            </li>
            {user ? (
              <li>
                <button
                  className="navlink text-2xl border-0 bg-transparent"
                  onClick={() => logout()}
                >
                  Log out
                </button>
              </li>
            ) : (
              <li>
                <NavLink
                  className="navlink text-decoration-none text-2xl"
                  to={"/Login"}
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
          className="admin-floating-back"
          to="/Admin"
          aria-label="Back to admin dashboard"
        >
          ← Back
        </NavLink>
      )}
    </div>
  );
};

export default Navbar;
