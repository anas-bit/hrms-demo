import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { MOCK_INVOICES } from '../../services/mockData'; // Reusing invoices as orders for MVP simplicity
import { format } from 'date-fns';
import { Plus } from 'lucide-react';

// Re-using Mock Invoices structure but treating as Sales Orders for prototype speed
const MOCK_ORDERS = MOCK_INVOICES.map(inv => ({ ...inv, id: inv.id.replace('INV', 'SO'), status: 'Processing' }));

export function SalesOrders() {
    const [orders] = useState(MOCK_ORDERS);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Sales Orders</h1>
                    <p className="text-muted-foreground mt-1">Process and track customer orders.</p>
                </div>
                <Button onClick={() => window.location.href = '/app/crm/orders/new'}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Order
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                {orders.map((order) => (
                    <Card key={order.id} className="hover:border-blue-500 transition-colors cursor-pointer">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{order.id}</CardTitle>
                            <Badge variant="outline">{order.status}</Badge>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">${order.amount.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground mt-1">{order.client}</p>
                            <div className="mt-4 flex items-center justify-between text-xs text-slate-500 border-t pt-4">
                                <span>Placed: {format(order.date, 'MMM dd')}</span>
                                <Button variant="ghost" size="sm" className="h-6 text-xs">View Details</Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
