import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Pages/Auth/Login";
import Register from "./Pages/Auth/Register";
import Dashboard from "./Pages/Dashboard";
import { isAuthenticated } from "./API/auth";
import Profile from "./Pages/Profile";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import MyGames from "./Pages/MyGames";
import About from "./Pages/About";
import FriendsPage from "./Pages/FriendsPage";
import UserProfilePage from "./components/Friends/UserProfilePage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/Login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={isAuthenticated() ? <Profile /> : <Navigate to="/login" />} />
        <Route path="/games" element={isAuthenticated() ? <MyGames /> : <Navigate to="/login" />} />
        <Route path="/about" element={isAuthenticated() ? <About /> : <Navigate to="/login" />} />
        <Route path="/user" element={isAuthenticated() ? <FriendsPage /> : <Navigate to="/login" />} />
        <Route path="/users/:id" element={isAuthenticated() ? <UserProfilePage /> : <Navigate to="/login" />} />
        <Route path="/" element={isAuthenticated() ? <Dashboard /> : <Navigate to="/login" />} />
      </Routes>
      <ToastContainer theme="dark" position="top-right" autoClose={3000} />
    </BrowserRouter>
  );
}
