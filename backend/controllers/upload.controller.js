import cloudinary from "../config/cloudinary.js";
import fs from "fs";

export const uploadMedia = async (req, res) => {
  try {
    const images = [];
    const videos = [];

    // Upload images to Cloudinary
    if (req.files?.images) {
      for (const file of req.files.images) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "tasty_thela",
          resource_type: "image"
        });

        images.push(result.secure_url);

        // delete local file
        fs.unlinkSync(file.path);
      }
    }

    // Upload videos to Cloudinary
    if (req.files?.videos) {
      for (const file of req.files.videos) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "tasty_thela",
          resource_type: "video"
        });

        videos.push(result.secure_url);

        // delete local file
        fs.unlinkSync(file.path);
      }
    }

    return res.status(200).json({
      success: true,
      images,
      videos
    });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return res.status(500).json({
      success: false,
      message: "Media upload failed"
    });
  }
};
