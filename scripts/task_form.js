/**
 * @fileoverview Task form handling and submission
 * @module task_form
 */

/**
 * Opens the add task overlay modal
 */
function addTaskBtn() {
  const overlay = document.querySelector(".overlay-modal");
  if (!overlay) return;
  overlay.style.display = "flex";
}

/**
 * Closes the add task overlay modal
 */
function closeAddTaskBtn() {
  const overlay = document.querySelector(".overlay-modal");
  if (!overlay) return;
  overlay.style.display = "none";
}

/**
 * Initializes the add task form with event handlers
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
  setMinDate();
}

/**
 * Handles the create task form submission
 * @async
 * @param {Event} [event] - The submit event
 */
async function handleCreateTask(event) {
  if (event) event.preventDefault();
  const taskData = readTaskForm();
  if (!taskData) return;
  await submitTask(taskData);
}

/**
 * Submits task data to the API
 * @async
 * @param {Object} data - The task data to submit
 */
async function submitTask(data) {
  try {
    await addTask(data);
    afterTaskSaved();
  } catch (error) {
    handleCreateTaskError(error);
  }
}

/**
 * Checks if current page is the add task page
 * @returns {boolean} Whether on add_task.html
 */
function isOnAddTaskPage() {
  return window.location.pathname.includes("add_task.html");
}

/**
 * Handles post-save actions after task creation
 */
function afterTaskSaved() {
  showSuccessMessage();
  resetTaskForm();
  if (isOnAddTaskPage()) {
    setTimeout(() => { window.location.href = "board.html"; }, 1500);
  } else {
    if (typeof renderBoard === "function") renderBoard();
    setTimeout(() => closeAddTaskBtn(), 1500);
  }
}

/**
 * Handles task creation errors
 * @param {Error} error - The error that occurred
 */
function handleCreateTaskError(error) {
  console.error("handleCreateTask:", error);
  alert("Task could not be created (see console).");
}

/**
 * Reads and validates task form data
 * @returns {Object|null} Task data object or null if invalid
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
 * Builds the task data object from form values
 * @param {string} title - Task title
 * @param {string} description - Task description
 * @param {string} dueDate - Task due date
 * @param {string} category - Task category
 * @param {Array} assignedTo - Assigned users
 * @returns {Object} The task data object
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
 * Resets the task form to initial state
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
 * Handles clear button click to reset form
 * @param {Event} [event] - The click event
 */
function handleClearTaskForm(event) {
  if (event) event.preventDefault();
  resetTaskForm();
}

/**
 * Shows a success message after task creation
 */
function showSuccessMessage() {
  const canNotify =
    typeof window.createNotification === "function";

  if (canNotify) {
    window.createNotification({
      type: "success",
      text: "Task created successfully!",
      duration: 1800,
    });
    return;
  }

  const messageElement = document.getElementById("successMessage");
  if (!messageElement) return;

  messageElement.style.display = "flex";

  setTimeout(() => {
    messageElement.style.display = "none";
  }, 2000);
}

/**
 * Sets the minimum date for due date input to today
 */
function setMinDate() {
  const dueDate = document.getElementById("dueDate");
  if (!dueDate) return;

  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  const minDate = `${year}-${month}-${day}`;
  dueDate.min = minDate;
}

/**
 * Removes the minimum date restriction from due date input
 */
function removeMinDate() {
  const dueDate = document.getElementById("dueDate");
  if (!dueDate) return;
  dueDate.removeAttribute("min");
}

/**
 * Gets the notification container element
 * @returns {HTMLElement|null} The notification container
 */
function getNotificationContainer() {
  return document.getElementById("notificationContainer");
}

/**
 * Builds HTML template for notification
 * @param {string} type - Notification type
 * @param {string} text - Notification message
 * @returns {string} HTML template string
 */
function buildNotificationTemplate(type, text) {
  const safeText =
    typeof escapeHtml === "function"
      ? escapeHtml(text || "Task created successfully!")
      : String(text || "Task created successfully!");

  return `
    <span class="notif-icon" aria-hidden="true">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
           xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10"
                fill="currentColor" opacity="0.12"/>
        <path d="M7 12.5L10 15.5L17 8.5"
              stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </span>
    <div class="notif-message">${safeText}</div>
    <button class="notif-close" aria-label="Close notification">&times;</button>
  `;
}

/**
 * Removes a notification element with animation
 * @param {HTMLElement} element - The notification element to remove
 */
function removeNotification(element) {
  if (!element) return;

  element.classList.remove("show");
  element.addEventListener(
    "transitionend",
    () => {
      if (element && element.parentNode) {
        element.parentNode.removeChild(element);
      }
    },
    { once: true }
  );
}

/**
 * Creates a notification DOM element
 * @param {string} type - Notification type
 * @param {string} text - Notification message
 * @returns {HTMLElement} The notification element
 */
function createNotificationElement(type, text) {
  const notif = document.createElement("div");
  notif.className = `notification notification--${type}`;
  notif.setAttribute("role", "status");
  notif.setAttribute("aria-live", "polite");
  notif.innerHTML = buildNotificationTemplate(type, text);

  const closeBtn = notif.querySelector(".notif-close");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => removeNotification(notif));
  }

  return notif;
}

/**
 * Creates and displays a notification
 * @param {Object} [options={}] - Notification options
 * @param {string} [options.type='success'] - Notification type
 * @param {string} [options.text='Task created successfully!'] - Message text
 * @param {number} [options.duration=1800] - Display duration in ms
 */
function createNotification(options = {}) {
  const {
    type = "success",
    text = "Task created successfully!",
    duration = 1800,
  } = options;

  const container = getNotificationContainer();
  if (!container) return;

  const notif = createNotificationElement(type, text);
  container.appendChild(notif);

  requestAnimationFrame(() => {
    notif.classList.add("show");
  });

  setTimeout(() => {
    removeNotification(notif);
  }, duration);
}

if (typeof window !== "undefined") {
  window.createNotification = createNotification;
}
