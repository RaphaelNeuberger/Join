
function initAddTaskForm() {
  const form = document.getElementById("taskForm");
  if (!form) return;
  registerFormSubmit(form);
  registerClearButton();
  initFormSubmodules();
}

function registerFormSubmit(form) {
  form.addEventListener("submit", handleCreateTask);
}

function registerClearButton() {
  const clearBtn = document.getElementById("clearBtn");
  if (!clearBtn) return;
  clearBtn.addEventListener("click", handleClearTaskForm);
}

function initFormSubmodules() {
  initSubtasksModule();
  initAssignedToModule();
}

function initSubtasksModule() {
  if (typeof initSubtaskControls === "function") {
    initSubtaskControls();
  }
}

function initAssignedToModule() {
  if (typeof initAssignedTo === "function") {
    initAssignedTo();
  }
}

async function handleCreateTask(event) {
  preventDefault(event);
  const taskData = createTaskDataFromForm();
  if (!taskData) return;
  await saveTaskAndUpdateUI(taskData);
}

function preventDefault(event) {
  if (event && typeof event.preventDefault === "function") {
    event.preventDefault();
  }
}

function createTaskDataFromForm() {
  clearFormErrors();
  const fields = readCoreFields();
  if (!validateTaskForm(fields.title, fields.dueDate, fields.category)) {
    return null;
  }
  const extras = readExtraFields();
  return buildTaskData({ ...fields, ...extras });
}

function readCoreFields() {
  return {
    title: getInputValue("title"),
    description: getInputValue("description"),
    dueDate: getInputValue("dueDate"),
    category: getInputValue("category"),
  };
}

function readExtraFields() {
  return {
    assignedTo: getAssignedToSafe(),
    status: getStatusFromHidden(),
    subtasks: getSubtasksSafe(),
  };
}

function getAssignedToSafe() {
  if (typeof getAssignedTo === "function") {
    return getAssignedTo();
  }
  return [];
}

function getStatusFromHidden() {
  const statusInput = document.getElementById("taskStatus");
  if (statusInput && statusInput.value) {
    return statusInput.value;
  }
  return "todo";
}

function getSubtasksSafe() {
  if (typeof getSubtaskDrafts === "function") {
    return getSubtaskDrafts();
  }
  return [];
}

function buildTaskData(params) {
  const base = buildTaskBase(params);
  const meta = buildTaskMeta(params);
  return { ...base, ...meta };
}

function buildTaskBase({ title, description, dueDate, category }) {
  return { title, description, dueDate, category };
}

function buildTaskMeta({ assignedTo, status, subtasks }) {
  return {
    assignedTo,
    priority: getPrioritySafe(),
    subtasks,
    status,
  };
}

function getPrioritySafe() {
  if (typeof getSelectedPriority === "function") {
    return getSelectedPriority();
  }
  return "Medium";
}

async function saveTaskAndUpdateUI(taskData) {
  try {
    await addTask(taskData);
    renderBoardIfAvailable();
    showSuccessMessage();
    resetTaskForm();
    closeOverlayIfAvailable();
  } catch (error) {
    handleTaskCreationError(error);
  }
}

function renderBoardIfAvailable() {
  if (typeof renderBoard === "function") {
    renderBoard();
  }
}

function closeOverlayIfAvailable() {
  if (typeof closeAddTaskBtn === "function") {
    closeAddTaskBtn();
  }
}

function handleTaskCreationError(error) {
  console.error("handleCreateTask:", error);
  alert("Task could not be created. Please try again.");
}

function resetTaskForm() {
  resetFormElement();
  resetPriorityButtonsIfAny();
  clearFormErrors();
  resetAssignedToIfAny();
  resetSubtasksIfAny();
  hideSuccessMessage();
  resetStatusHidden();
}

function resetFormElement() {
  const form = document.getElementById("taskForm");
  if (form) {
    form.reset();
  }
}

function resetPriorityButtonsIfAny() {
  if (typeof resetPriorityButtons === "function") {
    resetPriorityButtons();
  }
}

function resetAssignedToIfAny() {
  if (typeof resetAssignedTo === "function") {
    resetAssignedTo();
  }
}

function resetSubtasksIfAny() {
  if (typeof resetSubtasks === "function") {
    resetSubtasks();
  }
}

function hideSuccessMessage() {
  const messageElement = document.getElementById("successMessage");
  if (messageElement) {
    messageElement.style.display = "none";
  }
}

function resetStatusHidden() {
  const statusInput = document.getElementById("taskStatus");
  if (statusInput) {
    statusInput.value = "todo";
  }
}

function handleClearTaskForm(event) {
  preventDefault(event);
  resetTaskForm();
}

function showSuccessMessage() {
  const messageElement = document.getElementById("successMessage");
  if (!messageElement) return;
  messageElement.style.display = "flex";
  setTimeout(hideSuccessMessage, 2000);
}
