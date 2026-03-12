import { useState, useRef, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function AIChatbot() {
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
const [showHint, setShowHint] = useState(true);
  const chatEndRef = useRef(null);
useEffect(() => {
  const interval = setInterval(() => {

    if (!open) {
      setShowHint(true);

      setTimeout(() => {
        setShowHint(false);
      }, 4000); // visible for 4 seconds
    }

  }, 8000); // repeat every 8 seconds

  return () => clearInterval(interval);
}, [open]);
  /* =========================
     AUTO SCROLL
  ========================= */

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  /* =========================
     SEND MESSAGE
  ========================= */

  const sendMessage = async () => {

    if (!input.trim()) return;

    const userMessage = {
      sender: "user",
      text: input
    };

    setMessages(prev => [...prev, userMessage]);

    setLoading(true);

    try {

      navigator.geolocation.getCurrentPosition(

        async (pos) => {

          const res = await api.post("/ai/chat", {
            message: input,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          });

          setMessages(prev => [
            ...prev,
            {
              sender: "ai",
              data: res.data
            }
          ]);

          setLoading(false);
        },

        async () => {

          // location denied fallback
          const res = await api.post("/ai/chat", {
            message: input
          });

          setMessages(prev => [
            ...prev,
            {
              sender: "ai",
              data: res.data
            }
          ]);

          setLoading(false);
        }

      );

    } catch {

      setMessages(prev => [
        ...prev,
        { sender: "ai", error: true }
      ]);

      setLoading(false);
    }

    setInput("");
  };

  /* =========================
     QUICK PROMPTS
  ========================= */

  const quickAsk = (text) => {
    setInput(text);
  };

  return (
    <>
      {/* FLOATING BUTTON */}

      <div className="fixed bottom-20 md:bottom-14 right-2 md:right-10 z-50 flex flex-col items-end gap-2">

  {/* Hint Message */}
  {showHint && !open && (
    <div className="bg-white shadow-lg border px-4 py-2 rounded-xl text-sm animate-bounce">
      🤖 Not sure what to type? <br/>
      <span className="text-orange-500 font-medium">
        Tell me your mood!
      </span>

      {/* arrow */}
      <div className="absolute right-6 bottom-[-6px] w-3 h-3 bg-white rotate-45 border-r border-b"></div>
    </div>
  )}

  {/* Chatbot Button */}
  <button
    onClick={() => {
      setOpen(!open);
      setShowHint(false);
    }}
    className="bg-gradient-to-r from-orange-500 to-red-500 text-white 
p-3 md:p-4 
rounded-full 
shadow-xl 
hover:scale-105 
transition"
  >
    🤖
  </button>

</div>

      {/* CHAT WINDOW */}

      {open && (

        <div className="
fixed 
bottom-24 md:bottom-29 
right-0 md:right-10
w-[80vw] md:w-[380px]
h-[70vh] md:h-[520px]
max-w-[420px]
bg-white 
rounded-t-2xl md:rounded-2xl 
shadow-2xl 
flex flex-col 
border border-gray-200 
overflow-hidden
z-50
">

          {/* HEADER */}

          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold">

            <div className="flex items-center gap-2">
              🤖 <span>LoclBite AI</span>
            </div>

            <button
              onClick={() => setOpen(false)}
              className="opacity-80 hover:opacity-100"
            >
              ✕
            </button>

          </div>

          {/* CHAT BODY */}

          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50">

            {/* EMPTY STATE */}

            {messages.length === 0 && (

              <div className="space-y-3">

                <div className="text-sm text-gray-500">
                  🍜 Hungry? Ask me what to eat!
                </div>

                <div className="flex flex-wrap gap-2">

                  <button
                    onClick={() => quickAsk("best street food near me")}
                    className="text-xs bg-white border px-3 py-1 rounded-lg"
                  >
                    Best street food
                  </button>

                  <button
                    onClick={() => quickAsk("cheap snacks")}
                    className="text-xs bg-white border px-3 py-1 rounded-lg"
                  >
                    Cheap snacks
                  </button>

                  <button
                    onClick={() => quickAsk("something sweet")}
                    className="text-xs bg-white border px-3 py-1 rounded-lg"
                  >
                    Something sweet
                  </button>

                  <button
                    onClick={() => quickAsk("top rated vendors")}
                    className="text-xs bg-white border px-3 py-1 rounded-lg"
                  >
                    Top vendors
                  </button>

                </div>

              </div>

            )}

            {/* MESSAGES */}

            {messages.map((msg, i) => (

              <div
                key={i}
                className={`flex ${msg.sender === "user"
                    ? "justify-end"
                    : "justify-start"
                  }`}
              >

                <div
                  className={`px-3 py-2 rounded-xl text-sm max-w-[80%] shadow ${msg.sender === "user"
                      ? "bg-orange-500 text-white"
                      : "bg-white border"
                    }`}
                >

                  {/* USER MESSAGE */}

                  {msg.sender === "user" && msg.text}

                  {/* AI MESSAGE */}

                  {msg.sender === "ai" && msg.data && (

                    <div>

                      {/* AI TEXT MESSAGE */}

                      {msg.data.message && (
                        <div className="text-sm mb-2">
                          {msg.data.message}
                        </div>
                      )}

                      {/* FOOD SUGGESTIONS */}

                      {msg.data.type === "foods" && msg.data.foods && (

                        <div className="mb-2">

                          <div className="font-semibold text-sm mb-1">
                            😋 Try these foods:
                          </div>

                          <ul className="list-disc ml-4 text-sm">

                            {msg.data.foods.map((food, idx) => (
                              <li key={idx}>{food}</li>
                            ))}

                          </ul>

                        </div>

                      )}

                      {/* VENDOR CARDS */}

                      {msg.data.vendors && msg.data.vendors.length > 0 && (

                        <div className="space-y-2 mt-2">

                          {msg.data.vendors.map((vendor, idx) => (

                          <div
                            key={idx}
                            onClick={() => navigate(`/shops/${vendor.id}`)}
                            className="flex gap-2 items-center p-2 border rounded-lg bg-gray-50 hover:bg-gray-100 transition cursor-pointer"
                          >

                              <img
                                src={vendor.image}
                                alt={vendor.shopName}
                                className="w-12 h-12 rounded object-cover"
                              />

                              <div className="flex-1">

                                <div className="font-medium text-sm">
                                  {vendor.shopName}
                                </div>

                                {vendor.food && (
                                  <div className="text-xs text-gray-500">
                                    Try: {vendor.food}
                                  </div>
                                )}

                                {vendor.price && (
                                  <div className="text-xs text-gray-500">
                                    ₹ {vendor.price}
                                  </div>
                                )}

                                <div className="text-xs">
                                  ⭐ {Number(vendor.rating).toFixed(1)}
                                </div>

                              </div>

                            </div>

                          ))}

                        </div>

                      )}

                    </div>

                  )}

                  {msg.error && "AI failed 😅"}

                </div>

              </div>

            ))}

            {/* AI TYPING */}

            {loading && (
              <div className="text-sm text-gray-400">
                LoclBite AI is thinking...
              </div>
            )}

            <div ref={chatEndRef}></div>

          </div>

          {/* INPUT */}

          <div className="flex items-center border-t bg-white px-3 py-2 gap-2">

            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Feeling hungry? Ask me..."
              className="flex-1 px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-orange-400"
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />

            <button
              onClick={sendMessage}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition"
            >
              ➤
            </button>

          </div>

        </div>

      )}

    </>
  );
}