import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { Block } from '../types';
import { Trash2, GripVertical, Image as ImageIcon, Film, Mic, Text, ListTodo, Upload, Square, Play, Pause, X } from 'lucide-react';

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

// Helper para detectar YouTube ID
const getYoutubeId = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

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
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [showYoutubePreview, setShowYoutubePreview] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const startTimeRef = useRef<number>(0);
  const timerIntervalRef = useRef<number | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) window.clearInterval(timerIntervalRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  // Auto-resize textarea logic
  useLayoutEffect(() => {
    if (textareaRef.current && block.type === 'text') {
      // Reset height to allow shrinking
      textareaRef.current.style.height = 'inherit'; 
      // Set height to scrollHeight to match content
      textareaRef.current.style.height = `${Math.max(textareaRef.current.scrollHeight, 80)}px`;
    }
  }, [block.content, block.type]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    onChange({ ...block, content: e.target.value });
    setShowYoutubePreview(false); // Reset preview when url changes
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
      startTimeRef.current = Date.now();
      
      // Clear any existing interval just in case
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

      // Start new interval
      timerIntervalRef.current = window.setInterval(() => {
        setRecordingTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 100); // Update frequently for smoother UI if needed

    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Não foi possível acessar o microfone. Verifique as permissões.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
  };

  const toggleAudioPreview = () => {
    if (audioRef.current) {
      if (isPlayingPreview) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlayingPreview(!isPlayingPreview);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderEditor = () => {
    const youtubeId = block.type === 'video' && block.content ? getYoutubeId(block.content) : null;

    switch (block.type) {
      case 'text':
        return (
          <div className="relative w-full">
            <textarea
              ref={textareaRef}
              value={block.content}
              onChange={handleContentChange}
              placeholder="Digite seu texto aqui..."
              className="w-full p-4 border border-transparent rounded-xl bg-slate-50/50 focus:bg-brand-50/30 focus:border-brand-100 focus:ring-2 focus:ring-brand-100 focus:outline-none resize-none text-slate-700 leading-relaxed overflow-hidden min-h-[100px] transition-all duration-200 placeholder-slate-300"
              autoFocus={!block.content}
            />
          </div>
        );
      case 'image':
      case 'video':
        return (
          <div className="p-4 bg-slate-50 rounded-lg border border-dashed border-slate-300 hover:bg-slate-100 transition-colors relative group/container">
            {block.content ? (
              <div className="relative group w-full flex justify-center">
                {block.type === 'image' && <img src={block.content} alt="Preview" className="max-h-96 rounded-lg shadow-sm object-contain" />}
                
                {block.type === 'video' && (
                  <div className="relative w-full max-w-2xl rounded-xl overflow-hidden bg-black shadow-md group/video">
                     {youtubeId ? (
                       <div className="aspect-video w-full bg-slate-900 relative group/yt">
                         {showYoutubePreview ? (
                            <iframe 
                              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
                              className="w-full h-full" 
                              title="YouTube video player" 
                              frameBorder="0" 
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                              allowFullScreen
                            ></iframe>
                         ) : (
                            <div className="w-full h-full relative cursor-pointer" onClick={() => setShowYoutubePreview(true)}>
                               <img 
                                  src={`https://i.ytimg.com/vi/${youtubeId}/maxresdefault.jpg`} 
                                  onError={(e) => { e.currentTarget.src = `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`}}
                                  alt="Youtube Thumbnail"
                                  className="w-full h-full object-cover opacity-80"
                               />
                               <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/40 shadow-2xl transition-transform duration-300 group-hover/yt:scale-110">
                                    <div className="w-14 h-14 bg-white text-brand-600 rounded-full flex items-center justify-center shadow-inner">
                                      <Play size={28} fill="currentColor" className="ml-1" />
                                    </div>
                                  </div>
                                </div>
                            </div>
                         )}
                       </div>
                     ) : (
                       <video src={block.content} controls className="w-full max-h-96 block" />
                     )}
                  </div>
                )}

                <button 
                  onClick={() => onChange({ ...block, content: '' })}
                  className="absolute -top-3 -right-3 bg-white text-red-500 p-2 rounded-full shadow-md border border-slate-100 opacity-0 group-hover/container:opacity-100 transition-opacity hover:bg-red-50 z-10"
                  title="Remover mídia"
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
                    placeholder={block.type === 'video' ? "https://youtube.com/..." : "https://..."}
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
          <div className="p-4 bg-slate-50 rounded-lg border border-dashed border-slate-300 relative group/container">
            {block.content ? (
              <div className="relative w-full">
                <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                  <button 
                    onClick={toggleAudioPreview}
                    className="w-12 h-12 bg-brand-600 text-white rounded-full flex items-center justify-center hover:bg-brand-700 transition-colors shadow-md flex-shrink-0"
                  >
                    {isPlayingPreview ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
                  </button>
                  
                  <div className="flex-1 h-full flex flex-col justify-center gap-1">
                     <div className="h-1.5 bg-slate-100 rounded-full w-full overflow-hidden">
                        <div className={`h-full bg-brand-500 ${isPlayingPreview ? 'animate-progress-indeterminate' : 'w-full'}`}></div>
                     </div>
                     <span className="text-xs text-slate-400 font-medium">Áudio gravado</span>
                  </div>

                  <audio 
                    ref={audioRef} 
                    src={block.content} 
                    onEnded={() => setIsPlayingPreview(false)}
                    className="hidden" 
                  />
                </div>
                <button 
                  onClick={() => onChange({ ...block, content: '' })}
                  className="absolute -top-3 -right-3 bg-white text-red-500 p-2 rounded-full opacity-0 group-hover/container:opacity-100 transition-opacity shadow-md border border-slate-100 hover:bg-red-50 z-10"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ) : isRecording ? (
               <div className="flex flex-col items-center justify-center py-8 gap-6 bg-red-50/50 rounded-xl border border-red-100">
                  <div className="flex items-center gap-2">
                     <span className="flex h-3 w-3 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                      </span>
                     <span className="text-red-600 font-bold text-2xl font-mono">{formatTime(recordingTime)}</span>
                  </div>
                  
                  <div className="flex items-end gap-1 h-8">
                     {[...Array(10)].map((_, i) => (
                        <div key={i} className="w-1 bg-red-400 rounded-full animate-pulse" style={{ height: `${Math.random() * 100}%`, animationDelay: `${i * 0.1}s` }}></div>
                     ))}
                  </div>

                  <button 
                    onClick={stopRecording}
                    className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-full flex items-center gap-2 shadow-lg shadow-red-500/20 transition-all active:scale-95 font-medium"
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
                    <div className="w-16 h-16 bg-white border-2 border-slate-100 text-brand-600 rounded-full flex items-center justify-center group-hover/btn:bg-brand-50 group-hover/btn:border-brand-200 group-hover/btn:scale-110 transition-all duration-300 shadow-sm">
                      <Mic size={32} />
                    </div>
                    <span className="text-sm font-medium text-slate-500 group-hover/btn:text-brand-600">Gravar Áudio</span>
                 </button>
                 
                 <div className="h-12 w-px bg-slate-200 hidden md:block"></div>
                 <div className="w-12 h-px bg-slate-200 md:hidden"></div>

                 {/* Option 2: Upload */}
                 <label className="cursor-pointer flex flex-col items-center gap-3 group/btn">
                    <div className="w-16 h-16 bg-white border-2 border-slate-100 text-slate-400 rounded-full flex items-center justify-center group-hover/btn:bg-slate-50 group-hover/btn:border-slate-300 group-hover/btn:scale-110 transition-all duration-300 shadow-sm">
                      <Upload size={28} />
                    </div>
                    <span className="text-sm font-medium text-slate-500 group-hover/btn:text-slate-700">Upload Arquivo</span>
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
              <div key={item.id} className="flex items-center gap-3 group bg-slate-50 p-2 rounded-lg border border-transparent hover:border-slate-200 transition-all">
                 <label className="relative flex items-center justify-center w-6 h-6 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => handleChecklistToggle(item.id)}
                    className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded bg-white checked:bg-brand-600 checked:border-brand-600 transition-all"
                  />
                  <CheckIcon className="absolute w-3.5 h-3.5 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" />
                </label>
                
                <input
                  type="text"
                  value={item.text}
                  onChange={(e) => handleChecklistChange(item.id, e.target.value)}
                  placeholder="Item da lista..."
                  className="flex-1 bg-transparent border-b border-transparent focus:border-slate-300 focus:outline-none py-1 text-slate-700"
                />
                <button 
                  onClick={() => removeChecklistItem(item.id)}
                  className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
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
        className="mt-3 text-slate-200 hover:text-brand-600 cursor-grab active:cursor-grabbing p-2 -ml-2 rounded hover:bg-slate-50 transition-colors"
        onMouseEnter={() => setIsHandleHovered(true)}
        onMouseLeave={() => setIsHandleHovered(false)}
      >
        <GripVertical size={24} />
      </div>
      
      <div className="flex-1 min-w-0">
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
             {block.type === 'checklist' ? 'Lista de Tarefas' : block.type === 'audio' ? 'Áudio' : block.type === 'video' ? 'Vídeo' : block.type === 'image' ? 'Imagem' : 'Texto'}
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

// Small helper for the checklist checkmark
const CheckIcon = ({ className }: { className?: string }) => (
  <svg 
    className={className} 
    fill="none" 
    viewBox="0 0 24 24" 
    stroke="currentColor" 
    strokeWidth={3}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);