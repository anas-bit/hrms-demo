import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { ArrowLeft, Package, Edit, BarChart3, AlertTriangle } from 'lucide-react';
import { MOCK_PRODUCTS } from '../../services/mockData';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const MOCK_HISTORY = [
    { date: 'Jan', stock: 120 },
    { date: 'Feb', stock: 110 },
    { date: 'Mar', stock: 140 },
    { date: 'Apr', stock: 135 },
    { date: 'May', stock: 90 },
    { date: 'Jun', stock: 85 },
];

export function ProductDetail() {
    const navigate = useNavigate();
    const { id } = useParams();

    const product = MOCK_PRODUCTS.find(p => p.id === id);

    if (!product) {
        return (
            <div className="flex flex-col items-center justify-center h-96 space-y-4">
                <AlertTriangle className="w-12 h-12 text-amber-500" />
                <h2 className="text-xl font-semibold">Product Not Found</h2>
                <Button onClick={() => navigate('/app/inventory')}>Return to Inventory</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => navigate('/app/inventory')}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        {product.name}
                        <Badge variant={product.stock < 50 ? 'destructive' : 'outline'}>
                            {product.stock} in stock
                        </Badge>
                    </h1>
                    <p className="text-muted-foreground">{product.sku}</p>
                </div>
                <Button>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Product
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Main Info */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Product Statistics</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={MOCK_HISTORY}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="stock" stroke="#f97316" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Details Side */}
                <Card>
                    <CardHeader>
                        <CardTitle>Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between py-2 border-b">
                            <span className="text-muted-foreground">Price</span>
                            <span className="font-semibold">${product.price}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                            <span className="text-muted-foreground">Category</span>
                            <span>{product.category}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                            <span className="text-muted-foreground">Safety Stock</span>
                            <span>50</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                            <span className="text-muted-foreground">Last Ordered</span>
                            <span>2 days ago</span>
                        </div>

                        <div className="pt-4">
                            <div className="aspect-square bg-slate-100 rounded-lg flex items-center justify-center">
                                <Package className="w-24 h-24 text-slate-300" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" />
                        Movement History
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Quantity</TableHead>
                                <TableHead>Reference</TableHead>
                                <TableHead className="text-right">Balance</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell>Oct 24, 2023</TableCell>
                                <TableCell><Badge variant="outline">Sale</Badge></TableCell>
                                <TableCell className="text-red-600">-5</TableCell>
                                <TableCell>ORD-001</TableCell>
                                <TableCell className="text-right">85</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Oct 20, 2023</TableCell>
                                <TableCell><Badge variant="secondary">Restock</Badge></TableCell>
                                <TableCell className="text-green-600">+50</TableCell>
                                <TableCell>PO-102</TableCell>
                                <TableCell className="text-right">90</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
