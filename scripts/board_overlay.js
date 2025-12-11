
function onTaskCardClick(event) {
  if (handleMoveButtonClick(event)) return;
  handleCardClick(event);
}

function handleMoveButtonClick(event) {
  const moveBtn = event.target.closest(".card-move-btn");
  if (!moveBtn) return false;

  tryStopClick(event);
  const taskId = moveBtn.dataset.taskId;
  if (!taskId) return true;

  openMoveMenu(taskId, moveBtn);
  return true;
}

function handleCardClick(event) {
  const card = event.target.closest(".card-task");
  if (!card) return;

  const taskId = card.dataset.taskId;
  if (!taskId) return;

  openTaskCard(taskId);
}

function tryStopClick(event) {
  if (!event) return;
  if (typeof event.stopPropagation === "function") {
    event.stopPropagation();
  }
  if (typeof event.preventDefault === "function") {
    event.preventDefault();
  }
}

function getOverlayElements() {
  const overlay = document.querySelector(".overlay-task-card");
  const content = document.getElementById("taskCardContent");
  return { overlay, content };
}

function openTaskCard(taskId) {
  const task = getTaskById(taskId);
  if (!task) return;

  const { overlay, content } = getOverlayElements();
  if (!overlay || !content) return;

  content.innerHTML = taskCardContentTemplate(task);
  showOverlay(overlay);
  closeMoveMenu();
}

function closeTaskCard() {
  const { overlay, content } = getOverlayElements();
  if (!overlay) return;

  hideOverlay(overlay);
  if (content) {
    content.innerHTML = "";
  }
}

function showOverlay(overlay) {
  overlay.style.display = "flex";
  overlay.classList.add("overlay-task-card--open");
  document.body.style.overflow = "hidden";
}

function hideOverlay(overlay) {
  overlay.style.display = "none";
  overlay.classList.remove("overlay-task-card--open");
  document.body.style.overflow = "";
}

function onTaskEditClick(taskId) {
  const task = getTaskById(taskId);
  if (!task) return;

  const { overlay, content } = getOverlayElements();
  if (!overlay || !content) return;

  content.innerHTML = taskCardEditTemplate(task);
  showOverlay(overlay);
  initEditOverlay();
}

function onTaskEditCancel(taskId) {
  openTaskCard(taskId);
}

function initEditOverlay() {
  initEditPriorityButtons();
  initEditAssignedTo();
}

function initEditPriorityButtons() {
  const root = document.querySelector(".task-card-edit-form");
  if (!root) return;

  const buttons = root.querySelectorAll(".priority-buttons__button");
  buttons.forEach(function (btn) {
    btn.addEventListener("click", function (event) {
      onEditPriorityClick(event);
    });
  });
}

function initEditAssignedTo() {
  if (typeof initAssignedTo === "function") {
    try {
      initAssignedTo();
    } catch (error) {
      console.error("initEditAssignedTo failed", error);
    }
  }
}

async function onTaskEditSave(event, taskId) {
  tryStopClick(event);

  const form = event.target;
  if (!form) return;

  const index = findTaskIndexById(taskId);
  if (index === -1) return;

  const oldTask = tasks[index];
  const formData = readEditFormData(form);
  if (!formData) return;

  const updatedTask = buildTaskFromEdit(oldTask, formData);

  await saveEditedTask(index, updatedTask, taskId);
}

function findTaskIndexById(taskId) {
  return tasks.findIndex(function (t) {
    return String(t.id) === String(taskId);
  });
}

function readEditFormData(form) {
  const formData = new FormData(form);

  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const dueDate = String(formData.get("dueDate") || "").trim();
  const priorityRaw = String(formData.get("priority") || "Medium").trim();

  if (!title) {
    alert("Title is required.");
    return null;
  }

  return { title, description, dueDate, priorityRaw };
}

function buildTaskFromEdit(oldTask, formData) {
  const priority = normalizePriority(formData.priorityRaw);

  const assignedTo = typeof getAssignedTo === "function"
    ? getAssignedTo()
    : oldTask.assignedTo;

  return {
    ...oldTask,
    title: formData.title,
    description: formData.description,
    dueDate: formData.dueDate,
    priority: priority,
    assignedTo: assignedTo,
  };
}

