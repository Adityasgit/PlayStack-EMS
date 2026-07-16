'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { DEPARTMENT_COLORS } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

interface DepartmentChartProps {
  data: { _id: string; count: number }[];
}

const RADIAN = Math.PI / 180;
const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  if (percent < 0.05) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export function DepartmentChart({ data }: DepartmentChartProps) {
  if (!data.length) {
    return <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">No data available</div>;
  }

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={80}
            paddingAngle={3}
            dataKey="count"
            nameKey="_id"
            labelLine={false}
            label={renderLabel}
          >
            {data.map((entry) => (
              <Cell
                key={entry._id}
                fill={DEPARTMENT_COLORS[entry._id] || '#6366f1'}
                stroke="transparent"
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(value: number, name: string) => [value, name]}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
