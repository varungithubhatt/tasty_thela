import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppNavbar from "../components/AppNavbar";
import api from "../services/api";

const DAYS = [
  "Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"
];

export default function EditShopPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  /* ================= CORE STATE ================= */
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [shopName, setShopName] = useState("");
  const [description, setDescription] = useState("");
  const [famousFoods, setFamousFoods] = useState("");
  const [menu, setMenu] = useState([{ item: "", price: "" }]);

  /* 🔥 TIMINGS — EXACT CreateShop STRUCTURE */
  const [timeGroups, setTimeGroups] = useState([
    { days: [], slots: [{ open: "", close: "" }] }
  ]);

  const [location, setLocation] = useState(null);

  /* MEDIA */
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);

  const [existingVideos, setExistingVideos] = useState([]);
  const [newVideos, setNewVideos] = useState([]);

  /* 🔐 PREVENT TIMING RESET */
  const timingsInitialized = useRef(false);

  /* ================= FETCH SHOP ================= */
  useEffect(() => {
    const fetchShop = async () => {
      try {
        const res = await api.get(`/shops/${id}`);
        const shop = res.data.shop || res.data;

        if (shop.ownerId !== user?._id) {
          alert("Unauthorized");
          navigate("/");
          return;
        }

        setShopName(shop.shopName);
        setDescription(shop.description || "");
        setFamousFoods((shop.famousFoods || []).join(", "));
        setMenu(shop.menu?.length ? shop.menu : [{ item: "", price: "" }]);

        setExistingImages(shop.images || []);
        setExistingVideos(shop.videos || []);

        /* 🔥 ONLY INIT TIMINGS IF BACKEND HAS THEM */
        if (
          !timingsInitialized.current &&
          Array.isArray(shop.timings) &&
          shop.timings.length > 0
        ) {
          setTimeGroups(
            shop.timings.map(t => ({
              days: [t.day],
              slots: t.slots.map(s => ({ ...s }))
            }))
          );
          timingsInitialized.current = true;
        }

      } catch {
        alert("Shop not found");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchShop();
  }, [id, navigate, user]);

  /* ================= AUTO LOCATION ================= */
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      pos =>
        setLocation({
          type: "Point",
          coordinates: [pos.coords.longitude, pos.coords.latitude]
        }),
      () => {}
    );
  }, []);

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

  /* ================= TIMINGS (BULLETPROOF) ================= */
  const toggleDay = (gi, day) => {
    const updated = structuredClone(timeGroups);
    updated[gi].days = updated[gi].days.includes(day)
      ? updated[gi].days.filter(d => d !== day)
      : [...updated[gi].days, day];
    setTimeGroups(updated);
  };

  const addSlot = (gi) => {
    const updated = structuredClone(timeGroups);
    updated[gi].slots.push({ open: "", close: "" });
    setTimeGroups(updated);
  };

  const updateSlot = (gi, si, field, val) => {
    const updated = structuredClone(timeGroups);
    updated[gi].slots[si][field] = val;
    setTimeGroups(updated);
  };

  const removeSlot = (gi, si) => {
    const updated = structuredClone(timeGroups);
    updated[gi].slots.splice(si, 1);
    setTimeGroups(updated);
  };

  const addTimeGroup = () =>
    setTimeGroups([
      ...timeGroups,
      { days: [], slots: [{ open: "", close: "" }] }
    ]);

  const removeTimeGroup = (gi) =>
    setTimeGroups(timeGroups.filter((_, i) => i !== gi));

  /* ================= IMAGES ================= */
  const handleNewImages = (files) => {
    const total =
      existingImages.length + newImages.length + files.length;
    if (total > 5) {
      alert("Maximum 5 images allowed");
      return;
    }
    setNewImages([...newImages, ...files]);
  };

  const removeExistingImage = (i) =>
    setExistingImages(existingImages.filter((_, idx) => idx !== i));

  const removeNewImage = (i) =>
    setNewImages(newImages.filter((_, idx) => idx !== i));

  /* ================= VIDEOS ================= */
  const removeExistingVideo = (i) =>
    setExistingVideos(existingVideos.filter((_, idx) => idx !== i));

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (existingImages.length + newImages.length < 1) {
      alert("Upload at least 1 image");
      return;
    }

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

    if (location) formData.append("location", JSON.stringify(location));

    formData.append("existingImages", JSON.stringify(existingImages));
    newImages.forEach(img => formData.append("images", img));

    formData.append("existingVideos", JSON.stringify(existingVideos));
    newVideos.forEach(v => formData.append("videos", v));

    try {
      setSaving(true);
      await api.put(`/shops/${id}/complete`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Shop updated successfully 🎉");
      navigate(`/shops/${id}`);
    } catch (err) {
      alert(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <AppNavbar />
        <div className="pt-24 text-center">Loading shop...</div>
      </>
    );
  }

  /* ================= UI ================= */
  return (
    <>
      <AppNavbar />

      <div className="bg-orange-50 min-h-screen pt-24 px-4">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow p-6">

          <h2 className="text-2xl font-bold text-orange-600 mb-6">
            Edit Your Shop
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">

            <input className="w-full border px-4 py-2 rounded"
              value={shopName}
              onChange={e => setShopName(e.target.value)}
              required
            />

            <textarea className="w-full border px-4 py-2 rounded"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />

            <input className="w-full border px-4 py-2 rounded"
              value={famousFoods}
              onChange={e => setFamousFoods(e.target.value)}
            />

            {/* MENU */}
            <div>
              <h3 className="font-semibold mb-2">Menu</h3>
              {menu.map((m, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input className="flex-1 border px-2 py-1 rounded"
                    value={m.item}
                    onChange={e => updateMenu(i,"item",e.target.value)}
                  />
                  <input type="number" className="w-24 border px-2 py-1 rounded"
                    value={m.price}
                    onChange={e => updateMenu(i,"price",e.target.value)}
                  />
                  {menu.length > 1 && (
                    <button type="button" onClick={() => removeMenuItem(i)}>✕</button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addMenuItem}
                className="text-orange-600 text-sm">+ Add item</button>
            </div>

            {/* TIMINGS */}
            <div>
              <h3 className="font-semibold mb-2">Opening Timings</h3>

              {timeGroups.map((g, gi) => (
                <div key={gi} className="border rounded-lg p-3 mb-4 relative">
                  {gi !== 0 && (
                    <button type="button"
                      onClick={() => removeTimeGroup(gi)}
                      className="absolute top-2 right-2 text-red-500">
                      ✕
                    </button>
                  )}

                  <div className="flex flex-wrap gap-2 mb-3">
                    {DAYS.map(day => (
                      <button key={day} type="button"
                        onClick={() => toggleDay(gi, day)}
                        className={`px-3 py-1 border rounded text-sm
                          ${g.days.includes(day) ? "bg-orange-500 text-white" : ""}`}>
                        {day}
                      </button>
                    ))}
                  </div>

                  {g.slots.map((s, si) => (
                    <div key={si} className="flex gap-2 mb-2">
                      <input type="time" value={s.open}
                        onChange={e => updateSlot(gi,si,"open",e.target.value)}
                        className="border px-2 py-1 rounded" />
                      <input type="time" value={s.close}
                        onChange={e => updateSlot(gi,si,"close",e.target.value)}
                        className="border px-2 py-1 rounded" />
                      {g.slots.length > 1 && (
                        <button type="button"
                          onClick={() => removeSlot(gi, si)}
                          className="text-red-500">✕</button>
                      )}
                    </div>
                  ))}

                  <button type="button"
                    onClick={() => addSlot(gi)}
                    className="text-orange-600 text-sm">
                    + Add time slot
                  </button>
                </div>
              ))}

              <button type="button"
                onClick={addTimeGroup}
                className="text-orange-600 text-sm">
                + Add timing group
              </button>
            </div>

            {/* IMAGES */}
            <div>
              <h3 className="font-semibold mb-2">Shop Images</h3>
              <div className="flex flex-wrap gap-2 mb-2">
                {existingImages.map((url,i)=>(
                  <div key={i} className="relative">
                    <img src={url} className="w-16 h-16 rounded object-cover"/>
                    <button type="button"
                      onClick={()=>removeExistingImage(i)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full text-xs">✕</button>
                  </div>
                ))}
                {newImages.map((img,i)=>(
                  <div key={i} className="relative">
                    <img src={URL.createObjectURL(img)} className="w-16 h-16 rounded object-cover"/>
                    <button type="button"
                      onClick={()=>removeNewImage(i)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full text-xs">✕</button>
                  </div>
                ))}
              </div>

              <input type="file" multiple accept="image/*"
                onChange={e => handleNewImages([...e.target.files])}/>
            </div>

            {/* VIDEOS */}
            <div>
              <h3 className="font-semibold mb-2">Shop Videos (optional)</h3>
              {existingVideos.map((_,i)=>(
                <div key={i} className="flex justify-between text-sm mb-1">
                  Existing video {i+1}
                  <button type="button"
                    onClick={()=>removeExistingVideo(i)}
                    className="text-red-500">Remove</button>
                </div>
              ))}
              <input type="file" multiple accept="video/*"
                onChange={e => setNewVideos([...e.target.files])}/>
            </div>

            {/* ACTIONS */}
            <div className="flex gap-4">
              <button type="submit" disabled={saving}
                className="flex-1 bg-orange-500 text-white py-3 rounded-lg font-semibold">
                {saving ? "Saving..." : "Save Changes"}
              </button>

              <button type="button"
                onClick={() => navigate(`/shops/${id}`)}
                className="flex-1 border border-orange-500 text-orange-500 py-3 rounded-lg font-semibold">
                Cancel
              </button>
            </div>

          </form>
        </div>
      </div>
    </>
  );
}
