import { useNavigate } from "react-router-dom";

/* ================= OPEN STATUS HELPER ================= */
const isShopOpenNow = (shop) => {
  // 🟢 If no timings → assume OPEN
  if (!Array.isArray(shop.timings) || shop.timings.length === 0) {
    return true;
  }

  const now = new Date();

  const today = now.toLocaleDateString("en-US", {
    weekday: "long"
  });

  const currentMinutes =
    now.getHours() * 60 + now.getMinutes();

  // Get today's timing entries
  const todayTimings = shop.timings.filter(
    (t) => t.day === today
  );

  if (todayTimings.length === 0) return false;

  // Check if current time is inside ANY slot
  return todayTimings.some((t) =>
    t.slots.some((slot) => {
      if (!slot.open || !slot.close) return false;

      const [oh, om] = slot.open.split(":").map(Number);
      const [ch, cm] = slot.close.split(":").map(Number);

      const openMinutes = oh * 60 + om;
      const closeMinutes = ch * 60 + cm;

      return (
        currentMinutes >= openMinutes &&
        currentMinutes <= closeMinutes
      );
    })
  );
};

export default function ShopCard({ shop }) {
  const navigate = useNavigate();

  if (!shop || !shop._id) {
    console.warn("Invalid shop data:", shop);
    return null;
  }

  const openNow = isShopOpenNow(shop);

  const handleClick = () => {
    navigate(`/shops/${shop._id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden cursor-pointer"
    >
      <img
        src={shop.mainImage}
        alt={shop.shopName}
        className="h-40 w-full object-cover"
      />

      <div className="p-4 flex flex-col gap-2">
        <h3 className="font-semibold text-lg">
          {shop.shopName}
        </h3>

        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            📍{" "}
            {typeof shop.distanceKm === "number"
              ? shop.distanceKm.toFixed(1)
              : "--"}{" "}
            km away
          </span>

          {/* 🔥 REAL-TIME OPEN BADGE */}
          <span
            className={`text-xs px-2 py-1 rounded-full font-medium
              ${
                openNow
                  ? "bg-green-100 text-green-600"
                  : "bg-red-100 text-red-600"
              }`}
          >
            {openNow ? "OPEN" : "CLOSED"}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span>
            ⭐ {shop.averageRating?.toFixed(1) ?? "0.0"} (
            {shop.reviewCount ?? 0})
          </span>
        </div>
      </div>
    </div>
  );
}
