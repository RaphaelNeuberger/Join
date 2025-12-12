/**
 * @fileoverview Board overlay functionality for task details and editing
 * @module board_overlay
 */

/**
 * Handles click events on task cards
 * @param {Event} event - The click event
 */
function onTaskCardClick(event) {
  if (handleMoveButtonClick(event)) return;
  handleTaskCardOpen(event);
}

/**
 * Handles move button click events
 * @param {Event} event - The click event
 * @returns {boolean} True if a move button was clicked
 */
function handleMoveButtonClick(event) {
  const moveBtn = event.target.closest(".card-move-btn");
  if (!moveBtn) return false;

  event.stopPropagation();
  event.preventDefault();

  const card = moveBtn.closest(".card-task");
  if (!card) return false;

  const taskId = card.dataset.taskId;
  if (!taskId) return false;

  openMoveMenu(taskId, moveBtn);
  return true;
}

/**
 * Handles task card open events
 * @param {Event} event - The click event
 */
function handleTaskCardOpen(event) {
  const card = event.target.closest(".card-task");
  if (!card) return;

  const taskId = card.dataset.taskId;
  if (!taskId) return;

  openTaskCard(taskId);
}

/**
 * Gets overlay DOM elements
 * @returns {Object} Object containing overlay and content elements
 */
function getOverlayElements() {
  const overlay = document.querySelector(".overlay-task-card");
  const content = document.getElementById("taskCardContent");
  return { overlay, content };
}

/**
 * Creates a confirmation overlay element
 * @returns {HTMLElement} The overlay element
 */
function createConfirmOverlay() {
  const overlay = document.createElement("div");
  overlay.className = "confirm-overlay confirm-overlay--open";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  return overlay;
}

/**
 * Creates a confirmation dialog element
 * @param {string} message - The confirmation message
 * @returns {HTMLElement} The dialog element
 */
function createConfirmDialog(message) {
  const dialog = document.createElement("div");
  dialog.className = "confirm-dialog";
  dialog.innerHTML = `
    <h3 class="confirm-dialog__title">Confirm</h3>
    <p class="confirm-dialog__message">
      ${message || "Are you sure?"}
    </p>
    <div class="confirm-dialog__actions">
      <button type="button" class="confirm-dialog__button confirm-dialog__button--cancel">
        Cancel
      </button>
      <button type="button" class="confirm-dialog__button confirm-dialog__button--confirm">
        Delete
      </button>
    </div>
  `;
  return dialog;
}

/**
 * Focuses the cancel button in a dialog
 * @param {HTMLElement} dialog - The dialog element
 */
function focusCancelButton(dialog) {
  const cancelBtn = dialog.querySelector(".confirm-dialog__button--cancel");
  if (cancelBtn) cancelBtn.focus();
}

/**
 * Attaches keydown handler for escape key
 * @param {Function} cleanup - Cleanup function to call
 */
function attachConfirmKeydown(cleanup) {
  const handler = (event) => {
    if (event.key === "Escape") {
      document.removeEventListener("keydown", handler);
      cleanup(false);
    }
  };
  document.addEventListener("keydown", handler);
}

/**
 * Sets up confirm dialog event handlers
 * @param {HTMLElement} overlay - The overlay element
 * @param {HTMLElement} dialog - The dialog element
 * @param {Function} resolve - Promise resolve function
 */
function setupConfirmEvents(overlay, dialog, resolve) {
  const cancelBtn = dialog.querySelector(".confirm-dialog__button--cancel");
  const confirmBtn = dialog.querySelector(".confirm-dialog__button--confirm");

  const cleanup = (result) => {
    overlay.remove();
    resolve(result);
  };

  cancelBtn.addEventListener("click", () => cleanup(false));
  confirmBtn.addEventListener("click", () => cleanup(true));

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) cleanup(false);
  });

  attachConfirmKeydown(cleanup);
}

/**
 * Shows a confirmation popup dialog
 * @param {string} message - The confirmation message
 * @returns {Promise<boolean>} Promise resolving to user's choice
 */
function showConfirmPopup(message) {
  return new Promise((resolve) => {
    const overlay = createConfirmOverlay();
    const dialog = createConfirmDialog(message);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    focusCancelButton(dialog);
    setupConfirmEvents(overlay, dialog, resolve);
  });
}

/**
 * Opens the task card overlay for a specific task
 * @param {string} taskId - The task ID
 */
