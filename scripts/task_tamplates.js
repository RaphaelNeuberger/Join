//task_templates
function noTaskTemplate() {
  return (
    '<div class="card-no-task">' + "<span>No tasks To do</span>" + "</div>"
  );
}

function noResultsTemplate() {
  return (
    '<div class="card-no-task">' +
    '<span>No results found</span>' +
    '</div>'
  );
}

const AVATAR_COLORS = [
  "rgb(110, 82, 255)",
  "rgb(253, 112, 255)",
  "rgb(70, 47, 138)",
  "rgb(255, 188, 43)",
  "rgb(30, 214, 193)",
  "rgb(255, 123, 0)",
];

function getInitials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => (part[0] || "").toUpperCase())
    .join("");
}

function getAvatarColor(name = "", index = 0) {
  if (!AVATAR_COLORS.length) {
    return "#ff7a00";
  }

  const nameStr = String(name || "");
  const hash = nameStr
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);

  const colorIndex = (hash + index) % AVATAR_COLORS.length;
  return AVATAR_COLORS[colorIndex];
}

function renderAssignees(assignees = []) {
  if (!Array.isArray(assignees)) {
    assignees = assignees ? [assignees] : [];
  }

  return assignees
    .map((item, index) => {
      // Handle both string names and objects with name property
      const name = typeof item === "string" ? item : item?.name || "";
      const color = getAvatarColor(name, index);
      const initials = getInitials(name);

      return (
        '<span class="assigned-avatar" style="background-color: ' +
        color +
        ';">' +
        initials +
        "</span>"
      );
    })
    .join("");
}

function taskTemplate(task) {
  const { id, category, title, description, assignedTo, priority, subtasks } =
    task;
  return `
    <div class="card-task" draggable="true"
         ondragstart="dragstartHandler(event)"
         data-task-id="${id}"
         onclick="openTaskCardById('${id}')">

      <p class="card-type">${category || ""}</p>

      <span class="card-title">${title || ""}</span>
      <p class="story">${description || ""}</p>

      ${subtaskProgressHTML(subtasks)}

      <div class="card-footer">
        <div class="assigned-list">${renderAssignees(assignedTo)}</div>
        <div class="priority">${priorityIcon(priority)}</div> <!-- ICON-ONLY -->
      </div>
    </div>`;
}

// Datum für Anzeige im Overlay von YYYY-MM-DD zu DD/MM/YY
function formatDateToDDMMYY(dateStr) {
  if (!dateStr) return "-";
  const parts = String(dateStr).split("-");
  if (parts.length !== 3) return dateStr;
  const [y, m, d] = parts;
  const yy = y.slice(2);
  return `${d}/${m}/${yy}`;
}

function taskCardContentTemplate(task) {
  const dueDate = task.dueDate || "-";
  const cat = task.category || "Category";

  return `
    <div class="task-card-header">
      <div class="task-card-header-category-close">
        <div class="task-card-category">${escapeHtml(cat)}</div>
        <span class="task-card-close" onclick="closeTaskCard()">X</span>
      </div>
      <h1>${escapeHtml(task.title || "")}</h1>
    </div>

    <div class="task-card-body">
      <p class="task-card-story">${escapeHtml(task.description || "")}</p>

      <table>
        <tr>
          <td><strong>Due date:</strong></td>
          <td>${formatDateToDDMMYY(dueDate)}</td>
        </tr>
        <tr>
          <td><strong>Priority:</strong></td>
          <td class="prio-cell">
            <span class="prio-text">${normalizePriority(task.priority)}</span>
            ${priorityIcon(task.priority)}
          </td>
        </tr>
      </table>

      <label class="overlay-task-card-label-big">Assigned To</label>
      <div class="assigned-list-detail">
        ${renderAssigneesDetail(task.assignedTo || [])}
      </div>

      <p class="overlay-task-card-label-big">Subtasks</p>
      <ul class="subtask-list-detail">
        ${renderSubtasksDetail(task.subtasks || [], task.id)}
      </ul>

      <div class="task-card-footer">
        <button onclick="onTaskEditClick('${task.id}')">
          <img
            src="./img/icons/edit.svg"
            alt="Edit"
            class="task-card-footer-icon"
          />
          Edit
        </button>
        <button onclick="onOverlayDeleteClick('${task.id}')">
          <img
            src="./img/icons/delete.svg"
            alt="Delete"
            class="task-card-footer-icon"
          />
          Delete
        </button>
      </div>
    </div>`;
}

