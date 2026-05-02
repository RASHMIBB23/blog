const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/posts");

// Import error handler
const { errorHandler } = require("./middleware/errorHandler");

// Initialize app
const app = express();

// Connect to database
const connectDB = require("./config/database");
connectDB();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX,
  message: "Too many requests from this IP, please try again later.",
});
app.use("/api", limiter);

// CORS configuration
const corsOptions = {
  origin: process.env.CLIENT_URL || "http://localhost:8000",
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (for images)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Request logging in development
if (process.env.NODE_ENV === "development") {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });
}

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);

// Home route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Blog API",
    version: "1.0.0",
    endpoints: {
      auth: {
        register: "POST /api/auth/register",
        login: "POST /api/auth/login",
        getMe: "GET /api/auth/me",
        updateProfile: "PUT /api/auth/profile",
      },
      posts: {
        getAll: "GET /api/posts",
        getOne: "GET /api/posts/:id",
        create: "POST /api/posts",
        update: "PUT /api/posts/:id",
        delete: "DELETE /api/posts/:id",
        like: "PUT /api/posts/:id/like",
        comment: "POST /api/posts/:id/comments",
        userPosts: "GET /api/posts/user/me",
      },
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 API URL: http://localhost:${PORT}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});
