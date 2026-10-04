// Modules visible in navigation (sidebar, mobile sidebar, command palette).
// Routes for hidden modules still exist; add a key here to re-enable one.
export type ModuleKey = 'dashboard' | 'crm' | 'inventory' | 'manufacturing' | 'finance' | 'hr' | 'settings';

export const ENABLED_MODULES: ModuleKey[] = ['hr', 'settings'];

export const isModuleEnabled = (key: ModuleKey) => ENABLED_MODULES.includes(key);

// Landing route inside /app when the overview dashboard is hidden
export const DEFAULT_APP_PATH = isModuleEnabled('dashboard') ? '/app' : '/app/hr';
