import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { ArrowLeft, Plus, Trash2, Save, Send } from 'lucide-react';

interface LineItem {
    id: number;
    description: string;
    quantity: number;
    price: number;
}

export function CreateInvoice() {
    const navigate = useNavigate();
    const [client, setClient] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [items, setItems] = useState<LineItem[]>([
        { id: 1, description: 'Consulting Services', quantity: 1, price: 150.00 }
    ]);

    const addItem = () => {
        setItems([...items, { id: Date.now(), description: '', quantity: 1, price: 0 }]);
    };

    const removeItem = (id: number) => {
        setItems(items.filter(item => item.id !== id));
    };

    const updateItem = (id: number, field: keyof LineItem, value: string | number) => {
        setItems(items.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    const calculateSubtotal = () => items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
    const taxRate = 0.1; // 10%
    const subtotal = calculateSubtotal();
    const tax = subtotal * taxRate;
    const total = subtotal + tax;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => navigate('/app/finance')}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Finance
                </Button>
                <h1 className="text-2xl font-bold tracking-tight">Create New Invoice</h1>
            </div>

            <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Invoice Details</CardTitle>
                            <CardDescription>Enter client and billing information.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Client Name</label>
                                <Input placeholder="e.g. Acme Corp" value={client} onChange={e => setClient(e.target.value)} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Issue Date</label>
                                    <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Due Date</label>
                                    <Input type="date" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Line Items</CardTitle>
                            <Button size="sm" variant="outline" onClick={addItem}>
                                <Plus className="w-4 h-4 mr-2" /> Add Item
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {items.map((item) => (
                                <div key={item.id} className="flex gap-4 items-end">
                                    <div className="flex-1 space-y-2">
                                        <label className="text-xs font-medium text-muted-foreground">Description</label>
                                        <Input
                                            value={item.description}
                                            onChange={e => updateItem(item.id, 'description', e.target.value)}
                                            placeholder="Service or product..."
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
                                            step="0.01"
                                            value={item.price}
                                            onChange={e => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                                        />
                                    </div>
                                    <div className="w-24 space-y-2 text-right">
                                        <label className="text-xs font-medium text-muted-foreground">Total</label>
                                        <div className="h-10 flex items-center justify-end font-medium">
                                            ${(item.quantity * item.price).toFixed(2)}
                                        </div>
                                    </div>
                                    <Button size="icon" variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => removeItem(item.id)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}

                            {items.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                                    No items added. Click "Add Item" to start.
                                </div>
                            )}
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
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Tax (10%)</span>
                                <span>${tax.toFixed(2)}</span>
                            </div>
                            <div className="border-t pt-4 flex justify-between font-bold text-lg">
                                <span>Total</span>
                                <span>${total.toFixed(2)}</span>
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-2">
                            <Button className="w-full" size="lg">
                                <Send className="w-4 h-4 mr-2" /> Create & Send
                            </Button>
                            <Button variant="outline" className="w-full">
                                <Save className="w-4 h-4 mr-2" /> Save Draft
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}
