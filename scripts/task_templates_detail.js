// scripts/task_templates_detail.js
// Overlay templates for task card view and edit modes

/**
 * Overlay "Task-View" (Read mode)
 */
function taskCardContentTemplate(task) {
  const dueDate = task.dueDate || "-";
  const cat = task.category || "Category";

  return `
    <div class="task-card-header">
      <div class="task-card-header-category-close">
        <div class="task-card-category">${escapeHtml(cat)}</div>
        <span class="task-card-close" onclick="closeTaskCard()">X</span>
      </div>
      <h2>${escapeHtml(task.title || "")}</h2>
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
            class="task-card-footer-icon" />
          Edit
        </button>
        <button onclick="onOverlayDeleteClick('${task.id}')">
          <img
            src="./img/icons/delete.svg"
            alt="Delete"
            class="task-card-footer-icon" />
          Delete
        </button>
      </div>
    </div>`;
}

/**
 * Overlay "Task-Edit" (Edit mode)
 */
function taskCardEditTemplate(task) {
  const priority = (task.priority || "medium").toLowerCase();
  const dueDate = task.dueDate || "";

  const urgentActive = priority === "urgent" ? " is-active" : "";
  const mediumActive = priority === "medium" ? " is-active" : "";
  const lowActive = priority === "low" ? " is-active" : "";

  return `
    <form class="task-card-edit-form" onsubmit="onTaskEditSave(event, '${
      task.id
    }')">
      <div class="task-card-header">
        <div class="task-card-header-category-close">
          <div class="task-card-category">
            ${escapeHtml(task.category || "Category")}
          </div>
          <span class="task-card-close" onclick="onTaskEditCancel('${
            task.id
          }')">X</span>
        </div>
      </div>

      <div class="task-card-body">
        <div class="form-group">
          <label class="form-group__label">Title</label>
          <input
            type="text"
            name="title"
            class="form-group__input"
            placeholder="Enter a title"
            value="${escapeHtml(task.title || "")}"
          />
        </div>

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
        <button
          type="button"
          class="overlay-task-card-delete"
          onclick="onTaskEditCancel('${task.id}')">
          Cancel
        </button>
        <button
          type="submit"
          class="overlay-task-card-edit">
          Ok ✓
        </button>
      </div>
    </form>
  `;
}

/**
 * Detail view for assignees in overlay
 */
function renderAssigneesDetail(list) {
  if (!list || !list.length) {
    return '<span class="assigned-name">No assignees</span>';
  }

  return list
    .map(function (item, index) {
      const name = typeof item === "string" ? item : item?.name || "";
      const color = getAvatarColor(name, index);
      const initials = getInitials(name);

      return (
        '<div class="assigned-item">' +
        '<div class="assigned-avatar-detail" style="background-color:' +
        color +
        '">' +
        initials +
        "</div>" +
        '<span class="assigned-name">' +
        escapeHtml(name) +
        "</span>" +
        "</div>"
      );
    })
    .join("");
}

/**
 * Subtask list in overlay
 */
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
        " onchange=\"onSubtaskToggle('" +
        taskId +
        "'," +
        index +
        ', this.checked)" />' +
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
