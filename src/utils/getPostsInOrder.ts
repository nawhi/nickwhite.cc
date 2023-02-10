import {getCollection} from "astro:content";

export const getPostsInOrder = () =>
    getCollection('blog')
        .then((posts) => posts.sort((a, b) => a.data.pubDate.valueOf() - b.data.pubDate.valueOf()));
