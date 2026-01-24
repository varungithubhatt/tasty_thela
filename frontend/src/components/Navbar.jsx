import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav
      className="
        fixed top-0 left-0 w-full z-50
        backdrop-blur-md bg-white/70
      "
    >
      <div
        className="
          max-w-7xl mx-auto
          px-4
          py-3 md:py-5
          flex items-center justify-between
        "
      >
        {/* LEFT: LOGO */}
        <Link
          to="/"
          className="
            text-xl md:text-2xl
            font-extrabold tracking-wide
            text-[color:var(--color-primary)]
          "
        >
          Tasty Thela 🍔
        </Link>

        {/* RIGHT: LINKS + LOGIN */}
        <div className="flex items-center gap-6">
          {/* Desktop links */}
          <div className="hidden md:flex gap-6 text-sm font-medium">
            <a
              href="#what"
              className="hover:text-[color:var(--color-primary)] transition"
            >
              What is Tasty Thela?
            </a>
            <a
              href="#why"
              className="hover:text-[color:var(--color-primary)] transition"
            >
              Why Tasty Thela?
            </a>
          </div>

          {/* Login Button */}
          <Link
            to="/login"
            className="
              px-4 py-2
              rounded-full text-sm font-semibold
              bg-[color:var(--color-primary)] text-white
              hover:opacity-90 transition
            "
          >
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
}
