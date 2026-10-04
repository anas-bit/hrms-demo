import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
    TrendingUp,
    Users,
    Package,
    AlertTriangle,
    ArrowRight,
    DollarSign,
    ShoppingCart
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const chartData = [
    { name: 'Jan', revenue: 4000, profit: 2400 },
    { name: 'Feb', revenue: 3000, profit: 1398 },
    { name: 'Mar', revenue: 2000, profit: 9800 },
    { name: 'Apr', revenue: 2780, profit: 3908 },
    { name: 'May', revenue: 1890, profit: 4800 },
    { name: 'Jun', revenue: 2390, profit: 3800 },
    { name: 'Jul', revenue: 3490, profit: 4300 },
];

export function DashboardHome() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-800">Executive Overview</h1>
                    <p className="text-slate-500 mt-1">Real-time insight into global business operations.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2">
                        <CalendarIcon className="w-4 h-4" />
                        This Quarter
                    </Button>
                    <Button className="bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/20">
                        Download Report
                    </Button>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <KPICard
                    title="Total Revenue"
                    value="$128,420.50"
                    change="+12.5%"
                    trend="up"
                    icon={DollarSign}
                    color="blue"
                />
                <KPICard
                    title="Active Leads"
                    value="42"
                    change="+4 new"
                    trend="up"
                    icon={Users}
                    color="indigo"
                />
                <KPICard
                    title="Inventory Value"
                    value="$1.2M"
                    change="-2.1%"
                    trend="down"
                    icon={Package}
                    color="amber"
                    warning
                />
                <KPICard
                    title="Pending Orders"
                    value="18"
                    change="Urgent"
                    trend="neutral"
                    icon={ShoppingCart}
                    color="emerald"
                />
            </div>

            {/* Charts & Activity Section */}
            <div className="grid gap-6 md:grid-cols-7">
                {/* Main Chart */}
                <Card className="col-span-4 shadow-sm border-slate-200">
                    <CardHeader>
                        <CardTitle>Financial Performance</CardTitle>
                        <CardDescription>Revenue vs Profit over the last 7 months</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-0">
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        itemStyle={{ color: '#0f172a', fontSize: '12px' }}
                                    />
                                    <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Activity Feed */}
                <Card className="col-span-3 shadow-sm border-slate-200">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>Latest system-wide events</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            <ActivityItem
                                title="New Sale Order #1023"
                                desc="Global Tech S.A. - $12,400"
                                time="2m ago"
                                icon={ShoppingCart}
                                iconColor="text-emerald-500"
                                bg="bg-emerald-50"
                            />
                            <ActivityItem
                                title="Stock Alert: Low Inventory"
                                desc="MacBook Pro M3 (SKU-992) is below threshold"
                                time="15m ago"
                                icon={AlertTriangle}
                                iconColor="text-amber-500"
                                bg="bg-amber-50"
                            />
                            <ActivityItem
                                title="New Lead Qualified"
                                desc="Sarah Connor - Cyberdyne Systems"
                                time="1h ago"
                                icon={Users}
                                iconColor="text-blue-500"
                                bg="bg-blue-50"
                            />
                            <ActivityItem
                                title="Invoice Paid"
                                desc="Invoice #INV-2024015 settled via Stripe"
                                time="3h ago"
                                icon={DollarSign}
                                iconColor="text-indigo-500"
                                bg="bg-indigo-50"
                            />
                        </div>
                        <Button variant="ghost" className="w-full mt-4 text-sm text-slate-500 hover:text-slate-900">
                            View All Activity <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Module Shortcuts */}
            <div className="grid gap-4 md:grid-cols-3">
                <ModuleFeatureCard
                    title="Finance & Accounting"
                    desc="Manage cash flow, invoices, and expenses."
                    link="/app/finance"
                    color="bg-emerald-500"
                />
                <ModuleFeatureCard
                    title="CRM & Pipeline"
                    desc="Track leads and manage customer relationships."
                    link="/app/crm"
                    color="bg-blue-500"
                />
                <ModuleFeatureCard
                    title="Supply Chain"
                    desc="Inventory control and procurement."
                    link="/app/inventory"
                    color="bg-orange-500"
                />
            </div>
        </div>
    );
}

// Sub-components for cleaner code
function KPICard({ title, value, change, trend, icon: Icon, color, warning }: any) {
    return (
        <Card className="shadow-sm border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">{title}</CardTitle>
                <Icon className={`h-4 w-4 text-${color}-500`} />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-slate-900">{value}</div>
                <p className={`text-xs flex items-center mt-1 ${warning ? 'text-red-500 font-medium' : 'text-slate-500'}`}>
                    {trend === 'up' && <TrendingUp className="w-3 h-3 mr-1 text-emerald-500" />}
                    <span className={trend === 'up' ? 'text-emerald-500 font-medium' : ''}>{change}</span>
                    <span className="ml-1 text-slate-400">from last month</span>
                </p>
            </CardContent>
        </Card>
    )
}

function ActivityItem({ title, desc, time, icon: Icon, iconColor, bg }: any) {
    return (
        <div className="flex items-start">
            <div className={`w-9 h-9 rounded-full ${bg} flex items-center justify-center mr-3 mt-0.5 shrink-0`}>
                <Icon className={`w-4 h-4 ${iconColor}`} />
            </div>
            <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none text-slate-900">{title}</p>
                <p className="text-xs text-slate-500">{desc}</p>
            </div>
            <div className="text-xs text-slate-400 font-medium">{time}</div>
        </div>
    )
}

function CalendarIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
            <line x1="16" x2="16" y1="2" y2="6" />
            <line x1="8" x2="8" y1="2" y2="6" />
            <line x1="3" x2="21" y1="10" y2="10" />
        </svg>
    )
}

function ModuleFeatureCard({ title, desc, link, color }: any) {
    return (
        <a href={link} className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all">
            <div className={`absolute top-0 left-0 w-1 h-full ${color}`} />
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">{title}</h3>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0" />
            </div>
            <p className="text-sm text-slate-500 mt-2">{desc}</p>
        </a>
    )
}
