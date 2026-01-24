import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import ShopCard from "../components/ShopCard";

export default function FoodResults() {
  const { name } = useParams(); // food name
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFoodResults = async () => {
      try {
        const res = await api.get(`/shops/search`, {
          params: { food: name }
        });
        setShops(res.data);
      } catch (err) {
        console.error("Food results error", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFoodResults();
  }, [name]);

  if (loading) {
    return <div className="p-6">Loading {name}...</div>;
  }

  return (
    <div className="p-4">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold capitalize">{name}</h1>
        <p className="text-gray-500">
          {shops.length} thelas serving {name}
        </p>
      </div>

      {/* RESULTS */}
      {shops.length === 0 ? (
        <p className="text-gray-500">No shops found</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {shops.map(shop => (
            <ShopCard key={shop._id} shop={shop} />
          ))}
        </div>
      )}
    </div>
  );
}
