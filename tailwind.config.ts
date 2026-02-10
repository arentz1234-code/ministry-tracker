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
        primary: {
          50: '#e8eef5',
          100: '#c5d5e8',
          200: '#9fb8d6',
          300: '#7899c3',
          400: '#5a7fb5',
          500: '#3d66a7',
          600: '#2d4a6f',
          700: '#1e3a5f',  // Main brand color
          800: '#162c48',
          900: '#0f1f32',
        },
        accent: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
      },
    },
  },
  plugins: [],
};

export default config;
