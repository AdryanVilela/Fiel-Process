import React from 'react';
import { Block } from '../types';

interface BlockRendererProps {
  block: Block;
  onCheckToggle?: (blockId: string, itemId: string) => void;
}

export const BlockRenderer: React.FC<BlockRendererProps> = ({ block, onCheckToggle }) => {
  switch (block.type) {
    case 'text':
      return (
        <p className="text-slate-700 leading-relaxed whitespace-pre-wrap mb-6 text-lg">
          {block.content}
        </p>
      );
    case 'image':
      return block.content ? (
        <div className="mb-6">
          <img src={block.content} alt="Process Image" className="rounded-lg shadow-md max-w-full mx-auto" />
        </div>
      ) : null;
    case 'video':
      return block.content ? (
        <div className="mb-6">
          <video src={block.content} controls className="w-full rounded-lg shadow-md bg-black" />
        </div>
      ) : null;
    case 'audio':
      return block.content ? (
        <div className="mb-6 p-4 bg-slate-100 rounded-lg">
          <audio src={block.content} controls className="w-full" />
        </div>
      ) : null;
    case 'checklist':
      return (
        <div className="mb-8 bg-slate-50 p-6 rounded-xl border border-slate-100">
          <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Lista de Verificação</h4>
          <div className="space-y-3">
            {block.checklistItems?.map((item) => (
              <label key={item.id} className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => onCheckToggle && onCheckToggle(block.id, item.id)}
                    className="peer h-6 w-6 cursor-pointer appearance-none rounded border border-slate-300 shadow-sm transition-all checked:border-brand-600 checked:bg-brand-600 hover:border-brand-400"
                  />
                  <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 transition-opacity peer-checked:opacity-100">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <span className={`flex-1 text-base transition-colors ${item.checked ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                  {item.text}
                </span>
              </label>
            ))}
          </div>
        </div>
      );
    default:
      return null;
  }
};
