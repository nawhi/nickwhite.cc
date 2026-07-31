import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import remarkExternalLinks from 'remark-external-links';

// https://astro.build/config
export default defineConfig({
  site: 'https://nickwhite.cc',
  integrations: [mdx(), sitemap()],
  markdown: {
    syntaxHighlight: 'prism',
    remarkPlugins: [
      [remarkExternalLinks, { target: '_blank', rel: 'noopener noreferrer' }],
    ],
    remarkRehype: {
      footnoteLabel: ' ',
      footnoteBackContent: '↑'
    }
  },
});
