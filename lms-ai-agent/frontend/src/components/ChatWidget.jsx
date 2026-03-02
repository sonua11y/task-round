
import { useState, useRef, useEffect } from "react";
import api from "../api/axios";
import avatar from "../assets/avatar.avif";

export default function ChatWidget({ refresh }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi! I'm your Campus buddy. Ask me anything about your courses or profile." },
  ]);
  const [input, setInput] = useState("");
  const endRef = useRef(null);

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const sendMessage = async () => {
    if (!input) return;
    const userMsg = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    try {
      const response = await api.post("/chat", { message: input });
      const botMsg = { sender: "bot", text: response.data.reply };
      setMessages((prev) => [...prev, botMsg]);
      refresh();
    } catch (err) {
      setMessages((prev) => [...prev, { sender: "bot", text: "Sorry, something went wrong." }]);
    }
    setInput("");
  };

  // Floating chat icon button
  if (!open) {
    return (
      <button
        className="lms-chat-launch"
        onClick={() => setOpen(true)}
        aria-label="Open chat"
        style={{
          background: '#0d47a1', // dark blue
          border: 'none',
          padding: 0,
          borderRadius: '50%',
          width: 56,
          height: 56,
          boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Provided chat bubble icon, solid white fill */}
        <svg width="32" height="32" viewBox="0 0 512 512" fill="#fff" xmlns="http://www.w3.org/2000/svg">
          <path d="M408 63.64A207.34 207.34 0 0 0 256 16C132.29 16 32 109.64 32 224c0 49.94 21.4 96.12 60.25 132.37a16 16 0 0 1 4.91 13.94l-7.16 63.13a16 16 0 0 0 19.18 17.44l66.09-14.7a16 16 0 0 1 8.85.47A222.09 222.09 0 0 0 256 432c123.71 0 224-93.64 224-208 0-57.53-27.56-111.36-72-160.36Z" />
        </svg>
      </button>
    );
  }

  // Chat popup
  return (
    <div className="lms-chat-popup" style={{ position: 'fixed', right: '32px', bottom: '32px', zIndex: 1000, width: '420px', height: '570px', maxHeight: '70vh' }}>
      <div className="lms-chat-header" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <img src={avatar} alt="Bot Avatar" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', boxShadow: '0 2px 8px rgba(0,0,0,0.18)', border: '2px solid #fff' }} />
        <span style={{ flex: 1, fontFamily: '"Pacifico", cursive', fontSize: '1.5rem', fontWeight: 400 }}>Kalvi</span>
        <button className="lms-chat-close" onClick={() => setOpen(false)} aria-label="Close chat">×</button>
      </div>
      <div className="lms-chat-body">
        {messages.map((m, idx) => (
          <div key={idx} className={`lms-chat-msg ${m.sender}`} style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
            {m.sender === "bot" && (
              <img src={avatar} alt="Bot Avatar" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', boxShadow: '0 1px 4px rgba(0,0,0,0.12)' }} />
            )}
            <div className={`lms-chat-bubble ${m.sender}`}>{m.text}</div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <form className="lms-chat-footer" onSubmit={e => { e.preventDefault(); sendMessage(); }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          className="lms-chat-input"
          placeholder="Type a message..."
        />
        <button type="submit" className="lms-chat-send" aria-label="Send">
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M22 2L11 13" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </form>
    </div>
  );
}