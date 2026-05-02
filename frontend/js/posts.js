// Post Management Functions

// Create new post
function createPost(event) {
  event.preventDefault();

  const user = getCurrentUser();
  if (!user) {
    showToast("Please login to create a post", "error");
    showPage("login");
    return;
  }

  const title = document.getElementById("postTitle").value.trim();
  const category = document.getElementById("postCategory").value;
  const image = document.getElementById("postImage").value;
  const content = document.getElementById("postContent").value.trim();
  const tags = document
    .getElementById("postTags")
    .value.split(",")
    .map((t) => t.trim());

  if (!title || !content) {
    showToast("Please fill in title and content", "error");
    return;
  }

  const newPost = {
    id: generateId(),
    title,
    category,
    image: image || "https://via.placeholder.com/400x200",
    content,
    tags,
    authorId: user.id,
    authorName: user.name,
    authorAvatar: user.avatar || "",
    likes: [],
    comments: [],
    views: 0,
    createdAt: new Date().toISOString(),
  };

  const posts = loadData("posts");
  posts.unshift(newPost);
  saveData("posts", posts);

  showToast("Post published successfully!");
  clearForm("createPostForm");
  showPage("home");
  loadPosts();
}

// Load all posts
function loadPosts() {
  const posts = loadData("posts");
  const searchTerm =
    document.getElementById("searchInput")?.value.toLowerCase() || "";
  const category =
    document.querySelector(".category-btn.active")?.dataset.category || "all";
  const sortBy = document.getElementById("sortSelect")?.value || "latest";

  let filteredPosts = posts;

  // Filter by search
  if (searchTerm) {
    filteredPosts = filteredPosts.filter(
      (post) =>
        post.title.toLowerCase().includes(searchTerm) ||
        post.content.toLowerCase().includes(searchTerm) ||
        post.tags.some((tag) => tag.toLowerCase().includes(searchTerm)),
    );
  }

  // Filter by category
  if (category !== "all") {
    filteredPosts = filteredPosts.filter((post) => post.category === category);
  }

  // Sort posts
  if (sortBy === "latest") {
    filteredPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else if (sortBy === "oldest") {
    filteredPosts.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  } else if (sortBy === "popular") {
    filteredPosts.sort(
      (a, b) => (b.likes?.length || 0) - (a.likes?.length || 0),
    );
  }

  displayPosts(filteredPosts);
}

// Display posts
function displayPosts(posts) {
  const grid = document.getElementById("postsGrid");
  const loading = document.getElementById("loading");

  loading.style.display = "none";

  if (!posts || posts.length === 0) {
    grid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-newspaper"></i>
                <h3>No posts found</h3>
                <p>Be the first to create a post!</p>
                ${isAuthenticated() ? '<button class="btn-primary" onclick="showPage(\'create\')">Create Post</button>' : ""}
            </div>
        `;
    return;
  }

  grid.innerHTML = posts
    .map(
      (post) => `
        <div class="post-card" onclick="viewPost('${post.id}')">
            ${post.image ? `<img src="${post.image}" alt="${post.title}" class="post-image">` : ""}
            <div class="post-content">
                <span class="post-category">${post.category || "General"}</span>
                <h3 class="post-title">${escapeHtml(post.title)}</h3>
                <p class="post-excerpt">${truncateText(escapeHtml(post.content), 120)}</p>
                <div class="post-meta">
                    <div class="post-author">
                        <img src="${post.authorAvatar || "https://via.placeholder.com/30"}" alt="${post.authorName}">
                        <span>${escapeHtml(post.authorName)}</span>
                    </div>
                    <span>${getRelativeTime(post.createdAt)}</span>
                </div>
                <div class="post-stats">
                    <span onclick="event.stopPropagation(); likePost('${post.id}')">
                        <i class="fas fa-heart"></i> ${post.likes?.length || 0}
                    </span>
                    <span onclick="event.stopPropagation(); openCommentModal('${post.id}')">
                        <i class="fas fa-comment"></i> ${post.comments?.length || 0}
                    </span>
                    <span><i class="fas fa-eye"></i> ${post.views || 0}</span>
                </div>
            </div>
        </div>
    `,
    )
    .join("");
}

// Load user's posts for dashboard
function loadUserPosts() {
  const user = getCurrentUser();
  if (!user) return;

  const posts = loadData("posts");
  const userPosts = posts.filter((post) => post.authorId === user.id);

  // Update stats
  document.getElementById("totalPosts").textContent = userPosts.length;

  let totalLikes = 0;
  let totalComments = 0;
  let totalViews = 0;

  userPosts.forEach((post) => {
    totalLikes += post.likes?.length || 0;
    totalComments += post.comments?.length || 0;
    totalViews += post.views || 0;
  });

  document.getElementById("totalLikes").textContent = totalLikes;
  document.getElementById("totalComments").textContent = totalComments;
  document.getElementById("totalViews").textContent = totalViews;

  displayUserPosts(userPosts);
}

// Display user's posts in dashboard
function displayUserPosts(posts) {
  const grid = document.getElementById("userPostsGrid");

  if (posts.length === 0) {
    grid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-edit"></i>
                <h3>No posts yet</h3>
                <p>Start writing your first blog post!</p>
                <button class="btn-primary" onclick="showPage('create')">Create Post</button>
            </div>
        `;
    return;
  }

  grid.innerHTML = posts
    .map(
      (post) => `
        <div class="user-post-item">
            <div class="user-post-info">
                <h4>${escapeHtml(post.title)}</h4>
                <p>${getRelativeTime(post.createdAt)} • ${post.likes?.length || 0} likes • ${post.comments?.length || 0} comments</p>
            </div>
            <div class="user-post-actions">
                <button class="edit-btn" onclick="editPost('${post.id}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="delete-btn" onclick="deletePost('${post.id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `,
    )
    .join("");
}

// View single post
function viewPost(postId) {
  const posts = loadData("posts");
  const post = posts.find((p) => p.id === postId);

  if (!post) {
    showToast("Post not found", "error");
    return;
  }

  // Increment views
  post.views = (post.views || 0) + 1;
  saveData("posts", posts);

  // Display in modal
  document.getElementById("detailTitle").textContent = post.title;
  document.getElementById("detailContent").innerHTML = `
        <div class="post-detail">
            ${post.image ? `<img src="${post.image}" alt="${post.title}" style="width:100%; border-radius:10px; margin-bottom:1rem;">` : ""}
            <div class="post-meta">
                <span><i class="fas fa-user"></i> ${escapeHtml(post.authorName)}</span>
                <span><i class="fas fa-calendar"></i> ${formatDate(post.createdAt)}</span>
                <span><i class="fas fa-tag"></i> ${post.category || "General"}</span>
            </div>
            <div class="post-tags">
                ${post.tags.map((tag) => `<span class="tag">#${escapeHtml(tag)}</span>`).join("")}
            </div>
            <div class="post-content-full">
                ${escapeHtml(post.content).replace(/\n/g, "<br>")}
            </div>
            <div class="post-stats">
                <button onclick="likePost('${post.id}')" class="btn-outline">
                    <i class="fas fa-heart"></i> ${post.likes?.length || 0} Likes
                </button>
                <button onclick="openCommentModal('${post.id}')" class="btn-outline">
                    <i class="fas fa-comment"></i> ${post.comments?.length || 0} Comments
                </button>
            </div>
            <div class="comments-section">
                <h3>Comments (${post.comments?.length || 0})</h3>
                ${
                  post.comments
                    ?.map(
                      (comment) => `
                    <div class="comment">
                        <div class="comment-author">
                            <strong>${escapeHtml(comment.authorName)}</strong>
                            <small>${getRelativeTime(comment.date)}</small>
                        </div>
                        <p>${escapeHtml(comment.text)}</p>
                    </div>
                `,
                    )
                    .join("") ||
                  "<p>No comments yet. Be the first to comment!</p>"
                }
            </div>
        </div>
    `;

  openModal("postDetailModal");
}

// Like a post
function likePost(postId) {
  const user = getCurrentUser();
  if (!user) {
    showToast("Please login to like posts", "error");
    openModal("loginModal");
    return;
  }

  const posts = loadData("posts");
  const postIndex = posts.findIndex((p) => p.id === postId);

  if (postIndex !== -1) {
    const post = posts[postIndex];
    const likeIndex = post.likes?.indexOf(user.id) || -1;

    if (likeIndex === -1) {
      post.likes = post.likes || [];
      post.likes.push(user.id);
      showToast("Post liked! ❤️");
    } else {
      post.likes.splice(likeIndex, 1);
      showToast("Post unliked");
    }

    saveData("posts", posts);
    loadPosts();

    // Refresh if viewing post detail
    if (document.getElementById("postDetailModal").style.display === "block") {
      viewPost(postId);
    }
  }
}

// Delete a post
function deletePost(postId) {
  if (
    !confirm(
      "Are you sure you want to delete this post? This action cannot be undone.",
    )
  ) {
    return;
  }

  const posts = loadData("posts");
  const newPosts = posts.filter((p) => p.id !== postId);
  saveData("posts", newPosts);

  showToast("Post deleted successfully");
  loadUserPosts();
  loadPosts();
}

// Edit a post
function editPost(postId) {
  const posts = loadData("posts");
  const post = posts.find((p) => p.id === postId);

  if (!post) return;

  // Fill the create form with post data
  document.getElementById("postTitle").value = post.title;
  document.getElementById("postCategory").value = post.category || "";
  document.getElementById("postImage").value = post.image || "";
  document.getElementById("postContent").value = post.content;
  document.getElementById("postTags").value = post.tags.join(", ");

  // Store post ID for update
  window.editingPostId = postId;

  // Change form button text
  const submitBtn = document.querySelector(
    '#createPostForm button[type="submit"]',
  );
  const originalText = submitBtn.textContent;
  submitBtn.textContent = "Update Post";

  // Handle form submission for update
  const originalSubmit = window.createPost;
  window.createPost = function (e) {
    e.preventDefault();
    updatePost(postId);
  };

  // Restore after update or cancel
  const restore = () => {
    submitBtn.textContent = originalText;
    window.createPost = originalSubmit;
    clearForm("createPostForm");
    window.editingPostId = null;
  };

  window.restoreCreateForm = restore;

  showPage("create");
}

// Update a post
function updatePost(postId) {
  const title = document.getElementById("postTitle").value.trim();
  const category = document.getElementById("postCategory").value;
  const image = document.getElementById("postImage").value;
  const content = document.getElementById("postContent").value.trim();
  const tags = document
    .getElementById("postTags")
    .value.split(",")
    .map((t) => t.trim());

  if (!title || !content) {
    showToast("Please fill in title and content", "error");
    return;
  }

  const posts = loadData("posts");
  const postIndex = posts.findIndex((p) => p.id === postId);

  if (postIndex !== -1) {
    posts[postIndex] = {
      ...posts[postIndex],
      title,
      category,
      image: image || posts[postIndex].image,
      content,
      tags,
      updatedAt: new Date().toISOString(),
    };

    saveData("posts", posts);
    showToast("Post updated successfully!");

    if (window.restoreCreateForm) window.restoreCreateForm();
    showPage("home");
    loadPosts();
  }
}

// Open comment modal
let currentPostForComment = null;

function openCommentModal(postId) {
  const user = getCurrentUser();
  if (!user) {
    showToast("Please login to comment", "error");
    openModal("loginModal");
    return;
  }

  currentPostForComment = postId;
  openModal("commentModal");
}

// Add comment
function addComment(event) {
  event.preventDefault();

  const user = getCurrentUser();
  if (!user) return;

  const commentText = document.getElementById("commentText").value.trim();
  if (!commentText) {
    showToast("Please enter a comment", "error");
    return;
  }

  const posts = loadData("posts");
  const postIndex = posts.findIndex((p) => p.id === currentPostForComment);

  if (postIndex !== -1) {
    const comment = {
      id: generateId(),
      authorId: user.id,
      authorName: user.name,
      text: commentText,
      date: new Date().toISOString(),
    };

    posts[postIndex].comments = posts[postIndex].comments || [];
    posts[postIndex].comments.push(comment);
    saveData("posts", posts);

    showToast("Comment added successfully!");
    closeModal("commentModal");
    document.getElementById("commentText").value = "";
    currentPostForComment = null;

    // Refresh if viewing post
    if (document.getElementById("postDetailModal").style.display === "block") {
      viewPost(currentPostForComment);
    }
    loadPosts();
  }
}
