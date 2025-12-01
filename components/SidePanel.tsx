import React from 'react';
import { AnnualPlan } from '../types';

interface SidePanelProps {
  annualPlan: AnnualPlan;
  onYearGoalChange: (val: string) => void;
  onMonthChange: (monthIdx: number, val: string) => void;
}

export const SidePanel: React.FC<SidePanelProps> = ({ annualPlan, onYearGoalChange, onMonthChange }) => {
  return (
    <div className="flex flex-col gap-6 w-full lg:w-80 shrink-0">
      
      {/* Top Box: This Year Me */}
      <div className="border-2 border-gray-800">
        <div className="h-48 p-4 bg-white flex flex-col justify-center text-center">
            <h3 className="text-gray-500 text-sm mb-2">올해 나는</h3>
            <textarea 
                className="w-full h-full text-center text-lg font-medium resize-none outline-none placeholder-gray-300"
                placeholder="Ex) 건강하고 행복한 나"
                value={annualPlan.thisYearMe}
                onChange={(e) => onYearGoalChange(e.target.value)}
            />
        </div>
      </div>

      {/* Bottom Box: Annual Plan */}
      <div className="border-2 border-gray-800 flex flex-col bg-white">
        <div className="p-2 border-b border-gray-300 text-center font-bold text-gray-700">
            연간 계획
        </div>
        <div className="grid grid-cols-2">
            {annualPlan.monthly.map((plan, idx) => (
                <div key={idx} className={`flex flex-col border-b border-r border-gray-200 min-h-[80px] ${idx % 2 === 1 ? 'border-r-0' : ''}`}>
                    <span className="text-xs text-gray-400 p-1 pl-2">{idx + 1}월</span>
                    <textarea 
                        className="w-full flex-1 p-2 text-sm resize-none outline-none bg-transparent text-center"
                        value={plan}
                        onChange={(e) => onMonthChange(idx, e.target.value)}
                    />
                </div>
            ))}
        </div>
      </div>
      
    </div>
  );
};