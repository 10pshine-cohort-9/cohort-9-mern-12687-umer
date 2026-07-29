// src/pages/Signup.tsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { handleUserSignup } from "../handlers/authHandler";

export default function Signup() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await handleUserSignup(username, email, password);
      localStorage.setItem("accessToken", data.accessToken);
      navigate("/dashboard");
    } catch (err: any) {
      alert(err.response?.data?.msg || "Signup Failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#11111b] flex items-center justify-center px-4 font-sans selection:bg-[#cba6f7] selection:text-[#11111b]">
      <form
        onSubmit={submit}
        className="w-full max-w-md rounded-2xl bg-[#1e1e2e] border border-[#313244] shadow-2xl p-8 space-y-6"
      >
        <div>
          <h1 className="text-3xl font-extrabold text-[#cdd6f4]">
            Create Your Account
          </h1>
          <p className="text-[#a6adc8] mt-2">
            Sign up to get started
          </p>
        </div>

        <div className="space-y-4">
          <input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-xl bg-[#181825] border border-[#313244] text-[#cdd6f4] placeholder:text-[#6c7086] px-4 py-3 outline-none transition focus:border-[#89b4fa] focus:ring-2 focus:ring-[#89b4fa]/20"
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl bg-[#181825] border border-[#313244] text-[#cdd6f4] placeholder:text-[#6c7086] px-4 py-3 outline-none transition focus:border-[#89b4fa] focus:ring-2 focus:ring-[#89b4fa]/20"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl bg-[#181825] border border-[#313244] text-[#cdd6f4] placeholder:text-[#6c7086] px-4 py-3 outline-none transition focus:border-[#89b4fa] focus:ring-2 focus:ring-[#89b4fa]/20"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-xl bg-[#cba6f7] py-3 font-bold text-[#11111b] shadow-sm transition hover:bg-[#b4befe]"
        >
          Create Account
        </button>

        <p className="text-center text-sm text-[#bac2de]">
          Already have an account?{" "}
          <Link
            to="/"
            className="font-bold text-[#89b4fa] hover:text-[#74c7ec] transition-colors"
          >
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}