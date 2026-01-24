import Review from "../models/reviews.modle.js";
import Shop from "../models/shop.model.js";

// ➕ Add review
export const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const shopId = req.params.shopId;

    await Review.create({
      shopId,
      userId: req.user.id,
      rating,
      comment
    });

    // recalculate average
    const reviews = await Review.find({ shopId });

    const total = reviews.reduce((sum, r) => sum + r.rating, 0);
    const avg = total / reviews.length;

    await Shop.findByIdAndUpdate(shopId, {
      averageRating: avg,
      reviewCount: reviews.length
    });

    res.status(201).json({ message: "Review added" });
  } catch {
    res.status(400).json({ message: "You already reviewed this shop" });
  }
};

// ❌ Delete review
export const deleteReview = async (req, res) => {
  try {
    const shopId = req.params.shopId;

    const review = await Review.findOne({
      shopId,
      userId: req.user.id
    });

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    await review.deleteOne();

    const reviews = await Review.find({ shopId });

    if (reviews.length === 0) {
      await Shop.findByIdAndUpdate(shopId, {
        averageRating: 0,
        reviewCount: 0
      });
    } else {
      const total = reviews.reduce((sum, r) => sum + r.rating, 0);
      await Shop.findByIdAndUpdate(shopId, {
        averageRating: total / reviews.length,
        reviewCount: reviews.length
      });
    }

    res.json({ message: "Review deleted" });
  } catch {
    res.status(500).json({ message: "Delete failed" });
  }
};

// 📄 Get all reviews of a shop
export const getShopReviews = async (req, res) => {
  const reviews = await Review.find({ shopId: req.params.shopId })
    .populate("userId", "name")
    .sort({ createdAt: -1 });

  res.json(reviews);
};
