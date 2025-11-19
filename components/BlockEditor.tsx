import React, { useState, useRef, useEffect } from 'react';
import { Block } from '../types';
import { Trash2, GripVertical, Image as ImageIcon, Film, Mic, Text, ListTodo, Upload, Square, PlayCircle } from 'lucide-react';

interface BlockEditorProps {
  block: Block;
  index: number;
  onChange: (updatedBlock: Block) => void;
  onRemove: () => void;
  onDragStart: (index: number) => void;
  onDragEnter: (index: number) => void;
  onDragEnd: () => void;
  isDragging: boolean;
}

export const BlockEditor: React.FC<BlockEditorProps> = ({ 
  block, 
  index, 
  onChange, 
  onRemove,
  onDragStart,
  onDragEnter,
  onDragEnd,
  isDragging
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isHandleHovered, setIsHandleHovered] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<number | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
    };
  }, [isRecording]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    onChange({ ...block, content: e.target.value });
  };

  const handleChecklistChange = (itemId: string, text: string) => {
    if (!block.checklistItems) return;
    const newItems = block.checklistItems.map(item => 
      item.id === itemId ? { ...item, text } : item
    );
    onChange({ ...block, checklistItems: newItems });
  };

  const handleChecklistToggle = (itemId: string) => {
    if (!block.checklistItems) return;
    const newItems = block.checklistItems.map(item => 
      item.id === itemId ? { ...item, checked: !item.checked } : item
    );
    onChange({ ...block, checklistItems: newItems });
  };

  const addChecklistItem = () => {
    const newItems = [...(block.checklistItems || []), { id: Date.now().toString(), text: '', checked: false }];
    onChange({ ...block, checklistItems: newItems });
  };

  const removeChecklistItem = (itemId: string) => {
    if (!block.checklistItems) return;
    const newItems = block.checklistItems.filter(item => item.id !== itemId);
    onChange({ ...block, checklistItems: newItems });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onChange({ ...block, content: url });
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        onChange({ ...block, content: url });
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Não foi possível acessar o microfone. Verifique as permissões.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderEditor = () => {
    switch (block.type) {
      case 'text':
        return (
          <textarea
            value={block.content}
            onChange={handleContentChange}
            placeholder="Digite seu texto aqui..."
            className="w-full p-3 border-none focus:ring-0 bg-transparent resize-none text-slate-700 leading-relaxed"
            rows={3}
            autoFocus={!block.content}
          />
        );
      case 'image':
      case 'video':
        return (
          <div className="p-4 bg-slate-50 rounded-lg border border-dashed border-slate-300 hover:bg-slate-100 transition-colors">
            {block.content ? (
              <div className="relative group">
                {block.type === 'image' && <img src={block.content} alt="Preview" className="max-h-96 rounded-lg mx-auto shadow-sm" />}
                {block.type === 'video' && <video src={block.content} controls className="max-h-96 rounded-lg mx-auto shadow-sm" />}
                <button 
                  onClick={() => onChange({ ...block, content: '' })}
                  className="absolute top-2 right-2 bg-white/90 text-red-500 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-50"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ) : (
              <div className="text-center py-8">
                <label className="cursor-pointer flex flex-col items-center justify-center text-slate-400 hover:text-brand-600 transition-colors group/upload">
                  <div className="bg-white p-4 rounded-full shadow-sm mb-3 group-hover/upload:scale-110 transition-transform">
                     <Upload size={24} />
                  </div>
                  <span className="text-sm font-medium">Clique para fazer upload de {block.type === 'image' ? 'uma imagem' : 'um vídeo'}</span>
                  <input 
                    type="file" 
                    accept={block.type === 'image' ? "image/*" : "video/*"} 
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
                  <span>ou cole uma URL:</span>
                  <input 
                    type="text" 
                    placeholder={`https://...`}
                    className="border border-slate-200 rounded-md px-2 py-1 w-64 focus:outline-none focus:border-brand-500 bg-white"
                    onBlur={(e) => onChange({ ...block, content: e.target.value })}
                  />
                </div>
              </div>
            )}
          </div>
        );
      case 'audio':
        return (
          <div className="p-4 bg-slate-50 rounded-lg border border-dashed border-slate-300">
            {block.content ? (
              <div className="relative group">
                <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                  <div className="w-10 h-10 bg-brand-50 rounded-full flex items-center justify-center text-brand-600">
                    <PlayCircle size={20} />
                  </div>
                  <audio src={block.content} controls className="w-full h-8" />
                </div>
                <button 
                  onClick={() => onChange({ ...block, content: '' })}
                  className="absolute -top-2 -right-2 bg-white text-red-500 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md border border-slate-100"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ) : isRecording ? (
               <div className="flex flex-col items-center justify-center py-6 gap-4 animate-pulse">
                  <div className="text-red-500 font-bold text-xl flex items-center gap-3 bg-red-50 px-4 py-2 rounded-full">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                    Gravando... {formatTime(recordingTime)}
                  </div>
                  <button 
                    onClick={stopRecording}
                    className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-full flex items-center gap-2 shadow-lg transition-transform active:scale-95"
                  >
                    <Square size={18} fill="currentColor" />
                    Parar Gravação
                  </button>
               </div>
            ) : (
              <div className="flex flex-col md:flex-row gap-8 items-center justify-center py-6">
                 {/* Option 1: Record */}
                 <button 
                  onClick={startRecording}
                  className="flex flex-col items-center gap-3 group/btn"
                 >
                    <div className="w-14 h-14 bg-white border border-slate-200 text-brand-600 rounded-full flex items-center justify-center group-hover/btn:bg-brand-50 group-hover/btn:border-brand-200 transition-all duration-300 shadow-sm">
                      <Mic size={28} />
                    </div>
                    <span className="text-xs font-medium text-slate-500 group-hover/btn:text-brand-600">Gravar Agora</span>
                 </button>
                 
                 <div className="h-12 w-px bg-slate-200 hidden md:block"></div>
                 <div className="w-12 h-px bg-slate-200 md:hidden"></div>

                 {/* Option 2: Upload */}
                 <label className="cursor-pointer flex flex-col items-center gap-3 group/btn">
                    <div className="w-14 h-14 bg-white border border-slate-200 text-slate-500 rounded-full flex items-center justify-center group-hover/btn:bg-slate-50 group-hover/btn:border-slate-300 transition-all shadow-sm">
                      <Upload size={24} />
                    </div>
                    <span className="text-xs font-medium text-slate-500">Upload Arquivo</span>
                    <input 
                      type="file" 
                      accept="audio/*" 
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                </label>
              </div>
            )}
          </div>
        );
      case 'checklist':
        return (
          <div className="space-y-2">
            {block.checklistItems?.map((item) => (
              <div key={item.id} className="flex items-center gap-3 group bg-slate-50 p-2 rounded-md hover:bg-slate-100 transition-colors">
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => handleChecklistToggle(item.id)}
                  className="w-5 h-5 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                />
                <input
                  type="text"
                  value={item.text}
                  onChange={(e) => handleChecklistChange(item.id, e.target.value)}
                  placeholder="Item da lista..."
                  className="flex-1 bg-transparent border-b border-transparent focus:border-slate-300 focus:outline-none py-1 text-slate-700"
                />
                <button 
                  onClick={() => removeChecklistItem(item.id)}
                  className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <button 
              onClick={addChecklistItem}
              className="text-xs bg-white border border-slate-200 px-3 py-1.5 rounded-md text-slate-600 hover:text-brand-600 hover:border-brand-200 font-medium flex items-center gap-1 mt-2 shadow-sm transition-all"
            >
              + Adicionar item
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div 
      draggable={isHandleHovered}
      onDragStart={() => onDragStart(index)}
      onDragEnter={() => onDragEnter(index)}
      onDragEnd={onDragEnd}
      onDragOver={(e) => e.preventDefault()}
      className={`group relative flex items-start gap-4 mb-6 p-6 rounded-xl shadow-sm border transition-all duration-300 
        ${isDragging ? 'opacity-50 border-brand-300 border-dashed bg-brand-50 scale-[0.99]' : 'bg-white border-slate-100 hover:border-slate-300 hover:shadow-md'}
      `}
    >
      <div 
        className="mt-3 text-slate-200 hover:text-brand-600 cursor-grab active:cursor-grabbing p-1 rounded hover:bg-slate-100 transition-colors"
        onMouseEnter={() => setIsHandleHovered(true)}
        onMouseLeave={() => setIsHandleHovered(false)}
      >
        <GripVertical size={20} />
      </div>
      
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-3">
           <div className={`p-1.5 rounded-md ${
             block.type === 'text' ? 'bg-blue-50 text-blue-600' :
             block.type === 'image' ? 'bg-purple-50 text-purple-600' :
             block.type === 'video' ? 'bg-pink-50 text-pink-600' :
             block.type === 'audio' ? 'bg-amber-50 text-amber-600' :
             'bg-emerald-50 text-emerald-600'
           }`}>
              {block.type === 'text' && <Text size={14} />}
              {block.type === 'image' && <ImageIcon size={14} />}
              {block.type === 'video' && <Film size={14} />}
              {block.type === 'audio' && <Mic size={14} />}
              {block.type === 'checklist' && <ListTodo size={14} />}
           </div>
           <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
             {block.type === 'checklist' ? 'Lista de Tarefas' : block.type === 'audio' ? 'Gravação de Áudio' : block.type === 'video' ? 'Vídeo' : block.type === 'image' ? 'Imagem' : 'Texto'}
           </span>
        </div>
        {renderEditor()}
      </div>

      <button 
        onClick={onRemove}
        className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all absolute top-4 right-4"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
};