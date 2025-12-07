// scripts/board.js

const BOARD_STATUS_ORDER = ['todo', 'inprogress', 'await_feedback', 'done'];
const BOARD_STATUS_LABELS = {
  todo: 'To-do',
  inprogress: 'In progress',
  await_feedback: 'Review', // im Move-Menü als "Review"
  done: 'Done'
};

let currentMoveTaskId = null;

/**
 * Einstiegspunkt: Initialisiert Layout und Board.
 */
async function loadScripts() {
  initLayout();
  await initBoard();
  initTaskCardEvents();
  initBoardSearch();
  initDragAndDrop();
  initMoveMenuGlobalListener();
}

/**
 * Header/Sidebar und Formular-UI initialisieren.
 */
function initLayout() {
  includeHeaderHTML();
  includeSidebarHTML();
  initPriorityButtons();
  initAddTaskForm();
}

/**
 * Suche oben im Board (Debounce).
 */
function initBoardSearch() {
  const input = document.getElementById('boardSearch');
  if (!input) return;

  let t;
  input.addEventListener('input', function () {
    clearTimeout(t);
    const q = this.value.trim().toLowerCase();
    t = setTimeout(function () {
      renderBoardFiltered(q);
    }, 150);
  });
}

/**
 * Tasks laden und Board rendern.
 */
async function initBoard() {
  await fetchTasks();
  renderBoard();
}

/**
 * Gesamtes Board rendern (alle Spalten).
 */
function renderBoard() {
  renderColumn('todo', 'to-do-tasks');
  renderColumn('inprogress', 'in-progress-tasks');
  renderColumn('await_feedback', 'await-feedback-tasks');
  renderColumn('done', 'done-tasks');
  renderNoTasksIfEmpty();
}

/**
 * Board nach Suchstring gefiltert rendern.
 */
function renderBoardFiltered(query) {
  if (!query) {
    renderBoard();
    return;
  }

  const match = function (t) {
    const a = String(t.title || '').toLowerCase();
    const b = String(t.description || '').toLowerCase();
    return a.includes(query) || b.includes(query);
  };

  const by = function (s) {
    return getTasksByStatus(s).filter(match);
  };

  renderColumnWithTasks(by('todo'), 'to-do-tasks', true);
  renderColumnWithTasks(by('inprogress'), 'in-progress-tasks', true);
  renderColumnWithTasks(by('await_feedback'), 'await-feedback-tasks', true);
  renderColumnWithTasks(by('done'), 'done-tasks', true);
  renderNoTasksIfEmpty();
}

/**
 * Tasks nach Status filtern.
 */
function getTasksByStatus(status) {
  if (!Array.isArray(tasks) || tasks.length === 0) {
    return [];
  }
  return tasks.filter((task) => normalizeTaskStatus(task.status) === status);
}

/**
 * Karten in Spalte einfügen.
 */
function fillColumn(container, tasksForStatus) {
  if (!tasksForStatus.length) return;

  tasksForStatus.forEach((task) => {
    container.innerHTML += taskTemplate(task);
  });
}

/**
 * Spalte standardmäßig rendern (inkl. Platzhalter).
 */
function renderColumn(status, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = '';
  const tasksForStatus = getTasksByStatus(status);
  fillColumn(container, tasksForStatus);
}

/**
 * Spalte mit bereits gefilterten Tasks rendern.
 */
function renderColumnWithTasks(tasksForStatus, containerId, isSearch) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = '';
  if (!tasksForStatus || !tasksForStatus.length) {
    container.innerHTML = isSearch ? noResultsTemplate() : noTaskTemplate();
    return;
  }
  fillColumn(container, tasksForStatus);
}

/**
 * Falls keine Tasks in einer Spalte sind → Platzhalter einfügen.
 */
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

/* ===================== Drag & Drop ===================== */

/**
 * Click/Drag Events für Karten (Delegation).
 */
function initTaskCardEvents() {
  const columnsWrapper = document.querySelector('.tasks-columns');
  if (!columnsWrapper) return;

  // Klick: entweder "Move"-Button oder Karte öffnen
  columnsWrapper.addEventListener('click', onTaskCardClick);

  // Dragstart → Task-ID setzen
  columnsWrapper.addEventListener('dragstart', function (event) {
    dragstartHandler(event);
  });
}

/**
 * Registriert drop/dragover/dragleave auf den Spalten.
 */
function initDragAndDrop() {
  const columns = document.querySelectorAll('.task-column');
  columns.forEach((col) => {
    col.addEventListener('dragover', function (event) {
      dragoverHandler(event);
    });
    col.addEventListener('dragleave', function (event) {
      dragleaveHandler(event);
    });
    col.addEventListener('drop', function (event) {
      dropHandler(event);
    });
  });
}

