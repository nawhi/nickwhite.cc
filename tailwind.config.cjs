/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      screens: {
        xs: '480px'
      }
    },
    colors: {
      'th-background': 'var(--th-background)',
      'th-primary': 'var(--th-primary)',
      'th-secondary': 'var(--th-secondary)',
      'th-tertiary': 'var(--th-tertiary)',
      'th-subtle': 'var(--th-subtle)',
      'th-action': 'var(--th-action)',
      'th-action-focus': 'var(--th-action-focus)',
      'th-error': 'var(--th-error)'
    }
  },
  darkMode: 'media',

  plugins: [
    require('@tailwindcss/typography'),
    function ({addComponents}) {
      addComponents({
        '.max-w-150': { maxWidth: '150px' },
        '.top-5': { top: '5%' }
      })
    }
  ]
}
