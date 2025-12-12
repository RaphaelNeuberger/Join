/**
 * @fileoverview Task card HTML templates for the board
 * @module task_templates
 */

/**
 * Returns HTML template for empty task column
 * @returns {string} HTML string
 */
function noTaskTemplate() {
  return (
    '<div class="card-no-task">' + "<span>No tasks To do</span>" + "</div>"
  );
}

/**
 * Returns HTML template for no search results
 * @returns {string} HTML string
 */
function noResultsTemplate() {
  return (
    '<div class="card-no-task">' + "<span>No results found</span>" + "</div>"
  );
}

/**
 * Renders assignee avatars HTML
 * @param {Array} [assignees=[]] - Array of assignee objects or strings
 * @returns {string} HTML string of assignee avatars
 */
function renderAssignees(assignees = []) {
  if (!Array.isArray(assignees)) {
    assignees = assignees ? [assignees] : [];
  }

  return assignees
    .map((item, index) => {
      const name = typeof item === "string" ? item : item?.name || "";
      const avatarClass = item?.avatarClass || "";
      const initials = item?.initials || getInitials(name);
      
      if (avatarClass) {
        return (
          '<span class="assigned-avatar ' +
          avatarClass +
          '">' +
          initials +
          "</span>"
        );
      }
      
      const color = getAvatarColor(name, index);
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

/**
 * Generates HTML template for a task card
 * @param {Object} task - The task object
 * @param {string} task.id - Task ID
 * @param {string} task.category - Task category
 * @param {string} task.title - Task title
 * @param {string} task.description - Task description
 * @param {Array} task.assignedTo - Assigned users
 * @param {string} task.priority - Task priority
 * @param {Array} task.subtasks - Subtasks array
 * @returns {string} HTML string for task card
 */
function taskTemplate(task) {
  const { id, category, title, description, assignedTo, priority, subtasks } =
    task;

  return `
    <div class="card-task"
         draggable="true"
         data-task-id="${escapeHtml(id)}">

      <div class="card-header-row">
        <p class="card-type">${escapeHtml(category || "")}</p>
        <button
          type="button"
          class="card-move-btn"
          data-task-id="${escapeHtml(id)}"
          aria-label="Move task">
          <img src="./img/buttons/Frame_380.svg" alt="Move task" />
        </button>
      </div>

      <span class="card-title">${escapeHtml(title || "")}</span>
      <p class="story">${escapeHtml(description || "")}</p>

      ${subtaskProgressHTML(subtasks)}

      <div class="card-footer">
        <div class="assigned-list">${renderAssignees(assignedTo)}</div>
        <div class="priority">${priorityIcon(priority)}</div>
      </div>
    </div>`;
}

/**
 * Generates priority icon HTML
 * @param {string} priority - Priority level
 * @returns {string} HTML string for priority icon
 */
function priorityIcon(priority) {
  const p = normalizePriority(priority);
  const color = priorityColor(p);
  return `<span class="prio-icon" aria-label="${p}" title="${p}" style="color: ${color};">${priorityIconSVG(
    p
  )}</span>`;
}

/**
 * Returns SVG markup for priority icon
 * @param {string} priority - Priority level
 * @returns {string} SVG HTML string
 */
function priorityIconSVG(priority) {
  const p = normalizePriority(priority);

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

  return `
    <svg width="20" height="12" viewBox="0 0 20 12" aria-hidden="true">
      <rect x="2" y="3" width="16" height="2" rx="1" fill="currentColor"/>
      <rect x="2" y="7" width="16" height="2" rx="1" fill="currentColor"/>
    </svg>`;
}

/**
 * Generates priority badge HTML with optional text
 * @param {string} priority - Priority level
 * @param {boolean} [withText=true] - Whether to include text label
 * @returns {string} HTML string for priority badge
 */
function priorityBadge(priority, withText = true) {
  const p = normalizePriority(priority);
  const cls = p === "Urgent" ? "urgent" : p === "Low" ? "low" : "medium";
  const color = priorityColor(p);
  const txt = withText ? `<span class="priority-badge__text">${p}</span>` : "";
  return `<span class="priority-badge priority-badge--${cls}" title="${p}" style="color: ${color}; display:inline-flex; align-items:center; gap:6px;">${priorityIconSVG(
    p
  )}${txt}</span>`;
}

/**
 * Generates subtask progress bar HTML
 * @param {Array} subtasks - Array of subtask objects
 * @returns {string} HTML string for progress bar or empty string
 */
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
