# AGENT.md - AI Agent Operational Guidelines & Working Agreement

This document governs all AI agent interactions and automated development within the `gym-app` repository. Every agent working in this codebase must strictly read, understand, and abide by these rules.

---

## 🔒 1. The Strict Working Agreement (The Approval Gate)

To guarantee software quality, predictable iterations, and alignment with course evaluation requirements:

1. **Check `PLAN.md` First:**
   - Never write, modify, or delete application code without inspecting `PLAN.md` to identify the current active task.
2. **Execute Exactly ONE Task at a Time:**
   - Never combine multiple milestone tasks into a single turn or batch.
   - Strictly focus on the single checkbox item designated in `PLAN.md`.
3. **The Approval Gate (Stop & Wait):**
   - After completing a task:
     - Verify with `npm run build` and `npm run lint`.
     - Update `PLAN.md` to check off the completed task (`[x]`).
     - Provide a clear, concise summary of what was implemented.
     - **WAIT for explicit user approval** before beginning the next task.
4. **Documentation Synchronization:**
   - Keep `PROJECT_SPEC.md`, `README.md`, and `PLAN.md` aligned whenever an architectural decision, library selection, or data contract change occurs.

---

## 🏗️ 2. Architectural Constraints & Project Organization

1. **Modularity & Separation of Concerns:**
   - **`src/types/`**: All data models, DTOs, API response structures, and form input interfaces must reside here.
   - **`src/services/`**: All REST API interactions (`fetch` / `axios`) must be encapsulated here. No direct `fetch()` calls inside UI views or table components.
   - **`src/components/`**: Reusable presentational and container components (dialogs, tables, navigation, inputs).
   - **`src/pages/`**: View/Page orchestrators (`CustomersPage`, `TrainingsPage`, `CalendarPage`, `StatisticsPage`).
   - **`src/utils/`**: Pure utility functions (date formatters, export utilities, data aggregators).
2. **State Management:**
   - Prefer idiomatic React hooks (`useState`, `useEffect`, `useCallback`, `useMemo`).
   - If shared cross-view state is required, use React Context with dedicated custom hooks.
3. **Strict TypeScript:**
   - No `any` or loose type assertions unless strictly required by an external untyped third-party library (must be documented with reasons).
   - All component props, function parameters, and return types must be explicitly typed.
4. **Error Handling & Feedback:**
   - All asynchronous API operations must have robust `try / catch` handling.
   - Surface user-facing error and success feedback using notifications/snackbars (never silent failures or unhandled promise rejections).

---

## 💅 3. Coding Standards & Conventions

1. **Naming Conventions:**
   - Components & Types: `PascalCase` (e.g., `CustomerTable.tsx`, `AddCustomerModal.tsx`, `Customer.ts`).
   - Utilities, hooks & functions: `camelCase` (e.g., `formatDateTime.ts`, `useCustomers.ts`, `deleteCustomerById`).
   - Constants: `UPPER_SNAKE_CASE` (e.g., `API_BASE_URL`, `DATE_FORMAT`).
2. **Date Handling:**
   - Standardize all date display formatting to `DD.MM.YYYY HH:mm` (e.g., `18.04.2024 18:59`) as required by the project specifications.
   - Use [Day.js](https://day.js.org/) for formatting and parsing ISO-8601 strings.
3. **UX & Accessibility:**
   - Maintain clear button labeling, accessible colors, and responsive layouts.
   - Every destructive operation (e.g. deleting a customer or training session) **must** open a confirmation dialog (`Are you sure?` with Yes / Cancel options) before sending the DELETE request.
4. **Documentation-Style Code Comments (JSDoc / TSDoc):**
   - **All added and modified code must be fully documented using JSDoc / TSDoc style comments (`/** ... */`).**
   - Every React component must have a docstring detailing its role, behavior, and props interface.
   - Every exported function, service method, and utility must document its purpose, `@param` descriptions, and `@returns` specification.
   - Every interface and type declaration must describe its fields and domain purpose.
   - Complex internal logic, data mappings, calculations, or API workarounds must feature clear inline comments explaining *why* the implementation is structured as such.
5. **Clean Code & Formatting:**
   - Keep components concise (under 250 lines when feasible; extract sub-components or custom hooks when logic grows).
   - Preserve existing comments and docstrings. Maintain documentation integrity at all times.

---

## 🚫 4. No-Go Patterns (Strict Anti-Patterns)

- ❌ **NO Undocumented Code:** Never introduce components, hooks, functions, or service calls without JSDoc/TSDoc documentation comments.
- ❌ **NO Multi-Task Rushing:** Do not proceed to Task 2, 3, or 4 until the user reviews and confirms the current step.
- ❌ **NO Direct Component API Calls:** Do not embed raw `fetch("https://...")` inside component render trees. Use `services/`.
- ❌ **NO Unconfirmed Deletions:** Never delete a customer or training immediately upon clicking a trash/delete icon without a confirmation prompt.
- ❌ **NO Raw Dates:** Never display raw ISO strings (e.g. `2024-04-18T18:59:46.350+00:00`) directly in tables, cards, or calendar tooltips.
- ❌ **NO Sensitive Columns in CSV Export:** Never export action/button columns or internal object references in customer CSV exports.
- ❌ **NO Phantom Dependencies:** Always verify package compatibility before installing new dependencies (particularly ensuring compatibility with React 19 and Vite).
- ❌ **NO Breaking Git / Builds:** Never leave the repository in a state where `npm run build` or `npm run lint` fails.

---

## 🧪 5. Testing & Verification Rules

Before concluding any task and asking for user approval:

1. **Static Analysis & Typecheck:**
   - Run `npm run lint` to ensure zero ESLint errors or unescaped warnings.
   - Run `npm run build` to verify TypeScript compile integrity and Vite bundling.
2. **Runtime Verification:**
   - Ensure local dev server starts cleanly without runtime console errors or missing modules.
   - Verify network requests hit the expected API endpoints with accurate payloads and HTTP methods.
3. **Responsive & Visual Inspection:**
   - Check that UI elements render cleanly across desktop and tablet/mobile viewports.

---

## 🤖 6. AI Agent Execution Checklist for Every Turn

When invoked for a task:
1. `[ ]` Read `PLAN.md` and identify the next single unchecked task.
2. `[ ]` Confirm the task scope and verify no previous tasks are pending approval.
3. `[ ]` Execute the necessary code changes cleanly and minimally.
4. `[ ]` Ensure all added/modified code is thoroughly documented with JSDoc/TSDoc comments.
5. `[ ]` Run validation (`npm run build` and `npm run lint`).
6. `[ ]` Update `PLAN.md` by marking the task `[x]`.
7. `[ ]` Present the completion summary to the user and halt execution until the user replies with approval.

