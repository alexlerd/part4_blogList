const mongoose = require("mongoose");

if (process.argv.length < 3) {
  console.log("give password as argument");
  process.exit(1);
}

const password = process.argv[2];

const url =
  "mongodb+srv://fullstack:password@cluster0.as9pnmm.mongodb.net/blogList?retryWrites=true&w=majority";

mongoose.set("strictQuery", false);

mongoose.connect(url).then(() => {
  const blogSchema = new mongoose.Schema({
    title: String,
    author: String,
    likes: Number,
    _v: Number,
  });

  const Blog = mongoose.model("Blog", blogSchema);

  Blog.find({}).then((result) => {
    result.forEach((blog) => {
      console.log(blog);
    });
    mongoose.connection.close();
  });
});
