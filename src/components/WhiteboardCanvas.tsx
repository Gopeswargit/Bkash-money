import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Pen, 
  Highlighter, 
  Eraser, 
  RotateCcw, 
  RotateCw, 
  Trash2, 
  Download, 
  Type, 
  Sparkles, 
  Maximize2, 
  Minimize2,
  MoveRight,
  Square,
  Circle,
  Eye,
  EyeOff,
  Palette,
  Layers,
  HelpCircle,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';

export type ToolType = 'pen' | 'highlighter' | 'arrow' | 'rect' | 'circle' | 'eraser' | 'laser' | 'text';
export type BoardBackground = 'transparent' | 'chalkboard' | 'whiteboard' | 'grid';

interface DrawAction {
  tool: ToolType;
  color: string;
  size: number;
  points: { x: number; y: number }[];
  text?: string;
  startPoint?: { x: number; y: number };
  endPoint?: { x: number; y: number };
}

interface Props {
  isActive: boolean;
  onClose?: () => void;
  targetCanvasRef?: React.RefObject<HTMLCanvasElement | null>;
}

const PRESET_COLORS = [
  { name: 'Neon Green', hex: '#22c55e' },
  { name: 'Electric Cyan', hex: '#06b6d4' },
  { name: 'Golden Yellow', hex: '#eab308' },
  { name: 'Hot Coral', hex: '#f43f5e' },
  { name: 'Purple Neon', hex: '#a855f7' },
  { name: 'Pure White', hex: '#ffffff' },
  { name: 'Jet Black', hex: '#171717' }
];

const MATH_STAMPS = [
  'θ₁', 'θ₂', 'det(J)', '∫ f(x)dx', '∂u/∂t', 'α ∇²u', 'λ₁', 'λ₂', 'v₀', '∑', 'Δx', 'F=ma', 'sin(θ)', 'cos(θ)', 'τ=Iα'
];

