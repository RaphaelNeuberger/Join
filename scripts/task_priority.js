// task_priority.js - Priority button handling

let selectedPriority = "Medium";

/**
 * Initialize priority buttons (Add-Task form).
 */
function initPriorityButtons() {
  const buttons = document.querySelectorAll(".priority-buttons__button");
  if (!buttons.length) return;

  setupPriorityButtonInteractions(buttons);
  setInitialPriority(buttons);
}

/**
 * Set a button as active.
 */
function setPriorityActive(buttons, activeButton) {
  buttons.forEach((button) => {
    button.classList.remove("is-active");
    button.setAttribute("aria-pressed", "false");
  });

  activeButton.classList.add("is-active");
  activeButton.setAttribute("aria-pressed", "true");
  selectedPriority = activeButton.dataset.priority || "Medium";
}

/**
 * Setup click and keyboard events for priority buttons.
 */
function setupPriorityButtonInteractions(buttons) {
  buttons.forEach((btn) => {
    btn.setAttribute("role", "button");
    btn.setAttribute("tabindex", "0");

    const activate = () => setPriorityActive(buttons, btn);

    btn.addEventListener("click", activate);
    btn.addEventListener("keydown", (event) => {
      if (event.key === " " || event.key === "Enter") {
        event.preventDefault();
        activate();
      }
    });
  });
}

/**
 * Set initial priority button (Medium or first button).
 */
function setInitialPriority(buttons) {
  let defaultButton = document.querySelector(
    ".priority-buttons__button.priority-buttons__button--active"
  );

  if (!defaultButton) {
    defaultButton =
      document.querySelector(
        ".priority-buttons__button.priority-buttons__button--medium"
      ) || buttons[0];
  }

  if (defaultButton) {
    setPriorityActive(buttons, defaultButton);
  }
}

/**
 * Reset priority buttons to default.
 */
function resetPriorityButtons() {
  const buttons = document.querySelectorAll(".priority-buttons__button");
  if (!buttons.length) return;

  selectedPriority = "Medium";
  setInitialPriority(buttons);
}

/**
 * Get the currently selected priority.
 */
function getSelectedPriority() {
  return selectedPriority || "Medium";
}
