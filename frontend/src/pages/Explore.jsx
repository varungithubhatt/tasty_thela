import { useEffect, useState } from "react";
import api from "../services/api";
import AppNavbar from "../components/AppNavbar";
import ExploreHeader from "../components/ExploreHeader";
import CategoriesGrid from "../components/CategoriesGrid";
import HorizontalSection from "../components/HorizontalSection";
import FoodCard from "../components/FoodCard";

export default function Explore() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExplore = async () => {
      try {
        const res = await api.get("/explore/home");
        setData(res.data);
      } catch (err) {
        console.error("Explore API error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchExplore();
  }, []);

  if (loading || !data) {
    return (
      <>
        <AppNavbar />
        <div className="p-6">Loading Explore...</div>
      </>
    );
  }

  return (
  <>
    <AppNavbar />

    {/* ✅ MAIN CONTENT WRAPPER */}
    <main className="ml-64 bg-[#fff7ed] min-h-screen">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        <ExploreHeader />

        <CategoriesGrid categories={data.categories || []} />

        <HorizontalSection
          title="🔥 Trending Near You"
          items={data.trendingThelas || []}
        />

        <section>
          <h2 className="text-xl font-semibold mb-3">🍽 Popular Foods</h2>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
            {(data.popularFoods || []).map(food => (
              <FoodCard key={food.food} food={food} />
            ))}
          </div>
        </section>

        <HorizontalSection
          title="⭐ Top Rated Thelas"
          items={data.topRatedThelas || []}
        />

        <HorizontalSection
          title="🆕 New & Upcoming"
          items={data.newThelas || []}
        />

        <HorizontalSection
          title="💸 Budget Friendly"
          items={data.budgetFriendly || []}
        />
      </div>
    </main>
  </>
);

}
