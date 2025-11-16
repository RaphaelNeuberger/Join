

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
      <p class="card-type">${task.category}</p>
      <span class="card-title">${task.title}</span>
      <p class="story">${task.description}</p>
      <div class="card-footer">
        <div class="assigned-list">
          ${renderAssignees(task.assignedTo)}
        </div>
        <div class="priority"> 
          ${task.priority.toLowerCase()}
        </div>
      </div>
    </div>`;
}

