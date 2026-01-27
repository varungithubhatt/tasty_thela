import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";


export default function Landing() {
  return (
    <>
      <Navbar />

      <section className="min-h-screen flex items-center justify-center
                          bg-gradient-to-br from-orange-50 via-white to-green-50">
        <div className="max-w-7xl w-full px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* LEFT CONTENT */}
          <div className="space-y-6 text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
              Discover the Best
              <span className="text-[color:var(--color-primary)]">
                {" "}Street Food
              </span>
              <br /> Around You 🍜
            </h1>

            <p className="text-lg text-gray-600 max-w-xl mx-auto lg:mx-0">
              LocalBite helps you find trusted street food vendors nearby,
              explore their famous dishes, ratings, photos, and locations —
              all in one place.
            </p>

            <div className="flex justify-center lg:justify-start">
              <Link
                to="/home"
                className="px-8 py-4 rounded-full text-lg font-semibold
                           bg-[color:var(--color-primary)] text-white
                           shadow-lg hover:scale-105 transition-transform"
              >
                Get Started 🚀
              </Link>
            </div>
          </div>

          {/* RIGHT IMAGE */}
          <div className="flex justify-center">
            <img
              src="/steetfood.webp"
              alt="Street food"
              className="w-full max-w-md rounded-2xl shadow-2xl
                         hover:scale-105 transition-transform"
            />
          </div>

        </div>
      </section>

      {/* WHAT IS TASTY THELA */}
      <section id="what" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-3xl font-bold mb-4">
            What is LocalBite?
          </h2>
          <p className="text-gray-600 text-lg">
            LocalBite is a platform that connects food lovers with
            street food vendors by showing authentic reviews, ratings,
            menus, photos, and real-time locations.
          </p>
        </div>
      </section>

      {/* WHY TASTY THELA */}
      <section id="why" className="py-20 bg-gray-50">
        
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-6 text-center">
            
          {[
            ["📍", "Nearby Vendors", "Find the best street food around you"],
            ["⭐", "Trusted Reviews", "Real ratings from real people"],
            ["📸", "Photos & Videos", "See before you visit"]
          ].map(([icon, title, desc]) => (
            <div
              key={title}
              className="p-6 rounded-xl bg-white shadow hover:shadow-lg transition"
            >
              <div className="text-4xl mb-4">{icon}</div>
              <h3 className="font-semibold text-lg">{title}</h3>
              <p className="text-gray-600 mt-2">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