/**
 * Dragstart: ID setzen.
 */
function dragstartHandler(event) {
  const taskElement = event.target.closest('.card-task');
  if (!taskElement || !event.dataTransfer) return;

  const taskId = taskElement.dataset.taskId;
  if (!taskId) return;

  event.dataTransfer.setData('text/plain', taskId);
}

/**
 * Dragover: Standard verhindern + Drag-Over-Style setzen.
 */
function dragoverHandler(event) {
  event.preventDefault();
  const col = event.currentTarget;
  if (col && col.classList) col.classList.add('drag-over');
}

/**
 * Dragleave: Drag-Over-Style entfernen.
 */
function dragleaveHandler(event) {
  const col = event.currentTarget;
  if (col && col.classList) col.classList.remove('drag-over');
}

/**
 * Drop: Status aktualisieren und Board neu rendern.
 */
async function dropHandler(event) {
  event.preventDefault();
  const col = event.currentTarget;
  if (col && col.classList) col.classList.remove('drag-over');

  if (!event.dataTransfer) return;
  const taskId = event.dataTransfer.getData('text/plain');
  const rawStatus = col && col.dataset ? col.dataset.status : '';
  const newStatus = normalizeTaskStatus(rawStatus);
  if (!taskId || !newStatus) return;

  await updateTaskStatus(taskId, newStatus);
  renderBoard();
}

/* ===================== Task-Overlay (View/Edit/Delete) ===================== */

function onTaskCardClick(event) {
  // 1) Wurde der Move-Button geklickt?
  const moveBtn = event.target.closest('.card-move-btn');
  if (moveBtn) {
    event.stopPropagation();
    const taskId = moveBtn.getAttribute('data-task-id');
    openMoveMenu(moveBtn, taskId);
    return;
  }

  // 2) Sonst normale Karte → Detail-Overlay
  const card = event.target.closest('.card-task');
  if (!card) return;

  const taskId = card.getAttribute('data-task-id');
  openTaskCardById(taskId);
}

/**
 * Detail-Overlay öffnen.
 */
function openTaskCardById(taskId) {
  const overlay = document.querySelector('.overlay-task-card');
  const content = document.getElementById('taskCardContent');
  if (!overlay || !content) return;

  const task = tasks.find((t) => String(t.id) === String(taskId));
  if (!task) return;

  content.innerHTML = taskCardContentTemplate(task);
  overlay.style.display = 'flex';
}

/**
 * Detail-Overlay schließen.
 */
function closeTaskCard() {
  const overlay = document.querySelector('.overlay-task-card');
  if (!overlay) return;
  overlay.style.display = 'none';
}

/**
 * aus Template aufgerufen (Edit-Button im View-Overlay)
 */
function onOverlayEditClick(taskId) {
  onTaskEditClick(taskId);
}

/**
 * Edit-Ansicht im Overlay anzeigen.
 */
function onTaskEditClick(taskId) {
  const content = document.getElementById('taskCardContent');
  if (!content) return;

  const task = tasks.find((t) => String(t.id) === String(taskId));
  if (!task) return;

  content.innerHTML = taskCardEditTemplate(task);
}

/**
 * Priority im Edit-Overlay umschalten.
 */
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

/**
 * Edit-Ansicht abbrechen → zurück zur View-Ansicht.
 */
function onTaskEditCancel(taskId) {
  openTaskCardById(taskId);
}

/**
 * Änderungen im Edit-Overlay speichern.
 */
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
    alert('Could not save changes.');
  }
}

/**
 * Task aus Overlay löschen.
 */
async function onOverlayDeleteClick(taskId) {
  if (!confirm('Do you really want to delete this task?')) return;

  try {
    await deleteTaskById(taskId);

    tasks = tasks.filter((t) => String(t.id) !== String(taskId));

    renderBoard();
    closeTaskCard();
  } catch (err) {
    alert('Task could not be deleted.');
  }
}

/* ===================== Subtasks (Toggle) ===================== */

/**
 * Wird von renderSubtasksDetail() in task_tamplates.js aufgerufen.
 */
async function onSubtaskToggle(taskId, subIndex, isChecked) {
  const taskIndex = tasks.findIndex((t) => String(t.id) === String(taskId));
  if (taskIndex === -1) return;

  const task = tasks[taskIndex];
  const subtasks = Array.isArray(task.subtasks) ? [...task.subtasks] : [];

  if (!subtasks[subIndex]) return;

  subtasks[subIndex] = {
    ...subtasks[subIndex],
    done: !!isChecked
  };

  const updatedTask = {
    ...task,
    subtasks
  };

  try {
    await saveTask(updatedTask);

    tasks[taskIndex] = updatedTask;

    // Board (Karten + Progress) aktualisieren
    renderBoard();

    // Overlay-Subtasks neu zeichnen (falls geöffnet)
    const content = document.getElementById('taskCardContent');
    if (content) {
      const listEl = content.querySelector('.subtask-list-detail');
      if (listEl) {
        listEl.innerHTML = renderSubtasksDetail(
          updatedTask.subtasks || [],
          updatedTask.id
        );
      }
    }
  } catch (err) {
    console.error('onSubtaskToggle error:', err);
    alert('Subtask konnte nicht gespeichert werden.');
  }
}

