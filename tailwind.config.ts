import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./context/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cf: {
          dark: "#181008",
          darker: "#0f0804",
          red: "#C62828",
          "red-light": "#ef5350",
          gold: "#C9A84C",
          "gold-light": "#e0c060",
          cream: "#F5F0E8",
          "cream-dark": "#d8cfc0",
          surface: "#231610",
          border: "#3a2418",
        },
      },
      fontFamily: {
        display: ["var(--font-bebas-neue)", "sans-serif"],
        body: ["var(--font-dm-sans)", "sans-serif"],
      },
      backgroundImage: {
        "cf-gradient":
          "linear-gradient(135deg, #C62828 0%, #8B1A1A 50%, #181008 100%)",
        "gold-gradient": "linear-gradient(135deg, #C9A84C 0%, #a8863c 100%)",
      },
      keyframes: {
        slideIn: {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
      animation: {
        "slide-in": "slideIn 0.3s ease-out",
        "fade-in": "fadeIn 0.2s ease-out",
      },
    },
  },
  plugins: [],
};
export default config;
