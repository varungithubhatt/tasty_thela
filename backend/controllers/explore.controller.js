import Shop from "../models/shop.model.js";

export const getExploreCategories = async (req, res) => {
  try {
    const categories = await Shop.aggregate([
      { $unwind: "$famousFoods" },
      {
        $group: {
          _id: { $toLower: "$famousFoods" },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 12 }
    ]);

    res.json(categories.map(c => ({
      name: c._id,
      count: c.count
    })));
  } catch {
    res.status(500).json({ message: "Failed to fetch categories" });
  }
};
export const getTrendingThelas = async (req, res) => {
  try {
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const shops = await Shop.find({
      $or: [
        { createdAt: { $gte: twoWeeksAgo } },
        { reviewsCount: { $gte: 5 } }
      ]
    })
      .sort({ reviewsCount: -1, averageRating: -1 })
      .limit(10);

    res.json(shops);
  } catch {
    res.status(500).json({ message: "Failed to fetch trending thelas" });
  }
};
export const getPopularFoods = async (req, res) => {
  try {
    const foods = await Shop.aggregate([
      { $unwind: "$famousFoods" },
      {
        $group: {
          _id: "$famousFoods",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json(
      foods.map(f => ({
        food: f._id,
        count: f.count
      }))
    );
  } catch {
    res.status(500).json({ message: "Failed to fetch popular foods" });
  }
};
export const getTopRatedThelas = async (req, res) => {
  try {
    const shops = await Shop.find({
      averageRating: { $gte: 4.5 },
      reviewsCount: { $gte: 5 }
    })
      .sort({ averageRating: -1 })
      .limit(10);

    res.json(shops);
  } catch {
    res.status(500).json({ message: "Failed to fetch top rated thelas" });
  }
};
export const getNewThelas = async (req, res) => {
  try {
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - 14);

    const shops = await Shop.find({
      createdAt: { $gte: daysAgo }
    })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json(shops);
  } catch {
    res.status(500).json({ message: "Failed to fetch new thelas" });
  }
};
export const getBudgetFriendlyThelas = async (req, res) => {
  try {
    const shops = await Shop.aggregate([
      { $unwind: "$menu" },
      {
        $group: {
          _id: "$_id",
          shop: { $first: "$$ROOT" },
          avgPrice: { $avg: "$menu.price" }
        }
      },
      { $match: { avgPrice: { $lte: 120 } } },
      { $limit: 10 }
    ]);

    res.json(shops.map(s => s.shop));
  } catch {
    res.status(500).json({ message: "Failed to fetch budget thelas" });
  }
};
export const getTimeBasedThelas = async (req, res) => {
  try {
    const { type } = req.query;

    let start, end;

    if (type === "evening") {
      start = 16;
      end = 19;
    } else if (type === "late-night") {
      start = 21;
      end = 24;
    }

    const shops = await Shop.find({
      "timings.open": { $lte: start },
      "timings.close": { $gte: end }
    }).limit(10);

    res.json(shops);
  } catch {
    res.status(500).json({ message: "Failed to fetch time-based thelas" });
  }
};


export const getExploreHome = async (req, res) => {
  try {
    const now = new Date();

    /* ================= CATEGORIES ================= */
    const categories = await Shop.aggregate([
      { $unwind: "$famousFoods" },
      {
        $group: {
          _id: { $toLower: "$famousFoods" },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 12 }
    ]);

    /* ================= TRENDING ================= */
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const trendingThelas = await Shop.find({
      $or: [
        { createdAt: { $gte: twoWeeksAgo } },
        { reviewsCount: { $gte: 5 } }
      ]
    })
      .sort({ reviewsCount: -1, averageRating: -1 })
      .limit(10);

    /* ================= POPULAR FOODS ================= */
    const popularFoods = await Shop.aggregate([
      { $unwind: "$famousFoods" },
      {
        $group: {
          _id: "$famousFoods",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    /* ================= TOP RATED ================= */
    const topRatedThelas = await Shop.find({
      averageRating: { $gte: 4.5 },
      reviewsCount: { $gte: 5 }
    })
      .sort({ averageRating: -1 })
      .limit(10);

    /* ================= NEW THELAS ================= */
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const newThelas = await Shop.find({
      createdAt: { $gte: fourteenDaysAgo }
    })
      .sort({ createdAt: -1 })
      .limit(10);

    /* ================= BUDGET FRIENDLY ================= */
    const budgetFriendly = await Shop.aggregate([
      { $unwind: "$menu" },
      {
        $group: {
          _id: "$_id",
          shop: { $first: "$$ROOT" },
          avgPrice: { $avg: "$menu.price" }
        }
      },
      { $match: { avgPrice: { $lte: 120 } } },
      { $limit: 10 }
    ]).then(res => res.map(r => r.shop));

    /* ================= TIME BASED ================= */
    const hour = now.getHours();

    let evening = [];
    let lateNight = [];

    if (hour >= 16 && hour <= 19) {
      evening = await Shop.find({
        "timings.open": { $lte: 16 },
        "timings.close": { $gte: 19 }
      }).limit(10);
    }

    if (hour >= 21 || hour <= 2) {
      lateNight = await Shop.find({
        "timings.open": { $lte: 21 }
      }).limit(10);
    }

    /* ================= RESPONSE ================= */
    res.json({
      categories: categories.map(c => ({
        name: c._id,
        count: c.count
      })),
      trendingThelas,
      popularFoods: popularFoods.map(f => ({
        food: f._id,
        count: f.count
      })),
      topRatedThelas,
      newThelas,
      budgetFriendly,
      timeBased: {
        evening,
        lateNight
      }
    });

  } catch (error) {
    console.error("EXPLORE HOME ERROR:", error);
    res.status(500).json({ message: "Failed to load explore page" });
  }
};
