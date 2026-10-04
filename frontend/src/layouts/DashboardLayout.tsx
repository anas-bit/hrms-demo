import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { CommandPalette } from '../components/CommandPalette';
import { NotificationCenter } from '../components/NotificationCenter';
import { MobileSidebar } from '../components/MobileSidebar';
import {
    LayoutDashboard,
    Users,
    Briefcase,
    Package,
    Factory,
    Settings,
    DollarSign,
    ChevronDown,
    ChevronRight,
    AlertCircle,
    type LucideIcon
} from 'lucide-react';
const workspaceLogo = '/favicon.svg';
import { cn } from '../lib/utils';
import { isModuleEnabled, type ModuleKey } from '../config/modules';

interface MenuItem {
    title: string;
    path: string;
}

interface MenuGroup {
    module: ModuleKey;
    title: string;
    icon: LucideIcon;
    items: MenuItem[];
}

const ALL_MENU_GROUPS: MenuGroup[] = [
    {
        module: 'crm',
        title: 'CRM & Sales',
        icon: Users,
        items: [
            { title: 'Pipeline', path: '/app/crm' },
            { title: 'Customers', path: '/app/crm/customers' },
            { title: 'Sales Orders', path: '/app/crm/orders' },
        ]
    },
    {
        module: 'inventory',
        title: 'Supply Chain',
        icon: Package,
        items: [
            { title: 'Inventory', path: '/app/inventory' },
            { title: 'Purchase Orders', path: '/app/inventory/purchase-orders' },
        ]
    },
    {
        module: 'manufacturing',
        title: 'Manufacturing',
        icon: Factory,
        items: [
            { title: 'Production', path: '/app/manufacturing' },
            { title: 'BOM Manager', path: '/app/manufacturing/bom' },
            { title: 'Schedule', path: '/app/manufacturing/schedule' },
        ]
    },
    {
        module: 'finance',
        title: 'Finance',
        icon: DollarSign,
        items: [
            { title: 'Overview', path: '/app/finance' },
            { title: 'Reports', path: '/app/finance/reports' },
        ]
    },
    {
        module: 'hr',
        title: 'Human Capital',
        icon: Briefcase,
        items: [
            { title: 'Directory', path: '/app/hr' },
            { title: 'Payroll', path: '/app/hr/payroll' },
        ]
    },
    {
        module: 'settings',
        title: 'Administration',
        icon: Settings,
        items: [
            { title: 'System Policies', path: '/app/settings?tab=general' },
            { title: 'Module Settings', path: '/app/settings?tab=modules' },
        ]
    }
];

const MENU_GROUPS = ALL_MENU_GROUPS.filter(g => isModuleEnabled(g.module));

