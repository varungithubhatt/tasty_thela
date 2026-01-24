import Favourite from "../models/favourite.model.js";

/* ❤️ TOGGLE FAVOURITE */
export const toggleFavourite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { shopId } = req.body;

    const existing = await Favourite.findOne({ userId, shopId });

    if (existing) {
      await existing.deleteOne();
      return res.json({ favourite: false });
    }

    await Favourite.create({ userId, shopId });
    res.json({ favourite: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update favourite" });
  }
};

/* ⭐ CHECK IF SHOP IS FAVOURITE */
export const isFavourite = async (req, res) => {
  try {
    const userId = req.user.id;
    const shopId = req.params.shopId;

    const fav = await Favourite.findOne({ userId, shopId });
    res.json({ favourite: !!fav });

  } catch {
    res.status(500).json({ message: "Failed to check favourite" });
  }
};

/* 📌 GET USER FAVOURITES */
export const getMyFavourites = async (req, res) => {
  try {
    const favourites = await Favourite.find({ userId: req.user.id })
      .populate("shopId");

    res.json(favourites.map(f => f.shopId));

  } catch {
    res.status(500).json({ message: "Failed to fetch favourites" });
  }
};
