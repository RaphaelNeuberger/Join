# 🤖 Copilot Instructions

Diese Datei beschreibt, **wie GitHub Copilot Code-Vorschläge für dieses Projekt erzeugen soll.**

## 🌐 Projektkontext

Dieses Projekt verwendet **reines HTML, CSS und JavaScript (ES6)**.  
Ziel ist es, eine **strukturierte, responsive und wartbare** Website zu entwickeln, die gute Performance und Lesbarkeit bietet.  
Kein Build-Framework (z. B. React, Vue, Angular) wird genutzt.

## 🧱 Code-Struktur

## Code-Stil & Formatierung

### HTML

### CSS

```css
@media (min-width: 768px) {
  /* Desktop styles */
}
```

### JavaScript

# GitHub Copilot Instructions for Join

# 🤖 Copilot Instructions for Join

This file guides AI coding agents for the Join Kanban Task Management project. Follow these actionable rules for architecture, workflows, and conventions. **Focus on THIS codebase's patterns.**

---

## 🌐 Project Context

- Pure HTML, CSS, JavaScript (ES6+), no frameworks. Modular, maintainable, responsive MPA (Multi-Page Application).
- No build tools, no inline JS/CSS, no external UI libraries.
- Main pages: `index.html`, `add_task.html`, `board.html`, `contacts.html`, `login.html`, `register.html`, `legal-notice.html`, `privacypolicy.html`.

---

## 🧱 Architecture & Structure

- **HTML:** Semantic, static templates in `/`, includes via JS for header/sidebar. Accessibility: labels, aria, alt attributes.
- **CSS:** `/css/` folder, BEM naming, CSS variables for colors/spacings, mobile-first, no IDs for styling. Figma design tokens for spacing/colors/shadows.
- **JavaScript:** `/scripts/` folder, one file per page, shared logic in helpers/storage/templates. Max 400 LOC/file, max 14 lines/function, camelCase, 2 blank lines between functions, JSDoc for public functions.
- **Firebase:** Used for authentication and realtime DB (see `firebase-init.js`, `firebase-login.js`).

---

## 🛠️ Developer Workflows

- No build step; static hosting possible. All changes are visible after reload.
- Frequent, meaningful git commits. Never commit secrets. Use `.gitignore`.
- Manual testing in Chrome/Firefox/Safari/Edge. No console errors/warnings allowed.
- Seed at least 5 tasks and 10 contacts before submission.

---

## 📋 Key Conventions & Patterns

- **Task Management:** Kanban board (drag & drop, status columns), add/edit/delete tasks, subtasks (add on Enter, edit/delete on hover), priority levels, real-time search/filter.
- **Contacts:** Alphabetical groups, CRUD, assign to tasks, own account editable, validation for forms.
- **User Management:** Firebase login/register, guest login, redirect unauthenticated users from protected pages.
- **Forms:** Custom validation (no native HTML5), disable submit while loading, instant feedback, created items render immediately.
- **Responsiveness:** 1920px–320px, mobile portrait default, vertical Kanban columns on mobile, max-width containers, no horizontal scroll.
- **Design:** Figma spacing/colors/shadows, inputs/buttons without default borders, transitions 75–125ms, cursor pointer on interactive elements.
- **Error Handling:** No uncaught errors, graceful user feedback, never leave disabled buttons stuck.

---

## 🔑 Example File References

- `scripts/board.js`: Kanban logic, drag & drop, search/filter, status updates.
- `scripts/add_task.js`: Task form, validation, subtask handling.
- `scripts/contacts.js`: Contact CRUD, assignment, validation.
- `scripts/storage.js`: Storage API for tasks/contacts/users/categories.
- `css/board.css`, `css/style.css`: Responsive layouts, BEM, design tokens.
- `firebase-init.js`, `firebase-login.js`: Firebase integration.

---

## ✅ Definition of Done

- All acceptance criteria for user stories (Accounts/Admin, Kanban, Contacts, Legal pages) met.
- No console issues, all pages responsive, manual tests passed.
- Public GitHub repo link provided.

