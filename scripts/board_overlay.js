function onTaskCardClick(event) {
  if (handleMoveButtonClick(event)) return;
  handleTaskCardOpen(event);
}

function handleMoveButtonClick(event) {
  const moveBtn = event.target.closest(".card-move-btn");
  if (!moveBtn) return false;

  event.stopPropagation();
  event.preventDefault();

  const card = moveBtn.closest(".card-task");
  if (!card) return false;

  const taskId = card.dataset.taskId;
  if (!taskId) return false;

  openMoveMenu(taskId, moveBtn);
  return true;
}

function handleTaskCardOpen(event) {
  const card = event.target.closest(".card-task");
  if (!card) return;

  const taskId = card.dataset.taskId;
  if (!taskId) return;

  openTaskCard(taskId);
}

function getOverlayElements() {
  const overlay = document.querySelector(".overlay-task-card");
  const content = document.getElementById("taskCardContent");
  return { overlay, content };
}

function createConfirmOverlay() {
  const overlay = document.createElement("div");
  overlay.className = "confirm-overlay confirm-overlay--open";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  return overlay;
}

function createConfirmDialog(message) {
  const dialog = document.createElement("div");
  dialog.className = "confirm-dialog";
  dialog.innerHTML = `
    <h3 class="confirm-dialog__title">Confirm</h3>
    <p class="confirm-dialog__message">
      ${message || "Are you sure?"}
    </p>
    <div class="confirm-dialog__actions">
      <button type="button" class="confirm-dialog__button confirm-dialog__button--cancel">
        Cancel
      </button>
      <button type="button" class="confirm-dialog__button confirm-dialog__button--confirm">
        Delete
      </button>
    </div>
  `;
  return dialog;
}

function focusCancelButton(dialog) {
  const cancelBtn = dialog.querySelector(".confirm-dialog__button--cancel");
  if (cancelBtn) cancelBtn.focus();
}

function attachConfirmKeydown(cleanup) {
  const handler = (event) => {
    if (event.key === "Escape") {
      document.removeEventListener("keydown", handler);
      cleanup(false);
    }
  };
  document.addEventListener("keydown", handler);
}

function setupConfirmEvents(overlay, dialog, resolve) {
  const cancelBtn = dialog.querySelector(".confirm-dialog__button--cancel");
  const confirmBtn = dialog.querySelector(".confirm-dialog__button--confirm");

  const cleanup = (result) => {
    overlay.remove();
    resolve(result);
  };

  cancelBtn.addEventListener("click", () => cleanup(false));
  confirmBtn.addEventListener("click", () => cleanup(true));

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) cleanup(false);
  });

  attachConfirmKeydown(cleanup);
}

function showConfirmPopup(message) {
  return new Promise((resolve) => {
    const overlay = createConfirmOverlay();
    const dialog = createConfirmDialog(message);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    focusCancelButton(dialog);
    setupConfirmEvents(overlay, dialog, resolve);
  });
}

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

document.addEventListener("click", (event) => {
  const { overlay } = getOverlayElements();
  if (!overlay) return;
  if (event.target === overlay) closeTaskCard();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeTaskCard();
    closeMoveMenu();
  }
});

function onTaskEditClick(taskId) {
  const { overlay, content } = getOverlayElements();
  if (!overlay || !content) return;

  const task = tasks.find((t) => String(t.id) === String(taskId));
  if (!task) return;

  content.innerHTML = taskCardEditTemplate(task);
  removeMinDate();
  initEditAssignedSection(task, content);
}

function initEditAssignedSection(task, content) {
  setTimeout(() => {
    try {
      updateSelectedAssignees(task);
      initAssignedToInEdit(content);
      hideAssignedDropdown(content);
    } catch (error) {
      console.error("onTaskEditClick: initAssignedTo failed", error);
    }
  }, 0);
}

function updateSelectedAssignees(task) {
  if (!Array.isArray(task.assignedTo)) return;
  if (typeof selectedAssignees === "undefined") return;

  const ids = task.assignedTo
    .map((entry) => normalizeAssigneeId(entry))
    .filter(Boolean);

  selectedAssignees = ids;
}

