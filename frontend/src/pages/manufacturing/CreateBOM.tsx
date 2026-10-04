import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useAppStore } from '../../store/useAppStore';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export function CreateBOM() {
    const navigate = useNavigate();
    const addBOM = useAppStore(state => state.addBOM);
    const [isLoading, setIsLoading] = useState(false);

    const [productName, setProductName] = useState('');
    const [sku, setSku] = useState('');
    const [version, setVersion] = useState('1.0');

    const [components, setComponents] = useState<{ id: number; name: string; quantity: number; cost: number }[]>([
        { id: 1, name: '', quantity: 1, cost: 0 }
    ]);

    const handleAddComponent = () => {
        setComponents([...components, { id: Date.now(), name: '', quantity: 1, cost: 0 }]);
    };

    const handleRemoveComponent = (id: number) => {
        if (components.length > 1) {
            setComponents(components.filter(c => c.id !== id));
        }
    };

    const updateComponent = (id: number, field: string, value: string | number) => {
        setComponents(components.map(c =>
            c.id === id ? { ...c, [field]: value } : c
        ));
    };

    const calculateTotalCost = () => {
        return components.reduce((sum, item) => sum + (item.quantity * item.cost), 0);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        await new Promise(resolve => setTimeout(resolve, 800));

        // Save to store
        // Note: In real app BOM structure is complex (nested), here simplifying to single node for demo
        addBOM({
            id: `BOM-${Date.now()}`,
            name: productName,
            sku: sku,
            quantity: 1,
            cost: calculateTotalCost(),
            // children: components... (simplified for mock)
        });

        toast.success("Bill of Materials created successfully");
        navigate('/app/manufacturing/bom');
        setIsLoading(false);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="sm" onClick={() => navigate('/app/manufacturing/bom')}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to BOM List
                </Button>
                <h1 className="text-2xl font-bold tracking-tight">Create Bill of Materials</h1>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid gap-6 md:grid-cols-3">
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>BOM Configuration</CardTitle>
                            <CardDescription>Define components and materials for {productName || 'New Product'}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="product">Product Name</Label>
                                    <Input
                                        id="product"
                                        placeholder="e.g. Industrial Drone"
                                        required
                                        value={productName}
                                        onChange={(e) => setProductName(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="sku">SKU</Label>
                                    <Input
                                        id="sku"
                                        placeholder="e.g. DRN-X100"
                                        required
                                        value={sku}
                                        onChange={(e) => setSku(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="version">Version</Label>
                                <Input
                                    id="version"
                                    placeholder="1.0"
                                    value={version}
                                    onChange={(e) => setVersion(e.target.value)}
                                />
                            </div>

                            <div className="space-y-4 pt-4 border-t">
                                <div className="flex items-center justify-between">
                                    <Label>Components & Materials</Label>
                                    <Button type="button" variant="outline" size="sm" onClick={handleAddComponent}>
                                        <Plus className="w-3 h-3 mr-1" /> Add Component
                                    </Button>
                                </div>

                                <div className="space-y-3">
                                    {components.map((item) => (
                                        <div key={item.id} className="flex gap-3 items-end p-3 border rounded-lg bg-slate-50/50">
                                            <div className="flex-1 space-y-1">
                                                <Label className="text-xs">Component Name</Label>
                                                <Input
                                                    placeholder="Part Name"
                                                    value={item.name}
                                                    onChange={(e) => updateComponent(item.id, 'name', e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className="w-24 space-y-1">
                                                <Label className="text-xs">Qty</Label>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    value={item.quantity}
                                                    onChange={(e) => updateComponent(item.id, 'quantity', parseInt(e.target.value) || 0)}
                                                    required
                                                />
                                            </div>
                                            <div className="w-32 space-y-1">
                                                <Label className="text-xs">Est. Cost ($)</Label>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={item.cost}
                                                    onChange={(e) => updateComponent(item.id, 'cost', parseFloat(e.target.value) || 0)}
                                                    required
                                                />
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => handleRemoveComponent(item.id)}
                                                disabled={components.length === 1}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Cost Estimation</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between font-bold text-lg pt-2">
                                    <span>Total Estimated Cost</span>
                                    <span>${calculateTotalCost().toLocaleString()}</span>
                                </div>

                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    <Save className="w-4 h-4 mr-2" />
                                    {isLoading ? 'Saving...' : 'Create BOM'}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
        </div>
    );
}
