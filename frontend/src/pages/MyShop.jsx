import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AppNavbar from "../components/AppNavbar";
import { getMyShop } from "../services/shop.api";
import CreateShopForm from "../components/CreateShopForm";

export default function MyShopPage() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const [shop, setShop] = useState(null);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ================= AUTH GUARD ================= */
  if (!token) {
    return (
      <>
        <AppNavbar />
        <div className="min-h-screen bg-orange-50 pt-24 flex justify-center px-4">
          <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md">
            <h2 className="text-2xl font-bold text-orange-600 mb-2">
              Login Required
            </h2>
            <p className="text-gray-600 mb-6">
              Please login first to create and manage your shop.
            </p>
            <Link
              to="/login"
              className="inline-block bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600"
            >
              Login to Continue
            </Link>
          </div>
        </div>
      </>
    );
  }

  /* ================= LOCATION ================= */
  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
      },
      () => {}
    );
  }, []);

  /* ================= FETCH MY SHOP ================= */
  useEffect(() => {
    const fetchShop = async () => {
      try {
        const res = await getMyShop();
        setShop(res.data);
      } catch (err) {
        if (err.response?.status === 404) {
          setShop(null); // ✅ no shop exists
        }
      } finally {
        setLoading(false);
      }
    };

    fetchShop();
  }, []);

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <>
        <AppNavbar />
        <div className="pt-24 text-center text-gray-600">
          Loading your thela...
        </div>
      </>
    );
  }

  /* ================= UI ================= */
  return (
    <>
      <AppNavbar />

      <div className="pb-28 ">

        <main className="max-w-4xl mx-auto">

          

          {/* ================= USER HAS SHOP ================= */}
          {shop ? (
            <div className="bg-white rounded-2xl shadow p-6 space-y-4">
              <h3 className="text-xl font-semibold text-orange-600">
                {shop.shopName}
              </h3>

              <p className="text-gray-600">
                {shop.description || "No description provided"}
              </p>

              <div className="flex gap-4 flex-wrap">
                <button
                  onClick={() => navigate(`/shops/${shop._id}`)}
                  className="bg-orange-500 text-white px-5 py-2 rounded-lg font-semibold hover:bg-orange-600"
                >
                  View Shop 👀
                </button>

                <button
                  onClick={() => navigate(`/shops/${shop._id}/edit`)}
                  className="border border-orange-500 text-orange-500 px-5 py-2 rounded-lg font-semibold hover:bg-orange-50"
                >
                  Update Shop ✏️
                </button>
              </div>
            </div>
          ) : (
            /* ================= NO SHOP → CREATE ================= */
            <CreateShopForm location={location} />
          )}

        </main>
      </div>
    </>
  );
}
