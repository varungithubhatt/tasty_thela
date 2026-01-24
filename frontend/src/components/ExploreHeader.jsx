import { useNavigate } from "react-router-dom";

export default function ExploreHeader() {
  const navigate = useNavigate();

  return (
    <div>
      <h1 className="text-2xl font-bold">Explore</h1>
      <p className="text-gray-500 mb-4">
        Discover food & thelas you’ll love
      </p>

      <input
        placeholder="Search food or thela..."
        className="w-full p-3 rounded-xl border"
        onKeyDown={e => {
          if (e.key === "Enter") {
            navigate(`/search?q=${e.target.value}`);
          }
        }}
      />
    </div>
  );
}
