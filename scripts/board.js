
let selectedPriority = 'Medium';


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

function normalizeStatusKey(status = '') {
  const value = String(status).trim().toLowerCase();

  if (!value) {
    return 'todo';
  }

  if (value === 'inprogress' || value === 'in-progress' || value === 'in_progress') {
    return 'inprogress';
  }

  if (value === 'awaitfeedback' || value === 'await-feedback' || value === 'await_feedback') {
    return 'await_feedback';
  }

  if (value === 'done') {
    return 'done';
  }

  if (value === 'todo') {
    return 'todo';
  }

  return value;
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

function renderColumn(status, containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    return;
  }

  container.innerHTML = '';

  if (!Array.isArray(tasks) || tasks.length === 0) {
    return;
  }

  tasks
    .filter((task) => normalizeStatusKey(task.status) === status)
    .forEach((task) => {
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
  const newStatus = normalizeStatusKey(rawStatus);

  if (!taskId || !newStatus) {
    return;
  }

  await updateTaskStatus(taskId, newStatus);
  renderBoard();
}

const AVATAR_COLORS = [
  'rgb(110, 82, 255)',
  'rgb(253, 112, 255)',
  'rgb(70, 47, 138)',
  'rgb(255, 188, 43)',
  'rgb(30, 214, 193)',
  'rgb(255, 123, 0)'
];

function getInitials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => (part[0] || '').toUpperCase())
    .join('');
}

function renderAssignees(assignees = []) {
  if (!Array.isArray(assignees)) {
    assignees = assignees ? [assignees] : [];
  }

  return assignees
    .map((name, index) => {
      const color = getAvatarColor(name, index);
      const initials = getInitials(name);

      return (
        '<span class="assigned-avatar" style="background-color: ' +
        color +
        ';">' +
        initials +
        '</span>'
      );
    })
    .join('');
}

function getAvatarColor(name = '', index = 0) {
  if (!AVATAR_COLORS.length) {
    return '#ff7a00';
  }

  const hash = name
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);

  const colorIndex = (hash + index) % AVATAR_COLORS.length;
  return AVATAR_COLORS[colorIndex];
}

function setPriorityActive(buttons, activeButton) {
  buttons.forEach((button) => {
    button.classList.remove('is-active');
    button.setAttribute('aria-pressed', 'false');
  });

  activeButton.classList.add('is-active');
  activeButton.setAttribute('aria-pressed', 'true');
  selectedPriority = activeButton.dataset.priority || 'Medium';
}

function initPriorityButtons() {
  const buttons = document.querySelectorAll('.priority-buttons__button');
  if (!buttons.length) {
    return;
  }

  setupPriorityButtonInteractions(buttons);
  setInitialPriority(buttons);
}


function setupPriorityButtonInteractions(buttons) {
  buttons.forEach((btn) => {
    btn.setAttribute('role', 'button');
    btn.setAttribute('tabindex', '0');

    const activate = function () {
      setPriorityActive(buttons, btn);
    };

    btn.addEventListener('click', activate);

    btn.addEventListener('keydown', (event) => {
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        activate();
      }
    });
  });
}

function setInitialPriority(buttons) {
  let defaultButton = document.querySelector(
    '.priority-buttons__button.priority-buttons__button--active'
  );

  if (!defaultButton) {
    defaultButton =
      document.querySelector(
        '.priority-buttons__button.priority-buttons__button--medium'
      ) || buttons[0];
  }

  if (defaultButton) {
    setPriorityActive(buttons, defaultButton);
  }
}

function resetPriorityButtons() {
  const buttons = document.querySelectorAll('.priority-buttons__button');
  if (!buttons.length) {
    return;
  }
  setInitialPriority(buttons);
}

function addTaskBtn() {
  const overlay = document.querySelector('.overlay-modal');
  if (!overlay) {
    return;
  }
  overlay.style.display = 'flex';
}

function closeAddTaskBtn() {
  const overlay = document.querySelector('.overlay-modal');
  if (!overlay) {
    return;
  }
  overlay.style.display = 'none';
}

function initAddTaskForm() {
  const form = document.getElementById('taskForm');
  if (!form) {
    return;
  }

  form.addEventListener('submit', handleCreateTask);

  const clearBtn = document.getElementById('clearBtn');
  if (clearBtn) {
    clearBtn.addEventListener('click', handleClearTaskForm);
  }
}


async function handleCreateTask(event) {
  if (event) {
    event.preventDefault();
  }

  const taskData = readTaskForm();
  if (!taskData) {
    return;
  }

  await addTask(taskData);
  renderBoard();
  showSuccessMessage();
  resetTaskForm();
  closeAddTaskBtn();
}


function readTaskForm() {
  clearFormErrors();

  const title = getInputValue('title');
  const description = getInputValue('description');
  const dueDate = getInputValue('dueDate');
  const category = getInputValue('category');
  const assignedTo = getAssignedTo();

  if (!validateTaskForm(title, dueDate, category)) {
    return null;
  }

  return buildTaskData(title, description, dueDate, category, assignedTo);
}


function getInputValue(id) {
  const element = document.getElementById(id);
  return element ? element.value.trim() : '';
}


function getAssignedTo() {
  const element = document.getElementById('assignedTo');
  return element && element.value ? [element.value] : [];
}


function validateTaskForm(title, dueDate, category) {
  let valid = true;

  if (!title) {
    showError('titleError', 'Title is required');
    valid = false;
  }
  if (!dueDate) {
    showError('dueDateError', 'Due date is required');
    valid = false;
  }
  if (!category) {
    showError('categoryError', 'Category is required');
    valid = false;
  }
  return valid;
}


function buildTaskData(title, description, dueDate, category, assignedTo) {
  return {
    title,
    description,
    dueDate,
    category,
    assignedTo,
    priority: selectedPriority || 'Medium',
    subtasks: [],
    status: 'todo'
  };
}


function showError(id, message) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = message;
  }
}


function clearFormErrors() {
  const errorIds = ['titleError', 'dueDateError', 'categoryError'];

  errorIds.forEach((id) => {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = '';
    }
  });
}


function resetTaskForm() {
  const form = document.getElementById('taskForm');
  if (form) {
    form.reset();
  }
  clearFormErrors();
  resetPriorityButtons();
}


function handleClearTaskForm(event) {
  if (event) {
    event.preventDefault();
  }
  resetTaskForm();
}


function showSuccessMessage() {
  const messageElement = document.getElementById('successMessage');
  if (!messageElement) {
    return;
  }

  messageElement.style.display = 'flex';

  setTimeout(() => {
    messageElement.style.display = 'none';
  }, 2000);
}
