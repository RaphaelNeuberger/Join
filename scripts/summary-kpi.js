// scripts/summary-kpi.js
// Loads tasks from Firebase and updates KPI values
(function () {
  async function init() {
    // Warte bis firebase-init.js geladen ist
    if (!window.firebaseDb || !window.ref || !window.onValue) {
      setTimeout(init, 100);
      return;
    }

    if (typeof seedTasksIfEmpty === "function") {
      await seedTasksIfEmpty();
    }

    const tasksRef = window.ref(window.firebaseDb, "tasks");
    window.onValue(tasksRef, (snapshot) => {
      const val = snapshot.val() || {};
      const tasks = Object.keys(val).map((k) => ({ id: k, ...val[k] }));
      updateKPIs(tasks);
    });
  }

  /**
   * Count tasks by status type.
   */
  function countByStatus(tasks, ...statusValues) {
    return tasks.filter((t) => statusValues.some((s) => t.status === s)).length;
  }

  /**
   * Filter tasks by priority.
   */
  function filterByPriority(tasks, priority) {
    const lowerPriority = priority.toLowerCase();
    return tasks.filter(
      (t) => t.priority && t.priority.toLowerCase() === lowerPriority
    );
  }

  /**
   * Update all KPI values in DOM.
   */
  function updateAllKPIElements(counts) {
    updateElement("kpi-todo", counts.todo);
    updateElement("kpi-done", counts.done);
    updateElement("kpi-urgent", counts.urgent);
    updateElement("kpi-progress", counts.progress);
    updateElement("kpi-feedback", counts.feedback);
    updateElement("kpi-board", counts.total);
  }

  function updateKPIs(tasks) {
    const counts = {
      todo: countByStatus(tasks, "todo", "To do"),
      done: countByStatus(tasks, "done", "Done"),
      progress: countByStatus(tasks, "inprogress", "inProgress", "in-progress"),
      feedback: countByStatus(
        tasks,
        "await_feedback",
        "awaitFeedback",
        "await-feedback"
      ),
      urgent: filterByPriority(tasks, "urgent").length,
      total: tasks.length,
    };

    updateAllKPIElements(counts);
    updateUrgentDeadline(filterByPriority(tasks, "urgent"));
  }

  function updateElement(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  /**
   * Find earliest due date from task list.
   */
  function findEarliestTask(tasks) {
    return tasks.reduce((earliest, current) => {
      const currentDate = new Date(current.dueDate);
      const earliestDate = new Date(earliest.dueDate);
      return currentDate < earliestDate ? current : earliest;
    });
  }

  /**
   * Format date as "Month Day, Year".
   */
  function formatDeadlineDate(dateStr) {
    const date = new Date(dateStr);
    const options = { year: "numeric", month: "long", day: "numeric" };
    return date.toLocaleDateString("en-US", options);
  }

  function updateUrgentDeadline(urgentTasks) {
    const deadlineEl = document.querySelector(".deadlinedate");
    if (!deadlineEl) return;

    if (urgentTasks.length === 0) {
      deadlineEl.textContent = "No urgent tasks";
      return;
    }

    const tasksWithDate = urgentTasks.filter((t) => t.dueDate);
    if (tasksWithDate.length === 0) {
      deadlineEl.textContent = "No deadline set";
      return;
    }

    const earliestTask = findEarliestTask(tasksWithDate);
    deadlineEl.textContent = formatDeadlineDate(earliestTask.dueDate);
  }

  document.addEventListener("DOMContentLoaded", init);
})();
