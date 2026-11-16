# Join - Kanban Task Management mit KI-Issue-Collector

A modern, responsive task management application built with vanilla JavaScript, HTML5, and CSS3. Join helps teams organize their workflow with an intuitive Kanban board, contact management, and real-time collaboration features.

**Version 1 erweitert Join um einen KI-gestuetzten Issue Collector:** Externe Stakeholder reichen Feature-Requests und Bug-Reports per E-Mail ein. Eine n8n-Automatisierung analysiert die Mail per OpenAI, erstellt strukturiert ein Ticket und legt es automatisch in einer "Triage"-Spalte ab - inklusive Tageslimit, Bestaetigungs- und Status-Mails.

![Join Logo](img/logo/join-logo.svg)

## KI-Issue-Collector (Modul 17)

### Was es macht

```
Stakeholder              n8n (self-hosted)                 Firebase RTDB
   |                                                          /tasks
   | E-Mail an                                                /rateLimits
   | R.Neuberger@newmountains.it                                 ^
   v                                                             |
Outlook-Postfach ---> [Workflow 1: Issue Collector]              |
                        Trigger -> KI-Analyse (OpenAI)           |
                        -> Ticket in "Triage" --------->---------+
                        -> Tageszaehler +1
                        -> Mail in "Erledigt" + Bestaetigung
                        Limit/Fehler -> "Zu bearbeiten" + Hinweis

Team-Mitglied verschiebt Ticket im Board
   | updateTaskStatus()  -- Webhook -->  [Workflow 2: Status Notification]
   |                                       -> Mail an externen Ersteller
```

### Features im Detail

- **"Triage"-Spalte** als Standard-Backlog - alle neuen Tickets (manuell + KI) landen hier
- **KI-Klassifizierung** (OpenAI GPT-4.1-mini): Kategorie (Technical Tasks / User Story), praegnanter Titel, Prioritaet (Urgent/Medium/Low nach Keywords), Deadline-Erkennung
- **KI-Hinweis** im Ticket-Beschreibungstext ("Dieses Ticket wurde KI-generiert...")
- **Ersteller-Tracking**: Absender wird als Ersteller gesetzt, im Task-Detail sichtbar mit Badge "Member" (intern, Link zum Profil) bzw. "Extern" (Link zur E-Mail) sowie Hinweis "Ai-generated ticket"
- **Throttling**: max. 10 KI-Tickets pro Tag (Kostenschutz), Zaehler in Firebase
- **Auto-Antworten**: Bestaetigung bei Ticket-Erstellung, Hinweis bei erreichtem Limit, "Wir melden uns" bei Fehlern
- **Status-Benachrichtigung**: externe Ersteller bekommen Mail bei Statusaenderung
- **Stakeholder-Seiten** (nach Figma, responsiv): `index.html` (Rollen-Auswahl), `stakeholder.html` (Anleitung + Live-Tageslimit-Anzeige, eigener Zustand bei erreichtem Limit), `request.html` (Anfrage-Formular, v. a. mobil)

### Demo-Nutzung (fuer Reviewer)

1. **`index.html`** oeffnen - waehle "Create request" (Stakeholder) oder "Member log in" (Team)
2. Als Stakeholder: auf `stakeholder.html` siehst Du das Tageslimit (`0 of 10`) und einen Button "Create Email Request"
3. Button oeffnet eine vorbefuellte E-Mail an `R.Neuberger@newmountains.it` - sende eine Anfrage (Feature oder Bug). Mobil (bzw. direkt `request.html`): Formular ausfuellen und "send request" klicken
4. Nach ~1 Min: Bestaetigungsmail im Postfach + neues Ticket in der **Triage-Spalte** auf `board.html` (mit AI-Badge)
5. Als Team-Mitglied: Ticket per Drag&Drop verschieben -> der externe Ersteller bekommt eine Status-Mail

### n8n-Workflows

Alle Workflows liegen als JSON-Export in [`n8n/`](n8n/) inkl. Import-Anleitung:

- `01_issue_collector.json` - E-Mail -> KI -> Ticket
- `02_status_notification.json` - Statusaenderung -> Mail an Ersteller
- `03_web_request.json` - Web-Formular -> KI -> Ticket (gleiche Kette wie 01)

## Features

### Task Management
- **Kanban Board** - Drag & drop tasks between columns (To Do, In Progress, Await Feedback, Done)
- **Add Tasks** - Create tasks with title, description, due date, priority, and assignees
- **Subtasks** - Break down tasks into smaller, trackable subtasks
- **Search & Filter** - Quickly find tasks with real-time search
- **Priority Levels** - Urgent, Medium, and Low priority indicators
- **Mobile Support** - Responsive design with mobile-specific move menu

### Contact Management
- **Add Contacts** - Create new contacts with name, email, and phone
- **Edit Contacts** - Update contact information
- **Delete Contacts** - Remove contacts with confirmation dialog
- **Contact Details** - View full contact information
- **Assign to Tasks** - Select contacts as task assignees

