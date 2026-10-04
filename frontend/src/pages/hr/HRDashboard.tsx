import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Mail, MapPin, Trash2, Edit } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export function HRDashboard() {
    const employees = useAppStore((state) => state.employees);
    const deleteEmployee = useAppStore((state) => state.deleteEmployee);
    const navigate = useNavigate();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">Human Capital</h1>
                    <p className="text-muted-foreground mt-1">Employee directory and payroll.</p>
                </div>
                <Button className="bg-pink-600 hover:bg-pink-700" onClick={() => navigate('/app/hr/add')}>Add Employee</Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {employees.map(emp => (
                    <Card key={emp.id} className="text-center overflow-hidden hover:shadow-lg transition-all group relative">
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-white/80" onClick={() => navigate(`/app/hr/add?id=${emp.id}`)}>
                                <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-white/80" onClick={() => deleteEmployee(emp.id)}>
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>

                        <div className="h-24 bg-gradient-to-r from-slate-100 to-slate-200" />
                        <div className="-mt-12 mb-4">
                            <img
                                src={emp.avatar || `https://ui-avatars.com/api/?name=${emp.name}`}
                                alt={emp.name}
                                className="w-24 h-24 rounded-full border-4 border-white mx-auto shadow-md bg-white"
                            />
                        </div>
                        <CardHeader className="pt-0 pb-2">
                            <CardTitle className="text-base">{emp.name}</CardTitle>
                            <p className="text-sm text-muted-foreground">{emp.role}</p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                                {emp.department}
                            </Badge>
                            <div className="flex justify-center gap-2 pt-2">
                                <Button size="sm" variant="outline" className="h-8 w-8 p-0 rounded-full">
                                    <Mail className="w-4 h-4 text-slate-500" />
                                </Button>
                                <Button size="sm" variant="outline" className="h-8 w-8 p-0 rounded-full">
                                    <MapPin className="w-4 h-4 text-slate-500" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
