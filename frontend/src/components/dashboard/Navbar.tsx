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
    <nav className="flex items-center justify-between rounded-2xl bg-[#181825]/90 backdrop-blur-md px-6 py-3 border border-[#313244] shadow-lg">
      <div className="flex items-center gap-2">
        <div className="h-3 w-3 rounded-full bg-[#cba6f7] animate-pulse shadow-[0_0_8px_#cba6f7]" />
        <h1 className="text-lg font-bold font-mono tracking-tight text-[#cdd6f4]">
          <span className="text-[#89b4fa]">user</span>@<span className="text-[#cba6f7]">notes</span>
          <span className="text-[#585b70]">:~</span>$
        </h1>
      </div>
      
      <div className="flex items-center gap-4">
        <span className="font-mono text-xs text-[#a6adc8] hidden sm:block">
          {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
        </span>
        <button
          className="rounded-md border border-[#313244] bg-[#1e1e2e] px-3 py-1 font-mono text-xs text-[#f38ba8] transition hover:bg-[#f38ba8]/10 hover:border-[#f38ba8]"
          onClick={logout}
        >
          [ logout ]
        </button>
      </div>
    </nav>
  );
}