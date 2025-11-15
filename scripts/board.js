initBoard();

function initBoard() {
  setUpEmptyColumnObservers();
}

function setUpEmptyColumnObservers() {
  const columns = document.querySelectorAll(".task-cards");
  columns.forEach((column) => {
    toggleNoTaskPlaceholder(column);
    const observer = new MutationObserver(() =>
      toggleNoTaskPlaceholder(column)
    );
    observer.observe(column, { childList: true });
  });
}

function toggleNoTaskPlaceholder(column) {
  const hasTask = column.querySelector(".card-task");
  const placeholder = column.querySelector(".card-no-task");
  if (!hasTask && !placeholder) {
    column.insertAdjacentHTML("beforeend", noTaskTemplate());
  } else if (hasTask && placeholder) {
    placeholder.remove();
  }
}

function dragstartHandler(ev) {
  ev.dataTransfer.setData("text", ev.target.id);
}

function dragoverHandler(ev) {
  ev.preventDefault();
}

function dropHandler(ev) {
  ev.preventDefault();
  const data = ev.dataTransfer.getData("text");
  ev.target.appendChild(document.getElementById(data));
}
