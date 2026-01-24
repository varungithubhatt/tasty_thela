import { useState } from "react";
import { Link } from "react-router-dom";
import AppNavbar from "../components/AppNavbar";
import { createShop } from "../services/shop.api";

const DAYS = [
  "Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"
];

export default function CreateShopForm({ location }) {
  const token = localStorage.getItem("token"); // 🔐 auth check

  /* ================= AUTH GUARD ================= */
  if (!token) {
    return (
      <>
        <AppNavbar />
        <div className="min-h-screen bg-orange-50 flex justify-center px-4">
          <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md">
            <h2 className="text-2xl font-bold text-orange-600 mb-2">
              Login Required
            </h2>
            <p className="text-gray-600 mb-6">
              Please login first to create and manage your shop.
            </p>
            <Link
              to="/login"
              className="inline-block bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600"
            >
              Login to Continue
            </Link>
          </div>
        </div>
      </>
    );
  }

  /* ================= STATE ================= */
  const [shopName, setShopName] = useState("");
  const [description, setDescription] = useState("");
  const [famousFoods, setFamousFoods] = useState("");
  const [menu, setMenu] = useState([{ item: "", price: "" }]);

  const [timeGroups, setTimeGroups] = useState([
    { days: [], slots: [{ open: "", close: "" }] }
  ]);

  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ================= MENU ================= */
  const addMenuItem = () =>
    setMenu([...menu, { item: "", price: "" }]);

  const updateMenu = (i, field, val) => {
    const copy = [...menu];
    copy[i][field] = val;
    setMenu(copy);
  };

  const removeMenuItem = (i) =>
    setMenu(menu.filter((_, idx) => idx !== i));

  /* ================= TIMINGS ================= */
  const toggleDay = (gi, day) => {
    const updated = [...timeGroups];
    updated[gi].days = updated[gi].days.includes(day)
      ? updated[gi].days.filter(d => d !== day)
      : [...updated[gi].days, day];
    setTimeGroups(updated);
  };

  const addSlot = (gi) => {
    const updated = [...timeGroups];
    updated[gi].slots.push({ open: "", close: "" });
    setTimeGroups(updated);
  };

  const updateSlot = (gi, si, field, val) => {
    const updated = [...timeGroups];
    updated[gi].slots[si][field] = val;
    setTimeGroups(updated);
  };

  const removeSlot = (gi, si) => {
    const updated = [...timeGroups];
    updated[gi].slots = updated[gi].slots.filter((_, i) => i !== si);
    setTimeGroups(updated);
  };

  const addTimeGroup = () =>
    setTimeGroups([...timeGroups, { days: [], slots: [{ open: "", close: "" }] }]);

  const removeTimeGroup = (gi) =>
    setTimeGroups(timeGroups.filter((_, i) => i !== gi));

  /* ================= IMAGES ================= */
  const handleImages = (files) => {
    const selected = [...images, ...files];
    if (selected.length > 5) {
      alert("Maximum 5 images allowed");
      return;
    }
    setImages(selected);
  };

  const removeImage = (i) =>
    setImages(images.filter((_, idx) => idx !== i));

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!location) {
      alert("Fetching location, please wait...");
      return;
    }
    if (images.length < 1) return alert("Upload at least 1 image");

    /* 🔁 BACKEND FORMAT */
    const timings = [];
    timeGroups.forEach(g => {
      g.days.forEach(day => {
        timings.push({ day, slots: g.slots });
      });
    });

    const formData = new FormData();
    formData.append("shopName", shopName);
    formData.append("description", description);
    formData.append(
      "famousFoods",
      JSON.stringify(famousFoods.split(",").map(f => f.trim()))
    );
    formData.append("menu", JSON.stringify(menu));
    formData.append("timings", JSON.stringify(timings));
    formData.append(
      "location",
      JSON.stringify({
        type: "Point",
        coordinates: [location.lng, location.lat]
      })
    );

    images.forEach(img => formData.append("images", img));
    videos.forEach(v => formData.append("videos", v));

    try {
      setLoading(true);
      await createShop(formData);
      alert("Shop created successfully 🎉");
      window.location.reload();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create shop");
    } finally {
      setLoading(false);
    }
  };

  return (
  <>
    <AppNavbar />

    {/* 🔽 added pb-28 to prevent bottom navbar overlap */}
    <div className="min-h-screen bg-orange-50 pt-24 px-4 pb-28 mt-10">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-6">

        <h2 className="text-2xl font-bold text-orange-600 mb-6">
          Create Your Shop
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* BASIC INFO */}
          <input
            className="w-full border rounded-lg px-4 py-2"
            placeholder="Shop Name"
            required
            value={shopName}
            onChange={e => setShopName(e.target.value)}
          />

          <textarea
            className="w-full border rounded-lg px-4 py-2"
            placeholder="Description"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />

          <input
            className="w-full border rounded-lg px-4 py-2"
            placeholder="Famous foods (comma separated)"
            value={famousFoods}
            onChange={e => setFamousFoods(e.target.value)}
          />

          {/* LOCATION */}
          <div className="bg-orange-100 text-orange-700 p-3 rounded text-sm">
            {location ? (
              <>📍 {location.lat.toFixed(4)}, {location.lng.toFixed(4)}</>
            ) : (
              "📍 Fetching your location..."
            )}
          </div>

          {/* MENU */}
          <div>
            <h3 className="font-semibold mb-2">Menu</h3>

            {menu.map((m, i) => (
              <div
                key={i}
                className="flex flex-col sm:flex-row gap-2 mb-2"
              >
                <input
                  className="flex-1 border rounded px-3 py-2"
                  placeholder="Item"
                  value={m.item}
                  onChange={e => updateMenu(i, "item", e.target.value)}
                />

                <input
                  type="number"
                  className="w-full sm:w-24 border rounded px-3 py-2"
                  placeholder="₹"
                  value={m.price}
                  onChange={e => updateMenu(i, "price", e.target.value)}
                />

                {menu.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeMenuItem(i)}
                    className="text-red-500 text-sm self-start sm:self-center"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={addMenuItem}
              className="text-orange-600 text-sm"
            >
              + Add item
            </button>
          </div>

          {/* TIMINGS */}
          <div>
            <h3 className="font-semibold mb-2">Opening Timings</h3>

            {timeGroups.map((g, gi) => (
              <div key={gi} className="border rounded-lg p-3 mb-4 relative">

                {gi !== 0 && (
                  <button
                    type="button"
                    onClick={() => removeTimeGroup(gi)}
                    className="absolute top-2 right-2 text-red-500"
                  >
                    ✕
                  </button>
                )}

                <div className="flex flex-wrap gap-2 mb-3">
                  {DAYS.map(day => (
                    <button
                      type="button"
                      key={day}
                      onClick={() => toggleDay(gi, day)}
                      className={`px-3 py-1 rounded border text-sm
                        ${g.days.includes(day)
                          ? "bg-orange-500 text-white"
                          : ""
                        }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>

                {g.slots.map((s, si) => (
                  <div
                    key={si}
                    className="flex flex-col sm:flex-row gap-2 items-start sm:items-center mb-2"
                  >
                    <input
                      type="time"
                      className="border rounded px-2 py-1 w-full sm:w-auto"
                      value={s.open}
                      onChange={e =>
                        updateSlot(gi, si, "open", e.target.value)
                      }
                    />
                    <input
                      type="time"
                      className="border rounded px-2 py-1 w-full sm:w-auto"
                      value={s.close}
                      onChange={e =>
                        updateSlot(gi, si, "close", e.target.value)
                      }
                    />

                    {g.slots.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSlot(gi, si)}
                        className="text-red-500 text-sm"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => addSlot(gi)}
                  className="text-orange-600 text-sm"
                >
                  + Add time slot
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addTimeGroup}
              className="text-orange-600 text-sm"
            >
              + Add different timing group
            </button>
          </div>

          {/* IMAGES */}
          <div>
            <label className="font-semibold">Shop Images</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={e => handleImages([...e.target.files])}
            />

            <div className="flex gap-2 mt-2 flex-wrap">
              {images.map((img, i) => (
                <div key={i} className="relative">
                  <img
                    src={URL.createObjectURL(img)}
                    alt="preview"
                    className="w-16 h-16 object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* VIDEOS */}
          <div>
            <label className="font-semibold">Shop Videos (optional)</label>
            <input
              type="file"
              multiple
              accept="video/*"
              onChange={e => setVideos([...e.target.files])}
            />
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold
                       sm:static sticky bottom-20"
          >
            {loading ? "Creating..." : "Create Shop"}
          </button>

        </form>
      </div>
    </div>
  </>
);

}
