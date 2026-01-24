import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppNavbar from "../components/AppNavbar";
import ShopCard from "../components/ShopCard";
import api from "../services/api";

export default function FavouritePage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [favourites, setFavourites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);

  /* 🔐 AUTH GUARD */
  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate]);

  /* ❤️ FETCH FAVOURITES */
  useEffect(() => {
    const fetchFavourites = async () => {
      try {
        const res = await api.get("/favourites/me", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setFavourites(res.data || []);
      } catch {
        setFavourites([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFavourites();
  }, [token]);

  /* ❌ REMOVE FAVOURITE (CONFIRMED) */
  const confirmRemove = async () => {
    try {
      await api.post(
        "/favourites/toggle",
        { shopId: removingId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setFavourites(prev =>
        prev.filter(shop => shop._id !== removingId)
      );
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="bg-orange-50 min-h-screen">
      <AppNavbar />

      <main className="md:ml-64 px-4 pt-6 pb-24 max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">❤️ My Favourites</h2>

        {loading && <p className="text-gray-500">Loading favourites...</p>}

        {!loading && favourites.length === 0 && (
          <p className="text-gray-500">
            You haven’t added any favourite shops yet.
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {favourites.map(shop => (
            <div key={shop._id} className="relative group">

              {/* SHOP CARD */}
              <ShopCard shop={shop} />

              {/* REMOVE BUTTON */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setRemovingId(shop._id);
                }}
                className="absolute top-3 right-3 bg-white/90 text-red-600
                  px-3 py-1 rounded-full text-xs font-semibold
                  shadow hover:bg-red-100"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </main>

      {/* 🛑 CONFIRMATION MODAL */}
      {removingId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-lg">
            <h3 className="text-lg font-semibold mb-3">
              Remove from favourites?
            </h3>

            <p className="text-gray-600 mb-6">
              Are you sure you want to remove{" "}
              <span className="font-medium">
                {
                  favourites.find(s => s._id === removingId)
                    ?.shopName
                }
              </span>{" "}
              from your favourites?
            </p>

            <div className="flex gap-3">
              <button
                onClick={confirmRemove}
                className="flex-1 bg-red-500 text-white py-2 rounded-lg font-semibold"
              >
                Yes, Remove
              </button>

              <button
                onClick={() => setRemovingId(null)}
                className="flex-1 border border-gray-300 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
