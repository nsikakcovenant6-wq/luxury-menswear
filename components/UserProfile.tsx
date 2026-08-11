"use client";

import { useState, FormEvent } from "react";
import { User, Mail, Phone, MapPin, Save } from "lucide-react";

export default function UserProfile() {
  const [form, setForm] = useState({
    name: "Adewale Benkasa",
    email: "adewale@example.com",
    phone: "+234 801 234 5678",
    address: "12 Kofo Abayomi Street, Victoria Island, Lagos",
  });
  const [saved, setSaved] = useState(false);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSaved(true);
  };

  const fields: { key: keyof typeof form; label: string; icon: typeof User; type: string }[] = [
    { key: "name", label: "Full Name", icon: User, type: "text" },
    { key: "email", label: "Email Address", icon: Mail, type: "email" },
    { key: "phone", label: "Phone Number", icon: Phone, type: "tel" },
    { key: "address", label: "Delivery Address", icon: MapPin, type: "text" },
  ];

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
    >
      <h2 className="text-lg font-semibold text-white">Profile Information</h2>

      {fields.map(({ key, label, icon: Icon, type }) => (
        <div key={key}>
          <label htmlFor={key} className="mb-1.5 block text-sm text-white/60">
            {label}
          </label>
          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/30 px-4 py-3 focus-within:border-[#D4AF37]/60">
            <Icon size={16} className="text-[#D4AF37]" />
            <input
              id={key}
              type={type}
              value={form[key]}
              onChange={(e) => handleChange(key, e.target.value)}
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/30"
            />
          </div>
        </div>
      ))}

      <button
        type="submit"
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#D4AF37] py-3 text-sm font-semibold text-[#0B0B0B] transition-opacity hover:opacity-90"
      >
        <Save size={16} />
        {saved ? "Saved!" : "Save Changes"}
      </button>
    </form>
  );
}