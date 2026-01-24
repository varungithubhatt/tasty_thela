import mongoose from "mongoose";

const favouriteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true
    }
  },
  { timestamps: true }
);

/**
 * ✅ One user can favourite MANY shops
 * ❌ Same shop cannot be favourited twice by same user
 */
favouriteSchema.index(
  { userId: 1, shopId: 1 },
  { unique: true }
);

export default mongoose.model("Favourite", favouriteSchema);
