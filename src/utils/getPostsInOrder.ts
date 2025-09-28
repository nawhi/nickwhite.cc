import { getCollection } from 'astro:content';

type DePromisify<T> = T extends Promise<infer U> ? U : never;

type Post = DePromisify<ReturnType<typeof getCollection>>[0];

export const getPostDate = (post: Post) =>
  post.data.updatedDate ?? post.data.pubDate;

export const getPostsInOrder = () =>
  getCollection('blog').then((posts) =>
    posts.sort((a, b) => getPostDate(b).valueOf() - getPostDate(a).valueOf()),
  );