function openTaskCard(taskId) {
  const { overlay, content } = getOverlayElements();
  if (!overlay || !content) return;

  const task = tasks.find((t) => String(t.id) === String(taskId));
  if (!task) return;

  content.innerHTML = taskCardContentTemplate(task);
  overlay.style.display = "flex";
  overlay.classList.add("overlay-task-card--open");
  document.body.style.overflow = "hidden";
  closeMoveMenu();
}

/**
 * Closes the task card overlay
 */
function closeTaskCard() {
  const { overlay, content } = getOverlayElements();
  if (!overlay) return;

  overlay.style.display = "none";
  overlay.classList.remove("overlay-task-card--open");
  document.body.style.overflow = "";

  if (content) {
    content.innerHTML = "";
  }

  closeMoveMenu();
}

document.addEventListener("click", (event) => {
  const { overlay } = getOverlayElements();
  if (!overlay) return;
  if (event.target === overlay) closeTaskCard();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeTaskCard();
    closeMoveMenu();
  }
});

/**
 * Opens the task edit view
 * @param {string} taskId - The task ID
 */
function onTaskEditClick(taskId) {
  const { overlay, content } = getOverlayElements();
  if (!overlay || !content) return;

  const task = tasks.find((t) => String(t.id) === String(taskId));
  if (!task) return;

  content.innerHTML = taskCardEditTemplate(task);
  removeMinDate();
  initEditAssignedSection(task, content);
}

/**
 * Initializes the assigned section in edit mode
 * @param {Object} task - The task object
 * @param {HTMLElement} content - The content element
 */
function initEditAssignedSection(task, content) {
  setTimeout(() => {
    try {
      updateSelectedAssignees(task);
      initAssignedToInEdit(content);
      hideAssignedDropdown(content);
    } catch (error) {
      console.error("onTaskEditClick: initAssignedTo failed", error);
    }
  }, 0);
}

/**
 * Updates selected assignees from task data
 * @param {Object} task - The task object
 */
function updateSelectedAssignees(task) {
  if (!Array.isArray(task.assignedTo)) return;
  if (typeof selectedAssignees === "undefined") return;

  const ids = task.assignedTo
    .map((entry) => normalizeAssigneeId(entry))
    .filter(Boolean);

  selectedAssignees = ids;
}

/**
 * Normalizes an assignee entry to an ID
 * @param {string|Object} entry - The assignee entry
 * @returns {string|null} The normalized ID or null
 */
function normalizeAssigneeId(entry) {
  if (!entry) return null;

  if (typeof entry === "string") {
    const contact = contacts.find((c) => c.name === entry || c.id === entry);
    return contact ? contact.id : null;
  }

  if (typeof entry === "object") {
    if (entry.id) return entry.id;
    const contact = contacts.find((c) => c.name === entry.name);
    return contact ? contact.id : null;
  }

  return null;
}

/**
 * Initializes assigned-to functionality in edit mode
 * @param {HTMLElement} content - The content element
 */
function initAssignedToInEdit(content) {
  if (typeof initAssignedToScoped === "function") {
    initAssignedToScoped(content);
    return;
  }
  if (typeof initAssignedTo === "function") {
    initAssignedTo();
  }
}

/**
 * Hides the assigned dropdown in content
 * @param {HTMLElement} content - The content element
 */
function hideAssignedDropdown(content) {
  const dropdown = content.querySelector(".assigned-to-dropdown");
  if (dropdown) dropdown.style.display = "none";
}

/**
 * Cancels task editing and returns to view mode
 * @param {string} taskId - The task ID
 */
function onTaskEditCancel(taskId) {
  openTaskCard(taskId);
}

/**
 * Builds task update payload from form data
 * @param {FormData} formData - The form data
 * @returns {Object} The update payload
 */
function buildTaskUpdatePayload(formData) {
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const dueDate = String(formData.get("dueDate") || "").trim();
  const priorityRaw = String(formData.get("priority") || "Medium").trim();
  return { title, description, dueDate, priorityRaw };
}

/**
 * Validates the edit payload
 * @param {Object} payload - The payload to validate
 * @returns {boolean} True if valid
 */
function isEditPayloadValid(payload) {
  if (!payload.title) {
    alert("Title is required.");
    return false;
  }
  return true;
}

/**
 * Finds task index by ID
 * @param {string} taskId - The task ID
 * @returns {number} The task index or -1
 */
function findTaskIndexById(taskId) {
  return tasks.findIndex((task) => String(task.id) === String(taskId));
}

/**
 * Creates an updated task object
 * @param {Object} oldTask - The original task
 * @param {Object} payload - The update payload
 * @returns {Object} The updated task
 */