### Dashboard & Summary
- **KPI Cards** - Overview of tasks by status (Todo, Done, Urgent, etc.)
- **Upcoming Deadlines** - See next urgent task deadline
- **Personalized Greeting** - Welcome message with user name
- **Mobile Splash Screen** - Animated intro on mobile devices

### User Management
- **Firebase Authentication** - Secure login and registration
- **Guest Login** - Try the app without creating an account
- **Password Validation** - Real-time password confirmation
- **User Profile** - Personalized experience with user name display

## 🛠️ Tech Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with Flexbox/Grid, CSS Variables
- **JavaScript (ES6+)** - Modular, vanilla JavaScript
- **No Frameworks** - Pure web technologies

### Backend & Database
- **Firebase Realtime Database** - Real-time data synchronization
- **Firebase Authentication** - User management and security

### Architecture
- **Modular Design** - 30 JavaScript modules, each ≤400 lines
- **Clean Code** - camelCase naming, English comments, no inline scripts/styles
- **Responsive** - Mobile-first design (320px - 1920px)
- **Accessible** - ARIA labels, semantic HTML, keyboard navigation

## 📦 Setup Instructions

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection for Firebase
- (Optional) Local web server for development

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/RaphaelNeuberger/Join.git
   cd Join
   ```

2. **Firebase Configuration**
   
   The project uses Firebase for authentication and data storage. Firebase credentials are already configured in `scripts/config.js`.
   
   For production deployment, you should:
   - Create your own Firebase project at [https://firebase.google.com/](https://firebase.google.com/)
   - Enable **Realtime Database** and **Authentication**
   - Replace the credentials in `scripts/config.js`:
   
   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_AUTH_DOMAIN",
     databaseURL: "YOUR_DATABASE_URL",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_STORAGE_BUCKET",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID",
     measurementId: "YOUR_MEASUREMENT_ID"
   };
   ```

3. **Run the Application**
   
   **Option A: Direct File Opening**
   ```bash
   # Simply open index.html in your browser
   open index.html  # macOS
   start index.html # Windows
   xdg-open index.html # Linux
   ```
   
   **Option B: Local Server (Recommended)**
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Or using Node.js
   npx http-server
   
   # Then open http://localhost:8000
   ```

4. **First Login**
   
   You can either:
   - Click **"Guest Log in"** to try the app immediately
   - Create a new account with email and password
   - Use the seeded demo data (7 tasks, 10 contacts automatically loaded)

## Project Structure

```
Join/
├── index.html              # Login/Register page
├── summary.html            # Dashboard with KPIs
├── board.html              # Kanban board
├── add_task.html           # Task creation form
├── contacts.html           # Contact management
├── help.html               # Help page
├── legal-notice.html       # Legal notice (Impressum)
├── privacypolicy.html      # Privacy policy
├── css/                    # Stylesheets
│   ├── style.css          # Global styles
│   ├── board.css          # Board-specific styles
│   ├── contacts.css       # Contacts styles
│   ├── summary.css        # Dashboard styles
│   └── ...
├── scripts/               # JavaScript modules
│   ├── config.js          # Firebase configuration
│   ├── firebase-init.js   # Firebase initialization
│   ├── firebase-login.js  # Authentication logic
│   ├── board.js           # Kanban board logic
│   ├── contacts.js        # Contact management
│   ├── tasks_API.js       # Task CRUD operations
│   ├── register.js        # Registration logic
│   └── ...
├── img/                   # Images and icons
├── templates/             # Reusable HTML components
│   ├── header.html
│   └── sidebar.html
└── README.md
```

## Key Features Details

### Drag & Drop
Tasks can be dragged between columns on desktop. On mobile, use the 3-dot menu to move tasks.

### Custom Validation
All forms use custom JavaScript validation (no HTML5 validation) with real-time feedback.

### Seeding
The app automatically seeds demo data on first load:
- 7 sample tasks with various priorities and statuses
- 10 sample contacts for assignment

### Responsive Design
- **Mobile**: ≤640px (vertical Kanban columns, mobile menus)
- **Tablet**: 641px - 1024px
- **Desktop**: ≥1025px (horizontal Kanban, drag & drop)

## Security & Privacy

- Firebase Authentication handles user credentials securely
- No sensitive data stored in localStorage
- HTTPS required for production deployment
- Privacy policy and legal notice pages included

## 🧪 Development Guidelines

### Code Standards
- **Max 400 lines** per JavaScript file
- **camelCase** for variables and functions
- **UPPER_CASE** for constants
- **English comments** only
- **No console.log** in production (only console.error)
- **No inline scripts/styles** in HTML

### Git Workflow
- Meaningful commit messages
- Feature branches for new development
- .gitignore configured (excludes node_modules, .env, Firebase debug logs)

## 👥 Team

This project was developed by:

- **Raphael Neuberger** - Developer
- [Add team members here]

## License

This project is part of the Developer Akademie Frontend Module coursework.

## 🙏 Acknowledgments

- Developer Akademie for project specifications
- Firebase for backend infrastructure
- Icons from [add icon source]
- Font: Inter (Google Fonts)

---

**Version:** 1.0.0  
**Last Updated:** December 2025  
**Contact:** [Your Email]
