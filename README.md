# Join - Kanban Task Management

A modern, responsive task management application built with vanilla JavaScript, HTML5, and CSS3. Join helps teams organize their workflow with an intuitive Kanban board, contact management, and real-time collaboration features.

![Join Logo](img/logo/join-logo.svg)

## 🚀 Features

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

## 📁 Project Structure

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

## 🎨 Key Features Details

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

## 🔒 Security & Privacy

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

## 📄 License

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
