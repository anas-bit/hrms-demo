import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { ChevronRight, ChevronDown, Package, Layers, Settings, Plus } from 'lucide-react';

interface BOMNode {
    id: string;
    name: string;
    sku: string;
    quantity: number;
    type: 'assembly' | 'component' | 'raw_material';
    cost: number;
    children?: BOMNode[];
}

const MOCK_BOM: BOMNode[] = [
    {
        id: '1',
        name: 'Industrial Drone X100',
        sku: 'DRN-X100',
        quantity: 1,
        type: 'assembly',
        cost: 1250.00,
        children: [
            {
                id: '2',
                name: 'Propulsion System',
                sku: 'ASM-PROP-01',
                quantity: 4,
                type: 'assembly',
                cost: 150.00,
                children: [
                    { id: '2a', name: 'Brushless Motor 200W', sku: 'MTR-200W', quantity: 1, type: 'component', cost: 85.00 },
                    { id: '2b', name: 'Carbon Fiber Propeller', sku: 'PRP-12in', quantity: 1, type: 'component', cost: 25.00 },
                    { id: '2c', name: 'ESC Controller', sku: 'ESC-40A', quantity: 1, type: 'component', cost: 40.00 },
                ]
            },
            {
                id: '3',
                name: 'Main Frame Chassis',
                sku: 'FRM-CF-X1',
                quantity: 1,
                type: 'assembly',
                cost: 450.00,
                children: [
                    { id: '3a', name: 'Top Plate', sku: 'PLT-TOP', quantity: 1, type: 'raw_material', cost: 120.00 },
                    { id: '3b', name: 'Bottom Plate', sku: 'PLT-BOT', quantity: 1, type: 'raw_material', cost: 120.00 },
                    { id: '3c', name: 'Arm Mounts', sku: 'MNT-ARM', quantity: 4, type: 'component', cost: 15.00 },
                ]
            },
            {
                id: '4',
                name: 'Flight Controller Module',
                sku: 'ELEC-FC-V2',
                quantity: 1,
                type: 'component',
                cost: 200.00
            }
        ]
    }
];

const TreeNode = ({ node, level = 0 }: { node: BOMNode; level?: number }) => {
    const [expanded, setExpanded] = useState(true);
    const hasChildren = node.children && node.children.length > 0;

    return (
        <div className="select-none">
            <div
                className={`flex items-center py-2 px-2 hover:bg-slate-50 rounded-md cursor-pointer group ${level === 0 ? 'bg-slate-50/50 mb-1' : ''}`}
                style={{ paddingLeft: `${level * 24 + 8}px` }}
                onClick={() => setExpanded(!expanded)}
            >
                <div className="mr-2 w-4 flex justify-center text-slate-400">
                    {hasChildren && (
                        expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
                    )}
                </div>

                <div className={`mr-3 p-1.5 rounded-md ${node.type === 'assembly' ? 'bg-blue-100 text-blue-600' :
                    node.type === 'component' ? 'bg-emerald-100 text-emerald-600' :
                        'bg-slate-200 text-slate-600'
                    }`}>
                    {node.type === 'assembly' ? <Layers className="w-4 h-4" /> :
                        node.type === 'component' ? <Settings className="w-4 h-4" /> :
                            <Package className="w-4 h-4" />}
                </div>

                <div className="flex-1 grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-6 font-medium text-sm flex items-center gap-2">
                        {node.name}
                        {level === 0 && <Badge variant="outline" className="ml-2 text-xs font-normal text-slate-500">Finished Good</Badge>}
                    </div>
                    <div className="col-span-3 text-sm text-muted-foreground">{node.sku}</div>
                    <div className="col-span-1 text-sm text-center bg-slate-100 rounded px-1">{node.quantity}</div>
                    <div className="col-span-2 text-sm text-right font-medium">${node.cost.toFixed(2)}</div>
                </div>
            </div>

            {hasChildren && expanded && (
                <div>
                    {node.children!.map(child => (
                        <TreeNode key={child.id} node={child} level={level + 1} />
                    ))}
                </div>
            )}
        </div>
    );
}

export function BOMManager() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Bill of Materials</h1>
                    <p className="text-muted-foreground mt-1">Manage product structures and component hierarchies.</p>
                </div>
                <Button onClick={() => window.location.href = '/app/manufacturing/bom/new'}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create BOM
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-[300px_1fr]">
                <Card className="h-[calc(100vh-200px)]">
                    <CardHeader>
                        <CardTitle className="text-sm">Product List</CardTitle>
                        <div className="relative">
                            <Input placeholder="Search products..." className="h-8 text-xs" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-2 space-y-1">
                        {[1, 2, 3].map(i => (
                            <div key={i} className={`p-2 rounded-md text-sm cursor-pointer flex items-center justify-between group ${i === 1 ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50'}`}>
                                <span>Industrial Drone X10{i - 1}</span>
                                <ChevronRight className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100" />
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle>BOM Structure: Industrial Drone X100</CardTitle>
                            <div className="flex gap-2 text-sm text-muted-foreground">
                                <span>Total Parts: 14</span>
                                <span>•</span>
                                <span>Total Cost: $1,250.00</span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="border rounded-lg overflow-hidden bg-white">
                            <div className="bg-slate-50 border-b p-2 grid grid-cols-12 gap-4 text-xs font-semibold text-muted-foreground pl-12 uppercase">
                                <div className="col-span-6">Item Name</div>
                                <div className="col-span-3">SKU</div>
                                <div className="col-span-1 text-center">Qty</div>
                                <div className="col-span-2 text-right">Cost</div>
                            </div>
                            <div className="p-2">
                                {MOCK_BOM.map(node => (
                                    <TreeNode key={node.id} node={node} />
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
