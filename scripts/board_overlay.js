// scripts/board_overlay.js

/**
 * Click-Handling on cards:
 * - Click on .card-move-btn -> open Move menu (Up/Down)
 * - Click on .card-task (otherwise) -> open Detail Overlay
 */
function onTaskCardClick(event) {
  const moveBtn = event.target.closest(".card-move-btn");
  if (moveBtn) {
    // Prevent the click from bubbling to the document-level handler
    // which may immediately close the menu. Also prevent default
    // to avoid any native button behavior.
    try {
      event.stopPropagation();
      event.preventDefault();
    } catch (e) {
      // ignore if event is not cancelable
    }
    const card = moveBtn.closest(".card-task");
    if (!card) return;
    const taskId = card.dataset.taskId;
    if (!taskId) return;
    openMoveMenu(taskId, moveBtn);
    return;
  }

  const card = event.target.closest(".card-task");
  if (!card) return;

  const taskId = card.dataset.taskId;
  if (!taskId) return;

  openTaskCard(taskId);
}

/* ============================================================
 *  Overlay: Task-Detail (View / Edit)
 * ============================================================ */

function getOverlayElements() {
  const overlay = document.querySelector(".overlay-task-card");
  const content = document.getElementById("taskCardContent");
  return { overlay, content };
}

/**
 * Open Task-Detail Overlay (View Mode).
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
 * Close Task-Detail Overlay.
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

/**
 * Background click closes the overlay.
 */
document.addEventListener("click", function (event) {
  const { overlay } = getOverlayElements();
  if (!overlay) return;

  if (event.target === overlay) {
    closeTaskCard();
  }
});

/**
 * ESC closes the overlay + Move menu.
 */
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    closeTaskCard();
    closeMoveMenu();
  }
});

/**
 * Edit button in overlay (View Mode).
 */
function onTaskEditClick(taskId) {
  const { overlay, content } = getOverlayElements();
  if (!overlay || !content) return;

  const task = tasks.find((t) => String(t.id) === String(taskId));
  if (!task) return;

  content.innerHTML = taskCardEditTemplate(task);
}

/**
 * Cancel in Edit Mode -> back to View Mode.
 */
function onTaskEditCancel(taskId) {
  openTaskCard(taskId);
}

/**
 * Save in Edit Mode.
 */
async function onTaskEditSave(event, taskId) {
  event.preventDefault();
  const form = event.target;
  if (!form) return;

  const formData = new FormData(form);
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const dueDate = String(formData.get("dueDate") || "").trim();
  const priorityRaw = String(formData.get("priority") || "Medium").trim();

  if (!title) {
    alert("Title is required.");
    return;
  }

  const index = tasks.findIndex((t) => String(t.id) === String(taskId));
  if (index === -1) return;

  const oldTask = tasks[index];

  const updatedTask = {
    ...oldTask,
    title,
    description,
    dueDate,
    priority: normalizePriority(priorityRaw),
  };

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
 * Priority buttons in Edit Overlay.
 */
function onEditPriorityClick(event) {
  const button = event.currentTarget;
  const wrapper = button.closest(".priority-buttons");
  if (!wrapper) return;

  const buttons = wrapper.querySelectorAll(".priority-buttons__button");
  buttons.forEach((btn) => btn.classList.remove("is-active"));

  button.classList.add("is-active");

  const hidden = wrapper.querySelector('input[name="priority"]');
  if (hidden) {
    hidden.value = button.dataset.priority || "Medium";
  }
}

/**
 * Delete button in View Overlay.
 */
async function onOverlayDeleteClick(taskId) {
  const confirmDelete = window.confirm(
    "Do you really want to delete this task?"
  );
  if (!confirmDelete) return;

  try {
    await deleteTaskById(taskId);

    // locally remove from tasks
    tasks = tasks.filter(
      (t) =>
        String(t.id) !== String(taskId) &&
        String(t.firebaseId) !== String(taskId)
    );

    closeTaskCard();
    renderBoard();
  } catch (error) {
    console.error("onOverlayDeleteClick: error deleting task", error);
    alert("Error while deleting the task.");
  }
}

/**
 * Checkbox change for subtasks in overlay.
 */
async function onSubtaskToggle(taskId, index, checked) {
  const taskIndex = tasks.findIndex((t) => String(t.id) === String(taskId));
  if (taskIndex === -1) return;

  const task = tasks[taskIndex];
  const subtasks = Array.isArray(task.subtasks) ? [...task.subtasks] : [];

  if (!subtasks[index]) return;

  const updatedSubtask = {
    ...subtasks[index],
    done: !!checked,
    checked: !!checked,
  };
  subtasks[index] = updatedSubtask;

  const updatedTask = {
    ...task,
    subtasks,
  };

  try {
    await saveTask(updatedTask);
    tasks[taskIndex] = updatedTask;
    renderBoard();
  } catch (error) {
    console.error("onSubtaskToggle: error saving subtask state", error);
  }
}

/* ============================================================
 *  Move menu (Up / Down within column)
 * ============================================================ */

// IMPORTANT: currentMoveTaskId is already defined as global variable in board.js.
// Do NOT define it again here with let/const, just use it.

/**
 * Global element for the Move menu.
 */
let moveMenuElement = null;

/**
 * Ensure that the global Move menu element exists.
 */
function ensureMoveMenuElement() {
  if (moveMenuElement) return moveMenuElement;

  const el = document.createElement("div");
  el.className = "card-move-menu";
  el.innerHTML = `
    <div class="card-move-menu__inner">
      <p class="card-move-menu__title">Move task:</p>
      <div class="card-move-menu__options"></div>
    </div>
  `;
  document.body.appendChild(el);
  moveMenuElement = el;

  return moveMenuElement;
}

function createMoveMenuOption(container, arrow, label, disabled, onClick) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "card-move-menu__option";
  button.disabled = disabled;
  button.innerHTML =
    '<span class="card-move-menu__arrow">' +
    arrow +
    "</span>" +
    "<span>" +
    label +
    "</span>";
  if (!disabled) {
    button.addEventListener("click", onClick);
  }
  container.appendChild(button);
}

