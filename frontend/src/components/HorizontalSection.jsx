import ShopCard from "./ShopCard";

export default function HorizontalSection({ title, items }) {
  if (!items || items.length === 0) return null;

  return (
    <section>
      <h2 className="text-xl font-semibold mb-3">{title}</h2>

      <div className="flex gap-4 overflow-x-auto pb-2">
        {items.map(shop => (
          <div key={shop._id} className="min-w-[260px]">
            <ShopCard shop={shop} />
          </div>
        ))}
      </div>
    </section>
  );
}
