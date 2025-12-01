function noTaskTemplate() {
  return (
    '<div class="card-no-task">' +
    '<span>No tasks To do</span>' +
    '</div>'
  );
}

const AVATAR_COLORS = [
  'rgb(110, 82, 255)',
  'rgb(253, 112, 255)',
  'rgb(70, 47, 138)',
  'rgb(255, 188, 43)',
  'rgb(30, 214, 193)',
  'rgb(255, 123, 0)'
];

function getInitials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => (part[0] || '').toUpperCase())
    .join('');
}

function getAvatarColor(name = '', index = 0) {
  if (!AVATAR_COLORS.length) {
    return '#ff7a00';
  }

  const hash = name
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);

  const colorIndex = (hash + index) % AVATAR_COLORS.length;
  return AVATAR_COLORS[colorIndex];
}

function renderAssignees(assignees = []) {
  if (!Array.isArray(assignees)) {
    assignees = assignees ? [assignees] : [];
  }

  return assignees
    .map((name, index) => {
      const color = getAvatarColor(name, index);
      const initials = getInitials(name);

      return (
        '<span class="assigned-avatar" style="background-color: ' +
        color +
        ';">' +
        initials +
        '</span>'
      );
    })
    .join('');
}
function taskTemplate(task) {
  return `
    <div class="card-task"
         draggable="true"
         ondragstart="dragstartHandler(event)"
         data-task-id="${task.id}">
      <p class="card-type">${escapeHtml(task.category || '')}</p>
      <span class="card-title">${escapeHtml(task.title || '')}</span>
      <p class="story">${escapeHtml(task.description || '')}</p>
      <div class="card-footer">
        <div class="assigned-list">
          ${renderAssignees(task.assignedTo)}
        </div>
        <div class="priority">${String(task.priority || '').toLowerCase()}</div>
      </div>
    </div>
  `;
}

function taskCardContentTemplate(task) {
  const dueDate = task.dueDate || '-';
  const priority = (task.priority || 'medium').toLowerCase();

  return `
    <div class="task-card-header">
      <div class="task-card-header-category-close">
        <div class="task-card-category">
          ${escapeHtml(task.category || 'Category')}
        </div>
        <span class="task-card-close" onclick="closeTaskCard()">X</span>
      </div>
      <h1>${escapeHtml(task.title || '')}</h1>
    </div>

    <div class="task-card-body">
      <p class="task-card-story">
        ${escapeHtml(task.description || '')}
      </p>

      <table>
        <tr>
          <td>Due date:</td>
          <td>${escapeHtml(dueDate)}</td>
        </tr>
        <tr>
          <td>Priority:</td>
          <td>${capitalize(priority)}</td>
        </tr>
      </table>

      <div class="overlay-task-card-section">
        <p class="overlay-task-card-label-big">Assigned To:</p>
        <div class="assigned-list-detail">
          ${renderAssigneesDetail(task.assignedTo || [])}
        </div>
      </div>

      <div class="overlay-task-card-section">
        <p class="overlay-task-card-label-big">Subtasks</p>
        <ul class="subtask-list-detail">
          ${renderSubtasksDetail(task.subtasks || [])}
        </ul>
      </div>
    </div>

    <div class="task-card-footer">
      <button class="overlay-task-card-delete"
              onclick="onOverlayDeleteClick('${task.id}')">
        Delete
      </button>
      <button class="overlay-task-card-edit"
              onclick="onOverlayEditClick('${task.id}')">
        Edit
      </button>
    </div>
  `;
}

function taskCardEditTemplate(task) {
  const priority = (task.priority || 'medium').toLowerCase();
  const dueDate = task.dueDate || '';

  const urgentActive = priority === 'urgent' ? ' is-active' : '';
  const mediumActive = priority === 'medium' ? ' is-active' : '';
  const lowActive = priority === 'low' ? ' is-active' : '';

  return `
    <form class="task-card-edit-form" onsubmit="onTaskEditSave(event, '${task.id}')">
      <div class="task-card-header">
        <div class="task-card-header-category-close">
          <div class="task-card-category">
            ${escapeHtml(task.category || 'Category')}
          </div>
          <span class="task-card-close" onclick="onTaskEditCancel('${task.id}')">X</span>
        </div>
        <input
          type="text"
          name="title"
          class="form-group__input"
          placeholder="Enter a title"
          value="${escapeHtml(task.title || '')}"
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
          >${escapeHtml(task.description || '')}</textarea>
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
            ${renderSubtasksDetail(task.subtasks || [])}
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
          Save
        </button>
      </div>
    </form>
  `;
}







function capitalize(str) {
  if (!str) return '';
  str = String(str);
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function renderAssigneesDetail(list) {
  if (!list || !list.length) {
    return '<span class="assigned-name">No assignees</span>';
  }
  return list
    .map(function (name) {
      return (
        '<div class="assigned-item">' +
        '<div class="assigned-avatar-detail assigned-avatar--blue">' +
        getInitialsFromName(name) +
        '</div>' +
        '<span class="assigned-name">' +
        escapeHtml(name) +
        '</span>' +
        '</div>'
      );
    })
    .join('');
}

function renderSubtasksDetail(list) {
  if (!list || !list.length) {
    return '<li class="subtask-item"><span class="subtask-title">No subtasks</span></li>';
  }
  return list
    .map(function (s) {
      var checked = s.done ? 'checked' : '';
      return (
        '<li class="subtask-item">' +
        '<label class="subtask-checkbox">' +
        '<input type="checkbox" disabled ' +
        checked +
        ' />' +
        '<span class="subtask-custom-box"></span>' +
        '<span class="subtask-title">' +
        escapeHtml(s.title || '') +
        '</span>' +
        '</label>' +
        '</li>'
      );
    })
    .join('');
}

function getInitialsFromName(name) {
  var parts = String(name).trim().split(' ');
  if (!parts.length) return '';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (
    parts[0].charAt(0).toUpperCase() +
    parts[parts.length - 1].charAt(0).toUpperCase()
  );
}
