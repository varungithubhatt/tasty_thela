import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import AppNavbar from "../components/AppNavbar";
import ShopCard from "../components/ShopCard";
import api from "../services/api";

export default function SearchResults() {
  const [params] = useSearchParams();
  const food = params.get("food");

  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState(null);

  /* USER LOCATION */
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition((pos) => {
      setLocation({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      });
    });
  }, []);

  /* FETCH SHOPS */
  useEffect(() => {
    if (!food || !location) return;

    const fetch = async () => {
      try {
        const res = await api.get("/shops/search", {
          params: {
            food,
            lat: location.lat,
            lng: location.lng
          }
        });
        setShops(res.data.shops);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [food, location]);

  return (
    <div className="bg-orange-50 min-h-screen">
      <AppNavbar />

      <main className="md:ml-64 px-4 pt-6 pb-24 max-w-6xl mx-auto">
        <h2 className="text-xl font-semibold mb-4">
          Results for “{food}”
        </h2>

        {loading && <p>Searching...</p>}

        {!loading && shops.length === 0 && (
          <p className="text-gray-500">No shops found</p>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {shops.map((shop) => (
            <ShopCard key={shop._id} shop={shop} />
          ))}
        </div>
      </main>
    </div>
  );
}
