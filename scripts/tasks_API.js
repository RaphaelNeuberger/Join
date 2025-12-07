// scripts/tasks_API.js

// Globale Task-Liste
let tasks = [];

const FIREBASE_BASE_URL =
  "https://join-60a91-default-rtdb.europe-west1.firebasedatabase.app";
const TASKS_BASE_URL = `${FIREBASE_BASE_URL}/tasks`;

/**
 * Check if status matches in-progress variants.
 */
function isInProgressStatus(value) {
  return (
    value === "inprogress" || value === "in-progress" || value === "in_progress"
  );
}

/**
 * Check if status matches await-feedback variants.
 */
function isAwaitFeedbackStatus(value) {
  return (
    value === "awaitfeedback" ||
    value === "await-feedback" ||
    value === "await_feedback"
  );
}

/**
 * Normalize status values to: 'todo' | 'inprogress' | 'await_feedback' | 'done'
 */
function normalizeTaskStatus(status = "") {
  const value = String(status).trim().toLowerCase();
  if (!value) return "todo";
  if (isInProgressStatus(value)) return "inprogress";
  if (isAwaitFeedbackStatus(value)) return "await_feedback";
  if (value === "done") return "done";
  if (value === "todo") return "todo";
  return value;
}

/**
 * Tasks aus Firebase holen, normalisieren und in globale Variable "tasks" schreiben.
 */
