import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { MOCK_INVOICES } from '../../services/mockData';
import { format } from 'date-fns';
import { DollarSign, FileText, ArrowUpRight, ArrowDownRight, Plus } from 'lucide-react';

export function FinanceDashboard() {
    const [invoices] = useState(MOCK_INVOICES);

    // Calculate totals
    const totalRevenue = invoices.reduce((acc, curr) => curr.status === 'paid' ? acc + curr.amount : acc, 0);
    const pendingAmount = invoices.reduce((acc, curr) => curr.status === 'pending' ? acc + curr.amount : acc, 0);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">Financial Overview</h1>
                    <p className="text-muted-foreground mt-1">Global financial consolidation and reporting.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <FileText className="w-4 h-4 mr-2" />
                        Reports
                    </Button>
                    <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => window.location.href = '/app/finance/invoices/new'}>
                        <Plus className="w-4 h-4 mr-2" />
                        New Invoice
                    </Button>
                </div>
            </div>

            {/* Metrics Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground flex items-center mt-1">
                            <ArrowUpRight className="h-3 w-3 text-emerald-500 mr-1" />
                            <span className="text-emerald-500 font-medium">+20.1%</span> from last month
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
                        <FileText className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${pendingAmount.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground flex items-center mt-1">
                            <span className="text-amber-500 font-medium">12 invoices</span> awaiting payment
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Cash on Hand</CardTitle>
                        <DollarSign className="h-4 w-4 text-sky-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$124,500.00</div>
                        <p className="text-xs text-muted-foreground mt-1">Across 3 bank accounts</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Expenses</CardTitle>
                        <ArrowDownRight className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$12,234.00</div>
                        <p className="text-xs text-muted-foreground mt-1">Mainly server costs & payroll</p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Invoices Table */}
            <Card className="col-span-4">
                <CardHeader>
                    <CardTitle>Recent Invoices</CardTitle>
                    <CardDescription>
                        You have {pendingAmount > 0 ? 'unpaid' : 'no'} invoices remaining for this month.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">Invoice ID</TableHead>
                                <TableHead>Client</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Due Date</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead className="text-right">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {invoices.slice(0, 5).map((invoice) => (
                                <TableRow key={invoice.id}>
                                    <TableCell className="font-medium">{invoice.id}</TableCell>
                                    <TableCell>{invoice.client}</TableCell>
                                    <TableCell>{format(invoice.date, 'MMM dd, yyyy')}</TableCell>
                                    <TableCell>{format(invoice.dueDate, 'MMM dd, yyyy')}</TableCell>
                                    <TableCell>${invoice.amount.toLocaleString()}</TableCell>
                                    <TableCell className="text-right">
                                        <Badge variant={
                                            invoice.status === 'paid' ? 'success' :
                                                invoice.status === 'pending' ? 'warning' : 'destructive'
                                        }>
                                            {invoice.status.toUpperCase()}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
