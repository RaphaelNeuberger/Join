/**
 * @fileoverview Task priority selection functionality
 * @module task_priority
 */

/**
 * Currently selected priority level
 * @type {string}
 */
let selectedPriority = "Medium";

/**
 * Initializes priority button interactions
 */
function initPriorityButtons() {
  const buttons = document.querySelectorAll(".priority-buttons__button");
  if (!buttons.length) return;

  setupPriorityButtonInteractions(buttons);
  setInitialPriority(buttons);
}

/**
 * Sets the active priority button
 * @param {NodeList} buttons - All priority buttons
 * @param {HTMLElement} activeButton - The button to activate
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
 * Sets up click and keyboard handlers for priority buttons
 * @param {NodeList} buttons - All priority buttons
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
 * Sets the initial/default priority button state
 * @param {NodeList} buttons - All priority buttons
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
 * Resets priority buttons to default state (Medium)
 */
function resetPriorityButtons() {
  const buttons = document.querySelectorAll(".priority-buttons__button");
  if (!buttons.length) return;

  selectedPriority = "Medium";
  setInitialPriority(buttons);
}

/**
 * Gets the currently selected priority
 * @returns {string} The selected priority level
 */
function getSelectedPriority() {
  return selectedPriority || "Medium";
}
