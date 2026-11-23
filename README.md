# Personal Trainer Front-End Application

A modern, responsive React + TypeScript front-end application built for personal trainers to manage customer profiles, schedule and track training sessions, visualize appointments in an interactive calendar, and analyze workout statistics with interactive charts.

This project connects to the backend Personal Trainer REST API provided as part of the Haaga-Helia Front End Development curriculum.

---

## 🚀 Live Demo & Deployment

- **Production URL:** *(add after deploying — see [Deployment](#-deployment))*
- **GitHub Repository:** *(Current repository)*

---

## 📋 Table of Contents

- [Overview & Requirements](#-overview--requirements)
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [REST API Specifications](#-rest-api-specifications)
- [Getting Started](#-getting-started)
- [Deployment](#-deployment)
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
- **UI & Components:** [Material UI (MUI) v9](https://mui.com/) + Emotion
- **Data Grids:** [AG Grid React v36](https://www.ag-grid.com/react-data-grid/) (Theming API, only the needed modules registered)
- **Date Handling:** [Day.js](https://day.js.org/) for formatting and date manipulations
- **Charts:** [Recharts v3](https://recharts.org/) for the responsive statistics bar chart
- **Calendar:** [React Big Calendar](https://github.com/jquense/react-big-calendar) with the Day.js localizer
- **Utility Libraries:** [Lodash](https://lodash.com/) (`groupBy`, `sumBy`) for statistics; [PapaParse](https://www.papaparse.com/) for CSV generation
- **Code Quality:** ESLint 9 + TypeScript ESLint + `eslint-plugin-react-hooks`

### How the code fits together

- **Navigation:** `App.tsx` keeps the active tab in state (no router needed for four views) and lazy-loads each page.
- **Data loading:** every page uses the `useApiData` hook (`src/hooks/useApiData.ts`), which calls a service
  function, shows errors in the snackbar, and exposes `reload()` for after create/update/delete.
- **API calls** only happen in `src/services/`; components never call `fetch` directly.
- **Customers are identified by their HATEOAS self link** (the API has no customer `id` field);
  see `getCustomerHref` in `src/utils/customerUtils.ts`.
- **Notifications:** `App` owns a single snackbar and passes `onNotify` down to pages and dialogs.

### Project Structure

```text
gym-app/
├── public/                     # Static assets (favicon)
├── docs/
│   ├── LEARNING_DIARY.md       # Draft learning diary (Task 5.3)
│   └── VIDEO_SCRIPT.md         # Draft video presentation script (Task 5.4)
├── src/
│   ├── components/
│   │   ├── calendar/           # CalendarToolbar, CalendarEventItem (hover tooltip), TrainingEventDialog
│   │   ├── common/             # Navbar, ConfirmDialog, NotificationSnackbar
│   │   ├── customers/          # CustomerFormDialog (shared form), AddCustomerDialog, EditCustomerDialog
│   │   ├── statistics/         # StatCard, ActivityDurationChart, ActivityStatsTable
│   │   └── trainings/          # AddTrainingDialog
│   ├── hooks/
│   │   └── useApiData.ts       # Load data from a service + reload(), with snackbar error reporting
│   ├── pages/                  # CustomersPage, TrainingsPage, CalendarPage, StatisticsPage
│   ├── services/               # api.ts (fetch wrapper, DB reset), customerService.ts, trainingService.ts
│   ├── types/                  # Domain models, API payloads, view models
│   ├── utils/
│   │   ├── calendarUtils.ts    # Training -> calendar event mapping, activity colors
│   │   ├── csvExport.ts        # Customer CSV export (no links/actions)
│   │   ├── customerUtils.ts    # Customer self link, form validation/trimming
│   │   ├── errors.ts           # Caught error -> user-facing message
│   │   ├── formatters.ts       # DD.MM.YYYY HH:mm dates, customer full name, minutes -> hours
│   │   └── statistics.ts       # Lodash aggregation for the statistics page
│   ├── App.tsx                 # App shell: theme, navbar, lazy pages, snackbar
│   ├── gridSetup.ts            # AG Grid module registration + grid theme
│   ├── theme.ts                # MUI theme + brand colors
│   └── main.tsx                # Entry point
├── AGENT.md                    # Agent operational guide & strict approval workflow
├── PLAN.md                     # Sprint backlog & milestone checkboxes
├── PROJECT_SPEC.md             # Master blueprint, API contracts & user stories
└── README.md                   # Project documentation (this file)
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

## ☁️ Deployment

`npm run build` produces a static site in `dist/`. `vite.config.ts` sets `base: './'` (relative asset
paths), and the app has no client-side router, so the same build works on any static host —
no rewrite rules needed. The REST API allows cross-origin requests (`Access-Control-Allow-Origin: *`),
so the deployed site can call it directly.

**Option A — Netlify (no CLI needed):** run `npm run build`, then drag the `dist/` folder onto
<https://app.netlify.com/drop>. Or connect the GitHub repo with build command `npm run build` and
publish directory `dist`.

**Option B — Vercel:** import the GitHub repo at <https://vercel.com/new>. Vercel detects Vite
automatically (build `npm run build`, output `dist`).

**Option C — GitHub Pages:** build, then publish `dist/` to a `gh-pages` branch
(e.g. `npx gh-pages -d dist`) and enable Pages for that branch in the repository settings.
The relative `base` makes it work under `https://<user>.github.io/<repo>/`.

After deploying, open the site, check that customers and trainings load, and add the URL at the top of this README.

---

## 📐 Agile Workflow & Documentation

This repository follows a disciplined 4-document Agile workflow:
1. **[README.md](README.md)**: Architecture overview, setup, and general documentation.
2. **[AGENT.md](AGENT.md)**: AI agent rules of engagement, coding standards, no-go patterns, and strict approval gate.
3. **[PROJECT_SPEC.md](PROJECT_SPEC.md)**: Master product backlog, data models, and feature specifications.
4. **[PLAN.md](PLAN.md)**: Active sprint backlog with granular, numbered milestone tasks and status tracking.

---

## 📌 Strict Approval Gate

- All development is normally conducted strictly **one task at a time** (see PLAN.md for the current status).
- Before writing code, the active task in `PLAN.md` must be reviewed.
- After finishing each task, `PLAN.md` is updated, work is summarized, and user approval is required before moving forward.
