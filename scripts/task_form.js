let selectedPriority = 'Medium';

function initPriorityButtons() {
  const buttons = document.querySelectorAll('.priority-buttons__button');
  if (!buttons.length) {
    return;
  }

  setupPriorityButtonInteractions(buttons);
  setInitialPriority(buttons);
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


function handleClearTaskForm(event) {
  if (event) {
    event.preventDefault();
  }
  resetTaskForm();
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
