# Implementation Plan: Stylish Dark Theme

This plan outlines the steps to introduce a premium, toggleable dark theme across the entire TaskFlow application.

## User Review Required

Please review the following approach. Converting the entire app to support a dark theme requires modifying almost every component. 

We will implement a toggleable theme system, so you get the best of both worlds (Light & Dark modes) with a beautiful transition between them.

## Proposed Changes

### 1. Theme Management (Context & Toggle)
- **[NEW] `frontend/src/context/ThemeContext.jsx`**: A React context provider that will manage the `light` vs `dark` state, save the user's preference to `localStorage`, and inject the `dark` class into the root `<html>` element.
- **[MODIFY] `frontend/src/App.jsx`**: Wrap the application in the new `ThemeProvider`.
- **[MODIFY] `frontend/src/pages/Dashboard.jsx` & `frontend/src/pages/WorkspaceView.jsx` & `frontend/src/pages/LandingPage.jsx`**: Add a stylish Sun/Moon toggle button to the top navigation bars.

### 2. Styling the Dark Theme
To ensure a premium dark mode, we will update the Tailwind CSS classes across the application to include `dark:` variants. We will use a sleek `slate-900` base with `indigo` accents.

Key color mappings:
- `bg-white` ➡️ `dark:bg-slate-900` (Main surfaces, cards, modals)
- `bg-slate-50` ➡️ `dark:bg-slate-950` (Backgrounds, inputs)
- `text-slate-900` ➡️ `dark:text-white` (Primary text)
- `text-slate-700` ➡️ `dark:text-slate-200` (Secondary text)
- `text-slate-500` ➡️ `dark:text-slate-400` (Muted text)
- `border-slate-200` ➡️ `dark:border-slate-800` (Borders and dividers)

### 3. Component Updates
We will methodically apply these dark mode classes to:
- **Pages**: `LandingPage`, `Login`, `Signup`, `Dashboard`, `WorkspaceView`
- **Components**: `TaskModal`, `ChatInterface`, `NotificationsDropdown`, `ProfileModal`, `InviteMemberModal`

### 4. Animations & Shadows
- We will adjust box-shadows so they look deep and elegant in dark mode (`shadow-black/50`).
- Ensure glassmorphism effects (`backdrop-blur`) still look vibrant on dark backgrounds.

## Verification Plan
1. Start the React development server.
2. Toggle the theme button on the Landing Page, Dashboard, and Workspace view.
3. Open modals (Task, Profile, Invite) to ensure nested components inherited the dark theme correctly.
4. Check the chat interface and Kanban board for perfect contrast and readability.
