import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Sun, Shield, DollarSign, Percent } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export function SettingsPage() {
    const user = useAuthStore((state) => state.user);
    const [theme, setTheme] = useState('light');

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
                <p className="text-muted-foreground mt-1">Manage global system policies and preferences.</p>
            </div>

            <Tabs defaultValue="general" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="finance">Finance</TabsTrigger>
                    <TabsTrigger value="hr">HR Policies</TabsTrigger>
                    <TabsTrigger value="sales">Sales</TabsTrigger>
                    <TabsTrigger value="modules">Modules</TabsTrigger>
                    <TabsTrigger value="rbac">Permissions</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Organization Profile</CardTitle>
                            <CardDescription>Update your company details and public profile.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center text-xl font-bold text-slate-500">
                                    {user?.name?.substring(0, 2).toUpperCase()}
                                </div>
                                <Button variant="outline">Change Logo</Button>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Company Name</label>
                                    <Input defaultValue="Indus Digital" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Contact Email</label>
                                    <Input defaultValue="admin@strateaxis-erp.com" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Timezone</label>
                                    <Input defaultValue="Pacific Time (US & Canada)" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Date Format</label>
                                    <Input defaultValue="MMM dd, yyyy" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Appearance</CardTitle>
                            <CardDescription>Customize the look and feel of the interface.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Sun className="w-5 h-5 text-slate-500" />
                                    <div>
                                        <div className="font-medium">Theme Preference</div>
                                        <div className="text-xs text-muted-foreground">Select your preferred color scheme</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 border rounded-md p-1 bg-slate-100">
                                    {['light', 'dark', 'system'].map((t) => (
                                        <button
                                            key={t}
                                            onClick={() => setTheme(t)}
                                            className={`px-3 py-1 rounded text-xs font-medium transition-all ${theme === t ? 'bg-white shadow-sm' : 'text-slate-500'}`}
                                        >
                                            {t.charAt(0).toUpperCase() + t.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="finance" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Financial Policies</CardTitle>
                            <CardDescription>Configure tax rules and fiscal years.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Fiscal Year Start</label>
                                    <Input type="date" defaultValue="2024-01-01" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Default Currency</label>
                                    <Input defaultValue="USD ($)" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Default Tax Rate (%)</label>
                                    <div className="relative">
                                        <Percent className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input className="pl-9" defaultValue="8.5" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Tax ID / VAT Number</label>
                                    <Input defaultValue="US-123456789" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="hr" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>HR & Leave Policies</CardTitle>
                            <CardDescription>Manage working hours and employee benefits.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Standard Working Hours</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <Input defaultValue="09:00" type="time" />
                                    <Input defaultValue="17:00" type="time" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Annual Leave Allowance (Days)</label>
                                <Input type="number" defaultValue="20" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Sick Leave Allowance (Days)</label>
                                <Input type="number" defaultValue="10" />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="sales" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Sales Configuration</CardTitle>
                            <CardDescription>Commission structures and targets.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Default Commission Rate (%)</label>
                                <div className="relative">
                                    <Percent className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input className="pl-9" defaultValue="5.0" />
                                </div>
                                <p className="text-xs text-muted-foreground">Applied to closed-won deals by default.</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Monthly Sales Target ($)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input className="pl-9" defaultValue="50000" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="rbac" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Roles & Permissions</CardTitle>
                            <CardDescription>Manage access control for system modules and actions.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex gap-2">
                                        <Button variant="outline" className="bg-slate-100 font-semibold text-slate-900">Administrator</Button>
                                        <Button variant="ghost">Manager</Button>
                                        <Button variant="ghost">Employee</Button>
                                    </div>
                                    <Button size="sm">
                                        <Shield className="w-4 h-4 mr-2" />
                                        Add Role
                                    </Button>
                                </div>

                                <div className="border rounded-md">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-slate-50 border-b">
                                            <tr>
                                                <th className="px-4 py-3 font-medium text-slate-500">Resource</th>
                                                <th className="px-4 py-3 font-medium text-slate-500 text-center">View</th>
                                                <th className="px-4 py-3 font-medium text-slate-500 text-center">Create</th>
                                                <th className="px-4 py-3 font-medium text-slate-500 text-center">Edit</th>
                                                <th className="px-4 py-3 font-medium text-slate-500 text-center">Delete</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {['CRM & Sales', 'Inventory', 'Manufacturing', 'Finance', 'HR', 'Settings'].map((resource) => (
                                                <tr key={resource} className="hover:bg-slate-50/50">
                                                    <td className="px-4 py-3 font-medium">{resource}</td>
                                                    <td className="px-4 py-3 text-center"><input type="checkbox" defaultChecked className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" /></td>
                                                    <td className="px-4 py-3 text-center"><input type="checkbox" defaultChecked className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" /></td>
                                                    <td className="px-4 py-3 text-center"><input type="checkbox" defaultChecked className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" /></td>
                                                    <td className="px-4 py-3 text-center"><input type="checkbox" defaultChecked className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" /></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="modules" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Module Configuration</CardTitle>
                            <CardDescription>Enable or disable system modules per department.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {['CRM', 'Inventory', 'Manufacturing', 'Finance', 'HR'].map((module) => (
                                <div key={module} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="space-y-0.5">
                                        <div className="font-medium">{module} Module</div>
                                        <div className="text-sm text-muted-foreground">Enable {module} features for the organization.</div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-green-600">Active</span>
                                        <input type="checkbox" defaultChecked className="toggle" />
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

