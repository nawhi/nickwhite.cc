import { expect, test } from '@playwright/test';
import fs from 'fs';

const findNonBlogPages = () =>
  Array.from(fs.globSync('src/pages/**'))
    .filter((page) => page.endsWith('.astro'))
    .filter((page) => !page.includes('[...slug]'));

const findBlogPages = () => Array.from(fs.globSync('src/content/blog/*.{md,mdx}'));

test.describe('Pages Visual Regression', async () => {
  const paths = findNonBlogPages()
    .concat(findBlogPages())
    .map((page) =>
      page
        .replace(/^src\/pages\//, '/')
        .replace(/^src\/content\/blog\//, '/blog/')
        .replace(/\.(astro|md|mdx)$/, '')
        .replace(/\bindex$/, ''),
    );

  paths.forEach((path) => {
    test(`visual regression: ${path}`, async ({ page }) => {
      await page.goto(path);

      // Wait for the main content to be visible
      await page
        .locator('main')
        .first()
        .waitFor({ state: 'visible', timeout: 5000 });

      // Pause any video elements and hide controls for stable screenshots
      await page.evaluate(() => {
        const videos = document.querySelectorAll('video');
        videos.forEach((video) => {
          video.pause();
          video.currentTime = 0;
          video.controls = false;
        });
      });

      // Take a screenshot of the main content
      const main = page.locator('main').first();

      // Sanitize the path for use as a filename
      const sanitizedPath = path
        .replace(/\//g, '-')
        .replace(/[^a-zA-Z0-9\-]/g, '');

      await expect(main).toHaveScreenshot(`${sanitizedPath}.png`);
    });
  });
});
