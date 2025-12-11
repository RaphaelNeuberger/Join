const BOARD_STATUS_ORDER = ["todo", "inprogress", "await_feedback", "done"];

const STATUS_LABELS = {
  todo: "To do",
  inprogress: "In progress",
  await_feedback: "Review",
  done: "Done",
};

const BOARD_STATUS_LABELS = STATUS_LABELS;
let currentMoveTaskId = null;
let moveMenuElement = null;

async function loadScripts() {
  initLayout();
  await initBoard();
  initTaskCardEvents();
  initBoardSearch();
  initDragAndDrop();
}

function initLayout() {
  includeHeaderHTML();
  includeSidebarHTML();
  initPriorityButtons();
  initAddTaskForm();
}

async function initBoard() {
  await seedTasksIfEmpty();
  await fetchTasks();
  renderBoard();
}

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

function renderBoard() {
  renderColumn("todo", "to-do-tasks");
  renderColumn("inprogress", "in-progress-tasks");
  renderColumn("await_feedback", "await-feedback-tasks");
  renderColumn("done", "done-tasks");
  renderNoTasksIfEmpty();
}

function matchesQuery(task, query) {
  const title = String(task.title || "").toLowerCase();
  const description = String(task.description || "").toLowerCase();
  return title.includes(query) || description.includes(query);
}

function filterTasksByStatusAndQuery(status, query) {
  const list = getTasksByStatus(status);
  return list.filter((task) => matchesQuery(task, query));
}

function renderFilteredStatusColumn(status, containerId, query) {
  const tasksForStatus = filterTasksByStatusAndQuery(status, query);
  renderColumnWithTasks(tasksForStatus, containerId, true);
}

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

function getTasksByStatus(status) {
  if (!Array.isArray(tasks) || tasks.length === 0) {
    return [];
  }
  return tasks.filter(
    (task) => normalizeTaskStatus(task.status) === status
  );
}

function fillColumn(container, tasksForStatus) {
  if (!tasksForStatus.length) return;
  tasksForStatus.forEach((task) => {
    container.innerHTML += taskTemplate(task);
  });
}

function renderColumn(status, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = "";
  const tasksForStatus = getTasksByStatus(status);
  fillColumn(container, tasksForStatus);
}

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

function initTaskCardEvents() {
  const columnsWrapper = document.querySelector(".tasks-columns");
  if (!columnsWrapper) return;

  columnsWrapper.addEventListener("click", onTaskCardClick);
  columnsWrapper.addEventListener("dragstart", (event) => {
    dragstartHandler(event);
  });
}

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

function dragstartHandler(event) {
  const taskElement = event.target.closest(".card-task");
  if (!taskElement || !event.dataTransfer) return;

  const taskId = taskElement.dataset.taskId;
  if (!taskId) return;

  event.dataTransfer.setData("text/plain", taskId);
}

function dragoverHandler(event) {
  event.preventDefault();
  const column = event.currentTarget;
  if (column && column.classList) column.classList.add("drag-over");
}

function dragleaveHandler(event) {
  const column = event.currentTarget;
  if (column && column.classList) column.classList.remove("drag-over");
}

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

function isSameMoveMenuOpen(taskId, menu) {
  const visible = menu.style.display === "block";
  const sameTask = String(currentMoveTaskId) === String(taskId);
  return visible && sameTask;
}

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

function getMoveLabel(labels, status, kind) {
  if (!status) {
    return kind === "prev" ? "No previous column" : "No next column";
  }
  const fallback = kind === "prev" ? "previous column" : "next column";
  return "Move to " + (labels[status] || fallback);
}

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

function positionMoveMenu(menu, anchorEl) {
  const rect = anchorEl.getBoundingClientRect();
  const top = rect.bottom + window.scrollY + 6;
  const left = rect.left + window.scrollX;

  menu.style.top = top + "px";
  menu.style.left = left + "px";
  menu.style.display = "block";
}

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

function closeMoveMenu() {
  if (!moveMenuElement) return;
  moveMenuElement.style.display = "none";
}

function getAdjacentStatus(order, status, direction) {
  const index = order.indexOf(status);
  if (index === -1) return null;

  const offset = direction === "prev" ? -1 : 1;
  return order[index + offset] || null;
}

async function moveTaskToStatus(taskId, targetStatus) {
  try {
    await updateTaskStatus(taskId, targetStatus);
    closeMoveMenu();
    renderBoard();
  } catch (error) {
    console.error("moveTaskToAdjacentColumn: failed", error);
  }
}

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
