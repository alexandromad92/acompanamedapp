"use client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { ProgressEntry } from "@/lib/mock-data";

interface ProgressChartProps {
  data: ProgressEntry[];
  metric?: "peso" | "energia" | "sueno" | "libido" | "all";
}

export function ProgressChart({ data, metric = "peso" }: ProgressChartProps) {
  const chartData = data.map((entry) => ({
    mes: entry.mes.split(" ")[0],
    Peso: entry.peso,
    Energía: entry.energia,
    Sueño: entry.sueno,
    Libido: entry.libido,
  }));

  if (metric === "peso") {
    return (
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
          <YAxis
            domain={["auto", "auto"]}
            tick={{ fontSize: 12 }}
            tickFormatter={(v) => `${v} kg`}
          />
          <Tooltip formatter={(v) => [`${v} kg`, "Peso"]} />
          <Line
            type="monotone"
            dataKey="Peso"
            stroke="#0F6E56"
            strokeWidth={2.5}
            dot={{ r: 5, fill: "#0F6E56" }}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
        <YAxis domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} tick={{ fontSize: 12 }} />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="Energía" stroke="#0F6E56" strokeWidth={2} dot={{ r: 4 }} />
        <Line type="monotone" dataKey="Sueño" stroke="#185FA5" strokeWidth={2} dot={{ r: 4 }} />
        <Line type="monotone" dataKey="Libido" stroke="#993556" strokeWidth={2} dot={{ r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
