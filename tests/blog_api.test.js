const { test, after, beforeEach, describe } = require("node:test");
const assert = require("node:assert");
const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");

const api = supertest(app);
const bcrypt = require("bcrypt");

const helper = require("./test_helper");
const listHelper = require("../utils/list_helper");

const User = require("../models/user");
const Blog = require("../models/blogModel");

test("dummy returns one", () => {
  const blogs = [];

  const result = listHelper.dummy(blogs);
  assert.strictEqual(result, 1);
});

//  when there some blogs saves
describe("when there some blogs saves", () => {
  beforeEach(async () => {
    await Blog.deleteMany({});

    await Blog.insertMany(helper.blogs);
  });

  test("blogs are returned as json", async () => {
    await api
      .get("/api/blogs")
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });

  test("all blogs are returned", async () => {
    const response = await api.get("/api/blogs");

    assert.strictEqual(response.body.length, helper.blogs.length);
  });

  test("there are six blogs", async () => {
    const response = await api.get("/api/blogs");

    assert.strictEqual(response.body.length, 6);
  });

  test("the first blog is about Go To Statement Considered Harmful ", async () => {
    const response = await api.get("/api/blogs");

    const titles = response.body.map((e) => e.title);
    assert(titles.includes("Go To Statement Considered Harmful"));
  });

  //  viewing a specific blog
  describe("viewing a specific blog", () => {
    test("a valid blog can be added", async () => {
      const newBlog = {
        title: "Test Blog",
        author: "John Doe",
        url: "http:example.com",
        likes: 3,
      };

      await api.post("/api/blogs").send(newBlog).expect(400);

      const response = await api.get("/api/blogs");

      assert.strictEqual(response.body.length, helper.blogs.length);
    });

    test("blog without likes property defaults to 0", async () => {
      const newBlog = {
        title: "Test Blog",
        author: "John Doe",
        url: "https://example.com/test-blog",
      };

      await api.post("/api/blogs").send(newBlog).expect(400);

      const response = await api.get("/api/blogs");

      assert.strictEqual(response.body.length, helper.blogs.length);
    });

    test("blog without url property defaults to 0", async () => {
      const newBlog = {
        title: "Test Blog",
        author: "John Doe",
        likes: 3,
      };

      await api.post("/api/blogs").send(newBlog).expect(400);

      const response = await api.get("/api/blogs");

      assert.strictEqual(response.body.length, helper.blogs.length);
    });

    test("blog without title property defaults to 0", async () => {
      const newBlog = {
        author: "John Doe",
        url: "https://example.com/test-blog",
        likes: 2,
      };

      await api.post("/api/blogs").send(newBlog).expect(400);

      const response = await api.get("/api/blogs");

      assert.strictEqual(response.body.length, helper.blogs.length);
    });
  });

  //  deletting of a blog
  describe("deletion of a blog", () => {
    test("a blog can be deleted", async () => {
      const blogsAtStart = await helper.blogsInDb();
      const blogToDelete = blogsAtStart[0];

      await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204);

      const blogsAtEnd = await helper.blogsInDb();

      const titles = blogsAtEnd.map((r) => r.title);
      assert(!titles.includes(blogToDelete.title));

      assert.strictEqual(blogsAtEnd.length, blogsAtStart.length - 1);
    });

    test("fails with status code 404 if the blog does not exist", async () => {
      const validNoneexistingId = await helper.nonExistingId();
      const newBlog = new Blog({
        title: "Universe",
        author: "Jessie",
        url: "https://example.com",
        likes: 1,
      });

      await newBlog.save();

      await api.get(`/api/blogs/${validNoneexistingId}`).expect(404);

      // Clean up
      await newBlog.deleteOne();
    });

    test("fails with status code 400 if id is invalid", async () => {
      const invalidId = "87a1498571987b59187";

      await api.get(`/api/blogs/${invalidId}`).expect(400);
    });
  });
});

//  when there is initially one user at db
describe("when there is initially one user at db", () => {
  beforeEach(async () => {
    await User.deleteMany({});

    const passwordHash = await bcrypt.hash("sekret", 10);
    const user = new User({ username: "root", passwordHash });

    await user.save();
  });

  test("creation succeeds with a fresh username", async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: "jessie",
      name: "Jessie James",
      password: "passwrd",
    };

    await api
      .post("/api/users")
      .send(newUser)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await helper.usersInDb();
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1);

    const usernames = usersAtEnd.map((user) => user.username);
    assert(usernames.includes(newUser.username));
  });

  test("creation fails with proper status code and message if username already taken", async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: "root",
      name: " Superuser",
      password: "password",
    };

    const result = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await helper.usersInDb();

    assert(result.body.error.includes("expected `username` to be unique"));

    assert.strictEqual(usersAtEnd.length, usersAtStart.length);
  });
});

after(async () => {
  await User.deleteMany({});
  await mongoose.connection.close();
});
