export type Page = { route: string; name: string; exact?: boolean };

export const pages: Page[] = [
  { route: '/', name: 'Home' },
  { route: '/about/', name: 'About' },
  { route: '/blog/', name: 'Blog' },
];