function taskCardEditTemplate(task) {
  const priority = (task.priority || "medium").toLowerCase();
  const dueDate = task.dueDate || "";

  const urgentActive = priority === "urgent" ? " is-active" : "";
  const mediumActive = priority === "medium" ? " is-active" : "";
  const lowActive = priority === "low" ? " is-active" : "";

  return `
    <form class="task-card-edit-form" onsubmit="onTaskEditSave(event, '${task.id}')">
      <div class="task-card-header">
        <div class="task-card-header-category-close">
          <div class="task-card-category">
            ${escapeHtml(task.category || "Category")}
          </div>
          <span class="task-card-close" onclick="onTaskEditCancel('${task.id}')">X</span>
        </div>
        <input
          type="text"
          name="title"
          class="form-group__input"
          placeholder="Enter a title"
          value="${escapeHtml(task.title || "")}"
          required
        />
      </div>

      <div class="task-card-body">
        <div class="form-group">
          <label class="form-group__label">Description</label>
          <textarea
            name="description"
            class="form-group__textarea"
            rows="4"
            placeholder="Enter a description"
          >${escapeHtml(task.description || "")}</textarea>
        </div>

        <div class="form-group">
          <label class="form-group__label">Due date</label>
          <input
            type="date"
            name="dueDate"
            class="form-group__input form-group__input--date"
            value="${escapeHtml(dueDate)}"
          />
        </div>

        <div class="form-group">
          <label class="form-group__label">Priority</label>
          <div class="priority-buttons">
            <button
              type="button"
              class="priority-buttons__button priority-buttons__button--urgent${urgentActive}"
              data-priority="Urgent"
              onclick="onEditPriorityClick(event)"
            >
              Urgent
            </button>
            <button
              type="button"
              class="priority-buttons__button priority-buttons__button--medium${mediumActive}"
              data-priority="Medium"
              onclick="onEditPriorityClick(event)"
            >
              Medium
            </button>
            <button
              type="button"
              class="priority-buttons__button priority-buttons__button--low${lowActive}"
              data-priority="Low"
              onclick="onEditPriorityClick(event)"
            >
              Low
            </button>
            <input type="hidden" name="priority" value="${priority}" />
          </div>
        </div>

        <div class="overlay-task-card-section">
          <p class="overlay-task-card-label-big">Assigned To:</p>
          <div class="assigned-list-detail">
            ${renderAssigneesDetail(task.assignedTo || [])}
          </div>
        </div>

        <div class="overlay-task-card-section">
          <p class="overlay-task-card-label-big">Subtasks</p>
          <ul class="subtask-list-detail">
            ${renderSubtasksDetail(task.subtasks || [], task.id)}
          </ul>
        </div>
      </div>

      <div class="task-card-footer">
        <button type="button"
                class="overlay-task-card-delete"
                onclick="onTaskEditCancel('${task.id}')">
          Cancel
        </button>
        <button type="submit"
                class="overlay-task-card-edit">
          Ok ✓
        </button>
      </div>
    </form>
  `;
}

