import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        card: {
          DEFAULT: "hsl(var(--card) / <alpha-value>)",
          foreground: "hsl(var(--card-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted) / <alpha-value>)",
          foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
        },
        border: "hsl(var(--border) / <alpha-value>)",
        input: "hsl(var(--input) / <alpha-value>)",
        primary: {
          DEFAULT: "hsl(var(--primary) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
        },
        ring: "hsl(var(--ring) / <alpha-value>)",
        accent: {
          DEFAULT: "hsl(var(--accent) / <alpha-value>)",
          foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar) / <alpha-value>)",
          foreground: "hsl(var(--sidebar-foreground) / <alpha-value>)",
          muted: "hsl(var(--sidebar-muted) / <alpha-value>)",
          active: "hsl(var(--sidebar-active) / <alpha-value>)",
        },
        brand: {
          lime: "hsl(var(--brand-lime) / <alpha-value>)",
          teal: "hsl(var(--brand-deep-teal) / <alpha-value>)",
          steel: "hsl(var(--brand-steel) / <alpha-value>)",
          charcoal: "hsl(var(--brand-charcoal) / <alpha-value>)",
          platinum: "hsl(var(--brand-platinum) / <alpha-value>)",
        },
        surface: {
          DEFAULT: "hsl(var(--surface) / <alpha-value>)",
          muted: "hsl(var(--surface-muted) / <alpha-value>)",
        },
        "border-subtle": "hsl(var(--border-subtle) / <alpha-value>)",
        "foreground-muted": "hsl(var(--foreground-muted) / <alpha-value>)",
        "foreground-faint": "hsl(var(--foreground-faint) / <alpha-value>)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)",
      },
      boxShadow: {
        brand: "0 4px 14px hsl(var(--primary) / 0.22)",
        card: "0 1px 2px hsl(var(--shadow-color) / 0.06), 0 4px 16px hsl(var(--shadow-color) / 0.06)",
        "card-hover":
          "0 4px 12px hsl(var(--shadow-color) / 0.08), 0 12px 28px hsl(var(--shadow-color) / 0.1)",
        shell: "var(--shadow-shell)",
      },
      keyframes: {
        "upload-bar": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(260%)" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "upload-bar": "upload-bar 1.1s ease-in-out infinite",
        "fade-in": "fade-in 0.35s ease-out forwards",
        shimmer: "shimmer 1.5s ease-in-out infinite",
      },
      backgroundImage: {
        shimmer:
          "linear-gradient(90deg, hsl(var(--muted)) 0%, hsl(var(--muted-foreground) / 0.12) 50%, hsl(var(--muted)) 100%)",
      },
      backgroundSize: {
        shimmer: "200% 100%",
      },
    },
  },
  plugins: [],
};

export default config;
