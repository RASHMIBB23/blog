// Authentication Functions

// Register user
function register(event) {
  event.preventDefault();

  const name = document.getElementById("regName").value.trim();
  const email = document.getElementById("regEmail").value.trim();
  const password = document.getElementById("regPassword").value;
  const confirmPassword = document.getElementById("regConfirmPassword").value;

  // Validation
  if (!name || !email || !password) {
    showToast("Please fill in all fields", "error");
    return;
  }

  if (password !== confirmPassword) {
    showToast("Passwords do not match", "error");
    return;
  }

  if (password.length < 6) {
    showToast("Password must be at least 6 characters", "error");
    return;
  }

  // Get existing users
  let users = loadData("users");

  // Check if email already exists
  if (users.find((u) => u.email === email)) {
    showToast("Email already registered", "error");
    return;
  }

  // Create new user
  const newUser = {
    id: generateId(),
    name,
    email,
    password,
    bio: "",
    avatar: "",
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveData("users", users);

  // Auto login
  const userData = {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    bio: newUser.bio,
    avatar: newUser.avatar,
  };

  localStorage.setItem("currentUser", JSON.stringify(userData));
  showToast("Registration successful! Welcome!");

  // Close modal and update UI
  closeModal("registerModal");
  updateUI();
  showPage("home");
}

// Login user
function login(event) {
  event.preventDefault();

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  if (!email || !password) {
    showToast("Please enter email and password", "error");
    return;
  }

  const users = loadData("users");
  const user = users.find((u) => u.email === email && u.password === password);

  if (!user) {
    showToast("Invalid email or password", "error");
    return;
  }

  // Store user info (without password)
  const userData = {
    id: user.id,
    name: user.name,
    email: user.email,
    bio: user.bio || "",
    avatar: user.avatar || "",
  };

  localStorage.setItem("currentUser", JSON.stringify(userData));
  showToast(`Welcome back, ${user.name}!`);

  closeModal("loginModal");
  updateUI();
  showPage("home");
  loadPosts();
}

// Logout user
function logout() {
  localStorage.removeItem("currentUser");
  showToast("Logged out successfully");
  updateUI();
  showPage("home");
  loadPosts();
}

// Update profile
function updateProfile(event) {
  event.preventDefault();

  const name = document.getElementById("editName").value.trim();
  const bio = document.getElementById("editBio").value;
  const avatar = document.getElementById("editAvatar").value;

  if (!name) {
    showToast("Name is required", "error");
    return;
  }

  const currentUser = getCurrentUser();
  let users = loadData("users");
  const userIndex = users.findIndex((u) => u.id === currentUser.id);

  if (userIndex !== -1) {
    users[userIndex].name = name;
    users[userIndex].bio = bio;
    users[userIndex].avatar = avatar;
    saveData("users", users);

    // Update current user
    const updatedUser = {
      ...currentUser,
      name,
      bio,
      avatar,
    };
    localStorage.setItem("currentUser", JSON.stringify(updatedUser));

    showToast("Profile updated successfully");
    closeModal("editProfileModal");
    updateUI();
    loadProfile();
  }
}

// Edit profile
function editProfile() {
  const user = getCurrentUser();
  if (!user) {
    showToast("Please login first", "error");
    return;
  }

  document.getElementById("editName").value = user.name || "";
  document.getElementById("editBio").value = user.bio || "";
  document.getElementById("editAvatar").value = user.avatar || "";

  openModal("editProfileModal");
}

// Load profile data
function loadProfile() {
  const user = getCurrentUser();
  if (!user) return;

  document.getElementById("profileName").textContent = user.name;
  document.getElementById("profileEmail").textContent = user.email;
  document.getElementById("profileJoinDate").textContent =
    `Joined ${formatDate(user.createdAt || new Date())}`;

  // Load user statistics
  const posts = loadData("posts");
  const userPosts = posts.filter((p) => p.authorId === user.id);

  document.getElementById("profilePosts").textContent = userPosts.length;

  let totalLikes = 0;
  let totalComments = 0;
  userPosts.forEach((post) => {
    totalLikes += post.likes?.length || 0;
    totalComments += post.comments?.length || 0;
  });

  document.getElementById("profileLikes").textContent = totalLikes;
  document.getElementById("profileComments").textContent = totalComments;
}

// Update UI based on auth state
function updateUI() {
  const isAuth = isAuthenticated();
  const user = getCurrentUser();

  const createNav = document.getElementById("createNav");
  const dashboardNav = document.getElementById("dashboardNav");
  const profileNav = document.getElementById("profileNav");
  const loginBtn = document.getElementById("loginBtn");
  const registerBtn = document.getElementById("registerBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  if (isAuth && user) {
    createNav.style.display = "block";
    dashboardNav.style.display = "block";
    profileNav.style.display = "block";
    loginBtn.style.display = "none";
    registerBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";
  } else {
    createNav.style.display = "none";
    dashboardNav.style.display = "none";
    profileNav.style.display = "none";
    loginBtn.style.display = "inline-block";
    registerBtn.style.display = "inline-block";
    logoutBtn.style.display = "none";
  }
}

// Switch to login modal
function switchToLogin() {
  closeModal("registerModal");
  openModal("loginModal");
}

// Switch to register modal
function switchToRegister() {
  closeModal("loginModal");
  openModal("registerModal");
}
