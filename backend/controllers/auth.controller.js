import User from "../models/User.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Shop from "../models/shop.model.js";
import Review from "../models/reviews.modle.js";
import Favourite from "../models/favourite.model.js";
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields required" });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(409).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    res.status(201).json({
      message: "User registered successfully"
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "All fields required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
  token,
  user: {
    _id: user._id,
    name: user.name,
    email: user.email
  }
});
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};



export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    /* 1️⃣ DELETE SHOPS OWNED BY USER */
    const shops = await Shop.find({ ownerId: userId });

    const shopIds = shops.map(s => s._id);

    await Shop.deleteMany({ ownerId: userId });

    /* 2️⃣ DELETE REVIEWS */
    await Review.deleteMany({
      $or: [
        { userId },
        { shopId: { $in: shopIds } } // reviews on user's shops
      ]
    });

    /* 3️⃣ DELETE FAVOURITES */
    await Favourite.deleteMany({
      $or: [
        { userId },
        { shopId: { $in: shopIds } }
      ]
    });

    /* 4️⃣ DELETE USER */
    await User.findByIdAndDelete(userId);

    res.json({ message: "Account deleted successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete account" });
  }
};
