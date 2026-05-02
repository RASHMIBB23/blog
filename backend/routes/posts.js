const express = require("express");
const {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  likePost,
  addComment,
  getUserPosts,
  getPostsByUser,
} = require("../controllers/postController");
const { protect } = require("../middleware/auth");

const router = express.Router();

// Public routes
router.get("/", getPosts);
router.get("/user/:userId", getPostsByUser);
router.get("/:id", getPost);

// Protected routes
router.post("/", protect, createPost);
router.put("/:id", protect, updatePost);
router.delete("/:id", protect, deletePost);
router.put("/:id/like", protect, likePost);
router.post("/:id/comments", protect, addComment);
router.get("/user/me", protect, getUserPosts);

module.exports = router;
