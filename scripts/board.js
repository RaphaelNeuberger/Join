/**
 * @fileoverview Board page functionality for task management
 * @module board
 */

/** @constant {Array<string>} */
const BOARD_STATUS_ORDER = ["todo", "inprogress", "await_feedback", "done"];

/** @constant {Object<string, string>} */
const STATUS_LABELS = {
  todo: "To do",
  inprogress: "In progress",
  await_feedback: "Review",
  done: "Done",
};

/** @constant {Object<string, string>} */
const BOARD_STATUS_LABELS = STATUS_LABELS;

/** @type {string|null} */
let currentMoveTaskId = null;

/** @type {HTMLElement|null} */
let moveMenuElement = null;

/**
 * Loads all required scripts and initializes the board
 * @async
 */
async function loadScripts() {
  initLayout();
  await initBoard();
  initTaskCardEvents();
  initBoardSearch();
  initDragAndDrop();
}

/**
 * Initializes the page layout components
 */
function initLayout() {
  includeHeaderHTML();
  includeSidebarHTML();
  initPriorityButtons();
  initAddTaskForm();
}

/**
 * Initializes the board with tasks from Firebase
 * @async
 */
async function initBoard() {
  await seedTasksIfEmpty();
  await fetchTasks();
  renderBoard();
}

/**
 * Initializes the board search functionality
 */
function initBoardSearch() {
  const input = document.getElementById("boardSearch");
  if (!input) return;

  let timeoutId;
  input.addEventListener("input", function () {
    clearTimeout(timeoutId);
    const query = this.value.trim().toLowerCase();
    timeoutId = setTimeout(() => {
      renderBoardFiltered(query);
    }, 150);
  });
}

/**
 * Renders all board columns
 */
function renderBoard() {
  renderColumn("todo", "to-do-tasks");
  renderColumn("inprogress", "in-progress-tasks");
  renderColumn("await_feedback", "await-feedback-tasks");
  renderColumn("done", "done-tasks");
  renderNoTasksIfEmpty();
}

/**
 * Checks if a task matches the search query
 * @param {Object} task - The task to check
 * @param {string} query - The search query
 * @returns {boolean} True if the task matches
 */
function matchesQuery(task, query) {
  const title = String(task.title || "").toLowerCase();
  const description = String(task.description || "").toLowerCase();
  return title.includes(query) || description.includes(query);
}

/**
 * Filters tasks by status and search query
 * @param {string} status - The status to filter by
 * @param {string} query - The search query
 * @returns {Array<Object>} Filtered tasks
 */
function filterTasksByStatusAndQuery(status, query) {
  const list = getTasksByStatus(status);
  return list.filter((task) => matchesQuery(task, query));
}

/**
 * Renders a filtered status column
 * @param {string} status - The status to filter by
 * @param {string} containerId - The container element ID
 * @param {string} query - The search query
 */
function renderFilteredStatusColumn(status, containerId, query) {
  const tasksForStatus = filterTasksByStatusAndQuery(status, query);
  renderColumnWithTasks(tasksForStatus, containerId, true);
}

/**
 * Renders the board with filtered results
 * @param {string} query - The search query
 */
function renderBoardFiltered(query) {
  if (!query) {
    renderBoard();
    return;
  }

  renderFilteredStatusColumn("todo", "to-do-tasks", query);
  renderFilteredStatusColumn("inprogress", "in-progress-tasks", query);
  renderFilteredStatusColumn("await_feedback", "await-feedback-tasks", query);
  renderFilteredStatusColumn("done", "done-tasks", query);
  renderNoTasksIfEmpty();
}

/**
 * Gets tasks filtered by status
 * @param {string} status - The status to filter by
 * @returns {Array<Object>} Tasks with the given status
 */
function getTasksByStatus(status) {
  if (!Array.isArray(tasks) || tasks.length === 0) {
    return [];
  }
  return tasks.filter(
    (task) => normalizeTaskStatus(task.status) === status
  );
}

/**
 * Fills a container with task cards
 * @param {HTMLElement} container - The container element
 * @param {Array<Object>} tasksForStatus - Tasks to render
 */
function fillColumn(container, tasksForStatus) {
  if (!tasksForStatus.length) return;
  tasksForStatus.forEach((task) => {
    container.innerHTML += taskTemplate(task);
  });
}

/**
 * Renders a single column by status
 * @param {string} status - The status to render
 * @param {string} containerId - The container element ID
 */
