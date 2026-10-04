import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MoreHorizontal } from 'lucide-react';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';

const RESOURCES = [
    { id: 1, name: 'Assembly Station A', type: 'Assembly' },
    { id: 2, name: 'Assembly Station B', type: 'Assembly' },
    { id: 3, name: 'CNC Machine 01', type: 'Machining' },
    { id: 4, name: 'Testing Booth', type: 'QA' },
];

const TASKS = [
    { id: 1, resourceId: 1, title: 'Assemble X100 Frame', startValues: [1, 3], color: 'bg-blue-200 border-blue-400 text-blue-800' },
    { id: 2, resourceId: 3, title: 'Machine Propellers', startValues: [0, 2], color: 'bg-purple-200 border-purple-400 text-purple-800' },
    { id: 3, resourceId: 2, title: 'Wiring Harness', startValues: [2, 4], color: 'bg-orange-200 border-orange-400 text-orange-800' },
    { id: 4, resourceId: 4, title: 'Final QA Check', startValues: [3, 5], color: 'bg-emerald-200 border-emerald-400 text-emerald-800' },
];

export function WorkCenterSchedule() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

    const nextWeek = () => setCurrentDate(addDays(currentDate, 7));
    const prevWeek = () => setCurrentDate(addDays(currentDate, -7));

    return (
        <div className="flex flex-col h-[calc(100vh-6rem)] space-y-4">
            <div className="flex items-center justify-between shrink-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Work Center Schedule</h1>
                    <p className="text-muted-foreground mt-1">Resource allocation and capacity planning.</p>
                </div>
                <div className="flex items-center gap-2 border rounded-md p-1 bg-white shadow-sm">
                    <Button variant="ghost" size="icon" onClick={prevWeek}>
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <div className="px-4 font-medium min-w-[200px] text-center flex items-center justify-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                        {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
                    </div>
                    <Button variant="ghost" size="icon" onClick={nextWeek}>
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            <Card className="flex-1 overflow-hidden flex flex-col">
                <div className="flex border-b">
                    <div className="w-48 p-4 font-medium text-sm text-muted-foreground bg-slate-50 border-r shrink-0">
                        Resource
                    </div>
                    {days.slice(0, 5).map(day => (
                        <div key={day.toString()} className={`flex-1 p-3 text-center border-r last:border-0 ${isSameDay(day, new Date()) ? 'bg-blue-50/50' : ''}`}>
                            <div className="font-semibold text-sm">{format(day, 'EEE')}</div>
                            <div className={`text-xs mt-1 ${isSameDay(day, new Date()) ? 'text-blue-600 font-bold' : 'text-muted-foreground'}`}>
                                {format(day, 'MMM d')}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto">
                    {RESOURCES.map(resource => (
                        <div key={resource.id} className="flex border-b min-h-[100px] hover:bg-slate-50/50 transition-colors">
                            <div className="w-48 p-4 border-r bg-slate-50/30 shrink-0">
                                <div className="font-medium text-sm">{resource.name}</div>
                                <div className="text-xs text-muted-foreground mt-1">{resource.type}</div>
                            </div>
                            <div className="flex-1 relative grid grid-cols-5 divide-x">
                                {[0, 1, 2, 3, 4].map(idx => (
                                    <div key={idx} className="h-full relative p-2">
                                        {/* Grid lines */}
                                    </div>
                                ))}

                                {/* Render Scheduled Tasks */}
                                {TASKS.filter(t => t.resourceId === resource.id).map(task => (
                                    <div
                                        key={task.id}
                                        className={`absolute top-2 bottom-2 m-1 rounded-md border p-2 text-xs font-medium shadow-sm flex flex-col justify-between cursor-pointer hover:brightness-95 transition-all ${task.color}`}
                                        style={{
                                            left: `${(task.startValues[0]) * 20}%`,
                                            width: `${(task.startValues[1] - task.startValues[0]) * 20}%`
                                        }}
                                    >
                                        <div className="truncate">{task.title}</div>
                                        <div className="flex justify-between items-center opacity-75">
                                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 4h</span>
                                            <MoreHorizontal className="w-3 h-3" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}
