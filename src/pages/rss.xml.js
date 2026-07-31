import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { siteMetadata } from '../consts';

export async function GET(context) {
  const posts = await getCollection('blog');
  return rss({
    title: siteMetadata.name,
    description: siteMetadata.description,
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: `/blog/${post.id}/`,
    })),
  });
}
