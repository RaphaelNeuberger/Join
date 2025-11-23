let tasks = [];

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
  const url =
    'https://join-60a91-default-rtdb.europe-west1.firebasedatabase.app/tasks.json';

  const response = await fetch(url, { cache: 'no-store' });

  if (!response.ok) {
    throw new Error('Fetch failed');
  }

  return response.json();
}

function dispatchTasksLoaded(tasksArray) {
  document.dispatchEvent(
    new CustomEvent('tasksLoaded', { detail: tasksArray })
  );
}

function normalizeTasks(raw) {
  if (!raw) return [];

  if (Array.isArray(raw)) {
    return raw.filter(Boolean).map(enrichTask);
  }

  return Object.entries(raw).map(([key, value]) => {
    return enrichTask({ ...value, id: value.id || key });
  });
}

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



function generateId() {
  return String(Date.now() + Math.random());
}


document.addEventListener('DOMContentLoaded', fetchTasks);
