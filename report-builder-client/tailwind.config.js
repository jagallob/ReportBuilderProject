/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      keyframes: {
        "fade-in-out": {
          "0%, 100%": { opacity: 0, transform: "translateY(10px)" },
          "10%, 90%": { opacity: 1, transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in-out": "fade-in-out 3s ease-in-out",
      },
    },
  },
  plugins: [],
};
