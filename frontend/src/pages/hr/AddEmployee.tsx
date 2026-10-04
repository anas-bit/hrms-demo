import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { ArrowLeft, Save } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export function AddEmployee() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const editId = searchParams.get('id');

    // Store Actions
    const addEmployee = useAppStore(state => state.addEmployee);
    const updateEmployee = useAppStore(state => state.updateEmployee);
    const employees = useAppStore(state => state.employees);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        role: '',
        department: '',
        systemRole: 'Employee'
    });

    useEffect(() => {
        if (editId) {
            const employee = employees.find(e => e.id === editId);
            if (employee) {
                const [firstName, ...lastNameParts] = employee.name.split(' ');
                setFormData({
                    firstName: firstName || '',
                    lastName: lastNameParts.join(' ') || '',
                    email: '', // Mock data doesn't guarantee email, typically
                    role: employee.role,
                    department: employee.department,
                    systemRole: 'Employee' // Default for existing mock data which lacks this field
                });
            }
        }
    }, [editId, employees]);

    const handleSave = () => {
        const fullName = `${formData.firstName} ${formData.lastName}`.trim();

        if (editId) {
            updateEmployee(editId, {
                name: fullName,
                role: formData.role,
                department: formData.department
            });
        } else {
            addEmployee({
                name: fullName,
                role: formData.role,
                department: formData.department,
                status: 'Active',
                email: formData.email
            } as any); // Casting for speed in prototype
        }
        navigate('/app/hr');
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => navigate('/app/hr')}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Directory
                </Button>
                <h1 className="text-2xl font-bold tracking-tight">{editId ? 'Edit Employee' : 'Add New Employee'}</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Employee Details</CardTitle>
                    <CardDescription>Enter the basic information for the new hire.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">First Name</label>
                            <Input
                                placeholder="John"
                                value={formData.firstName}
                                onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Last Name</label>
                            <Input
                                placeholder="Doe"
                                value={formData.lastName}
                                onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Email Address</label>
                        <Input
                            type="email"
                            placeholder="john.doe@company.com"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Job Title</label>
                            <Input
                                placeholder="e.g. Software Engineer"
                                value={formData.role}
                                onChange={e => setFormData({ ...formData, role: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Department</label>
                            <Input
                                placeholder="e.g. Engineering"
                                value={formData.department}
                                onChange={e => setFormData({ ...formData, department: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="p-4 bg-slate-50 border rounded-lg mt-4">
                        <h3 className="text-sm font-semibold mb-3">System Access & Permissions (RBAC)</h3>
                        <div className="grid grid-cols-3 gap-4">
                            {['Administrator', 'Manager', 'Employee'].map(role => (
                                <div
                                    key={role}
                                    onClick={() => setFormData({ ...formData, systemRole: role })}
                                    className={`
                                        cursor-pointer p-3 rounded-md border text-center text-sm font-medium transition-all
                                        ${formData.systemRole === role
                                            ? 'bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500'
                                            : 'bg-white hover:border-slate-300 text-slate-600'}
                                    `}
                                >
                                    {role}
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            {formData.systemRole === 'Administrator' && "Full access to all modules and settings."}
                            {formData.systemRole === 'Manager' && "Can view and edit module data but cannot change system settings."}
                            {formData.systemRole === 'Employee' && "View-only access to assigned modules."}
                        </p>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => navigate('/app/hr')}>Cancel</Button>
                    <Button onClick={handleSave}>
                        <Save className="w-4 h-4 mr-2" />
                        {editId ? 'Update Employee' : 'Save Employee'}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
