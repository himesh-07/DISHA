import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface FeatureImportanceChartProps {
  features?: { feature: string; importance: number; description: string }[];
}

export const FeatureImportanceChart: React.FC<FeatureImportanceChartProps> = ({
  features,
}) => {
  const data = features && features.length > 0
    ? features
    : [
        { feature: 'Precipitation', importance: 31, description: 'Continuous rainfall intensity' },
        { feature: 'River Level', importance: 25, description: 'Catchment river gauge ratio' },
        { feature: 'History', importance: 18, description: 'Past disaster frequency' },
        { feature: 'Vulnerability', importance: 15, description: 'Demographic socio-economic index' },
        { feature: 'Density', importance: 11, description: 'Population exposure per sq km' },
      ];

  const colors = ['#dc2626', '#ea580c', '#d97706', '#0284c7', '#059669'];

  return (
    <div className="p-4 rounded-2xl bg-white border border-slate-200">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
            Risk Drivers (XGBoost SHAP Importance)
          </h4>
          <p className="text-[11px] text-slate-500">Weight contribution towards risk score</p>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
          Normalized %
        </span>
      </div>

      <div className="h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 20, left: 35, bottom: 5 }}
          >
            <XAxis type="number" domain={[0, 40]} tick={{ fontSize: 10 }} unit="%" />
            <YAxis
              type="category"
              dataKey="feature"
              tick={{ fontSize: 10, fill: '#475569' }}
              width={75}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="bg-slate-900 text-white p-2.5 rounded-lg text-xs shadow-xl max-w-xs">
                      <div className="font-bold text-emerald-400">{d.feature}: {d.importance}%</div>
                      <div className="text-[11px] text-slate-300 mt-1">{d.description}</div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="importance" radius={[0, 4, 4, 0]}>
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
