
import React from 'react';
import { Bar, Pie, BarChart as RechartsBarChart, PieChart as RechartsPieChart, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from './chart';

export interface ChartProps {
  data: Array<Record<string, any>>;
  index: string;
  categories: string[];
  colors?: string[];
  valueFormatter?: (value: number) => string;
  showLegend?: boolean;
  showXAxis?: boolean;
  showYAxis?: boolean;
  showGridLines?: boolean;
  showAnimation?: boolean;
}

export const BarChart = ({
  data,
  index,
  categories,
  colors = ['hsl(210, 100%, 50%)'],
  valueFormatter = (value) => `${value}`,
  showLegend = true,
  showXAxis = true,
  showYAxis = true,
  showGridLines = false,
  showAnimation = true,
}: ChartProps) => {
  return (
    <ChartContainer
      config={{
        ...Object.fromEntries(
          categories.map((category, i) => [
            category,
            { color: colors[i % colors.length] },
          ])
        ),
      }}
    >
      <RechartsBarChart
        data={data}
        margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
      >
        <ChartTooltip
          content={({ active, payload }) => (
            <ChartTooltipContent
              active={active}
              payload={payload}
              formatter={(value, name) => [valueFormatter(value as number), name]}
            />
          )}
        />
        {showLegend && <Legend />}
        {showXAxis && <XAxis dataKey={index} />}
        {showYAxis && <YAxis />}
        {showGridLines && <CartesianGrid strokeDasharray="3 3" />}
        
        {categories.map((category, i) => (
          <Bar
            key={category}
            dataKey={category}
            fill={colors[i % colors.length]}
            isAnimationActive={showAnimation}
          />
        ))}
      </RechartsBarChart>
    </ChartContainer>
  );
};

export const PieChart = ({
  data,
  index,
  categories,
  colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'],
  valueFormatter = (value) => `${value}`,
  showAnimation = true,
}: ChartProps) => {
  return (
    <ChartContainer
      config={{
        ...Object.fromEntries(
          categories.map((category, i) => [
            category,
            { color: colors[i % colors.length] },
          ])
        ),
      }}
    >
      <RechartsPieChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
        <ChartTooltip
          content={({ active, payload }) => (
            <ChartTooltipContent
              active={active}
              payload={payload}
              formatter={(value, name) => [valueFormatter(value as number), name]}
            />
          )}
        />
        {categories.map((category, i) => (
          <Pie
            key={category}
            data={data}
            dataKey={category}
            nameKey={index}
            cx="50%"
            cy="50%"
            outerRadius="80%"
            isAnimationActive={showAnimation}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
        ))}
      </RechartsPieChart>
    </ChartContainer>
  );
};