function renderSubtasksDetail(list, taskId) {
  if (!list || !list.length) {
    return '<li class="subtask-item"><span class="subtask-title">No subtasks</span></li>';
  }

  return list
    .map(function (s, index) {
      const checked = s.done === true || s.checked === true ? "checked" : "";
      return (
        '<li class="subtask-item">' +
          '<label class="subtask-checkbox">' +
            '<input type="checkbox" ' +
              checked +
              ' onchange="onSubtaskToggle(\'' + taskId + '\',' + index + ', this.checked)" />' +
            '<span class="subtask-custom-box"></span>' +
            '<span class="subtask-title">' +
              escapeHtml(s.title || "") +
            "</span>" +
          "</label>" +
        "</li>"
      );
    })
    .join("");
}

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

    // Overlay-Subtasks neu zeichnen
    const content = document.getElementById("taskCardContent");
    if (content) {
      const listEl = content.querySelector(".subtask-list-detail");
      if (listEl) {
        listEl.innerHTML = renderSubtasksDetail(
          updatedTask.subtasks || [],
          updatedTask.id
        );
      }
    }
  } catch (err) {
    console.error("onSubtaskToggle error:", err);
    alert("Subtask konnte nicht gespeichert werden.");
  }
}


function taskCardEditTemplate(task) {
  const priority = (task.priority || "medium").toLowerCase();
  const dueDate = task.dueDate || "/";

  const urgentActive = priority === "urgent" ? " is-active" : "";
  const mediumActive = priority === "medium" ? " is-active" : "";
  const lowActive = priority === "low" ? " is-active" : "";

  return `
    <form class="task-card-edit-form" onsubmit="onTaskEditSave(event, '${task.id}')">

  <!-- FIXED HEADER -->
  <div class="task-edit-header">
    <div class="task-card-header-category-close">
      <div class="task-card-category">${escapeHtml(task.category || "Category")}</div>
      <span class="task-card-close" onclick="onTaskEditCancel('${task.id}')">X</span>
    </div>
    <input type="text" name="title" class="form-group__input"
      placeholder="Enter a title" value="${escapeHtml(task.title || "")}" required />
  </div>

  <!-- SCROLLABLE CONTENT -->
  <div class="task-edit-scroll">
    <div class="form-group">
      <label class="form-group__label">Description</label>
      <textarea name="description" class="form-group__textarea" rows="4"
      placeholder="Enter a description">${escapeHtml(task.description || "")}</textarea>
    </div>

    <div class="form-group">
      <label class="form-group__label">Due date</label>
      <input type="date" name="dueDate"
             class="form-group__input form-group__input--date"
             value="${escapeHtml(task.dueDate || "")}">
    </div>

    <div class="form-group">
      <label class="form-group__label">Priority</label>
      <div class="priority-buttons">
        <button type="button" class="priority-buttons__button priority-buttons__button--urgent${urgentActive}"
          data-priority="Urgent" onclick="onEditPriorityClick(event)">Urgent</button>
        <button type="button" class="priority-buttons__button priority-buttons__button--medium${mediumActive}"
          data-priority="Medium" onclick="onEditPriorityClick(event)">Medium</button>
        <button type="button" class="priority-buttons__button priority-buttons__button--low${lowActive}"
          data-priority="Low" onclick="onEditPriorityClick(event)">Low</button>
        <input type="hidden" name="priority" value="${priority}" />
      </div>
    </div>

    <div class="overlay-task-card-section">
      <p class="overlay-task-card-label-big">Assigned To:</p>
      <div class="assigned-list-detail">${renderAssigneesDetail(task.assignedTo || [])}</div>
    </div>

    <div class="overlay-task-card-section">
      <p class="overlay-task-card-label-big">Subtasks</p>
      <ul class="subtask-list-detail">${renderSubtasksDetail(task.subtasks || [], task.id)}</ul>
    </div>
  </div>

  <!-- FIXED FOOTER -->
  <div class="task-edit-footer">
    <button type="button" class="overlay-task-card-delete" onclick="onTaskEditCancel('${task.id}')">Cancel</button>
    <button type="submit" class="overlay-task-card-edit">Ok ✓</button>
  </div>

</form>

  `;
}

