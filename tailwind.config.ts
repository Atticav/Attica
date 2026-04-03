import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#FAF6F3",
        secondary: "#F5EDE8",
        accent: "#C4A97D",
        "accent-dark": "#8B7355",
        "accent-darker": "#6B5B45",
        "text-main": "#4A4A4A",
        "text-title": "#2D2D2D",
        hover: "#E8DDD5",
        neutral: "#9C9C9C",
        "border-subtle": "#E5DDD5",
        success: "#7B9E6B",
        warning: "#D4A853",
        error: "#C17B6E",
      },
      fontFamily: {
        cormorant: ["var(--font-cormorant)", "Cormorant Garamond", "serif"],
        cinzel: ["var(--font-cinzel)", "Cinzel", "serif"],
        lora: ["var(--font-lora)", "Lora", "serif"],
        inter: ["var(--font-inter)", "Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
