import mongoose from "mongoose";

const timingSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
      ],
      required: true
    },
    slots: [
      {
        open: { type: String, required: true },  // "09:00"
        close: { type: String, required: true }  // "14:00"
      }
    ]
  },
  { _id: false }
);

const shopSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },

    shopName: {
      type: String,
      required: true,
      trim: true
    },

    description: String,

    famousFoods: [String],

    menu: [
      {
        item: String,
        price: Number
      }
    ],

    timings: [timingSchema], // ⭐ NEW FIELD

    mainImage: {
      type: String,
      required: true
    },

    images: {
      type: [String],
      validate: {
        validator: (arr) => arr.length >= 1 && arr.length <= 5,
        message: "Upload minimum 1 and maximum 5 images"
      }
    },

    videos: [String],

    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true
      }
    },

    averageRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

shopSchema.index({ location: "2dsphere" });

export default mongoose.model("Shop", shopSchema);
