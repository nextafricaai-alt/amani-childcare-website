/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // PIKADON brand palette (see app/globals.css for roles)
        plum: {
          50: "#F8EEF4", 100: "#EEDCE7", 700: "#802C5E",
          800: "#55284A", 900: "#431F37", 950: "#2C1324",
          DEFAULT: "#431F37",
        },
        orange: {
          50: "#FEF0E9", 100: "#FBDCCF", DEFAULT: "#EA5A2D",
          600: "#C8461C", 700: "#B83F17",
        },
        sun: { 50: "#FFF7DE", 100: "#FDEBAE", DEFAULT: "#F5BE14" },
        cream: {
          DEFAULT: "#FFF9F2",
          deep: "#FBEEE3",
          raised: "#FFFDFB",
        },
        ink: {
          DEFAULT: "#2E1A27",
          body: "#4B3A45",
          muted: "#6E5C68",
        },
      },
      fontFamily: {
        display: ["Poppins", "system-ui", "sans-serif"],
        sans: ["Nunito", "system-ui", "sans-serif"],
        body: ["Nunito", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      transitionTimingFunction: {
        "ease-out-strong": "cubic-bezier(0.23, 1, 0.32, 1)",
        "ease-in-out-strong": "cubic-bezier(0.77, 0, 0.175, 1)",
        "ease-back": "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)", filter: "blur(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)", filter: "blur(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "fade-up": "fade-up 700ms cubic-bezier(0.23, 1, 0.32, 1) forwards",
        "scale-in": "scale-in 500ms cubic-bezier(0.23, 1, 0.32, 1) forwards",
      },
    },
  },
  plugins: [],
};
