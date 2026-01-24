import fs from "fs";
import Shop from "../models/shop.model.js";
import cloudinary from "../config/cloudinary.js";

/* ================= CREATE SHOP ================= */
export const createShop = async (req, res) => {
  try {
    const existing = await Shop.findOne({ ownerId: req.user.id });
    if (existing) {
      return res.status(400).json({ message: "Shop already exists" });
    }

    const images = req.files?.images || [];
    const videos = req.files?.videos || [];

    // 📸 IMAGE VALIDATION
    if (images.length < 1 || images.length > 5) {
      return res.status(400).json({
        message: "Upload minimum 1 and maximum 5 images"
      });
    }

    /* ---------- PARSE JSON FIELDS (🔥 CRITICAL) ---------- */
    if (req.body.famousFoods) {
      req.body.famousFoods = JSON.parse(req.body.famousFoods);
    }

    if (req.body.menu) {
      req.body.menu = JSON.parse(req.body.menu);
    }

    if (req.body.timings) {
      req.body.timings = JSON.parse(req.body.timings);
    }

    if (req.body.location) {
      req.body.location = JSON.parse(req.body.location);
    }

    /* ---------- Upload Images ---------- */
    const uploadedImages = [];
    for (const file of images) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "tasty_thela/shops/images"
      });
      uploadedImages.push(result.secure_url);
      fs.unlinkSync(file.path);
    }

    /* ---------- Upload Videos (Optional) ---------- */
    const uploadedVideos = [];
    for (const file of videos) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "tasty_thela/shops/videos",
        resource_type: "video"
      });
      uploadedVideos.push(result.secure_url);
      fs.unlinkSync(file.path);
    }

    const shop = await Shop.create({
      ownerId: req.user.id,
      shopName: req.body.shopName,
      description: req.body.description,
      famousFoods: req.body.famousFoods,
      menu: req.body.menu,
      timings: req.body.timings,
      location: req.body.location,
      mainImage: uploadedImages[0],
      images: uploadedImages,
      videos: uploadedVideos
    });

    res.status(201).json(shop);
  } catch (error) {
    console.error("CREATE SHOP ERROR:", error);
    res.status(500).json({ message: "Failed to create shop" });
  }
};


/* ================= UPDATE SHOP MEDIA ================= */
export const updateShop = async (req, res) => {
  try {
    const shop = req.shop;

    if (req.body.images) shop.images = req.body.images;
    if (req.body.videos) shop.videos = req.body.videos;

    await shop.save();
    res.json(shop);
  } catch {
    res.status(500).json({ message: "Failed to update shop" });
  }
};

/* ================= GEO SEARCH ================= */
export const getNearbyShops = async (req, res) => {
  const { lat, lng, radius = 5000 } = req.query;

  const shops = await Shop.aggregate([
    {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [Number(lng), Number(lat)]
        },
        distanceField: "distance",
        maxDistance: Number(radius),
        spherical: true
      }
    },
    {
      $sort: { averageRating: -1 }
    }
  ]);

  res.json(shops);
};

/* ================= GET SHOP ================= */
export const getShopById = async (req, res) => {
  const shop = await Shop.findById(req.params.id);
  if (!shop) return res.status(404).json({ message: "Shop not found" });
  res.json(shop);
};

/* ================= SEARCH BY FOOD ================= */
export const searchByFood = async (req, res) => {
  try {
    const foodName = req.query.name?.toLowerCase();
    if (!foodName) {
      return res.status(400).json({ message: "Food name required" });
    }

    const shops = await Shop.find({
      famousFoods: { $in: [foodName] }
    }).sort({ averageRating: -1 });

    res.json(shops);
  } catch {
    res.status(500).json({ message: "Search failed" });
  }
};

