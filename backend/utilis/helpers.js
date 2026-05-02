// Utility functions

// Slugify string
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
};

// Extract tags from content
const extractTags = (content) => {
  const tagRegex = /#(\w+)/g;
  const matches = content.match(tagRegex);
  return matches ? matches.map((tag) => tag.substring(1)) : [];
};

// Generate excerpt
const generateExcerpt = (content, length = 150) => {
  if (content.length <= length) return content;
  return content.substring(0, length).trim() + "...";
};

// Validate email
const validateEmail = (email) => {
  const re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return re.test(email);
};

// Format date
const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

module.exports = {
  slugify,
  extractTags,
  generateExcerpt,
  validateEmail,
  formatDate,
};
