

function noTaskTemplate() {
  return `
            <div class="card-no-task">
                <span>No tasks To do</span>
            </div>`;
}

function taskTemplate(id, type, title, description) {
  return `
            <div class="card-task" draggable="true">
                <p class="card-type">${type}</p>
                <span class="card-title">${title}</span>
                <p class="story">${description}</p>
            </div>`;
}