---

**For unclear or missing conventions, ask for feedback and iterate.**

---

## 📑 Join Checkliste – Ergänzende Anforderungen

### Aufgaben & Akzeptanzkriterien (Auszug)

- **Tasks & Kanban:**

  - Mindestens 5 realistische Aufgaben sind vorab angelegt.
  - Aufgaben können erstellt, bearbeitet, gelöscht und zwischen Status verschoben werden (Drag & Drop).
  - Subtasks sind pro Aufgabe möglich, können hinzugefügt, bearbeitet und gelöscht werden.
  - Aufgaben zeigen Kategorie, Titel, Beschreibung, Priorität, Assignees und Subtask-Fortschritt.
  - Aufgaben werden nach Status gruppiert und sind filter-/suchbar.

- **Contacts:**

  - Mindestens 10 Kontakte sind vorab angelegt.
  - Kontakte können erstellt, bearbeitet und gelöscht werden.
  - Kontakte sind alphabetisch gruppiert und können Aufgaben zugewiesen werden.
  - Eigener Account ist als Kontakt editierbar.

- **User Management:**

  - Login/Registrierung mit Firebase, inkl. Gastzugang.
  - Validierung für E-Mail und Passwort, Policy-Checkbox bei Registrierung.
  - Unauthentifizierte Nutzer werden auf Login weitergeleitet.

- **Legal & Privacy:**

  - Impressum und Datenschutz sind als eigene Seiten vorhanden und verlinkt.
  - Header/Footer werden per Include eingebunden.

- **Design & Usability:**

  - Responsive für Desktop und Mobile (Portrait), keine horizontale Scrollbar.
  - Figma-Design wird eingehalten (Farben, Abstände, Schatten, max-width).
  - Interaktive Elemente haben `cursor: pointer`, Buttons/Inputs keine Standard-Border.
  - Animationen/Transitions 75–125ms, Feedback bei Aktionen (z.B. Toasts).

- **Testing & Qualität:**
  - Manuelle Tests auf Chrome, Firefox, Safari, Edge ohne Console-Fehler.
  - Alle User Stories und Akzeptanzkriterien sind erfüllt.
  - Die Anwendung ist öffentlich auf GitHub verfügbar.

This file encodes the full Join checklist into actionable guidance for GitHub Copilot. It is organized by page and by programming language (HTML, CSS, JavaScript). Copilot should follow these constraints when proposing code and reviews.

## Global Project Rules (apply to all pages)

- Architecture: Multi-Page Application (MPA). Start page is `index.html`.
- Files and structure: descriptive, consistent names. Max 400 LOC per file.
- No console errors/warnings/logs. Newly created content must be immediately visible.
- Git: frequent, meaningful commits; use `.gitignore`; never commit secrets.
- UX: provide intuitive feedback (hover, cursor pointer on buttons, toasts), transitions 75–125ms.
- Responsiveness: every page works from 1920px down to 320px, no horizontal scroll; mobile portrait by default; vertical Kanban columns on mobile; content has max-width for large monitors.
- Design: match Figma spacing, colors, shadows. Inputs and buttons without default borders (`border: unset;`).
- Forms: custom validation (not native HTML5). Disable primary button while loading. Created items appear right away.
- Clean code: functions do one thing, ≤14 lines (excluding template strings); camelCase; 2 blank lines between functions; JSDoc for public functions; static HTML not generated via JS.

---

## Pages and Languages

### 1) index.html (Summary/Dashboard)

- HTML: Provide sections to display task counts per status (ToDo, In Progress, Awaiting Feedback, Done) and “next deadline” highlight. Include a greeting container (e.g., `Good morning, {{name}}`).
- CSS: Responsive grid for KPIs; card components with shadows matching Figma; ensure `cursor: pointer` on interactive cards.
- JavaScript: Render counts from storage API; compute nearest due date; time-based greeting; zero-error console; functions ≤14 lines with JSDoc.

### 2) add_task.html

