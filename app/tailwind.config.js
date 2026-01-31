/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Neon Cyan (Primary Action)
        primary: {
          DEFAULT: "#22D3EE", // Cyan-400
          50: "#ECFEFF",
          100: "#CFFAFE",
          200: "#A5F3FC",
          300: "#67E8F9",
          400: "#22D3EE",
          500: "#06B6D4",
          600: "#0891B2",
          700: "#0E7490",
          800: "#155E75",
          900: "#164E63",
        },
        // Vibrant Purple (Calm/Mind)
        secondary: {
          DEFAULT: "#A855F7", // Purple-500
          50: "#FAF5FF",
          100: "#F3E8FF",
          200: "#E9D5FF",
          300: "#D8B4FE",
          400: "#C084FC",
          500: "#A855F7",
          600: "#9333EA",
          700: "#7E22CE",
          800: "#6B21A8",
          900: "#581C87",
        },
        // Electric Lime (Energy/Gym)
        accent: {
          DEFAULT: "#A3E635", // Lime-400
          50: "#F7FEE7",
          100: "#ECFCCB",
          200: "#D9F99D",
          300: "#BEF264",
          400: "#A3E635",
          500: "#84CC16",
          600: "#65A30D",
          700: "#4D7C0F",
          800: "#3F6212",
          900: "#365314",
        },
        // Deep Space Black (neutral base for Neons)
        background: "#09090b", // Zinc-950
        surface: "#18181b", // Zinc-900
        "surface-light": "#27272a", // Zinc-800
      },
      fontFamily: {
        sans: [
          "Inter",
          "Inter-Medium",
          "Inter-SemiBold",
          "Inter-Bold",
          "system-ui",
          "sans-serif",
        ],
      },
      borderRadius: {
        "4xl": "2rem",
      },
      boxShadow: {
        "neon-cyan": "0 0 15px rgba(34, 211, 238, 0.2)",
        "neon-lime": "0 0 15px rgba(163, 230, 53, 0.2)",
        "neon-purple": "0 0 15px rgba(168, 85, 247, 0.2)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        glow: "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        glow: {
          "0%": { boxShadow: "0 0 5px rgba(34, 211, 238, 0.2)" },
          "100%": { boxShadow: "0 0 20px rgba(34, 211, 238, 0.6)" },
        },
      },
    },
  },
  plugins: [],
};
