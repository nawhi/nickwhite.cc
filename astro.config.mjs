import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
// Astro 7 renders Markdown with its native Sätteri pipeline by default. This
// site relies on remark plugins, Prism highlighting and custom footnote
// labels, so opt back into the remark/rehype pipeline via @astrojs/markdown-remark.
import { unified } from '@astrojs/markdown-remark';
import rehypeExternalLinks from 'rehype-external-links';

// https://astro.build/config
export default defineConfig({
  site: 'https://nickwhite.cc',
  // Astro 7 changed the default to 'jsx' (strips whitespace between inline
  // elements). Keep the pre-v7 behaviour to avoid rendering regressions.
  compressHTML: true,
  integrations: [mdx(), sitemap()],
  markdown: {
    processor: unified(),
    syntaxHighlight: 'prism',
    rehypePlugins: [
      // Successor to the deprecated remark-external-links. Adds
      // target="_blank" rel="noopener noreferrer" to external links.
      [rehypeExternalLinks, { target: '_blank', rel: ['noopener', 'noreferrer'] }],
    ],
    remarkRehype: {
      footnoteLabel: ' ',
      footnoteBackContent: '↑'
    }
  },
});
