function loadScripts() {
  includeHeaderHTML();
  includeSidebarHTML();
  renderToDoTasks();      
  renderNoTasksIfEmpty(); 


}
function renderNoTasksIfEmpty() {
  const taskBoards = document.querySelectorAll('.task-cards');

  taskBoards.forEach((board) => {
    const hasTask = board.querySelector('.card-task');
    const placeholder = board.querySelector('.card-no-task');

    if (hasTask && placeholder) {
      placeholder.remove();
    } if (!hasTask && !placeholder) {
      board.innerHTML = noTaskTemplate();
    }
  });
}


function renderToDoTasks() {
  const toDoContainer = document.getElementById('to-do-tasks');
  toDoContainer.innerHTML = '';

  tasks.forEach((task) => {
    toDoContainer.innerHTML += taskTemplate(task);
  });
}
/**
 * Speichert die Task-ID beim Start des Drag-Vorgangs.
 * @param {DragEvent} event
 */
function dragstartHandler(event) {
  const taskElement = event.target;
  const taskId = taskElement.dataset.taskId;
  event.dataTransfer.setData('text/plain', taskId);
}
/**
 * Erlaubt das Droppen auf einer Spalte.
 * @param {DragEvent} event
 */
function dragoverHandler(event) {
  event.preventDefault();
}
/**
 * Verschiebt eine Task-Karte in die gedroppte Spalte.
 * @param {DragEvent} event
 */
function dropHandler(event) {
  event.preventDefault();

  const taskId = event.dataTransfer.getData('text/plain');
  const column = event.currentTarget;
  const dropZone = column.querySelector('.task-cards');
  const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);

  if (taskElement && dropZone) {
    dropZone.appendChild(taskElement);
    renderNoTasksIfEmpty();
  }
}
