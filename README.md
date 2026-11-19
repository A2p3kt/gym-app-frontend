# Personal Trainer Front-End Application

A modern, responsive React + TypeScript front-end application built for personal trainers to manage customer profiles, schedule and track training sessions, visualize appointments in an interactive calendar, and analyze workout statistics with interactive charts.

This project connects to the backend Personal Trainer REST API provided as part of the Haaga-Helia Front End Development curriculum.

---

## 🚀 Live Demo & Deployment

- **Production URL:** *(To be added upon deployment in Task 3)*
- **GitHub Repository:** *(Current repository)*

---

## 📋 Table of Contents

- [Overview & Requirements](#-overview--requirements)
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [REST API Specifications](#-rest-api-specifications)
- [Getting Started](#-getting-started)
- [Available Scripts](#-available-scripts)
- [Agile Workflow & Documentation](#-agile-workflow--documentation)
- [Project Roadmap](#-project-roadmap)

---

## 🎯 Overview & Requirements

The application fulfills the four key assignment milestones for the Personal Trainer management platform:

1. **Task 1: List Pages & Navigation**
   - Seamless top navigation between views.
   - Customer list page with sorting, full-text searching, and pagination.
   - Training list page displaying customer names and formatted timestamps (`DD.MM.YYYY HH:mm`).

2. **Task 2: Full CRUD Operations**
   - Customer management: Add new customer, edit existing customer, and delete customer.
   - Training management: Add training to a specific customer using a date-time picker, and delete training session.
   - Mandatory confirmation dialogs (Yes/No) before executing any deletion.
   - Real-time feedback alerts (success/error snackbars).

3. **Task 3: CSV Export, Calendar & Deployment**
   - Export customer data to CSV with sensitive/action columns filtered out.
   - Interactive training calendar with Month, Week, and Day views showing scheduled sessions.
   - Cloud deployment to a hosting platform.

4. **Task 4: Workout Statistics & Analytics**
   - Dedicated statistics dashboard.
   - Bar chart visualizing total workout duration (minutes) grouped by activity.
   - Summary statistics and key metrics.

---

## 🛠️ Architecture & Tech Stack

- **Framework:** [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool & Bundler:** [Vite](https://vite.dev/)
- **UI & Components:** [Material UI (MUI)](https://mui.com/) or lightweight accessible design system
- **Data Grids:** [AG Grid React](https://www.ag-grid.com/react-data-grid/) or MUI DataGrid
- **Date Handling:** [Day.js](https://day.js.org/) for formatting and date manipulations
- **Charts:** [Recharts](https://recharts.org/) for responsive statistical charts
- **Calendar:** [React Big Calendar](https://github.com/jquense/react-big-calendar) / compatible calendar engine
- **Utility Libraries:** [Lodash](https://lodash.com/) for data grouping and aggregation; [PapaParse](https://www.papaparse.com/) for CSV generation
- **Code Quality:** ESLint 10 + TypeScript ESLint

### Project Structure (Target)

```text
gym-app/
├── public/                 # Static assets
├── src/
│   ├── assets/             # Images, icons, static graphics
│   ├── components/         # Reusable UI components (Navbar, ConfirmDialog, etc.)
│   │   ├── calendar/       # CalendarToolbar.tsx, CalendarEventItem.tsx, TrainingEventDialog.tsx
│   │   ├── common/         # ConfirmDialog, LoadingSpinner, NotificationSnackbar
│   │   ├── customer/       # CustomerTable, AddCustomerModal, EditCustomerModal
│   │   └── training/       # TrainingTable, AddTrainingModal
│   ├── pages/              # View/Page components
│   │   ├── CustomersPage.tsx
│   │   ├── TrainingsPage.tsx
│   │   ├── CalendarPage.tsx
│   │   └── StatisticsPage.tsx
│   ├── services/           # REST API client & service modules
│   │   ├── api.ts          # Base fetch/axios configuration
│   │   ├── customerService.ts
│   │   └── trainingService.ts
│   ├── types/              # TypeScript interfaces & domain types
│   │   ├── customer.ts
│   │   └── training.ts
│   ├── utils/              # Helper functions (calendarUtils.ts, csvExport.ts, stats)
│   ├── App.tsx             # Root application shell & routing
│   ├── main.tsx            # Entry point
│   └── index.css           # Global styling
├── AGENT.md                # Agent operational guide & strict approval workflow
├── PLAN.md                 # Active sprint backlog & roadmapped checkboxes
├── PROJECT_SPEC.md         # Master blueprint, API contracts & user stories
└── README.md               # Project documentation (this file)
```

---

## 🌐 REST API Specifications

The application interfaces with the Personal Trainer REST API:
- **Base URL:** `https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/api/`
- **Database Reset:** `POST https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/reset`
- **API Documentation:** [https://juhahinkula.github.io/personaltrainerdocs/](https://juhahinkula.github.io/personaltrainerdocs/)

### Key Endpoints:
- `GET /customers`: Returns `{ _embedded: { customers: Customer[] } }`
- `POST /customers`: Creates a new customer
- `PUT /customers/{id}`: Updates customer details
- `DELETE /customers/{id}`: Deletes a customer and cascades to their trainings
- `GET /trainings`: Returns raw trainings with HATEOAS links
- `GET /gettrainings`: Returns complete list of trainings with embedded customer details
- `POST /trainings`: Creates a training linked to a customer
- `DELETE /trainings/{id}`: Deletes a specific training session

---

## ⚡ Getting Started

### Prerequisites
- Node.js (v18.x or v20.x+ recommended)
- npm or yarn

### Installation
```bash
# Clone the repository (if not already local)
git clone <repo-url>
cd gym-app

# Install dependencies
npm install
```

### Running Locally
```bash
# Start Vite development server
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

### Building for Production
```bash
# Build TypeScript and bundle via Vite
npm run build

# Preview production build locally
npm run preview
```

### Code Quality Check
```bash
# Run ESLint
npm run lint
```

---

## 📐 Agile Workflow & Documentation

This repository follows a disciplined 4-document Agile workflow:
1. **[README.md](README.md)**: Architecture overview, setup, and general documentation.
2. **[AGENT.md](AGENT.md)**: AI agent rules of engagement, coding standards, no-go patterns, and strict approval gate.
3. **[PROJECT_SPEC.md](PROJECT_SPEC.md)**: Master product backlog, data models, and feature specifications.
4. **[PLAN.md](PLAN.md)**: Active sprint backlog with granular, numbered milestone tasks and status tracking.

---

## 📌 Strict Approval Gate

- All development is conducted strictly **one task at a time**.
- Before writing code, the active task in `PLAN.md` must be reviewed.
- After finishing each task, `PLAN.md` is updated, work is summarized, and user approval is required before moving forward.
