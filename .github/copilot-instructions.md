# 🤖 Copilot Instructions

Diese Datei beschreibt, **wie GitHub Copilot Code-Vorschläge für dieses Projekt erzeugen soll.**

---

## 🌐 Projektkontext

Dieses Projekt verwendet **reines HTML, CSS und JavaScript (ES6)**.  
Ziel ist es, eine **strukturierte, responsive und wartbare** Website zu entwickeln, die gute Performance und Lesbarkeit bietet.  
Kein Build-Framework (z. B. React, Vue, Angular) wird genutzt.

---

## 🧱 Code-Struktur

- **HTML-Dateien** befinden sich im ``.
- **CSS-Dateien** liegen in `styles/`.
- **JavaScript-Dateien** liegen in `scripts/` und alle anderen die Main Script in `scripts.js`
- Verwende **relativ kurze Dateien** und **modulare JS-Funktionen**.
- Kein Inline-JavaScript oder Inline-CSS in HTML (Trennung von Struktur, Stil und Logik).

---

## Code-Stil & Formatierung

### HTML

- Verwende **semantische HTML-Tags** (`<header>`, `<main>`, `<section>`, `<footer>` usw.).
- Einrückung: **2 Leerzeichen**.
- Schließe alle Tags korrekt.
- Verwende **aussagekräftige `alt`-Attribute** bei Bildern.
- Keine Inline-Styles.
- schua das das HTML

### CSS

- Verwende **BEM-Namenskonvention** (`.block__element--modifier`).
- Verwende **CSS-Variablen** (`--color-primary`) für Farben, Abstände und Fonts.
- Keine IDs zum Stylen, nur Klassen.
- keine Deutsche erklärung nur english
- Mobile-First min-width: 320px mit Media Queries:
  ```css
  @media (min-width: 768px) {
    /* Desktop styles */
  }
  ```

### JavaScript

- init () per onload funktion im HTML im body
- keine Deutsche erklärung nur english
- jede Funktion darf nicht länger als 14 zeilen haben
- Jede JS Datei darf nicht länger als 400 zeichen haben

# GitHub Copilot Instructions for Join

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