function createUpdatedTask(oldTask, payload) {
  const assignedTo =
    typeof getAssignedTo === "function"
      ? getAssignedTo()
      : oldTask.assignedTo;

  return {
    ...oldTask,
    title: payload.title,
    description: payload.description,
    dueDate: payload.dueDate,
    priority: normalizePriority(payload.priorityRaw),
    assignedTo,
  };
}

/**
 * Persists an edited task to storage
 * @async
 * @param {Object} updatedTask - The updated task
 * @param {number} index - The task index
 * @param {string} taskId - The task ID
 */
async function persistEditedTask(updatedTask, index, taskId) {
  try {
    await saveTask(updatedTask);
    tasks[index] = updatedTask;
    renderBoard();
    openTaskCard(taskId);
  } catch (error) {
    console.error("onTaskEditSave: error saving task", error);
    alert("Error while saving the task.");
  }
}

/**
 * Handles task edit save event
 * @async
 * @param {Event} event - The submit event
 * @param {string} taskId - The task ID
 */
async function onTaskEditSave(event, taskId) {
  event.preventDefault();

  const form = event.target;
  if (!form) return;

  const formData = new FormData(form);
  const payload = buildTaskUpdatePayload(formData);
  if (!isEditPayloadValid(payload)) return;

  const index = findTaskIndexById(taskId);
  if (index === -1) return;

  const updatedTask = createUpdatedTask(tasks[index], payload);
  await persistEditedTask(updatedTask, index, taskId);
}

/**
 * Handles priority button click in edit mode
 * @param {Event} event - The click event
 */
function onEditPriorityClick(event) {
  const button = event.currentTarget;
  const wrapper = button.closest(".priority-buttons");
  if (!wrapper) return;

  const buttons = wrapper.querySelectorAll(".priority-buttons__button");
  buttons.forEach((btn) => btn.classList.remove("is-active"));

  button.classList.add("is-active");

  const hidden = wrapper.querySelector('input[name="priority"]');
  if (hidden) hidden.value = button.dataset.priority || "Medium";
}

/**
 * Handles overlay delete button click
 * @async
 * @param {string} taskId - The task ID
 */
async function onOverlayDeleteClick(taskId) {
  const confirmed = await showConfirmPopup(
    "Do you really want to delete this task?"
  );
  if (!confirmed) return;

  await deleteTask(taskId);
}

/**
 * Deletes a task by ID
 * @async
 * @param {string} taskId - The task ID
 */
async function deleteTask(taskId) {
  try {
    await deleteTaskById(taskId);

    tasks = tasks.filter(
      (task) =>
        String(task.id) !== String(taskId) &&
        String(task.firebaseId) !== String(taskId)
    );

    closeTaskCard();
    renderBoard();
  } catch (error) {
    console.error("onOverlayDeleteClick: error deleting task", error);
    alert("Error while deleting the task.");
  }
}

/**
 * Gets a cloned copy of task subtasks
 * @param {Object} task - The task object
 * @returns {Array<Object>} Cloned subtasks array
 */
function getClonedSubtasks(task) {
  return Array.isArray(task.subtasks) ? [...task.subtasks] : [];
}

/**
 * Creates an updated subtask object
 * @param {Object} subtask - The original subtask
 * @param {boolean} checked - The new checked state
 * @returns {Object} The updated subtask
 */
function createUpdatedSubtask(subtask, checked) {
  const done = !!checked;
  return { ...subtask, done, checked: done };
}

/**
 * Persists subtask update to storage
 * @async
 * @param {Object} updatedTask - The updated task
 * @param {number} index - The task index
 */
async function persistSubtaskUpdate(updatedTask, index) {
  try {
    await saveTask(updatedTask);
    tasks[index] = updatedTask;
    renderBoard();
  } catch (error) {
    console.error("onSubtaskToggle: error saving subtask state", error);
  }
}

/**
 * Handles subtask toggle event
 * @async
 * @param {string} taskId - The task ID
 * @param {number} index - The subtask index
 * @param {boolean} checked - The new checked state
 */
async function onSubtaskToggle(taskId, index, checked) {
  const taskIndex = findTaskIndexById(taskId);
  if (taskIndex === -1) return;

  const task = tasks[taskIndex];
  const subtasks = getClonedSubtasks(task);
  if (!subtasks[index]) return;

  subtasks[index] = createUpdatedSubtask(subtasks[index], checked);
  const updatedTask = { ...task, subtasks };

  await persistSubtaskUpdate(updatedTask, taskIndex);
}
