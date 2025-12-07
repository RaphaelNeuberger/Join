// scripts/board_overlay.js

/**
 * Click-Handling auf Karten:
 * - Klick auf .card-move-btn -> Move-Menü (Up/Down) öffnen
 * - Klick auf .card-task (sonst) -> Detail-Overlay öffnen
 */
function onTaskCardClick(event) {
  const moveBtn = event.target.closest(".card-move-btn");
  if (moveBtn) {
    // Prevent the click from bubbling to the document-level handler
    // which may immediately close the menu. Also prevent default
    // to avoid any native button behavior.
    try {
      event.stopPropagation();
      event.preventDefault();
    } catch (e) {
      // ignore if event is not cancelable
    }
    const card = moveBtn.closest(".card-task");
    if (!card) return;
    const taskId = card.dataset.taskId;
    if (!taskId) return;
    openMoveMenu(taskId, moveBtn);
    return;
  }

  const card = event.target.closest(".card-task");
  if (!card) return;

  const taskId = card.dataset.taskId;
  if (!taskId) return;

  openTaskCard(taskId);
}

/* ============================================================
 *  Overlay: Task-Detail (View / Edit)
 * ============================================================ */

function getOverlayElements() {
  const overlay = document.querySelector(".overlay-task-card");
  const content = document.getElementById("taskCardContent");
  return { overlay, content };
}

/**
 * Task-Detail Overlay öffnen (View-Mode).
 */
function openTaskCard(taskId) {
  const { overlay, content } = getOverlayElements();
  if (!overlay || !content) return;

  const task = tasks.find((t) => String(t.id) === String(taskId));
  if (!task) return;

  content.innerHTML = taskCardContentTemplate(task);

  overlay.style.display = "flex";
  overlay.classList.add("overlay-task-card--open");
  document.body.style.overflow = "hidden";

  closeMoveMenu();
}

/**
 * Task-Detail Overlay schließen.
 */
function closeTaskCard() {
  const { overlay, content } = getOverlayElements();
  if (!overlay) return;

  overlay.style.display = "none";
  overlay.classList.remove("overlay-task-card--open");
  document.body.style.overflow = "";

  if (content) {
    content.innerHTML = "";
  }

  closeMoveMenu();
}

/**
 * Hintergrund-Klick schließt das Overlay.
 */
document.addEventListener("click", function (event) {
  const { overlay } = getOverlayElements();
  if (!overlay) return;

  if (event.target === overlay) {
    closeTaskCard();
  }
});

/**
 * ESC schließt das Overlay + Move-Menü.
 */
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    closeTaskCard();
    closeMoveMenu();
  }
});

/**
 * Edit-Button im Overlay (View-Mode).
 */
function onTaskEditClick(taskId) {
  const { overlay, content } = getOverlayElements();
  if (!overlay || !content) return;

  const task = tasks.find((t) => String(t.id) === String(taskId));
  if (!task) return;

  content.innerHTML = taskCardEditTemplate(task);
}

/**
 * Cancel im Edit-Mode -> zurück in View-Mode.
 */
function onTaskEditCancel(taskId) {
  openTaskCard(taskId);
}

/**
 * Save im Edit-Mode.
 */
async function onTaskEditSave(event, taskId) {
  event.preventDefault();
  const form = event.target;
  if (!form) return;

  const formData = new FormData(form);
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const dueDate = String(formData.get("dueDate") || "").trim();
  const priorityRaw = String(formData.get("priority") || "Medium").trim();

  if (!title) {
    alert("Title is required.");
    return;
  }

  const index = tasks.findIndex((t) => String(t.id) === String(taskId));
  if (index === -1) return;

  const oldTask = tasks[index];

  const updatedTask = {
    ...oldTask,
    title,
    description,
    dueDate,
    priority: normalizePriority(priorityRaw),
  };

  try {
    await saveTask(updatedTask);
    tasks[index] = updatedTask;
    renderBoard();
    openTaskCard(taskId);
  } catch (error) {
    console.error("onTaskEditSave: error saving task", error);
    alert("Error while saving the task.");
  }
}

