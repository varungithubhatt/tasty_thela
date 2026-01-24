import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import shopRoutes from "./routes/shop.routes.js";
import reviewRoutes from "./routes/reviews.routes.js";
import favouriteRoutes from "./routes/favourite.routes.js";
import exploreRoutes from "./routes/explore.routes.js";
const app = express();

app.use(cors({
    origin: "http://localhost:5173", // frontend URL
    credentials: true
})
);


app.use(express.json());

app.use("/auth", authRoutes);
app.use("/shops", shopRoutes);
app.use("/reviews", reviewRoutes);
app.use("/favourites", favouriteRoutes);
app.use("/explore", exploreRoutes);
export default app;