/* ================= FOOD + DISTANCE ================= */
export const searchByFoodAndDistance = async (req, res) => {
  try {
    const { food, lat, lng } = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    if (!food || !lat || !lng) {
      return res.status(400).json({ message: "food, lat, lng required" });
    }

    const shops = await Shop.aggregate([
      {
        $geoNear: {
          near: { type: "Point", coordinates: [Number(lng), Number(lat)] },
          distanceField: "distance",
          spherical: true
        }
      },
      {
  $match: {
    $or: [
      { shopName: { $regex: food, $options: "i" } },
      { famousFoods: { $regex: food, $options: "i" } },
      { "menu.item": { $regex: food, $options: "i" } }
    ]
  }
}
,
      {
        $addFields: { distanceKm: { $divide: ["$distance", 1000] } }
      },
      { $sort: { distance: 1, averageRating: -1 } },
      { $project: { distance: 0 } },
      { $skip: skip },
      { $limit: limit }
    ]);

    res.json({ page, limit, results: shops.length, shops });
  } catch {
    res.status(500).json({ message: "Search failed" });
  }
};

/* ================= RADIUS SEARCH ================= */
export const searchByRadius = async (req, res) => {
  try {
    const { lat, lng, radius } = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const shops = await Shop.aggregate([
      {
        $geoNear: {
          near: { type: "Point", coordinates: [Number(lng), Number(lat)] },
          distanceField: "distance",
          maxDistance: Number(radius) * 1000,
          spherical: true
        }
      },
      {
        $addFields: { distanceKm: { $divide: ["$distance", 1000] } }
      },
      { $sort: { distance: 1, averageRating: -1 } },
      { $project: { distance: 0 } },
      { $skip: skip },
      { $limit: limit }
    ]);

    res.json({ page, limit, results: shops.length, shops });
  } catch {
    res.status(500).json({ message: "Radius search failed" });
  }
};

/* ================= FOOD AUTOCOMPLETE ================= */
export const foodSuggestions = async (req, res) => {
  try {
    const q = req.query.q?.trim();
    if (!q) return res.json([]);

    const foods = await Shop.aggregate([
      { $unwind: "$famousFoods" },
      { $match: { famousFoods: { $regex: `^${q}`, $options: "i" } } },
      { $group: { _id: "$famousFoods" } },
      { $limit: 10 }
    ]);

    res.json(foods.map(f => f._id));
  } catch {
    res.status(500).json({ message: "Autocomplete failed" });
  }
};

/* ================= UPDATE SHOP (COMPLETE) ================= */
export const updateShopComplete = async (req, res) => {
  try {
    const shop = req.shop;

    /* ================= TEXT / DATA FIELDS ================= */
    const updatableFields = [
      "shopName",
      "description",
      "famousFoods",
      "menu",
      "location",
      "timings" // ✅ timings supported
    ];

    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        // JSON fields come as string in multipart
        if (["famousFoods", "menu", "location", "timings"].includes(field)) {
          shop[field] = JSON.parse(req.body[field]);
        } else {
          shop[field] = req.body[field];
        }
      }
    });

    /* ================= PARTIAL IMAGE UPDATE ================= */
    const newImages = req.files?.images || [];
    const existingImages = req.body.existingImages
      ? JSON.parse(req.body.existingImages)
      : shop.images || [];

    const uploadedImages = [];

    for (const file of newImages) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "tasty_thela/shops/images"
      });
      uploadedImages.push(result.secure_url);
      fs.unlinkSync(file.path);
    }

    const finalImages = [...existingImages, ...uploadedImages];

    if (finalImages.length < 1 || finalImages.length > 5) {
      return res.status(400).json({
        message: "Upload minimum 1 and maximum 5 images"
      });
    }

    shop.images = finalImages;
    shop.mainImage = finalImages[0];

    /* ================= PARTIAL VIDEO UPDATE ================= */
    const newVideos = req.files?.videos || [];
    const existingVideos = req.body.existingVideos
      ? JSON.parse(req.body.existingVideos)
      : shop.videos || [];

    const uploadedVideos = [];

    for (const file of newVideos) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "tasty_thela/shops/videos",
        resource_type: "video"
      });
      uploadedVideos.push(result.secure_url);
      fs.unlinkSync(file.path);
    }

    shop.videos = [...existingVideos, ...uploadedVideos];

    /* ================= SAVE ================= */
    await shop.save();
    res.json(shop);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update shop" });
  }
};


/* ================= GET MY SHOP ================= */
export const getMyShop = async (req, res) => {
  try {
    const shop = await Shop.findOne({ ownerId: req.user.id });

    if (!shop) {
      return res.status(404).json({ message: "No shop found" });
    }

    res.json(shop);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch shop" });
  }
};
