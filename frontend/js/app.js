// Main Application

// Initialize app
document.addEventListener("DOMContentLoaded", () => {
  initApp();
});

function initApp() {
  // Initialize sample data if empty
  initSampleData();

  // Update UI based on auth state
  updateUI();

  // Load posts
  loadPosts();

  // Setup event listeners
  setupEventListeners();

  // Load dashboard data if authenticated
  if (isAuthenticated()) {
    loadUserPosts();
    loadProfile();
  }
}

// Initialize sample data
function initSampleData() {
  // Check if posts exist
  let posts = loadData("posts");

  if (posts.length === 0) {
    const samplePosts = [
      {
        id: "sample1",
        title: "Getting Started with Blogging",
        category: "lifestyle",
        image: "https://picsum.photos/400/200?random=1",
        content:
          "Blogging is a wonderful way to share your thoughts and connect with others. Here are some tips to get started on your blogging journey...",
        tags: ["blogging", "tips", "beginner"],
        authorId: "system",
        authorName: "BlogHub Team",
        authorAvatar: "",
        likes: ["user1", "user2"],
        comments: [
          {
            id: "comment1",
            authorId: "user1",
            authorName: "John Doe",
            text: "Great tips! Very helpful.",
            date: new Date().toISOString(),
          },
        ],
        views: 150,
        createdAt: new Date().toISOString(),
      },
      {
        id: "sample2",
        title: "The Future of Web Development",
        category: "technology",
        image: "https://picsum.photos/400/200?random=2",
        content:
          "Web development is evolving rapidly. From AI-powered tools to new frameworks, let's explore what the future holds...",
        tags: ["webdev", "technology", "future"],
        authorId: "system",
        authorName: "BlogHub Team",
        authorAvatar: "",
        likes: ["user3"],
        comments: [],
        views: 98,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: "sample3",
        title: "10 Travel Destinations for 2024",
        category: "travel",
        image: "https://picsum.photos/400/200?random=3",
        content:
          "Planning your next adventure? Check out these amazing destinations that should be on your bucket list...",
        tags: ["travel", "destinations", "adventure"],
        authorId: "system",
        authorName: "BlogHub Team",
        authorAvatar: "",
        likes: ["user1", "user2", "user3"],
        comments: [
          {
            id: "comment2",
            authorId: "user2",
            authorName: "Jane Smith",
            text: "Adding these to my list!",
            date: new Date().toISOString(),
          },
        ],
        views: 210,
        createdAt: new Date(Date.now() - 172800000).toISOString(),
      },
    ];

    saveData("posts", samplePosts);
  }

  // Check if users exist
  let users = loadData("users");

  if (users.length === 0) {
    const sampleUsers = [
      {
        id: "system",
        name: "BlogHub Team",
        email: "team@bloghub.com",
        password: "demo123",
        bio: "Official BlogHub team account",
        avatar: "",
        createdAt: new Date().toISOString(),
      },
      {
        id: "user1",
        name: "John Doe",
        email: "john@example.com",
        password: "123456",
        bio: "Passionate blogger and tech enthusiast",
        avatar: "",
        createdAt: new Date().toISOString(),
      },
      {
        id: "user2",
        name: "Jane Smith",
        email: "jane@example.com",
        password: "123456",
        bio: "Travel lover and foodie",
        avatar: "",
        createdAt: new Date().toISOString(),
      },
    ];

    saveData("users", sampleUsers);
  }
}

// Setup all event listeners
function setupEventListeners() {
  // Navigation
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const page = link.dataset.page;
      if (page === "dashboard" && !isAuthenticated()) {
        showToast("Please login first", "error");
        openModal("loginModal");
        return;
      }
      if (page === "create" && !isAuthenticated()) {
        showToast("Please login to create posts", "error");
        openModal("loginModal");
        return;
      }
      showPage(page);
      if (page === "dashboard") loadUserPosts();
      if (page === "profile") loadProfile();
      scrollToTop();
    });
  });

  // Auth buttons
  document.getElementById("loginBtn").onclick = () => openModal("loginModal");
  document.getElementById("registerBtn").onclick = () =>
    openModal("registerModal");
  document.getElementById("logoutBtn").onclick = logout;

  // Forms
  document.getElementById("loginForm").addEventListener("submit", login);
  document.getElementById("registerForm").addEventListener("submit", register);
  document
    .getElementById("createPostForm")
    .addEventListener("submit", createPost);
  document
    .getElementById("editProfileForm")
    .addEventListener("submit", updateProfile);
  document.getElementById("commentForm").addEventListener("submit", addComment);

  // Search with debounce
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener(
      "input",
      debounce(() => {
        loadPosts();
      }, 500),
    );
  }

  // Sort select
  const sortSelect = document.getElementById("sortSelect");
  if (sortSelect) {
    sortSelect.addEventListener("change", () => loadPosts());
  }

  // Category filters
  document.querySelectorAll(".category-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".category-btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      loadPosts();
    });
  });

  // Mobile menu toggle
  const mobileMenu = document.getElementById("mobileMenu");
  const navMenu = document.getElementById("navMenu");
  if (mobileMenu) {
    mobileMenu.addEventListener("click", () => {
      navMenu.classList.toggle("active");
    });
  }

  // Close modals when clicking X or outside
  document.querySelectorAll(".close").forEach((closeBtn) => {
    closeBtn.addEventListener("click", () => {
      closeModal(closeBtn.closest(".modal").id);
    });
  });

  window.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal")) {
      closeModal(e.target.id);
    }
  });
}

// Show page
function showPage(pageName) {
  // Hide all pages
  document.querySelectorAll(".page").forEach((page) => {
    page.classList.remove("active");
  });

  // Show selected page
  const pageId = pageName + "Page";
  const selectedPage = document.getElementById(pageId);
  if (selectedPage) {
    selectedPage.classList.add("active");
  }

  // Update URL hash
  window.location.hash = pageName;

  // Update active nav link
  document.querySelectorAll(".nav-link").forEach((link) => {
    if (link.dataset.page === pageName) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });

  // Load page-specific data
  if (pageName === "home") loadPosts();
  if (pageName === "dashboard" && isAuthenticated()) loadUserPosts();
  if (pageName === "profile" && isAuthenticated()) loadProfile();
}

// Open modal
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = "block";
    document.body.style.overflow = "hidden";
  }
}

// Close modal
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = "none";
    document.body.style.overflow = "auto";
  }
}

// Handle browser back/forward
window.addEventListener("hashchange", () => {
  const hash = window.location.hash.substring(1);
  if (hash && ["home", "create", "dashboard", "profile"].includes(hash)) {
    showPage(hash);
  } else {
    showPage("home");
  }
});

// Handle initial hash
if (window.location.hash) {
  const hash = window.location.hash.substring(1);
  if (["home", "create", "dashboard", "profile"].includes(hash)) {
    showPage(hash);
  }
}
