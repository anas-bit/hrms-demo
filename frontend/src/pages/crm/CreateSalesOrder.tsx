import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { ArrowLeft, Plus, Trash2, Send } from 'lucide-react';

interface OrderItem {
    id: number;
    product: string;
    quantity: number;
    price: number;
}

export function CreateSalesOrder() {
    const navigate = useNavigate();
    const [customer, setCustomer] = useState('');
    const [items, setItems] = useState<OrderItem[]>([
        { id: 1, product: 'Industrial Drone X100', quantity: 1, price: 1250.00 }
    ]);

    const addItem = () => {
        setItems([...items, { id: Date.now(), product: '', quantity: 1, price: 0 }]);
    };

    const removeItem = (id: number) => {
        setItems(items.filter(item => item.id !== id));
    };

    const updateItem = (id: number, field: keyof OrderItem, value: string | number) => {
        setItems(items.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    const total = items.reduce((acc, item) => acc + (item.quantity * item.price), 0);

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => navigate('/app/crm/orders')}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Orders
                </Button>
                <h1 className="text-2xl font-bold tracking-tight">New Sales Order</h1>
            </div>

            <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Details</CardTitle>
                            <CardDescription>Customer information and shipping details.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Customer Name</label>
                                <Input placeholder="Search customer..." value={customer} onChange={e => setCustomer(e.target.value)} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Order Date</label>
                                    <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Expected Delivery</label>
                                    <Input type="date" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Items</CardTitle>
                            <Button size="sm" variant="outline" onClick={addItem}>
                                <Plus className="w-4 h-4 mr-2" /> Add Product
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {items.map((item) => (
                                <div key={item.id} className="flex gap-4 items-end">
                                    <div className="flex-1 space-y-2">
                                        <label className="text-xs font-medium text-muted-foreground">Product</label>
                                        <Input
                                            value={item.product}
                                            onChange={e => updateItem(item.id, 'product', e.target.value)}
                                            placeholder="Search product..."
                                        />
                                    </div>
                                    <div className="w-20 space-y-2">
                                        <label className="text-xs font-medium text-muted-foreground">Qty</label>
                                        <Input
                                            type="number"
                                            min="1"
                                            value={item.quantity}
                                            onChange={e => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                                        />
                                    </div>
                                    <div className="w-32 space-y-2">
                                        <label className="text-xs font-medium text-muted-foreground">Price</label>
                                        <Input
                                            type="number"
                                            min="0"
                                            value={item.price}
                                            onChange={e => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                                        />
                                    </div>
                                    <Button size="icon" variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => removeItem(item.id)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="sticky top-20">
                        <CardHeader>
                            <CardTitle>Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Items ({items.length})</span>
                                <span>${total.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Tax</span>
                                <span>Calculated at invoice</span>
                            </div>
                            <div className="border-t pt-4 flex justify-between font-bold text-lg">
                                <span>Total</span>
                                <span>${total.toFixed(2)}</span>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" size="lg" onClick={() => navigate('/app/crm/orders')}>
                                <Send className="w-4 h-4 mr-2" />
                                Create Order
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}
