import {
  ResponsiveContainer,
  PieChart,
  Tooltip,
  Legend,
  Pie,
  Cell,
  Bar,
  BarChart,
  XAxis,
  YAxis,
} from "recharts";
import { COLORS } from "./Graphs";
import { SimResults } from "../DataType";
import { Trans, useTranslation } from "react-i18next";

export default function ParticlesCount({ data }: { data: SimResults }) {
  useTranslation()

  let particleCount: { name: string; value: number }[] = [];

  //particles
  for (const key in data.particle_count) {
    particleCount.push({
      name: key,
      value: data.particle_count[key].mean,
    });
  }

  return (
    <div>
      <span className="ml-2 mt-1 font-bold capitalize absolute top-0 left-0">
        <Trans>viewer.particles_count</Trans>
      </span>
      <ResponsiveContainer width="95%" height={288}>
        <BarChart data={particleCount}>
          <Tooltip labelStyle={{ color: "black" }} />
          <YAxis type="number" dataKey="value" tick={{ fill: "white" }} />
          <XAxis type="category" dataKey="name" tick={{ fill: "white" }} />
          <Bar dataKey="value" cx="50%" cy="50%" isAnimationActive={false}>
            {particleCount.map((entry, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
