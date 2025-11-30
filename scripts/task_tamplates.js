
function noTaskTemplate() {
  return (
    '<div class="card-no-task">' +
    '<span>No tasks To do</span>' +
    '</div>'
  );
}

const AVATAR_COLORS = [
  'rgb(110, 82, 255)',
  'rgb(253, 112, 255)',
  'rgb(70, 47, 138)',
  'rgb(255, 188, 43)',
  'rgb(30, 214, 193)',
  'rgb(255, 123, 0)'
];

function getInitials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => (part[0] || '').toUpperCase())
    .join('');
}

function getAvatarColor(name = '', index = 0) {
  if (!AVATAR_COLORS.length) {
    return '#ff7a00';
  }

  const hash = name
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);

  const colorIndex = (hash + index) % AVATAR_COLORS.length;
  return AVATAR_COLORS[colorIndex];
}

function renderAssignees(assignees = []) {
  if (!Array.isArray(assignees)) {
    assignees = assignees ? [assignees] : [];
  }

  return assignees
    .map((name, index) => {
      const color = getAvatarColor(name, index);
      const initials = getInitials(name);

      return (
        '<span class="assigned-avatar" style="background-color: ' +
        color +
        ';">' +
        initials +
        '</span>'
      );
    })
    .join('');
}


function taskTemplate(task) {
  return `
    <div class="card-task"
         draggable="true"
         ondragstart="dragstartHandler(event)"
         data-task-id="${task.id}">
      <p class="card-type">${task.category}</p>
      <span class="card-title">${task.title}</span>
      <p class="story">${task.description || ''}</p>
      <div class="card-footer">
        <div class="assigned-list">
          ${renderAssignees(task.assignedTo)}
        </div>
        <div class="priority">${String(task.priority || '').toLowerCase()}</div>
      </div>
    </div>
  `;
}
/*
function overlayTaskCard( ) {
  return `
<div class="card-task"
         draggable="true"
         ondragstart="dragstartHandler(event)"
         data-task-id="${task.id}">
         
      <p class="card-type">${task.category}</p>
      
      <span class="card-title">${task.title}</span>
      
      <p class="story">
        ${task.description}
      </p>

      <div class="card-footer">
        <div class="assigned-list">
          ${renderAssignees(task.assignedTo)}
        </div>

        <div class="priority">
          ${String(task.priority || "").toLowerCase()}
        </div>
      </div>

    </div>  
  `;   
}
*/