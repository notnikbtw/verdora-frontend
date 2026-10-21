import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatOrderPrice } from '@/utils/order.utils';
import type { RevenueReportItem } from '@/types/report';

const AXIS_TICK = { fontSize: 12, fill: 'var(--muted-foreground)' };
const TOOLTIP_STYLE = {
  backgroundColor: 'var(--card)',
  border: '1px solid var(--border)',
  borderRadius: 8,
  fontSize: 12,
};

type RevenueChartProps = {
  data: RevenueReportItem[];
  formatPeriod: (iso: string) => string;
};

const RevenueChart = ({ data, formatPeriod }: RevenueChartProps) => (
  <div className="h-72 w-full" role="img" aria-label="Revenue chart">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="periodStart"
          tickFormatter={formatPeriod}
          tick={AXIS_TICK}
          minTickGap={24}
        />
        <YAxis
          tick={AXIS_TICK}
          width={64}
          tickFormatter={v => formatOrderPrice(v)}
        />
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          labelFormatter={formatPeriod}
          formatter={v => [formatOrderPrice(Number(v)), 'Revenue']}
        />
        <Bar dataKey="revenue" fill="var(--primary)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

type QuantityChartProps = {
  data: { name: string; quantity: number }[];
  label: string;
  color?: string;
};

const QuantityChart = ({
  data,
  label,
  color = 'var(--primary)',
}: QuantityChartProps) => (
  <div
    className="w-full"
    style={{ height: Math.max(160, data.length * 32 + 24) }}
    role="img"
    aria-label={`${label} chart`}
  >
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" allowDecimals={false} tick={AXIS_TICK} />
        <YAxis
          type="category"
          dataKey="name"
          width={110}
          tick={AXIS_TICK}
          interval={0}
          tickFormatter={(v: string) =>
            v.length > 16 ? `${v.slice(0, 15)}…` : v
          }
        />
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          cursor={{ fill: 'var(--muted)' }}
          formatter={v => [v, label]}
        />
        <Bar dataKey="quantity" fill={color} radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

export { RevenueChart, QuantityChart };