function renderColumn(status, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = "";
  const tasksForStatus = getTasksByStatus(status);
  fillColumn(container, tasksForStatus);
}

/**
 * Renders a column with specific tasks
 * @param {Array<Object>} tasksForStatus - Tasks to render
 * @param {string} containerId - The container element ID
 * @param {boolean} isSearch - Whether this is a search result
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
 * Renders placeholder text for empty columns
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

/**
 * Initializes task card click events
 */
function initTaskCardEvents() {
  const columnsWrapper = document.querySelector(".tasks-columns");
  if (!columnsWrapper) return;

  columnsWrapper.addEventListener("click", onTaskCardClick);
  columnsWrapper.addEventListener("dragstart", (event) => {
    dragstartHandler(event);
  });
}

/**
 * Initializes drag and drop functionality
 */
function initDragAndDrop() {
  const columns = document.querySelectorAll(".task-column");

  columns.forEach((column) => {
    column.addEventListener("dragover", (event) => {
      dragoverHandler(event);
    });
    column.addEventListener("dragleave", (event) => {
      dragleaveHandler(event);
    });
    column.addEventListener("drop", (event) => {
      dropHandler(event);
    });
  });
}

/**
 * Handles drag start event
 * @param {DragEvent} event - The drag event
 */
function dragstartHandler(event) {
  const taskElement = event.target.closest(".card-task");
  if (!taskElement || !event.dataTransfer) return;

  const taskId = taskElement.dataset.taskId;
  if (!taskId) return;

  event.dataTransfer.setData("text/plain", taskId);
}

/**
 * Handles drag over event
 * @param {DragEvent} event - The drag event
 */
function dragoverHandler(event) {
  event.preventDefault();
  const column = event.currentTarget;
  if (column && column.classList) column.classList.add("drag-over");
}

/**
 * Handles drag leave event
 * @param {DragEvent} event - The drag event
 */
function dragleaveHandler(event) {
  const column = event.currentTarget;
  if (column && column.classList) column.classList.remove("drag-over");
}

/**
 * Handles drop event
 * @async
 * @param {DragEvent} event - The drag event
 */
async function dropHandler(event) {
  event.preventDefault();
  const column = event.currentTarget;
  if (column && column.classList) column.classList.remove("drag-over");

  if (!event.dataTransfer) return;
  const taskId = event.dataTransfer.getData("text/plain");
  const rawStatus = column && column.dataset ? column.dataset.status : "";
  const newStatus = normalizeTaskStatus(rawStatus);
  if (!taskId || !newStatus) return;

  await updateTaskStatus(taskId, newStatus);
  renderBoard();
}

/**
 * Ensures the move menu element exists
 * @returns {HTMLElement} The move menu element
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

/**
 * Creates a move menu option button
 * @param {HTMLElement} container - The container element
 * @param {string} arrow - The arrow symbol
 * @param {string} label - The button label
 * @param {boolean} disabled - Whether the button is disabled
 * @param {Function} onClick - Click handler
 */
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
 * Checks if the same move menu is already open
 * @param {string} taskId - The task ID
 * @param {HTMLElement} menu - The menu element
 * @returns {boolean} True if the same menu is open
 */
function isSameMoveMenuOpen(taskId, menu) {
  const visible = menu.style.display === "block";
  const sameTask = String(currentMoveTaskId) === String(taskId);
  return visible && sameTask;
}

/**
 * Gets the move menu state for a task
 * @param {string} taskId - The task ID
 * @returns {Object|null} The move menu state or null
 */
function getMoveMenuState(taskId) {
  currentMoveTaskId = taskId;

  const index = tasks.findIndex((t) => String(t.id) === String(taskId));
  if (index === -1) return null;

  const task = tasks[index];
  const status = normalizeTaskStatus(task.status);
  const order = Array.isArray(BOARD_STATUS_ORDER) ? BOARD_STATUS_ORDER : [];
  const statusIndex = order.indexOf(status);
  if (statusIndex === -1) return null;

  const previousStatus = statusIndex > 0 ? order[statusIndex - 1] : null;
  const nextStatus =
    statusIndex < order.length - 1 ? order[statusIndex + 1] : null;

  const labels =
    typeof BOARD_STATUS_LABELS === "object" ? BOARD_STATUS_LABELS : {};

  return { previousStatus, nextStatus, labels };
}

/**
 * Gets the label for a move option
 * @param {Object} labels - Status labels
 * @param {string|null} status - Target status
 * @param {string} kind - Direction kind (prev/next)
 * @returns {string} The move label
 */
