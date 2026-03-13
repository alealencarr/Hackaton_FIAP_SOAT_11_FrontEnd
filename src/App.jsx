import React, { useState, useEffect, useCallback, createContext, useContext, useRef } from 'react';
import { createPortal } from 'react-dom'; // Importação necessária para o Tooltip flutuante
import { 
  Loader2, Upload, FileVideo, CheckCircle2, AlertCircle, 
  X, LogOut, Download, Lock, Mail, User, Clock, Film, 
  Search, Filter, LayoutDashboard, PlusCircle, AlertTriangle, 
  ChevronRight, ChevronLeft, Cpu, Zap, Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Configuração da API ---
const API_BASE_URL = 'https://20.226.201.157/api';

// --- Contexto de Autenticação ---
const AuthContext = createContext(null);

// --- Componente de Partículas (Galaxy Effect) ---
const ParticleBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let w, h;
    let particles = [];

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };

    const createParticles = () => {
      particles = [];
      const count = Math.floor((w * h) / 9000); 
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.2, 
          vy: (Math.random() - 0.5) * 0.2,
          size: Math.random() * 2 + 0.5,
          color: Math.random() > 0.6 ? 'rgba(167, 139, 250, ' : 'rgba(255, 255, 255, ', 
          alpha: Math.random() * 0.8 + 0.2
        });
      }
    };

    const draw = () => {
      ctx.fillStyle = 'rgba(2, 2, 10, 0.2)'; 
      ctx.fillRect(0, 0, w, h);

      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        ctx.beginPath();
        const flicker = Math.random() * 0.1;
        ctx.fillStyle = `${p.color}${p.alpha + flicker})`;
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            ctx.strokeStyle = `rgba(139, 92, 246, ${0.15 * (1 - dist / 120)})`; 
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      });
      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);
    resize();
    createParticles();
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />;
};

// --- Componentes UI Base ---

const Button = ({ children, loading, variant = 'primary', size = 'md', className = '', ...props }) => {
  const sizes = { sm: "px-3 py-1.5 text-xs", md: "px-6 py-3 text-sm" };
  const baseStyle = `relative overflow-hidden rounded-lg font-rajdhani font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${sizes[size]}`;
  
  const variants = {
    primary: `bg-violet-600 text-white border border-violet-400/50 shadow-[0_0_15px_rgba(139,92,246,0.5)] hover:shadow-[0_0_30px_rgba(167,139,250,0.7)] hover:bg-violet-500 hover:border-violet-300`,
    outline: `border border-slate-700 text-slate-300 hover:border-violet-400 hover:text-violet-300 hover:bg-violet-900/20 hover:shadow-[0_0_15px_rgba(139,92,246,0.2)]`,
    ghost: `text-slate-400 hover:text-white hover:bg-white/5`,
    danger: `bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 hover:shadow-[0_0_15px_rgba(239,68,68,0.2)]`
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} disabled={loading} {...props}>
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : children}
      {!loading && variant === 'primary' && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 -translate-x-full hover:animate-shimmer" />
      )}
    </button>
  );
};

