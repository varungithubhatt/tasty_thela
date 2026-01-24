import { useNavigate } from "react-router-dom";

export default function FoodCard({ food }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/food/${food.food}`)}
      className="cursor-pointer bg-white border rounded-xl p-4 text-center hover:shadow"
    >
      <div className="text-lg font-semibold">{food.food}</div>
      <div className="text-xs text-gray-400">
        {food.count} thelas
      </div>
    </div>
  );
}
