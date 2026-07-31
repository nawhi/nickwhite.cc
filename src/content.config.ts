import { glob } from 'astro/loaders';
import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';

const blog = defineCollection({
  // Content Layer API (Astro 5+): load markdown from the content folder.
  // `[^_]*` skips files starting with an underscore (drafts/partials).
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/blog' }),
  // Type-check frontmatter using a schema
  schema: z.object({
    title: z.string(),
    description: z.string(),
    draft: z.boolean().optional(),
    // Transform string to Date object
    pubDate: z
      .string()
      .or(z.date())
      .transform((val) => new Date(val)),
    updatedDate: z
      .string()
      .or(z.date())
      .optional()
      .transform((str) => (str ? new Date(str) : undefined)),
    heroImage: z.string().optional(),
  }),
});

export const collections = { blog };
