import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex h-screen items-center justify-center bg-black text-white">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-[#D4AF37]">
          404
        </h1>

        <p className="mt-4 text-white/70">
          Page not found.
        </p>

        <Link
          href="/"
          className="mt-6 inline-block rounded-lg bg-[#D4AF37] px-6 py-3 font-semibold text-black"
        >
          Back Home
        </Link>
      </div>
    </div>
  );
}