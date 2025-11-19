import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { BlockEditor } from './components/BlockEditor';
import { BlockRenderer } from './components/BlockRenderer';
import { ShareModal } from './components/ShareModal';
import { Process, ViewMode, Block, ShareSettings } from './types';
import { getProcesses, saveProcess, deleteProcess, generateId } from './services/storageService';
import { Plus, Share2, ChevronLeft, Save, Pencil, Trash2, Check, Text, Image as ImageIcon, Film, Mic, ListTodo, Calendar, Sparkles, FileText } from 'lucide-react';

function App() {
  const [view, setView] = useState<ViewMode>('dashboard');
  const [processes, setProcesses] = useState<Process[]>([]);
  const [activeProcessId, setActiveProcessId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Sharing State
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Editor State
  const [editorTitle, setEditorTitle] = useState('');
  const [editorDesc, setEditorDesc] = useState('');
  const [editorBlocks, setEditorBlocks] = useState<Block[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const data = getProcesses();
    setProcesses(data);
  };

  const showNotification = (msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleNavigate = (newView: ViewMode) => {
    if (newView === 'editor') {
      resetEditor();
    }
    setActiveProcessId(null);
    setView(newView);
  };

  const resetEditor = () => {
    setEditorTitle('');
    setEditorDesc('');
    setEditorBlocks([]);
    setActiveProcessId(null);
  };

  const openEditor = (process: Process) => {
    setActiveProcessId(process.id);
    setEditorTitle(process.title);
    setEditorDesc(process.description);
    setEditorBlocks(process.blocks);
    setView('editor');
  };

  const openViewer = (processId: string) => {
    setActiveProcessId(processId);
    setView('viewer');
  };

  const getActiveProcess = () => processes.find(p => p.id === activeProcessId);

  const handleSave = () => {
    if (!editorTitle.trim()) {
      showNotification('O título é obrigatório.');
      return;
    }

    // Get existing settings if updating, or use defaults
    const existingProcess = activeProcessId ? getActiveProcess() : null;
    
    const newProcess: Process = {
      id: activeProcessId || generateId(),
      title: editorTitle,
      description: editorDesc,
      category: 'Geral',
      tags: [],
      blocks: editorBlocks,
      lastUpdated: Date.now(),
      isFavorite: existingProcess ? existingProcess.isFavorite : false,
      shareSettings: existingProcess ? existingProcess.shareSettings : { visibility: 'private', role: 'viewer' }
    };

    saveProcess(newProcess);
    loadData();
    showNotification('Processo salvo com sucesso!');
    setView('dashboard');
  };

  const handleShareClick = () => {
    setIsShareModalOpen(true);
  };

  const handleUpdateShareSettings = (settings: ShareSettings) => {
    const process = getActiveProcess();
    if (process) {
      const updatedProcess = { ...process, shareSettings: settings };
      saveProcess(updatedProcess);
      // Update local state immediately to reflect changes in UI if needed
      setProcesses(prev => prev.map(p => p.id === process.id ? updatedProcess : p));
    }
  };

  // Block Logic
  const addBlock = (type: Block['type']) => {
    const newBlock: Block = {
      id: generateId(),
      type,
      content: '',
      checklistItems: type === 'checklist' ? [{ id: generateId(), text: '', checked: false }] : undefined
    };
    setEditorBlocks([...editorBlocks, newBlock]);
  };

  const updateBlock = (updatedBlock: Block) => {
    setEditorBlocks(editorBlocks.map(b => b.id === updatedBlock.id ? updatedBlock : b));
  };

  const removeBlock = (id: string) => {
    setEditorBlocks(editorBlocks.filter(b => b.id !== id));
  };

  // Viewer Logic
  const handleCheckToggle = (blockId: string, itemId: string) => {
    const process = getActiveProcess();
    if (!process) return;
    
    const updatedBlocks = process.blocks.map(b => {
      if (b.id === blockId && b.checklistItems) {
        return {
          ...b,
          checklistItems: b.checklistItems.map(item => 
            item.id === itemId ? { ...item, checked: !item.checked } : item
          )
        };
      }
      return b;
    });
    
    const updatedProcess = { ...process, blocks: updatedBlocks };
    setProcesses(processes.map(p => p.id === process.id ? updatedProcess : p));
    // Ideally save to storage as well, but for demo state is enough or we call saveProcess
    saveProcess(updatedProcess);
  };

  // Renderers
  const renderDashboard = () => {
    const filteredProcesses = processes.filter(p => 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <main className="max-w-6xl mx-auto p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Meus Processos</h1>
            <p className="text-slate-500 mt-1">Gerencie a base de conhecimento da sua empresa</p>
          </div>
          <button 
            onClick={() => handleNavigate('editor')}
            className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-full flex items-center gap-2 font-medium transition-all shadow-lg shadow-brand-500/20 hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Plus size={20} />
            <span>Novo Processo</span>
          </button>
        </div>

        {filteredProcesses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl shadow-sm border border-slate-100 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <Sparkles className="text-slate-300" size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Sua área de trabalho está vazia</h3>
            <p className="text-slate-500 mb-8 max-w-md">Crie manuais, documentações ou guias passo-a-passo para padronizar os processos da sua equipe.</p>
            <button 
              onClick={() => handleNavigate('editor')}
              className="text-brand-600 font-semibold hover:text-brand-800 flex items-center gap-2"
            >
              Criar primeiro documento &rarr;
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProcesses.map(process => (
              <div key={process.id} className="group bg-white rounded-2xl shadow-sm hover:shadow-xl hover:shadow-slate-200/50 border border-slate-100 transition-all duration-300 flex flex-col overflow-hidden">
                <div className="p-6 flex-1 cursor-pointer" onClick={() => openViewer(process.id)}>
                  <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center mb-4 text-brand-600">
                    <FileText size={20} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-brand-600 transition-colors leading-snug">
                    {process.title}
                  </h3>
                  <p className="text-slate-500 text-sm line-clamp-3 leading-relaxed">
                    {process.description || 'Sem descrição disponível.'}
                  </p>
                </div>
                <div className="px-6 py-4 border-t border-slate-50 bg-slate-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                    <Calendar size={14} />
                    <span>{new Date(process.lastUpdated).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <div className="flex gap-1">
                     <button onClick={() => openEditor(process)} className="text-slate-400 hover:text-brand-600 hover:bg-white p-2 rounded-lg transition-colors" title="Editar">
                        <Pencil size={16} />
                     </button>
                     <button onClick={(e) => {
                       if(window.confirm('Deletar este processo?')) {
                         deleteProcess(process.id);
                         loadData();
                       }
                     }} className="text-slate-400 hover:text-red-600 hover:bg-white p-2 rounded-lg transition-colors" title="Deletar">
                        <Trash2 size={16} />
                     </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    );
  };

  const renderEditor = () => {
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <div className="flex items-center justify-between mb-8 sticky top-20 z-40 bg-slate-50/90 backdrop-blur-sm py-4 rounded-xl">
          <button 
            onClick={() => setView('dashboard')}
            className="text-slate-500 hover:text-slate-900 flex items-center gap-2 font-medium transition-colors px-2"
          >
            <ChevronLeft size={20} />
            Voltar
          </button>
          <div className="flex gap-2">
            <button 
              onClick={handleSave}
              className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2.5 rounded-full flex items-center gap-2 font-medium shadow-lg shadow-brand-500/20 transition-all active:scale-95"
            >
              <Save size={18} />
              Salvar Processo
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 md:p-10 mb-8">
          <input
            type="text"
            value={editorTitle}
            onChange={(e) => setEditorTitle(e.target.value)}
            placeholder="Título do Processo"
            className="w-full text-4xl font-bold text-slate-800 placeholder-slate-300 border-none focus:ring-0 p-0 mb-4 bg-transparent"
          />
          <textarea
            value={editorDesc}
            onChange={(e) => setEditorDesc(e.target.value)}
            placeholder="Descreva o objetivo deste processo..."
            rows={2}
            className="w-full text-lg text-slate-600 placeholder-slate-300 border-none focus:ring-0 p-0 resize-none bg-transparent leading-relaxed"
          />
        </div>

        <div className="space-y-4 min-h-[200px]">
          {editorBlocks.map((block) => (
            <BlockEditor 
              key={block.id} 
              block={block} 
              onChange={updateBlock}
              onRemove={() => removeBlock(block.id)}
            />
          ))}
          
          {editorBlocks.length === 0 && (
             <div className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl mb-4">
               Adicione blocos abaixo para começar a construir seu documento.
             </div>
          )}
        </div>

        <div className="mt-8 bg-white p-4 rounded-2xl shadow-lg border border-slate-100 sticky bottom-8 z-40">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-2">Adicionar Conteúdo</p>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => addBlock('text')} className="flex items-center gap-2 px-4 py-3 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors font-medium flex-1 md:flex-none justify-center">
              <Text size={20} />
              <span>Texto</span>
            </button>
            <button onClick={() => addBlock('checklist')} className="flex items-center gap-2 px-4 py-3 bg-emerald-50 text-emerald-700 rounded-xl hover:bg-emerald-100 transition-colors font-medium flex-1 md:flex-none justify-center">
              <ListTodo size={20} />
              <span>Tarefas</span>
            </button>
            <button onClick={() => addBlock('image')} className="flex items-center gap-2 px-4 py-3 bg-purple-50 text-purple-700 rounded-xl hover:bg-purple-100 transition-colors font-medium flex-1 md:flex-none justify-center">
              <ImageIcon size={20} />
              <span>Imagem</span>
            </button>
            <button onClick={() => addBlock('video')} className="flex items-center gap-2 px-4 py-3 bg-pink-50 text-pink-700 rounded-xl hover:bg-pink-100 transition-colors font-medium flex-1 md:flex-none justify-center">
              <Film size={20} />
              <span>Vídeo</span>
            </button>
            <button onClick={() => addBlock('audio')} className="flex items-center gap-2 px-4 py-3 bg-amber-50 text-amber-700 rounded-xl hover:bg-amber-100 transition-colors font-medium flex-1 md:flex-none justify-center">
              <Mic size={20} />
              <span>Áudio</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderViewer = () => {
    const process = getActiveProcess();
    if (!process) return <div className="p-8 text-center">Processo não encontrado</div>;

    return (
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <div className="flex items-center justify-between mb-8">
           <button 
            onClick={() => setView('dashboard')}
            className="text-slate-500 hover:text-slate-900 flex items-center gap-2 font-medium transition-colors bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100"
          >
            <ChevronLeft size={20} />
            Voltar
          </button>
          <div className="flex gap-2">
            <button 
              onClick={() => openEditor(process)}
              className="text-slate-500 hover:text-brand-600 p-2.5 rounded-full hover:bg-white transition-all hover:shadow-sm"
              title="Editar"
            >
              <Pencil size={20} />
            </button>
             <button 
              onClick={handleShareClick}
              className="text-slate-500 hover:text-brand-600 p-2.5 rounded-full hover:bg-white transition-all hover:shadow-sm"
              title="Compartilhar"
            >
              <Share2 size={20} />
            </button>
          </div>
        </div>

        <article className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden mb-20">
          <div className="bg-gradient-to-br from-brand-600 to-brand-800 text-white p-8 md:p-16 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
             <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-10 translate-y-1/2 -translate-x-1/2"></div>
             
             <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6 opacity-80">
                  <span className="text-sm font-medium flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
                    <Calendar size={14} />
                    Atualizado em {new Date(process.lastUpdated).toLocaleDateString()}
                  </span>
                </div>
                <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight tracking-tight">{process.title}</h1>
                <p className="text-xl text-brand-100 max-w-2xl leading-relaxed">{process.description}</p>
             </div>
          </div>

          <div className="p-8 md:p-16">
             {process.blocks.map(block => (
               <BlockRenderer 
                key={block.id} 
                block={block} 
                onCheckToggle={handleCheckToggle}
              />
             ))}
          </div>
        </article>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 font-sans selection:bg-brand-100 selection:text-brand-900">
      <Header currentView={view} onChangeView={handleNavigate} onSearch={setSearchQuery} />
      
      <div className="flex-1 overflow-y-auto">
        {view === 'dashboard' && renderDashboard()}
        {view === 'editor' && renderEditor()}
        {view === 'viewer' && renderViewer()}
      </div>

      <ShareModal 
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        process={getActiveProcess() || null}
        onSaveSettings={handleUpdateShareSettings}
      />

      {/* Toast Notification */}
      <div className={`fixed bottom-8 right-8 bg-brand-600 text-white px-6 py-4 rounded-2xl shadow-xl shadow-brand-600/20 flex items-center gap-4 transition-all duration-500 transform z-50 ${showToast ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
        <div className="bg-white/20 rounded-full p-1">
            <Check size={14} className="text-white" strokeWidth={3} />
        </div>
        <span className="font-medium">{toastMsg}</span>
      </div>
    </div>
  );
}

export default App;