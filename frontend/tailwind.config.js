/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "surface": "#0f131c",
        "surface-dim": "#0f131c",
        "surface-bright": "#353943",
        "surface-container-lowest": "#0a0e17",
        "surface-container-low": "#181b25",
        "surface-container": "#1c1f29",
        "surface-container-high": "#262a34",
        "surface-container-highest": "#31353f",
        "on-surface": "#dfe2ef",
        "on-surface-variant": "#c2c6d6",
        "inverse-surface": "#dfe2ef",
        "inverse-on-surface": "#2c303a",
        "outline": "#8c909f",
        "outline-variant": "#424754",
        "primary": "#adc6ff",
        "on-primary": "#002e6a",
        "primary-container": "#4d8eff",
        "on-primary-container": "#00285d",
        "secondary": "#d0bcff",
        "on-secondary": "#3c0091",
        "secondary-container": "#571bc1",
        "on-secondary-container": "#c4abff",
        "tertiary": "#4cd7f6",
        "on-tertiary": "#003640",
        "tertiary-container": "#009eb9",
        "on-tertiary-container": "#002f38",
        "error": "#ffb4ab",
        "on-error": "#690005",
        "error-container": "#93000a",
        "on-error-container": "#ffdad6",
        "background": "#0f131c",
        "on-background": "#dfe2ef"
      },
      fontFamily: {
        body: ["Inter", "sans-serif"],
        code: ["JetBrains Mono", "monospace"],
        mono: ["JetBrains Mono", "monospace"]
      }
    },
  },
  plugins: [],
};
