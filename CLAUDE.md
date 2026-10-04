# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

StrateAxis / Nexus ERP is a **frontend-only MVP**: a modular ERP UI with CRM, Inventory/Supply Chain, Manufacturing, Finance and HR modules. It has no backend. All data is generated in the browser with `@faker-js/faker`, and auth is simulated. The only package is in `frontend/`.

Stack: React 19, TypeScript (strict), Vite 7, React Router 7 (`createBrowserRouter`), Zustand 5, Tailwind CSS 3 with shadcn-style UI primitives (Radix + `class-variance-authority`), Recharts, cmdk, sonner, date-fns, lucide-react. It deploys to Vercel. `frontend/vercel.json` rewrites every path to `index.html` so client-side routing works.

## Commands

Run all commands from `frontend/`:

```bash
npm install
npm run dev       # Vite dev server
npm run build     # tsc -b (type-check) then vite build
npm run lint      # eslint .
npm run preview   # serve the production build
```

There is no test framework. Use `npm run build` to type-check: `tsconfig.app.json` sets `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax` and `erasableSyntaxOnly`. With these settings, type-only imports must use `import type` / `type` modifiers, unused variables fail the build, and TypeScript `enum`s and parameter properties aren't allowed.

## Architecture

- **Entry / routing**: `src/main.tsx` renders `RouterProvider` with the router from `src/router.tsx`. Public routes are `/` (`LandingPage`) and `/login` (`LoginPage`). Everything else is nested under `/app`, inside `layouts/DashboardLayout.tsx`, which renders the shell (sidebar, `CommandPalette`, `NotificationCenter`, `MobileSidebar`) around an `<Outlet />`. `src/App.tsx` isn't used by the router; it's leftover scaffold.
- **No route guard**: `/app` doesn't check `useAuthStore().isAuthenticated`. `useAuthStore.login()` is a mock: it waits 1s and then sets a hard-coded admin user.
- **Navigation is defined in several places**: the desktop sidebar (`ALL_MENU_GROUPS` in `DashboardLayout.tsx`), `components/MobileSidebar.tsx` and `components/CommandPalette.tsx`. Each entry is tagged with a `ModuleKey` and filtered through `ENABLED_MODULES` in `src/config/modules.ts`. On the `hrms` branch only `hr` and `settings` are enabled, and `/app` redirects to `/app/hr`. Routes for hidden modules still exist. When you add a page, register its route in `router.tsx` and add it to whichever of these menus should link to it.
- **Pages**: each module is a folder under `src/pages/<module>/`, holding a dashboard page plus list, detail and create pages. Routes follow the pattern `/app/<module>/...` (for example `crm/customers/new` and `inventory/products/:id`).
- **Data layer**:
  - `services/mockData.ts` generates `MOCK_*` arrays with faker when the module loads. IDs are stable (`EMP-1000`, `PRD-500`, `INV-2024001`, …), but the other field values change on every reload.
  - `store/useAppStore.ts` is one Zustand store. It is seeded from the mock data and holds CRUD actions for employees, products, leads, orders, customers, purchase orders, BOMs and production orders. The domain interfaces are declared **inside this file**. `types/index.ts` only holds `User`, `AuthState` and `Module`.
  - State lives only in memory: nothing persists across reloads.
  - Pages aren't consistent about where they read data. Some use `useAppStore`, so their create forms update other views. Others import `MOCK_*` directly: `FinanceDashboard`, `InvoiceDetail`, `SalesOrders`, `PayrollOverview`. Check which source a page uses before wiring up a create flow.
- **UI primitives**: `components/ui/*` are shadcn-style wrappers. Merge class names with `cn()` from `lib/utils.ts`. Show feedback after form submits with `sonner` toasts.
- **Theming**: colors are HSL CSS variables in `src/index.css` (`:root` and `.dark`), mapped to Tailwind tokens (`bg-background`, `text-primary`, `border-border`, …) in `tailwind.config.js`. Use these tokens rather than raw colors where you can. Some layout and sidebar code hard-codes `slate`/`blue` classes.
- **Imports**: there's no `@/` path alias. Use relative imports (`../../store/useAppStore`).
