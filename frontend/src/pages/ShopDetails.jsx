import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AppNavbar from "../components/AppNavbar";
import api from "../services/api";

export default function ShopDetails() {
  const { id } = useParams();

  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);

  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [activeMedia, setActiveMedia] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [isFavourite, setIsFavourite] = useState(false);


  const loggedInUser = JSON.parse(localStorage.getItem("user"));
  const userId = loggedInUser?._id;
  const token = localStorage.getItem("token");

  useEffect(() => {
  if (!token) return;

  const checkFavourite = async () => {
    const res = await api.get("/favourites/me", {
      headers: { Authorization: `Bearer ${token}` }
    });

    setIsFavourite(res.data.some(shop => shop._id === id));

  };

  checkFavourite();
}, [id, token]);

const addToFavourite = async () => {
  if (!token) {
    alert("Login first");
    return navigate("/login");
  }

  await api.post(
  "/favourites/toggle",
  { shopId: id },
  {
    headers: { Authorization: `Bearer ${token}` }
  }
);


  setIsFavourite(true);
};


  /* ---------------- FETCH SHOP ---------------- */

  useEffect(() => {
    const fetchShop = async () => {
      try {
        const res = await api.get(`/shops/${id}`);
        setShop(res.data.shop || res.data);
      } catch {
        setShop(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchShop();
  }, [id]);

  /* ---------------- USER LOCATION ---------------- */
  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        }),
      () => {}
    );
  }, []);

  /* ---------------- REAL-TIME REVIEWS ---------------- */
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await api.get(`/reviews/${id}`);
        setReviews(res.data);
      } catch {}
    };

    fetchReviews();
    const interval = setInterval(fetchReviews, 5000);
    return () => clearInterval(interval);
  }, [id]);

  const hasReviewed = reviews.some(
    (r) => r.userId?._id === userId
  );

  /* ---------------- ADD REVIEW ---------------- */
  const submitReview = async () => {
  // 🔐 LOGIN CHECK
  if (!token || !userId) {
    const goToLogin = window.confirm(
      "You need to login to write a review.\nDo you want to login now?"
    );

    if (goToLogin) {
      navigate("/login");
    }

    return;
  }

  // ❌ VALIDATIONS
  if (!comment.trim()) return;

  if (hasReviewed) {
    alert("You have already reviewed this shop");
    return;
  }

  try {
    setSubmitting(true);

    await api.post(
      `/reviews/${id}`,
      { rating, comment },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setComment("");
    setRating(5);
  } finally {
    setSubmitting(false);
  }
};


  /* ---------------- DELETE REVIEW ---------------- */
  const deleteReview = async (reviewId) => {
    if (!window.confirm("Delete your review?")) return;

    await api.delete(`/reviews/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    setReviews((prev) => prev.filter((r) => r._id !== reviewId));
  };

  /* ---------------- DISTANCE ---------------- */
  const getDistanceKm = () => {
    if (!userLocation || !shop?.location?.coordinates) return null;

    const [lng, lat] = shop.location.coordinates;

    const toRad = (v) => (v * Math.PI) / 180;
    const R = 6371;

    const dLat = toRad(lat - userLocation.lat);
    const dLng = toRad(lng - userLocation.lng);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(userLocation.lat)) *
        Math.cos(toRad(lat)) *
        Math.sin(dLng / 2) ** 2;

    return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(2);
  };

  /* ---------------- DIRECTIONS ---------------- */
  const openDirections = () => {
    if (!userLocation || !shop?.location?.coordinates) return;

    const [lng, lat] = shop.location.coordinates;

    window.open(
      `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${lat},${lng}`,
      "_blank"
    );
  };

  if (loading) return <p className="p-6">Loading...</p>;
  if (!shop) return <p className="p-6">Shop not found</p>;

  const mediaList = [
  ...(shop.images || []).map((url) => ({
    type: "image",
    src: url
  })),
  ...(shop.videos || []).map((url) => ({
    type: "video",
    src: url
  }))
];


  return (
    <div className="bg-orange-50 min-h-screen">
      <AppNavbar />

      <main className="md:ml-64 px-4 pt-6 pb-24">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">

          {/* ================= LEFT ================= */}
          <div className="md:col-span-2 bg-white rounded-2xl shadow p-6 space-y-6">
            <img
              src={shop.mainImage}
              className="w-full h-64 object-cover rounded-xl"
            />

            <div>
              <h1 className="text-2xl font-bold">{shop.shopName}</h1>
              <p className="text-gray-600">{shop.description}</p>

              <div className="flex gap-4 text-sm mt-2">
                <span>⭐ {shop.averageRating?.toFixed(1) || "0.0"}</span>
                {getDistanceKm() && (
                  <span>📍 {getDistanceKm()} km away</span>
                )}
              </div>

              <button
                onClick={openDirections}
                className="mt-3 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
              >
                Direction 📌
              </button>

              <button
              onClick={addToFavourite}
              disabled={isFavourite}
              className={`px-4 py-2 rounded-lg text-sm
                ${isFavourite
                  ? "bg-green-100 text-green-600"
                  : "bg-orange-100 text-orange-600"}`}
            >
              {isFavourite ? "❤️ Added to Favourite" : "🤍 Add to Favourite"}
            </button>

            </div>

            {/* FAMOUS FOODS */}
            {shop.famousFoods?.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Famous For</h3>
                <div className="flex gap-2 flex-wrap">
                  {shop.famousFoods.map((f, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-sm"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* MENU */}
            {shop.menu?.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Menu</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {shop.menu.map((m, i) => (
                    <div
                      key={i}
                      className="flex justify-between bg-gray-50 px-4 py-2 rounded-lg"
                    >
                      <span>{m.item}</span>
                      <span className="font-medium">₹{m.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TIMINGS */}
{shop.timings?.length > 0 && (
  <div>
    <h3 className="font-semibold mb-2">Opening Timings</h3>

    <div className="space-y-2">
      {Object.entries(
        shop.timings.reduce((acc, t) => {
          if (!acc[t.day]) acc[t.day] = [];
          acc[t.day].push(...t.slots);
          return acc;
        }, {})
      ).map(([day, slots]) => (
        <div
          key={day}
          className="flex justify-between items-start bg-gray-50 px-4 py-2 rounded-lg"
        >
          <span className="font-medium">{day}</span>

          <div className="text-sm text-gray-600 text-right space-y-1">
            {slots.map((s, i) => (
              <div key={i}>
                {s.open} – {s.close}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
)}


            {/* MEDIA SECTION (IMAGES + VIDEOS) */}
{/* MEDIA SECTION (IMAGES + VIDEOS) */}
{mediaList.length > 0 && (
  <div>
    <h3 className="font-semibold mb-2">Photos & Videos</h3>

    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {mediaList.map((m, i) => (
        <div
          key={i}
          onClick={() => setActiveMedia(m)}
          className="relative cursor-pointer group"
        >
          {m.type === "video" ? (
            <video
              src={m.src}
              muted
              className="h-32 w-full object-cover rounded-xl"
            />
          ) : (
            <img
              src={m.src}
              alt="shop media"
              className="h-32 w-full object-cover rounded-xl"
            />
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition rounded-xl flex items-center justify-center">
            <span className="text-white text-sm bg-black/60 px-3 py-1 rounded-full">
              View
            </span>
          </div>

          {/* Type badge */}
          <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded">
            {m.type}
          </span>
        </div>
      ))}
    </div>
  </div>
)}


            {/* ADD REVIEW */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Write a Review</h3>

              {hasReviewed ? (
                <p className="text-sm text-gray-500">
                  You have already reviewed this shop.
                </p>
              ) : (
                <div className="flex gap-3 flex-col sm:flex-row">
                  <select
                    value={rating}
                    onChange={(e) => setRating(+e.target.value)}
                    className="border rounded-lg px-3 py-2"
                  >
                    {[5, 4, 3, 2, 1].map((r) => (
                      <option key={r} value={r}>{r} ⭐</option>
                    ))}
                  </select>

                  <input
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="flex-1 border rounded-lg px-4 py-2"
                    placeholder="Share your experience..."
                  />

                  <button
                    onClick={submitReview}
                    disabled={submitting}
                    className="bg-orange-500 text-white px-4 py-2 rounded-lg"
                  >
                    Post
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ================= RIGHT: REVIEWS ================= */}
          <div className="bg-white rounded-2xl shadow p-4 h-[70vh] overflow-y-auto">
            <h3 className="font-semibold mb-3">Reviews</h3>

            {reviews.map((r) => (
              <div key={r._id} className="bg-gray-50 p-3 rounded-xl mb-3">
                <div className="flex justify-between">
                  <p className="font-medium">{r.userId?.name}</p>
                  <span>⭐ {r.rating}</span>
                </div>

                <p className="text-gray-600 mt-1">{r.comment}</p>

                {r.userId?._id === userId && (
                  <button
                    onClick={() => deleteReview(r._id)}
                    className="text-xs text-red-600 mt-2"
                  >
                    Delete
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* ================= LIGHTBOX ================= */}
      {activeMedia && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
          <button
            onClick={() => setActiveMedia(null)}
            className="absolute top-4 right-4 text-white text-3xl"
          >
            ✕
          </button>

          {activeMedia.type === "video" ? (
            <video src={activeMedia.src} controls className="max-h-[90%]" />
          ) : (
            <img src={activeMedia.src} className="max-h-[90%]" />
          )}
        </div>
      )}
    </div>
  );
}