- HTML: Form fields: Title* (text), Description (textarea), Due Date* (date), Priority (urgent|medium|low; default medium), Assigned to (dropdown of contacts), Category\* (Technical Tasks|User Story), Subtasks (add-on-enter or add button). Prevent submission until required fields set.
- CSS: Form layout responsive; disabled submit button state; dropdown closes on outside click.
- JavaScript: Custom validation (no native HTML5); add Subtask on Enter in subtask field without submitting main form; while saving, disable submit; on success, persist and render immediately; dropdown outside click detection.

### 3) board.html (Kanban)

- HTML: Four columns (ToDo, In Progress, Awaiting Feedback, Done), each with a “+” to add task to that status. Search input on board top.
- CSS: Columns responsive; on mobile stack vertically; provide drag-over highlight (dashed box); subtle rotation/feedback while dragging.
- JavaScript:
  - Render task cards with: category, title, description preview, assignees (initials/avatars), priority, and subtask progress bar.
  - Real-time search filtering for title/description; empty-state message if no match.
  - Drag & Drop desktop and mobile: long-press on mobile or popup selector to move between columns; status updates persist.

### 4) contacts.html (Contacts)

- HTML: Alphabetically grouped contacts with letter headers; contact detail view (name, email, phone). Include add/edit/delete flows; include own account entry editable.
- CSS: List groups sticky headers if feasible; responsive detail drawer/modal.
- JavaScript: CRUD operations; editing pre-fills fields; deleting removes from tasks’ assignees; validation for add/edit forms.

### 5) login.html / register.html

- HTML: Login (email, password). Register (name, email, password, accept privacy policy checkbox). Include guest login entry point.
- CSS: Accessible forms with clear error states.
- JavaScript:
  - Login error for invalid credentials.
  - Register validates email/password; disables submit until required fields are valid and policy accepted.
  - Redirect unauthenticated users who visit protected pages (Summary, Add Task, Board, Contacts) to login.

### 6) legal-notice.html / privacypolicy.html

- HTML/CSS: Keep structure; ensure links valid; English content provided; include header/footer via include mechanism.
- JavaScript: None required beyond header include.

---

## JavaScript Guidelines (global)

- File layout:
  - One page-specific JS file per page (e.g., `scripts/board.js`, `scripts/add_task.js`).
  - One cross-page file for shared logic (e.g., `scripts/storage.js`, `scripts/helpers.js`, `scripts/templates.js`).
- Storage/API:
  - Implement storage module with methods for users, contacts, tasks, and categories.
  - Expose async methods: `getTasks()`, `createTask()`, `updateTask()`, `deleteTask()`, `getContacts()`, etc.
- Subtasks:
  - Add on Enter inside subtask input; do not submit main form.
  - Provide edit and delete for subtasks on hover.
- Drag & Drop:
  - Persistent status updates; smooth UX; visual feedback; mobile long-press fallback or move-via-popup.
- Search:
  - Debounced input; empty-state messaging; reset to full list on clear.
- Error handling:
  - No uncaught errors; graceful user feedback; never leave disabled buttons stuck.

## CSS Guidelines (global)

- Tokens: derive colors, spacing, radius, and shadows from Figma; define CSS variables in a root file.
- Interaction: `cursor: pointer` on interactive elements; transitions 75–125ms.
- Layout: fluid responsive grids; max-width content container on large screens; no horizontal scroll under 1920→320px.

## HTML Guidelines (global)

- Semantic elements for sections, headers, main, nav, footer.
- Accessibility: labels for inputs, aria attributes where appropriate.
- Keep static structure in HTML templates; avoid generating static DOM via JavaScript.

---

## Definition of Done (DoD)

- At least 5 realistic tasks and 10 contacts seeded before submission.
- All acceptance criteria met for User Stories across: Accounts/Admin, Kanban & Tasks, Contacts, Legal pages.
- Manual tests by team on latest Chrome/Firefox/Safari/Edge with no console issues.
- Public GitHub repo link provided.
