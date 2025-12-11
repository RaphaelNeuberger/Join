
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

function showError(id, message) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = message;
  }
}

function clearFormErrors() {
  const errorIds = ["titleError", "dueDateError", "categoryError"];

  errorIds.forEach((id) => {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = "";
    }
  });
}

function getInputValue(id) {
  const element = document.getElementById(id);
  return element ? String(element.value || "").trim() : "";
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
