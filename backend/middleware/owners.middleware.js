import Shop from "../models/shop.model.js";

export const isShopOwner = async (req, res, next) => {
  const shop = await Shop.findById(req.params.id);

  if (!shop)
    return res.status(404).json({ message: "Shop not found" });

  if (shop.ownerId.toString() !== req.user.id)
    return res.status(403).json({ message: "Not authorized" });

  req.shop = shop;
  next();
};
