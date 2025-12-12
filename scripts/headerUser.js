/**
 * @fileoverview Header user initials display
 * @module headerUser
 */

/**
 * Checks if user is a guest
 * @param {Object} user - User object
 * @returns {boolean} True if guest user
 */
function isGuestUser(user) {
  return user.isGuest || !user.name || user.name.trim() === "";
}

/**
 * Calculates initials from a name
 * @param {string} name - The full name
 * @returns {string} The initials
 */
function calculateInitials(name) {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  if (parts.length === 1 && parts[0].length >= 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return "G";
}

/**
 * Gets user initials from localStorage
 * @returns {string} User initials or "G" for guest
 */
function getUserInitials() {
  try {
    const data = localStorage.getItem("loggedInUser");
    if (!data) return "G";
    const user = JSON.parse(data);
    if (isGuestUser(user)) return "G";
    return calculateInitials(user.name);
  } catch (e) {
    return "G";
  }
}

/**
 * Displays user initials in the header
 */
function showInitials() {
  const span = document.getElementById("userInitials");
  if (!span) {
    setTimeout(showInitials, 100);
    return;
  }
  span.textContent = getUserInitials();
}

showInitials();
setTimeout(showInitials, 200);
setTimeout(showInitials, 500);
setTimeout(showInitials, 1000);
