import React, { useRef, useEffect } from 'react';

interface CellProps {
  value: string;
  onChange: (value: string) => void;
  isCenter?: boolean;
  isMainCenter?: boolean;
  isSubCenter?: boolean;
  readOnly?: boolean;
  placeholder?: string;
}

export const Cell: React.FC<CellProps> = ({ 
  value, 
  onChange, 
  isMainCenter, 
  isSubCenter, 
  readOnly = false,
  placeholder
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize text area
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [value]);

  let bgClass = "bg-white";
  let textClass = "text-gray-700";
  let borderClass = "border-gray-300";

  if (isMainCenter) {
    bgClass = "bg-[#275385]"; // Dark blue from image
    textClass = "text-white font-bold text-center";
  } else if (isSubCenter) {
    bgClass = "bg-[#e1ecf7]"; // Light blue from image
    textClass = "text-gray-900 font-semibold text-center";
  } else {
    textClass = "text-gray-600 text-center";
  }

  return (
    <div className={`relative w-full h-full min-h-[60px] aspect-square flex items-center justify-center border ${borderClass} ${bgClass} transition-colors duration-200`}>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        readOnly={readOnly}
        placeholder={placeholder}
        className={`w-full h-full bg-transparent resize-none outline-none p-1 text-xs sm:text-sm flex flex-col justify-center items-center text-center overflow-hidden placeholder-gray-400 ${textClass}`}
        style={{ lineHeight: '1.2' }}
      />
    </div>
  );
};