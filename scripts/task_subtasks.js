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
      <button type="button" class="subtask-remove-btn" aria-label="Remove subtask">
        ✕
      </button>
    `;

    const removeBtn = li.querySelector(".subtask-remove-btn");
    removeBtn.addEventListener("click", () => removeSubtaskDraft(index));

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
