"use client";

import {
  Package,
  Scissors,
  Truck,
  CheckCircle,
} from "lucide-react";

const steps = [
  {
    title: "Order Received",
    description: "We've received your order.",
    icon: Package,
    completed: true,
  },
  {
    title: "Tailoring in Progress",
    description: "Our craftsmen are making your outfit.",
    icon: Scissors,
    completed: true,
  },
  {
    title: "Ready for Delivery",
    description: "Your outfit has been completed.",
    icon: Truck,
    completed: false,
  },
  {
    title: "Delivered",
    description: "Order successfully delivered.",
    icon: CheckCircle,
    completed: false,
  },
];

export default function TrackingPage() {
  return (
    <main className="min-h-screen bg-[#0B0B0B] text-white">

      <section className="max-w-5xl mx-auto px-6 py-20">

        <h1 className="text-5xl font-bold">
          Track Your Order
        </h1>

        <p className="text-gray-400 mt-4">
          Stay updated with every stage of your luxury outfit.
        </p>

        <div className="mt-12 rounded-3xl bg-[#121212] p-8 border border-yellow-500/20">

          <div className="flex justify-between flex-wrap gap-4">

            <div>
              <p className="text-gray-400">Order Number</p>
              <h2 className="text-2xl font-bold">
                #LX-2026-00124
              </h2>
            </div>

            <div>
              <p className="text-gray-400">Estimated Delivery</p>
              <h2 className="text-2xl font-bold">
                18 August 2026
              </h2>
            </div>

          </div>

        </div>

        <div className="mt-16 space-y-8">

          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <div
                key={step.title}
                className="flex gap-6 items-start"
              >
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center ${
                    step.completed
                      ? "bg-yellow-400 text-black"
                      : "bg-[#1A1A1A] text-gray-500"
                  }`}
                >
                  <Icon size={24} />
                </div>

                <div>

                  <h3 className="text-2xl font-semibold">
                    {step.title}
                  </h3>

                  <p className="text-gray-400 mt-2">
                    {step.description}
                  </p>

                </div>

              </div>
            );
          })}

        </div>

      </section>

    </main>
  );
}