import rss from '@astrojs/rss';
import {getCollection} from 'astro:content';
import {siteMetadata} from '../consts';

export async function get(context) {
  const posts = await getCollection('blog');
  return rss({
    title: siteMetadata.name,
    description: siteMetadata.description,
    site: context.site,
    items: posts.map((post) => ({
      ...post.data,
      link: `/blog/${post.slug}/`,
    })),
  });
}
