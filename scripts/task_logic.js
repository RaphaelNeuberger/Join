/**
 * @fileoverview Task utility functions and helpers
 * @module task_logic
 */

/**
 * Available avatar colors for contacts
 * @constant {Array<string>}
 */
const AVATAR_COLORS = [
  "rgb(110, 82, 255)",
  "rgb(253, 112, 255)",
  "rgb(70, 47, 138)",
  "rgb(255, 188, 43)",
  "rgb(30, 214, 193)",
  "rgb(255, 123, 0)",
];

/**
 * Gets initials from a full name
 * @param {string} [name=''] - The full name
 * @returns {string} Uppercase initials
 */
function getInitials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => (part[0] || "").toUpperCase())
    .join("");
}

/**
 * Gets a consistent avatar color based on name
 * @param {string} [name=''] - The name to hash
 * @param {number} [index=0] - Additional index for variation
 * @returns {string} RGB color string
 */
function getAvatarColor(name = "", index = 0) {
  if (!AVATAR_COLORS.length) {
    return "#ff7a00";
  }

  const nameStr = String(name || "");
  const hash = nameStr
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);

  const colorIndex = (hash + index) % AVATAR_COLORS.length;
  return AVATAR_COLORS[colorIndex];
}

/**
 * Gets initials from a name (first and last)
 * @param {string} name - The full name
 * @returns {string} Two-letter initials
 */
function getInitialsFromName(name) {
  var parts = String(name).trim().split(" ");
  if (!parts.length) return "";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (
    parts[0].charAt(0).toUpperCase() +
    parts[parts.length - 1].charAt(0).toUpperCase()
  );
}

/**
 * Formats a date string to DD/MM/YY format
 * @param {string} dateStr - ISO date string (YYYY-MM-DD)
 * @returns {string} Formatted date or "-" if invalid
 */
function formatDateToDDMMYY(dateStr) {
  if (!dateStr) return "-";
  const parts = String(dateStr).split("-");
  if (parts.length !== 3) return dateStr;
  const [y, m, d] = parts;
  const yy = y.slice(2);
  return `${d}/${m}/${yy}`;
}

/**
 * Capitalizes the first letter of a string
 * @param {string} str - The string to capitalize
 * @returns {string} Capitalized string
 */
function capitalize(str) {
  if (!str) return "";
  str = String(str);
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Escapes HTML special characters to prevent XSS
 * @param {string} str - The string to escape
 * @returns {string} Escaped string
 */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Normalizes priority string to standard format
 * @param {string} p - Priority value
 * @returns {string} Normalized priority ('Urgent', 'Medium', or 'Low')
 */
function normalizePriority(p) {
  const v = String(p || "Medium").toLowerCase();
  if (v.startsWith("u")) return "Urgent";
  if (v.startsWith("l")) return "Low";
  return "Medium";
}

/**
 * Gets the color for a priority level
 * @param {string} priority - Priority level
 * @returns {string} Hex color code
 */
function priorityColor(priority) {
  const p = normalizePriority(priority);
  if (p === "Urgent") return "#ff3d00";
  if (p === "Low") return "#5be84a";
  return "#ffab2b";
}
