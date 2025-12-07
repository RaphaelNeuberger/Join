// scripts/overlay_add_task.js

/**
 * Initialize the Add-Task Overlay:
 * - register all "Add Task" triggers (Header, Mobile, Column-Plus)
 * - Close button in overlay
 * - Click on background closes the overlay
 */
function initAddTaskOverlay() {
  const overlay = document.querySelector("overlay-modal");
  const form = document.getElementById("taskForm");

  if (!overlay || !form) return;

  // All trigger elements: Header-Button, Mobile-Button, Column-Plus
  const triggers = document.querySelectorAll(".js-add-task-trigger");
  triggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const status = trigger.dataset.status || "todo";
      openAddTaskOverlay(status);
    });
  });

  // Close button (X) in overlay header (data-overlay-close)
  const closeBtn = overlay.querySelector("[data-overlay-close]");
  if (closeBtn) {
    closeBtn.addEventListener("click", closeAddTaskOverlay);
  }

  // Click on darkened background closes the overlay
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) {
      closeAddTaskOverlay();
    }
  });
}

/**
 * Öffnet das Add-Task-Overlay und setzt den Status für den neuen Task.
 * @param {string} status - 'todo' | 'inprogress' | 'await_feedback' | 'done'
 */
function openAddTaskOverlay(status) {
  const overlay = document.querySelector("overlay-modal");
  const form = document.getElementById("taskForm");
  if (!overlay || !form) return;

  // Reset form (custom reset function, if available)
  if (typeof resetTaskForm === "function") {
    resetTaskForm();
  } else {
    form.reset();
  }

  // Write status to hidden field
  const statusInput = form.querySelector('input[name="status"]');
  if (statusInput) {
    statusInput.value = status;
  }

  overlay.style.display = "flex";
  document.body.style.overflow = "hidden";
}

/**
 * Closes the Add-Task Overlay.
 */
function closeAddTaskOverlay() {
  const overlay = document.querySelector("overlay-modal");
  if (!overlay) return;

  overlay.style.display = "none";
  document.body.style.overflow = "";
}

/**
 * Legacy-API:
 * Falls irgendwo noch addTaskBtn()/closeAddTaskBtn() benutzt wird,
 * leiten wir auf die neuen Funktionen um.
 */
function addTaskBtn(status) {
  openAddTaskOverlay(status || "todo");
}

function closeAddTaskBtn() {
  closeAddTaskOverlay();
}

// Initialize on DOM load
document.addEventListener("DOMContentLoaded", initAddTaskOverlay);
