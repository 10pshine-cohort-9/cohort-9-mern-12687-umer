// src/components/dashboard/Navbar.tsx
import { handleUserLogout } from "../../handlers/authHandler";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const logout = async () => {
    try {
      await handleUserLogout();
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      navigate("/");
    }
  };

  return (
    <nav className="bg-[#1e2030] px-8 py-5 flex items-center justify-between border-b border-[#363a4f]">
      <h1 className="text-2xl font-black tracking-tight text-[#cad3f5]">Notes</h1>
      <button
        className="rounded-lg bg-[#ed8796] px-4 py-2 font-bold text-[#181926] transition hover:bg-[#ee99a0]"
        onClick={logout}
      >
        Logout
      </button>
    </nav>
  );
}