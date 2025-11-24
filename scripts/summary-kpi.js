// scripts/summary-kpi.js
// Lädt Tasks aus Firebase und aktualisiert die KPI-Werte
(function () {
  async function init() {
    // Warte bis firebase-init.js geladen ist
    if (!window.firebaseDb || !window.ref || !window.onValue) {
      setTimeout(init, 100);
      return;
    }

    const tasksRef = window.ref(window.firebaseDb, "tasks");
    window.onValue(tasksRef, (snapshot) => {
      const val = snapshot.val() || {};
      const tasks = Object.keys(val).map((k) => ({ id: k, ...val[k] }));
      updateKPIs(tasks);
    });
  }

  function updateKPIs(tasks) {
    // Zähle Tasks nach Status
    const todo = tasks.filter(
      (t) => t.status === "todo" || t.status === "To do"
    ).length;
    const done = tasks.filter(
      (t) => t.status === "done" || t.status === "Done"
    ).length;
    const urgent = tasks.filter(
      (t) => t.priority === "urgent" || t.priority === "Urgent"
    ).length;
    const progress = tasks.filter((t) => t.status === "inProgress").length;
    const feedback = tasks.filter((t) => t.status === "awaitFeedback").length;
    const total = tasks.length;

    // Aktualisiere die DOM-Elemente
    updateElement("kpi-todo", todo);
    updateElement("kpi-done", done);
    updateElement("kpi-urgent", urgent);
    updateElement("kpi-progress", progress);
    updateElement("kpi-feedback", feedback);
    updateElement("kpi-board", total);
  }

  function updateElement(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  document.addEventListener("DOMContentLoaded", init);
})();