const Input = ({ icon: Icon, label, error, ...props }) => (
  <div className="space-y-1.5 w-full">
    {label && <label className="text-xs font-bold text-violet-400 font-orbitron uppercase tracking-widest ml-1 flex items-center gap-2">{label}</label>}
    <div className="relative group">
      {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-violet-400 transition-colors z-10" />}
      <input
        className={`w-full bg-[#05050a]/80 border ${error ? 'border-red-500/50' : 'border-slate-800'} 
        rounded-lg px-4 py-3 ${Icon ? 'pl-10' : ''} text-slate-200 placeholder-slate-600 text-sm font-rajdhani font-medium
        focus:outline-none focus:border-violet-500 focus:bg-[#0a0a14] focus:shadow-[0_0_15px_rgba(139,92,246,0.25)]
        transition-all duration-300 backdrop-blur-sm`}
        {...props}
      />
      <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-gradient-to-r from-violet-600 to-fuchsia-500 transition-all duration-500 group-focus-within:w-full" />
    </div>
    {error && <span className="text-xs text-red-400 ml-1 flex items-center gap-1 font-rajdhani font-bold"><AlertCircle className="w-3 h-3"/> {error}</span>}
  </div>
);

// --- NOVO: Tooltip via Portal (Sobrevive a overflow e z-index) ---
const PortalTooltip = ({ text, children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, placement: 'top' });
  const triggerRef = useRef(null);

  const calculatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const tooltipHeight = 100; // Altura estimada
    const tooltipWidth = 300;  // Largura máxima estimada
    
    // Lógica de colisão
    let top = rect.top - 10;
    let left = rect.left + rect.width / 2;
    let placement = 'top';

    // Se estiver muito perto do topo, joga para baixo
    if (rect.top < tooltipHeight + 20) {
      top = rect.bottom + 10;
      placement = 'bottom';
    }

    // Se estiver muito perto da direita, ajusta
    if (left + (tooltipWidth / 2) > window.innerWidth) {
        left = window.innerWidth - (tooltipWidth / 2) - 20;
    }

    setPosition({ top, left, placement });
  };

  const handleMouseEnter = () => {
    calculatePosition();
    setIsVisible(true);
  };

  // Recalcular no scroll para garantir que acompanhe (opcional, mas bom)
  useEffect(() => {
    if(isVisible) {
      window.addEventListener('scroll', calculatePosition, true);
      window.addEventListener('resize', calculatePosition);
    }
    return () => {
      window.removeEventListener('scroll', calculatePosition, true);
      window.removeEventListener('resize', calculatePosition);
    }
  }, [isVisible]);

  return (
    <>
      <div 
        ref={triggerRef} 
        onMouseEnter={handleMouseEnter} 
        onMouseLeave={() => setIsVisible(false)}
        className="inline-block"
      >
        {children}
      </div>
      {isVisible && createPortal(
        <div 
          style={{ 
            position: 'fixed', 
            top: position.top, 
            left: position.left,
            transform: position.placement === 'top' ? 'translate(-50%, -100%)' : 'translate(-50%, 0)',
            zIndex: 99999, // Z-Index supremo
            pointerEvents: 'none'
          }}
          className="p-2"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: position.placement === 'top' ? 10 : -10 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-[#020205] text-red-300 text-xs rounded border border-red-500/30 p-3 shadow-[0_0_30px_rgba(0,0,0,0.95)] backdrop-blur-xl relative w-max max-w-[300px]"
          >
            <div className="font-rajdhani font-semibold leading-relaxed">
              <span className="text-red-500 font-bold uppercase block text-[10px] mb-1 tracking-wider border-b border-red-900/30 pb-1 flex items-center gap-2">
                <AlertCircle className="w-3 h-3" /> Error Log
              </span>
              {text}
            </div>
            {/* Seta do tooltip */}
            <div 
                className={`absolute left-1/2 -translate-x-1/2 border-4 border-transparent ${
                  position.placement === 'top' 
                  ? 'top-full border-t-red-500/30' 
                  : 'bottom-full border-b-red-500/30'
                }`} 
            />
          </motion.div>
        </div>,
        document.body
      )}
    </>
  );
};

// Badge Status
const StatusBadge = ({ status, errorMsg }) => {
  const config = {
    Pending: { color: "text-yellow-400 bg-yellow-400/5 border-yellow-400/20 shadow-[0_0_10px_rgba(250,204,21,0.1)]", icon: Clock, label: "AGUARDANDO" },
    Processing: { color: "text-violet-400 bg-violet-400/5 border-violet-400/20 shadow-[0_0_15px_rgba(167,139,250,0.2)]", icon: Loader2, label: "PROCESSANDO", animate: true },
    Completed: { color: "text-emerald-400 bg-emerald-400/5 border-emerald-400/20 shadow-[0_0_10px_rgba(52,211,153,0.1)]", icon: CheckCircle2, label: "CONCLUÍDO" },
    Failed: { color: "text-red-500 bg-red-500/5 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]", icon: X, label: "FALHA" },
  };

  const { color, icon: Icon, label, animate } = config[status] || config.Failed;

  const BadgeContent = (
    <span className={`px-2 py-0.5 rounded text-[10px] font-orbitron tracking-widest border flex items-center gap-1.5 w-fit ${color} select-none`}>
      <Icon className={`w-3 h-3 ${animate ? 'animate-spin' : ''}`} />
      {label}
    </span>
  );

  if (status === 'Failed' && errorMsg) {
    return (
      <PortalTooltip text={errorMsg}>
        <div className="cursor-help flex items-center gap-2 group/alert">
           {BadgeContent}
           <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse group-hover/alert:animate-none" />
        </div>
      </PortalTooltip>
    );
  }

  return BadgeContent;
};

