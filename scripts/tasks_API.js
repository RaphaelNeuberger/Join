let tasks = [];
const FIREBASE_BASE_URL =
  'https://join-60a91-default-rtdb.europe-west1.firebasedatabase.app';
const TASKS_BASE_URL = `${FIREBASE_BASE_URL}/tasks`;
function normalizeTaskStatus(status = '') {
  const value = String(status).trim().toLowerCase();

  if (!value) return 'todo';

  if (value === 'inprogress' || value === 'in-progress' || value === 'in_progress') {
    return 'inprogress';
  }

  if (value === 'awaitfeedback' || value === 'await-feedback' || value === 'await_feedback') {
    return 'await_feedback';
  }

  if (value === 'done') return 'done';

  if (value === 'todo') return 'todo';

  return value;
}


async function fetchTasks() {
  try {
    const response = await fetch(`${TASKS_BASE_URL}.json`, {
      cache: 'no-store'
    });

    if (!response.ok) {
      tasks = [];
      return tasks;
    }

    const data = await response.json();
    tasks = normalizeTasks(data);
    return tasks;
  } catch (_error) {
    tasks = [];
    return tasks;
  }
}
function normalizeTasks(raw) {
  if (!raw) return [];

  if (Array.isArray(raw)) {
    return raw.filter(Boolean).map((value) => enrichTask(value));
  }

  return Object.entries(raw).map(([firebaseId, value]) =>
    enrichTask({ ...value, firebaseId })
  );
}
function enrichTask(task) {
  const idFromTask = task.id || task.firebaseId;
  const id = idFromTask || generateId();

  const assigned = Array.isArray(task.assignedTo)
    ? task.assignedTo
    : task.assignedTo
    ? [task.assignedTo]
    : [];

  const subtasks = Array.isArray(task.subtasks) ? task.subtasks : [];
  const status = normalizeTaskStatus(task.status || 'todo');

  return {
    id,
    firebaseId: task.firebaseId || id,
    title: task.title || '',
    description: task.description || '',
    dueDate: task.dueDate || '',
    priority: task.priority || 'Medium',
    category: task.category || 'User Story',
    assignedTo: assigned,
    subtasks,
    status
  };
}
async function addTask(taskData) {
  const cleanTask = enrichTask({
    ...taskData,
    id: undefined,
    firebaseId: undefined
  });

  const { firebaseId: _ignore, ...payload } = cleanTask;

  const response = await fetch(`${TASKS_BASE_URL}.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error('addTask: request failed');
  }

  const result = await response.json();
  const firebaseId = result && result.name ? result.name : cleanTask.id;

  const newTask = enrichTask({
    ...payload,
    firebaseId
  });

  tasks.push(newTask);
  return newTask;
}
async function updateTaskStatus(taskId, newStatus) {
  const index = tasks.findIndex((t) => String(t.id) === String(taskId));
  if (index === -1) return;

  const task = tasks[index];
  const firebaseId = task.firebaseId || task.id;
  const normalizedStatus = normalizeTaskStatus(newStatus);

  if (!firebaseId) {
    tasks[index] = { ...task, status: normalizedStatus };
    return;
  }

  const response = await fetch(`${TASKS_BASE_URL}/${firebaseId}.json`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: normalizedStatus })
  });

  if (!response.ok) {
    throw new Error('updateTaskStatus: request failed');
  }

  tasks[index] = { ...task, status: normalizedStatus };
}
function generateId() {
  return String(Date.now() + Math.random());
}
async function saveTask(task) {
  let firebaseId = task.firebaseId;

  if (!firebaseId) {
    const existing = tasks.find((t) => String(t.id) === String(task.id));
    if (existing && existing.firebaseId) {
      firebaseId = existing.firebaseId;
    } else {
      firebaseId = task.id;
    }
  }

  const response = await fetch(`${TASKS_BASE_URL}/${firebaseId}.json`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task)
  });

  if (!response.ok) {
    throw new Error('saveTask: HTTP ' + response.status);
  }
}
async function deleteTaskById(taskId) {
  const task = tasks.find(
    (t) =>
      String(t.id) === String(taskId) ||
      String(t.firebaseId) === String(taskId)
  );

  const firebaseId = task && task.firebaseId ? task.firebaseId : taskId;

  const response = await fetch(`${TASKS_BASE_URL}/${firebaseId}.json`, {
    method: 'DELETE'
  });

  if (!response.ok) {
    throw new Error('deleteTaskById: request failed');
  }
}
