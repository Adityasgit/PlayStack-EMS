'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface JoiningTrendChartProps {
  data: { _id: { month: number; year: number }; count: number }[];
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function JoiningTrendChart({ data }: JoiningTrendChartProps) {
  if (!data.length) {
    return <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">No data available</div>;
  }

  const chartData = data.map((d) => ({
    month: MONTHS[d._id.month - 1],
    count: d.count,
    fullName: `${MONTHS[d._id.month - 1]} ${d._id.year}`,
  }));

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(value: number) => [value, 'Employees']}
          />
          <Bar
            dataKey="count"
            fill="var(--primary)"
            radius={[4, 4, 0, 0]}
            maxBarSize={32}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
