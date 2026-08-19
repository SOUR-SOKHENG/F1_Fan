import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import Home from "../User/Pages/Home";
import About from "../User/Pages/About";
import Team from "../User/Pages/Team";
import News from "../User/Pages/News";
import SavedNews from "../User/Pages/SavedNews";
import Clip from "../User/Pages/Clip";
import Navbar from "../User/Pages/Navbar";
import Footer from "../User/Pages/Footer";
import Auth from "../User/Pages/Auth";
import AdminDashboard from "../Admin/AdminDashboard";
import AdminLayout from "../Admin/AdminLayout";
import AdminNews from "../Admin/News/AdminNews";
import ProtectedAdminRoute from "../Admin/ProtectedAdminRoute";
import AdminTeams from "../Admin/Teams/AdminTeams";
import AdminClips from "../Admin/Clips/AdminClips";
import AdminHomepage from "../Admin/Homepage/AdminHomepage";
import AdminGuides from "../Admin/Guides/AdminGuides";
import Profile from "../User/Pages/Profile";
import AdminUsers from "../Admin/Users/AdminUsers";
import Banned from "../User/Pages/Banned";
function PublicLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  );
}

function AppRouter() {
  return (
    <BrowserRouter basename="/F1_Fan">
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/Home" element={<Home />} />
          <Route path="/About" element={<About />} />
          <Route path="/Team" element={<Team />} />
          <Route path="/News" element={<News />} />
          <Route path="/Saved" element={<SavedNews />} />
          <Route path="/Profile" element={<Profile />} />
          <Route path="/Clips" element={<Clip />} />
          <Route path="/Login" element={<Auth />} />
          <Route path="/Banned" element={<Banned />} />
        </Route>

        <Route
          path="/Admin"
          element={
            <ProtectedAdminRoute>
              <AdminLayout />
            </ProtectedAdminRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="News" element={<AdminNews />} />
          <Route path="Teams" element={<AdminTeams />} />
          <Route path="Clips" element={<AdminClips />} />
          <Route path="Homepage" element={<AdminHomepage />} />
          <Route path="Guides" element={<AdminGuides />} />
          <Route path="Users" element={<AdminUsers />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
