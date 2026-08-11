import Image from "next/image";
import { Scissors, Award, Users, Gem } from "lucide-react";

export const metadata = {
  title: "About Us | Benkasa Collection",
  description:
    "Discover the story behind Benkasa Collection — bespoke African menswear including Senator wear, Agbada, and tailored suits.",
};

const values = [
  {
    icon: Scissors,
    title: "Master Tailoring",
    description: "Every Senator, Agbada, and suit is hand-finished by artisans with decades of craft.",
  },
  {
    icon: Award,
    title: "Premium Fabric",
    description: "We source only the finest cotton, wool-blend, and linen fabrics for lasting quality.",
  },
  {
    icon: Users,
    title: "Made to Measure",
    description: "From wedding suits to everyday Shirt & Trouser sets, every piece is cut to your fit.",
  },
  {
    icon: Gem,
    title: "Timeless Design",
    description: "Modern silhouettes rooted in African heritage — luxury that never goes out of style.",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#0B0B0B] text-white">
      <section className="relative flex h-[60vh] min-h-[420px] items-center justify-center overflow-hidden">
        <Image
          src="/images/about/atelier.jpg"
          alt="Benkasa Collection tailoring atelier"
          fill
          priority
          className="object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0B] via-[#0B0B0B]/60 to-transparent" />
        <div className="relative z-10 px-6 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-[#D4AF37]">Our Story</p>
          <h1 className="mt-4 text-4xl font-bold sm:text-6xl">Crafted for the Distinguished</h1>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-20 text-center">
        <h2 className="text-2xl font-semibold sm:text-3xl">The Benkasa Legacy</h2>
        <p className="mt-6 text-white/60 leading-relaxed">
          Benkasa Collection was born from a passion for African elegance — a house dedicated to
          tailoring Senator wear, Agbada, wedding suits, and classic Shirt & Trouser sets that
          honor tradition while embracing modern refinement. Every stitch reflects our commitment
          to craftsmanship, from the atelier floor to your wardrobe.
        </p>
      </section>

      <section className="border-y border-white/10 bg-white/[0.02] py-20">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-6 sm:grid-cols-2 lg:grid-cols-4">
          {values.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-xl"
            >
              <Icon size={28} className="mx-auto text-[#D4AF37]" />
              <h3 className="mt-4 font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-white/50">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {[
            { src: "/images/about/workshop-1.jpg", alt: "Tailor stitching a Senator wear piece" },
            { src: "/images/about/workshop-2.jpg", alt: "Agbada fabric detailing at Benkasa atelier" },
            { src: "/images/about/workshop-3.jpg", alt: "Finished wedding suit on mannequin" },
          ].map((img) => (
            <div key={img.src} className="relative aspect-[3/4] overflow-hidden rounded-2xl">
              <Image src={img.src} alt={img.alt} fill sizes="33vw" className="object-cover" />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}