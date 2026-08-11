"use client";

import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";

const DEFAULT_WHATSAPP_NUMBER = "2348012345678";

const DEFAULT_WHATSAPP_MESSAGE =
  "Hello Benkaso Collection, I would like to make an inquiry.";

export default function Whatsapp() {
  const [number, setNumber] = useState(
    DEFAULT_WHATSAPP_NUMBER
  );

  const [message, setMessage] = useState(
    DEFAULT_WHATSAPP_MESSAGE
  );

  useEffect(() => {
    let cancelled = false;

    async function loadWhatsappSettings() {
      try {
        const response = await fetch(
          "/api/store/settings",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        if (
          cancelled ||
          !data.success ||
          !data.settings
        ) {
          return;
        }

        if (data.settings.whatsappNumber) {
          setNumber(
            data.settings.whatsappNumber
          );
        }

        if (data.settings.whatsappMessage) {
          setMessage(
            data.settings.whatsappMessage
          );
        }
      } catch (error) {
        console.error(
          "Failed to load WhatsApp settings:",
          error
        );
      }
    }

    loadWhatsappSettings();

    return () => {
      cancelled = true;
    };
  }, []);

  const cleanNumber = number.replace(/\D/g, "");

  const href = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(
    message
  )}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Benkaso Collection on WhatsApp"
      className="group fixed bottom-6 right-6 z-50"
    >
      <div className="absolute inset-0 animate-ping rounded-full bg-[#25D366]/30" />

      <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-[#25D366] shadow-2xl transition duration-300 group-hover:scale-110">
        <MessageCircle className="h-8 w-8 text-white" />
      </div>
    </a>
  );
}