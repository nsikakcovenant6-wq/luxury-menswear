"use client";

import { Calendar, Clock, User, FileText } from "lucide-react";

export default function BookingPage() {
  return (
    <main className="min-h-screen bg-[#0B0B0B] text-white py-20 px-6">

      <div className="max-w-3xl mx-auto">

        <div className="text-center">

          <p className="uppercase tracking-[6px] text-yellow-400">
            Book Appointment
          </p>

          <h1 className="text-5xl font-bold mt-4">
            Schedule Your Visit
          </h1>

          <p className="text-gray-400 mt-5">
            Choose a convenient date and time to meet with our expert tailor.
          </p>

        </div>

        <form className="mt-14 space-y-8 rounded-3xl bg-[#121212] border border-yellow-500/20 p-8">

          {/* Full Name */}

          <div>

            <label className="flex items-center gap-2 mb-3">
              <User size={18} className="text-yellow-400" />
              Full Name
            </label>

            <input
              type="text"
              placeholder="John Doe"
              className="w-full rounded-xl bg-[#1A1A1A] p-4 outline-none"
            />

          </div>

          {/* Appointment Type */}

          <div>

            <label className="mb-3 block">
              Appointment Type
            </label>

            <select className="w-full rounded-xl bg-[#1A1A1A] p-4">

              <option>Measurement</option>

              <option>Consultation</option>

              <option>Wedding Fitting</option>

              <option>Pickup</option>

            </select>

          </div>

          {/* Date */}

          <div>

            <label className="flex items-center gap-2 mb-3">
              <Calendar size={18} className="text-yellow-400" />
              Select Date
            </label>

            <input
              type="date"
              className="w-full rounded-xl bg-[#1A1A1A] p-4"
            />

          </div>

          {/* Time */}

          <div>

            <label className="flex items-center gap-2 mb-3">
              <Clock size={18} className="text-yellow-400" />
              Select Time
            </label>

            <select className="w-full rounded-xl bg-[#1A1A1A] p-4">

              <option>09:00 AM</option>
              <option>10:00 AM</option>
              <option>11:00 AM</option>
              <option>12:00 PM</option>
              <option>01:00 PM</option>
              <option>02:00 PM</option>
              <option>03:00 PM</option>
              <option>04:00 PM</option>

            </select>

          </div>

          {/* Notes */}

          <div>

            <label className="flex items-center gap-2 mb-3">
              <FileText size={18} className="text-yellow-400" />
              Additional Notes
            </label>

            <textarea
              rows={5}
              placeholder="Tell us anything important..."
              className="w-full rounded-xl bg-[#1A1A1A] p-4 outline-none"
            />

          </div>

          <button
            className="w-full rounded-full bg-yellow-400 py-4 font-semibold text-black hover:scale-105 transition"
          >
            Book Appointment
          </button>

        </form>

      </div>

    </main>
  );
}