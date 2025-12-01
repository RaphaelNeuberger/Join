// task_form.js

let selectedPriority = 'Medium';
let subtaskDrafts = [];

/**
 * Initialisiert die Priority-Buttons (Add-Task-Form).
 */
function initPriorityButtons() {
  const buttons = document.querySelectorAll('.priority-buttons__button');
  if (!buttons.length) {
    return;
  }

  setupPriorityButtonInteractions(buttons);
  setInitialPriority(buttons);
}

/**
 * Setzt einen Button als aktiv.
 */
function setPriorityActive(buttons, activeButton) {
  buttons.forEach((button) => {
    button.classList.remove('is-active');
    button.setAttribute('aria-pressed', 'false');
  });

  activeButton.classList.add('is-active');
  activeButton.setAttribute('aria-pressed', 'true');
  selectedPriority = activeButton.dataset.priority || 'Medium';
}

/**
 * Klick- und Tastatur-Events für Priority-Buttons.
 */
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

/**
 * Initialen Priority-Button setzen (Medium oder erster Button).
 */
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

/**
 * Priority-Buttons auf Default zurücksetzen.
 */
function resetPriorityButtons() {
  const buttons = document.querySelectorAll('.priority-buttons__button');
  if (!buttons.length) return;

  selectedPriority = 'Medium';
  setInitialPriority(buttons);
}

/**
 * Overlay "Add Task" öffnen.
 */
function addTaskBtn() {
  const overlay = document.querySelector('.overlay-modal');
  if (!overlay) return;

  overlay.style.display = 'flex';
}

/**
 * Overlay "Add Task" schließen.
 */
function closeAddTaskBtn() {
  const overlay = document.querySelector('.overlay-modal');
  if (!overlay) return;

  overlay.style.display = 'none';
}

/**
 * Add-Task-Formular initialisieren.
 * - Submit-Handler
 * - Clear-Button
 * - Subtask-Steuerung
 */
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

  initSubtaskControls();
}

/**
 * Subtask-Buttons + Input initialisieren.
 */
function initSubtaskControls() {
  const input = document.getElementById('subtaskInput');
  const addBtn = document.getElementById('addSubtaskBtn');
  const list = document.getElementById('subtaskList');

  if (!input || !addBtn || !list) return;

  addBtn.addEventListener('click', function () {
    addSubtaskFromInput();
  });

  input.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      addSubtaskFromInput();
    }
  });

  renderSubtaskDrafts();
}

/**
 * Liest den Wert aus dem Subtask-Input und fügt ihn hinzu.
 */
function addSubtaskFromInput() {
  const input = document.getElementById('subtaskInput');
  if (!input) return;

  const value = input.value.trim();
  if (!value) return;

  subtaskDrafts.push({
    title: value,
    done: false
  });

  input.value = '';
  renderSubtaskDrafts();
}

/**
 * Entfernt einen Subtask aus dem Draft.
 */
function removeSubtaskDraft(index) {
  if (index < 0 || index >= subtaskDrafts.length) return;
  subtaskDrafts.splice(index, 1);
  renderSubtaskDrafts();
}

/**
 * Rendert die aktuellen Subtask-Entwürfe in die Liste.
 */
function renderSubtaskDrafts() {
  const list = document.getElementById('subtaskList');
  if (!list) return;

  list.innerHTML = '';

  if (!subtaskDrafts.length) {
    return;
  }

  subtaskDrafts.forEach((subtask, index) => {
    const li = document.createElement('li');
    li.className = 'subtask-item';
    li.innerHTML = `
      <span class="subtask-title">${escapeHtml(subtask.title)}</span>
      <button type="button" class="subtask-remove-btn" aria-label="Remove subtask">
        ✕
      </button>
    `;

    const removeBtn = li.querySelector('.subtask-remove-btn');
    removeBtn.addEventListener('click', function () {
      removeSubtaskDraft(index);
    });

    list.appendChild(li);
  });
}

/**
 * Task anlegen (Submit des Formulars).
 */
async function handleCreateTask(event) {
  if (event) {
    event.preventDefault();
  }

  const taskData = readTaskForm();
  if (!taskData) {
    return;
  }

  try {
    await addTask(taskData);
    renderBoard();
    showSuccessMessage();
    resetTaskForm();
    closeAddTaskBtn();
  } catch (err) {
    console.error('handleCreateTask:', err);
    alert('Task konnte nicht erstellt werden (siehe Konsole).');
  }
}

/**
 * Liest die Formularwerte aus, validiert und baut das Task-Objekt.
 */
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

/**
 * Hilfsfunktion: Input-Value holen + trimmen.
 */
function getInputValue(id) {
  const element = document.getElementById(id);
  return element ? element.value.trim() : '';
}

/**
 * Assigned-To aus dem Select lesen (einfaches Single-Select → Array).
 */
function getAssignedTo() {
  const element = document.getElementById('assignedTo');
  return element && element.value ? [element.value] : [];
}

/**
 * Validiert Pflichtfelder.
 */
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

/**
 * Baut das Task-Objekt für addTask().
 */
function buildTaskData(title, description, dueDate, category, assignedTo) {
  // Subtasks: aktuelle Drafts kopieren
  const subtasks = subtaskDrafts.map((s) => ({
    title: s.title,
    done: !!s.done
  }));

  return {
    title,
    description,
    dueDate,
    category,
    assignedTo,
    priority: selectedPriority || 'Medium',
    subtasks,
    status: 'todo'
  };
}

/**
 * Error-Text in Fehler-Span schreiben.
 */
function showError(id, message) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = message;
  }
}

/**
 * Alle Formular-Fehler zurücksetzen.
 */
function clearFormErrors() {
  const errorIds = ['titleError', 'dueDateError', 'categoryError'];

  errorIds.forEach((id) => {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = '';
    }
  });
}

/**
 * Formular auf Default zurücksetzen.
 */
function resetTaskForm() {
  const form = document.getElementById('taskForm');
  if (form) {
    form.reset();
  }

  // Priorität zurück auf Medium
  resetPriorityButtons();

  // Fehler löschen
  clearFormErrors();

  // Subtasks zurücksetzen
  subtaskDrafts = [];
  renderSubtaskDrafts();

  // Erfolgsmeldung ausblenden (falls noch sichtbar)
  const messageElement = document.getElementById('successMessage');
  if (messageElement) {
    messageElement.style.display = 'none';
  }
}

/**
 * Clear-Button gedrückt → Formular resetten.
 */
function handleClearTaskForm(event) {
  if (event) {
    event.preventDefault();
  }
  resetTaskForm();
}

/**
 * Kurzfristige Erfolgsmeldung anzeigen.
 */
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

/**
 * Kleiner Helfer zum Escapen (wird auch in task_tamplates.js genutzt).
 */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
