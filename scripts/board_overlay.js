function onTaskCardClick(event) {
  const moveBtn = event.target.closest(".card-move-btn");
  if (moveBtn) {
    try {
      event.stopPropagation();
      event.preventDefault();
    } catch (e) {
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

function getOverlayElements() {
  const overlay = document.querySelector(".overlay-task-card");
  const content = document.getElementById("taskCardContent");
  return { overlay, content };
}

function showConfirmPopup(message) {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "confirm-overlay confirm-overlay--open";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");

    const dialog = document.createElement("div");
    dialog.className = "confirm-dialog";

    const title = document.createElement("h3");
    title.className = "confirm-dialog__title";
    title.textContent = "Confirm";

    const msg = document.createElement("p");
    msg.className = "confirm-dialog__message";
    msg.textContent = message || "Are you sure?";

    const actions = document.createElement("div");
    actions.className = "confirm-dialog__actions";

    const btnCancel = document.createElement("button");
    btnCancel.type = "button";
    btnCancel.className = "confirm-dialog__button confirm-dialog__button--cancel";
    btnCancel.textContent = "Cancel";

    const btnConfirm = document.createElement("button");
    btnConfirm.type = "button";
    btnConfirm.className = "confirm-dialog__button confirm-dialog__button--confirm";
    btnConfirm.textContent = "Delete";

    actions.appendChild(btnCancel);
    actions.appendChild(btnConfirm);

    dialog.appendChild(title);
    dialog.appendChild(msg);
    dialog.appendChild(actions);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    btnCancel.focus();

    function cleanup(result) {
      try {
        overlay.remove();
      } catch (e) {}
      resolve(result);
    }

    btnCancel.addEventListener("click", () => cleanup(false));
    btnConfirm.addEventListener("click", () => cleanup(true));

    overlay.addEventListener("click", (ev) => {
      if (ev.target === overlay) cleanup(false);
    });

    document.addEventListener(
      "keydown",
      function onKey(e) {
        if (e.key === "Escape") {
          document.removeEventListener("keydown", onKey);
          cleanup(false);
        }
      },
      { once: true }
    );
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

document.addEventListener("click", function (event) {
  const { overlay } = getOverlayElements();
  if (!overlay) return;

  if (event.target === overlay) {
    closeTaskCard();
  }
});

document.addEventListener("keydown", function (event) {
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
  
  // Initialize Assigned-To controls after injecting the HTML
  // Use a short timeout so DOM is updated before initialization
  setTimeout(() => {
    try {
      if (Array.isArray(task.assignedTo) && typeof selectedAssignees !== "undefined") {
        const ids = (task.assignedTo || [])
          .map((a) => {
            if (!a) return null;
            if (typeof a === "string") {
              const c = contacts.find((x) => x.name === a || x.id === a);
              return c ? c.id : null;
            }
            if (typeof a === "object") {
              if (a.id) return a.id;
              const c = contacts.find((x) => x.name === a.name);
              return c ? c.id : null;
            }
            return null;
          })
          .filter(Boolean);

        selectedAssignees = ids;
      }

      if (typeof initAssignedToScoped === "function") {
        initAssignedToScoped(content);
      } else if (typeof initAssignedTo === "function") {
        initAssignedTo();
      }
      const dd = content.querySelector('.assigned-to-dropdown');
      if (dd) dd.style.display = 'none';
    } catch (err) {
      console.error("onTaskEditClick: initAssignedTo failed", err);
    }
  }, 0);
}

function onTaskEditCancel(taskId) {
  openTaskCard(taskId);
}

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
    assignedTo: typeof getAssignedTo === "function" ? getAssignedTo() : oldTask.assignedTo,
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

async function onOverlayDeleteClick(taskId) {
  const confirmDelete = await showConfirmPopup(
    "Do you really want to delete this task?"
  );
  if (!confirmDelete) return;

  try {
    await deleteTaskById(taskId);

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

let moveMenuElement = null;

function ensureMoveMenuElement() {
  if (moveMenuElement) return moveMenuElement;

  const el = document.createElement("div");
  el.className = "card-move-menu";
  el.innerHTML = `
    <div class="card-move-menu__inner">
      <p class="card-move-menu__title">Move task:</p>
      <div class="card-move-menu__options"></div>
    </div>
  `;
  document.body.appendChild(el);
  moveMenuElement = el;

  return moveMenuElement;
}

function createMoveMenuOption(container, arrow, label, disabled, onClick) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "card-move-menu__option";
  button.disabled = disabled;
  button.innerHTML =
    '<span class="card-move-menu__arrow">' +
    arrow +
    "</span>" +
    "<span>" +
    label +
    "</span>";
  if (!disabled) {
    button.addEventListener("click", onClick);
  }
  container.appendChild(button);
}

function openMoveMenu(taskId, anchorEl) {
  if (window.innerWidth >= 1024) return;

  const menu = ensureMoveMenuElement();
  const optionsContainer = menu.querySelector(".card-move-menu__options");
  if (!optionsContainer) return;

  if (menu.style.display === "block" && String(currentMoveTaskId) === String(taskId)) {
    closeMoveMenu();
    return;
  }

  currentMoveTaskId = taskId;

  const globalIndex = tasks.findIndex((t) => String(t.id) === String(taskId));
  if (globalIndex === -1) return;

  const task = tasks[globalIndex];
  const status = normalizeTaskStatus(task.status);
  const order = Array.isArray(BOARD_STATUS_ORDER) ? BOARD_STATUS_ORDER : [];
  const labels =
    typeof BOARD_STATUS_LABELS === "object" ? BOARD_STATUS_LABELS : {};
  const statusIndex = order.indexOf(status);
  if (statusIndex === -1) return;

  const previousStatus = statusIndex > 0 ? order[statusIndex - 1] : null;
  const nextStatus =
    statusIndex < order.length - 1 ? order[statusIndex + 1] : null;

  optionsContainer.innerHTML = "";

  const prevLabel = previousStatus
    ? "Move to " + (labels[previousStatus] || "previous column")
    : "No previous column";
  const nextLabel = nextStatus
    ? "Move to " + (labels[nextStatus] || "next column")
    : "No next column";

  createMoveMenuOption(
    optionsContainer,
    "←",
    prevLabel,
    !previousStatus,
    function () {
      moveTaskToAdjacentColumn(taskId, "prev");
    }
  );

  createMoveMenuOption(
    optionsContainer,
    "→",
    nextLabel,
    !nextStatus,
    function () {
      moveTaskToAdjacentColumn(taskId, "next");
    }
  );

  const rect = anchorEl.getBoundingClientRect();
  const top = rect.bottom + window.scrollY + 6;
  const left = rect.left + window.scrollX;

  menu.style.top = top + "px";
  menu.style.left = left + "px";
  menu.style.display = "block";
}

function closeMoveMenu() {
  if (!moveMenuElement) return;
  moveMenuElement.style.display = "none";
}

async function moveTaskToAdjacentColumn(taskId, direction) {
  const index = tasks.findIndex((t) => String(t.id) === String(taskId));
  if (index === -1) return;

  const order = Array.isArray(BOARD_STATUS_ORDER) ? BOARD_STATUS_ORDER : [];
  const status = normalizeTaskStatus(tasks[index].status);
  const currentPosition = order.indexOf(status);
  if (currentPosition === -1) return;

  const offset = direction === "prev" ? -1 : 1;
  const targetStatus = order[currentPosition + offset];
  if (!targetStatus) return;

  try {
    await updateTaskStatus(taskId, targetStatus);
    closeMoveMenu();
    renderBoard();
  } catch (error) {
    console.error("moveTaskToAdjacentColumn: failed", error);
  }
}

document.addEventListener("click", function (event) {
  if (!moveMenuElement || moveMenuElement.style.display !== "block") return;

  const clickInsideMenu = moveMenuElement.contains(event.target);
  const clickOnMoveBtn = event.target.closest(".card-move-btn");

  if (!clickInsideMenu && !clickOnMoveBtn) {
    closeMoveMenu();
  }
});

window.addEventListener("scroll", closeMoveMenu);
window.addEventListener("resize", closeMoveMenu);
 