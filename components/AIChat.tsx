"use client";

import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  MessageCircle,
  Send,
  X,
  Sparkles,
  Loader2,
} from "lucide-react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export default function AIChat() {
  const [open, setOpen] = useState(false);

  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "👋 Welcome, sir. I'm your Luxury AI Stylist. Tell me the occasion, your budget and preferred colour, and I'll recommend the perfect outfit.",
    },
  ]);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const suggestions = [
    "I need a wedding suit",
    "Show me luxury kaftans",
    "Recommend church outfits",
    "Business meeting suit",
    "Design my outfit",
  ];

  async function sendMessage(text?: string) {
    const finalMessage = text || message;

    if (!finalMessage.trim()) return;

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: finalMessage,
      },
    ]);

    setMessage("");

    setLoading(true);

    try {
      const response = await fetch("/api/ai", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          message: finalMessage,
        }),
      });

      const data = await response.json();

      const reply =
        data.choices?.[0]?.message?.content ??
        "Sorry, I couldn't generate a response.";

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: reply,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Something went wrong. Please try again.",
        },
      ]);
    }

    setLoading(false);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 h-16 w-16 rounded-full bg-yellow-400 text-black shadow-xl hover:scale-110 transition"
      >
        <MessageCircle className="mx-auto" />
      </button>

      <AnimatePresence>

        {open && (

          <motion.div
            initial={{
              opacity: 0,
              y: 80,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: 80,
            }}
            className="fixed bottom-24 right-6 z-50 w-[390px] overflow-hidden rounded-3xl bg-[#111111] border border-yellow-500/20 shadow-2xl"
          >

            <div className="flex items-center justify-between bg-yellow-400 px-6 py-5 text-black">

              <div>

                <h2 className="flex items-center gap-2 font-bold">

                  <Sparkles size={18} />

                  AI Luxury Stylist

                </h2>

                <p className="text-sm">
                  Online
                </p>

              </div>

              <button
                onClick={() => setOpen(false)}
              >
                <X />
              </button>

            </div>

            <div className="h-[420px] overflow-y-auto space-y-5 p-5">

              {messages.map((msg, index) => (

                <div
                  key={index}
                  className={`max-w-[85%] rounded-2xl p-4 ${
                    msg.role === "assistant"
                      ? "bg-[#1d1d1d]"
                      : "ml-auto bg-yellow-400 text-black"
                  }`}
                >
                  {msg.content}
                </div>

              ))}

              {loading && (

                <div className="flex items-center gap-2">

                  <Loader2
                    className="animate-spin text-yellow-400"
                    size={18}
                  />

                  <span className="text-gray-400">
                    AI is thinking...
                  </span>

                </div>

              )}

              <div ref={bottomRef} />

            </div>

            <div className="px-5">

              <div className="flex flex-wrap gap-2 mb-4">

                {suggestions.map((item) => (

                  <button
                    key={item}
                    onClick={() => sendMessage(item)}
                    className="rounded-full border border-yellow-500/30 px-3 py-2 text-xs hover:bg-yellow-400 hover:text-black transition"
                  >
                    {item}
                  </button>

                ))}

              </div>

            </div>

            <div className="border-t border-white/10 p-4 flex gap-3">

              <input
                value={message}
                onChange={(e) =>
                  setMessage(e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    sendMessage();
                  }
                }}
                placeholder="Ask your stylist..."
                className="flex-1 rounded-full bg-black px-5 py-3 outline-none"
              />

              <button
                onClick={() => sendMessage()}
                className="rounded-full bg-yellow-400 p-3 text-black"
              >
                <Send size={18} />
              </button>

            </div>

          </motion.div>

        )}

      </AnimatePresence>
    </>
  );
}