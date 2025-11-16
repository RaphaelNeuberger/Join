function loadScripts() {
  includeHeaderHTML();
  includeSidebarHTML();
  renderNoTasksIfEmpty();
}
function renderNoTasksIfEmpty() {
  const taskBoards = document.querySelectorAll('.task-cards');

  taskBoards.forEach((board) => {
    const hasTask = board.querySelector('.card-task');

    if (!hasTask) {
      board.innerHTML = noTaskTemplate();
    }
  });
}
