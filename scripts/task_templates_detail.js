/**
 * @fileoverview Task detail card templates for overlay view and edit
 * @module task_templates_detail
 */

/**
 * Generates HTML template for task card content view
 * @param {Object} task - The task object
 * @param {string} task.id - Task ID
 * @param {string} task.category - Task category
 * @param {string} task.title - Task title
 * @param {string} task.description - Task description
 * @param {string} task.dueDate - Task due date
 * @param {string} task.priority - Task priority
 * @param {Array} task.assignedTo - Assigned users
 * @param {Array} task.subtasks - Subtasks array
 * @returns {string} HTML string for task card content
 */
function taskCardContentTemplate(task) {
  const dueDate = task.dueDate || "-";
  const cat = task.category || "Category";
  const aiBadge = task.aiGenerated ? aiGeneratedLabelTemplate() : "";

  return `
    <div class="task-card-header">
      <div class="task-card-header-category-close">
        <div class="task-card-category-group">
          <div class="task-card-category">${escapeHtml(cat)}</div>
          ${aiBadge}
        </div>
        <span class="task-card-close" onclick="closeTaskCard()">X</span>
      </div>
      <h2>${escapeHtml(task.title || "")}</h2>
    </div>

    <div class="task-card-body">
      <p class="task-card-story">${escapeHtml(task.description || "")}</p>

      ${creatorRowTemplate(task.creator)}

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
 * Generates HTML template for task card edit form
 * @param {Object} task - The task object
 * @param {string} task.id - Task ID
 * @param {string} task.category - Task category
 * @param {string} task.title - Task title
 * @param {string} task.description - Task description
 * @param {string} task.dueDate - Task due date
 * @param {string} task.priority - Task priority
 * @param {Array} task.subtasks - Subtasks array
 * @returns {string} HTML string for task card edit form
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

        <div class="form-group">
          <label class="form-group__label">Assigned to</label>

          <div class="assigned-to-wrapper">
            <input
              id="assignedToInput"
              type="text"
              class="form-group__input assigned-to-input"
              placeholder="Select contacts to assign"
              autocomplete="off"
            />
            <span class="assigned-to-toggle" aria-hidden="true"></span>

            <div id="assignedToDropdown" class="assigned-to-dropdown">
              <ul id="assignedToList"></ul>
            </div>

            <div id="assignedToSelected" class="assigned-to-selected"></div>

            <input type="hidden" name="assignedTo" id="assignedToHidden" value="" />
          </div>
        </div>

        <div class="overlay-task-card-section">
          <p class="overlay-task-card-label-big">Subtasks</p>

          <div class="subtask-add-row">
            <input
              id="overlaySubtaskInput"
              type="text"
              class="form-group__input"
              placeholder="Add new subtask (press Enter or click +)"
              onkeydown="if(event.key==='Enter'){event.preventDefault(); onAddSubtaskFromOverlay('${task.id}')}"
            />
            <button type="button" class="subtask-add-btn" onclick="onAddSubtaskFromOverlay('${task.id}')">+</button>
          </div>

          <ul class="subtask-list-detail">
            ${renderSubtasksDetail(task.subtasks || [], task.id)}
          </ul>
        </div>
      </div>

      <div class="task-card-footer-edit">
        <button
          type="submit"
          class="edit-save-button">
          Ok<img src="./img/icons/check_white.svg" alt="">
        </button>
      </div>
    </form>
  `;
}

/**
 * Renders detailed assignee list with avatars and names
 * @param {Array} list - Array of assignee objects or strings
 * @returns {string} HTML string for assignee list
 */
function renderAssigneesDetail(list) {
  if (!list || !list.length) {
    return '<span class="assigned-name">No assignees</span>';
  }

  return list
    .map(function (item, index) {
      const name = typeof item === "string" ? item : item?.name || "";
      const avatarClass = item?.avatarClass || "";
      const initials = item?.initials || getInitials(name);

      let avatarHtml;
      if (avatarClass) {
        avatarHtml = '<div class="assigned-avatar-detail ' + avatarClass + '">' + initials + "</div>";
      } else {
        const color = getAvatarColor(name, index);
        avatarHtml = '<div class="assigned-avatar-detail" style="background-color:' + color + '">' + initials + "</div>";
      }

      return (
        '<div class="assigned-item">' +
        avatarHtml +
        '<span class="assigned-name">' +
        escapeHtml(name) +
        "</span>" +
        "</div>"
      );
    })
    .join("");
}

/**
 * Renders detailed subtask list with checkboxes
 * @param {Array} list - Array of subtask objects
 * @param {string} taskId - The parent task ID
 * @returns {string} HTML string for subtask list
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

/** @constant {RegExp} Accepts only plain email addresses for mailto links */
const CREATOR_EMAIL_PATTERN = /^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']{2,}$/;

/**
 * Label "Ai-generated ticket" next to the category (Figma task overlay v1).
 * @returns {string} HTML string
 */
function aiGeneratedLabelTemplate() {
  return `
    <span class="task-card-ai-label" title="Dieses Ticket wurde KI-generiert">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 20 15 9m-2-2 2 2M17 3v3m-1.5-1.5h3M20 9v2m-1-1h2M9 3v2M8 4h2"
          stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      </svg>
      Ai-generated ticket
    </span>`;
}

/**
 * Creator row of the task detail: badge (Member / Extern), name and a
 * contact link (internal -> contacts page, external -> email).
 * @param {{name?: string, email?: string, type?: string}} [creator] - Task creator
 * @returns {string} HTML string
 */
function creatorRowTemplate(creator) {
  const c = creator || { name: "Legacy", email: "", type: "internal" };
  const isExternal = c.type === "external";
  const badge = isExternal
    ? `<span class="creator-badge creator-badge--external">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/>
          <path d="M3 12h18M12 3c2.5 2.6 3.7 5.6 3.7 9s-1.2 6.4-3.7 9c-2.5-2.6-3.7-5.6-3.7-9S9.5 5.6 12 3Z"
            stroke="currentColor" stroke-width="2"/>
        </svg>Extern</span>`
    : `<span class="creator-badge creator-badge--internal">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="9" cy="8" r="3.5" stroke="currentColor" stroke-width="2"/>
          <path d="M2.5 19.5c.6-3.3 3.3-5.5 6.5-5.5s5.9 2.2 6.5 5.5M15.5 4.8a3.2 3.2 0 0 1 0 6.4M18 14.4c1.9.8 3.2 2.6 3.5 5.1"
            stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>Member</span>`;
  return `
    <div class="task-card-creator">
      <span class="task-card-creator__label">Creator:</span>
      ${badge}
      <span class="task-card-creator__name">${escapeHtml(c.name || "Legacy")}</span>
      ${creatorContactLinkTemplate(c, isExternal)}
    </div>`;
}

/**
 * Contact link right of the creator name.
 * @param {{email?: string}} creator - Normalized creator
 * @param {boolean} isExternal - True for stakeholders from the email collector
 * @returns {string} HTML string (empty when no valid target exists)
 */
function creatorContactLinkTemplate(creator, isExternal) {
  if (isExternal) {
    const email = String(creator.email || "");
    if (!CREATOR_EMAIL_PATTERN.test(email)) return "";
    return `
      <a class="task-card-creator__link" href="mailto:${encodeURIComponent(email)}"
        title="${escapeHtml(email)}">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" stroke-width="2"/>
          <path d="m4 7 8 6 8-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>E-mail</a>`;
  }
  return `
    <a class="task-card-creator__link" href="./contacts.html">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2"/>
        <path d="M4 20c.8-3.6 4-6 8-6s7.2 2.4 8 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>Profil</a>`;
}
