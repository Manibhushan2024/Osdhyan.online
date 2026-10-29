'use client';

/**
 * Recharts pieces of the result page. Loaded with next/dynamic({ ssr: false })
 * so recharts only ever runs in the browser.
 */

import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
    LineChart, Line, XAxis, YAxis, CartesianGrid, ReferenceLine,
} from 'recharts';
import type { ChartColors } from './types';
import { num } from './types';

export type DonutSlice = { key: string; label: string; value: number; color: string };

function TooltipBox({ children }: { children: React.ReactNode }) {
    return (
        <div className="rounded-lg border border-card-border bg-card-bg px-3 py-2 text-xs shadow-card text-foreground">
            {children}
        </div>
    );
}

export function AnswerDonut({ slices, total, colors }: { slices: DonutSlice[]; total: number; colors: ChartColors }) {
    const data = slices.filter((s) => s.value > 0);
    return (
        <div className="relative h-48 w-48 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        dataKey="value"
                        nameKey="label"
                        innerRadius="64%"
                        outerRadius="100%"
                        paddingAngle={data.length > 1 ? 1.5 : 0}
                        stroke={colors.surface}
                        strokeWidth={2}
                        startAngle={90}
                        endAngle={-270}
                        isAnimationActive={false}
                    >
                        {data.map((s) => (
                            <Cell key={s.key} fill={s.color} />
                        ))}
                    </Pie>
                    <Tooltip
                        cursor={false}
                        content={({ active, payload }) => {
                            if (!active || !payload?.length) return null;
                            const p = payload[0]?.payload as DonutSlice | undefined;
                            if (!p) return null;
                            const pct = total > 0 ? (p.value / total) * 100 : 0;
                            return (
                                <TooltipBox>
                                    <span className="font-semibold">{p.label}</span>: {p.value} ({num(pct)}%)
                                </TooltipBox>
                            );
                        }}
                    />
                </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold">{total}</span>
                <span className="text-xs text-muted-foreground">questions</span>
            </div>
        </div>
    );
}

export type TrendPoint = { attempt_id: number; number: number; score: number; date: string; current: boolean };

export function TrendChart({
    points, maxMarks, colors,
}: { points: TrendPoint[]; maxMarks: number; colors: ChartColors }) {
    const scores = points.map((p) => p.score);
    const lo = Math.min(0, ...scores);
    const hi = Math.max(...scores, 1);
    // Leave headroom but never exceed the paper's maximum.
    const top = Math.min(maxMarks > 0 ? maxMarks : hi, Math.ceil(hi * 1.25 + 1));
    return (
        <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={points} margin={{ top: 16, right: 16, bottom: 4, left: -8 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={colors.grid} />
                    <XAxis
                        dataKey="number"
                        tickFormatter={(n) => `#${n}`}
                        tick={{ fill: colors.axis, fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        domain={[Math.floor(lo), top]}
                        allowDecimals={false}
                        tick={{ fill: colors.axis, fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                        width={40}
                    />
                    {lo < 0 && <ReferenceLine y={0} stroke={colors.axis} strokeDasharray="2 2" />}
                    <Tooltip
                        cursor={{ stroke: colors.axis, strokeDasharray: '3 3' }}
                        content={({ active, payload }) => {
                            if (!active || !payload?.length) return null;
                            const p = payload[0]?.payload as TrendPoint | undefined;
                            if (!p) return null;
                            return (
                                <TooltipBox>
                                    <div className="font-semibold">Attempt #{p.number}{p.current ? ' (this one)' : ''}</div>
                                    <div>{num(p.score)} / {num(maxMarks)} marks</div>
                                    {p.date && (
                                        <div className="text-muted-foreground">
                                            {new Date(p.date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                                        </div>
                                    )}
                                </TooltipBox>
                            );
                        }}
                    />
                    <Line
                        type="monotone"
                        dataKey="score"
                        stroke={colors.you}
                        strokeWidth={2}
                        isAnimationActive={false}
                        dot={(props: { cx?: number; cy?: number; index?: number; payload?: TrendPoint }) => {
                            const { cx, cy, payload, index } = props;
                            if (cx == null || cy == null) return <g key={`d-${index}`} />;
                            const current = !!payload?.current;
                            return (
                                <circle
                                    key={`d-${index}`}
                                    cx={cx}
                                    cy={cy}
                                    r={current ? 6 : 4}
                                    fill={current ? colors.you : colors.surface}
                                    stroke={colors.you}
                                    strokeWidth={2}
                                />
                            );
                        }}
                        activeDot={{ r: 6, stroke: colors.surface, strokeWidth: 2, fill: colors.you }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