function capitalize(str) {
  if (!str) return "";
  str = String(str);
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function renderAssigneesDetail(list) {
  if (!list || !list.length) {
    return '<span class="assigned-name">No assignees</span>';
  }
  return list
    .map(function (item) {
      // Handle both string names and objects with name property
      const name = typeof item === "string" ? item : item?.name || "";
      return (
        '<div class="assigned-item">' +
        '<div class="assigned-avatar-detail assigned-avatar--blue">' +
        getInitialsFromName(name) +
        "</div>" +
        '<span class="assigned-name">' +
        escapeHtml(name) +
        "</span>" +
        "</div>"
      );
    })
    .join("");
}

function renderSubtasksDetail(list, taskId) {
  if (!list || !list.length) {
    return '<li class="subtask-item"><span class="subtask-title">No subtasks</span></li>';
  }

  return list
    .map(function (s, index) {
      const checked = s.done === true || s.checked === true ? 'checked' : '';
      return (
        '<li class="subtask-item">' +
          '<label class="subtask-checkbox">' +
            '<input type="checkbox" ' +
              checked +
              ' onchange="onSubtaskToggle(\'' + taskId + '\',' + index + ', this.checked)" />' +
            '<span class="subtask-custom-box"></span>' +
            '<span class="subtask-title">' +
              escapeHtml(s.title || "") +
            "</span>" +
          "</label>" +
        "</li>"
      );
    })
    .join("");
}


function getInitialsFromName(name) {
  var parts = String(name).trim().split(" ");
  if (!parts.length) return "";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (
    parts[0].charAt(0).toUpperCase() +
    parts[parts.length - 1].charAt(0).toUpperCase()
  );
}

function normalizePriority(p) {
  const v = String(p || "Medium").toLowerCase();
  if (v.startsWith("u")) return "Urgent";
  if (v.startsWith("l")) return "Low";
  return "Medium";
}

function priorityIcon(priority) {
  const p = normalizePriority(priority);
  const color = priorityColor(p);
  // style color auf dem wrapper (SVGs nutzen currentColor)
  return `<span class="prio-icon" aria-label="${p}" title="${p}" style="color: ${color};">${priorityIconSVG(
    p
  )}</span>`;
}

function priorityIconSVG(priority) {
  const p = normalizePriority(priority);

  // URGENT: Doppel-Chevron ↑↑
  if (p === "Urgent") {
    return `
      <svg width="20" height="16" viewBox="0 0 20 16" aria-hidden="true">
        <polyline points="3,12 10,5 17,12"
          fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round"/>
        <polyline points="3,8 10,1 17,8"
          fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`;
  }

  // LOW: Doppel-Chevron ↓↓
  if (p === "Low") {
    return `
      <svg width="20" height="16" viewBox="0 0 20 16" aria-hidden="true">
        <polyline points="3,4 10,11 17,4"
          fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round"/>
        <polyline points="3,8 10,15 17,8"
          fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`;
  }

  // MEDIUM: zwei Balken ‖
  return `
    <svg width="20" height="12" viewBox="0 0 20 12" aria-hidden="true">
      <rect x="2" y="3" width="16" height="2" rx="1" fill="currentColor"/>
      <rect x="2" y="7" width="16" height="2" rx="1" fill="currentColor"/>
    </svg>`;
}

function priorityBadge(priority, withText = true) {
  const p = normalizePriority(priority);
  const cls = p === "Urgent" ? "urgent" : p === "Low" ? "low" : "medium";
  const color = priorityColor(p);
  const txt = withText ? `<span class="priority-badge__text">${p}</span>` : "";
  return `<span class="priority-badge priority-badge--${cls}" title="${p}" style="color: ${color}; display:inline-flex; align-items:center; gap:6px;">${priorityIconSVG(
    p
  )}${txt}</span>`;
}

function subtaskProgressHTML(subtasks) {
  const list = Array.isArray(subtasks) ? subtasks : [];
  if (!list.length) return "";
  const done = list.filter(
    (s) => s && (s.done === true || s.checked === true)
  ).length;
  const total = list.length;
  const pct = Math.round((done / total) * 100);
  return `
    <div class="subtask-progress">
      <div class="subtask-progress__bar"><div style="width:${pct}%"></div></div>
      <span class="subtask-progress__text">${done}/${total} Subtasks</span>
    </div>`;
}

function priorityColor(priority) {
  const p = normalizePriority(priority);
  if (p === "Urgent") return "#ff3d00";
  if (p === "Low") return "#5be84a";
  return "#ffab2b";
}

