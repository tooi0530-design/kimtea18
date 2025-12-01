import React, { useState, useEffect } from 'react';
import { MandalartData, AnnualPlan, SavedProject } from '../types';
import { Save, Trash2, X, FolderOpen, CheckCircle2, Circle } from 'lucide-react';

interface StorageModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentData: {
    title: string;
    mandalart: MandalartData;
    annualPlan: AnnualPlan;
  };
  onLoad: (project: SavedProject) => void;
}

const STORAGE_KEY = 'mandalart_saved_projects';

export const StorageModal: React.FC<StorageModalProps> = ({ 
  isOpen, 
  onClose, 
  currentData, 
  onLoad 
}) => {
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadProjectsFromStorage();
      setSelectedId(null); // Reset selection on open
    }
  }, [isOpen]);

  const loadProjectsFromStorage = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSavedProjects(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load projects", error);
      setSavedProjects([]);
    }
  };

  const handleSaveCurrent = () => {
    if (!currentData.title.trim()) {
      alert("저장하기 전에 프로젝트 제목을 입력해주세요.");
      return;
    }

    const newProject: SavedProject = {
      id: Date.now().toString(),
      title: currentData.title,
      mandalart: currentData.mandalart,
      annualPlan: currentData.annualPlan,
      lastUpdated: new Date().toLocaleString()
    };

    // Check if project with same title exists
    const existingIndex = savedProjects.findIndex(p => p.title === currentData.title);
    
    let updatedProjects = [...savedProjects];
    if (existingIndex >= 0) {
      if (!confirm(`"${currentData.title}" 이름의 프로젝트가 이미 존재합니다. 덮어쓰시겠습니까?`)) {
        return;
      }
      updatedProjects[existingIndex] = newProject;
    } else {
      updatedProjects.push(newProject);
    }

    // Sort by most recently updated
    updatedProjects.sort((a, b) => b.id.localeCompare(a.id));

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProjects));
        setSavedProjects(updatedProjects);
        
        // Auto-select the just saved project
        setSelectedId(newProject.id);
        
        alert("프로젝트가 저장되었습니다.");
    } catch (e) {
        alert("저장하는 중 오류가 발생했습니다. 브라우저 저장 공간을 확인해주세요.");
        console.error(e);
    }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("정말로 이 프로젝트를 삭제하시겠습니까?")) {
      const updatedProjects = savedProjects.filter(p => p.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProjects));
      setSavedProjects(updatedProjects);
      if (selectedId === id) setSelectedId(null);
    }
  };

  const handleLoadSelected = () => {
    if (!selectedId) return;
    
    const projectToLoad = savedProjects.find(p => p.id === selectedId);
    if (projectToLoad) {
      onLoad(projectToLoad);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3 text-gray-800">
            <div className="p-2 bg-indigo-100 rounded-lg">
                <FolderOpen className="text-indigo-600" size={24} />
            </div>
            <div>
                <h2 className="text-xl font-bold">프로젝트 저장소</h2>
                <p className="text-xs text-gray-500">진행 상황을 저장하거나 이전 계획을 불러오세요</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-200 rounded-full">
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
            
            {/* Left Column: Save Current */}
            <div className="w-full md:w-1/3 p-5 border-b md:border-b-0 md:border-r border-gray-200 bg-gray-50/50 flex flex-col gap-4">
                <div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">현재 프로젝트</span>
                    <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                        <div className="font-bold text-gray-800 truncate mb-1" title={currentData.title}>
                            {currentData.title || "제목 없음"}
                        </div>
                        <div className="text-xs text-gray-500">
                            현재 작성 중인 내용
                        </div>
                    </div>
                </div>
                <button 
                    onClick={handleSaveCurrent}
                    className="w-full flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-lg transition-colors font-medium shadow-sm active:scale-[0.98] transform"
                >
                    <Save size={18} />
                    프로젝트 저장
                </button>
            </div>

            {/* Right Column: List */}
            <div className="w-full md:w-2/3 flex flex-col bg-white">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-sm font-bold text-gray-600">저장된 프로젝트 목록</h3>
                    <span className="text-xs text-gray-400">{savedProjects.length}개</span>
                </div>
                
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {savedProjects.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                            <FolderOpen size={48} className="opacity-20 mb-3" />
                            <p>저장된 프로젝트가 없습니다.</p>
                        </div>
                    ) : (
                        savedProjects.map((project) => {
                            const isSelected = selectedId === project.id;
                            return (
                                <div 
                                    key={project.id}
                                    onClick={() => setSelectedId(project.id)}
                                    className={`group relative flex items-center p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                                        isSelected 
                                        ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500' 
                                        : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                                    }`}
                                >
                                    {/* Selection Indicator */}
                                    <div className={`mr-3 flex-shrink-0 ${isSelected ? 'text-indigo-600' : 'text-gray-300'}`}>
                                        {isSelected ? <CheckCircle2 size={24} fill="currentColor" className="text-white" /> : <Circle size={24} />}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h4 className={`font-bold text-sm truncate ${isSelected ? 'text-indigo-900' : 'text-gray-700'}`}>
                                            {project.title}
                                        </h4>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            수정일: {project.lastUpdated}
                                        </p>
                                    </div>

                                    <button 
                                        onClick={(e) => handleDelete(project.id, e)}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                                        title="삭제"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Load Action Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50">
                    <div className="flex justify-between items-center mb-2">
                         <span className="text-xs text-gray-500">
                            {selectedId ? "프로젝트가 선택되었습니다" : "불러올 프로젝트를 선택하세요"}
                         </span>
                         {selectedId && <span className="text-xs text-orange-600 font-medium">주의: 저장하지 않은 변경사항은 사라집니다</span>}
                    </div>
                    <button 
                        onClick={handleLoadSelected}
                        disabled={!selectedId}
                        className={`w-full py-3 rounded-lg font-bold text-sm transition-all shadow-sm flex justify-center items-center gap-2 ${
                            selectedId 
                            ? 'bg-green-600 hover:bg-green-700 text-white shadow-md active:scale-[0.98]' 
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                        <FolderOpen size={18} />
                        선택한 프로젝트 불러오기
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};