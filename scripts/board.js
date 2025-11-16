function loadScripts() {
  includeHeaderHTML();
  includeSidebarHTML();
  loadTasksFromDb();
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
    const hasTask = board.querySelector(".card-task");

    if (!hasTask) {
      board.innerHTML = noTaskTemplate();
    }
  });
}
