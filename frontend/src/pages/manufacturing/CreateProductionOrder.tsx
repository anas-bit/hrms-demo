import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { ArrowLeft, Play, AlertTriangle } from 'lucide-react';
import { MOCK_PRODUCTS } from '../../services/mockData';
import { useAppStore } from '../../store/useAppStore';
import { toast } from 'sonner';

export function CreateProductionOrder() {
    const navigate = useNavigate();
    const addProductionOrder = useAppStore(state => state.addProductionOrder);
    const [isLoading, setIsLoading] = useState(false);

    const [productSearch, setProductSearch] = useState('');
    const [quantity, setQuantity] = useState(10);
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

    const selectedProduct = MOCK_PRODUCTS.find(p => p.name.toLowerCase().includes(productSearch.toLowerCase()));

    const handleSubmit = async () => {
        setIsLoading(true);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));

        try {
            if (selectedProduct) {
                addProductionOrder({
                    productName: selectedProduct.name,
                    quantity,
                    startDate: new Date(startDate),
                    status: 'Planned'
                });
                toast.success("Production Order Created");
                navigate('/app/manufacturing');
            }
        } catch (error) {
            toast.error("Failed to create order");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => navigate('/app/manufacturing')}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                </Button>
                <h1 className="text-2xl font-bold tracking-tight">New Production Order</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Order Details</CardTitle>
                    <CardDescription>Initiate a new manufacturing run.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Product to Manufacture</label>
                        <Input
                            placeholder="Search BOM (e.g. Drone)..."
                            value={productSearch}
                            onChange={e => setProductSearch(e.target.value)}
                        />
                        {productSearch && !selectedProduct && (
                            <p className="text-xs text-red-500">Product not found in BOM registry.</p>
                        )}
                        {selectedProduct && (
                            <div className="mt-2 p-3 bg-slate-50 border rounded-md flex items-center justify-between">
                                <span className="font-medium text-sm">{selectedProduct.name}</span>
                                <span className="text-xs text-muted-foreground">SKU: {selectedProduct.sku}</span>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Target Quantity</label>
                            <Input
                                type="number"
                                min="1"
                                value={quantity}
                                onChange={e => setQuantity(parseInt(e.target.value))}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Start Date</label>
                            <Input
                                type="date"
                                value={startDate}
                                onChange={e => setStartDate(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm flex gap-3">
                        <AlertTriangle className="w-5 h-5 shrink-0" />
                        <div>
                            <div className="font-semibold">Resource Check</div>
                            Based on current inventory, we have enough raw materials for {Math.floor(quantity * 1.2)} units.
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => navigate('/app/manufacturing')}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={!productSearch || isLoading}>
                        <Play className="w-4 h-4 mr-2" />
                        {isLoading ? 'Starting...' : 'Start Production'}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
