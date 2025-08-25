/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class", // importante: alternamos aplicando/removendo 'dark' no <html>
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      // mapeamos nomes semânticos para CSS variables; as variáveis são definidas no CSS global
      colors: {
        // semantic tokens
        bg: "var(--color-bg)",
        surface: "var(--color-surface)",
        primary: "var(--color-primary)",
        accent: "var(--color-accent)",
        onPrimary: "var(--color-on-primary)",
        text: "var(--color-text)",
        muted: "var(--color-muted)",
        border: "var(--color-border)",
        success: "var(--color-success)",
        danger: "var(--color-danger)",
      },
      // opcional: sombra/texturas para o tema escuro
      boxShadow: {
        card: "0 6px 18px rgba(8, 15, 25, 0.06)",
        cardDark: "0 8px 22px rgba(2, 6, 23, 0.6)",
      },
    },
  },
  plugins: [],
};
