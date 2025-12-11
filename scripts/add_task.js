 (function () {
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from((ctx || document).querySelectorAll(sel));

  function showError(el, msg) {
    if (!el) return;
    el.textContent = msg || "";
    el.style.display = msg ? "block" : "none";
  }

  function clearErrors() {
    showError($("#titleError"), "");
    showError($("#dueDateError"), "");
    showError($("#categoryError"), "");
  }

  function escapeHtml(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function initPriorityButtons() {
    const buttons = Array.from(document.querySelectorAll(".priority-buttons__button"));
    if (!buttons.length) return;
    let initial = buttons.find((b) => b.classList.contains("is-active")) || buttons.find((b) => b.classList.contains("priority-buttons__button--active")) || buttons.find((b) => b.dataset.priority === "Medium") || buttons[0];
    buttons.forEach((b) => {
      b.classList.remove("priority-buttons__button--active");
      if (b === initial) { b.classList.add("is-active"); b.setAttribute("aria-pressed", "true"); } else { b.classList.remove("is-active"); b.setAttribute("aria-pressed", "false"); }
      b.addEventListener("click", () => { buttons.forEach((other) => { other.classList.remove("is-active"); other.classList.remove("priority-buttons__button--active"); other.setAttribute("aria-pressed", "false"); }); b.classList.add("is-active"); b.setAttribute("aria-pressed", "true"); });
      b.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); b.click(); } });
    });
  }

  function initSubtasks() {
    const input = $("#subtaskInput");
    const addBtn = $("#addSubtaskBtn");
    const list = $("#subtaskList");
    function createItem(text) { return createSubtaskItem(text); }
    function addFromInput() { addSubtaskFromInput(input, list); }
    if (addBtn) addBtn.addEventListener("click", addFromInput);
    if (input) input.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); addFromInput(); } });
  }

  function createSubtaskItem(text) {
    const li = document.createElement("li");
    li.className = "subtask-item";
    li.style.display = "flex";
    li.style.justifyContent = "space-between";
    li.style.alignItems = "center";
    li.innerHTML = `<label style="display:flex; align-items:center; gap:10px; flex:1;">
        <input type="checkbox" class="subtask-checkbox" />
        <span class="subtask-text">${escapeHtml(text)}</span>
      </label>
      <button type="button" class="subtask-remove" aria-label="Remove subtask" title="Remove">X</button>`;
    li.querySelector(".subtask-remove").addEventListener("click", () => li.remove());
    return li;
  }

  function addSubtaskFromInput(inputEl, listEl) {
    if (!inputEl || !listEl) return;
    const v = inputEl.value.trim();
    if (!v) return;
    listEl.appendChild(createSubtaskItem(v));
    inputEl.value = "";
    inputEl.focus();
  }

  function initDateIcon() {
    const icon = document.querySelector(".date-icon");
    const dateInput = $("#dueDate");
    if (!icon || !dateInput) return;
    icon.style.cursor = "pointer";
    icon.addEventListener("click", (e) => { e.preventDefault(); if (typeof dateInput.showPicker === "function") { try { dateInput.showPicker(); return; } catch (e) {} } dateInput.focus(); });
    const wrapper = dateInput.closest(".form-group__date-wrapper");
    if (wrapper) wrapper.addEventListener("click", (e) => { if (e.target === dateInput) return; dateInput.focus(); if (typeof dateInput.showPicker === "function") { try { dateInput.showPicker(); } catch (e) {} } });
  }

  function readFormFields() {
    return {
      title: ($("#title") && $("#title").value.trim()) || "",
      description: ($("#description") && $("#description").value.trim()) || "",
      dueDate: ($("#dueDate") && $("#dueDate").value) || "",
      category: ($("#category") && $("#category").value) || "",
    };
  }

  function readAssignedContacts() {
    const hidden = $("#assignedToHidden");
    const value = (hidden && hidden.value) || "";
    return value ? value.split(",").filter(Boolean) : [];
  }

  function readPriority() {
    const buttons = $$(".priority-buttons__button");
    const activeBtn = buttons.find ? buttons.find((b) => b.classList.contains("is-active")) : buttons.filter((b) => b.classList.contains("is-active"))[0];
    return (activeBtn && activeBtn.dataset.priority) || "Medium";
  }

  function readSubtasks() {
    return $$("#subtaskList .subtask-item").map((li) => {
      const textEl = li.querySelector(".subtask-text");
      const cb = li.querySelector(".subtask-checkbox");
      return { title: textEl ? textEl.textContent.trim() : "", done: !!(cb && cb.checked) };
    });
  }

  function validateFormData(fields) {
    let valid = true;
    if (!fields.title) { showError($("#titleError"), "Title is required"); valid = false; }
    if (!fields.dueDate) { showError($("#dueDateError"), "Due date is required"); valid = false; }
    if (!fields.category) { showError($("#categoryError"), "Category is required"); valid = false; }
    return valid;
  }

  function collectFormData() {
    clearErrors();
    const fields = readFormFields();
    if (!validateFormData(fields)) return null;
    return { ...fields, assignedTo: readAssignedContacts(), priority: readPriority(), subtasks: readSubtasks(), createdAt: new Date().toISOString() };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const data = collectFormData();
    if (!data) return;
    try {
      if (window.firebase && firebase.database) { const db = firebase.database(); const ref = db.ref("tasks").push(); await ref.set(data); showSuccess(); return; }
      if (window.createTask && typeof window.createTask === "function") { await window.createTask(data); showSuccess(); return; }
      if (window.tasksAPI && typeof window.tasksAPI.create === "function") { await window.tasksAPI.create(data); showSuccess(); return; }
      const existing = JSON.parse(localStorage.getItem("local_tasks") || "[]"); existing.push(data); localStorage.setItem("local_tasks", JSON.stringify(existing)); showSuccess("Saved locally (no backend found).");
    } catch (err) { console.error("Failed to save task:", err); alert("Error saving task — check console for details."); }
  }

  function updateSuccessNote(success, customText) {
    let note = success.querySelector(".note-text");
    if (!note) { note = document.createElement("div"); note.className = "note-text"; note.style.fontSize = "16px"; note.style.marginTop = "6px"; success.appendChild(note); }
    note.textContent = customText;
  }

  function showSuccess(customText) {
    const text = customText || "Task created successfully!";
    if (window.createNotification && typeof window.createNotification === "function") { window.createNotification({ type: "success", text, duration: 1400 }); } else { const success = $("#successMessage"); if (!success) return; if (customText) updateSuccessNote(success, customText); success.style.display = "flex"; setTimeout(() => { clearForm(); success.style.display = "none"; }, 1200); }
    clearForm();
  }

  function clearForm() {
    const form = $("#taskForm"); if (!form) return; form.reset(); const sub = $("#subtaskList"); if (sub) sub.innerHTML = ""; const assignedHidden = $("#assignedToHidden"); const assignedInput = $("#assignedToInput"); if (assignedHidden) assignedHidden.value = ""; if (assignedInput) assignedInput.value = ""; const medium = $$(".priority-buttons__button").find ? $$(".priority-buttons__button").find((b) => b.dataset.priority === "Medium") : $$(".priority-buttons__button").filter((b) => b.dataset.priority === "Medium")[0]; $$(".priority-buttons__button").forEach((b) => { b.classList.remove("is-active"); b.setAttribute("aria-pressed", "false"); }); if (medium) { medium.classList.add("is-active"); medium.setAttribute("aria-pressed", "true"); } clearErrors();
  }

  function initAddTaskPage() {
    initPriorityButtons(); initSubtasks(); initAssignedToDropdown(); initDateIcon(); const form = $("#taskForm"); if (form) form.addEventListener("submit", handleSubmit); const clearBtn = $("#clearBtn"); if (clearBtn) clearBtn.addEventListener("click", (e) => { e.preventDefault(); clearForm(); }); if (!NodeList.prototype.map) { Object.defineProperty(NodeList.prototype, "map", { value: function (fn, ctx) { return Array.prototype.map.call(this, fn, ctx); }, }); } if (!Array.prototype.find) { Array.prototype.find = function (predicate) { for (let i = 0; i < this.length; i++) { if (predicate(this[i], i, this)) return this[i]; } return undefined; }; }
  }

  window.initAddTaskPage = initAddTaskPage;
})();
