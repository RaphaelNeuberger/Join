// task_subtasks.js - Subtask handling

let subtaskDrafts = [];

/**
 * Initialize subtask controls.
 */
function initSubtaskControls() {
  const input = document.getElementById("subtaskInput");
  const addBtn = document.getElementById("addSubtaskBtn");
  const list = document.getElementById("subtaskList");

  if (!input || !addBtn || !list) return;

  addBtn.addEventListener("click", addSubtaskFromInput);

  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addSubtaskFromInput();
    }
  });

  renderSubtaskDrafts();
}

/**
 * Read value from subtask input and add it.
 */
function addSubtaskFromInput() {
  const input = document.getElementById("subtaskInput");
  if (!input) return;

  const value = input.value.trim();
  if (!value) return;

  subtaskDrafts.push({
    title: value,
    done: false,
  });

  input.value = "";
  renderSubtaskDrafts();
}

/**
 * Remove a subtask from the draft.
 */
function removeSubtaskDraft(index) {
  if (index < 0 || index >= subtaskDrafts.length) return;
  subtaskDrafts.splice(index, 1);
  renderSubtaskDrafts();
}

/**
 * Edit a subtask.
 */
function editSubtaskDraft(index) {
  if (index < 0 || index >= subtaskDrafts.length) return;
  
  const subtask = subtaskDrafts[index];
  const input = document.getElementById("subtaskInput");
  
  if (!input) return;
  
  input.value = subtask.title;
  input.focus();
  
  removeSubtaskDraft(index);
}

/**
 * Render current subtask drafts to the list.
 */
function renderSubtaskDrafts() {
  const list = document.getElementById("subtaskList");
  if (!list) return;

  list.innerHTML = "";
  if (!subtaskDrafts.length) return;

  subtaskDrafts.forEach((subtask, index) => {
    const li = document.createElement("li");
    li.className = "subtask-item";
    li.innerHTML = `
      <span class="subtask-title">${escapeHtml(subtask.title)}</span>
      <div class="subtask-actions">
        <button type="button" class="subtask-edit-btn" aria-label="Edit subtask" title="Edit subtask">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M2 14h12M10 2l4 4M3 13l7-7 4 4-7 7H3v-4z" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <button type="button" class="subtask-delete-btn" aria-label="Delete subtask" title="Delete subtask">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M2 4h12M6.5 7v6M9.5 7v6M3 4l0.5 9c0 0.5 0.5 1 1 1h7c0.5 0 1-0.5 1-1l0.5-9M6 4V2.5c0-0.5 0.5-1 1-1h2c0.5 0 1 0.5 1 1V4" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    `;

    const editBtn = li.querySelector(".subtask-edit-btn");
    const deleteBtn = li.querySelector(".subtask-delete-btn");
    
    editBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      editSubtaskDraft(index);
    });
    
    deleteBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      removeSubtaskDraft(index);
    });

    list.appendChild(li);
  });
}

/**
 * Get current subtask drafts.
 */
function getSubtaskDrafts() {
  return subtaskDrafts.map((s) => ({
    title: s.title,
    done: !!s.done,
  }));
}

/**
 * Reset subtasks to empty.
 */
function resetSubtasks() {
  subtaskDrafts = [];
  renderSubtaskDrafts();
}
