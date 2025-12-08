// scripts/task_tamplates.js

// Placeholder-Templates
function noTaskTemplate() {
  return (
    '<div class="card-no-task">' + "<span>No tasks To do</span>" + "</div>"
  );
}

function noResultsTemplate() {
  return (
    '<div class="card-no-task">' + "<span>No results found</span>" + "</div>"
  );
}

// Avatar-Farben
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

/**
 * Small avatars for card view
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
      
      // If avatarClass is available, use it; otherwise use dynamic color
      if (avatarClass) {
        return (
          '<span class="assigned-avatar ' +
          avatarClass +
          '">' +
          initials +
          "</span>"
        );
      }
      
      // Fallback for old data without avatarClass
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
 * Card in board
 * - no onclick / ondragstart (DOM event handling in board.js)
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
 * Datum für Anzeige im Overlay von YYYY-MM-DD zu DD/MM/YY
 */
function formatDateToDDMMYY(dateStr) {
  if (!dateStr) return "-";
  const parts = String(dateStr).split("-");
  if (parts.length !== 3) return dateStr;
  const [y, m, d] = parts;
  const yy = y.slice(2);
  return `${d}/${m}/${yy}`;
}

// Overlay templates (taskCardContentTemplate, taskCardEditTemplate, renderAssigneesDetail, renderSubtasksDetail)
// moved to task_templates_detail.js

/* Utility-Funktionen */

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

function getInitialsFromName(name) {
  var parts = String(name).trim().split(" ");
  if (!parts.length) return "";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (
    parts[0].charAt(0).toUpperCase() +
    parts[parts.length - 1].charAt(0).toUpperCase()
  );
}

/**
 * Priority Normalisierung
 */
function normalizePriority(p) {
  const v = String(p || "Medium").toLowerCase();
  if (v.startsWith("u")) return "Urgent";
  if (v.startsWith("l")) return "Low";
  return "Medium";
}

function priorityColor(priority) {
  const p = normalizePriority(priority);
  if (p === "Urgent") return "#ff3d00";
  if (p === "Low") return "#5be84a";
  return "#ffab2b";
}

function priorityIcon(priority) {
  const p = normalizePriority(priority);
  const color = priorityColor(p);
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

  // MEDIUM: two bars ‖
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

/**
 * Subtask progress bar on cards
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
