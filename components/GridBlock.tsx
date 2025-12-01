import React from 'react';
import { Cell } from './Cell';
import { GridBlock as GridBlockType } from '../types';

interface GridBlockProps {
  blockIndex: number; // 0-8, corresponding to position on the big board
  data: GridBlockType;
  onCellChange: (cellIndex: number, newValue: string) => void;
}

export const GridBlock: React.FC<GridBlockProps> = ({ blockIndex, data, onCellChange }) => {
  // blockIndex 4 is the Center Grid of the whole Mandalart
  const isCenterGrid = blockIndex === 4;

  return (
    <div className="grid grid-cols-3 gap-0 border-2 border-gray-800">
      {data.map((cellValue, cellIndex) => {
        // Center cell of any 3x3 block is index 4
        const isCenterOfBlock = cellIndex === 4;
        
        // If this is the MAIN grid (index 4), the center cell (index 4) is the MAIN GOAL.
        const isMainCenter = isCenterGrid && isCenterOfBlock;
        
        // If this is the MAIN grid, the surrounding cells (not 4) are SUB GOALS.
        // OR if this is an outer grid, its center (4) is a SUB GOAL.
        const isSubCenter = (isCenterGrid && !isMainCenter) || (!isCenterGrid && isCenterOfBlock);

        // Map visual position for placeholder logic or styling if needed
        return (
          <Cell
            key={`${blockIndex}-${cellIndex}`}
            value={cellValue}
            onChange={(val) => onCellChange(cellIndex, val)}
            isMainCenter={isMainCenter}
            isSubCenter={isSubCenter}
            readOnly={!isCenterGrid && isCenterOfBlock} // Outer grid centers are read-only (driven by center grid)
            placeholder={isMainCenter ? "Main Goal" : ""}
          />
        );
      })}
    </div>
  );
};