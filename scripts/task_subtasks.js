/**
 * @fileoverview Subtask management for task forms
 * @module task_subtasks
 */

/**
 * Array of subtask drafts before task submission
 * @type {Array<{title: string, done: boolean}>}
 */
let subtaskDrafts = [];

/**
 * Initializes subtask input controls and event handlers
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
 * Adds a subtask from the input field
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
 * Removes a subtask draft by index
 * @param {number} index - The index of the subtask to remove
 */
function removeSubtaskDraft(index) {
  if (index < 0 || index >= subtaskDrafts.length) return;
  subtaskDrafts.splice(index, 1);
  renderSubtaskDrafts();
}

/**
 * Edits a subtask draft by moving it back to input
 * @param {number} index - The index of the subtask to edit
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
 * Renders the list of subtask drafts
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
 * Gets the current subtask drafts for submission
 * @returns {Array<{title: string, done: boolean}>} Array of subtask objects
 */
function getSubtaskDrafts() {
  return subtaskDrafts.map((s) => ({
    title: s.title,
    done: !!s.done,
  }));
}

/**
 * Resets all subtask drafts
 */
function resetSubtasks() {
  subtaskDrafts = [];
  renderSubtaskDrafts();
}

/**
 * Adds a subtask from the overlay edit form
 * @async
 * @param {string} taskId - The task ID to add subtask to
 */
async function onAddSubtaskFromOverlay(taskId) {
  const input = document.getElementById("overlaySubtaskInput");
  if (!input) return;

  const value = String(input.value || "").trim();
  if (!value) return;

  const index = tasks.findIndex((t) => String(t.id) === String(taskId));
  if (index === -1) return;

  const task = tasks[index];
  const subtasks = Array.isArray(task.subtasks) ? [...task.subtasks] : [];

  subtasks.push({ title: value, done: false });

  const updatedTask = { ...task, subtasks };

  try {
    await saveTask(updatedTask);
    tasks[index] = updatedTask;

    input.value = "";
    if (typeof onTaskEditClick === "function") {
      onTaskEditClick(taskId);
    }

    if (typeof renderBoard === "function") renderBoard();
  } catch (err) {
    console.error("onAddSubtaskFromOverlay: error saving subtask", err);
    alert("Error while adding subtask.");
  }
}