/**
 * Priority-Buttons im Edit-Overlay.
 */
function onEditPriorityClick(event) {
  const button = event.currentTarget;
  const wrapper = button.closest(".priority-buttons");
  if (!wrapper) return;

  const buttons = wrapper.querySelectorAll(".priority-buttons__button");
  buttons.forEach((btn) => btn.classList.remove("is-active"));

  button.classList.add("is-active");

  const hidden = wrapper.querySelector('input[name="priority"]');
  if (hidden) {
    hidden.value = button.dataset.priority || "Medium";
  }
}

/**
 * Delete-Button im View-Overlay.
 */
async function onOverlayDeleteClick(taskId) {
  const confirmDelete = window.confirm("Do you really want to delete this task?");
  if (!confirmDelete) return;

  try {
    await deleteTaskById(taskId);

    // lokal aus tasks entfernen
    tasks = tasks.filter(
      (t) =>
        String(t.id) !== String(taskId) &&
        String(t.firebaseId) !== String(taskId)
    );

    closeTaskCard();
    renderBoard();
  } catch (error) {
    console.error("onOverlayDeleteClick: error deleting task", error);
    alert("Error while deleting the task.");
  }
}

/**
 * Checkbox-Änderung bei Subtasks im Overlay.
 */
async function onSubtaskToggle(taskId, index, checked) {
  const taskIndex = tasks.findIndex((t) => String(t.id) === String(taskId));
  if (taskIndex === -1) return;

  const task = tasks[taskIndex];
  const subtasks = Array.isArray(task.subtasks) ? [...task.subtasks] : [];

  if (!subtasks[index]) return;

  const updatedSubtask = {
    ...subtasks[index],
    done: !!checked,
    checked: !!checked,
  };
  subtasks[index] = updatedSubtask;

  const updatedTask = {
    ...task,
    subtasks,
  };

  try {
    await saveTask(updatedTask);
    tasks[taskIndex] = updatedTask;
    renderBoard();
  } catch (error) {
    console.error("onSubtaskToggle: error saving subtask state", error);
  }
}

/* ============================================================
 *  Move-Menü (Up / Down innerhalb der Spalte)
 * ============================================================ */

// WICHTIG: currentMoveTaskId ist bereits in board.js als globale Variable definiert.
// Hier NICHT noch einmal mit let/const definieren, einfach verwenden.

/**
 * Globales Element für das Move-Menü.
 */
let moveMenuElement = null;

/**
 * Sicherstellen, dass das globale Move-Menü-Element existiert.
 */
function ensureMoveMenuElement() {
  if (moveMenuElement) return moveMenuElement;

  const el = document.createElement("div");
  el.className = "card-move-menu";
  el.innerHTML = `
    <div class="card-move-menu__inner">
      <p class="card-move-menu__title">Reorder:</p>
      <div class="card-move-menu__options"></div>
    </div>
  `;
  document.body.appendChild(el);
  moveMenuElement = el;

  return moveMenuElement;
}

/**
 * Move-Menü öffnen.
 * @param {string} taskId
 * @param {HTMLElement} anchorEl - das Icon-Element (Button) auf der Karte
 */
