// src/pages/Login.tsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { handleUserLogin } from "../handlers/authHandler";
import { SiArchlinux} from "react-icons/si"

export default function Login() {
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await handleUserLogin(identifier, password);
      localStorage.setItem("accessToken", data.accessToken);
      navigate("/dashboard");
    } catch (err: any) {
      alert(err.response?.data?.msg || "Login Failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#11111b] flex items-center justify-center px-4 font-sans selection:bg-[#cba6f7] selection:text-[#11111b]">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#cba6f7]/10 blur-[120px] rounded-full pointer-events-none" />

      <form
        onSubmit={submit}
        className="relative w-full max-w-sm rounded-2xl bg-[#1e1e2e]/80 backdrop-blur-xl border border-[#313244] shadow-2xl p-8 space-y-6"
      >
        <div className="text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#181825] border border-[#313244] mb-4 shadow-inner">
            <span className="text-3xl"><SiArchlinux color="#f1e7fd" /></span>
          </div>
          <h1 className="text-xl font-mono text-[#cdd6f4]">login</h1>
        </div>

        <div className="space-y-3 font-mono text-sm">
          <div className="relative">
            <input
              type="text"
              placeholder="user"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full rounded-lg bg-[#181825] border border-[#313244] text-[#cdd6f4] placeholder:text-[#45475a] px-4 py-2.5 outline-none transition focus:border-[#cba6f7] focus:ring-1 focus:ring-[#cba6f7]"
            />
          </div>

          <div className="relative">
            <input
              type="password"
              placeholder="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg bg-[#181825] border border-[#313244] text-[#cdd6f4] placeholder:text-[#45475a] px-4 py-2.5 outline-none transition focus:border-[#cba6f7] focus:ring-1 focus:ring-[#cba6f7]"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-[#cba6f7] py-2.5 font-mono text-sm font-bold text-[#11111b] transition hover:bg-[#b4befe]"
        >
          enter
        </button>

        <p className="text-center font-mono text-xs text-[#6c7086]">
          [ new session? ]{" "}
          <Link
            to="/signup"
            className="text-[#89b4fa] hover:text-[#cba6f7] transition-colors"
          >
            signup
          </Link>
        </p>
      </form>
    </div>
  );
}