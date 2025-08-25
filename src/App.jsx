import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./Pages/Auth/Login";
import Register from "./Pages/Auth/Register";
import Dashboard from "./Pages/Dashboard";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