// --- Sub-Páginas do Dashboard ---

// 1. View de Upload
const UploadView = ({ onUploadSuccess }) => {
  const { token } = useContext(AuthContext);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [lastUpload, setLastUpload] = useState(null);

  const handleUpload = async (files) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setLastUpload(null);

    const formData = new FormData();
    formData.append('videoFile', files[0]);

    try {
      const res = await fetch(`${API_BASE_URL}/videos/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const json = await res.json();
         
      if (res.ok) {
        setLastUpload(json);
        onUploadSuccess();
      } else {
        let errorMsg = json.message || "Erro desconhecido";
       if (errData.errors) {
               errorMsg = Object.values(errData.errors).flat()[0];
            } else if (errData.message) {
               errorMsg = errData.message;
            } else if (errData.title) {
               errorMsg = errData.title;
            }
             else if (errData.messages) {
               errorMsg = errData.messages[0];
            }
        alert("Erro no upload: " + errorMsg);
      }
    } catch (err) {
      alert("Erro de conexão");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 relative z-10">
      <div className="flex flex-col gap-2 border-l-4 border-violet-500 pl-4">
        <h2 className="text-4xl font-bold text-white font-orbitron tracking-tight uppercase">Upload de <span className="text-violet-500 text-shadow-glow">Dados</span></h2>
        <p className="text-slate-400 font-rajdhani text-lg">Inicie o protocolo de extração neural de frames.</p>
      </div>

      <div 
        className={`relative group border border-dashed rounded-xl h-72 flex flex-col items-center justify-center transition-all duration-300 overflow-hidden
          ${dragActive 
            ? 'border-violet-500 bg-violet-900/10 shadow-[0_0_50px_rgba(139,92,246,0.3)]' 
            : 'border-slate-800 bg-[#05050a]/50 hover:border-violet-500/50 hover:bg-[#0a0a12]/80'}`}
        onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
        onDragOver={(e) => { e.preventDefault(); }}
        onDrop={(e) => { e.preventDefault(); setDragActive(false); handleUpload(e.dataTransfer.files); }}
      >
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none"></div>
        <input 
          type="file" 
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" 
          onChange={(e) => handleUpload(e.target.files)}
          accept=".mp4,.avi,.mkv"
          disabled={uploading}
        />
        
        <div className="flex flex-col items-center gap-6 pointer-events-none z-10">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 relative
            ${uploading ? 'bg-violet-500/10' : 'bg-slate-900/50 border border-slate-800 group-hover:border-violet-500/50 group-hover:shadow-[0_0_30px_rgba(139,92,246,0.3)]'}`}>
            {uploading && <div className="absolute inset-0 rounded-full border-t-2 border-violet-500 animate-spin" />}
            {uploading ? <Cpu className="w-10 h-10 text-violet-400 animate-pulse" /> : <Upload className="w-10 h-10 text-slate-500 group-hover:text-violet-400 transition-colors duration-300" />}
          </div>
          <div className="text-center space-y-1">
            <h3 className="text-xl font-bold text-white font-orbitron tracking-wide group-hover:text-violet-200 transition-colors">
              {uploading ? "UPLOAD EM PROGRESSO..." : "ARRASTE O ARQUIVO"}
            </h3>
            <p className="text-sm text-violet-500/70 font-rajdhani font-semibold tracking-wider">
              PROTOCOLOS SUPORTADOS: MP4, AVI, MKV
            </p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {lastUpload && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0 }}
            className="bg-gradient-to-r from-emerald-900/20 to-transparent border border-emerald-500/30 rounded-lg p-6 flex items-center justify-between relative overflow-hidden shadow-[0_0_30px_rgba(16,185,129,0.1)]"
          >
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
            <div className="flex items-center gap-4">
              <div className="bg-emerald-500/10 p-3 rounded-full border border-emerald-500/20">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h4 className="font-orbitron font-bold text-emerald-100 text-lg tracking-wide uppercase">Operação Bem-sucedida</h4>
                <p className="text-emerald-400/70 text-sm font-rajdhani font-semibold">
                  {lastUpload.messages && lastUpload.messages.length > 0 ? lastUpload.messages[0] : "Processamento iniciado."}
                </p>
                <div className="mt-1 text-[10px] font-mono text-slate-500 bg-black/30 px-2 py-0.5 rounded w-fit border border-white/5">
                  ID: {lastUpload.data?.id}
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => setLastUpload(null)} className="font-rajdhani border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/50 hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              Novo Envio
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// 2. View de Biblioteca
const LibraryView = ({ videos, loading, onDownload, downloadingId }) => {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const filteredVideos = videos.filter(v => {
    const matchesStatus = filter === 'All' || v.status === filter;
    const matchesSearch = v.originalFileName?.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalPages = Math.ceil(filteredVideos.length / ITEMS_PER_PAGE);
  const paginatedVideos = filteredVideos.slice(
    (currentPage - 1) * ITEMS_PER_PAGE, 
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const tabs = [
    { id: 'All', label: 'TODOS' },
    { id: 'Completed', label: 'CONCLUÍDOS' },
    { id: 'Processing', label: 'EM ANDAMENTO' },
    { id: 'Failed', label: 'FALHAS' },
  ];

  return (
    <div className="space-y-6 h-full flex flex-col relative z-10">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 border-b border-slate-800 pb-6">
        <div>
           <h2 className="text-3xl font-orbitron font-bold text-white uppercase tracking-tight">Base de <span className="text-violet-500 text-shadow-glow">Arquivos</span></h2>
           <p className="text-slate-500 font-rajdhani text-sm font-semibold tracking-wide mt-1">
             GERENCIAMENTO DE MÍDIA PROCESSADA :: TOTAL {filteredVideos.length} ARQUIVOS
           </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch gap-3 w-full xl:w-auto">
          <div className="relative group flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-violet-400 transition-colors" />
            <input 
              type="text" 
              placeholder="PESQUISAR ID OU NOME..." 
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="bg-[#05050a] border border-slate-800 text-sm text-slate-200 placeholder-slate-600 focus:border-violet-500/50 focus:ring-0 w-full sm:w-64 pl-10 pr-4 py-2.5 rounded-lg font-rajdhani font-semibold transition-all focus:shadow-[0_0_15px_rgba(139,92,246,0.15)]"
            />
          </div>
          
          <div className="flex bg-[#05050a] p-1 rounded-lg border border-slate-800">
             {tabs.map(tab => (
               <button
                 key={tab.id}
                 onClick={() => { setFilter(tab.id); setCurrentPage(1); }}
                 className={`px-4 py-2 rounded-md text-[10px] font-orbitron font-bold tracking-widest transition-all ${
                   filter === tab.id 
                   ? 'bg-gradient-to-r from-violet-700 to-fuchsia-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.4)]' 
                   : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                 }`}
               >
                 {tab.label}
               </button>
             ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar relative min-h-[400px]">
        {loading && videos.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="flex flex-col items-center gap-4">
               <div className="w-16 h-16 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin shadow-[0_0_30px_rgba(139,92,246,0.2)]" />
               <p className="font-orbitron text-violet-500 animate-pulse text-xs tracking-[0.2em]">CARREGANDO DADOS...</p>
             </div>
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-600 border border-dashed border-slate-800/50 rounded-2xl bg-[#0a0a12]/30">
            <Search className="w-12 h-12 mb-4 opacity-20" />
            <p className="font-orbitron text-sm">NENHUM ARQUIVO ENCONTRADO NO SISTEMA</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
             {paginatedVideos.map(video => (
               <div key={video.id} className="bg-[#0a0a12]/60 backdrop-blur-md border border-slate-800 p-5 rounded-xl hover:border-violet-500/30 transition-all group relative hover:shadow-[0_0_20px_rgba(139,92,246,0.05)]">
                 <div className="flex justify-between items-start mb-4">
                   <div className="flex items-center gap-4 min-w-0">
                     <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-slate-900 to-[#020205] flex items-center justify-center shrink-0 border border-slate-700 shadow-inner group-hover:border-violet-500/30 transition-colors">
                       <FileVideo className="w-6 h-6 text-violet-500 group-hover:text-fuchsia-400 transition-colors shadow-glow" />
                     </div>
                     <div className="min-w-0 flex-1">
                       <h4 className="font-rajdhani font-bold text-slate-200 text-lg truncate leading-none group-hover:text-violet-200 transition-colors" title={video.originalFileName}>
                         {video.originalFileName}
                       </h4>
                       <div className="flex items-center gap-4 text-xs text-slate-500 mt-2 font-mono">
                          <span className="flex items-center gap-1.5"><Clock className="w-3 h-3 text-fuchsia-600"/> {new Date(video.createdAt).toLocaleDateString()}</span>
                          {video.frameCount && (
                            <span className="flex items-center gap-1.5 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-violet-400 group-hover:border-violet-500/30 transition-colors">
                               <Film className="w-3 h-3"/> {video.frameCount} FRAMES
                            </span>
                          )}
                       </div>
                     </div>
                   </div>
                   <StatusBadge status={video.status} errorMsg={video.errorMessage} />
                 </div>

                 <div className="flex items-center justify-between mt-4 pt-4 border-t border-dashed border-slate-800 group-hover:border-violet-500/20 transition-colors">
                    <span className="text-[10px] text-slate-600 font-mono uppercase tracking-widest truncate max-w-[150px]">
                      UUID: {video.id.split('-')[0]}...
                    </span>
                    
                    {video.status === 'Completed' ? (
                       <Button 
                         onClick={() => onDownload(video.id, video.originalFileName)} 
                         size="sm" 
                         loading={downloadingId === video.id} // Spinner Ativado Aqui
                         className="h-8 text-[10px] gap-2 shadow-none bg-emerald-900/10 text-emerald-400 hover:bg-emerald-500 hover:text-white border border-emerald-500/30 font-orbitron w-32"
                       >
                          {!downloadingId && <Download className="w-3 h-3" />} 
                          {downloadingId === video.id ? 'BAIXANDO...' : 'DOWNLOAD ZIP'}
                       </Button>
                    ) : (
                      <div className="h-8" />
                    )}
                 </div>
                 
                 {video.status === 'Processing' && (
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-800 overflow-hidden rounded-b-xl">
                      <div className="h-full bg-gradient-to-r from-violet-600 to-fuchsia-500 animate-progress-indeterminate shadow-[0_0_15px_rgba(139,92,246,0.8)]" />
                    </div>
                 )}
               </div>
             ))}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <p className="text-xs text-slate-500 font-rajdhani font-medium">
            MOSTRANDO <span className="text-white">{paginatedVideos.length}</span> DE <span className="text-white">{filteredVideos.length}</span> RESULTADOS
          </p>
          <div className="flex gap-2">
            <button 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg bg-[#05050a] border border-slate-800 text-slate-400 hover:text-white hover:border-violet-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center px-4 rounded-lg bg-[#05050a] border border-slate-800 text-xs font-orbitron font-bold text-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.1)]">
               PÁGINA {currentPage} / {totalPages}
            </div>
            <button 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg bg-[#05050a] border border-slate-800 text-slate-400 hover:text-white hover:border-violet-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// 3. Dashboard Layout
const DashboardLayout = () => {
  const { user, token, logout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('library'); 
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null); // Estado para controlar o spinner

  const fetchVideos = useCallback(async () => {
    try {
      setLoading(prev => prev || true);
      const res = await fetch(`${API_BASE_URL}/videos`, { headers: { 'Authorization': `Bearer ${token}` } });
      const json = await res.json();
      if (res.ok && Array.isArray(json.data)) {
        setVideos(json.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      }
      else 
      {
        let errorMsg = json.message || "Erro desconhecido";
       if (errData.errors) {
               errorMsg = Object.values(errData.errors).flat()[0];
            } else if (errData.message) {
               errorMsg = errData.message;
            } else if (errData.title) {
               errorMsg = errData.title;
            }
             else if (errData.messages) {
               errorMsg = errData.messages[0];
            }
            alert("Erro:" + errorMsg)
      }
      setLoading(false);
    } catch (e) { 
        setLoading(false); 
    } 
  }, [token]);

  useEffect(() => {
    fetchVideos();
    const interval = setInterval(fetchVideos, 5000);
    return () => clearInterval(interval);
  }, [fetchVideos]);

  const handleDownload = async (id, fileName) => {
    try {
        setDownloadingId(id); // Ativa Spinner
        const res = await fetch(`${API_BASE_URL}/videos/${id}/download`, { headers: { 'Authorization': `Bearer ${token}` } });
           if (!res.ok) {
       let errorMsg = json.message || "";
       if (errData.errors) {
               errorMsg = Object.values(errData.errors).flat()[0];
            } else if (errData.message) {
               errorMsg = errData.message;
            } else if (errData.title) {
               errorMsg = errData.title;
            }
             else if (errData.messages) {
               errorMsg = errData.messages[0];
            }
       throw new Error(errorMsg);
    }
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `${fileName.split('.')[0]}.zip`;
        document.body.appendChild(a); a.click();
        document.body.removeChild(a); window.URL.revokeObjectURL(url);
    } catch (e) { 
        alert("Erro ao baixar o arquivo: " + e.message); 
    } finally {
        setDownloadingId(null); // Desativa Spinner
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#020205] font-sans selection:bg-violet-500/30 selection:text-violet-200">
      <ParticleBackground />
      <div className="absolute inset-0 bg-gradient-to-br from-violet-900/10 via-transparent to-transparent pointer-events-none" />
      
      <aside className="w-72 flex-shrink-0 flex flex-col bg-[#05050a]/90 backdrop-blur-xl border-r border-slate-800 z-20 hidden md:flex shadow-[5px_0_30px_rgba(0,0,0,0.5)]">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.4)] border border-white/10">
              <Film className="text-white w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <h1 className="font-orbitron font-bold text-2xl tracking-tight text-white leading-none">FIAP <span className="text-violet-500">X</span></h1>
              <span className="text-[10px] text-slate-500 font-rajdhani uppercase tracking-[0.2em] font-bold">Deep Space Unit</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-6 space-y-3 mt-4">
          <p className="px-3 text-[10px] font-bold text-slate-600 uppercase tracking-widest font-orbitron mb-2">Menu Principal</p>
          <button 
            onClick={() => setActiveTab('upload')}
            className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-all duration-300 group border relative overflow-hidden
            ${activeTab === 'upload' 
              ? 'bg-gradient-to-r from-violet-900/20 to-transparent border-violet-500/30 text-violet-300' 
              : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            {activeTab === 'upload' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-violet-500 shadow-[0_0_15px_rgba(139,92,246,0.8)]" />}
            <PlusCircle className={`w-5 h-5 ${activeTab === 'upload' ? 'text-violet-400 drop-shadow-[0_0_8px_rgba(139,92,246,0.6)]' : 'group-hover:text-violet-400'}`} />
            <span className="font-rajdhani font-bold text-sm tracking-wide">NOVO UPLOAD</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('library')}
            className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-all duration-300 group border relative overflow-hidden
            ${activeTab === 'library' 
              ? 'bg-gradient-to-r from-fuchsia-900/20 to-transparent border-fuchsia-500/30 text-fuchsia-300' 
              : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
             {activeTab === 'library' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-fuchsia-500 shadow-[0_0_15px_rgba(232,121,249,0.8)]" />}
            <LayoutDashboard className={`w-5 h-5 ${activeTab === 'library' ? 'text-fuchsia-400 drop-shadow-[0_0_8px_rgba(232,121,249,0.6)]' : 'group-hover:text-fuchsia-400'}`} />
            <span className="font-rajdhani font-bold text-sm tracking-wide">BIBLIOTECA</span>
          </button>
        </nav>

        <div className="p-6 border-t border-slate-800 bg-gradient-to-t from-[#020205] to-transparent">
          <div className="flex items-center gap-4 mb-4 p-3 rounded-xl bg-white/5 border border-white/5 backdrop-blur-sm">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold font-orbitron border border-white/20 shadow-lg relative overflow-hidden">
               {user?.name?.[0] || 'O'}
               <div className="absolute inset-0 bg-white/20 animate-pulse" />
            </div>
            <div className="overflow-hidden">
               <p className="text-sm font-bold text-white truncate font-rajdhani">{user?.name}</p>
               <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_5px_rgba(16,185,129,0.8)]" />
                  <p className="text-[10px] text-emerald-500 truncate font-mono uppercase tracking-wider">CONECTADO</p>
               </div>
            </div>
          </div>
          <Button variant="danger" className="w-full justify-start text-[10px] h-8 bg-red-900/10 border-red-900/30 text-red-400 hover:bg-red-900/20 shadow-none" onClick={logout}>
            <LogOut className="w-3 h-3" /> ENCERRAR CONEXÃO
          </Button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative overflow-hidden z-10">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />
        
        <header className="md:hidden h-16 border-b border-slate-800 flex items-center justify-between px-4 bg-[#05050a]/90 backdrop-blur-md">
          <span className="font-orbitron font-bold text-lg text-white">FIAP <span className="text-violet-500">X</span></span>
          <div className="flex gap-2">
             <button onClick={logout} className="p-2 text-red-400"><LogOut /></button>
          </div>
        </header>

        <div className="flex-1 p-6 md:p-12 overflow-y-auto">
          {activeTab === 'upload' ? (
             <UploadView onUploadSuccess={() => { setActiveTab('library'); fetchVideos(); }} />
          ) : (
             <LibraryView videos={videos} loading={loading} onDownload={handleDownload} downloadingId={downloadingId} />
          )}
        </div>
      </main>
    </div>
  );
};

// --- Auth Pages ---
const AuthPage = ({ type, onNavigate }) => {
  const { login } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      if (type === 'login') {
        await login(form.email, form.password);
      } else {
        const res = await fetch(`${API_BASE_URL}/auth/register`, {
           method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(form) 
        });
        
        if (!res.ok) {
          let errorMsg = "Erro no registro";
          try {
            const errData = await res.json();
        
            if (errData.errors) {
               errorMsg = Object.values(errData.errors).flat()[0];
            } else if (errData.message) {
               errorMsg = errData.message;
            } else if (errData.title) {
               errorMsg = errData.title;
            }
             else if (errData.messages) {
               errorMsg = errData.messages[0];
            }
          } catch(err) {
            // Em caso de falha ao ler o JSON, o errorMsg padrão "Erro no registro" será mantido
          }
          throw new Error(errorMsg);
        }

        alert("Conta criada! Faça login.");
        onNavigate('login');
      }
    } catch (e) { 
      setError(e.message || "Ocorreu um erro."); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#020205] font-sans">
       <ParticleBackground />
       <div className="absolute inset-0 bg-radial-gradient from-violet-900/10 via-[#020205]/40 to-[#020205] pointer-events-none" />
       
       <motion.div 
         initial={{ opacity: 0, scale: 0.9 }}
         animate={{ opacity: 1, scale: 1 }}
         transition={{ duration: 1, ease: "easeOut" }}
         className="w-full max-w-md bg-[#05050a]/70 backdrop-blur-xl border border-white/10 p-10 rounded-2xl shadow-[0_0_60px_rgba(139,92,246,0.15)] relative z-10 overflow-hidden group"
       >
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-violet-600/20 rounded-full blur-[100px] group-hover:bg-violet-600/30 transition-all duration-1000 animate-pulse" />
          <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-fuchsia-600/20 rounded-full blur-[100px] group-hover:bg-fuchsia-600/30 transition-all duration-1000 animate-pulse" />

          <div className="text-center mb-10 relative">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 mb-6 shadow-[0_0_30px_rgba(139,92,246,0.5)] border border-white/20 relative overflow-hidden">
               <div className="absolute inset-0 bg-white/20 animate-pulse" />
               <Zap className="w-10 h-10 text-white fill-white relative z-10" />
            </div>
            <h1 className="text-5xl font-orbitron font-bold text-white mb-2 tracking-tight">FIAP <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400 text-shadow-glow">X</span></h1>
            <p className="text-slate-400 text-sm font-rajdhani font-semibold tracking-wider uppercase">{type === 'login' ? 'Identificação Requerida' : 'Novo Registro de Operador'}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 relative">
            {type === 'register' && <Input icon={User} label="Identificação (Nome)" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />}
            <Input icon={Mail} label="Email" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
            <Input icon={Lock} label="Senha" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
            
            {error && (
              <div className="text-red-400 text-xs bg-red-900/20 border border-red-500/20 p-3 rounded flex items-center gap-2 font-bold font-rajdhani animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                <AlertCircle className="w-4 h-4" /> {error}
              </div>
            )}
            
            <Button type="submit" loading={loading} className="w-full h-14 text-lg font-orbitron shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:shadow-[0_0_40px_rgba(167,139,250,0.6)]">
              {type === 'login' ? 'INICIAR' : 'CRIAR CONTA'}
            </Button>
          </form>

          <div className="mt-8 text-center pt-6 border-t border-white/5">
            <button onClick={() => onNavigate(type === 'login' ? 'register' : 'login')} className="text-xs font-rajdhani font-bold text-slate-500 hover:text-violet-400 transition-colors uppercase tracking-widest">
              {type === 'login' ? 'Criar nova conta' : 'Possui conta? Acessar'}
            </button>
          </div>
       </motion.div>
    </div>
  );
};

// --- App Principal ---
const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('login');

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (token && u) { setUser(JSON.parse(u)); setPage('dashboard'); }
  }, [token]);

  const login = async (email, password) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({email, password})
    });
    
    // Agora o login também extrai as mensagens da API caso existam
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
       let errorMsg = json.message || "Login falhou";
       if (errData.errors) {
               errorMsg = Object.values(errData.errors).flat()[0];
            } else if (errData.message) {
               errorMsg = errData.message;
            } else if (errData.title) {
               errorMsg = errData.title;
            }
             else if (errData.messages) {
               errorMsg = errData.messages[0];
            }
       throw new Error(errorMsg);
    }
    
    localStorage.setItem('token', json.data.token);
    localStorage.setItem('user', JSON.stringify(json.data.user));
    setToken(json.data.token); setUser(json.data.user); setPage('dashboard');
  };

  const logout = () => {
    localStorage.clear(); setToken(null); setUser(null); setPage('login');
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Rajdhani:wght@300;400;500;600;700&display=swap');
        
        body { font-family: 'Rajdhani', sans-serif; background-color: #020205; }
        .font-orbitron { font-family: 'Orbitron', sans-serif; }
        .font-rajdhani { font-family: 'Rajdhani', sans-serif; }
        
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e1b4b; border-radius: 2px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #8b5cf6; }
        
        @keyframes progress-indeterminate {
          0% { transform: translateX(-100%) scaleX(0.2); }
          50% { transform: translateX(0%) scaleX(0.5); }
          100% { transform: translateX(100%) scaleX(0.2); }
        }
        .animate-progress-indeterminate { animation: progress-indeterminate 1.5s infinite linear; width: 100%; }
        
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }

        .text-shadow-glow {
           text-shadow: 0 0 10px rgba(139, 92, 246, 0.5);
        }
      `}</style>
      
      {page === 'dashboard' ? <DashboardLayout /> : <AuthPage type={page} onNavigate={setPage} />}
    </AuthContext.Provider>
  );
};

export default App;