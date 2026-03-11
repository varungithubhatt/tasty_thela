import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/auth";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await loginUser(form);

      /*
        BACKEND RESPONSES CAN BE:
        1. { token, user: {...} }
        2. { token, id, email }
        3. { token, _id }
        4. { token, data: { user } }
      */

      // 🔑 Always store token
      localStorage.setItem("token", data.token);

      // 🧠 Normalize user object safely
      const user =
        data.user ||
        data.data?.user ||
        {
          _id: data._id || data.id,
          email: form.email
        };

      if (!user?._id) {
        throw new Error("User ID missing in login response");
      }

      localStorage.setItem("user", JSON.stringify(user));

      navigate("/home");
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err.response?.data?.message ||
        err.message ||
        "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };
const handleSkip = () => {
  navigate("/home");
};

  return (
    <div className="min-h-screen flex items-center justify-center
                    bg-gradient-to-br from-orange-50 via-white to-green-50 px-4">

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-bold text-center mb-2">
          Welcome Back 👋
        </h2>

        <p className="text-center text-sm text-gray-500 mb-6">
          Login to continue discovering tasty thelas
        </p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && (
            <p className="text-red-500 text-sm text-center">
              {error}
            </p>
          )}

          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
          />

          <button
            disabled={loading}
            className="w-full py-3 rounded-lg font-semibold text-white
                        bg-orange-500 hover:bg-orange-600 transition-colors
                       hover:opacity-90 transition
                       disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
          <button
  type="button"
  onClick={handleSkip}
  className="w-full py-3 rounded-lg font-medium
             border border-gray-300 text-gray-600
             hover:bg-gray-50 transition"
>
  Skip for now →
</button>

        </form>

        <p className="text-center text-sm mt-6">
          Don’t have an account?{" "}
          <Link
            to="/signup"
            className="text-[color:var(--color-primary)] font-medium"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
