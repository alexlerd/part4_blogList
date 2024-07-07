const lodash = require("lodash");

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) {
    return null;
  }
  if (blogs.length === 1) {
    return blogs[0];
  }
  const maxBlog = blogs.reduce(
    (max, blog) => (blog.likes > max.likes ? blog : max),
    blogs[0]
  );
  return {
    title: maxBlog.title,
    likes: maxBlog.likes,
  };
};

const totalLikes = (list) => {
  if (list.length === 0) {
    return 0;
  }

  if (list.length === 1) {
    return list[0].likes;
  }
  return list.reduce((sum, blog) => sum + blog.likes, 0);
};

const dummy = (blogs) => {
  return 1;
};

const mostBlogs = (blogs) => {
  // Group the blogs by author and count the number of blogs for each author
  const authorBlogCount = _.countBy(blogs, "author");

  // Find the author with the most blogs
  const maxAuthor = _.maxBy(
    Object.keys(authorBlogCount),
    (author) => authorBlogCount[author]
  );
  const maxBlogs = authorBlogCount[maxAuthor];

  // Return the result in the required JSON format
  return {
    author: maxAuthor,
    blogs: maxBlogs,
  };
};

const _ = require("lodash");

const mostLikes = (blogs) => {
  // Group the blogs by author and sum the likes for each author
  const authorLikesCount = _.reduce(
    blogs,
    (result, blog) => {
      result[blog.author] = (result[blog.author] || 0) + blog.likes;
      return result;
    },
    {}
  );

  // Find the author with the most likes
  const maxAuthor = _.maxBy(
    Object.keys(authorLikesCount),
    (author) => authorLikesCount[author]
  );
  const maxLikes = authorLikesCount[maxAuthor];

  // Return the result in the required JSON format
  return {
    author: maxAuthor,
    likes: maxLikes,
  };
};
module.exports = { favoriteBlog, totalLikes, dummy, mostBlogs, mostLikes };