async function fetchTasks() {
  try {
    const response = await fetch(`${TASKS_BASE_URL}.json`, {
      cache: "no-store",
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

/**
 * Rohe Firebase-Struktur (Array oder Objekt) in konsistente Task-Objekte überführen.
 */
function normalizeTasks(raw) {
  if (!raw) return [];

  if (Array.isArray(raw)) {
    return raw.filter(Boolean).map((value) => enrichTask(value));
  }

  return Object.entries(raw).map(([firebaseId, value]) =>
    enrichTask({ ...value, firebaseId })
  );
}

/**
 * Task mit Default-Werten, normalisiertem Status, ID und AssignedTo/Subtasks anreichern.
 */
function enrichTask(task) {
  const idFromTask = task.id || task.firebaseId;
  const id = idFromTask || generateId();

  const assigned = Array.isArray(task.assignedTo)
    ? task.assignedTo
    : task.assignedTo
    ? [task.assignedTo]
    : [];

  const subtasks = Array.isArray(task.subtasks) ? task.subtasks : [];
  const status = normalizeTaskStatus(task.status || "todo");

  return {
    id,
    firebaseId: task.firebaseId || id,
    title: task.title || "",
    description: task.description || "",
    dueDate: task.dueDate || "",
    priority: task.priority || "Medium",
    category: task.category || "User Story",
    assignedTo: assigned,
    subtasks,
    status,
  };
}

/**
 * Neuen Task in Firebase anlegen und in lokale tasks-Liste pushen.
 */
async function addTask(taskData) {
  const cleanTask = enrichTask({
    ...taskData,
    id: undefined,
    firebaseId: undefined,
  });

  const { firebaseId: _ignore, ...payload } = cleanTask;

  const response = await fetch(`${TASKS_BASE_URL}.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("addTask: request failed");
  }

  const result = await response.json();
  const firebaseId = result && result.name ? result.name : cleanTask.id;

  const newTask = enrichTask({
    ...payload,
    firebaseId,
  });

  tasks.push(newTask);
  return newTask;
}

/**
 * Status eines Tasks in Firebase und lokal aktualisieren.
 */
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
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: normalizedStatus }),
  });

  if (!response.ok) {
    throw new Error("updateTaskStatus: request failed");
  }

  tasks[index] = { ...task, status: normalizedStatus };
}

/**
 * Einfache ID-Generierung auf Basis von Timestamp + Random.
 */
function generateId() {
  return String(Date.now() + Math.random());
}

/**
 * Task vollständig speichern (PUT) – inkl. Subtasks, Priority etc.
 */
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
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(task),
  });

  if (!response.ok) {
    throw new Error("saveTask: HTTP " + response.status);
  }
}

/**
 * Task aus Firebase löschen.
 */
async function deleteTaskById(taskId) {
  const task = tasks.find(
    (t) =>
      String(t.id) === String(taskId) || String(t.firebaseId) === String(taskId)
  );

  const firebaseId = task && task.firebaseId ? task.firebaseId : taskId;

  const response = await fetch(`${TASKS_BASE_URL}/${firebaseId}.json`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("deleteTaskById: request failed");
  }
}

/**
 * Seed initial tasks if database is empty.
 */
async function seedTasksIfEmpty() {
  try {
    const response = await fetch(`${TASKS_BASE_URL}.json`);
    if (!response.ok) return;

    const data = await response.json();

    if (data && Object.keys(data).length > 0) {
      return;
    }

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextMonth = new Date(today);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const formatDate = (date) => date.toISOString().split("T")[0];

    const sampleTasks = [
      {
        title: "Design new landing page",
        description:
          "Create mockups and wireframes for the new product landing page with focus on conversion optimization.",
        dueDate: formatDate(nextWeek),
        category: "Technical Tasks",
        priority: "Urgent",
        status: "todo",
        assignedTo: ["Sofia Müller", "David Eisenberg"],
        subtasks: [
          { title: "Research competitor designs", done: true },
          { title: "Create wireframes", done: false },
          { title: "Design high-fidelity mockups", done: false },
        ],
      },
      {
        title: "Implement user authentication",
        description:
          "Add Firebase authentication with email/password and social login options.",
        dueDate: formatDate(tomorrow),
        category: "Technical Tasks",
        priority: "Urgent",
        status: "inprogress",
        assignedTo: ["Anton Mayer"],
        subtasks: [
          { title: "Set up Firebase Auth", done: true },
          { title: "Create login form", done: true },
          { title: "Add password reset", done: false },
          { title: "Implement social login", done: false },
        ],
      },
      {
        title: "User feedback collection",
        description:
          "Gather and analyze user feedback from the beta testing phase to improve UX.",
        dueDate: formatDate(nextMonth),
        category: "User Story",
        priority: "Medium",
        status: "await_feedback",
        assignedTo: ["Anja Schulz", "Benedikt Ziegler"],
        subtasks: [
          { title: "Send feedback survey", done: true },
          { title: "Analyze responses", done: false },
        ],
      },
      {
        title: "Update documentation",
        description:
          "Update API documentation and user guides for the latest feature release.",
        dueDate: formatDate(nextWeek),
        category: "Technical Tasks",
        priority: "Low",
        status: "todo",
        assignedTo: ["Sofia Müller"],
        subtasks: [],
      },
      {
        title: "Fix mobile responsiveness",
        description:
          "Resolve layout issues on mobile devices, especially for the dashboard page.",
        dueDate: formatDate(tomorrow),
        category: "Technical Tasks",
        priority: "Medium",
        status: "done",
        assignedTo: ["David Eisenberg", "Anton Mayer"],
        subtasks: [
          { title: "Test on iOS devices", done: true },
          { title: "Test on Android devices", done: true },
          { title: "Fix CSS issues", done: true },
        ],
      },
      {
        title: "Prepare sprint review presentation",
        description:
          "Create slides and demo for the upcoming sprint review meeting with stakeholders.",
        dueDate: formatDate(nextWeek),
        category: "User Story",
        priority: "Medium",
        status: "inprogress",
        assignedTo: ["Benedikt Ziegler"],
        subtasks: [
          { title: "Collect sprint achievements", done: true },
          { title: "Create presentation slides", done: false },
          { title: "Prepare live demo", done: false },
        ],
      },
      {
        title: "Database optimization",
        description:
          "Optimize database queries to improve application performance and reduce load times.",
        dueDate: formatDate(nextMonth),
        category: "Technical Tasks",
        priority: "Low",
        status: "todo",
        assignedTo: ["Anton Mayer", "David Eisenberg"],
        subtasks: [
          { title: "Analyze slow queries", done: false },
          { title: "Add database indexes", done: false },
          { title: "Test performance improvements", done: false },
        ],
      },
    ];

    for (const task of sampleTasks) {
      await fetch(`${TASKS_BASE_URL}.json`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(task),
      });
    }
  } catch (error) {
    console.error("Error seeding tasks:", error);
  }
}