export const WhiteboardCanvas: React.FC<Props> = ({ isActive, targetCanvasRef }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [currentTool, setCurrentTool] = useState<ToolType>('pen');
  const [currentColor, setCurrentColor] = useState<string>('#22c55e');
  const [strokeSize, setStrokeSize] = useState<number>(4);
  const [boardBg, setBoardBg] = useState<BoardBackground>('transparent');
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [history, setHistory] = useState<DrawAction[]>([]);
  const [redoStack, setRedoStack] = useState<DrawAction[]>([]);
  const [currentAction, setCurrentAction] = useState<DrawAction | null>(null);
  const [laserPoint, setLaserPoint] = useState<{ x: number; y: number } | null>(null);
  const [textInputPos, setTextInputPos] = useState<{ x: number; y: number } | null>(null);
  const [textValue, setTextValue] = useState<string>('');

  // Resize canvas to match container or target canvas
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const parent = canvas.parentElement;
      if (parent) {
        const rect = parent.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        redraw();
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background if not transparent
    if (boardBg === 'chalkboard') {
      ctx.fillStyle = '#111827';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (boardBg === 'whiteboard') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (boardBg === 'grid') {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      const step = 25;
      for (let x = 0; x < canvas.width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    }

    // Draw all completed actions
    const allActions = currentAction ? [...history, currentAction] : history;

    for (const action of allActions) {
      ctx.save();
      if (action.tool === 'highlighter') {
        ctx.globalAlpha = 0.35;
        ctx.lineWidth = action.size * 3.5;
        ctx.lineCap = 'square';
        ctx.strokeStyle = action.color;
      } else if (action.tool === 'eraser') {
        ctx.globalCompositeOperation = boardBg === 'transparent' ? 'destination-out' : 'source-over';
        ctx.strokeStyle = boardBg === 'whiteboard' ? '#ffffff' : (boardBg === 'chalkboard' ? '#111827' : '#0f172a');
        ctx.lineWidth = action.size * 5;
        ctx.lineCap = 'round';
      } else {
        ctx.globalAlpha = 1.0;
        ctx.lineWidth = action.size;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = action.color;
        ctx.fillStyle = action.color;
      }

      if (action.tool === 'pen' || action.tool === 'highlighter' || action.tool === 'eraser') {
        if (action.points.length > 1) {
          ctx.beginPath();
          ctx.moveTo(action.points[0].x, action.points[0].y);
          for (let i = 1; i < action.points.length; i++) {
            ctx.lineTo(action.points[i].x, action.points[i].y);
          }
          ctx.stroke();
        } else if (action.points.length === 1) {
          ctx.beginPath();
          ctx.arc(action.points[0].x, action.points[0].y, action.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (action.tool === 'arrow' && action.startPoint && action.endPoint) {
        const { x: x1, y: y1 } = action.startPoint;
        const { x: x2, y: y2 } = action.endPoint;
        const angle = Math.atan2(y2 - y1, x2 - x1);
        const headlen = Math.max(12, action.size * 3);

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - headlen * Math.cos(angle - Math.PI / 6), y2 - headlen * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(x2 - headlen * Math.cos(angle + Math.PI / 6), y2 - headlen * Math.sin(angle + Math.PI / 6));
        ctx.closePath();
        ctx.fill();
      } else if (action.tool === 'rect' && action.startPoint && action.endPoint) {
        const x = Math.min(action.startPoint.x, action.endPoint.x);
        const y = Math.min(action.startPoint.y, action.endPoint.y);
        const w = Math.abs(action.endPoint.x - action.startPoint.x);
        const h = Math.abs(action.endPoint.y - action.startPoint.y);
        ctx.strokeRect(x, y, w, h);
      } else if (action.tool === 'circle' && action.startPoint && action.endPoint) {
        const rx = Math.abs(action.endPoint.x - action.startPoint.x) / 2;
        const ry = Math.abs(action.endPoint.y - action.startPoint.y) / 2;
        const cx = Math.min(action.startPoint.x, action.endPoint.x) + rx;
        const cy = Math.min(action.startPoint.y, action.endPoint.y) + ry;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        ctx.stroke();
      } else if (action.tool === 'text' && action.points.length > 0 && action.text) {
        ctx.font = `bold ${Math.max(14, action.size * 4)}px ui-sans-serif, system-ui, sans-serif`;
        ctx.fillStyle = action.color;
        ctx.fillText(action.text, action.points[0].x, action.points[0].y);
      }

      ctx.restore();
    }
  }, [history, currentAction, boardBg]);

  useEffect(() => {
    redraw();
  }, [redraw]);

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handlePointerDown = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isActive) return;
    const { x, y } = getCanvasCoords(e);

    if (currentTool === 'laser') {
      setLaserPoint({ x, y });
      return;
    }

    if (currentTool === 'text') {
      setTextInputPos({ x, y });
      return;
    }

    setIsDrawing(true);
    setRedoStack([]);

    const newAction: DrawAction = {
      tool: currentTool,
      color: currentColor,
      size: strokeSize,
      points: [{ x, y }],
      startPoint: { x, y },
      endPoint: { x, y }
    };
    setCurrentAction(newAction);
  };

  const handlePointerMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasCoords(e);

    if (currentTool === 'laser') {
      setLaserPoint({ x, y });
      return;
    }

    if (!isDrawing || !currentAction) return;

    if (currentTool === 'pen' || currentTool === 'highlighter' || currentTool === 'eraser') {
      setCurrentAction(prev => prev ? {
        ...prev,
        points: [...prev.points, { x, y }]
      } : null);
    } else {
      setCurrentAction(prev => prev ? {
        ...prev,
        endPoint: { x, y }
      } : null);
    }
  };

  const handlePointerUp = () => {
    if (currentTool === 'laser') {
      setLaserPoint(null);
      return;
    }

    if (isDrawing && currentAction) {
      setHistory(prev => [...prev, currentAction]);
      setCurrentAction(null);
      setIsDrawing(false);
    }
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setHistory(prev => prev.slice(0, -1));
    setRedoStack(prev => [...prev, last]);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setRedoStack(prev => prev.slice(0, -1));
    setHistory(prev => [...prev, next]);
  };

  const handleClear = () => {
    if (history.length === 0) return;
    setHistory([]);
    setRedoStack([]);
  };

  const handleAddTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInputPos || !textValue.trim()) {
      setTextInputPos(null);
      setTextValue('');
      return;
    }

    const textAction: DrawAction = {
      tool: 'text',
      color: currentColor,
      size: strokeSize,
      points: [textInputPos],
      text: textValue.trim()
    };

    setHistory(prev => [...prev, textAction]);
    setTextInputPos(null);
    setTextValue('');
  };

  const handleStampMath = (symbol: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const x = canvas.width / 2 + (Math.random() * 80 - 40);
    const y = canvas.height / 2 + (Math.random() * 80 - 40);

    const mathAction: DrawAction = {
      tool: 'text',
      color: currentColor,
      size: strokeSize + 1,
      points: [{ x, y }],
      text: symbol
    };
    setHistory(prev => [...prev, mathAction]);
  };

  const handleDownloadSnapshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create a temporary canvas to merge target simulation canvas + whiteboard annotations
    const merged = document.createElement('canvas');
    merged.width = canvas.width;
    merged.height = canvas.height;
    const ctx = merged.getContext('2d');
    if (!ctx) return;

    // Draw background or target canvas
    if (targetCanvasRef && targetCanvasRef.current) {
      try {
        ctx.drawImage(targetCanvasRef.current, 0, 0, merged.width, merged.height);
      } catch {
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, merged.width, merged.height);
      }
    } else {
      ctx.fillStyle = boardBg === 'whiteboard' ? '#ffffff' : '#0a0a0a';
      ctx.fillRect(0, 0, merged.width, merged.height);
    }

    // Draw annotations canvas
    ctx.drawImage(canvas, 0, 0);

    // Add author watermark
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '12px monospace';
    ctx.fillText('Lecture & Simulation Notes by Gopeswar Roy • bKash: 01728045202', 15, merged.height - 15);

    const link = document.createElement('a');
    link.download = `STEM-Simulation-Whiteboard-Notes-${Date.now()}.png`;
    link.href = merged.toDataURL('image/png');
    link.click();

    confetti({
      particleCount: 35,
      spread: 50,
      origin: { y: 0.7 }
    });
  };

  if (!isActive) return null;

  return (
    <div className="absolute inset-0 z-30 pointer-events-auto flex flex-col select-none">
      
      {/* Floating Interactive Toolbar */}
      <div className="absolute top-3 left-3 right-3 z-40 flex flex-wrap items-center justify-between gap-2 p-2 bg-neutral-900/95 backdrop-blur-md border border-neutral-700/80 rounded-2xl shadow-2xl">
        
        {/* Tools Palette */}
        <div className="flex items-center gap-1 flex-wrap">
          <button
            onClick={() => setCurrentTool('pen')}
            className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              currentTool === 'pen' ? 'bg-emerald-600 text-white shadow-md' : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
            }`}
            title="পেন (সাধারণ কলম)"
          >
            <Pen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">পেন</span>
          </button>

          <button
            onClick={() => setCurrentTool('highlighter')}
            className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              currentTool === 'highlighter' ? 'bg-amber-600 text-white shadow-md' : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
            }`}
            title="হাইলাইটার (স্বচ্ছ মার্কার)"
          >
            <Highlighter className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">হাইলাইটার</span>
          </button>

          <button
            onClick={() => setCurrentTool('arrow')}
            className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              currentTool === 'arrow' ? 'bg-blue-600 text-white shadow-md' : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
            }`}
            title="ডিরেকশন তীর (ভেক্টর নির্দেশক)"
          >
            <MoveRight className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">তীর</span>
          </button>

          <button
            onClick={() => setCurrentTool('rect')}
            className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              currentTool === 'rect' ? 'bg-purple-600 text-white shadow-md' : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
            }`}
            title="বক্স / আয়তক্ষেত্র"
          >
            <Square className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setCurrentTool('circle')}
            className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              currentTool === 'circle' ? 'bg-indigo-600 text-white shadow-md' : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
            }`}
            title="সার্কেল / বৃত্ত"
          >
            <Circle className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setCurrentTool('text')}
            className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              currentTool === 'text' ? 'bg-pink-600 text-white shadow-md' : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
            }`}
            title="টেক্সট / লেবেল নোট"
          >
            <Type className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">টেক্সট</span>
          </button>

          <button
            onClick={() => setCurrentTool('eraser')}
            className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              currentTool === 'eraser' ? 'bg-rose-600 text-white shadow-md' : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
            }`}
            title="ইরেজার (মুছে ফেলা)"
          >
            <Eraser className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">মুছুন</span>
          </button>
        </div>

        {/* Color Palette & Stroke Size */}
        <div className="flex items-center gap-2">
          {/* Color Circles */}
          <div className="flex items-center gap-1 bg-neutral-950 px-2 py-1.5 rounded-xl border border-neutral-800">
            {PRESET_COLORS.map(c => (
              <button
                key={c.hex}
                onClick={() => setCurrentColor(c.hex)}
                className={`w-5 h-5 rounded-full border transition-all ${
                  currentColor === c.hex ? 'scale-125 border-white shadow-sm' : 'border-transparent opacity-80 hover:opacity-100'
                }`}
                style={{ backgroundColor: c.hex }}
                title={c.name}
              />
            ))}
          </div>

          {/* Stroke Slider */}
          <div className="hidden md:flex items-center gap-1.5 bg-neutral-950 px-2.5 py-1.5 rounded-xl border border-neutral-800 text-xs text-neutral-300">
            <span className="text-[10px] text-neutral-400">সাইজ:</span>
            <input
              type="range"
              min="2"
              max="16"
              value={strokeSize}
              onChange={(e) => setStrokeSize(Number(e.target.value))}
              className="w-14 accent-emerald-500 cursor-pointer"
            />
          </div>

          {/* Board Background Selector */}
          <select
            value={boardBg}
            onChange={(e) => setBoardBg(e.target.value as BoardBackground)}
            className="bg-neutral-950 border border-neutral-800 rounded-xl px-2 py-1.5 text-xs text-neutral-200 focus:outline-none"
          >
            <option value="transparent">সিমুলেশন ওভারলে</option>
            <option value="chalkboard">ব্ল্যাকবোর্ড</option>
            <option value="whiteboard">হোয়াইটবোর্ড</option>
            <option value="grid">ম্যাথ গ্রিড পেপার</option>
          </select>

          {/* History Undo / Redo / Clear */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleUndo}
              disabled={history.length === 0}
              className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 text-neutral-300"
              title="পূর্বাবস্থায় ফিরুন (Undo)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleRedo}
              disabled={redoStack.length === 0}
              className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 text-neutral-300"
              title="পুনরায় করুন (Redo)"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleClear}
              className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 text-rose-300"
              title="সব ড্রয়িং ক্লিয়ার করুন"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Snapshot Download */}
          <button
            onClick={handleDownloadSnapshot}
            className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center gap-1 shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
            title="নোট ও ড্রয়িং সহ স্ন্যাপশট ডাউনলোড"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">নোট ডাউনলোড</span>
          </button>
        </div>
      </div>

      {/* Floating Math Symbols Stamper on Left */}
      <div className="absolute left-3 top-20 z-40 hidden md:flex flex-col gap-1 p-2 bg-neutral-900/90 backdrop-blur-md border border-neutral-800 rounded-2xl shadow-xl max-h-[70vh] overflow-y-auto">
        <span className="text-[10px] font-bold text-neutral-400 px-1 py-0.5 border-b border-neutral-800">
          ম্যাথ স্ট্যাম্প
        </span>
        {MATH_STAMPS.map(stamp => (
          <button
            key={stamp}
            onClick={() => handleStampMath(stamp)}
            className="px-2 py-1 rounded-lg bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-[11px] font-mono text-emerald-400 hover:text-white transition-all text-left"
            title="ক্যানভাসে স্ট্যাম্প করুন"
          >
            {stamp}
          </button>
        ))}
      </div>

      {/* Laser Pointer Rendering */}
      {laserPoint && (
        <div
          className="absolute w-6 h-6 rounded-full bg-red-500/80 border-2 border-white shadow-lg shadow-red-500/90 pointer-events-none transform -translate-x-1/2 -translate-y-1/2 animate-pulse z-50"
          style={{ left: laserPoint.x, top: laserPoint.y }}
        />
      )}

      {/* Text Input Overlay Dialog */}
      {textInputPos && (
        <div
          className="absolute z-50 bg-neutral-900 border border-neutral-700 p-2.5 rounded-xl shadow-2xl space-y-2"
          style={{ left: Math.min(window.innerWidth - 220, Math.max(20, textInputPos.x)), top: Math.max(70, textInputPos.y - 40) }}
        >
          <form onSubmit={handleAddTextSubmit} className="flex items-center gap-1.5">
            <input
              type="text"
              autoFocus
              placeholder="নোট বা সূত্র লিখুন..."
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              className="bg-neutral-950 border border-neutral-700 rounded-lg px-2.5 py-1 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-pink-500"
            />
            <button
              type="submit"
              className="p-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* Main Annotation Canvas */}
      <canvas
        ref={canvasRef}
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
        className="w-full h-full cursor-crosshair touch-none"
      />

      {/* Quick Help Tip on Bottom Right */}
      <div className="absolute bottom-3 right-3 z-40 bg-neutral-950/80 backdrop-blur-sm border border-neutral-800 px-3 py-1.5 rounded-xl text-[11px] text-neutral-400 flex items-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
        <span>হোয়াইটবোর্ডে পেন দিয়ে লিখে বা তীর দিয়ে শিক্ষার্থীদের বুঝাতে পারবেন</span>
      </div>

    </div>
  );
};
