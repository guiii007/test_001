/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        jade: {
          50: "#EEF4F0",
          100: "#D6E5DC",
          200: "#ADCCBC",
          300: "#7FAE97",
          400: "#4F8A6E",
          500: "#2F6B50",
          600: "#1F3D2E", // 墨玉绿 主色
          700: "#1A3326",
          800: "#142820",
          900: "#0E1C16",
        },
        amber: {
          50: "#FBF3E6",
          100: "#F5E2C4",
          200: "#E8C98A",
          300: "#D9AE5C",
          400: "#C8964A", // 琥珀金 强调色
          500: "#B07F35",
          600: "#8E652A",
          700: "#6B4C20",
        },
        paper: {
          50: "#FAF7F0",
          100: "#F5F1E8", // 宣纸米白
          200: "#EDE6D3",
          300: "#DDD2B6",
        },
        ink: {
          50: "#3A3A3A",
          100: "#2A2A2A",
          200: "#1A1A1A", // 深墨色
          300: "#0E0E0E",
        },
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', "serif"],
        sans: ['"Noto Sans SC"', "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
      boxShadow: {
        jade: "0 8px 30px -8px rgba(31, 61, 46, 0.25)",
        amber: "0 8px 24px -6px rgba(200, 150, 74, 0.4)",
        inset: "inset 0 1px 0 0 rgba(255,255,255,0.06)",
      },
      backgroundImage: {
        "amber-gradient":
          "linear-gradient(135deg, #D9AE5C 0%, #C8964A 50%, #B07F35 100%)",
        "jade-gradient":
          "linear-gradient(160deg, #2F6B50 0%, #1F3D2E 60%, #142820 100%)",
        "paper-texture":
          "radial-gradient(circle at 20% 20%, rgba(200,150,74,0.04) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(31,61,46,0.05) 0%, transparent 50%)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "scan-line": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(2000%)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.8)", opacity: "0.7" },
          "100%": { transform: "scale(1.6)", opacity: "0" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.5s ease-out forwards",
        "scale-in": "scale-in 0.3s ease-out forwards",
        "scan-line": "scan-line 2s linear infinite",
        "pulse-ring": "pulse-ring 1.5s ease-out infinite",
        "slide-in-right": "slide-in-right 0.3s ease-out forwards",
      },
    },
  },
  plugins: [],
};
