import { useState } from 'react';
import { Menu, X, LayoutDashboard, CreditCard, Smile, Package, Factory, Users, Settings, type LucideIcon } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { useAuthStore } from '../store/useAuthStore';
import { isModuleEnabled, type ModuleKey } from '../config/modules';

const ALL_MOBILE_ITEMS: { module: ModuleKey; title: string; path: string; icon: LucideIcon }[] = [
    { module: 'dashboard', title: 'Dashboard', path: '/app', icon: LayoutDashboard },
    { module: 'finance', title: 'Finance', path: '/app/finance', icon: CreditCard },
    { module: 'crm', title: 'CRM & Sales', path: '/app/crm', icon: Smile },
    { module: 'inventory', title: 'Supply Chain', path: '/app/inventory', icon: Package },
    { module: 'manufacturing', title: 'Manufacturing', path: '/app/manufacturing', icon: Factory },
    { module: 'hr', title: 'Human Capital', path: '/app/hr', icon: Users },
    { module: 'settings', title: 'Settings', path: '/app/settings', icon: Settings },
];

const MOBILE_ITEMS = ALL_MOBILE_ITEMS.filter(item => isModuleEnabled(item.module));

export function MobileSidebar() {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const user = useAuthStore((state) => state.user);

    const toggle = () => setIsOpen(!isOpen);

    const navigateTo = (path: string) => {
        navigate(path);
        setIsOpen(false);
    };

    const isActive = (path: string) => location.pathname === path || (path !== '/app' && location.pathname.startsWith(path));

    return (
        <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={toggle} className="mr-2">
                <Menu className="w-6 h-6" />
            </Button>

            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={toggle}
                />
            )}

            {/* Sidebar Drawer */}
            <div
                className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-white shadow-xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="p-6 flex items-center justify-between border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-lg shadow-lg shadow-blue-900/50">
                            S
                        </div>
                        <span className="font-bold text-xl tracking-tight">HRMS</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={toggle} className="text-slate-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
                    {MOBILE_ITEMS.map((item, i) => (
                        <div key={item.path}>
                            {item.module === 'settings' && i > 0 && (
                                <div className="pt-4 pb-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Administration
                                </div>
                            )}
                            <button
                                onClick={() => navigateTo(item.path)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive(item.path) ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                            >
                                <item.icon className="w-5 h-5" />
                                {item.title}
                            </button>
                        </div>
                    ))}
                </div>

                <div className="p-4 border-t border-white/10 bg-black/20">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-sm font-bold shadow-inner">
                            {user?.name?.charAt(0)}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

