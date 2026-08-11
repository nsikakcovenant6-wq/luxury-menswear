"use client";

export default function Error({
  reset,
}: {
  reset: () => void;
}) {
  return (
    <div className="flex h-screen items-center justify-center bg-black text-white">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-[#D4AF37]">
          Something went wrong
        </h1>

        <button
          onClick={() => reset()}
          className="mt-6 rounded-lg bg-[#D4AF37] px-6 py-3 font-semibold text-black"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}