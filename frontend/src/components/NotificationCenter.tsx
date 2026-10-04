import { Bell } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button } from './ui/button';
import { useState } from 'react';

const MOCK_NOTIFICATIONS = [
    { id: 1, title: 'New Order Received', desc: 'Order #SO-2024 from Acme Corp', time: '2m ago', read: false, type: 'info' },
    { id: 2, title: 'Stock Alert', desc: 'MacBook Pro stock is below 10 units', time: '1h ago', read: false, type: 'warning' },
    { id: 3, title: 'Payment Successful', desc: 'Invoice #INV-9283 processed', time: '3h ago', read: true, type: 'success' },
];

export function NotificationCenter() {
    const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
    const unreadCount = notifications.filter(n => !n.read).length;

    const markAllRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <div className="relative cursor-pointer">
                    <Button variant="ghost" size="icon" className="rounded-full text-slate-500 hover:bg-slate-100">
                        <Bell className="w-5 h-5" />
                    </Button>
                    {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white" />
                    )}
                </div>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="p-3 border-b flex items-center justify-between">
                    <h4 className="font-semibold text-sm">Notifications</h4>
                    {unreadCount > 0 && (
                        <button onClick={markAllRead} className="text-xs text-blue-600 hover:underline">
                            Mark all read
                        </button>
                    )}
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-slate-500">
                            No notifications
                        </div>
                    ) : (
                        notifications.map(notif => (
                            <div
                                key={notif.id}
                                className={`p-3 border-b last:border-0 hover:bg-slate-50 transition-colors ${!notif.read ? 'bg-blue-50/50' : ''}`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${notif.type === 'warning' ? 'bg-amber-500' :
                                        notif.type === 'success' ? 'bg-emerald-500' : 'bg-blue-500'
                                        }`} />
                                    <div>
                                        <p className={`text-sm ${!notif.read ? 'font-medium text-slate-900' : 'text-slate-600'}`}>
                                            {notif.title}
                                        </p>
                                        <p className="text-xs text-slate-500 mt-0.5">{notif.desc}</p>
                                        <p className="text-[10px] text-slate-400 mt-1.5">{notif.time}</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                <div className="p-2 border-t text-center">
                    <button className="text-xs text-slate-500 hover:text-slate-900 font-medium w-full py-1">
                        View All
                    </button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
