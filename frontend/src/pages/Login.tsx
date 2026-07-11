import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { FileSearch, Mail, Lock, AlertCircle } from "lucide-react";
import ThemeToggle from "../components/ThemeToggle";

export default function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
   console.log("API_URL =", API_URL);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Logging you in...");

    try {
      const response = await axios.post(
        `${API_URL}/api/auth/login`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      toast.success(
        response.data.message || "Logged in successfully!",
        {
          id: toastId,
        }
      );

      localStorage.setItem("token", response.data.token);
      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      );

      navigate("/dashboard");
    } catch (err: any) {
      const message =
        err.response?.data?.error ||
        "Login failed. Please check your credentials.";

      setError(message);
      toast.error(message, {
        id: toastId,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-slate-900">
      <header className="px-6 py-4 flex justify-between items-center bg-white dark:bg-slate-900 shadow">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
            <FileSearch size={18} />
          </div>

          <span className="font-bold text-lg">
            AI Resume Analyzer
          </span>
        </Link>

        <ThemeToggle />
      </header>

      <main className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8">

          <h2 className="text-2xl font-bold text-center mb-2">
            Login
          </h2>

          <p className="text-center text-gray-500 mb-6">
            Login to continue
          </p>

          {error && (
            <div className="mb-4 flex items-center gap-2 text-red-500 bg-red-100 p-3 rounded-lg">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label>Email</label>

              <div className="relative mt-1">
                <Mail
                  className="absolute left-3 top-3 text-gray-400"
                  size={18}
                />

                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full border rounded-lg py-2 pl-10 pr-3"
                  placeholder="Enter email"
                />
              </div>
            </div>

            <div>
              <label>Password</label>

              <div className="relative mt-1">
                <Lock
                  className="absolute left-3 top-3 text-gray-400"
                  size={18}
                />

                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full border rounded-lg py-2 pl-10 pr-3"
                  placeholder="Enter password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold"
            >
              {loading ? "Logging In..." : "Login"}
            </button>

          </form>

          <p className="text-center mt-6">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-indigo-600 font-semibold"
            >
              Register
            </Link>
          </p>

        </div>
      </main>

      <footer className="text-center py-5 text-gray-400 text-sm">
        © 2026 AI Resume Analyzer
      </footer>
    </div>
  );
}