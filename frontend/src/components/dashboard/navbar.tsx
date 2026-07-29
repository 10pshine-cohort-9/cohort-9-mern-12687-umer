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
    <nav className="bg-[#11111b] px-8 py-4 flex items-center justify-between border-b border-[#313244]">
      <h1 className="text-2xl font-black tracking-tight text-[#cdd6f4]">
        <span className="text-[#cba6f7]">Notes</span>
      </h1>
      <button
        className="rounded-lg bg-[#313244] px-4 py-2 font-bold text-[#cdd6f4] transition hover:bg-[#f38ba8] hover:text-[#11111b]"
        onClick={logout}
      >
        Logout
      </button>
    </nav>
  );
}