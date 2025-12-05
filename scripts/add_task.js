// scripts/add_task.js
// Funktionale Logik für Add Task page (keine Styles)
// Erwartet: HTML wie in deiner add_task.html (select#assignedTo, input#dueDate + .date-icon, usw.)
// Exponiert: window.initAddTaskPage()

(function () {
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from((ctx || document).querySelectorAll(sel));

  /* ---------- Utilities ---------- */
  function showError(el, msg) {
    if (!el) return;
    el.textContent = msg || '';
    el.style.display = msg ? 'block' : 'none';
  }
  function clearErrors() {
    showError($('#titleError'), '');
    showError($('#dueDateError'), '');
    showError($('#categoryError'), '');
  }
  function escapeHtml(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /* ---------- Priority buttons ---------- */
 function initPriorityButtons() {
  const buttons = Array.from(document.querySelectorAll('.priority-buttons__button'));
  if (!buttons.length) return;

  // ensure only one active on init (prefer an existing is-active, otherwise choose Medium if present)
  let initial = buttons.find(b => b.classList.contains('is-active')) ||
                buttons.find(b => b.classList.contains('priority-buttons__button--active')) ||
                buttons.find(b => b.dataset.priority === 'Medium') ||
                buttons[0];

  buttons.forEach(b => {
    // normalize: remove legacy/duplicate active marker classes, set aria-pressed correctly
    b.classList.remove('priority-buttons__button--active'); // remove old marker if present
    if (b === initial) {
      b.classList.add('is-active');
      b.setAttribute('aria-pressed', 'true');
    } else {
      b.classList.remove('is-active');
      b.setAttribute('aria-pressed', 'false');
    }

    // click handler
    b.addEventListener('click', () => {
      buttons.forEach(other => {
        other.classList.remove('is-active');
        other.classList.remove('priority-buttons__button--active'); // defensive
        other.setAttribute('aria-pressed', 'false');
      });
      b.classList.add('is-active');
      b.setAttribute('aria-pressed', 'true');
    });

    // keyboard activation
    b.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        b.click();
      }
    });
  });
}


  /* ---------- Subtasks ---------- */
  function initSubtasks() {
    const input = $('#subtaskInput');
    const addBtn = $('#addSubtaskBtn');
    const list = $('#subtaskList');

    function createItem(text) {
      const li = document.createElement('li');
      li.className = 'subtask-item';
      li.style.display = 'flex';
      li.style.justifyContent = 'space-between';
      li.style.alignItems = 'center';
      li.innerHTML = `
        <label style="display:flex; align-items:center; gap:10px; flex:1;">
          <input type="checkbox" class="subtask-checkbox" />
          <span class="subtask-text">${escapeHtml(text)}</span>
        </label>
        <button type="button" class="subtask-remove" aria-label="Remove subtask" title="Remove">✕</button>
      `;
      li.querySelector('.subtask-remove').addEventListener('click', () => li.remove());
      return li;
    }

    function addFromInput() {
      if (!input) return;
      const v = input.value.trim();
      if (!v) return;
      list.appendChild(createItem(v));
      input.value = '';
      input.focus();
    }

    if (addBtn) addBtn.addEventListener('click', addFromInput);
    if (input) input.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addFromInput();
      }
    });
  }

  /* ---------- Assigned-to: custom multi-select dropdown ---------- */
  function initAssignedToDropdown() {
    const originalSelect = $('#assignedTo');
    if (!originalSelect) return;

    // Create wrapper structure
    const wrapper = document.createElement('div');
    wrapper.className = 'assigned-to-wrapper custom-assigned-to';
    wrapper.style.position = 'relative';

    // Create visible input (readonly) that shows chosen names
    const visibleInput = document.createElement('input');
    visibleInput.type = 'text';
    visibleInput.id = 'assignedToInput';
    visibleInput.className = 'assigned-to-input form-group__input';
    visibleInput.placeholder = originalSelect.options.length ? 'Select contacts to assign' : 'No contacts';
    visibleInput.readOnly = true;
    visibleInput.setAttribute('aria-haspopup', 'listbox');
    visibleInput.setAttribute('aria-expanded', 'false');
    visibleInput.style.cursor = 'pointer';

    // Create dropdown container
    const dropdown = document.createElement('div');
    dropdown.className = 'assigned-to-dropdown';
    dropdown.style.display = 'none';
    dropdown.setAttribute('role', 'listbox');
    dropdown.setAttribute('aria-multiselectable', 'true');

    const ul = document.createElement('ul');
    ul.id = 'assignedToList';
    ul.style.listStyle = 'none';
    ul.style.margin = '0';
    ul.style.padding = '8px 0';

    // Build list items from original select options
    Array.from(originalSelect.options).forEach((opt, idx) => {
      const li = document.createElement('li');
      li.tabIndex = 0;
      li.dataset.value = opt.value;
      li.style.display = 'flex';
      li.style.alignItems = 'center';
      li.style.justifyContent = 'space-between';
      li.style.padding = '8px 16px';
      li.style.cursor = 'pointer';
      li.className = 'assigned-contact';

      // left: avatar + name
      const left = document.createElement('div');
      left.className = 'contact-info';
      left.style.display = 'flex';
      left.style.alignItems = 'center';
      left.style.gap = '12px';

      // avatar (initials)
      const avatar = document.createElement('div');
      avatar.className = 'avatar';
      avatar.style.width = '36px';
      avatar.style.height = '36px';
      avatar.style.borderRadius = '50%';
      avatar.style.display = 'flex';
      avatar.style.alignItems = 'center';
      avatar.style.justifyContent = 'center';
      avatar.style.fontWeight = '700';
      avatar.style.fontSize = '14px';
      // simple color hash based on text
      const initials = opt.text.trim().split(/\s+/).map(n => n[0].toUpperCase()).slice(0,2).join('');
      avatar.textContent = initials;
      avatar.style.background = pickColor(opt.text);

      const nameSpan = document.createElement('span');
      nameSpan.className = 'contact-name';
      nameSpan.textContent = opt.text;
      nameSpan.style.color = 'inherit';

      left.appendChild(avatar);
      left.appendChild(nameSpan);

      // right: checkbox box
      const right = document.createElement('div');
      right.style.display = 'flex';
      right.style.alignItems = 'center';
      right.style.gap = '8px';

      const inputCheck = document.createElement('input');
      inputCheck.type = 'checkbox';
      inputCheck.style.width = '18px';
      inputCheck.style.height = '18px';
      inputCheck.className = 'assigned-checkbox';
      inputCheck.dataset.value = opt.value;
      inputCheck.dataset.label = opt.text;

      right.appendChild(inputCheck);

      li.appendChild(left);
      li.appendChild(right);

      // click on li toggles the checkbox
      li.addEventListener('click', (e) => {
        // ignore if clicking the checkbox itself (checkbox will toggle)
        if (e.target.tagName.toLowerCase() === 'input') return;
        inputCheck.checked = !inputCheck.checked;
        updateAssignedSelection(visibleInput, ul);
      });
      // also support keyboard (space/enter)
      li.addEventListener('keydown', (e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          inputCheck.checked = !inputCheck.checked;
          updateAssignedSelection(visibleInput, ul);
        }
      });

      // when checkbox changed update text
      inputCheck.addEventListener('change', () => updateAssignedSelection(visibleInput, ul));

      ul.appendChild(li);
    });

    dropdown.appendChild(ul);

    // Hidden input for form submit (comma separated values)
    const hiddenInput = document.createElement('input');
    hiddenInput.type = 'hidden';
    hiddenInput.id = 'assignedToHidden';
    hiddenInput.name = originalSelect.name || 'assignedTo';

    // Replace original select with wrapper
    originalSelect.style.display = 'none';
    originalSelect.parentNode.insertBefore(wrapper, originalSelect);
    wrapper.appendChild(visibleInput);
    wrapper.appendChild(dropdown);
    wrapper.appendChild(hiddenInput);

    // toggle dropdown
    function openDropdown() {
      dropdown.style.display = 'block';
      visibleInput.setAttribute('aria-expanded', 'true');
    }
    function closeDropdown() {
      dropdown.style.display = 'none';
      visibleInput.setAttribute('aria-expanded', 'false');
    }
    function toggleDropdown() {
      if (dropdown.style.display === 'block') closeDropdown();
      else openDropdown();
    }

    visibleInput.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleDropdown();
    });
    visibleInput.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openDropdown();
        // focus first item
        const first = ul.querySelector('li');
        if (first) first.focus();
      } else if (e.key === 'Escape') {
        closeDropdown();
      }
    });

    // click outside closes dropdown
    document.addEventListener('click', (e) => {
      if (!wrapper.contains(e.target)) closeDropdown();
    });

    // update visible input and hidden field from selected checkboxes
    function updateAssignedSelection(visibleEl, listEl) {
      const checked = Array.from(listEl.querySelectorAll('input.assigned-checkbox:checked'));
      const labels = checked.map(c => c.dataset.label);
      const values = checked.map(c => c.dataset.value);
      visibleEl.value = labels.join(', ');
      hiddenInput.value = values.join(',');
      // update aria attrs for each li (selected state)
      Array.from(listEl.querySelectorAll('li')).forEach(li => {
        const cb = li.querySelector('input.assigned-checkbox');
        if (cb && cb.checked) li.classList.add('selected');
        else li.classList.remove('selected');
      });
    }

    // helper: pick a color for avatar based on text (deterministic)
    function pickColor(text) {
      const colors = ['#00bfff','#ff8c00','#9932cc','#4169e1','#ff69b4','#00c49a','#ff6666','#7f5aff'];
      let sum = 0;
      for (let i=0;i<text.length;i++) sum += text.charCodeAt(i);
      return colors[sum % colors.length];
    }

    // expose a helper to preselect (if original select had selected options)
    (function preselectFromOriginal() {
      const originalSelected = Array.from(originalSelect.selectedOptions || []).map(o => o.value);
      if (originalSelected.length === 0) return;
      ul.querySelectorAll('input.assigned-checkbox').forEach(ch => {
        if (originalSelected.includes(ch.dataset.value)) {
          ch.checked = true;
        }
      });
      updateAssignedSelection(visibleInput, ul);
    })();
  }

  /* ---------- Date icon: open native picker where supported ---------- */
  function initDateIcon() {
    const icon = document.querySelector('.date-icon');
    const dateInput = $('#dueDate');
    if (!icon || !dateInput) return;
    icon.style.cursor = 'pointer';
    icon.addEventListener('click', (e) => {
      e.preventDefault();
      // some browsers support showPicker()
      if (typeof dateInput.showPicker === 'function') {
        try { dateInput.showPicker(); return; } catch (e) { /* ignore */ }
      }
      // fallback: focus
      dateInput.focus();
      // On some browsers focusing won't open date picker; nothing else we can do without polyfill
    });
    // Also clicking the wrapper area should focus input if present
    const wrapper = dateInput.closest('.form-group__date-wrapper');
    if (wrapper) wrapper.addEventListener('click', (e) => {
      // ignore if clicking inside the input (focus will occur naturally)
      if (e.target === dateInput) return;
      dateInput.focus();
      if (typeof dateInput.showPicker === 'function') {
        try { dateInput.showPicker(); } catch (e) {}
      }
    });
  }

  /* ---------- Form collect / validate / submit ---------- */
  function collectFormData() {
    clearErrors();
    const title = ($('#title') && $('#title').value.trim()) || '';
    const description = ($('#description') && $('#description').value.trim()) || '';
    const dueDate = ($('#dueDate') && $('#dueDate').value) || '';
    const category = ($('#category') && $('#category').value) || '';
    // assignedToHidden contains comma separated values
    const assignedToHidden = ($('#assignedToHidden') && $('#assignedToHidden').value) || '';
    const assignedTo = assignedToHidden ? assignedToHidden.split(',').filter(Boolean) : [];
    const priorityBtn = $$('.priority-buttons__button').find
      ? $$('.priority-buttons__button').find(b => b.classList.contains('is-active'))
      : $$('.priority-buttons__button').filter(b => b.classList.contains('is-active'))[0];
    const priority = (priorityBtn && priorityBtn.dataset.priority) || 'Medium';

    // subtasks
    const subtasks = $$('#subtaskList .subtask-item').map(li => {
      const textEl = li.querySelector('.subtask-text');
      const cb = li.querySelector('.subtask-checkbox');
      const text = textEl ? textEl.textContent.trim() : '';
      const done = !!(cb && cb.checked);
      return { title: text, done };
    });

    let valid = true;
    if (!title) { showError($('#titleError'), 'Title is required'); valid = false; }
    if (!dueDate) { showError($('#dueDateError'), 'Due date is required'); valid = false; }
    if (!category) { showError($('#categoryError'), 'Category is required'); valid = false; }
    if (!valid) return null;

    return {
      title, description, dueDate, category,
      assignedTo, priority, subtasks,
      createdAt: new Date().toISOString()
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const data = collectFormData();
    if (!data) return;

    try {
      // 1) Firebase realtime if available globally
      if (window.firebase && firebase.database) {
        const db = firebase.database();
        const ref = db.ref('tasks').push();
        await ref.set(data);
        showSuccess();
        return;
      }
      // 2) window.createTask convention
      if (window.createTask && typeof window.createTask === 'function') {
        await window.createTask(data);
        showSuccess();
        return;
      }
      // 3) tasksAPI.create
      if (window.tasksAPI && typeof window.tasksAPI.create === 'function') {
        await window.tasksAPI.create(data);
        showSuccess();
        return;
      }
      // 4) fallback: localStorage
      const existing = JSON.parse(localStorage.getItem('local_tasks') || '[]');
      existing.push(data);
      localStorage.setItem('local_tasks', JSON.stringify(existing));
      showSuccess('Saved locally (no backend found).');
    } catch (err) {
      console.error('Failed to save task:', err);
      alert('Error saving task — check console for details.');
    }
  }

  function showSuccess(customText) {
    const success = $('#successMessage');
    if (!success) return;
    // optionally set text (the element has children, keep simple)
    if (customText) {
      // append small note
      let note = success.querySelector('.note-text');
      if (!note) {
        note = document.createElement('div');
        note.className = 'note-text';
        note.style.fontSize = '13px';
        note.style.marginTop = '6px';
        success.appendChild(note);
      }
      note.textContent = customText;
    }
    success.style.display = 'flex';
    // clear after short delay
    setTimeout(() => {
      clearForm();
      success.style.display = 'none';
    }, 1200);
  }

  function clearForm() {
    const form = $('#taskForm');
    if (!form) return;
    form.reset();
    // remove subtasks
    const sub = $('#subtaskList');
    if (sub) sub.innerHTML = '';
    // reset assigned visible input + hidden
    const assignedHidden = $('#assignedToHidden');
    const assignedInput = $('#assignedToInput');
    if (assignedHidden) assignedHidden.value = '';
    if (assignedInput) assignedInput.value = '';
    // reset priority to Medium if exists
    const medium = $$('.priority-buttons__button').find
      ? $$('.priority-buttons__button').find(b => b.dataset.priority === 'Medium')
      : $$('.priority-buttons__button').filter(b => b.dataset.priority === 'Medium')[0];
    $$('.priority-buttons__button').forEach(b => { b.classList.remove('is-active'); b.setAttribute('aria-pressed','false'); });
    if (medium) { medium.classList.add('is-active'); medium.setAttribute('aria-pressed','true'); }
    clearErrors();
  }

  /* ---------- Initialization entry ---------- */
  function initAddTaskPage() {
    initPriorityButtons();
    initSubtasks();
    initAssignedToDropdown();
    initDateIcon();

    const form = $('#taskForm');
    if (form) form.addEventListener('submit', handleSubmit);

    const clearBtn = $('#clearBtn');
    if (clearBtn) clearBtn.addEventListener('click', (e) => { e.preventDefault(); clearForm(); });

    // Polyfill helpers for NodeList convenience methods used
    if (!NodeList.prototype.map) {
      Object.defineProperty(NodeList.prototype, 'map', {
        value: function (fn, ctx) { return Array.prototype.map.call(this, fn, ctx); }
      });
    }
    if (!Array.prototype.find) {
      Array.prototype.find = function (predicate) {
        for (let i = 0; i < this.length; i++) {
          if (predicate(this[i], i, this)) return this[i];
        }
        return undefined;
      };
    }
  }

  // expose globally (your HTML calls initAddTaskPage() onload)
  window.initAddTaskPage = initAddTaskPage;
})();