import { useNavigate } from "react-router-dom";

export default function CategoriesGrid({ categories }) {
  const navigate = useNavigate();

  return (
    <section>
      <h2 className="text-xl font-semibold mb-3">🍲 Categories</h2>

      <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
        {categories.map(cat => (
          <button
            key={cat.name}
            onClick={() => navigate(`/category/${cat.name}`)}
            className="bg-white border rounded-xl p-3 text-sm font-medium hover:shadow"
          >
            {cat.name}
            <div className="text-xs text-gray-400">
              {cat.count} thelas
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