function normalizeAssigneeId(entry) {
  if (!entry) return null;

  if (typeof entry === "string") {
    const contact = contacts.find((c) => c.name === entry || c.id === entry);
    return contact ? contact.id : null;
  }

  if (typeof entry === "object") {
    if (entry.id) return entry.id;
    const contact = contacts.find((c) => c.name === entry.name);
    return contact ? contact.id : null;
  }

  return null;
}

function initAssignedToInEdit(content) {
  if (typeof initAssignedToScoped === "function") {
    initAssignedToScoped(content);
    return;
  }
  if (typeof initAssignedTo === "function") {
    initAssignedTo();
  }
}

function hideAssignedDropdown(content) {
  const dropdown = content.querySelector(".assigned-to-dropdown");
  if (dropdown) dropdown.style.display = "none";
}

function onTaskEditCancel(taskId) {
  openTaskCard(taskId);
}

function buildTaskUpdatePayload(formData) {
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const dueDate = String(formData.get("dueDate") || "").trim();
  const priorityRaw = String(formData.get("priority") || "Medium").trim();
  return { title, description, dueDate, priorityRaw };
}

function isEditPayloadValid(payload) {
  if (!payload.title) {
    alert("Title is required.");
    return false;
  }
  return true;
}

function findTaskIndexById(taskId) {
  return tasks.findIndex((task) => String(task.id) === String(taskId));
}

function createUpdatedTask(oldTask, payload) {
  const assignedTo =
    typeof getAssignedTo === "function"
      ? getAssignedTo()
      : oldTask.assignedTo;

  return {
    ...oldTask,
    title: payload.title,
    description: payload.description,
    dueDate: payload.dueDate,
    priority: normalizePriority(payload.priorityRaw),
    assignedTo,
  };
}

async function persistEditedTask(updatedTask, index, taskId) {
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

async function onTaskEditSave(event, taskId) {
  event.preventDefault();

  const form = event.target;
  if (!form) return;

  const formData = new FormData(form);
  const payload = buildTaskUpdatePayload(formData);
  if (!isEditPayloadValid(payload)) return;

  const index = findTaskIndexById(taskId);
  if (index === -1) return;

  const updatedTask = createUpdatedTask(tasks[index], payload);
  await persistEditedTask(updatedTask, index, taskId);
}

function onEditPriorityClick(event) {
  const button = event.currentTarget;
  const wrapper = button.closest(".priority-buttons");
  if (!wrapper) return;

  const buttons = wrapper.querySelectorAll(".priority-buttons__button");
  buttons.forEach((btn) => btn.classList.remove("is-active"));

  button.classList.add("is-active");

  const hidden = wrapper.querySelector('input[name="priority"]');
  if (hidden) hidden.value = button.dataset.priority || "Medium";
}

async function onOverlayDeleteClick(taskId) {
  const confirmed = await showConfirmPopup(
    "Do you really want to delete this task?"
  );
  if (!confirmed) return;

  await deleteTask(taskId);
}

async function deleteTask(taskId) {
  try {
    await deleteTaskById(taskId);

    tasks = tasks.filter(
      (task) =>
        String(task.id) !== String(taskId) &&
        String(task.firebaseId) !== String(taskId)
    );

    closeTaskCard();
    renderBoard();
  } catch (error) {
    console.error("onOverlayDeleteClick: error deleting task", error);
    alert("Error while deleting the task.");
  }
}

function getClonedSubtasks(task) {
  return Array.isArray(task.subtasks) ? [...task.subtasks] : [];
}

function createUpdatedSubtask(subtask, checked) {
  const done = !!checked;
  return { ...subtask, done, checked: done };
}

async function persistSubtaskUpdate(updatedTask, index) {
  try {
    await saveTask(updatedTask);
    tasks[index] = updatedTask;
    renderBoard();
  } catch (error) {
    console.error("onSubtaskToggle: error saving subtask state", error);
  }
}

async function onSubtaskToggle(taskId, index, checked) {
  const taskIndex = findTaskIndexById(taskId);
  if (taskIndex === -1) return;

  const task = tasks[taskIndex];
  const subtasks = getClonedSubtasks(task);
  if (!subtasks[index]) return;

  subtasks[index] = createUpdatedSubtask(subtasks[index], checked);
  const updatedTask = { ...task, subtasks };

  await persistSubtaskUpdate(updatedTask, taskIndex);
}
