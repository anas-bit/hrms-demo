import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { MOCK_PRODUCTION } from '../../services/mockData';
import { Clock } from 'lucide-react';
import { format } from 'date-fns';

export function ManufacturingDashboard() {
    const [orders] = useState(MOCK_PRODUCTION);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">Manufacturing</h1>
                    <p className="text-muted-foreground mt-1">Production planning and shop floor control.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => window.location.href = '/app/manufacturing/bom'}>
                        View BOMs
                    </Button>
                    <Button variant="outline" onClick={() => window.location.href = '/app/manufacturing/schedule'}>
                        View Schedule
                    </Button>
                    <Button className="bg-slate-900" onClick={() => window.location.href = '/app/manufacturing/new'}>Create Production Order</Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {orders.map(order => (
                    <Card key={order.id} className="hover:shadow-lg transition-all">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <Badge variant="outline">{order.id}</Badge>
                                <Badge variant={order.status === 'Completed' ? 'success' : order.status === 'In Progress' ? 'info' : 'secondary'}>
                                    {order.status}
                                </Badge>
                            </div>
                            <CardTitle className="text-lg mt-2">{order.product}</CardTitle>
                            <CardDescription>Qty: {order.quantity} units</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs text-muted-foreground">
                                        <span>Progress</span>
                                        <span>{order.completion}%</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${order.status === 'Completed' ? 'bg-emerald-500' : 'bg-blue-500'}`}
                                            style={{ width: `${order.completion}%` }}
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center text-xs text-slate-500">
                                    <Clock className="w-3 h-3 mr-1" />
                                    Started: {format(order.startDate, 'MMM dd')}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
