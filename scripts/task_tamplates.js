

function noTaskTemplate() {
  return `
            <div class="card-no-task">
                <span>No tasks To do</span>
            </div>`;
}


function taskTemplate(task) {
  return `
    <div class="card-task"
         draggable="true"
         ondragstart="dragstartHandler(event)"
         data-task-id="${task.id}">
      <p class="card-type">${task.Category}</p>
      <span class="card-title">${task.Title}</span>
      <p class="story">${task.Description}</p>
    </div>`;
}




