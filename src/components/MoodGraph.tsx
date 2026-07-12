'use client';

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import type { MoodDataPoint } from '@/lib/mood';

export type { MoodDataPoint };

type MoodGraphProps = {
  data: MoodDataPoint[];
  compact?: boolean;
};

type TooltipPayload = {
  payload?: MoodDataPoint;
};

function MoodTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  const point = payload[0].payload;

  if (!point) {
    return null;
  }

  return (
    <div
      className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 shadow-lg"
      role="tooltip"
    >
      <p className="text-xs text-zinc-400">{label}</p>
      <p className="text-sm font-medium capitalize text-emerald-400">
        {point.moodLabel}
      </p>
      <p className="text-xs text-zinc-500">Score: {point.moodValue}/5</p>
    </div>
  );
}

export function MoodGraph({ data, compact = false }: MoodGraphProps) {
  const heightClass = compact ? 'h-44' : 'h-64';

  if (data.length === 0) {
    return (
      <div
        className={`flex ${heightClass} w-full items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/50 p-3`}
      >
        <p className="text-center text-xs text-zinc-500">
          Your mood trend will appear as you journal.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`${heightClass} w-full rounded-xl border border-zinc-800 bg-zinc-900/50 p-3`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} accessibilityLayer>
          <XAxis
            dataKey="date"
            stroke="#71717a"
            fontSize={compact ? 10 : 12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#71717a"
            fontSize={compact ? 10 : 12}
            domain={[1, 5]}
            tickLine={false}
            axisLine={false}
            width={compact ? 24 : 32}
          />
          <Tooltip content={<MoodTooltip />} cursor={{ stroke: '#10b98133' }} />
          <Line
            type="monotone"
            dataKey="moodValue"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ fill: '#10b981', stroke: '#34d399', strokeWidth: 1, r: compact ? 2.5 : 3 }}
            activeDot={{ r: 5, fill: '#10b981', stroke: '#ecfdf5' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
