const Post = require("../models/Post");
const User = require("../models/User");

// @desc    Get all posts
// @route   GET /api/posts
// @access  Public
const getPosts = async (req, res) => {
  try {
    const posts = await Post.find({ status: "published" })
      .populate("author", "name avatar")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: posts,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single post
// @route   GET /api/posts/:id
// @access  Public
const getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      "author",
      "name avatar",
    );

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Increment views
    post.views += 1;
    await post.save();

    res.status(200).json({
      success: true,
      data: post,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create post
// @route   POST /api/posts
// @access  Private
const createPost = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    const post = await Post.create({
      title: req.body.title,
      content: req.body.content,
      category: req.body.category || "general",
      image: req.body.image,
      tags: req.body.tags || [],
      author: req.user.id,
      authorName: user.name,
      authorAvatar: user.avatar,
    });

    const populatedPost = await Post.findById(post._id).populate(
      "author",
      "name avatar",
    );

    res.status(201).json({
      success: true,
      data: populatedPost,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private
const updatePost = async (req, res) => {
  try {
    let post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Check ownership
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    post = await Post.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title,
        content: req.body.content,
        category: req.body.category,
        image: req.body.image,
        tags: req.body.tags,
        updatedAt: Date.now(),
      },
      { new: true },
    ).populate("author", "name avatar");

    res.status(200).json({
      success: true,
      data: post,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Check ownership
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    await post.deleteOne();

    res.status(200).json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Like/Unlike post
// @route   PUT /api/posts/:id/like
// @access  Private
const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const likeIndex = post.likes.indexOf(req.user.id);

    if (likeIndex === -1) {
      post.likes.push(req.user.id);
      await post.save();
      return res.status(200).json({
        success: true,
        liked: true,
        likes: post.likes.length,
      });
    } else {
      post.likes.splice(likeIndex, 1);
      await post.save();
      return res.status(200).json({
        success: true,
        liked: false,
        likes: post.likes.length,
      });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Add comment
// @route   POST /api/posts/:id/comments
// @access  Private
const addComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const user = await User.findById(req.user.id);

    const comment = {
      user: req.user.id,
      userName: user.name,
      userAvatar: user.avatar,
      text: req.body.text,
    };

    post.comments.push(comment);
    await post.save();

    res.status(201).json({
      success: true,
      comments: post.comments,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get user's posts
// @route   GET /api/posts/user/me
// @access  Private
const getUserPosts = async (req, res) => {
  try {
    const posts = await Post.find({ author: req.user.id })
      .populate("author", "name avatar")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: posts,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  likePost,
  addComment,
  getUserPosts,
};
