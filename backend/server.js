const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// In-memory storage (instead of MongoDB)
let users = [];
let posts = [];
let nextId = 1;

// Register endpoint
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = users.find((u) => u.email === email);
    if (userExists) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = {
      id: nextId++,
      name,
      email,
      password: hashedPassword,
    };

    users.push(user);

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });

    res.status(201).json({
      success: true,
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Login endpoint
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = users.find((u) => u.email === email);
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });

    res.json({
      success: true,
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Middleware to protect routes
const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ success: false, message: "No token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = users.find((u) => u.id === decoded.id);
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

// Create post
app.post("/api/posts", protect, (req, res) => {
  const post = {
    id: nextId++,
    title: req.body.title,
    content: req.body.content,
    author: req.user.id,
    authorName: req.user.name,
    likes: [],
    comments: [],
    createdAt: new Date().toISOString(),
  };

  posts.push(post);
  res.status(201).json({ success: true, data: post });
});

// Get all posts
app.get("/api/posts", (req, res) => {
  const allPosts = posts.map((post) => ({
    ...post,
    author: { id: post.author, name: post.authorName },
  }));
  res.json({ success: true, data: allPosts });
});

// Get single post
app.get("/api/posts/:id", (req, res) => {
  const post = posts.find((p) => p.id === parseInt(req.params.id));
  if (!post) {
    return res.status(404).json({ success: false, message: "Post not found" });
  }
  res.json({ success: true, data: post });
});

// Like post
app.put("/api/posts/:id/like", protect, (req, res) => {
  const post = posts.find((p) => p.id === parseInt(req.params.id));
  if (!post) {
    return res.status(404).json({ success: false, message: "Post not found" });
  }

  const likeIndex = post.likes.indexOf(req.user.id);
  if (likeIndex === -1) {
    post.likes.push(req.user.id);
  } else {
    post.likes.splice(likeIndex, 1);
  }

  res.json({ success: true, likes: post.likes.length });
});

// Delete post
app.delete("/api/posts/:id", protect, (req, res) => {
  const postIndex = posts.findIndex((p) => p.id === parseInt(req.params.id));
  if (postIndex === -1) {
    return res.status(404).json({ success: false, message: "Post not found" });
  }

  if (posts[postIndex].author !== req.user.id) {
    return res.status(403).json({ success: false, message: "Not authorized" });
  }

  posts.splice(postIndex, 1);
  res.json({ success: true, message: "Post deleted" });
});

// Get user's posts
app.get("/api/posts/user/me", protect, (req, res) => {
  const userPosts = posts.filter((p) => p.author === req.user.id);
  res.json({ success: true, data: userPosts });
});

// Home route
app.get("/", (req, res) => {
  res.json({ message: "Blog API is running (without MongoDB)" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(
    `🚀 Server running on port ${PORT} (No MongoDB - using memory storage)`,
  );
  console.log(`📝 Note: Data will be lost when server restarts!`);
});
