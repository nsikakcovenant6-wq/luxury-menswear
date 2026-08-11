"use client";

export default function FeaturedProducts() {
  return (
    <section className="bg-[#0B0B0B] py-20 text-white">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-[#D4AF37]">
            Featured Collection
          </p>

          <h2 className="mt-4 text-4xl font-bold">
            Our Latest Designs
          </h2>

          <p className="mt-4 text-white/60">
            Luxury suits, agbada, senator wear and bespoke tailoring.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="overflow-hidden rounded-2xl border border-[#D4AF37]/20 bg-[#111]"
            >
              <div className="h-72 animate-pulse bg-[#1a1a1a]" />

              <div className="p-5">
                <div className="h-5 w-32 animate-pulse rounded bg-[#222]" />
                <div className="mt-4 h-4 w-20 animate-pulse rounded bg-[#222]" />

                <button className="mt-6 w-full rounded-lg bg-[#D4AF37] py-3 font-semibold text-black">
                  Coming Soon
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}