let tasks = [];

const TASKS_URL =
  'https://join-60a91-default-rtdb.europe-west1.firebasedatabase.app/tasks.json';

async function fetchTasks() {
  try {
    const data = await requestTasksFromFirebase();
    tasks = normalizeTasks(data);
    return tasks;
  } catch {
    tasks = [];
    return tasks;
  }
}

async function requestTasksFromFirebase() {
  const response = await fetch(TASKS_URL, { cache: 'no-store' });

  if (!response.ok) {
    throw new Error('Fetch failed');
  }

  return response.json();
}

/**
 * Normalisiert verschiedene Firebase-Strukturen zu einem Array.
 */
function normalizeTasks(raw) {
  if (!raw) return [];

  if (Array.isArray(raw)) {
    return raw.filter(Boolean).map(enrichTask);
  }

  return Object.entries(raw).map(([key, value]) => {
    return enrichTask({ ...value, id: value.id || key });
  });
}

/**
 * Ergänzt fehlende Felder mit Defaults.
 */
function enrichTask(task) {
  return {
    id: task.id || generateId(),
    title: task.title || '',
    description: task.description || '',
    dueDate: task.dueDate || '',
    priority: task.priority || 'Medium',
    category: task.category || 'User Story',
    assignedTo: Array.isArray(task.assignedTo)
      ? task.assignedTo
      : task.assignedTo
      ? [task.assignedTo]
      : [],
    subtasks: Array.isArray(task.subtasks) ? task.subtasks : [],
    status: task.status || 'todo'
  };
}

/**
 * Wandelt das Task-Array in ein Objekt { id: task } für Firebase.
 */
function mapTasksToObject(taskList) {
  return taskList.reduce((acc, task) => {
    acc[task.id] = task;
    return acc;
  }, {});
}

/**
 * Speichert alle Tasks gesammelt in Firebase (ohne LocalStorage).
 */
async function saveTasks() {
  const payload = mapTasksToObject(tasks);

  await fetch(TASKS_URL, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
}

/**
 * Aktualisiert NUR den Status eines Tasks im Array + in Firebase.
 */
async function updateTaskStatus(taskId, newStatus) {
  const index = tasks.findIndex((t) => String(t.id) === String(taskId));
  if (index === -1) return;

  tasks[index] = {
    ...tasks[index],
    status: newStatus
  };

  await saveTasks();
}

/**
 * Schließt das Add-Task-Overlay.
 */
function closeTaskBtn() {
  const overlay = document.querySelector('.overlay-modal');
  if (!overlay) return;
  overlay.style.display = 'none';
}

/**
 * Erzeugt eine eindeutige ID.
 */
function generateId() {
  return String(Date.now() + Math.random());
}
