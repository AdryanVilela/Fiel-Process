import React, { useState } from 'react';
import { X, Globe, Lock, Copy, Check, ChevronDown } from 'lucide-react';
import { Process, ShareSettings, ShareRole, ShareVisibility } from '../types';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  process: Process | null;
  onSaveSettings: (settings: ShareSettings) => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, process, onSaveSettings }) => {
  if (!isOpen || !process) return null;

  const [copied, setCopied] = useState(false);
  const [visibility, setVisibility] = useState<ShareVisibility>(process.shareSettings?.visibility || 'private');
  const [role, setRole] = useState<ShareRole>(process.shareSettings?.role || 'viewer');

  // Generate a fake shareable link based on current origin
  const shareLink = `${window.location.origin}/#process/${process.id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVisibilityChange = (newVisibility: ShareVisibility) => {
    setVisibility(newVisibility);
    onSaveSettings({ visibility: newVisibility, role });
  };

  const handleRoleChange = (newRole: ShareRole) => {
    setRole(newRole);
    onSaveSettings({ visibility, role: newRole });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-lg text-slate-800">Compartilhar Processo</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 hover:bg-slate-50 p-2 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Access Section */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Acesso Geral</label>
            
            <div className="bg-slate-50 rounded-xl p-1 border border-slate-200 flex flex-col gap-1">
              <button 
                onClick={() => handleVisibilityChange('private')}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all text-left ${visibility === 'private' ? 'bg-white shadow-sm border border-slate-100 ring-1 ring-slate-200/50' : 'hover:bg-slate-100/50'}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${visibility === 'private' ? 'bg-slate-100 text-slate-600' : 'bg-slate-200 text-slate-400'}`}>
                  <Lock size={20} />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-slate-900">Restrito</div>
                  <div className="text-xs text-slate-500">Somente pessoas adicionadas podem abrir este link.</div>
                </div>
                {visibility === 'private' && <Check size={18} className="text-brand-600" />}
              </button>

              <button 
                onClick={() => handleVisibilityChange('link')}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all text-left ${visibility === 'link' ? 'bg-white shadow-sm border border-slate-100 ring-1 ring-slate-200/50' : 'hover:bg-slate-100/50'}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${visibility === 'link' ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-400'}`}>
                  <Globe size={20} />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-slate-900">Qualquer pessoa com o link</div>
                  <div className="text-xs text-slate-500">Qualquer pessoa na internet com este link pode visualizar.</div>
                </div>
                {visibility === 'link' && <Check size={18} className="text-brand-600" />}
              </button>
            </div>
          </div>

          {/* Permissions (Only if public) */}
          {visibility === 'link' && (
            <div className="animate-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between mb-2">
                 <label className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Permissão padrão</label>
              </div>
              <div className="relative">
                <select 
                  value={role}
                  onChange={(e) => handleRoleChange(e.target.value as ShareRole)}
                  className="w-full appearance-none bg-white border border-slate-300 text-slate-700 py-2.5 pl-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent font-medium cursor-pointer hover:border-brand-400 transition-colors"
                >
                  <option value="viewer">Leitor (Pode apenas visualizar)</option>
                  <option value="editor">Editor (Pode organizar e editar)</option>
                </select>
                <ChevronDown className="absolute right-3 top-3 text-slate-400 pointer-events-none" size={16} />
              </div>
            </div>
          )}

          {/* Link Section */}
          <div className="pt-2">
            <label className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-2 block">Link do Processo</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-100 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-600 truncate select-all">
                {shareLink}
              </div>
              <button 
                onClick={handleCopy}
                className={`px-4 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 transition-all ${copied ? 'bg-green-600 text-white' : 'bg-brand-600 text-white hover:bg-brand-700'}`}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-end">
          <button 
            onClick={onClose}
            className="px-5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg font-medium transition-colors"
          >
            Concluído
          </button>
        </div>
      </div>
    </div>
  );
};