import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppNavbar from "../components/AppNavbar";
import ShopCard from "../components/ShopCard";
import api from "../services/api";

export default function Home() {
  console.log("home component is running");

  const navigate = useNavigate();

  /* ---------------- SEARCH STATE (NEW) ---------------- */
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  /* ---------------- PERSISTED STATE ---------------- */
  const [radius, setRadius] = useState(() => {
    return Number(localStorage.getItem("home_radius")) || 10;
  });

  const [shops, setShops] = useState(() => {
    const saved = localStorage.getItem("home_shops");
    return saved ? JSON.parse(saved) : [];
  });

  const [location, setLocation] = useState(() => {
    const saved = localStorage.getItem("home_location");
    return saved ? JSON.parse(saved) : null;
  });

  const [loading, setLoading] = useState(false);

  /* ---------------- SAVE STATE ---------------- */
  useEffect(() => {
    localStorage.setItem("home_radius", radius);
  }, [radius]);

  useEffect(() => {
    if (shops.length > 0) {
      localStorage.setItem("home_shops", JSON.stringify(shops));
    }
  }, [shops]);

  useEffect(() => {
    if (location) {
      localStorage.setItem("home_location", JSON.stringify(location));
    }
  }, [location]);

  /* ---------------- GET USER LOCATION ---------------- */
  useEffect(() => {
    if (location) return;

    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
      },
      () => {
        console.error("Location permission denied");
      }
    );
  }, [location]);

  /* ---------------- FETCH SHOPS BY RADIUS ---------------- */
  useEffect(() => {
    if (!location) return;

    let ignore = false;

    const fetchShops = async () => {
      try {
        setLoading(true);

        const res = await api.get(
          `/shops/search/radius?lat=${location.lat}&lng=${location.lng}&radius=${radius}`
        );

        if (!ignore) {
          setShops(
            Array.isArray(res.data?.shops) ? res.data.shops : []
          );
          console.log("Fetched shops:", res.data?.shops);
        }
      } catch (err) {
        if (!ignore) {
          console.error("Failed to fetch shops", err);
          setShops([]);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchShops();

    return () => {
      ignore = true;
    };
  }, [location, radius]);

  /* ---------------- FOOD SUGGESTIONS (NEW) ---------------- */
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    const t = setTimeout(async () => {
      try {
        const res = await api.get(
          `/shops/search/food-suggestions?q=${query}`
        );
        setSuggestions(res.data);
        setShowSuggestions(true);
      } catch {}
    }, 300);

    return () => clearTimeout(t);
  }, [query]);

  /* ---------------- SEARCH HANDLER (NEW) ---------------- */
  const handleSearch = (value) => {
    if (!value.trim()) return;
    navigate(`/search?food=${encodeURIComponent(value)}`);
    setShowSuggestions(false);
  };

  return (
    <div className="bg-orange-50 min-h-screen">
      <AppNavbar />

      <main className="md:ml-64 px-4 pt-6 pb-24">
        {/* TOP SECTION */}
        <div className="max-w-7xl mx-auto flex flex-col gap-4">
          {/* LOCATION */}
          <div className="flex items-center gap-2 text-sm bg-white px-4 py-2 rounded-full w-fit shadow-sm">
            📍 Near You
            <span className="text-green-500 text-xs ml-2">● Live GPS</span>
          </div>

          {/* SEARCH BAR (UPGRADED) */}
          <div className="relative max-w-xl">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={(e) =>
                e.key === "Enter" && handleSearch(query)
              }
              placeholder="Search food or thela (Chaat, Momos, Dosa...)"
              className="w-full px-5 py-3 rounded-xl shadow-sm focus:outline-none"
            />

            <button
              onClick={() => handleSearch(query)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-orange-500"
            >
              🔍
            </button>

            {/* SUGGESTIONS */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-20 bg-white w-full rounded-xl shadow mt-2 overflow-hidden">
                {suggestions.map((s, i) => (
                  <div
                    key={i}
                    onClick={() => handleSearch(s)}
                    className="px-4 py-2 hover:bg-orange-50 cursor-pointer"
                  >
                    {s}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RADIUS */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">
              Search Radius: {radius} km
            </span>
            <input
              type="range"
              min="1"
              max="100"
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="w-40"
            />
          </div>
        </div>

        {/* RECOMMENDED */}
        <section className="max-w-7xl mx-auto mt-8">
          <h2 className="text-xl font-bold mb-4">
            Recommended Thelas Near You
          </h2>

          {loading && (
            <p className="text-gray-500">
              Finding tasty thelas near you...
            </p>
          )}

          {!loading && shops.length === 0 && (
            <p className="text-gray-500">
              No shops found in this radius
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {shops.map((shop) => (
              <ShopCard key={shop._id} shop={shop} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
