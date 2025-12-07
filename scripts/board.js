// scripts/board.js

const BOARD_STATUS_ORDER = ["todo", "inprogress", "await_feedback", "done"];
const STATUS_LABELS = {
  todo: "To do",
  inprogress: "In progress",
  await_feedback: "Review", // in Move menu as "Review"
  done: "Done",
};

const BOARD_STATUS_LABELS = STATUS_LABELS;
let currentMoveTaskId = null;

/**
 * Entry point: Initialize layout and board.
 */
async function loadScripts() {
  initLayout();
  await initBoard();
  initTaskCardEvents();
  initBoardSearch();
  initDragAndDrop();
}

/**
 * Initialize Header/Sidebar and form UI.
 */
function initLayout() {
  includeHeaderHTML();
  includeSidebarHTML();
  initPriorityButtons();
  initAddTaskForm();
}

/**
 * Search at top of board (Debounce).
 */
function initBoardSearch() {
  const input = document.getElementById("boardSearch");
  if (!input) return;

  let t;
  input.addEventListener("input", function () {
    clearTimeout(t);
    const q = this.value.trim().toLowerCase();
    t = setTimeout(function () {
      renderBoardFiltered(q);
    }, 150);
  });
}

/**
 * Load tasks and render board.
 */
async function initBoard() {
  await seedTasksIfEmpty();
  await fetchTasks();
  renderBoard();
}

/**
 * Render entire board (all columns).
 */
function renderBoard() {
  renderColumn("todo", "to-do-tasks");
  renderColumn("inprogress", "in-progress-tasks");
  renderColumn("await_feedback", "await-feedback-tasks");
  renderColumn("done", "done-tasks");
  renderNoTasksIfEmpty();
}

/**
 * Render board filtered by search string.
 */
function renderBoardFiltered(query) {
  if (!query) {
    renderBoard();
    return;
  }

  const match = function (t) {
    const a = String(t.title || "").toLowerCase();
    const b = String(t.description || "").toLowerCase();
    return a.includes(query) || b.includes(query);
  };

  const by = function (s) {
    return getTasksByStatus(s).filter(match);
  };

  renderColumnWithTasks(by("todo"), "to-do-tasks", true);
  renderColumnWithTasks(by("inprogress"), "in-progress-tasks", true);
  renderColumnWithTasks(by("await_feedback"), "await-feedback-tasks", true);
  renderColumnWithTasks(by("done"), "done-tasks", true);
  renderNoTasksIfEmpty();
}

/**
 * Filter tasks by status.
 */
function getTasksByStatus(status) {
  if (!Array.isArray(tasks) || tasks.length === 0) {
    return [];
  }
  return tasks.filter((task) => normalizeTaskStatus(task.status) === status);
}

/**
 * Insert cards into column.
 */
function fillColumn(container, tasksForStatus) {
  if (!tasksForStatus.length) return;

  tasksForStatus.forEach((task) => {
    container.innerHTML += taskTemplate(task);
  });
}

/**
 * Render column by default (incl. placeholder).
 */
function renderColumn(status, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = "";
  const tasksForStatus = getTasksByStatus(status);
  fillColumn(container, tasksForStatus);
}

/**
 * Render column with already filtered tasks.
 */
function renderColumnWithTasks(tasksForStatus, containerId, isSearch) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = "";
  if (!tasksForStatus || !tasksForStatus.length) {
    container.innerHTML = isSearch ? noResultsTemplate() : noTaskTemplate();
    return;
  }
  fillColumn(container, tasksForStatus);
}

/**
 * If no tasks in a column → insert placeholder.
 */
function renderNoTasksIfEmpty() {
  const taskBoards = document.querySelectorAll(".task-cards");

  taskBoards.forEach((board) => {
    const hasTask = board.querySelector(".card-task");
    const placeholder = board.querySelector(".card-no-task");

    if (hasTask && placeholder) {
      placeholder.remove();
    }

    if (!hasTask && !placeholder) {
      board.innerHTML = noTaskTemplate();
    }
  });
}

/* ===================== Drag & Drop ===================== */

/**
 * Click/Drag Events for cards (Delegation).
 */
function initTaskCardEvents() {
  const columnsWrapper = document.querySelector(".tasks-columns");
  if (!columnsWrapper) return;

  // Click: either "Move" button or open card
  columnsWrapper.addEventListener("click", onTaskCardClick);

  // Dragstart → Task-ID setzen
  columnsWrapper.addEventListener("dragstart", function (event) {
    dragstartHandler(event);
  });
}

/**
 * Register drop/dragover/dragleave on columns.
 */
function initDragAndDrop() {
  const columns = document.querySelectorAll(".task-column");
  columns.forEach((col) => {
    col.addEventListener("dragover", function (event) {
      dragoverHandler(event);
    });
    col.addEventListener("dragleave", function (event) {
      dragleaveHandler(event);
    });
    col.addEventListener("drop", function (event) {
      dropHandler(event);
    });
  });
}

/**
 * Dragstart: ID setzen.
 */
function dragstartHandler(event) {
  const taskElement = event.target.closest(".card-task");
  if (!taskElement || !event.dataTransfer) return;

  const taskId = taskElement.dataset.taskId;
  if (!taskId) return;

  event.dataTransfer.setData("text/plain", taskId);
}

/**
 * Dragover: Prevent default + set drag-over style.
 */
function dragoverHandler(event) {
  event.preventDefault();
  const col = event.currentTarget;
  if (col && col.classList) col.classList.add("drag-over");
}

/**
 * Dragleave: Drag-Over-Style entfernen.
 */
function dragleaveHandler(event) {
  const col = event.currentTarget;
  if (col && col.classList) col.classList.remove("drag-over");
}

/**
 * Drop: Update status and re-render board.
 */
async function dropHandler(event) {
  event.preventDefault();
  const col = event.currentTarget;
  if (col && col.classList) col.classList.remove("drag-over");

  if (!event.dataTransfer) return;
  const taskId = event.dataTransfer.getData("text/plain");
  const rawStatus = col && col.dataset ? col.dataset.status : "";
  const newStatus = normalizeTaskStatus(rawStatus);
  if (!taskId || !newStatus) return;

  await updateTaskStatus(taskId, newStatus);
  renderBoard();
}

// Overlay and mobile move menu functions moved to board_overlay.js

/* ===================== Startpunkt ===================== */

document.addEventListener("DOMContentLoaded", loadScripts);
