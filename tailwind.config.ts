import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx,mdx}",
    "./components/**/*.{ts,tsx,mdx}",
    "./content/**/*.{md,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0b0b0c",
        card: "#121214",
        text: "#f7f8f8",
        muted: "#9aa3af",
        accent: "#7c5cff",
        accent2: "#00e29f",
      },
      borderRadius: { "2xl": "1.25rem" },

      // Blog/MDX: typography in dark + link più belli
      typography: {
        DEFAULT: {
          css: {
            "--tw-prose-body": "rgba(255,255,255,0.82)",
            "--tw-prose-headings": "#ffffff",
            "--tw-prose-lead": "rgba(255,255,255,0.82)",
            "--tw-prose-links": "#ffffff",
            "--tw-prose-bold": "#ffffff",
            "--tw-prose-counters": "rgba(255,255,255,0.65)",
            "--tw-prose-bullets": "rgba(255,255,255,0.35)",
            "--tw-prose-hr": "rgba(255,255,255,0.12)",
            "--tw-prose-quotes": "#ffffff",
            "--tw-prose-quote-borders": "rgba(255,255,255,0.18)",
            "--tw-prose-captions": "rgba(255,255,255,0.62)",
            "--tw-prose-code": "#ffffff",
            "--tw-prose-pre-code": "rgba(255,255,255,0.86)",
            "--tw-prose-pre-bg": "rgba(255,255,255,0.05)",
            "--tw-prose-th-borders": "rgba(255,255,255,0.12)",
            "--tw-prose-td-borders": "rgba(255,255,255,0.08)",

            a: {
              textDecoration: "none",
              fontWeight: "700",
              borderBottom: "1px solid rgba(122,32,255,.5)",
            },
            "a:hover": {
              borderBottomColor: "rgba(32,210,122,.8)",
            },
            code: {
              backgroundColor: "rgba(255,255,255,0.06)",
              padding: "0.15rem 0.35rem",
              borderRadius: "0.5rem",
            },
            pre: {
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "1rem",
            },
          },
        },
      },
    },
  },
  plugins: [typography],
};

export default config;
