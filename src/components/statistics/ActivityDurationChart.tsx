/**
 * @fileoverview Bar chart of total training minutes per activity (Recharts).
 */

import React from 'react';
import { useTheme } from '@mui/material';
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { ActivityDurationStat } from '../../types';

/**
 * Props for the ActivityDurationChart component.
 */
export interface ActivityDurationChartProps {
  /** One entry per activity, already sorted (largest first) */
  data: ActivityDurationStat[];
}

/** Height given to each bar row, so the chart grows with the number of activities. */
const ROW_HEIGHT = 44;
/** Space for the axes and axis titles. */
const CHART_PADDING = 70;

/**
 * Horizontal bar chart: activities on the vertical axis, total minutes on the horizontal axis.
 * Horizontal bars keep long activity names readable, also on narrow phone screens.
 * A single series uses a single color (the chart title already says what is measured).
 *
 * @param props - Component props.
 * @returns JSX Element rendering the responsive chart.
 */
export const ActivityDurationChart: React.FC<ActivityDurationChartProps> = ({ data }) => {
  const theme = useTheme();
  const height = data.length * ROW_HEIGHT + CHART_PADDING;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 8, right: 56, bottom: 24, left: 8 }}
        accessibilityLayer
      >
        {/* Light vertical grid lines only, so the bars stay the focus. */}
        <CartesianGrid horizontal={false} stroke={theme.palette.divider} />
        <XAxis
          type="number"
          allowDecimals={false}
          tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
          axisLine={{ stroke: theme.palette.divider }}
          tickLine={false}
          label={{
            value: 'Total minutes',
            position: 'insideBottom',
            offset: -16,
            fill: theme.palette.text.secondary,
            fontSize: 12,
          }}
        />
        <YAxis
          type="category"
          dataKey="activity"
          width={120}
          tick={{ fill: theme.palette.text.primary, fontSize: 13 }}
          axisLine={{ stroke: theme.palette.divider }}
          tickLine={false}
        />
        <ChartTooltip
          cursor={{ fill: theme.palette.action.hover }}
          formatter={(value, _name, item) => {
            const sessions = (item?.payload as ActivityDurationStat | undefined)?.sessions ?? 0;
            return [`${value} min (${sessions} ${sessions === 1 ? 'session' : 'sessions'})`, 'Total'];
          }}
        />
        <Bar
          dataKey="duration"
          name="Total minutes"
          fill={theme.palette.primary.main}
          // Rounded only at the data end (right side); flat against the axis.
          radius={[0, 4, 4, 0]}
          maxBarSize={28}
        >
          {/* Value printed at the end of each bar, in text color rather than the bar color. */}
          <LabelList
            dataKey="duration"
            position="right"
            formatter={(value) => `${value} min`}
            style={{ fill: theme.palette.text.secondary, fontSize: 12 }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};