/**
 * Open Move menu.
 * @param {string} taskId
 * @param {HTMLElement} anchorEl - the icon element (button) on the card
 */
function openMoveMenu(taskId, anchorEl) {
  if (window.innerWidth >= 1024) return;

  currentMoveTaskId = taskId;

  const menu = ensureMoveMenuElement();
  const optionsContainer = menu.querySelector(".card-move-menu__options");
  if (!optionsContainer) return;

  const globalIndex = tasks.findIndex((t) => String(t.id) === String(taskId));
  if (globalIndex === -1) return;

  const task = tasks[globalIndex];
  const status = normalizeTaskStatus(task.status);
  const order = Array.isArray(BOARD_STATUS_ORDER) ? BOARD_STATUS_ORDER : [];
  const labels =
    typeof BOARD_STATUS_LABELS === "object" ? BOARD_STATUS_LABELS : {};
  const statusIndex = order.indexOf(status);
  if (statusIndex === -1) return;

  const previousStatus = statusIndex > 0 ? order[statusIndex - 1] : null;
  const nextStatus =
    statusIndex < order.length - 1 ? order[statusIndex + 1] : null;

  optionsContainer.innerHTML = "";

  const prevLabel = previousStatus
    ? "Move to " + (labels[previousStatus] || "previous column")
    : "No previous column";
  const nextLabel = nextStatus
    ? "Move to " + (labels[nextStatus] || "next column")
    : "No next column";

  createMoveMenuOption(
    optionsContainer,
    "←",
    prevLabel,
    !previousStatus,
    function () {
      moveTaskToAdjacentColumn(taskId, "prev");
    }
  );

  createMoveMenuOption(
    optionsContainer,
    "→",
    nextLabel,
    !nextStatus,
    function () {
      moveTaskToAdjacentColumn(taskId, "next");
    }
  );

  const rect = anchorEl.getBoundingClientRect();
  const top = rect.bottom + window.scrollY + 6;
  const left = rect.left + window.scrollX;

  menu.style.top = top + "px";
  menu.style.left = left + "px";
  menu.style.display = "block";
}

/**
 * Close Move menu.
 */
function closeMoveMenu() {
  if (!moveMenuElement) return;
  moveMenuElement.style.display = "none";
}

/**
 * Move task one column left or right using the global status order.
 */
async function moveTaskToAdjacentColumn(taskId, direction) {
  const index = tasks.findIndex((t) => String(t.id) === String(taskId));
  if (index === -1) return;

  const order = Array.isArray(BOARD_STATUS_ORDER) ? BOARD_STATUS_ORDER : [];
  const status = normalizeTaskStatus(tasks[index].status);
  const currentPosition = order.indexOf(status);
  if (currentPosition === -1) return;

  const offset = direction === "prev" ? -1 : 1;
  const targetStatus = order[currentPosition + offset];
  if (!targetStatus) return;

  try {
    await updateTaskStatus(taskId, targetStatus);
    closeMoveMenu();
    renderBoard();
  } catch (error) {
    console.error("moveTaskToAdjacentColumn: failed", error);
  }
}

/**
 * Click anywhere in document closes the Move menu,
 * unless clicking on Move button or the menu itself.
 */
document.addEventListener("click", function (event) {
  if (!moveMenuElement || moveMenuElement.style.display !== "block") return;

  const clickInsideMenu = moveMenuElement.contains(event.target);
  const clickOnMoveBtn = event.target.closest(".card-move-btn");

  if (!clickInsideMenu && !clickOnMoveBtn) {
    closeMoveMenu();
  }
});

/**
 * On scroll/resize close Move menu (so it doesn't "hang in the air").
 */
window.addEventListener("scroll", closeMoveMenu);
window.addEventListener("resize", closeMoveMenu);
