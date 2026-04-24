import { useEffect, useMemo, useState } from 'react';
import axios from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface GoalSetupWizardProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onGoalSet: (plan: any) => void;
}

type PlanningMode = 'simple' | 'advanced';
type AllocationMode = 'auto' | 'manual';
type DurationUnit = 'week' | 'month';
type SplitMode = 'auto' | 'manual';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function toDateString(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function calculatePlanDates(durationUnit: DurationUnit, durationValue: number) {
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(startDate);
    if (durationUnit === 'week') {
        endDate.setDate(endDate.getDate() + (durationValue * 7) - 1);
    } else {
        endDate.setMonth(endDate.getMonth() + durationValue);
        endDate.setDate(endDate.getDate() - 1);
    }

    return { startDate, endDate };
}

function calculateWeekCount(startDate: Date, endDate: Date) {
    const diffDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(1, Math.ceil(diffDays / 7));
}

function buildEqualArray(total: number, count: number) {
    const safeCount = Math.max(1, count);
    const result = Array(safeCount).fill(0);
    const base = Math.floor(total / safeCount);
    let remainder = total % safeCount;

    for (let i = 0; i < safeCount; i++) {
        result[i] = base + (remainder > 0 ? 1 : 0);
        if (remainder > 0) remainder--;
    }
    return result;
}

export function GoalSetupWizard({ open, onOpenChange, onGoalSet }: GoalSetupWizardProps) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const [planningMode, setPlanningMode] = useState<PlanningMode>('simple');
    const [allocationMode, setAllocationMode] = useState<AllocationMode>('auto');
    const [weeklySplitMode, setWeeklySplitMode] = useState<SplitMode>('auto');
    const [dailySplitMode, setDailySplitMode] = useState<SplitMode>('auto');

    const [durationUnit, setDurationUnit] = useState<DurationUnit>('month');
    const [durationValue, setDurationValue] = useState(1);
    const [targetHours, setTargetHours] = useState(150);

    const [monthlyAllocations, setMonthlyAllocations] = useState<number[]>([150]);
    const [weeklyAllocations, setWeeklyAllocations] = useState<number[]>([38, 38, 37, 37]);
    const [weeklyDailyAllocations, setWeeklyDailyAllocations] = useState<number[][]>(
        [Array(7).fill(2.5), Array(7).fill(2.5), Array(7).fill(2.5), Array(7).fill(2.5)]
    );
    const [selectedWeekForDaily, setSelectedWeekForDaily] = useState(0);

    const planDates = useMemo(
        () => calculatePlanDates(durationUnit, durationValue),
        [durationUnit, durationValue]
    );

    const totalWeeks = useMemo(
        () => calculateWeekCount(planDates.startDate, planDates.endDate),
        [planDates]
    );

    const maxSteps = planningMode === 'advanced' ? 3 : 2;
    const totalDays = Math.max(
        1,
        Math.floor((planDates.endDate.getTime() - planDates.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
    );

    const dailyAverage = useMemo(
        () => Math.round((targetHours / totalDays) * 10) / 10,
        [targetHours, totalDays]
    );

    useEffect(() => {
        if (step > maxSteps) {
            setStep(maxSteps);
        }
    }, [step, maxSteps]);

    useEffect(() => {
        const monthCount = durationUnit === 'month' ? durationValue : 1;
        setMonthlyAllocations((prev) => {
            const equal = buildEqualArray(targetHours, monthCount);
            return prev.length === monthCount ? prev : equal;
        });
    }, [durationUnit, durationValue, targetHours]);

    useEffect(() => {
        setWeeklyAllocations((prev) => {
            const equal = buildEqualArray(targetHours, totalWeeks);
            return prev.length === totalWeeks ? prev : equal;
        });

        setWeeklyDailyAllocations((prev) => {
            if (prev.length === totalWeeks) return prev;
            const next = Array.from({ length: totalWeeks }, (_, i) => prev[i] || Array(7).fill(2));
            return next;
        });
    }, [totalWeeks, targetHours]);

    const handleMonthlyAllocationChange = (index: number, value: number) => {
        setMonthlyAllocations((prev) => {
            const copy = [...prev];
            copy[index] = Number.isFinite(value) ? Math.max(0, value) : 0;
            return copy;
        });
    };

    const handleWeeklyAllocationChange = (index: number, value: number) => {
        setWeeklyAllocations((prev) => {
            const copy = [...prev];
            copy[index] = Number.isFinite(value) ? Math.max(0, value) : 0;
            return copy;
        });
    };

    const handleDailyAllocationChange = (weekIndex: number, dayIndex: number, value: number) => {
        setWeeklyDailyAllocations((prev) => {
            const copy = prev.map((row) => [...row]);
            copy[weekIndex][dayIndex] = Number.isFinite(value) ? Math.max(0, value) : 0;
            return copy;
        });
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const payload: Record<string, any> = {
                type: 'monthly',
                target_hours: targetHours,
                start_date: toDateString(planDates.startDate),
                end_date: toDateString(planDates.endDate),
                planning_mode: planningMode,
                allocation_mode: planningMode === 'simple' ? 'auto' : allocationMode,
                duration_unit: durationUnit,
                duration_value: durationValue,
            };

            if (planningMode === 'advanced' && allocationMode === 'manual') {
                if (durationUnit === 'month' && durationValue > 1) {
                    payload.monthly_allocations = monthlyAllocations;
                }

                if (weeklySplitMode === 'manual') {
                    payload.weekly_allocations = weeklyAllocations;
                }

                if (dailySplitMode === 'manual') {
                    payload.weekly_daily_allocations = weeklyDailyAllocations;
                }
            }

            const response = await axios.post('/study-planner/goal', payload);
            onGoalSet(response.data);
            onOpenChange(false);
            toast({
                title: 'Goal Saved',
                description: 'Your study plan is ready.',
            });
        } catch (error) {
            console.error('Failed to set goal', error);
            toast({
                title: 'Goal Setup Failed',
                description: 'Please review inputs and try again.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const summaryWeekly = Math.round((targetHours / totalWeeks) * 10) / 10;
    const summaryDuration =
        durationUnit === 'week'
            ? `${durationValue} week${durationValue > 1 ? 's' : ''}`
            : `${durationValue} month${durationValue > 1 ? 's' : ''}`;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[760px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                        Goal Builder
                    </DialogTitle>
                    <p className="text-xs uppercase tracking-widest text-gray-500 mt-1">
                        Step {step} / {maxSteps}
                    </p>
                </DialogHeader>

                {step === 1 && (
                    <div className="space-y-6 py-4">
                        <div className="space-y-3">
                            <Label className="text-base">Planning Mode</Label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setPlanningMode('simple');
                                        setAllocationMode('auto');
                                    }}
                                    className={`rounded-xl border-2 px-4 py-3 text-left transition-all ${planningMode === 'simple'
                                        ? 'border-blue-600 bg-blue-50'
                                        : 'border-gray-200 hover:border-blue-400'
                                        }`}
                                >
                                    <p className="font-semibold text-gray-900">Simple (Recommended)</p>
                                    <p className="text-xs text-gray-600 mt-1">Fast setup, system auto splits everything.</p>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setPlanningMode('advanced');
                                        setAllocationMode('manual');
                                    }}
                                    className={`rounded-xl border-2 px-4 py-3 text-left transition-all ${planningMode === 'advanced'
                                        ? 'border-blue-600 bg-blue-50'
                                        : 'border-gray-200 hover:border-blue-400'
                                        }`}
                                >
                                    <p className="font-semibold text-gray-900">Advanced</p>
                                    <p className="text-xs text-gray-600 mt-1">Customize month, week and daily allocations.</p>
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-base">Duration Unit</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    {(['week', 'month'] as DurationUnit[]).map((unit) => (
                                        <button
                                            key={unit}
                                            type="button"
                                            onClick={() => setDurationUnit(unit)}
                                            className={`rounded-xl border-2 px-3 py-2 text-sm font-semibold capitalize ${durationUnit === unit
                                                ? 'border-blue-600 bg-blue-50 text-blue-700'
                                                : 'border-gray-200 text-gray-600 hover:border-blue-400'
                                                }`}
                                        >
                                            {unit}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-base">
                                    Duration Value ({durationUnit === 'week' ? '1-12 weeks' : '1-12 months'})
                                </Label>
                                <input
                                    type="number"
                                    min={1}
                                    max={12}
                                    value={durationValue}
                                    onChange={(event) => setDurationValue(clamp(Number(event.target.value) || 1, 1, 12))}
                                    className="w-full rounded-xl border border-gray-300 px-3 py-2"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-base">Total Study Hours (Custom)</Label>
                            <input
                                type="number"
                                min={1}
                                value={targetHours}
                                onChange={(event) => setTargetHours(Math.max(1, Number(event.target.value) || 1))}
                                className="w-full rounded-xl border border-gray-300 px-3 py-2"
                            />
                        </div>

                        <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Plan Duration:</span>
                                <span className="font-semibold text-gray-900">{summaryDuration}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Daily Average:</span>
                                <span className="font-semibold text-gray-900">{dailyAverage} hrs/day</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Weekly Average:</span>
                                <span className="font-semibold text-gray-900">{summaryWeekly} hrs/week</span>
                            </div>
                        </div>

                        <Button className="w-full h-11 text-base" onClick={() => setStep(2)}>
                            Continue
                        </Button>
                    </div>
                )}

                {step === 2 && planningMode === 'advanced' && (
                    <div className="space-y-6 py-4">
                        <div className="space-y-3">
                            <Label className="text-base">Allocation Style</Label>
                            <div className="grid grid-cols-2 gap-3">
                                {(['auto', 'manual'] as AllocationMode[]).map((mode) => (
                                    <button
                                        key={mode}
                                        type="button"
                                        onClick={() => setAllocationMode(mode)}
                                        className={`rounded-xl border-2 px-4 py-3 text-left transition-all capitalize ${allocationMode === mode
                                            ? 'border-blue-600 bg-blue-50'
                                            : 'border-gray-200 hover:border-blue-400'
                                            }`}
                                    >
                                        <p className="font-semibold text-gray-900">{mode}</p>
                                        <p className="text-xs text-gray-600 mt-1">
                                            {mode === 'auto'
                                                ? 'System automatically distributes targets.'
                                                : 'You control weekly and daily splits.'}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {allocationMode === 'manual' && (
                            <div className="space-y-6">
                                {durationUnit === 'month' && durationValue > 1 && (
                                    <div className="space-y-3">
                                        <Label className="text-base">Monthly Allocation (Hours)</Label>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                            {monthlyAllocations.map((value, index) => (
                                                <div key={index} className="space-y-1">
                                                    <span className="text-xs text-gray-500">Month {index + 1}</span>
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        value={value}
                                                        onChange={(event) => handleMonthlyAllocationChange(index, Number(event.target.value))}
                                                        className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-3">
                                    <Label className="text-base">Weekly Hours Split</Label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {(['auto', 'manual'] as SplitMode[]).map((mode) => (
                                            <button
                                                key={mode}
                                                type="button"
                                                onClick={() => setWeeklySplitMode(mode)}
                                                className={`rounded-xl border-2 px-4 py-2 text-sm font-semibold capitalize ${weeklySplitMode === mode
                                                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                                                    : 'border-gray-200 text-gray-600 hover:border-blue-400'
                                                    }`}
                                            >
                                                {mode}
                                            </button>
                                        ))}
                                    </div>

                                    {weeklySplitMode === 'manual' && (
                                        <div className="max-h-56 overflow-y-auto border rounded-xl p-3 space-y-2">
                                            {weeklyAllocations.map((value, index) => (
                                                <div key={index} className="flex items-center justify-between gap-3">
                                                    <span className="text-sm text-gray-600">Week {index + 1}</span>
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        value={value}
                                                        onChange={(event) => handleWeeklyAllocationChange(index, Number(event.target.value))}
                                                        className="w-24 rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-base">Daily Allocation for Weekly Plan</Label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {(['auto', 'manual'] as SplitMode[]).map((mode) => (
                                            <button
                                                key={mode}
                                                type="button"
                                                onClick={() => setDailySplitMode(mode)}
                                                className={`rounded-xl border-2 px-4 py-2 text-sm font-semibold capitalize ${dailySplitMode === mode
                                                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                                                    : 'border-gray-200 text-gray-600 hover:border-blue-400'
                                                    }`}
                                            >
                                                {mode}
                                            </button>
                                        ))}
                                    </div>

                                    {dailySplitMode === 'manual' && (
                                        <div className="border rounded-xl p-3 space-y-3">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-gray-600">Week:</span>
                                                <select
                                                    value={selectedWeekForDaily}
                                                    onChange={(event) => setSelectedWeekForDaily(Number(event.target.value))}
                                                    className="rounded-md border border-gray-300 px-2 py-1 text-sm"
                                                >
                                                    {weeklyDailyAllocations.map((_, index) => (
                                                        <option key={index} value={index}>
                                                            Week {index + 1}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                                {DAY_LABELS.map((day, dayIndex) => (
                                                    <div key={day} className="space-y-1">
                                                        <span className="text-xs text-gray-500">{day}</span>
                                                        <input
                                                            type="number"
                                                            step="0.5"
                                                            min={0}
                                                            value={weeklyDailyAllocations[selectedWeekForDaily]?.[dayIndex] ?? 0}
                                                            onChange={(event) =>
                                                                handleDailyAllocationChange(
                                                                    selectedWeekForDaily,
                                                                    dayIndex,
                                                                    Number(event.target.value)
                                                                )
                                                            }
                                                            className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                                Back
                            </Button>
                            <Button className="flex-1" onClick={() => setStep(3)}>
                                Continue
                            </Button>
                        </div>
                    </div>
                )}

                {((planningMode === 'simple' && step === 2) || (planningMode === 'advanced' && step === 3)) && (
                    <div className="space-y-6 py-4 text-center">
                        <div className="text-xl font-semibold text-indigo-600">Plan Ready</div>
                        <h3 className="text-xl font-semibold">Confirm your strategy</h3>
                        <p className="text-gray-600">
                            Mode: <span className="font-semibold capitalize">{planningMode}</span> | Duration: <span className="font-semibold">{summaryDuration}</span> | Goal: <span className="font-semibold">{targetHours} hours</span>
                        </p>
                        <div className="bg-slate-50 rounded-lg p-4 text-sm text-left space-y-1">
                            <p><span className="text-gray-600">Daily average:</span> <span className="font-semibold text-gray-900">{dailyAverage} hrs/day</span></p>
                            <p><span className="text-gray-600">Weekly average:</span> <span className="font-semibold text-gray-900">{summaryWeekly} hrs/week</span></p>
                            {planningMode === 'advanced' && (
                                <p>
                                    <span className="text-gray-600">Allocation:</span>{' '}
                                    <span className="font-semibold text-gray-900 capitalize">{allocationMode}</span>
                                </p>
                            )}
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => setStep(planningMode === 'simple' ? 1 : 2)}
                            >
                                Back
                            </Button>
                            <Button className="flex-1" onClick={handleSubmit} disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Start Plan
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
