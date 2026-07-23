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
    <div className="min-h-screen bg-[#1e2030] flex items-center justify-center px-4 font-sans">
      <form
        onSubmit={submit}
        className="w-full max-w-md rounded-2xl bg-white shadow-2xl p-8 space-y-6"
      >
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800">
            Create Your Account
          </h1>
          <p className="text-slate-500 mt-2">
            Sign up to get started
          </p>
        </div>

        <div className="space-y-4">
          <input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#8aadf4] focus:ring-2 focus:ring-[#8aadf4]/30"
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#8aadf4] focus:ring-2 focus:ring-[#8aadf4]/30"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#8aadf4] focus:ring-2 focus:ring-[#8aadf4]/30"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-xl bg-[#c6a0f6] py-3 font-bold text-[#181926] shadow-sm transition hover:bg-[#b7bdf8]"
        >
          Create Account
        </button>

        <p className="text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link
            to="/"
            className="font-bold text-[#8aadf4] hover:underline"
          >
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}