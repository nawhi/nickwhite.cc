import {getCollection} from "astro:content";

export const getPostsInOrder = () =>
    getCollection('blog')
        .then((posts) => posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()));
