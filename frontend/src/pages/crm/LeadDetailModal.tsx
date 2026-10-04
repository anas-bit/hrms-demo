import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useState, useEffect } from 'react';
import { useAppStore, type Lead } from '../../store/useAppStore';

interface LeadDetailModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    lead: Lead | null; // Use Store Lead Type
}

export function LeadDetailModal({ open, onOpenChange, lead }: LeadDetailModalProps) {
    const addLead = useAppStore(state => state.addLead);
    const updateLead = useAppStore(state => state.updateLead);
    const deleteLead = useAppStore(state => state.deleteLead);

    // Local form state
    const [formData, setFormData] = useState({
        name: '',
        company: '',
        value: 0,
        email: '',
        stage: 'new'
    });

    useEffect(() => {
        if (lead) {
            setFormData({
                name: lead.name,
                company: lead.company,
                value: lead.value,
                email: lead.email,
                stage: lead.stage
            });
        } else {
            // Reset for new lead
            setFormData({
                name: '',
                company: '',
                value: 0,
                email: '',
                stage: 'new'
            });
        }
    }, [lead, open]);

    const handleSave = () => {
        if (lead) {
            updateLead(lead.id, formData);
        } else {
            addLead(formData);
        }
        onOpenChange(false);
    };

    const handleDelete = () => {
        if (lead) {
            deleteLead(lead.id);
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{lead ? 'Edit Lead' : 'Create New Lead'}</DialogTitle>
                    <DialogDescription>
                        {lead ? 'Update deal information and status.' : 'Enter details for the new sales opportunity.'}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="name" className="text-right text-sm font-medium">
                            Name
                        </label>
                        <Input
                            id="name"
                            className="col-span-3"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="company" className="text-right text-sm font-medium">
                            Company
                        </label>
                        <Input
                            id="company"
                            className="col-span-3"
                            value={formData.company}
                            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="email" className="text-right text-sm font-medium">
                            Email
                        </label>
                        <Input
                            id="email"
                            className="col-span-3"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <label htmlFor="value" className="text-right text-sm font-medium">
                            Value ($)
                        </label>
                        <Input
                            id="value"
                            type="number"
                            className="col-span-3"
                            value={formData.value}
                            onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) })}
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <label className="text-right text-sm font-medium">Stage</label>
                        <select
                            className="col-span-3 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            value={formData.stage}
                            onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                        >
                            <option value="new">New Lead</option>
                            <option value="qualified">Qualification</option>
                            <option value="proposal">Proposal</option>
                            <option value="negotiation">Negotiation</option>
                            <option value="won">Closed Won</option>
                        </select>
                    </div>
                </div>
                <DialogFooter className="flex justify-between sm:justify-between w-full">
                    {lead ? (
                        <Button variant="destructive" onClick={handleDelete}>Delete Lead</Button>
                    ) : (<div></div>)}

                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button onClick={handleSave}>Save changes</Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
