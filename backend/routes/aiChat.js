import express from "express";
import axios from "axios";

const router = express.Router();

router.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    const time = new Date().toLocaleTimeString();

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: `
You are LoclBite AI, a street food recommendation assistant.

IMPORTANT RULES:
- only recomend indian street foods
- NEVER write paragraphs
- ONLY return JSON
- Suggest exactly 3 foods
- Reason must be under 10 words

Return ONLY this JSON format:

{
 "foods": ["food1","food2","food3"],
 "reason": "short reason"
}
`
          },
          {
            role: "user",
            content: `
User message: ${message}
Current time: ${time}
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
        foods: ["Momos", "Masala Maggi", "Chicken Roll"],
        reason: "Popular street foods"
      };
    }

    const reply = `
<div>
  <div style="font-weight:600;margin-bottom:6px;">😋 Try these:</div>
  <ul style="margin-left:18px;">
    <li>${parsed.foods[0]}</li>
    <li>${parsed.foods[1]}</li>
    <li>${parsed.foods[2]}</li>
  </ul>
  <div style="margin-top:6px;color:#555;">
    ${parsed.reason}
  </div>
</div>
`;

    res.json({ reply });

  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "AI failed" });
  }
});

export default router;