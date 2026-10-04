import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { ChevronLeft, Mail, Phone, MapPin, Calendar, Building, DollarSign, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

export function EmployeeProfile() {
    const navigate = useNavigate();

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => navigate('/app/hr')}>
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Back to Directory
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-[300px_1fr]">
                {/* Profile Card */}
                <Card>
                    <CardContent className="pt-6 text-center space-y-4">
                        <div className="w-32 h-32 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-3xl font-bold text-slate-500 border-4 border-white shadow-lg">
                            JD
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">John Doe</h2>
                            <p className="text-sm text-muted-foreground">Senior Software Engineer</p>
                        </div>
                        <div className="flex justify-center gap-2">
                            <Badge variant="secondary">Full Time</Badge>
                            <Badge variant="success">Active</Badge>
                        </div>
                        <div className="pt-4 space-y-3 text-left border-t">
                            <div className="flex items-center gap-3 text-sm">
                                <Mail className="w-4 h-4 text-slate-400" />
                                <span>john.doe@nexus.com</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <Phone className="w-4 h-4 text-slate-400" />
                                <span>+1 (555) 123-4567</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <MapPin className="w-4 h-4 text-slate-400" />
                                <span>San Francisco, CA</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <Building className="w-4 h-4 text-slate-400" />
                                <span>Engineering Dept</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tabs */}
                <div className="space-y-6">
                    <Tabs defaultValue="overview">
                        <TabsList>
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="hiring">Hiring Info</TabsTrigger>
                            <TabsTrigger value="payroll">Payroll & Compensation</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-6 mt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">About</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-slate-600 leading-relaxed">
                                        John is a dedicated engineer with over 8 years of experience in full-stack development.
                                        He leads the frontend infrastructure team and has been pivotal in our migration to React.
                                    </p>
                                </CardContent>
                            </Card>

                            <div className="grid grid-cols-2 gap-4">
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm text-muted-foreground">Hire Date</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center gap-2 text-lg font-medium">
                                            <Calendar className="w-5 h-5 text-slate-400" />
                                            May 15, 2020
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">3 years of service</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm text-muted-foreground">Manager</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center gap-2 text-lg font-medium">
                                            <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">S</div>
                                            Sarah Smith
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">VP of Engineering</p>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="payroll" className="space-y-6 mt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Compensation</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-3 gap-6">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Annual Salary</p>
                                            <p className="text-2xl font-bold mt-1">$155,000</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Effective Date</p>
                                            <p className="text-base font-medium mt-1">Jan 01, 2024</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Pay Frequency</p>
                                            <p className="text-base font-medium mt-1">Bi-Weekly</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Payslips</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="flex items-center justify-between p-3 border rounded-lg bg-slate-50/50">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                                        <DollarSign className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-sm">Payslip - {format(new Date(), 'MMM yyyy')}</p>
                                                        <p className="text-xs text-muted-foreground">Processed on {format(new Date(), 'MMM 25, yyyy')}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="font-bold text-sm">$4,820.00</span>
                                                    <Button size="icon" variant="ghost">
                                                        <Download className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="hiring" className="mt-4">
                            <Card>
                                <CardContent className="py-8 text-center text-muted-foreground">
                                    Contract and offer letter details would go here.
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
