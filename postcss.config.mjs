// Tailwind 3 is wired through PostCSS directly (the @astrojs/tailwind
// integration was removed as it does not support Astro 7). Astro picks this
// config up automatically. Config lives in tailwind.config.cjs.
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
