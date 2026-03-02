import { useState } from "react";

export default function Chat() {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi! I’m your AI learning assistant." }
  ]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input) return;

    setMessages([
      ...messages,
      { sender: "user", text: input },
      { sender: "bot", text: "Let me check that for you..." }
    ]);

    setInput("");
  };

  return (
    <div className="bg-white rounded-xl shadow-md h-[80vh] flex flex-col">

      <div className="flex-1 p-6 overflow-y-auto space-y-4 flex flex-col">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`px-4 py-2 rounded-lg max-w-xs ${
              msg.sender === "user"
                ? "bg-primary text-white self-end"
                : "bg-gray-100 text-gray-800 self-start"
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      <div className="p-4 border-t flex gap-2">
        <input
          className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask something..."
        />
        <button
          onClick={sendMessage}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
        >
          Send
        </button>
      </div>

    </div>
  );
}