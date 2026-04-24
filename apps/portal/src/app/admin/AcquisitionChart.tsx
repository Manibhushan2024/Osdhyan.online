'use client';

import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer,
} from 'recharts';

export default function AcquisitionChart({ data }: { data: { date: string; count: number }[] }) {
    if (!data || data.length === 0) {
        return (
            <div className="h-full flex items-center justify-center text-white/20 text-xs font-black uppercase tracking-widest">
                No data yet
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
                <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis
                    dataKey="date"
                    stroke="#475569"
                    fontSize={8}
                    tickFormatter={(val: string) => {
                        try { return new Date(val).toLocaleDateString('en-US', { weekday: 'short' }); }
                        catch { return val; }
                    }}
                />
                <YAxis stroke="#475569" fontSize={8} />
                <Tooltip
                    contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '1rem', fontSize: '10px' }}
                    itemStyle={{ color: '#818cf8', fontWeight: '900' }}
                />
                <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
            </AreaChart>
        </ResponsiveContainer>
    );
}
