/* scripts/board.js */

async function loadScripts() {
  initLayout();
  await initBoard();
}

function initLayout() {
  includeHeaderHTML();
  includeSidebarHTML();
  initPriorityButtons();
  initAddTaskForm();
  initSearch(); // <-- neu: Search initialisieren
}

async function initBoard() {
  await fetchTasks();
  renderBoard();
}

/* ---------- Render-Logik ---------- */

function renderBoard(searchQuery = '') {
  // searchQuery optional, leer = keine Filterung
  renderColumn('todo', 'to-do-tasks', searchQuery);
  renderColumn('inprogress', 'in-progress-tasks', searchQuery);
  renderColumn('await_feedback', 'await-feedback-tasks', searchQuery);
  renderColumn('done', 'done-tasks', searchQuery);
  renderNoTasksIfEmpty();
}

function renderColumn(status, containerId, searchQuery = '') {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = '';
  const tasksForStatus = getTasksByStatus(status);

  // Falls Suche aktiv: filtern
  const filtered = searchQuery ? filterTasks(tasksForStatus, searchQuery) : tasksForStatus;

  fillColumn(container, filtered);
}

/* ---------- Task-Helfer ---------- */

function getTasksByStatus(status) {
  if (!Array.isArray(tasks) || tasks.length === 0) {
    return [];
  }

  return tasks.filter((task) => normalizeTaskStatus(task.status) === status);
}

function fillColumn(container, tasksForStatus) {
  if (!tasksForStatus || tasksForStatus.length === 0) {
    return;
  }

  tasksForStatus.forEach((task) => {
    container.innerHTML += taskTemplate(task);
  });
}

function renderNoTasksIfEmpty() {
  const taskBoards = document.querySelectorAll('.task-cards');

  taskBoards.forEach((board) => {
    const hasTask = board.querySelector('.card-task');
    const placeholder = board.querySelector('.card-no-task');

    if (hasTask && placeholder) {
      placeholder.remove();
    }

    if (!hasTask && !placeholder) {
      board.innerHTML = noTaskTemplate();
    }
  });
}

/* ---------- Drag & Drop (unverändert) ---------- */

function dragstartHandler(event) {
  const taskElement = event.target;
  const taskId = taskElement.dataset.taskId;

  if (!event.dataTransfer || !taskId) {
    return;
  }

  event.dataTransfer.setData('text/plain', taskId);
}

function dragoverHandler(event) {
  event.preventDefault();
}

async function dropHandler(event) {
  event.preventDefault();

  if (!event.dataTransfer) {
    return;
  }

  const taskId = event.dataTransfer.getData('text/plain');
  const column = event.currentTarget;
  const rawStatus = column && column.dataset ? column.dataset.status : '';
  const newStatus = normalizeTaskStatus(rawStatus);

  if (!taskId || !newStatus) {
    return;
  }

  await updateTaskStatus(taskId, newStatus);
  renderBoard(getCurrentSearchQuery());
}

/* ---------- Suche ---------- */

function filterTasks(taskArray, query) {
  if (!query) return taskArray;
  const q = query.trim().toLowerCase();

  return taskArray.filter((t) => {
    const title = (t.title || '').toString().toLowerCase();
    const description = (t.description || '').toString().toLowerCase();
    // mögliche Erweiterung: category, assignedTo, subtasks, etc.
    return title.includes(q) || description.includes(q);
  });
}

function initSearch() {
  const input = document.getElementById('taskSearch');
  if (!input) return;

  const debouncedHandler = debounce(() => {
    const q = input.value;
    renderBoard(q);
  }, 200);

  input.addEventListener('input', debouncedHandler);

  // Optional: Enter drücken -> Fokus weg (kein Reload)
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      input.blur();
    }
  });
}

function getCurrentSearchQuery() {
  const input = document.getElementById('taskSearch');
  return input ? input.value : '';
}

/* Kleine, einfache Debounce-Implementierung */
function debounce(fn, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), wait);
  };
}
