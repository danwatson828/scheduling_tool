"use client";

import { useState, useMemo } from "react";
import { User, Subtask, Task } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    DndContext,
    DragEndEvent,
    DragStartEvent,
    useDraggable,
    useDroppable,
    DragOverlay
} from "@dnd-kit/core";
import { TaskDetailsSheet } from "./TaskDetailsSheet";
import { NewTaskDialog } from "./NewTaskDialog";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

// Helper to abbreviate stage names for compact display
const getStageAbbreviation = (stage: string): string => {
    const abbreviations: Record<string, string> = {
        'Data Validation': 'Data Val',
        'Scripting & Data Pull': 'Scripting',
        'Validation': 'Validation',
        'Review w/ Staff Analyst': 'Review SA',
        'Review w/ AVP': 'Review AVP',
        'Completed': 'Done',
        'Blocked': 'Blocked'
    };
    return abbreviations[stage] || stage;
};

// --- Draggable Task Component ---
function DraggableTask({ subtask, task, width, left, top, height, isOverlay = false, onClick }: {
    subtask: Subtask, task: Task, width: string, left?: string, top?: string, height?: string, isOverlay?: boolean, onClick?: () => void
}) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: subtask.id.toString(),
        data: { subtask, task }
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;

    // Track pointer position to differentiate click from drag
    const handlePointerDown = (e: React.PointerEvent) => {
        const startX = e.clientX;
        const startY = e.clientY;

        const handlePointerUp = (upEvent: PointerEvent) => {
            const deltaX = Math.abs(upEvent.clientX - startX);
            const deltaY = Math.abs(upEvent.clientY - startY);

            // If movement is less than 5px, treat as click
            if (deltaX < 5 && deltaY < 5 && onClick) {
                onClick();
            }

            document.removeEventListener('pointerup', handlePointerUp);
        };

        document.addEventListener('pointerup', handlePointerUp);
    };

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            onPointerDown={handlePointerDown}
            style={{
                ...style,
                left: left,
                width: width,
                top: top,
                height: height
            }}
            className={cn(
                "rounded-lg px-3 py-2 text-xs text-white overflow-hidden whitespace-nowrap shadow-md border border-white/20 flex flex-col justify-center cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all relative",
                isOverlay ? "z-50 shadow-2xl scale-105 cursor-grabbing" : "absolute z-10 hover:z-20",
                subtask.stage === 'Blocked' ? "bg-gradient-to-br from-red-500 to-red-600" :
                    subtask.stage === 'Completed' ? "bg-gradient-to-br from-green-500 to-green-600 opacity-70" :
                        "bg-gradient-to-br from-blue-500 to-blue-600"
            )}
            title={`${subtask.name} (${subtask.estimatedHours}h) - ${subtask.stage}`}
        >
            {/* Stage Badge */}
            <div className={cn(
                "absolute top-1 right-1 px-1.5 py-0.5 rounded text-[9px] font-semibold leading-none backdrop-blur-sm",
                subtask.stage === 'Blocked' ? "bg-red-800/80" :
                    subtask.stage === 'Completed' ? "bg-green-800/80" :
                        subtask.stage.includes('Review') ? "bg-yellow-700/80" :
                            "bg-blue-800/80"
            )}>
                {getStageAbbreviation(subtask.stage)}
            </div>

            <div className="font-semibold truncate pr-14">{subtask.name}</div>
            <div className="text-[10px] opacity-90 truncate mt-0.5">{task.customerName}</div>
        </div>
    );
}

// --- Droppable Cell Component ---
function DroppableCell({ date, userId, children, height }: { date: Date, userId: number, children?: React.ReactNode, height: number }) {
    const { setNodeRef, isOver } = useDroppable({
        id: `${userId}|${date.toISOString()}`,
        data: { date, userId }
    });

    return (
        <div
            ref={setNodeRef}
            style={{ height: `${height}px` }}
            className={cn(
                "relative border-r last:border-r-0 transition-colors transition-[height] duration-300 ease-in-out",
                [0, 6].includes(date.getDay()) ? "bg-muted/5" : "bg-transparent",
                isOver ? "bg-blue-500/10" : ""
            )}
        >
            {children}
        </div>
    );
}

interface ResourceCalendarProps {
    users: User[];
    subtasks: Subtask[];
    tasks: Task[];
}

