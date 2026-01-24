export default function ShopCard({ shop }) {
  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <h3 className="text-lg font-semibold">
        {shop.shopName}
      </h3>

      <p className="text-sm text-gray-600">
        ⭐ {shop.averageRating} · {shop.reviewCount} reviews
      </p>

      {shop.distanceKm && (
        <p className="text-sm">
          📍 {shop.distanceKm.toFixed(1)} km away
        </p>
      )}
    </div>
  );
}
