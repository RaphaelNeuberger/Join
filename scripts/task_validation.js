// task_validation.js - Form validation and error handling

/**
 * Validate required form fields.
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
 * Write error text to error span.
 */
function showError(id, message) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = message;
  }
}

/**
 * Reset all form errors.
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
 * Get input value and trim.
 */
function getInputValue(id) {
  const element = document.getElementById(id);
  return element ? element.value.trim() : "";
}

/**
 * Escape HTML to prevent XSS.
 */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
