// src/components/dashboard/Navbar.tsx
import { handleUserLogout } from "../../handlers/authHandler";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const logout = async () => {
    await handleUserLogout();
    navigate("/");
  };

  return (
    <nav className="bg-white shadow-sm px-8 py-4 flex items-center justify-between">
      <h1 className="text-2xl font-bold text-slate-800">Notes</h1>
      <button
        className="rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600"
        onClick={logout}
      >
        Logout
      </button>
    </nav>
  );
}