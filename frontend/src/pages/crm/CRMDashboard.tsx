import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Plus, MoreHorizontal, Phone, Mail, Calendar } from 'lucide-react';
import { LeadDetailModal } from './LeadDetailModal';
import { useAppStore } from '../../store/useAppStore';

export function CRMDashboard() {
    // Store
    const leads = useAppStore(state => state.leads);
    const [selectedLead, setSelectedLead] = useState<typeof leads[0] | null>(null);
    const [modalOpen, setModalOpen] = useState(false);

    const handleLeadClick = (lead: typeof leads[0]) => {
        setSelectedLead(lead);
        setModalOpen(true);
    };

    const stages = [
        { id: 'new', label: 'New Lead', color: 'border-blue-500 bg-blue-50' },
        { id: 'qualified', label: 'Qualification', color: 'border-purple-500 bg-purple-50' },
        { id: 'proposal', label: 'Proposal', color: 'border-orange-500 bg-orange-50' },
        { id: 'negotiation', label: 'Negotiation', color: 'border-pink-500 bg-pink-50' },
        { id: 'won', label: 'Closed Won', color: 'border-emerald-500 bg-emerald-50' }
    ];

    return (
        <div className="h-[calc(100vh-6rem)] flex flex-col space-y-4">
            <LeadDetailModal open={modalOpen} onOpenChange={setModalOpen} lead={selectedLead} />

            <div className="flex items-center justify-between shrink-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Pipeline</h1>
                    <p className="text-muted-foreground mt-1">Manage sales opportunities and deals.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => alert('Schedule View would open here (Calendar)')}>
                        <Calendar className="w-4 h-4 mr-2" />
                        Schedule
                    </Button>
                    <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => {
                        setSelectedLead(null); // Clear selection for new lead
                        setModalOpen(true);
                    }}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Lead
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-x-auto pb-4">
                <div className="flex gap-4 h-full min-w-[1200px]">
                    {stages.map(stage => {
                        const stageLeads = leads.filter(l => l.stage === stage.id);
                        const stageValue = stageLeads.reduce((acc, curr) => acc + curr.value, 0);

                        return (
                            <div key={stage.id} className="flex-1 flex flex-col gap-3 min-w-[280px]">
                                <div className={`p-3 rounded-lg border-t-4 ${stage.color} shadow-sm bg-white`}>
                                    <div className="flex justify-between items-center mb-1">
                                        <h3 className="font-semibold text-sm">{stage.label}</h3>
                                        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{stageLeads.length}</span>
                                    </div>
                                    <div className="text-xs text-slate-500 font-medium">
                                        ${stageValue.toLocaleString()}
                                    </div>
                                </div>

                                <div className="flex-1 space-y-3 overflow-y-auto pr-2">
                                    {stageLeads.map(lead => (
                                        <div
                                            key={lead.id}
                                            onClick={() => handleLeadClick(lead)}
                                            className="bg-white p-4 rounded-lg border shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-medium text-sm text-blue-600 group-hover:underline">{lead.company}</h4>
                                                <button className="text-slate-400 hover:text-slate-600">
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <p className="text-sm font-semibold mb-3">{lead.name}</p>
                                            <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                                                <span className="bg-slate-100 px-1.5 py-0.5 rounded">High Priority</span>
                                                <span>•</span>
                                                <span>2d ago</span>
                                            </div>
                                            <div className="flex items-center justify-between border-t pt-3 mt-3">
                                                <span className="font-bold text-sm text-slate-700">
                                                    ${lead.value.toLocaleString()}
                                                </span>
                                                <div className="flex gap-2">
                                                    <button className="p-1.5 hover:bg-slate-100 rounded text-slate-400 hover:text-blue-600 transition-colors">
                                                        <Phone className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button className="p-1.5 hover:bg-slate-100 rounded text-slate-400 hover:text-blue-600 transition-colors">
                                                        <Mail className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
}
