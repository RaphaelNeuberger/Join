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
  setMinDate();
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
    // Redirect to board.html after successful task creation
    setTimeout(() => {
      window.location.href = "board.html";
    }, 1000);
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
  if (window.createNotification && typeof window.createNotification === "function") {
    window.createNotification({ type: "success", text: "Task created successfully!", duration: 1800 });
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
 * Set minimum date to today to prevent past date selection.
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
 * Remove minimum date restriction (for editing existing tasks).
 */
function removeMinDate() {
  const dueDate = document.getElementById("dueDate");
  if (!dueDate) return;
  dueDate.removeAttribute("min");
}

// scripts/notifications.js
(function () {
  const container = document.getElementById("notificationContainer");

  function createNotification({ type = "success", text = "Task created successfully!", duration = 1800 } = {}) {
    if (!container) return;
    const notif = document.createElement("div");
    notif.className = `notification notification--${type}`;
    notif.setAttribute("role", "status");
    notif.setAttribute("aria-live", "polite");

    notif.innerHTML = `
      <span class="notif-icon" aria-hidden="true">
        <!-- simple check icon -->
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.12"/>
          <path d="M7 12.5L10 15.5L17 8.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </span>
      <div class="notif-message">${escapeHtml(text)}</div>
      <button class="notif-close" aria-label="Close notification">&times;</button>
    `;

    // close handler
    const closeBtn = notif.querySelector(".notif-close");
    closeBtn.addEventListener("click", () => removeNotification(notif));

    container.appendChild(notif);
    // trigger show animation
    // small timeout to ensure transition works
    requestAnimationFrame(() => {
      notif.classList.add("show");
    });

    // auto remove
    const timeout = setTimeout(() => removeNotification(notif), duration);

    // remove function
    function removeNotification(el) {
      clearTimeout(timeout);
      el.classList.remove("show");
      // wait for transition to finish then remove
      setTimeout(() => {
        if (el && el.parentNode) el.parentNode.removeChild(el);
      }, 250);
    }

    return notif;
  }

  // small helper (same as in your add_task js)
  function escapeHtml(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  // expose globally
  window.createNotification = createNotification;
})();
