const BOARD_STATUS_ORDER = ["todo", "inprogress", "await_feedback", "done"];

const STATUS_LABELS = {
  todo: "To do",
  inprogress: "In progress",
  await_feedback: "Review",
  done: "Done",
};

const BOARD_STATUS_LABELS = STATUS_LABELS;
let currentMoveTaskId = null;

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
  const tasksForStatus = getTasksByStatus(status);
  return tasksForStatus.filter((task) => matchesQuery(task, query));
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
  return tasks.filter((task) => normalizeTaskStatus(task.status) === status);
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

document.addEventListener("DOMContentLoaded", loadScripts);
