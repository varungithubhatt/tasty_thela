import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import shopRoutes from "./routes/shop.routes.js";
import reviewRoutes from "./routes/reviews.routes.js";
import favouriteRoutes from "./routes/favourite.routes.js";
import exploreRoutes from "./routes/explore.routes.js";
import aiChat from "./routes/aiChat.js";
const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5173",
  "https://tasty-thela-frontend.onrender.com"
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps / Postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));


app.use(express.json());

app.use("/auth", authRoutes);
app.use("/shops", shopRoutes);
app.use("/reviews", reviewRoutes);
app.use("/favourites", favouriteRoutes);
app.use("/explore", exploreRoutes);
app.use("/ai", aiChat);
export default app;
