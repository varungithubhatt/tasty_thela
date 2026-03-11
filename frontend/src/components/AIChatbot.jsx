import { useState } from "react";
import api from "../services/api";

export default function AIChatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const res = await api.post("/ai/chat", {
        message: input,
      });

      const aiMessage = {
        sender: "ai",
        text: res.data.reply,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: "AI failed 😅" },
      ]);
    }

    setInput("");
  };

  return (
    <>
      {/* FLOATING BUTTON */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-full shadow-xl hover:scale-105 transition-all duration-200"
      >
        🤖
      </button>

      {/* CHAT WINDOW */}
      {open && (
        <div className="fixed bottom-20 right-6 w-[380px] h-200 bg-white rounded-2xl shadow-2xl flex flex-col border border-gray-200 overflow-hidden">

          {/* HEADER */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold">
            <div className="flex items-center gap-2">
              🤖 <span>LoclBite AI</span>
            </div>

            <button
              onClick={() => setOpen(false)}
              className="text-sm opacity-80 hover:opacity-100"
            >
              ✕
            </button>
          </div>

          {/* MESSAGES */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50">

            {messages.length === 0 && (
              <div className="text-sm text-gray-500">
                Ask me what you want to eat 😋
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${
                  msg.sender === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`px-3 py-2 rounded-xl text-sm max-w-[70%] shadow-sm ${
                    msg.sender === "user"
                      ? "bg-orange-500 text-white"
                      : "bg-white border"
                  }`}
                >
                  <div dangerouslySetInnerHTML={{ __html: msg.text }} />
                </div>
              </div>
            ))}
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