export function DashboardLayout() {
    const user = useAuthStore((state) => state.user);
    const navigate = useNavigate();
    const location = useLocation();

    // State for expanded groups - default all open
    const [expandedGroups, setExpandedGroups] = useState<string[]>(MENU_GROUPS.map(g => g.title));

    const toggleGroup = (title: string) => {
        setExpandedGroups(prev =>
            prev.includes(title)
                ? prev.filter(t => t !== title)
                : [...prev, title]
        );
    };

    return (
        <div className="min-h-screen bg-muted/40 font-sans text-slate-900">
            <aside className="fixed inset-y-0 left-0 z-10 w-64 border-r border-slate-200 bg-slate-900 text-slate-100 hidden md:block shadow-xl">
                <div className="h-full flex flex-col">
                    <div className="h-16 flex items-center px-6 border-b border-white/10 font-bold text-xl tracking-tight text-white">
                        <div className="w-8 h-8 rounded-lg bg-white p-1 mr-3 flex items-center justify-center shadow-lg shadow-black/20 overflow-hidden">
                            <img src={workspaceLogo} alt="HRMS" className="w-full h-full object-contain" />
                        </div>
                        <div className="flex flex-col">
                            <span className="leading-none">HRMS</span>
                            <span className="text-[10px] text-slate-500 font-normal tracking-normal normal-case">People operations</span>
                        </div>
                    </div>

                    <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2 mt-2">Platform</div>

                        {isModuleEnabled('dashboard') && <a
                            href="/app"
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors mb-4",
                                location.pathname === '/app'
                                    ? "bg-blue-600 text-white shadow-md shadow-blue-900/20"
                                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                            )}
                        >
                            <LayoutDashboard className="w-4 h-4" />
                            Dashboard
                        </a>}

                        <div className="space-y-4">
                            {MENU_GROUPS.map((group) => {
                                const isExpanded = expandedGroups.includes(group.title);
                                const isActive = group.items.some(item => location.pathname.startsWith(item.path));

                                return (
                                    <div key={group.title} className="space-y-1">
                                        <button
                                            onClick={() => toggleGroup(group.title)}
                                            className={cn(
                                                "w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors group",
                                                isActive ? "text-white" : "text-slate-400 hover:text-white hover:bg-white/5"
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <group.icon className={cn("w-4 h-4", isActive ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300")} />
                                                {group.title}
                                            </div>
                                            {isExpanded ? <ChevronDown className="w-3 h-3 opacity-50" /> : <ChevronRight className="w-3 h-3 opacity-50" />}
                                        </button>

                                        {isExpanded && (
                                            <div className="pl-4 space-y-0.5 border-l border-white/10 ml-4">
                                                {group.items.map((item) => (
                                                    <a
                                                        key={item.path}
                                                        href={item.path}
                                                        className={cn(
                                                            "block px-3 py-1.5 text-sm rounded-md transition-colors",
                                                            location.pathname === item.path || location.pathname.startsWith(item.path + '/')
                                                                ? "text-blue-400 font-medium bg-white/5"
                                                                : "text-slate-400 hover:text-white hover:bg-white/5"
                                                        )}
                                                    >
                                                        {item.title}
                                                    </a>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </nav>

                    <div className="p-4 border-t border-white/10 bg-black/20">
                        <button onClick={() => navigate('/app/settings')} className="flex items-center gap-3 w-full hover:bg-white/5 p-2 rounded-lg transition-colors text-left group">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold ring-2 ring-white/10 group-hover:ring-white/20">
                                {user?.name?.substring(0, 2).toUpperCase() || 'U'}
                            </div>
                            <div className="overflow-hidden flex-1">
                                <div className="font-medium text-sm text-white truncate">{user?.name || 'Guest'}</div>
                                <div className="text-xs text-slate-400 truncate">{user?.email || 'No email'}</div>
                            </div>
                            <Settings className="w-4 h-4 text-slate-500 group-hover:text-white" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="pl-0 md:pl-64 transition-all duration-300 min-h-screen flex flex-col">
                <header className="h-16 border-b bg-white/80 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between px-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <MobileSidebar />
                        <h2 className="font-semibold text-lg text-slate-800 hidden md:block">
                            {location.pathname === '/app' ? 'Overview' :
                                MENU_GROUPS.find(g => g.items.some(i => location.pathname.startsWith(i.path)))?.items.find(i => location.pathname.startsWith(i.path))?.title || 'Dashboard'}
                        </h2>
                    </div>

                    <div className="flex items-center gap-4">
                        <CommandPalette />
                        <NotificationCenter />
                    </div>
                </header>

                {/* System Alert Banner */}
                <div className="bg-blue-600 text-white py-2 px-6 flex items-center justify-between text-sm font-medium shadow-md relative z-10 transition-all">
                    <div className="flex items-center gap-3 container mx-auto">
                        <AlertCircle className="w-4 h-4 animate-pulse" />
                        <span>Welcome to <strong>HRMS</strong>: The central point upon which your entire business turns.</span>
                    </div>
                </div>

                <div className="p-4 md:p-8 max-w-7xl mx-auto w-full flex-1">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

