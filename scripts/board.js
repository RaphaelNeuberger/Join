<<<<<<< HEAD
=======
/* scripts/board.js */

>>>>>>> a518af8a80a199005c74447fc0f51e73197f5f44
async function loadScripts() {
  initLayout();
  await initBoard();
  initTaskCardEvents();
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
<<<<<<< HEAD
function renderBoard() {
  renderColumn('todo', 'to-do-tasks');
  renderColumn('inprogress', 'in-progress-tasks');
  renderColumn('await_feedback', 'await-feedback-tasks');
  renderColumn('done', 'done-tasks');
  renderNoTasksIfEmpty();
}
=======

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

>>>>>>> a518af8a80a199005c74447fc0f51e73197f5f44
function getTasksByStatus(status) {
  if (!Array.isArray(tasks) || tasks.length === 0) {
    return [];
  }

  return tasks.filter((task) => normalizeTaskStatus(task.status) === status);
}
function fillColumn(container, tasksForStatus) {
<<<<<<< HEAD
  if (!tasksForStatus.length) return;
=======
  if (!tasksForStatus || tasksForStatus.length === 0) {
    return;
  }
>>>>>>> a518af8a80a199005c74447fc0f51e73197f5f44

  tasksForStatus.forEach((task) => {
    container.innerHTML += taskTemplate(task);
  });
}
<<<<<<< HEAD
function renderColumn(status, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = '';
  const tasksForStatus = getTasksByStatus(status);
  fillColumn(container, tasksForStatus);
}
=======

>>>>>>> a518af8a80a199005c74447fc0f51e73197f5f44
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
<<<<<<< HEAD
=======

/* ---------- Drag & Drop (unverändert) ---------- */

>>>>>>> a518af8a80a199005c74447fc0f51e73197f5f44
function dragstartHandler(event) {
  const taskElement = event.target.closest('.card-task');
  if (!taskElement || !event.dataTransfer) return;

  const taskId = taskElement.dataset.taskId;
  if (!taskId) return;

  event.dataTransfer.setData('text/plain', taskId);
}
function dragoverHandler(event) {
  event.preventDefault();
}
async function dropHandler(event) {
  event.preventDefault();
  if (!event.dataTransfer) return;

  const taskId = event.dataTransfer.getData('text/plain');
  const column = event.currentTarget;
  const rawStatus = column && column.dataset ? column.dataset.status : '';
  const newStatus = normalizeTaskStatus(rawStatus);

  if (!taskId || !newStatus) return;

  await updateTaskStatus(taskId, newStatus);
  renderBoard(getCurrentSearchQuery());
}
function initTaskCardEvents() {
  const columns = document.querySelector('.tasks-columns');
  if (!columns) return;

  columns.addEventListener('click', onTaskCardClick);
}
function onTaskCardClick(event) {
  const card = event.target.closest('.card-task');
  if (!card) return;

<<<<<<< HEAD
  const taskId = card.getAttribute('data-task-id');
  openTaskCardById(taskId);
}
function openTaskCardById(taskId) {
  const overlay = document.querySelector('.overlay-task-card');
  const content = document.getElementById('taskCardContent');
  if (!overlay || !content) return;

  const task = tasks.find((t) => String(t.id) === String(taskId));
  if (!task) return;

  content.innerHTML = taskCardContentTemplate(task);
  overlay.style.display = 'flex';
}
function closeTaskCard() {
  const overlay = document.querySelector('.overlay-task-card');
  if (!overlay) return;
  overlay.style.display = 'none';
}
function onOverlayEditClick(taskId) {
  onTaskEditClick(taskId);
}
function onTaskEditClick(taskId) {
  const content = document.getElementById('taskCardContent');
  if (!content) return;

  const task = tasks.find((t) => String(t.id) === String(taskId));
  if (!task) return;

  content.innerHTML = taskCardEditTemplate(task); // aus task_tamplates.js
}
function onEditPriorityClick(event) {
  event.preventDefault();

  const button = event.currentTarget;
  const wrapper = button.closest('.priority-buttons');
  if (!wrapper) return;

  const allButtons = wrapper.querySelectorAll('.priority-buttons__button');
  allButtons.forEach((btn) => btn.classList.remove('is-active'));

  button.classList.add('is-active');

  const hiddenInput = wrapper.querySelector('input[name="priority"]');
  if (!hiddenInput) return;

  hiddenInput.value =
    (button.getAttribute('data-priority') || 'Medium').toLowerCase();
}
function onTaskEditCancel(taskId) {
  openTaskCardById(taskId);
}
async function onTaskEditSave(event, taskId) {
  event.preventDefault();

  const form = event.target.closest('form');
  if (!form) return;

  const task = tasks.find((t) => String(t.id) === String(taskId));
  if (!task) return;

  const updatedTask = {
    ...task,
    title: form.elements.title.value.trim(),
    description: form.elements.description.value.trim(),
    dueDate: form.elements.dueDate.value,
    priority: (form.elements.priority.value || 'medium').toLowerCase()
  };

  try {
    await saveTask(updatedTask);

    const index = tasks.findIndex((t) => String(t.id) === String(taskId));
    if (index !== -1) {
      tasks[index] = updatedTask;
    }

    renderBoard();
    openTaskCardById(taskId);
  } catch (error) {
    console.error('onTaskEditSave:', error);
    alert('Änderungen konnten nicht gespeichert werden.');
  }
}
async function onOverlayDeleteClick(taskId) {
  if (!confirm('Diesen Task wirklich löschen?')) return;

  try {
    await deleteTaskById(taskId);

    tasks = tasks.filter((t) => String(t.id) !== String(taskId));

    renderBoard();
    closeTaskCard();
  } catch (err) {
    console.error(err);
    alert('Task konnte nicht gelöscht werden (siehe Konsole).');
  }
=======
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
>>>>>>> a518af8a80a199005c74447fc0f51e73197f5f44
}
