// task_form.js - Main task form orchestration
// Depends on: task_priority.js, task_subtasks.js, task_assignees.js, task_validation.js


/**
 * Open "Add Task" overlay.
 */
function addTaskBtn() {
  const overlay = document.querySelector(".overlay-modal");
  if (!overlay) return;
  overlay.style.display = "flex";
}


/**
 * Close "Add Task" overlay.
 */
function closeAddTaskBtn() {
  const overlay = document.querySelector(".overlay-modal");
  if (!overlay) return;
  overlay.style.display = "none";
}


/**
 * Initialize Add-Task form.
 */
function initAddTaskForm() {
  const form = document.getElementById("taskForm");
  if (!form) return;

  form.addEventListener("submit", handleCreateTask);

  const clearBtn = document.getElementById("clearBtn");
  if (clearBtn) {
    clearBtn.addEventListener("click", handleClearTaskForm);
  }

  initSubtaskControls();
  initAssignedTo();
}


/**
 * Create task (form submit handler).
 */
async function handleCreateTask(event) {
  if (event) event.preventDefault();

  const taskData = readTaskForm();
  if (!taskData) return;

  try {
    await addTask(taskData);
    renderBoard();
    showSuccessMessage();
    resetTaskForm();
    closeAddTaskBtn();
  } catch (err) {
    console.error("handleCreateTask:", err);
    alert("Task could not be created (see console).");
  }
}


/**
 * Read form values, validate, and build task object.
 */
function readTaskForm() {
  clearFormErrors();

  const title = getInputValue("title");
  const description = getInputValue("description");
  const dueDate = getInputValue("dueDate");
  const category = getInputValue("category");
  const assignedTo = getAssignedTo();

  if (!validateTaskForm(title, dueDate, category)) {
    return null;
  }

  return buildTaskData(title, description, dueDate, category, assignedTo);
}


/**
 * Build task object for addTask().
 */
function buildTaskData(title, description, dueDate, category, assignedTo) {
  const subtasks = getSubtaskDrafts();

  return {
    title,
    description,
    dueDate,
    category,
    assignedTo,
    priority: getSelectedPriority(),
    subtasks,
    status: "todo",
  };
}


/**
 * Reset form to default.
 */
function resetTaskForm() {
  const form = document.getElementById("taskForm");
  if (form) form.reset();

  resetPriorityButtons();
  clearFormErrors();
  resetAssignedTo();
  resetSubtasks();

  const messageElement = document.getElementById("successMessage");
  if (messageElement) {
    messageElement.style.display = "none";
  }
}


/**
 * Clear button pressed → reset form.
 */
function handleClearTaskForm(event) {
  if (event) event.preventDefault();
  resetTaskForm();
}


/**
 * Show success message briefly.
 */
function showSuccessMessage() {
  const messageElement = document.getElementById("successMessage");
  if (!messageElement) return;

  messageElement.style.display = "flex";
  setTimeout(() => {
    messageElement.style.display = "none";
  }, 2000);
}
