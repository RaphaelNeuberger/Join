function loadScripts() {
  includeHeaderHTML();
  includeSidebarHTML();
<<<<<<< HEAD
  loadTasksFromDb();
=======
  renderToDoTasks();      
  renderNoTasksIfEmpty(); 


>>>>>>> 937e3a976f41d1c861e20620c81144f97aebeee1
}

function loadTasksFromDb() {
  // If Firebase is available, listen for tasks under 'tasks'
  if (window.firebaseDb && window.ref && window.onValue) {
    try {
      const tasksRef = window.ref(window.firebaseDb, "tasks");
      window.onValue(
        tasksRef,
        (snapshot) => {
          const data = snapshot.val() || {};
          const tasksArray = Object.values(data);
          renderTasks(tasksArray);
        },
        (err) => {
          console.error("Error reading tasks from DB:", err);
          renderNoTasksIfEmpty();
        }
      );
    } catch (err) {
      console.error("Error accessing Firebase:", err);
      renderNoTasksIfEmpty();
    }
  } else {
    // fallback: render no-tasks placeholders
    renderNoTasksIfEmpty();
  }
}

function renderTasks(tasksArray) {
  const toDo = document.getElementById("to-do-tasks");
  const inProgress = document.getElementById("in-progress-tasks");
  const awaitFeedback = document.getElementById("await-feedback-tasks");
  const done = document.getElementById("done-tasks");

  // clear existing
  [toDo, inProgress, awaitFeedback, done].forEach((el) => (el.innerHTML = ""));

  if (!tasksArray || tasksArray.length === 0) {
    renderNoTasksIfEmpty();
    return;
  }

  tasksArray.forEach((task) => {
    const id = task.id || "";
    const title = task.title || "";
    const description = task.description || "";
    const status = (task.status || "todo").toString().toLowerCase();
    const html = taskTemplate(id, task.category || "", title, description);

    if (
      status === "inprogress" ||
      status === "in-progress" ||
      status === "in progress"
    ) {
      inProgress.insertAdjacentHTML("beforeend", html);
    } else if (
      status === "awaitfeedback" ||
      status === "await-feedback" ||
      status === "await feedback"
    ) {
      awaitFeedback.insertAdjacentHTML("beforeend", html);
    } else if (status === "done") {
      done.insertAdjacentHTML("beforeend", html);
    } else {
      toDo.insertAdjacentHTML("beforeend", html);
    }
  });
}

function renderNoTasksIfEmpty() {
  const taskBoards = document.querySelectorAll(".task-cards");

  taskBoards.forEach((board) => {
<<<<<<< HEAD
    const hasTask = board.querySelector(".card-task");
=======
    const hasTask = board.querySelector('.card-task');
    const placeholder = board.querySelector('.card-no-task');
>>>>>>> 937e3a976f41d1c861e20620c81144f97aebeee1

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
 * 
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


function renderAssignees(assignees = []) {
  if (!Array.isArray(assignees)) {
    assignees = assignees ? [assignees] : [];
  }
  return assignees
    .map((name, index) => {
      const color = getAvatarColor(name, index);
      return `<span class="assigned-avatar" style="background-color: ${color};">${getInitials(name)}</span>`;
    })
    .join('');
}

function getAvatarColor(name = '', index = 0) {
  if (!AVATAR_COLORS.length) return '#ff7a00';
  const hash = name
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return AVATAR_COLORS[(hash + index) % AVATAR_COLORS.length];
}
