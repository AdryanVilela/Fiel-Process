import React, { useState, useRef, useEffect } from 'react';
import { Block } from '../types';
import { Play, Pause, Volume2, VolumeX, Maximize2 } from 'lucide-react';

interface BlockRendererProps {
  block: Block;
  onCheckToggle?: (blockId: string, itemId: string) => void;
}

// Helper para detectar ID do YouTube
const getYoutubeId = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

// Custom Audio Player Component
const CustomAudioPlayer = ({ src }: { src: string }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      setCurrentTime(audio.currentTime);
      setProgress((audio.currentTime / audio.duration) * 100);
    };

    const setAudioData = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', setAudioData);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('loadedmetadata', setAudioData);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = (parseFloat(e.target.value) / 100) * duration;
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setProgress(parseFloat(e.target.value));
      setCurrentTime(time);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="mb-6 bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex items-center gap-4 w-full">
      <audio ref={audioRef} src={src} preload="metadata" />
      
      <button 
        onClick={togglePlay}
        className="w-12 h-12 bg-brand-600 hover:bg-brand-700 text-white rounded-full flex items-center justify-center transition-all shadow-md shadow-brand-200 hover:scale-105 flex-shrink-0"
      >
        {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
      </button>

      <div className="flex-1 flex flex-col justify-center gap-1.5">
        <div className="flex justify-between text-xs font-medium text-slate-500 px-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
        <div className="relative w-full h-2 bg-slate-100 rounded-full group cursor-pointer">
          <div 
            className="absolute top-0 left-0 h-full bg-brand-500 rounded-full transition-all duration-100" 
            style={{ width: `${progress}%` }}
          ></div>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={progress || 0} 
            onChange={handleSeek}
            className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
      </div>
      
      <div className="text-slate-400 hidden sm:block">
        <Volume2 size={20} />
      </div>
    </div>
  );
};

// Custom Video Player Component
const CustomVideoPlayer = ({ src }: { src: string }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showYoutube, setShowYoutube] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const youtubeId = getYoutubeId(src);

  const handlePlayClick = () => {
    if (youtubeId) {
      setShowYoutube(true);
    } else if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  if (youtubeId) {
    // Se o usuário já clicou, mostra o iframe
    if (showYoutube) {
      return (
        <div className="mb-6 relative w-full rounded-2xl overflow-hidden shadow-lg bg-black aspect-video">
           <iframe 
             src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&showinfo=0&modestbranding=1`}
             className="w-full h-full" 
             title="YouTube video player" 
             frameBorder="0" 
             allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
             allowFullScreen
           ></iframe>
        </div>
      );
    }

    // Se não clicou, mostra o "Miniplayer Nosso" (Thumbnail + Botão Play)
    return (
      <div className="mb-6 relative w-full rounded-2xl overflow-hidden shadow-lg bg-slate-900 group aspect-video cursor-pointer" onClick={handlePlayClick}>
        {/* Thumbnail do YouTube High Quality */}
        <img 
          src={`https://i.ytimg.com/vi/${youtubeId}/maxresdefault.jpg`}
          onError={(e) => {
            // Fallback se não tiver maxres
            e.currentTarget.src = `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`;
          }}
          alt="Video Thumbnail"
          className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity"
        />
        
        {/* Botão Play Centralizado (Igual ao do Upload) */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/40 shadow-2xl group-hover:scale-110 transition-transform duration-300">
            <div className="w-14 h-14 bg-white text-brand-600 rounded-full flex items-center justify-center shadow-inner">
               <Play size={28} fill="currentColor" className="ml-1" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Player para Upload de Vídeo (MP4)
  return (
    <div className="mb-6 relative w-full rounded-2xl overflow-hidden shadow-lg bg-black group">
      <video 
        ref={videoRef}
        src={src} 
        controls={isPlaying}
        className={`w-full max-h-[600px] ${isPlaying ? 'block' : 'block'}`}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
      />
      
      {!isPlaying && (
        <div 
          className="absolute inset-0 bg-black/30 flex items-center justify-center cursor-pointer backdrop-blur-[2px] transition-all hover:bg-black/20"
          onClick={handlePlayClick}
        >
          <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/40 shadow-2xl group-hover:scale-110 transition-transform duration-300">
            <div className="w-14 h-14 bg-white text-brand-600 rounded-full flex items-center justify-center shadow-inner">
               <Play size={28} fill="currentColor" className="ml-1" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

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
          <img src={block.content} alt="Process Image" className="rounded-xl shadow-md max-w-full mx-auto border border-slate-100" />
        </div>
      ) : null;
    case 'video':
      return block.content ? (
        <CustomVideoPlayer src={block.content} />
      ) : null;
    case 'audio':
      return block.content ? (
        <CustomAudioPlayer src={block.content} />
      ) : null;
    case 'checklist':
      return (
        <div className="mb-8 bg-slate-50 p-6 rounded-xl border border-slate-100">
          <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
             <div className="w-1.5 h-1.5 bg-brand-500 rounded-full"></div>
             Lista de Verificação
          </h4>
          <div className="space-y-3">
            {block.checklistItems?.map((item) => (
              <label key={item.id} className="flex items-start gap-3 cursor-pointer group select-none transition-all hover:bg-white/50 p-1.5 -mx-1.5 rounded-lg">
                <div className="relative flex items-center mt-0.5">
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => onCheckToggle && onCheckToggle(block.id, item.id)}
                    className="peer h-6 w-6 cursor-pointer appearance-none rounded-lg border-2 border-slate-300 shadow-sm transition-all checked:border-brand-600 checked:bg-brand-600 hover:border-brand-400"
                  />
                  <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 transition-opacity peer-checked:opacity-100">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <span className={`flex-1 text-lg transition-all ${item.checked ? 'text-slate-400 line-through decoration-slate-300' : 'text-slate-800'}`}>
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