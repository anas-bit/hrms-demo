import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Package, Search, Filter, AlertTriangle, Plus, Trash2 } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export function InventoryDashboard() {
    // Store
    const products = useAppStore(state => state.products);
    const deleteProduct = useAppStore(state => state.deleteProduct);

    const [searchTerm, setSearchTerm] = useState('');

    // Filter logic
    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const lowStockCount = products.filter(p => p.stock < 50).length;
    // Safe parse for price since it might be string in initial mock
    const totalValue = products.reduce((acc, curr) => acc + (parseFloat(curr.price.toString()) * curr.stock), 0);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-orange-500 to-amber-600 bg-clip-text text-transparent">Supply Chain</h1>
                    <p className="text-muted-foreground mt-1">Inventory control and procurement.</p>
                </div>
                <Button className="bg-orange-600 hover:bg-orange-700" onClick={() => window.location.href = '/app/inventory/new'}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                </Button>
            </div>

            {/* Metrics */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Inventory Value</CardTitle>
                        <Package className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{lowStockCount}</div>
                        <p className="text-xs text-muted-foreground mt-1">Items below safety threshold</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total SKUs</CardTitle>
                        <Package className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{products.length}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Product Catalog */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Product Catalog</CardTitle>
                            <CardDescription>Manage your global inventory.</CardDescription>
                        </div>
                        <div className="flex gap-2">
                            <div className="relative w-64">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search products..."
                                    className="pl-8"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Button variant="outline" size="icon">
                                <Filter className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filteredProducts.map(product => (
                            <div key={product.id} className="group relative bg-white border rounded-xl overflow-hidden hover:shadow-lg transition-all">
                                <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        className="h-8 w-8 rounded-full shadow-md"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteProduct(product.id);
                                        }}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>

                                <div className="aspect-square bg-slate-100 flex items-center justify-center relative">
                                    {/* Placeholder Image */}
                                    <Package className="w-16 h-16 text-slate-300" />
                                    <div className="absolute top-2 right-2">
                                        <Badge variant={product.stock < 50 ? 'destructive' : 'secondary'}>
                                            {product.stock} in stock
                                        </Badge>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <div className="text-xs text-muted-foreground mb-1">{product.sku}</div>
                                    <h3 className="font-semibold text-slate-800 truncate" title={product.name}>{product.name}</h3>
                                    <div className="flex items-center justify-between mt-3">
                                        <div className="font-bold text-lg">${product.price}</div>
                                        <div className="text-xs text-slate-500">{product.category}</div>
                                    </div>
                                </div>
                                <div className="absolute inset-x-0 bottom-0 p-4 bg-white/90 translate-y-full group-hover:translate-y-0 transition-transform duration-300 border-t flex gap-2">
                                    <Button size="sm" className="w-full bg-slate-900" onClick={() => window.location.href = `/app/inventory/products/${product.id}`}>
                                        View Details
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
