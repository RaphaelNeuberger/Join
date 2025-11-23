
let selectedPriority = 'Medium';

async function loadScripts() {
  initLayout();
  await initBoard();
}

function initLayout() {
  includeHeaderHTML();
  includeSidebarHTML();
  initPriorityButtons();
}

async function initBoard() {
  await fetchTasks();
  renderBoard();
}

function renderBoard() {
  renderColumn('todo', 'to-do-tasks');
  renderColumn('inProgress', 'in-progress-tasks');
  renderColumn('awaitFeedback', 'await-feedback-tasks');
  renderColumn('done', 'done-tasks');
  renderNoTasksIfEmpty();
}

function renderColumn(status, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = '';

  if (!Array.isArray(tasks) || !tasks.length) return;

  tasks
    .filter((task) => task.status === status)
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

  if (!event.dataTransfer || !taskId) return;

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
  const newStatus = column?.dataset?.status;

  if (!taskId || !newStatus) return;

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

      return `
        <span class="assigned-avatar" style="background-color: ${color};">
          ${initials}
        </span>
      `;
    })
    .join('');
}

function getAvatarColor(name = '', index = 0) {
  if (!AVATAR_COLORS.length) return '#ff7a00';

  const hash = name
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);

  return AVATAR_COLORS[(hash + index) % AVATAR_COLORS.length];
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
  if (!buttons.length) return;

  setupPriorityButtonInteractions(buttons);
  setInitialPriority(buttons);
}

function setupPriorityButtonInteractions(buttons) {
  buttons.forEach((btn) => {
    btn.setAttribute('role', 'button');
    btn.setAttribute('tabindex', '0');

    const activate = () => setPriorityActive(buttons, btn);

    btn.addEventListener('click', activate);

    btn.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        activate();
      }
    });
  });
}

function setInitialPriority(buttons) {
  const defaultButton = document.querySelector(
    '.priority-buttons__button.priority-buttons__button--active'
  );

  if (defaultButton) {
    setPriorityActive(buttons, defaultButton);
  }
}

function addTaskBtn() {
  const overlay = document.querySelector('.overlay-modal');
  if (!overlay) return;

  overlay.style.display = 'flex';
}
