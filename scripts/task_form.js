function addTaskBtn() {
  const overlay = document.querySelector(".overlay-modal");
  if (!overlay) return;
  overlay.style.display = "flex";
}

function closeAddTaskBtn() {
  const overlay = document.querySelector(".overlay-modal");
  if (!overlay) return;
  overlay.style.display = "none";
}

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

async function handleCreateTask(event) {
  if (event) event.preventDefault();
  const taskData = readTaskForm();
  if (!taskData) return;
  await submitTask(taskData);
}

async function submitTask(data) {
  try {
    await addTask(data);
    afterTaskSaved();
  } catch (error) {
    handleCreateTaskError(error);
  }
}

function afterTaskSaved() {
  renderBoard();
  showSuccessMessage();
  resetTaskForm();
  closeAddTaskBtn();
  setTimeout(() => {
    window.location.href = "board.html";
  }, 1000);
}

function handleCreateTaskError(error) {
  console.error("handleCreateTask:", error);
  alert("Task could not be created (see console).");
}

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

function handleClearTaskForm(event) {
  if (event) event.preventDefault();
  resetTaskForm();
}

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

function removeMinDate() {
  const dueDate = document.getElementById("dueDate");
  if (!dueDate) return;
  dueDate.removeAttribute("min");
}

function getNotificationContainer() {
  return document.getElementById("notificationContainer");
}

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
