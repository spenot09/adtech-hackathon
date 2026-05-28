import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#15171a",
        panel: "#f8faf9",
        line: "#dfe5e1",
        signal: "#0f766e",
        caution: "#b45309",
        danger: "#b42318",
      },
      boxShadow: {
        soft: "0 12px 32px rgba(15, 23, 42, 0.08)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "200% center" },
          "100%": { backgroundPosition: "-200% center" },
        },
      },
      animation: {
        float: "float 3s ease-in-out infinite",
        shimmer: "shimmer 3s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
