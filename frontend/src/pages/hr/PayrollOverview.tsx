import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { MOCK_PAYROLL } from '../../services/mockData';
import { DollarSign, Download, Send } from 'lucide-react';
import { format } from 'date-fns';

export function PayrollOverview() {
    const [payroll] = useState(MOCK_PAYROLL);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Payroll Management</h1>
                    <p className="text-muted-foreground mt-1">Process salaries and view payslips.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <Send className="w-4 h-4 mr-2" />
                        Run Payroll
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Payroll Cost</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ${payroll.reduce((acc, curr) => acc + curr.basicSalary + curr.allowances, 0).toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">For current month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Processed Employees</CardTitle>
                        <div className="h-4 w-4 text-emerald-500 font-bold">✓</div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{payroll.length}</div>
                        <p className="text-xs text-muted-foreground mt-1">All active employees processed</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Payslips - {format(new Date(), 'MMMM yyyy')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Employee</TableHead>
                                <TableHead className="text-right">Basic Salary</TableHead>
                                <TableHead className="text-right">Allowances</TableHead>
                                <TableHead className="text-right">Deductions</TableHead>
                                <TableHead className="text-right">Net Salary</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {payroll.map((pay) => {
                                const net = pay.basicSalary + pay.allowances - pay.deductions;
                                return (
                                    <TableRow key={pay.id}>
                                        <TableCell>
                                            <div className="font-medium">{pay.employeeName}</div>
                                            <div className="text-xs text-muted-foreground">{pay.employeeId}</div>
                                        </TableCell>
                                        <TableCell className="text-right">${pay.basicSalary.toLocaleString()}</TableCell>
                                        <TableCell className="text-right text-emerald-600">+${pay.allowances.toLocaleString()}</TableCell>
                                        <TableCell className="text-right text-red-500">-${pay.deductions.toLocaleString()}</TableCell>
                                        <TableCell className="text-right font-bold">${net.toLocaleString()}</TableCell>
                                        <TableCell>
                                            <Badge variant="success">Processed</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm">
                                                <Download className="w-4 h-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
