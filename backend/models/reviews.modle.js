// models/Review.model.js
import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      trim: true
    }
  },
  { timestamps: true }
);

// 🔒 One review per user per shop
reviewSchema.index({ shopId: 1, userId: 1 }, { unique: true });

export default mongoose.model("Review", reviewSchema);