export function ResourceCalendar({ users, subtasks: initialSubtasks, tasks: initialTasks }: ResourceCalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date("2023-11-01"));
    const [localSubtasks, setLocalSubtasks] = useState(initialSubtasks);
    const [localTasks, setLocalTasks] = useState(initialTasks);
    const [activeId, setActiveId] = useState<string | null>(null);

    // Derive unique customers for the dropdown using React.useMemo
    const existingCustomers = useMemo(() => {
        const customers = new Set(localTasks.map(t => t.customerName));
        return Array.from(customers).sort();
    }, [localTasks]);


    // Task Details Sheet State
    const [selectedSubtaskId, setSelectedSubtaskId] = useState<number | null>(null);
    const selectedSubtask = selectedSubtaskId ? localSubtasks.find(s => s.id === selectedSubtaskId) : null;
    const selectedTask = selectedSubtask ? localTasks.find(t => t.id === selectedSubtask.taskId) : null;
    const selectedAnalyst = selectedSubtask ? users.find(u => u.id === selectedSubtask.assignedAnalystId) : undefined;

    // Generate 14 days grid
    const dates = Array.from({ length: 14 }, (_, i) => {
        const d = new Date(currentDate);
        d.setDate(d.getDate() + i);
        return d;
    });

    const nextWeek = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + 7);
        setCurrentDate(newDate);
    };

    const prevWeek = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() - 7);
        setCurrentDate(newDate);
    };

    const getSubtaskDurationDays = (hours: number) => Math.max(1, Math.ceil(hours / 6));

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (over) {
            const [userIdStr, dateStr] = (over.id as string).split('|');
            const newUserId = parseInt(userIdStr);
            const newDate = new Date(dateStr);
            const subtaskId = parseInt(active.id as string);

            // INDEPENDENT SCHEDULING: Update subtask.startDate, NOT task.requestedDate
            setLocalSubtasks(prev => prev.map(s => {
                if (s.id === subtaskId) {
                    return {
                        ...s,
                        assignedAnalystId: newUserId,
                        startDate: newDate.toISOString().split('T')[0] // Update start date
                    };
                }
                return s;
            }));
            // No longer updating localTasks (parent task) dates
        }
    };

    const handleAddTask = (newTask: Task, newSubtasks: Subtask[]) => {
        setLocalTasks(prev => [...prev, newTask]);
        setLocalSubtasks(prev => [...prev, ...newSubtasks]);
    };

    const activeSubtask = activeId ? localSubtasks.find(s => s.id.toString() === activeId) : null;
    const activeParentTask = activeSubtask ? localTasks.find(t => t.id === activeSubtask.taskId) : null;

    // --- Layout Calculation for Stacking ---

    const TASK_HEIGHT = 50;
    const GAP_HEIGHT = 8;
    const BASE_ROW_HEIGHT = 64;

    const layout = useMemo(() => {
        const userLayout: Record<number, { tasks: any[], maxRow: number }> = {};

        users.forEach(user => {
            const userTasksFiltered = localSubtasks.filter(s => s.assignedAnalystId === user.id);

            let items = userTasksFiltered.map(sub => {
                const parent = localTasks.find(t => t.id === sub.taskId);
                if (!parent) return null;

                // USE INDEPENDENT SUBTASK START DATE
                const startDate = new Date(sub.startDate);

                const duration = getSubtaskDurationDays(sub.estimatedHours);
                const startDiff = Math.ceil((startDate.getTime() - dates[0].getTime()) / (1000 * 60 * 60 * 24));

                return {
                    id: sub.id,
                    sub,
                    parent,
                    startDiff,
                    duration,
                    rowIndex: 0
                };
            }).filter(item => item !== null) as any[];

            items.sort((a, b) => a.startDiff - b.startDiff);

            const rowEndTimes: number[] = [];

            items.forEach(item => {
                let placed = false;
                for (let r = 0; r < rowEndTimes.length; r++) {
                    if (rowEndTimes[r] <= item.startDiff) {
                        item.rowIndex = r;
                        rowEndTimes[r] = item.startDiff + item.duration;
                        placed = true;
                        break;
                    }
                }
                if (!placed) {
                    item.rowIndex = rowEndTimes.length;
                    rowEndTimes.push(item.startDiff + item.duration);
                }
            });

            userLayout[user.id] = {
                tasks: items,
                maxRow: rowEndTimes.length
            };
        });
        return userLayout;
    }, [localSubtasks, localTasks, currentDate, dates, users]);


    const handleUpdateSubtask = (updatedSubtask: Subtask) => {
        setLocalSubtasks(prev => prev.map(s => s.id === updatedSubtask.id ? updatedSubtask : s));
    };

    return (
        <>
            <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                <Card className="w-full overflow-hidden select-none">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div>
                            <CardTitle>Team Capacity Schedule</CardTitle>
                            <CardDescription>Drag tasks to reassign. Click for details.</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <NewTaskDialog
                                users={users}
                                existingCustomers={existingCustomers}
                                onAddTask={handleAddTask}
                            />
                            <div className="h-4 w-[1px] bg-border mx-2" />
                            <Button variant="outline" size="sm" onClick={prevWeek}>← Prev</Button>

                            {/* DATE NAVIGATION PICKER */}
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className={cn("w-[180px] justify-start text-left font-normal", !currentDate && "text-muted-foreground")}>
                                        {currentDate ? format(currentDate, "MMM d, yyyy") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={currentDate}
                                        onSelect={(date) => date && setCurrentDate(date)}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>

                            <Button variant="outline" size="sm" onClick={nextWeek}>Next →</Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="border-t">
                            {/* Header Row */}
                            <div className="flex">
                                <div className="w-48 flex-shrink-0 border-r p-3 bg-muted/30 font-semibold text-sm">Analyst</div>
                                <div className="flex-1 grid grid-cols-14 divide-x">
                                    {dates.map(date => (
                                        <div key={date.toISOString()} className={cn(
                                            "text-center text-xs py-2 px-1",
                                            [0, 6].includes(date.getDay()) ? "bg-muted/10" : ""
                                        )}>
                                            <div className="font-medium text-muted-foreground">{date.toLocaleDateString(undefined, { weekday: 'narrow' })}</div>
                                            <div className="font-bold">{date.getDate()}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Rows */}
                            <div className="divide-y relative">
                                {users.map(user => {
                                    const { tasks: items, maxRow } = layout[user.id] || { tasks: [], maxRow: 0 };
                                    const rowHeight = Math.max(BASE_ROW_HEIGHT, (maxRow) * (TASK_HEIGHT + GAP_HEIGHT) + 20);

                                    return (
                                        <div key={user.id} className="flex group hover:bg-muted/5 transition-[height] duration-300 ease-in-out" style={{ height: rowHeight }}>
                                            {/* Analyst Info */}
                                            <div className="w-48 flex-shrink-0 border-r p-3 flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarFallback className="text-xs bg-primary/10 text-primary font-bold">
                                                        {user.name.split(' ').map(n => n[0]).join('')}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="overflow-hidden">
                                                    <div className="text-sm font-medium truncate">{user.name}</div>
                                                    <div className="text-xs text-muted-foreground truncate">{user.role}</div>
                                                </div>
                                            </div>

                                            {/* Timeline Grid */}
                                            <div className="flex-1 grid grid-cols-14 relative">
                                                {dates.map((date) => (
                                                    <DroppableCell key={date.toISOString()} date={date} userId={user.id} height={rowHeight}>
                                                        {/* Droppable areas always fill the full height */}
                                                    </DroppableCell>
                                                ))}

                                                {/* Render Draggable Tasks */}
                                                {items.map(item => {
                                                    const endDiff = item.startDiff + item.duration;
                                                    if (endDiff < 0 || item.startDiff >= 14) return null;

                                                    const left = Math.max(0, item.startDiff) * (100 / 14);
                                                    const width = (Math.min(14, endDiff) - Math.max(0, item.startDiff)) * (100 / 14);

                                                    const top = 10 + (item.rowIndex * (TASK_HEIGHT + GAP_HEIGHT));

                                                    return (
                                                        <DraggableTask
                                                            key={item.id}
                                                            subtask={item.sub}
                                                            task={item.parent}
                                                            left={`${left}%`}
                                                            width={`${width}%`}
                                                            top={`${top}px`}
                                                            height={`${TASK_HEIGHT}px`}
                                                            onClick={() => setSelectedSubtaskId(item.id)}
                                                        />
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </CardContent>

                    <DragOverlay>
                        {activeSubtask && activeParentTask ? (
                            <DraggableTask
                                subtask={activeSubtask}
                                task={activeParentTask}
                                width="100px"
                                height={`${TASK_HEIGHT}px`}
                                isOverlay
                            // No onClick for overlay to avoid triggering it on drag release
                            />
                        ) : null}
                    </DragOverlay>
                </Card>
            </DndContext>

            <TaskDetailsSheet
                isOpen={!!selectedSubtaskId}
                onClose={() => setSelectedSubtaskId(null)}
                subtask={selectedSubtask || null}
                task={selectedTask || null}
                analyst={selectedAnalyst}
                onUpdateSubtask={handleUpdateSubtask}
            />
        </>
    );
}
