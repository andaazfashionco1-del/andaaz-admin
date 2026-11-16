"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatMoney, formatNumber } from "@/lib/format";
import type { AdminStats } from "@/lib/types";

const INK = "#0b0b0b";
const MUTED = "#6b6860";
const GRID = "#e7e3da";

function shortDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function compactMoney(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1000) return `${Math.round(value / 1000)}k`;
  return String(value);
}

type TooltipProps = {
  active?: boolean;
  payload?: { payload: AdminStats["salesByDay"][number] }[];
};

function SalesTooltip({ active, payload }: TooltipProps) {
  const point = payload?.[0]?.payload;
  if (!active || !point) return null;
  return (
    <div className="rounded-xl border border-line bg-white px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold">{shortDate(point.date)}</p>
      <p className="mt-1 text-ink">{formatMoney(point.total)}</p>
      <p className="text-muted">
        {formatNumber(point.orders)} order{point.orders === 1 ? "" : "s"}
      </p>
    </div>
  );
}

export function SalesChart({ data }: { data: AdminStats["salesByDay"] }) {
  const total = data.reduce((sum, d) => sum + d.total, 0);
  return (
    <figure>
      <figcaption className="sr-only">
        Sales over the last {data.length} days, total {formatMoney(total)}
      </figcaption>
      <div className="h-64 w-full sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
            <defs>
              <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#d4ff3a" stopOpacity={0.7} />
                <stop offset="100%" stopColor="#d4ff3a" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={GRID} vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={shortDate}
              tick={{ fill: MUTED, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              minTickGap={16}
            />
            <YAxis
              tickFormatter={compactMoney}
              tick={{ fill: MUTED, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={48}
            />
            <Tooltip content={<SalesTooltip />} cursor={{ stroke: INK, strokeDasharray: "3 3" }} />
            <Area
              type="monotone"
              dataKey="total"
              stroke={INK}
              strokeWidth={2}
              fill="url(#salesFill)"
              activeDot={{ r: 5, fill: INK, stroke: "#fff", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </figure>
  );
}
