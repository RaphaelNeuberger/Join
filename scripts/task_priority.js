
let selectedPriority = "Medium";

function initPriorityButtons() {
  const buttons = document.querySelectorAll(".priority-buttons__button");
  if (!buttons.length) return;

  setupPriorityButtonInteractions(buttons);
  setInitialPriority(buttons);
}

function setPriorityActive(buttons, activeButton) {
  buttons.forEach((button) => {
    button.classList.remove("is-active");
    button.setAttribute("aria-pressed", "false");
  });

  activeButton.classList.add("is-active");
  activeButton.setAttribute("aria-pressed", "true");
  selectedPriority = activeButton.dataset.priority || "Medium";
}

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

function resetPriorityButtons() {
  const buttons = document.querySelectorAll(".priority-buttons__button");
  if (!buttons.length) return;

  selectedPriority = "Medium";
  setInitialPriority(buttons);
}

function getSelectedPriority() {
  return selectedPriority || "Medium";
}
