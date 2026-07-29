import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { handleUserSignup } from "../handlers/authHandler";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await handleUserSignup(username, email, password);
      login(data.user, data.accessToken);
      navigate("/dashboard");
    } catch (err) {
      // Use the normalized error message!
      alert(err instanceof Error ? err.message : "Signup Failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#11111b] flex items-center justify-center px-4 font-sans selection:bg-[#cba6f7] selection:text-[#11111b]">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#89b4fa]/10 blur-[120px] rounded-full pointer-events-none" />

      <form
        onSubmit={submit}
        className="relative w-full max-w-sm rounded-2xl bg-[#1e1e2e]/80 backdrop-blur-xl border border-[#313244] shadow-2xl p-8 space-y-6"
      >
        <div className="text-center">
          <h1 className="text-xl font-mono text-[#cdd6f4]">register</h1>
        </div>

        <div className="space-y-3 font-mono text-sm">
          <input
            placeholder="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-lg bg-[#181825] border border-[#313244] text-[#cdd6f4] placeholder:text-[#45475a] px-4 py-2.5 outline-none transition focus:border-[#89b4fa] focus:ring-1 focus:ring-[#89b4fa]"
          />

          <input
            type="email"
            placeholder="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg bg-[#181825] border border-[#313244] text-[#cdd6f4] placeholder:text-[#45475a] px-4 py-2.5 outline-none transition focus:border-[#89b4fa] focus:ring-1 focus:ring-[#89b4fa]"
          />

          <input
            type="password"
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg bg-[#181825] border border-[#313244] text-[#cdd6f4] placeholder:text-[#45475a] px-4 py-2.5 outline-none transition focus:border-[#89b4fa] focus:ring-1 focus:ring-[#89b4fa]"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-[#89b4fa] py-2.5 font-mono text-sm font-bold text-[#11111b] transition hover:bg-[#b4befe]"
        >
          create_user
        </button>

        <p className="text-center font-mono text-xs text-[#6c7086]">
          [ have access? ]{" "}
          <Link
            to="/"
            className="text-[#cba6f7] hover:text-[#89b4fa] transition-colors"
          >
            login
          </Link>
        </p>
      </form>
    </div>
  );
}