function openMoveMenu(taskId, anchorEl) {
  currentMoveTaskId = taskId;

  const menu = ensureMoveMenuElement();
  const optionsContainer = menu.querySelector(".card-move-menu__options");
  if (!optionsContainer) return;

  const globalIndex = tasks.findIndex((t) => String(t.id) === String(taskId));
  if (globalIndex === -1) return;

  const task = tasks[globalIndex];
  const status = normalizeTaskStatus(task.status);

  // alle globalen Indizes der Tasks mit gleichem Status
  const indicesInStatus = tasks.reduce((acc, t, idx) => {
    if (normalizeTaskStatus(t.status) === status) {
      acc.push(idx);
    }
    return acc;
  }, []);

  const pos = indicesInStatus.indexOf(globalIndex);
  if (pos === -1) return;

  const isFirst = pos === 0;
  const isLast = pos === indicesInStatus.length - 1;

  optionsContainer.innerHTML = "";

  // Move up
  const upBtn = document.createElement("button");
  upBtn.type = "button";
  upBtn.className = "card-move-menu__option";
  upBtn.disabled = isFirst;
  upBtn.innerHTML =
    '<span class="card-move-menu__arrow">↑</span>' +
    "<span>Move up</span>";
  upBtn.addEventListener("click", function () {
    moveTaskInColumn(taskId, "up");
  });
  optionsContainer.appendChild(upBtn);

  // Move down
  const downBtn = document.createElement("button");
  downBtn.type = "button";
  downBtn.className = "card-move-menu__option";
  downBtn.disabled = isLast;
  downBtn.innerHTML =
    '<span class="card-move-menu__arrow">↓</span>' +
    "<span>Move down</span>";
  downBtn.addEventListener("click", function () {
    moveTaskInColumn(taskId, "down");
  });
  optionsContainer.appendChild(downBtn);

  const rect = anchorEl.getBoundingClientRect();
  const top = rect.bottom + window.scrollY + 6;
  const left = rect.left + window.scrollX;

  menu.style.top = top + "px";
  menu.style.left = left + "px";
  menu.style.display = "block";
}

/**
 * Move-Menü schließen.
 */
function closeMoveMenu() {
  if (!moveMenuElement) return;
  moveMenuElement.style.display = "none";
}

/**
 * Task innerhalb seiner Spalte (Status) einen Schritt hoch/runter verschieben.
 * Es wird nur die Reihenfolge im globalen "tasks"-Array geändert.
 */
function moveTaskInColumn(taskId, direction) {
  const currentIndex = tasks.findIndex((t) => String(t.id) === String(taskId));
  if (currentIndex === -1) return;

  const task = tasks[currentIndex];
  const status = normalizeTaskStatus(task.status);

  // globale Indizes aller Tasks mit demselben Status
  const indicesInStatus = tasks.reduce((acc, t, idx) => {
    if (normalizeTaskStatus(t.status) === status) {
      acc.push(idx);
    }
    return acc;
  }, []);

  const pos = indicesInStatus.indexOf(currentIndex);
  if (pos === -1) return;

  let targetGlobalIndex = currentIndex;

  if (direction === "up") {
    if (pos === 0) return; // schon ganz oben
    targetGlobalIndex = indicesInStatus[pos - 1];
  } else if (direction === "down") {
    if (pos === indicesInStatus.length - 1) return; // schon ganz unten
    targetGlobalIndex = indicesInStatus[pos + 1];
  } else {
    return;
  }

  if (targetGlobalIndex === currentIndex) return;

  // Im globalen Array tasks vertauschen
  const temp = tasks[targetGlobalIndex];
  tasks[targetGlobalIndex] = tasks[currentIndex];
  tasks[currentIndex] = temp;

  closeMoveMenu();
  renderBoard();
}

/**
 * Klick irgendwo im Dokument schließt das Move-Menü,
 * wenn man nicht auf den Move-Button oder das Menü klickt.
 */
document.addEventListener("click", function (event) {
  if (!moveMenuElement || moveMenuElement.style.display !== "block") return;

  const clickInsideMenu = moveMenuElement.contains(event.target);
  const clickOnMoveBtn = event.target.closest(".card-move-btn");

  if (!clickInsideMenu && !clickOnMoveBtn) {
    closeMoveMenu();
  }
});

/**
 * Bei Scroll/Resize Move-Menü schließen (damit es nicht „in der Luft hängt“).
 */
window.addEventListener("scroll", closeMoveMenu);
window.addEventListener("resize", closeMoveMenu);