function getMoveLabel(labels, status, kind) {
  if (!status) {
    return kind === "prev" ? "No previous column" : "No next column";
  }
  const fallback = kind === "prev" ? "previous column" : "next column";
  return "Move to " + (labels[status] || fallback);
}

/**
 * Renders move menu options
 * @param {HTMLElement} container - The container element
 * @param {Object} state - The move menu state
 */
function renderMoveOptions(container, state) {
  const prevLabel = getMoveLabel(state.labels, state.previousStatus, "prev");
  const nextLabel = getMoveLabel(state.labels, state.nextStatus, "next");

  container.innerHTML = "";

  createMoveMenuOption(
    container,
    "←",
    prevLabel,
    !state.previousStatus,
    () => moveTaskToAdjacentColumn(currentMoveTaskId, "prev")
  );

  createMoveMenuOption(
    container,
    "→",
    nextLabel,
    !state.nextStatus,
    () => moveTaskToAdjacentColumn(currentMoveTaskId, "next")
  );
}

/**
 * Positions the move menu relative to an anchor element
 * @param {HTMLElement} menu - The menu element
 * @param {HTMLElement} anchorEl - The anchor element
 */
function positionMoveMenu(menu, anchorEl) {
  const rect = anchorEl.getBoundingClientRect();
  const top = rect.bottom + window.scrollY + 6;
  const left = rect.left + window.scrollX;

  menu.style.top = top + "px";
  menu.style.left = left + "px";
  menu.style.display = "block";
}

/**
 * Opens the move menu for a task
 * @param {string} taskId - The task ID
 * @param {HTMLElement} anchorEl - The anchor element
 */
function openMoveMenu(taskId, anchorEl) {
  if (window.innerWidth >= 1024) return;

  const menu = ensureMoveMenuElement();
  const optionsContainer = menu.querySelector(".card-move-menu__options");
  if (!optionsContainer) return;

  if (isSameMoveMenuOpen(taskId, menu)) {
    closeMoveMenu();
    return;
  }

  const state = getMoveMenuState(taskId);
  if (!state) return;

  renderMoveOptions(optionsContainer, state);
  positionMoveMenu(menu, anchorEl);
}

/**
 * Closes the move menu
 */
function closeMoveMenu() {
  if (!moveMenuElement) return;
  moveMenuElement.style.display = "none";
}

/**
 * Gets the adjacent status in a given direction
 * @param {Array<string>} order - Status order array
 * @param {string} status - Current status
 * @param {string} direction - Direction (prev/next)
 * @returns {string|null} Adjacent status or null
 */
function getAdjacentStatus(order, status, direction) {
  const index = order.indexOf(status);
  if (index === -1) return null;

  const offset = direction === "prev" ? -1 : 1;
  return order[index + offset] || null;
}

/**
 * Moves a task to a new status
 * @async
 * @param {string} taskId - The task ID
 * @param {string} targetStatus - The target status
 */
async function moveTaskToStatus(taskId, targetStatus) {
  try {
    await updateTaskStatus(taskId, targetStatus);
    closeMoveMenu();
    renderBoard();
  } catch (error) {
    console.error("moveTaskToAdjacentColumn: failed", error);
  }
}

/**
 * Moves a task to an adjacent column
 * @async
 * @param {string} taskId - The task ID
 * @param {string} direction - Direction (prev/next)
 */
async function moveTaskToAdjacentColumn(taskId, direction) {
  const index = tasks.findIndex((t) => String(t.id) === String(taskId));
  if (index === -1) return;

  const status = normalizeTaskStatus(tasks[index].status);
  const order = Array.isArray(BOARD_STATUS_ORDER) ? BOARD_STATUS_ORDER : [];
  const targetStatus = getAdjacentStatus(order, status, direction);
  if (!targetStatus) return;

  await moveTaskToStatus(taskId, targetStatus);
}

document.addEventListener("click", (event) => {
  if (!moveMenuElement || moveMenuElement.style.display !== "block") return;

  const clickInsideMenu = moveMenuElement.contains(event.target);
  const clickOnMoveBtn = event.target.closest(".card-move-btn");

  if (!clickInsideMenu && !clickOnMoveBtn) {
    closeMoveMenu();
  }
});

window.addEventListener("scroll", closeMoveMenu);
window.addEventListener("resize", closeMoveMenu);

document.addEventListener("DOMContentLoaded", loadScripts);