/* ===================== Move-to Menü (Mobile/Overlay) ===================== */

/**
 * Sorgt dafür, dass Klicks außerhalb das Menü schließen.
 */
function initMoveMenuGlobalListener() {
  document.addEventListener('click', (event) => {
    const menu = document.getElementById('cardMoveMenu');
    if (!menu || menu.style.display !== 'block') return;

    const clickedInsideMenu = event.target.closest('#cardMoveMenu');
    const clickedMoveBtn = event.target.closest('.card-move-btn');

    if (!clickedInsideMenu && !clickedMoveBtn) {
      closeMoveMenu();
    }
  });
}

/**
 * Menü-Element (ein einziges globales) erstellen oder holen.
 */
function getMoveMenuElement() {
  let menu = document.getElementById('cardMoveMenu');
  if (menu) return menu;

  menu = document.createElement('div');
  menu.id = 'cardMoveMenu';
  menu.className = 'card-move-menu';
  menu.innerHTML = `
    <div class="card-move-menu__inner">
      <div class="card-move-menu__title">Move to</div>
      <div class="card-move-menu__options"></div>
    </div>
  `;
  document.body.appendChild(menu);
  return menu;
}

/**
 * Öffnet das "Move to"-Menü neben dem Button.
 * Nur direkte Nachbarn werden angezeigt (eine Position oben / unten).
 */
function openMoveMenu(buttonEl, taskId) {
  const menu = getMoveMenuElement();
  const optionsContainer = menu.querySelector('.card-move-menu__options');
  if (!optionsContainer) return;

  const task = tasks.find((t) => String(t.id) === String(taskId));
  if (!task) return;

  const currentStatus = normalizeTaskStatus(task.status || 'todo');
  currentMoveTaskId = taskId;

  const currentIdx = BOARD_STATUS_ORDER.indexOf(currentStatus);
  if (currentIdx === -1) return;

  // Kandidaten: direkt oberhalb & direkt unterhalb
  const candidates = [];
  if (currentIdx > 0) {
    candidates.push(BOARD_STATUS_ORDER[currentIdx - 1]);
  }
  if (currentIdx < BOARD_STATUS_ORDER.length - 1) {
    candidates.push(BOARD_STATUS_ORDER[currentIdx + 1]);
  }

  optionsContainer.innerHTML = '';

  candidates.forEach((statusKey) => {
    const label = BOARD_STATUS_LABELS[statusKey] || statusKey;
    const targetIdx = BOARD_STATUS_ORDER.indexOf(statusKey);
    const arrow = targetIdx < currentIdx ? '↑' : '↓';

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'card-move-menu__option';
    btn.dataset.status = statusKey;
    btn.innerHTML = `<span class="card-move-menu__arrow">${arrow}</span><span>${label}</span>`;

    btn.addEventListener('click', async () => {
      await handleMoveMenuSelection(statusKey);
    });

    optionsContainer.appendChild(btn);
  });

  // Positionieren – rechts unter dem Button, leicht nach unten versetzt
  const rect = buttonEl.getBoundingClientRect();
  const menuWidth = 170; // ungefährer Wert, passt zu CSS
  const offsetY = 8;

  menu.style.display = 'block';
  menu.style.top = `${rect.bottom + window.scrollY + offsetY}px`;
  menu.style.left = `${rect.right + window.scrollX - menuWidth}px`;
}

/**
 * Menü schließen.
 */
function closeMoveMenu() {
  const menu = document.getElementById('cardMoveMenu');
  if (!menu) return;
  menu.style.display = 'none';
  currentMoveTaskId = null;
}

/**
 * Auswahl im Menü → Status wechseln.
 */
async function handleMoveMenuSelection(targetStatus) {
  if (!currentMoveTaskId) return;

  try {
    await updateTaskStatus(currentMoveTaskId, targetStatus);
    renderBoard();
  } catch (e) {
    console.error('move menu status update failed', e);
    alert('Status konnte nicht geändert werden.');
  } finally {
    closeMoveMenu();
  }
}

/* ===================== Startpunkt ===================== */

document.addEventListener('DOMContentLoaded', loadScripts);
