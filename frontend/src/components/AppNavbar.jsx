import { Link, useLocation } from "react-router-dom";

const navItems = [
  { name: "Home", path: "/home", icon: "🏠" },
  { name: "Favorites", path: "/favourites", icon: "❤️" },
  { name: "My Cart", path: "/my-thela", icon: "🛒" },
  { name: "Profile", path: "/profile", icon: "👤" },
];

export default function AppNavbar() {
  const location = useLocation();

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex fixed top-0 left-0 h-screen w-64 bg-white/80 backdrop-blur-xl border-r border-gray-200 px-6 py-8 shadow-lg">
        
        <div className="flex flex-col gap-10 w-full">

          {/* Logo */}
          <h1 className="flex items-center gap-2 text-2xl font-extrabold text-orange-500 tracking-wide">
            <img
              src="/thela_image-removebg-preview (1).png"
              alt="logo"
              className="w-9 h-9"
            />
            LoclBite
          </h1>

          {/* Navigation */}
          <nav className="flex flex-col gap-3">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`group flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                  
                  ${
                    isActive
                      ? "bg-orange-500 text-white shadow-md"
                      : "text-gray-600 hover:bg-orange-50"
                  }`}
                >
                  <span
                    className={`flex items-center justify-center w-8 h-8 rounded-lg transition
                    ${
                      isActive
                        ? "bg-white/20"
                        : "bg-gray-100 group-hover:bg-orange-100"
                    }`}
                  >
                    {item.icon}
                  </span>

                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* MOBILE NAVBAR */}
      <nav className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 w-[92%] bg-white/90 backdrop-blur-xl shadow-xl rounded-2xl border border-gray-200 z-50">
        
        <div className="flex justify-around py-3">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.name}
                to={item.path}
                className="flex flex-col items-center gap-1 text-xs"
              >
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all
                  
                  ${
                    isActive
                      ? "bg-orange-500 text-white shadow-md scale-105"
                      : "text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  {item.icon}
                </div>

                <span
                  className={`text-[11px] font-medium ${
                    isActive ? "text-orange-500" : "text-gray-500"
                  }`}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}