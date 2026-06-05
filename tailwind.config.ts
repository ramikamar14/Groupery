import type { Config } from "tailwindcss";

export default {
  content: ["./client/src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        gold: {
          50: "#fdf8ee",
          100: "#f9eccc",
          200: "#f2d896",
          300: "#e8bc55",
          400: "#dea433",
          500: "#C9A96E",
          600: "#b8882a",
          700: "#996820",
          800: "#7d521f",
          900: "#68441d",
        },
        navy: {
          50: "#eef2f8",
          100: "#d4dfed",
          200: "#b0c5de",
          300: "#7ea2c8",
          400: "#4f7db2",
          500: "#2d5f97",
          600: "#1e4a7a",
          700: "#163760",
          800: "#112649",
          900: "#1a2b4a",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
