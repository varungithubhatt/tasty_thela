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
          Local<span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">Bite</span><img src="/thela_image-removebg-preview (1).png" alt="logo" className="inline w-8 h-8 ml-1 -mt-1"/>
        </Link>

        {/* RIGHT: LINKS + LOGIN */}
        <div className="flex items-center gap-6">
          {/* Desktop links */}
          <div className="hidden md:flex gap-6 text-sm font-medium">
            <a
              href="#what"
              className="hover:text-[color:var(--color-primary)] transition"
            >
              What is LocalBite?
            </a>
            <a
              href="#why"
              className="hover:text-[color:var(--color-primary)] transition"
            >
              Why LocalBite?
            </a>
          </div>

          {/* Login Button */}
          <Link
            to="/login"
            className="
              px-4 py-2
              rounded-full text-sm font-semibold
              bg-orange-400 text-white
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
