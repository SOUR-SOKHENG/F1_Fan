import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import "./AdminLayout.css";

function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/Login");
  };

  return (
    <div className="grid min-h-screen grid-cols-1 bg-gray-100 font-sans sm:grid-cols-[250px_minmax(0,1fr)]">
      <aside className="static flex h-auto w-full flex-col bg-[#170505] px-[18px] py-[25px] text-white sm:sticky sm:top-0 sm:h-screen">
        <div className="flex items-center gap-3 border-b border-white/15 px-2 pb-7 pt-[5px]">
          <span className="rounded-md bg-[#e10600] px-2.5 py-[7px] text-[25px] font-black italic">
            F1
          </span>
          <div>
            <strong className="block">FAN MEDIA</strong>
            <small className="mt-0.5 block text-[#b7b7b7]">Admin panel</small>
          </div>
        </div>

        <div className="admin-menu mt-[18px] flex flex-col gap-2 sm:mt-[30px]">
          <NavLink to="/Admin" end className={({ isActive }) =>
              isActive ? "admin-link active" : "admin-link"
            }
          >
            Dashboard
          </NavLink>
          <NavLink to="/Admin/Users" className={({ isActive }) =>
              isActive ? "admin-link active" : "admin-link"
            }
          >
            Manage Users
          </NavLink>
          <NavLink to="/Admin/News" className={({ isActive }) =>
              isActive ? "admin-link active" : "admin-link"
            }
          >
            Manage News
          </NavLink>
          <NavLink to="/Admin/Teams" className={({ isActive }) =>
              isActive ? "admin-link active" : "admin-link"
            }
          >
            Manage Teams
          </NavLink>
          <NavLink to="/Admin/Clips" className={({ isActive }) =>
              isActive ? "admin-link active" : "admin-link"
            }
          >
            Manage Clips
          </NavLink>
          <NavLink to="/Admin/Homepage" className={({ isActive }) =>
              isActive ? "admin-link active" : "admin-link"
            }
          >
            Manage Homepage
          </NavLink>
          <NavLink to="/Admin/Guides" className={({ isActive }) =>
              isActive ? "admin-link active" : "admin-link"
            }
          >
            Manage Guides
          </NavLink>

          <NavLink to="/News" className="admin-link">
            Preview Website
          </NavLink>
        </div>
        <button className="btn mt-5 bg-red-500 mt-[18px] cursor-pointer rounded-lg border   p-[11px] font-bold text-white hover:bg-[#e10600] sm:mt-auto" type="button" onClick={handleLogout} >
          Log out
        </button>
      </aside>

      <section className="min-w-0 w-full">
        <header className="flex min-h-[90px] items-center justify-between border-b border-[#dedede] bg-white p-[15px] sm:px-[30px] sm:py-[18px]">
          <div>
            <p className="m-0 text-[13px] uppercase text-gray-500">
              Administration
            </p>
            <h1 className="m-0 text-2xl">F1 Fan Media</h1>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="grid h-[42px] w-[42px] place-items-center rounded-full bg-[#e10600] font-extrabold text-white">
              A
            </span>
            <div>
              <strong className="block">Administrator</strong>
              <small className="hidden text-gray-500 sm:block">
                {user?.email}
              </small>
            </div>
          </div>
        </header>

        <div className="px-3 py-[18px] sm:p-[30px]">
          <Outlet />
        </div>
      </section>
    </div>
  );
}

export default AdminLayout;
