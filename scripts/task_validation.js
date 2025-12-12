/**
 * @fileoverview Task form validation utilities
 * @module task_validation
 */

/**
 * Validates the task form fields
 * @param {string} title - Task title
 * @param {string} dueDate - Task due date
 * @param {string} category - Task category
 * @returns {boolean} Whether the form is valid
 */
function validateTaskForm(title, dueDate, category) {
  let valid = true;

  if (!title) {
    showError("titleError", "Title is required");
    valid = false;
  }

  if (!dueDate) {
    showError("dueDateError", "Due date is required");
    valid = false;
  }

  if (!category) {
    showError("categoryError", "Category is required");
    valid = false;
  }

  return valid;
}

/**
 * Displays an error message in the specified element
 * @param {string} id - The error element ID
 * @param {string} message - The error message to display
 */
function showError(id, message) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = message;
  }
}

/**
 * Clears all form error messages
 */
function clearFormErrors() {
  const errorIds = ["titleError", "dueDateError", "categoryError"];

  errorIds.forEach((id) => {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = "";
    }
  });
}

/**
 * Gets the trimmed value of an input element
 * @param {string} id - The input element ID
 * @returns {string} The trimmed input value
 */
function getInputValue(id) {
  const element = document.getElementById(id);
  return element ? String(element.value || "").trim() : "";
}

/**
 * Escapes HTML special characters
 * @param {string} str - The string to escape
 * @returns {string} The escaped string
 */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
