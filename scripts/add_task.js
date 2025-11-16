// State
let tasks = [];
let subtasks = [];
let selectedPriority = "Medium";

// DOM Elements
const form = document.getElementById("taskForm");
const titleInput = document.getElementById("title");
const descriptionInput = document.getElementById("description");
const dueDateInput = document.getElementById("dueDate");
const assignedToSelect = document.getElementById("assignedTo");
const categorySelect = document.getElementById("category");
const subtaskInput = document.getElementById("subtaskInput");
const subtaskList = document.getElementById("subtaskList");
const addSubtaskBtn = document.getElementById("addSubtaskBtn");
const clearBtn = document.getElementById("clearBtn");
const submitBtn = document.getElementById("submitBtn");
const successMessage = document.getElementById("successMessage");
const priorityButtons = document.querySelectorAll(".priority-buttons__button");

// Priority Selection
function handlePriorityClick(e) {
  const btn = e.currentTarget;
  // remove active state from all
  priorityButtons.forEach((b) => {
    b.classList.remove("is-active");
    b.removeAttribute("aria-pressed");
  });
  // set active on clicked
  btn.classList.add("is-active");
  btn.setAttribute("aria-pressed", "true");
  selectedPriority = btn.dataset.priority || "Medium";
}

function handlePriorityKey(e) {
  // support Space and Enter to activate button when focused
  if (e.key === " " || e.key === "Enter") {
    e.preventDefault();
    e.currentTarget.click();
  }
}

// Add Subtask
function addSubtask() {
  const value = subtaskInput.value.trim();
  if (!value) return;
  subtasks.push(value);
  renderSubtasks();
  subtaskInput.value = "";
}

// Render Subtasks
function renderSubtasks() {
  subtaskList.innerHTML = subtasks
    .map(
      (task, index) => `
    <li class="subtask-list__item">
      <span class="subtask-list__text">${task}</span>
      <button type="button" class="subtask-list__delete" data-index="${index}">
        <svg width="16" height="16" viewBox="0 0 16 16">
          <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>
    </li>
  `
    )
    .join("");
}

// Delete Subtask
function deleteSubtask(index) {
  subtasks.splice(index, 1);
  renderSubtasks();
}

// Validate Field
function validateField(input, errorId, message) {
  const errorEl = document.getElementById(errorId);
  if (!input.value.trim()) {
    errorEl.textContent = message;
    return false;
  }
  errorEl.textContent = "";
  return true;
}

// Validate Form
function validateForm() {
  const titleValid = validateField(
    titleInput,
    "titleError",
    "This field is required"
  );
  const dateValid = validateField(
    dueDateInput,
    "dueDateError",
    "This field is required"
  );
  const categoryValid = validateField(
    categorySelect,
    "categoryError",
    "This field is required"
  );
  return titleValid && dateValid && categoryValid;
}

// Clear Form
function clearForm() {
  form.reset();
  subtasks = [];
  selectedPriority = "Medium";
  renderSubtasks();
  // reset priority buttons to default (Medium)
  priorityButtons.forEach((btn) => {
    btn.classList.remove("is-active");
    btn.removeAttribute("aria-pressed");
  });
  const defaultBtn = document.querySelector('[data-priority="Medium"]');
  if (defaultBtn) {
    defaultBtn.classList.add("is-active");
    defaultBtn.setAttribute("aria-pressed", "true");
  }
  document.getElementById("titleError").textContent = "";
  document.getElementById("dueDateError").textContent = "";
  document.getElementById("categoryError").textContent = "";
}

// Show Success
function showSuccess() {
  successMessage.classList.add("show");
  setTimeout(() => successMessage.classList.remove("show"), 3000);
}

// Save Task
function saveTask(taskData) {
  // keep local copy
  tasks.push(taskData);

  // If Firebase is available, push to Realtime Database under 'tasks'
  if (window.firebaseDb && window.ref && window.push && window.set) {
    try {
      const tasksRef = window.ref(window.firebaseDb, "tasks");
      const newTaskRef = window.push(tasksRef);
      // include a server-like timestamp id if desired - we keep the id set earlier
      window
        .set(newTaskRef, taskData)
        .then(() => console.log("Task saved to Firebase:", taskData))
        .catch((err) => console.error("Firebase save error:", err));
    } catch (err) {
      console.error("Error writing to Firebase:", err);
    }
  } else {
    // fallback: keep it in-memory (or you could implement localStorage fallback here)
    try {
      console.log("Firebase not available, task kept locally:", taskData);
    } catch (e) {
      console.log("Storage not available");
    }
  }
}

// Handle Submit
function handleSubmit(e) {
  e.preventDefault();
  if (!validateForm()) return;

  const taskData = {
    id: Date.now(),
    title: titleInput.value.trim(),
    description: descriptionInput.value.trim(),
    dueDate: dueDateInput.value,
    priority: selectedPriority,
    assignedTo: assignedToSelect.value,
    category: categorySelect.value,
    status: "todo",
    subtasks: [...subtasks],
    createdAt: new Date().toISOString(),
  };

  saveTask(taskData);
  showSuccess();
  clearForm();
}

// Event Listeners
priorityButtons.forEach((btn) => {
  // make the button keyboard accessible
  btn.setAttribute("role", "button");
  btn.setAttribute("tabindex", "0");
  btn.addEventListener("click", handlePriorityClick);
  btn.addEventListener("keydown", handlePriorityKey);
});
addSubtaskBtn.addEventListener("click", addSubtask);
subtaskInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    addSubtask();
  }
});
subtaskList.addEventListener("click", (e) => {
  if (e.target.closest(".subtask-list__delete")) {
    const index = parseInt(
      e.target.closest(".subtask-list__delete").dataset.index
    );
    deleteSubtask(index);
  }
});
clearBtn.addEventListener("click", clearForm);
form.addEventListener("submit", handleSubmit);

// Initialize
renderSubtasks();
// Initialize priority button state: honor any pre-marked active button or default to Medium
{
  const activeBtn =
    document.querySelector(
      ".priority-buttons__button.priority-buttons__button--active"
    ) || document.querySelector('[data-priority="Medium"]');
  priorityButtons.forEach((b) => b.removeAttribute("aria-pressed"));
  if (activeBtn) {
    activeBtn.classList.add("is-active");
    activeBtn.setAttribute("aria-pressed", "true");
    selectedPriority = activeBtn.dataset.priority || "Medium";
  }
}
