import React, { useState, useCallback } from 'react';
import { MandalartData, AnnualPlan, SavedProject } from './types';
import { GridBlock } from './components/GridBlock';
import { SidePanel } from './components/SidePanel';
import { StorageModal } from './components/StorageModal';
import { generateMandalartIdeas } from './services/geminiService';
import { SparklesIcon, PenLine, FolderOpen } from 'lucide-react';

// Initialize 9 grids, each with 9 empty strings
const INITIAL_MANDALART: MandalartData = Array(9).fill(null).map(() => Array(9).fill(""));

// Initialize annual plan
const INITIAL_ANNUAL_PLAN: AnnualPlan = {
  thisYearMe: "",
  monthly: Array(12).fill("")
};

export default function App() {
  const [title, setTitle] = useState("나의 만다라트");
  const [mandalart, setMandalart] = useState<MandalartData>(INITIAL_MANDALART);
  const [annualPlan, setAnnualPlan] = useState<AnnualPlan>(INITIAL_ANNUAL_PLAN);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isStorageOpen, setIsStorageOpen] = useState(false);
  const [loadKey, setLoadKey] = useState(0); // Used to force re-render of GridBlock when loading

  // Helper to update specific cell
  const updateCell = (gridIdx: number, cellIdx: number, value: string, currentData: MandalartData): MandalartData => {
    const newData = currentData.map((grid, gIdx) => 
      gIdx === gridIdx 
        ? grid.map((cell, cIdx) => cIdx === cellIdx ? value : cell)
        : grid
    );
    return newData;
  };

  const handleCellChange = useCallback((gridIdx: number, cellIdx: number, newValue: string) => {
    setMandalart(prev => {
      let newData = updateCell(gridIdx, cellIdx, newValue, prev);

      // Synchronization Logic
      // 1. If we are editing the CENTER GRID (Index 4)
      if (gridIdx === 4) {
        // If we edit a surrounding cell in the center grid (indices 0,1,2,3,5,6,7,8)
        // We must update the CENTER cell (index 4) of the corresponding OUTER grid.
        if (cellIdx !== 4) {
          // Map CenterGrid cell index to OuterGrid index
          const targetGridIdx = cellIdx; 
          newData = updateCell(targetGridIdx, 4, newValue, newData);
        }
      }
      
      return newData;
    });
  }, []);

  const handleYearGoalChange = (val: string) => {
    setAnnualPlan(prev => ({ ...prev, thisYearMe: val }));
  };

  const handleMonthChange = (monthIdx: number, val: string) => {
    setAnnualPlan(prev => {
        const newMonthly = [...prev.monthly];
        newMonthly[monthIdx] = val;
        return { ...prev, monthly: newMonthly };
    });
  };

  const handleLoadProject = (project: SavedProject) => {
    try {
        // Deep copy data to ensure fresh references and avoid mutation issues
        const loadedMandalart = JSON.parse(JSON.stringify(project.mandalart));
        const loadedAnnualPlan = JSON.parse(JSON.stringify(project.annualPlan));

        setTitle(project.title);
        setMandalart(loadedMandalart);
        setAnnualPlan(loadedAnnualPlan);
        setLoadKey(prev => prev + 1); // Force complete re-render
        setIsStorageOpen(false);
        alert("프로젝트를 불러왔습니다.");
    } catch (e) {
        console.error("Error loading project", e);
        alert("프로젝트 불러오기에 실패했습니다.");
    }
  };

  const handleAiGenerate = async () => {
    const mainGoal = mandalart[4][4];
    if (!mainGoal) {
      alert("먼저 중앙 파란색 박스에 핵심 목표를 입력해주세요.");
      return;
    }

    setIsGenerating(true);
    const result = await generateMandalartIdeas(mainGoal);
    setIsGenerating(false);

    if (result) {
      setMandalart(prev => {
        let newData = [...prev];
        
        // 1. Fill Center Grid sub-goals
        const centerGridIndices = [0, 1, 2, 3, 5, 6, 7, 8];
        
        centerGridIndices.forEach((cellIdx, i) => {
            if (result.subGoals[i]) {
                const subGoalText = result.subGoals[i];
                // Update Center Grid
                newData = updateCell(4, cellIdx, subGoalText, newData);
                // Update Corresponding Outer Grid Center
                newData = updateCell(cellIdx, 4, subGoalText, newData);
            }
        });

        // 2. Fill details in Outer Grids
        centerGridIndices.forEach((gridIdx, i) => {
             const tasks = result.detailMap[i]; // tasks for the i-th sub-goal
             if (tasks && tasks.length > 0) {
                 const outerCellIndices = [0, 1, 2, 3, 5, 6, 7, 8];
                 outerCellIndices.forEach((targetCellIdx, taskIdx) => {
                     if (tasks[taskIdx]) {
                         newData = updateCell(gridIdx, targetCellIdx, tasks[taskIdx], newData);
                     }
                 });
             }
        });

        return newData;
      });
    } else {
        alert("아이디어를 생성하지 못했습니다. API 키를 확인하거나 다시 시도해주세요.");
    }
  };

  return (
    <div className="min-h-screen bg-white p-4 md:p-8 flex flex-col items-center">
      
      {/* Storage Modal */}
      <StorageModal 
        isOpen={isStorageOpen}
        onClose={() => setIsStorageOpen(false)}
        currentData={{
          title,
          mandalart,
          annualPlan
        }}
        onLoad={handleLoadProject}
      />

      {/* Header */}
      <div className="w-full max-w-[1400px] flex flex-col md:flex-row justify-between items-start md:items-end mb-6 border-b-2 border-gray-800 pb-4 gap-4">
        <div className="flex flex-col flex-1">
            <div className="flex items-center gap-4">
              {/* Title Input */}
              <div className="flex items-center gap-2 group relative">
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="프로젝트 제목 입력"
                  className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight bg-transparent border-b-2 border-transparent hover:border-gray-300 focus:border-indigo-600 outline-none transition-colors w-full md:w-auto min-w-[300px]"
                />
                <PenLine className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" size={20} />
              </div>

              {/* Storage Button */}
              <button 
                onClick={() => setIsStorageOpen(true)}
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg transition-colors border border-gray-300"
                title="저장소 열기"
              >
                <FolderOpen size={20} className="text-gray-600" />
                <span className="text-sm font-medium hidden sm:inline">저장소</span>
              </button>
            </div>
            <span className="text-sm font-normal text-gray-500 mt-1">만다라트 계획표</span>
        </div>
        <button 
            onClick={handleAiGenerate}
            disabled={isGenerating}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-4 py-2 rounded shadow hover:opacity-90 disabled:opacity-50 transition-all text-sm font-medium shrink-0"
        >
            {isGenerating ? (
                <span>생성 중...</span>
            ) : (
                <>
                    <SparklesIcon size={16} />
                    <span>AI 아이디어 생성</span>
                </>
            )}
        </button>
      </div>

      {/* Main Content Area */}
      <div className="w-full max-w-[1400px] flex flex-col xl:flex-row gap-8 justify-center items-start">
        
        {/* Left: Mandalart Grid */}
        <div className="flex-1 w-full overflow-x-auto xl:overflow-visible pb-4">
            <div className="min-w-[700px] xl:min-w-0 aspect-square">
                {/* 
                    The Grid Structure: 3x3 layout of GridBlocks.
                    Gap is handled to separate the blocks distinctly as per the image.
                */}
                <div key={`grid-container-${loadKey}`} className="grid grid-cols-3 gap-3 md:gap-4 p-1">
                    {/* Render grids 0-8 */}
                    {mandalart.map((gridData, gridIdx) => (
                        <GridBlock 
                            key={`block-${gridIdx}-${loadKey}`}
                            blockIndex={gridIdx}
                            data={gridData}
                            onCellChange={(cellIdx, val) => handleCellChange(gridIdx, cellIdx, val)}
                        />
                    ))}
                </div>
            </div>
        </div>

        {/* Right: Side Panel */}
        <SidePanel 
            annualPlan={annualPlan}
            onYearGoalChange={handleYearGoalChange}
            onMonthChange={handleMonthChange}
        />
        
      </div>

      <div className="mt-12 text-center text-gray-400 text-sm">
        체계적인 계획으로 미래를 설계하세요.
      </div>
    </div>
  );
}