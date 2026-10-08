import React from 'react';
import { ToolMeta } from '../types';
import { ArrowRight } from 'lucide-react';

interface ToolCardProps {
  tool: ToolMeta;
  onSelect: (toolId: ToolMeta['id']) => void;
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool, onSelect }) => {
  return (
    <div
      className="bg-[#FFFFFF] border border-[#E1E5E9] rounded-[6px] p-5 flex flex-col justify-between hover:border-[#CBD5E1] transition-colors"
      style={{
        // subtle thin left border in tool accent color as specified in the guidelines
        borderLeft: `3px solid ${tool.accentColor}`,
      }}
    >
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {/* Small module accent dot */}
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: tool.accentColor }}
            />
            <h3 className="text-sm font-semibold text-[#222222]">
              {tool.name}
            </h3>
          </div>
          <span className="text-[11px] font-medium text-[#626B73] px-1.5 py-0.5 bg-[#F8F9FA] border border-[#E1E5E9] rounded">
            {tool.category}
          </span>
        </div>

        <p className="text-xs text-[#626B73] leading-relaxed mt-2 mb-4">
          {tool.description}
        </p>
      </div>

      <div className="pt-2 border-t border-[#E1E5E9]/60 flex items-center justify-between">
        <span className="text-[11px] text-[#626B73]">
          ID: <code className="text-[#222222] font-mono">{tool.id}</code>
        </span>

        {/* Primary/Tool button */}
        <button
          onClick={() => onSelect(tool.id)}
          className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded transition-colors text-white"
          style={{ backgroundColor: '#244A73' }}
        >
          <span>Open Tool</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
