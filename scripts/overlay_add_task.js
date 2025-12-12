/**
 * @fileoverview Overlay functionality for adding tasks from the board
 * @module overlay_add_task
 */

/**
 * Initializes the add task overlay with event listeners
 */
function initAddTaskOverlay() {
  const overlay = document.querySelector("overlay-modal");
  const form = document.getElementById("taskForm");

  if (!overlay || !form) return;

  const triggers = document.querySelectorAll(".js-add-task-trigger");
  triggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const status = trigger.dataset.status || "todo";
      openAddTaskOverlay(status);
    });
  });

  const closeBtn = overlay.querySelector("[data-overlay-close]");
  if (closeBtn) {
    closeBtn.addEventListener("click", closeAddTaskOverlay);
  }

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) {
      closeAddTaskOverlay();
    }
  });
}

/**
 * Opens the add task overlay with a specific status
 * @param {string} status - The initial task status (todo, in-progress, etc.)
 */
function openAddTaskOverlay(status) {
  const overlay = document.querySelector("overlay-modal");
  const form = document.getElementById("taskForm");
  if (!overlay || !form) return;

  if (typeof resetTaskForm === "function") {
    resetTaskForm();
  } else {
    form.reset();
  }

  const statusInput = form.querySelector('input[name="status"]');
  if (statusInput) {
    statusInput.value = status;
  }

  overlay.style.display = "flex";
  document.body.style.overflow = "hidden";
}

/**
 * Closes the add task overlay
 */
function closeAddTaskOverlay() {
  const overlay = document.querySelector("overlay-modal");
  if (!overlay) return;

  overlay.style.display = "none";
  document.body.style.overflow = "";
}

/**
 * Button handler to open add task overlay
 * @param {string} [status='todo'] - The task status
 */
function addTaskBtn(status) {
  openAddTaskOverlay(status || "todo");
}

/**
 * Button handler to close add task overlay
 */
function closeAddTaskBtn() {
  closeAddTaskOverlay();
}

document.addEventListener("DOMContentLoaded", initAddTaskOverlay);
