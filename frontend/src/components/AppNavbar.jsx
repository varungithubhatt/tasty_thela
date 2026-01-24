import { Link, useLocation } from "react-router-dom";

const navItems = [
  { name: "Home", path: "/home", icon: "🏠" },
  // { name: "Explore", path: "/explore", icon: "🧭" },
  // { name: "Nearby", path: "/nearby", icon: "📍" },
  { name: "Favorites", path: "/favourites", icon: "❤️" },
  { name: "My Thela", path: "/my-thela", icon: "🛒" },
  { name: "Profile", path: "/profile", icon: "👤" },
];

export default function AppNavbar() {
  const location = useLocation();

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex fixed top-0 left-0 h-screen w-64 bg-white border-r px-6 py-8">
        <div className="flex flex-col gap-8 w-full">
          <h1 className="text-2xl font-extrabold text-orange-500">
            <img src="/thela_image-removebg-preview (1).png" alt="logo" className="inline w-8 h-8 ml-1 -mt-1"/> Tasty_Thela
          </h1>

          <nav className="flex flex-col gap-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition
                    ${
                      isActive
                        ? "bg-orange-100 text-orange-600"
                        : "hover:bg-gray-100"
                    }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* MOBILE BOTTOM NAV */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t z-50">
        <div className="flex justify-around py-3">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex flex-col items-center text-xs ${
                  isActive ? "text-orange-500" : "text-gray-500"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
