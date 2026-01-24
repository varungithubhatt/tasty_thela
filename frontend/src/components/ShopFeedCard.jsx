export default function ShopFeedCard({ shop }) {
  const averageRating =
    shop.ratings
      ? ((shop.ratings.taste + shop.ratings.hygiene) / 2).toFixed(1)
      : 0;

  return (
    <div className="bg-white rounded-xl p-4 shadow">
      <h3 className="text-lg font-bold">{shop.shopName}</h3>

      <p className="text-sm text-gray-500">
        ⭐ {averageRating} ({shop.reviewCount} reviews)
      </p>

      {shop.distanceKm !== undefined && (
        <p className="text-xs text-gray-400">
          📍 {shop.distanceKm.toFixed(2)} km away
        </p>
      )}

      {shop.images?.length > 0 && (
        <img
          src={shop.images[0]}
          alt={shop.shopName}
          className="mt-3 h-40 w-full object-cover rounded-lg"
        />
      )}
    </div>
  );
}
