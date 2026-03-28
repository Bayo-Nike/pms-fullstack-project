import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const ProgressPie = ({ progress = 0 }) => {
  const safeProgress = Number(progress) || 0;

  const data = [
    { name: "Completed", value: safeProgress },
    { name: "Remaining", value: 100 - safeProgress }
  ];

  // 🎨 Dynamic color based on progress
  const getColor = (value) => {
    if (value < 40) return "#EF4444";   // red
    if (value < 70) return "#F59E0B";   // amber
    return "#10B981";                   // green
  };

  const COLORS = [getColor(safeProgress), "#E5E7EB"];

  return (
    <div className="relative w-full h-44 flex items-center justify-center">
      
      {/* Chart */}
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            innerRadius={50}
            outerRadius={65}
            paddingAngle={2}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={COLORS[index]} />
            ))}
          </Pie>

          <Tooltip formatter={(value) => `${Number(value).toFixed(2)}%`} />
        </PieChart>
      </ResponsiveContainer>

      {/* Center Text */}
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-xl font-black text-slate-800">
          {safeProgress.toFixed(2)}%
        </span>
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
          Progress
        </span>
      </div>
    </div>
  );
};

export default ProgressPie;