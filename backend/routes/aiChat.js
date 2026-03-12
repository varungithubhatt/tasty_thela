import express from "express";
import axios from "axios";
import Shop from "../models/shop.model.js";
import moodData from "../data/mood.js";

const { moodEngine, naturalQueryEngine } = moodData;
const router = express.Router();

/* ================================
   FOOD BRAIN
================================ */

const foodBrain = {
  hungry: ["momos", "pav bhaji", "burger", "pani puri"],
  snack: ["samosa", "kachori", "chaat", "pani puri"],
  sweet: ["jalebi", "gulab jamun", "cake", "rabri"],
  spicy: ["chole bhature", "vada pav", "momos"],
  drink: ["lassi", "cold coffee", "juice"]
};

/* ================================
   MOOD RESPONSES
================================ */



router.post("/chat", async (req, res) => {
  try {

    const { message, lat, lng } = req.body;
    const msgLower = message.toLowerCase();


   /* ================================
   MOOD DETECTION
================================ */

for (const mood of moodEngine) {

if (mood.keywords.some(word => msgLower.includes(word))) {

const foods = mood.foods;

const regexFoods = foods.map(
f => new RegExp(`\\b${f}\\b`, "i")
);

let shops = await Shop.find({
$or:[
{famousFoods:{$in:regexFoods}},
{"menu.item":{$in:regexFoods}}
]
})
.limit(4)
.select("shopName mainImage averageRating famousFoods menu");

let vendors=[];

if(shops.length>0){

vendors = shops.map(shop=>({
  id: shop._id,
shopName:shop.shopName,
image:shop.mainImage,
rating:shop.averageRating
}));

}else{

const fallback = await Shop.find({})
.sort({averageRating:-1})
.limit(4)
.select("shopName mainImage averageRating");

vendors = fallback.map(shop=>({
   id: shop._id,
shopName:shop.shopName,
image:shop.mainImage,
rating:shop.averageRating
}));

}

return res.json({
type:"foods",
message:mood.message,
foods,
vendors
});

}
}
    /* ================================
       CALL AI
    ================================= */

    for (const query of naturalQueryEngine){

if(query.keywords.some(word=>msgLower.includes(word))){

const foods=query.foods;

const regexFoods = foods.map(
f=>new RegExp(`\\b${f}\\b`,"i")
);

let shops = await Shop.find({
$or:[
{famousFoods:{$in:regexFoods}},
{"menu.item":{$in:regexFoods}}
]
})
.limit(4)
.select("shopName mainImage averageRating famousFoods menu");

const vendors = shops.map(shop=>({
id: shop._id,
shopName:shop.shopName,
image:shop.mainImage,
rating:shop.averageRating
}));

return res.json({
type:"foods",
message:"These might be perfect for you 😋",
foods,
vendors
});

}
}

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content: `
You are LocalBite AI.

Return ONLY JSON.

Structure:

{
 "intent": "vendors" | "food_suggestion",
 "foods": [],
 "sort": "rating" | "distance",
 "nearby": boolean,
 "limit": number
}

Rules:

Default limit = 4.

If user asks for number of vendors like:
"show 2 vendors" or "5 shops"
then set limit accordingly.

If user mentions food name
add it to foods array.

If user asks what to eat
intent = food_suggestion.
`
          },
          {
            role: "user",
            content: `
User message: ${message}

Latitude: ${lat || "unknown"}
Longitude: ${lng || "unknown"}

Location available: ${lat && lng ? "yes" : "no"}
`
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    let aiText = response.data.choices[0].message.content;

    let parsed;

    try {
      parsed = JSON.parse(aiText);
    } catch {
      parsed = {
        intent: "food_suggestion",
        foods: ["momos", "pani puri"],
        limit: 4
      };
    }

    /* ================================
       FOOD BRAIN FALLBACK
    ================================= */

    if (!parsed.foods || parsed.foods.length === 0) {

      for (let mood in foodBrain) {

        if (msgLower.includes(mood)) {
          parsed.foods = foodBrain[mood];
          break;
        }
      }
    }

    const limit = parsed.limit || 4;

    /* ================================
       FOOD SEARCH
    ================================= */

    if (parsed.foods && parsed.foods.length > 0) {

      const regexFoods = parsed.foods.map(
        f => new RegExp(`\\b${f}\\b`, "i")
      );

      let shops = await Shop.find({
        $or: [
          { famousFoods: { $in: regexFoods } },
          { "menu.item": { $in: regexFoods } }
        ]
      })
        .limit(limit)
        .select("shopName mainImage averageRating famousFoods menu");

      /* If no shops found */

      if (shops.length === 0) {

        const fallback = await Shop.find({})
          .sort({ averageRating: -1 })
          .limit(4)
          .select("shopName mainImage averageRating");

        const vendors = fallback.map(shop => ({
          id: shop._id,
          shopName: shop.shopName,
          image: shop.mainImage,
          rating: shop.averageRating
        }));

        return res.json({
          type: "vendors",
          message: `Sorry, I couldn't find ${parsed.foods.join(", ")} nearby. Here are some popular vendors instead.`,
          vendors
        });
      }

      const vendors = shops.map(shop => {

        const matchedFood =
          shop.famousFoods?.find(f =>
            parsed.foods.some(food =>
              f.toLowerCase().includes(food.toLowerCase())
            )
          ) ||
          shop.menu?.find(m =>
            parsed.foods.some(food =>
              m.item.toLowerCase().includes(food.toLowerCase())
            )
          )?.item;

        return {
          id: shop._id,
          shopName: shop.shopName,
          image: shop.mainImage,
          rating: shop.averageRating,
          food: matchedFood
        };
      });

      return res.json({
        type: "foods",
        message: `Here are some places for ${parsed.foods.join(", ")} 👇`,
        foods: parsed.foods,
        vendors
      });
    }

    /* ================================
       GENERAL VENDORS
    ================================= */

    let query = {};

    if (parsed.nearby && lat && lng) {
      query.location = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [lng, lat]
          },
          $maxDistance: 5000
        }
      };
    }

    let shopsQuery = Shop.find(query)
      .select("shopName mainImage averageRating");

    if (parsed.sort === "rating") {
      shopsQuery = shopsQuery.sort({ averageRating: -1 });
    }

    let shops = await shopsQuery.limit(limit);

    const vendors = shops.map(shop => ({
      id: shop._id,
      shopName: shop.shopName,
      image: shop.mainImage,
      rating: shop.averageRating
    }));

    return res.json({
      type: "vendors",
      message: "Here are some vendors you might like 👇",
      vendors
    });

  } catch (err) {

    console.error(err.response?.data || err.message);

    res.status(500).json({
      type: "error",
      message: "AI failed 😅"
    });
  }
});

export default router;