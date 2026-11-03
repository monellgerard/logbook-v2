import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#090d16", // Azul marino / negro abisal profundo
        surface: "#111827",      // Gris grafito oscuro para tarjetas
        surfaceHover: "#1f2937",
        borderSubtle: "#1e293b", // Bordes técnicos discretos
        primary: {
          DEFAULT: "#0ea5e9",    // Azul técnico / cian instrumental
          dark: "#0284c7",
          light: "#38bdf8",
        },
        accent: {
          copper: "#d97706",     // Detalle técnico en cobre sutil
          steel: "#64748b",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
