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
}
async function initBoard() {
  await fetchTasks();
  renderBoard();
}
function renderBoard() {
  renderColumn('todo', 'to-do-tasks');
  renderColumn('inprogress', 'in-progress-tasks');
  renderColumn('await_feedback', 'await-feedback-tasks');
  renderColumn('done', 'done-tasks');
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

  container.innerHTML = '';
  const tasksForStatus = getTasksByStatus(status);
  fillColumn(container, tasksForStatus);
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
  renderBoard();
}
function initTaskCardEvents() {
  const columns = document.querySelector('.tasks-columns');
  if (!columns) return;

  columns.addEventListener('click', onTaskCardClick);
}
function onTaskCardClick(event) {
  const card = event.target.closest('.card-task');
  if (!card) return;

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
}
