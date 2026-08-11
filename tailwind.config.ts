import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],

  theme: {
    extend: {
      colors: {
        background: "#0B0B0B",
        foreground: "#FFFFFF",

        gold: {
          100: "#FFF9E6",
          200: "#FDE68A",
          300: "#FACC15",
          400: "#EAB308",
          500: "#D4AF37",
          600: "#B8860B",
        },
      },

      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },

      boxShadow: {
        glow: "0 0 30px rgba(212,175,55,0.35)",
      },

      backgroundImage: {
        gold:
          "linear-gradient(90deg,#FFF5B7,#F4C542,#D4AF37,#FFF5B7)",
      },
    },
  },

  plugins: [],
};

export default config;