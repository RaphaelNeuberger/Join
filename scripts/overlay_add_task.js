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

function closeAddTaskOverlay() {
  const overlay = document.querySelector("overlay-modal");
  if (!overlay) return;

  overlay.style.display = "none";
  document.body.style.overflow = "";
}

function addTaskBtn(status) {
  openAddTaskOverlay(status || "todo");
}

function closeAddTaskBtn() {
  closeAddTaskOverlay();
}

document.addEventListener("DOMContentLoaded", initAddTaskOverlay);
