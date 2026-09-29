import React from 'react';
import { HelpCircle, CheckCircle2 } from 'lucide-react';

interface ExplainabilityPanelProps {
  explanation: string[];
  primaryHazard: string;
  riskScore: number;
}

export const ExplainabilityPanel: React.FC<ExplainabilityPanelProps> = ({
  explanation,
  primaryHazard,
  riskScore,
}) => {
  return (
    <div className="p-4 rounded-2xl bg-slate-900 text-white shadow-md">
      <div className="flex items-center gap-2 mb-3">
        <HelpCircle className="w-4 h-4 text-emerald-400" />
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-100">
          Why is this area rated {riskScore >= 80 ? 'Critical' : 'High'} Risk?
        </h4>
      </div>

      <p className="text-[11px] text-slate-300 mb-3">
        Transparent multi-variable attribution evaluated by the DISHA explainability engine:
      </p>

      <ul className="space-y-2 text-xs text-slate-200">
        {explanation.map((item, idx) => (
          <li key={idx} className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0"></span>
            <span className="leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>

      <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
        <span>Attribution Engine: TreeSHAP Feature Attribution</span>
        <span className="text-emerald-400 font-mono">Status: Verified</span>
      </div>
    </div>
  );
};
