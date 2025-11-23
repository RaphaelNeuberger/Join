async function loadScripts() {
  includeHeaderHTML();
  includeSidebarHTML();
  initPriorityButtons();

  await fetchTasks();
  renderToDoTasks();
  renderNoTasksIfEmpty();
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


function renderToDoTasks() {
  const toDoContainer = document.getElementById('to-do-tasks');
  if (!toDoContainer) return;

  toDoContainer.innerHTML = '';
  if (!Array.isArray(tasks) || !tasks.length) return;

  tasks
    .filter((task) => task.status === 'todo')
    .forEach((task) => {
      toDoContainer.innerHTML += taskTemplate(task);
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


function dropHandler(event) {
  event.preventDefault();

  if (!event.dataTransfer) return;

  const taskId = event.dataTransfer.getData('text/plain');
  const column = event.currentTarget;
  const dropZone = column.querySelector('.task-cards');
  const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);

  if (taskElement && dropZone) {
    dropZone.appendChild(taskElement);
    renderNoTasksIfEmpty();
  }
}


// Avatar-Farben für zugewiesene Benutzer
const AVATAR_COLORS = [
  'rgb(110, 82, 255)',
  'rgb(253, 112, 255)',
  'rgb(70, 47, 138)',
  'rgb(255, 188, 43)',
  'rgb(30, 214, 193)',
  'rgb(255, 123, 0)'
];


/**
 * Erzeugt Initialen aus einem Namen.
 * @param {string} [name='']
 * @returns {string}
 */
function getInitials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => (part[0] || '').toUpperCase())
    .join('');
}


/**
 * Rendert die Avatare der zugewiesenen Personen.
 * @param {Array<string>|string} [assignees=[]]
 * @returns {string} HTML-String
 */
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


/**
 * Gibt eine konsistente Farbe für einen Namen zurück.
 * @param {string} [name='']
 * @param {number} [index=0]
 * @returns {string}
 */
function getAvatarColor(name = '', index = 0) {
  if (!AVATAR_COLORS.length) return '#ff7a00';

  const hash = name
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);

  return AVATAR_COLORS[(hash + index) % AVATAR_COLORS.length];
}

let selectedPriority = 'Medium';

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
  buttons.forEach((button) => {
    button.setAttribute('role', 'button');
    button.setAttribute('tabindex', '0');

    button.addEventListener('click', () => {
      setPriorityActive(buttons, button);
    });

    button.addEventListener('keydown', (event) => {
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        setPriorityActive(buttons, button);
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
