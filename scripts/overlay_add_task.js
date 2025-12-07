// scripts/overlay_add_task.js

/**
 * Initialisiert das Add-Task Overlay:
 * - registriert alle "Add Task" Trigger (Header, Mobile, Spalten-Plus)
 * - Close-Button im Overlay
 * - Klick auf den Hintergrund schließt das Overlay
 */
function initAddTaskOverlay() {
  const overlay = document.querySelector('overlay-modal');
  const form = document.getElementById('taskForm');

  if (!overlay || !form) return;

  // Alle Trigger-Elemente: Header-Button, Mobile-Button, Spalten-Plus
  const triggers = document.querySelectorAll('.js-add-task-trigger');
  triggers.forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const status = trigger.dataset.status || 'todo';
      openAddTaskOverlay(status);
    });
  });

  // Close-Button (X) im Overlay-Header (data-overlay-close)
  const closeBtn = overlay.querySelector('[data-overlay-close]');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeAddTaskOverlay);
  }

  // Klick auf den abgedunkelten Hintergrund schließt das Overlay
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) {
      closeAddTaskOverlay();
    }
  });
}

/**
 * Öffnet das Add-Task-Overlay und setzt den Status für den neuen Task.
 * @param {string} status - 'todo' | 'inprogress' | 'await_feedback' | 'done'
 */
function openAddTaskOverlay(status) {
  const overlay = document.querySelector('overlay-modal');
  const form = document.getElementById('taskForm');
  if (!overlay || !form) return;

  // Formular zurücksetzen (eigene Reset-Funktion, falls vorhanden)
  if (typeof resetTaskForm === 'function') {
    resetTaskForm();
  } else {
    form.reset();
  }

  // Status in verstecktes Feld schreiben
  const statusInput = form.querySelector('input[name="status"]');
  if (statusInput) {
    statusInput.value = status;
  }

  overlay.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

/**
 * Schließt das Add-Task-Overlay.
 */
function closeAddTaskOverlay() {
  const overlay = document.querySelector('overlay-modal');
  if (!overlay) return;

  overlay.style.display = 'none';
  document.body.style.overflow = '';
}

/**
 * Legacy-API:
 * Falls irgendwo noch addTaskBtn()/closeAddTaskBtn() benutzt wird,
 * leiten wir auf die neuen Funktionen um.
 */
function addTaskBtn(status) {
  openAddTaskOverlay(status || 'todo');
}

function closeAddTaskBtn() {
  closeAddTaskOverlay();
}

// Beim Laden des DOM initialisieren
document.addEventListener('DOMContentLoaded', initAddTaskOverlay);