async function saveEditedTask(index, updatedTask, taskId) {
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

function onEditPriorityClick(event) {
  const button = event.currentTarget;
  if (!button) return;

  const root = button.closest(".task-card-edit-form");
  if (!root) return;

  setActivePriorityButton(root, button);
  updateHiddenPriority(root, button);
}

function setActivePriorityButton(root, activeButton) {
  const buttons = root.querySelectorAll(".priority-buttons__button");
  buttons.forEach(function (btn) {
    btn.classList.remove("is-active");
  });
  activeButton.classList.add("is-active");
}

function updateHiddenPriority(root, button) {
  const value = button.getAttribute("data-priority") || "Medium";
  const hiddenInput = root.querySelector('input[name="priority"]');
  if (!hiddenInput) return;

  hiddenInput.value = value;
}

async function onOverlayDeleteClick(taskId) {
  if (!taskId) return;

  try {
    await deleteTaskById(taskId);
    removeTaskFromLocalList(taskId);
    renderBoard();
    closeTaskCard();
  } catch (error) {
    console.error("onOverlayDeleteClick: error deleting task", error);
    alert("Error while deleting the task.");
  }
}

function removeTaskFromLocalList(taskId) {
  const index = findTaskIndexById(taskId);
  if (index === -1) return;

  tasks.splice(index, 1);
}

async function onSubtaskToggle(taskId, index, checked) {
  const taskIndex = findTaskIndexById(taskId);
  if (taskIndex === -1) return;

  const task = tasks[taskIndex];
  const subtasks = cloneSubtasks(task);
  if (!subtasks[index]) return;

  const updatedSubtask = buildToggledSubtask(subtasks[index], checked);
  subtasks[index] = updatedSubtask;

  const updatedTask = buildTaskWithSubtasks(task, subtasks);
  await saveTaskWithSubtasks(taskIndex, updatedTask);
}

function cloneSubtasks(task) {
  if (!Array.isArray(task.subtasks)) {
    return [];
  }
  return task.subtasks.map(function (s) {
    return { ...s };
  });
}

function buildToggledSubtask(subtask, checked) {
  const flag = !!checked;
  return {
    ...subtask,
    done: flag,
    checked: flag,
  };
}

function buildTaskWithSubtasks(task, subtasks) {
  return {
    ...task,
    subtasks: subtasks,
  };
}

async function saveTaskWithSubtasks(index, updatedTask) {
  try {
    await saveTask(updatedTask);
    tasks[index] = updatedTask;
    renderBoard();
  } catch (error) {
    console.error("onSubtaskToggle: error saving subtask state", error);
  }
}

async function onAddSubtaskFromOverlay(taskId) {
  const input = document.getElementById("overlaySubtaskInput");
  if (!input) return;

  const title = String(input.value || "").trim();
  if (!title) return;

  const taskIndex = findTaskIndexById(taskId);
  if (taskIndex === -1) return;

  const task = tasks[taskIndex];
  const subtasks = cloneSubtasks(task);

  subtasks.push({ title: title, done: false, checked: false });

  const updatedTask = buildTaskWithSubtasks(task, subtasks);

  try {
    await saveTask(updatedTask);
    tasks[taskIndex] = updatedTask;
    input.value = "";
    refreshOverlaySubtasks(updatedTask);
    renderBoard();
  } catch (error) {
    console.error("onAddSubtaskFromOverlay: error saving subtask", error);
  }
}

function refreshOverlaySubtasks(task) {
  const list = document.querySelector(".subtask-list-detail");
  if (!list) return;

  list.innerHTML = renderSubtasksDetail(task.subtasks || [], task.id);
}

function getTaskById(taskId) {
  return tasks.find(function (t) {
    return String(t.id) === String(taskId);
  });
}

document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    closeTaskCard();
    closeMoveMenu();
  }
});

document.addEventListener("click", function (event) {
  const { overlay } = getOverlayElements();
  if (!overlay) return;

  const isOverlayVisible = overlay.style.display === "flex";
  const clickedOnBackground = event.target === overlay;

  if (isOverlayVisible && clickedOnBackground) {
    closeTaskCard();
  }
});

let moveMenuElement = null;
let moveMenuTaskId = null;

function openMoveMenu(taskId, button) {
  ensureMoveMenuElement();
  if (!moveMenuElement) return;

  moveMenuTaskId = taskId;
  attachMoveMenuHandlers();

  positionMoveMenu(button);
  showMoveMenu();
}

function ensureMoveMenuElement() {
  moveMenuElement = document.querySelector(".move-menu");
}

function attachMoveMenuHandlers() {
  const upBtn = moveMenuElement.querySelector("[data-move='up']");
  const downBtn = moveMenuElement.querySelector("[data-move='down']");

  if (upBtn) {
    upBtn.onclick = onMoveUpClick;
  }
  if (downBtn) {
    downBtn.onclick = onMoveDownClick;
  }
}

function positionMoveMenu(button) {
  const rect = button.getBoundingClientRect();
  moveMenuElement.style.top = rect.bottom + window.scrollY + "px";
  moveMenuElement.style.left = rect.right + window.scrollX - 120 + "px";
}

function showMoveMenu() {
  moveMenuElement.classList.add("move-menu--open");
}

function closeMoveMenu() {
  if (!moveMenuElement) return;
  moveMenuElement.classList.remove("move-menu--open");
  moveMenuTaskId = null;
}

function onMoveUpClick() {
  moveTaskOneStep("up");
}

function onMoveDownClick() {
  moveTaskOneStep("down");
}

function moveTaskOneStep(direction) {
  if (!moveMenuTaskId) return;

  const index = findTaskIndexById(moveMenuTaskId);
  if (index === -1) return;

  const status = normalizeTaskStatus(tasks[index].status);
  const neighborIndex = findNeighborIndex(index, status, direction);
  if (neighborIndex === -1) return;

  swapTasks(index, neighborIndex);
  renderBoard();
}

function findNeighborIndex(index, status, direction) {
  const step = direction === "up" ? -1 : 1;
  let i = index + step;

  while (i >= 0 && i < tasks.length) {
    if (normalizeTaskStatus(tasks[i].status) === status) {
      return i;
    }
    i += step;
  }

  return -1;
}

function swapTasks(i, j) {
  const tmp = tasks[i];
  tasks[i] = tasks[j];
  tasks[j] = tmp;
}

document.addEventListener("click", function (event) {
  if (!moveMenuElement || !moveMenuElement.classList.contains("move-menu--open")) {
    return;
  }

  const clickInsideMenu = moveMenuElement.contains(event.target);
  const clickOnMoveBtn = event.target.closest(".card-move-btn");

  if (!clickInsideMenu && !clickOnMoveBtn) {
    closeMoveMenu();
  }
});

window.addEventListener("scroll", closeMoveMenu);
window.addEventListener("resize", closeMoveMenu);
