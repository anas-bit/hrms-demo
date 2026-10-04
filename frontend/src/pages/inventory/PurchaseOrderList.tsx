import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { MOCK_PURCHASE_ORDERS } from '../../services/mockData';
import { Plus, Filter, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

export function PurchaseOrderList() {
    const [orders] = useState(MOCK_PURCHASE_ORDERS);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Purchase Orders</h1>
                    <p className="text-muted-foreground mt-1">Manage vendor procurement and spending.</p>
                </div>
                <Button className="bg-orange-600 hover:bg-orange-700" onClick={() => window.location.href = '/app/inventory/purchase-orders/new'}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create PO
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Recent Orders</CardTitle>
                        <Button variant="outline" size="sm">
                            <Filter className="w-4 h-4 mr-2" />
                            Filter
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>PO Number</TableHead>
                                <TableHead>Vendor</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Items</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Total Amount</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.map((po) => (
                                <TableRow key={po.id}>
                                    <TableCell className="font-medium">{po.id}</TableCell>
                                    <TableCell>{po.vendor}</TableCell>
                                    <TableCell>{format(po.date, 'MMM dd, yyyy')}</TableCell>
                                    <TableCell>{po.items} items</TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            po.status === 'Received' ? 'success' :
                                                po.status === 'Sent' ? 'info' : 'secondary'
                                        }>
                                            {po.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right font-bold">${po.total.toLocaleString()}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm">
                                            <ExternalLink className="w-4 h-4" />
                                        </Button>
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
