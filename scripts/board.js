
async function loadScripts() {
  initLayout();
  await initBoard();
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
  if (!tasksForStatus.length) {
    return;
  }

  tasksForStatus.forEach((task) => {
    container.innerHTML += taskTemplate(task);
  });
}

function renderColumn(status, containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    return;
  }

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
  renderBoard();
}



