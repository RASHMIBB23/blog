const express = require("express");
const { protect } = require("../middleware/auth");
const {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  likePost,
  addComment,
  getUserPosts,
} = require("../controllers/postController");

const router = express.Router();

// Public routes
router.get("/", getPosts);
router.get("/:id", getPost);

// Protected routes (require login)
router.post("/", protect, createPost);
router.put("/:id", protect, updatePost);
router.delete("/:id", protect, deletePost);
router.put("/:id/like", protect, likePost);
router.post("/:id/comments", protect, addComment);

module.exports = router;
