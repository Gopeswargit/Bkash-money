import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Sparkles, 
  FunctionSquare, 
  TrendingUp, 
  Layers, 
  Sliders, 
  Download, 
  Code2, 
  Info,
  DollarSign,
  Send,
  Eye,
  Bot,
  Compass,
  Cpu,
  Activity,
  Grid,
  Maximize2,
  Atom,
  CircleDot,
  Flame,
  Share2,
  Facebook,
  Github,
  Youtube,
  Instagram,
  Camera,
  ExternalLink,
  Mic,
  PenTool
} from 'lucide-react';
import { SimulationShareModal, SimulationShareData } from './SimulationShareModal';
import { WhiteboardCanvas } from './WhiteboardCanvas';
import { VoiceRecorderStudio } from './VoiceRecorderStudio';
import { LiveSimulationCodeEditor } from './LiveSimulationCodeEditor';
import { SimulationAiInsightPanel } from './SimulationAiInsightPanel';
import { CREATOR_PROFILE } from '../data/socialLinks';

interface Props {
  onSelectForInvoice: (serviceName: string, amount: number) => void;
}

type SimulationCategory = 
  | 'mechanics' 
  | 'matrix' 
  | 'trigonometry' 
  | 'calculus_ode_pde' 
  | 'robotics' 
  | 'fourier';

export const MathSimulationStudio: React.FC<Props> = ({ onSelectForInvoice }) => {
  const [activeCategory, setActiveCategory] = useState<SimulationCategory>('robotics');
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [isWhiteboardActive, setIsWhiteboardActive] = useState<boolean>(false);
  const [isVoiceStudioOpen, setIsVoiceStudioOpen] = useState<boolean>(false);
  const [isCodeEditorOpen, setIsCodeEditorOpen] = useState<boolean>(false);
  const [isCustomCodeActive, setIsCustomCodeActive] = useState<boolean>(false);
  const [, setCustomCodeString] = useState<string>('');

  const customRenderFnRef = useRef<((ctx: CanvasRenderingContext2D, w: number, h: number, t: number, mouse: { x: number; y: number; isInteracting: boolean }) => void) | null>(null);
  const mousePosRef = useRef<{ x: number; y: number; isInteracting: boolean }>({ x: 0, y: 0, isInteracting: false });

  const handleApplyCustomCode = (codeStr: string, active: boolean) => {
    try {
      const creatorFn = new Function('ctx', 'w', 'h', 't', 'mouse', `
        ${codeStr}
        if (typeof renderSimulation === 'function') {
          return renderSimulation;
        }
        throw new Error("renderSimulation(ctx, w, h, t, mouse) ফাংশনটি সংজ্ঞায়িত করা হয়নি!");
      `);
      const compiledFn = creatorFn({}, 100, 100, 0, { x: 0, y: 0, isInteracting: false });
      customRenderFnRef.current = compiledFn;
      setCustomCodeString(codeStr);
      setIsCustomCodeActive(active);
    } catch (e) {
      console.error("Failed to compile custom code:", e);
      throw e;
    }
  };

  const handleResetCustomCode = () => {
    setIsCustomCodeActive(false);
    customRenderFnRef.current = null;
  };
  
  // --- STATE FOR ALL SIMULATION MODULES ---

  // 1. ROBOTICS & INVERSE KINEMATICS
  const [robotMode, setRobotMode] = useState<'ik' | 'fk'>('ik');
  const [robotTheta1, setRobotTheta1] = useState<number>(45); // degrees
  const [robotTheta2, setRobotTheta2] = useState<number>(45); // degrees
  const [targetPos, setTargetPos] = useState<{ x: number; y: number }>({ x: 260, y: 150 });
  const [armLength1, setArmLength1] = useState<number>(130);
  const [armLength2, setArmLength2] = useState<number>(110);
  const [showWorkspace, setShowWorkspace] = useState<boolean>(true);

  // 2. PHYSICS & MECHANICS (Double Pendulum / Harmonic Spring / Projectile)
  const [mechanicsType, setMechanicsType] = useState<'double_pendulum' | 'spring_damper' | 'projectile'>('double_pendulum');
  // Double Pendulum params
  const [dpTheta1, setDpTheta1] = useState<number>(Math.PI / 2);
  const [dpTheta2, setDpTheta2] = useState<number>(Math.PI / 2);
  const [dpTrace, setDpTrace] = useState<{ x: number; y: number }[]>([]);
  // Spring Damper params
  const [springK, setSpringK] = useState<number>(15);
  const [dampingC, setDampingC] = useState<number>(0.8);
  const [massM, setMassM] = useState<number>(2);
  // Projectile params
  const [projAngle, setProjAngle] = useState<number>(45);
  const [projVelocity, setProjVelocity] = useState<number>(60);
  const [projGravity, setProjGravity] = useState<number>(9.8);
  const [isSimulatingPhysics, setIsSimulatingPhysics] = useState<boolean>(true);

  // 3. MATRIX TRANSFORMATIONS & LINEAR ALGEBRA
  const [matrixA, setMatrixA] = useState<number>(1.5);
  const [matrixB, setMatrixB] = useState<number>(0.8);
  const [matrixC, setMatrixC] = useState<number>(-0.4);
  const [matrixD, setMatrixD] = useState<number>(1.2);
  const [showEigen, setShowEigen] = useState<boolean>(true);
  const [showVectorField, setShowVectorField] = useState<boolean>(true);

  // 4. TRIGONOMETRY & GEOMETRY (Unit Circle + Real-time Waveform)
  const [trigAngle, setTrigAngle] = useState<number>(55); // in degrees
  const [autoRotateTrig, setAutoRotateTrig] = useState<boolean>(true);

  // 5. CALCULUS, ODE & PDE (Slope Field / Riemann Integral / 1D Heat PDE)
  const [calculusType, setCalculusType] = useState<'pde_heat' | 'ode_slope' | 'riemann'>('pde_heat');
  const [pdeDiffusionRate, setPdeDiffusionRate] = useState<number>(0.5);
  const [heatGrid, setHeatGrid] = useState<number[]>(() => {
    // Initial impulse heat in the center
    const arr = new Array(50).fill(0);
    for (let i = 20; i <= 30; i++) arr[i] = 100;
    return arr;
  });
  const [odeFunc, setOdeFunc] = useState<'linear' | 'vortex' | 'oscillator'>('vortex');
  const [riemannSlices, setRiemannSlices] = useState<number>(14);

  // 6. FOURIER SERIES & WAVES
  const [fourierHarmonics, setFourierHarmonics] = useState<number>(5);
  const [fourierSpeed, setFourierSpeed] = useState<number>(1);
  const [fourierWaveShape, setFourierWaveShape] = useState<'square' | 'sawtooth'>('square');

  // Canvas Refs & Animation Loop
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);

  // Double pendulum internal dynamic state refs
  const dpState = useRef({
    th1: Math.PI / 2,
    th2: Math.PI / 2,
    w1: 0,
    w2: 0,
    l1: 90,
    l2: 80,
    m1: 10,
    m2: 10,
    g: 0.8
  });

  // Spring internal state
  const springState = useRef({
    x: 100,
    v: 0
  });

  // Projectile time ticker
  const [projTime, setProjTime] = useState<number>(0);

  // Ticker for active simulations
  useEffect(() => {
    let interval: any;
    if (isSimulatingPhysics) {
      interval = setInterval(() => {
        setProjTime((t) => t + 0.05);
        if (autoRotateTrig) {
          setTrigAngle((a) => (a + 1.2) % 360);
        }
      }, 30);
    }
    return () => clearInterval(interval);
  }, [isSimulatingPhysics, autoRotateTrig]);

  // Heat PDE Step Effect
  useEffect(() => {
    if (!isSimulatingPhysics || calculusType !== 'pde_heat') return;
    const interval = setInterval(() => {
      setHeatGrid((prev) => {
        const next = [...prev];
        const alpha = 0.22 * pdeDiffusionRate;
        for (let i = 1; i < prev.length - 1; i++) {
          next[i] = prev[i] + alpha * (prev[i - 1] - 2 * prev[i] + prev[i + 1]);
        }
        return next;
      });
    }, 45);
    return () => clearInterval(interval);
  }, [isSimulatingPhysics, calculusType, pdeDiffusionRate]);

  // Handle Canvas Mouse Drag for Robotics / Interactive Coordinates
  const handleCanvasInteraction = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const mouseX = (clientX - rect.left) * scaleX;
    const mouseY = (clientY - rect.top) * scaleY;

    mousePosRef.current = { x: mouseX, y: mouseY, isInteracting: true };

    if (activeCategory === 'robotics') {
      const baseOrigin = { x: canvas.width * 0.35, y: canvas.height * 0.75 };
      setTargetPos({
        x: mouseX - baseOrigin.x,
        y: -(mouseY - baseOrigin.y) // invert Y for standard Cartesian
      });
    } else if (activeCategory === 'trigonometry') {
      const circleCenter = { x: 200, y: canvas.height / 2 };
      const dx = mouseX - circleCenter.x;
      const dy = -(mouseY - circleCenter.y);
      let deg = (Math.atan2(dy, dx) * 180) / Math.PI;
      if (deg < 0) deg += 360;
      setTrigAngle(deg);
      setAutoRotateTrig(false);
    } else if (activeCategory === 'calculus_ode_pde' && calculusType === 'pde_heat') {
      // Add heat impulse at mouse position along the 1D bar
      const barStartX = 80;
      const barEndX = canvas.width - 80;
      if (mouseX >= barStartX && mouseX <= barEndX) {
        const ratio = (mouseX - barStartX) / (barEndX - barStartX);
        const idx = Math.floor(ratio * heatGrid.length);
        setHeatGrid((prev) => {
          const next = [...prev];
          for (let offset = -3; offset <= 3; offset++) {
            const targetIdx = idx + offset;
            if (targetIdx >= 0 && targetIdx < next.length) {
              next[targetIdx] = Math.min(100, next[targetIdx] + 80);
            }
          }
          return next;
        });
      }
    }
  };

  // --- MAIN RENDER LOOP ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;

    const render = () => {
      time += 0.03;
      const w = canvas.width;
      const h = canvas.height;

      // Dark canvas background
      ctx.fillStyle = '#0B0F19';
      ctx.fillRect(0, 0, w, h);

      // Subtle engineering grid
      ctx.strokeStyle = '#162032';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // ==========================================
      // 0. CUSTOM USER SCRIPT LIVE RUNNER
      // ==========================================
      if (isCustomCodeActive && customRenderFnRef.current) {
        try {
          customRenderFnRef.current(ctx, w, h, time, {
            x: mousePosRef.current.x,
            y: mousePosRef.current.y,
            isInteracting: mousePosRef.current.isInteracting
          });
          animFrameRef.current = requestAnimationFrame(render);
          return;
        } catch (err) {
          console.error('Custom code runtime error:', err);
        }
      }

      // ==========================================
      // 1. ROBOTICS & INVERSE KINEMATICS (2-DOF)
      // ==========================================
      if (activeCategory === 'robotics') {
        const originX = w * 0.38;
        const originY = h * 0.78;
        const l1 = armLength1;
        const l2 = armLength2;

        // Draw Base Mount
        ctx.fillStyle = '#334155';
        ctx.beginPath();
        ctx.roundRect(originX - 45, originY, 90, 30, [4, 4, 12, 12]);
        ctx.fill();
        ctx.strokeStyle = '#475569';
        ctx.stroke();

        // Workspace Reachable Circle
        if (showWorkspace) {
          ctx.strokeStyle = 'rgba(99, 102, 241, 0.18)';
          ctx.fillStyle = 'rgba(99, 102, 241, 0.03)';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([6, 6]);
          ctx.beginPath();
          ctx.arc(originX, originY, l1 + l2, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Inner dead zone
          ctx.beginPath();
          ctx.arc(originX, originY, Math.abs(l1 - l2), 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        let th1Rad = (robotTheta1 * Math.PI) / 180;
        let th2Rad = (robotTheta2 * Math.PI) / 180;

        if (robotMode === 'ik') {
          // Analytical Inverse Kinematics for 2-link planar arm
          const tx = targetPos.x;
          const ty = targetPos.y;
          const distSq = tx * tx + ty * ty;
          const dist = Math.sqrt(distSq);

          // Clamped distance to max reach
          const maxReach = l1 + l2 - 0.5;
          const minReach = Math.abs(l1 - l2) + 0.5;
          const clampedDist = Math.max(minReach, Math.min(maxReach, dist));
          const scale = clampedDist / (dist || 1);
          const effectiveX = tx * scale;
          const effectiveY = ty * scale;

          // Law of Cosines for IK
          const cosTh2 = (effectiveX * effectiveX + effectiveY * effectiveY - l1 * l1 - l2 * l2) / (2 * l1 * l2);
          const clampedCosTh2 = Math.max(-1, Math.min(1, cosTh2));
          th2Rad = Math.acos(clampedCosTh2); // Elbow up

          const k1 = l1 + l2 * Math.cos(th2Rad);
          const k2 = l2 * Math.sin(th2Rad);
          const gamma = Math.atan2(effectiveY, effectiveX);
          const alpha = Math.atan2(k2, k1);
          th1Rad = gamma - alpha;
        }

        // Forward Kinematics Coordinates
        const joint1X = originX;
        const joint1Y = originY;
        const joint2X = originX + l1 * Math.cos(th1Rad);
        const joint2Y = originY - l1 * Math.sin(th1Rad);
        const endEffectorX = joint2X + l2 * Math.cos(th1Rad + th2Rad);
        const endEffectorY = joint2Y - l2 * Math.sin(th1Rad + th2Rad);

        // Draw Target Cursor (Target Point)
        if (robotMode === 'ik') {
          const targetScreenX = originX + targetPos.x;
          const targetScreenY = originY - targetPos.y;

          // Target reticle
          ctx.strokeStyle = '#F43F5E';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(targetScreenX, targetScreenY, 14, 0, Math.PI * 2);
          ctx.moveTo(targetScreenX - 18, targetScreenY);
          ctx.lineTo(targetScreenX + 18, targetScreenY);
          ctx.moveTo(targetScreenX, targetScreenY - 18);
          ctx.lineTo(targetScreenX, targetScreenY + 18);
          ctx.stroke();

          ctx.fillStyle = '#FDA4AF';
          ctx.font = '11px monospace';
          ctx.fillText(`Target (X:${targetPos.x.toFixed(0)}, Y:${targetPos.y.toFixed(0)})`, targetScreenX + 18, targetScreenY - 6);
        }

        // Draw Link 1 (Base to Joint 2)
        ctx.strokeStyle = '#6366F1';
        ctx.lineWidth = 14;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(joint1X, joint1Y);
        ctx.lineTo(joint2X, joint2Y);
        ctx.stroke();

        ctx.strokeStyle = '#A5B4FC';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(joint1X, joint1Y);
        ctx.lineTo(joint2X, joint2Y);
        ctx.stroke();

        // Draw Link 2 (Joint 2 to End-Effector)
        ctx.strokeStyle = '#EC4899';
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.moveTo(joint2X, joint2Y);
        ctx.lineTo(endEffectorX, endEffectorY);
        ctx.stroke();

        ctx.strokeStyle = '#FBCFE8';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(joint2X, joint2Y);
        ctx.lineTo(endEffectorX, endEffectorY);
        ctx.stroke();

        // Draw Joint Pivot Circles
        const drawJoint = (jx: number, jy: number, color: string, label: string) => {
          ctx.fillStyle = '#0F172A';
          ctx.beginPath();
          ctx.arc(jx, jy, 11, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = color;
          ctx.lineWidth = 3.5;
          ctx.stroke();

          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(jx, jy, 4, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#E2E8F0';
          ctx.font = '10px monospace';
          ctx.fillText(label, jx + 14, jy + 4);
        };

        drawJoint(joint1X, joint1Y, '#818CF8', `J1 θ1: ${(th1Rad * 180 / Math.PI).toFixed(1)}°`);
        drawJoint(joint2X, joint2Y, '#F472B6', `J2 θ2: ${(th2Rad * 180 / Math.PI).toFixed(1)}°`);

        // End-Effector Gripper / Tool
        ctx.fillStyle = '#10B981';
        ctx.beginPath();
        ctx.arc(endEffectorX, endEffectorY, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Gripper Prongs
        const gripAngle = th1Rad + th2Rad;
        const prongLen = 16;
        const prongSpread = 0.4;
        ctx.strokeStyle = '#34D399';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(endEffectorX, endEffectorY);
        ctx.lineTo(endEffectorX + prongLen * Math.cos(gripAngle - prongSpread), endEffectorY - prongLen * Math.sin(gripAngle - prongSpread));
        ctx.moveTo(endEffectorX, endEffectorY);
        ctx.lineTo(endEffectorX + prongLen * Math.cos(gripAngle + prongSpread), endEffectorY - prongLen * Math.sin(gripAngle + prongSpread));
        ctx.stroke();

        // Stats HUD Panel
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(w - 240, 20, 220, 115, 12);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#F8FAFC';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText('🤖 Kinematics Telemetry', w - 225, 42);

        ctx.fillStyle = '#94A3B8';
        ctx.font = '11px monospace';
        ctx.fillText(`End-Effector (X, Y):`, w - 225, 62);
        ctx.fillStyle = '#34D399';
        ctx.fillText(`[ ${(endEffectorX - originX).toFixed(1)}, ${(-(endEffectorY - originY)).toFixed(1)} ] px`, w - 225, 78);

        ctx.fillStyle = '#94A3B8';
        ctx.fillText(`Jacobian Determinant:`, w - 225, 98);
        const jDet = l1 * l2 * Math.sin(th2Rad);
        ctx.fillStyle = Math.abs(jDet) < 1000 ? '#F43F5E' : '#38BDF8';
        ctx.fillText(`det(J) = ${jDet.toFixed(0)} ${Math.abs(jDet) < 1000 ? '(Singularity!)' : '(Nominal)'}`, w - 225, 114);
      }

      // ==========================================
      // 2. PHYSICS & MECHANICS (Double Pendulum / Harmonic Spring / Projectile)
      // ==========================================
      else if (activeCategory === 'mechanics') {
        if (mechanicsType === 'double_pendulum') {
          // RK4 or Euler-Chromer Physics for Chaotic Double Pendulum
          const s = dpState.current;
          const originX = w / 2;
          const originY = 80;

          if (isSimulatingPhysics) {
            // Equations of Motion for Double Pendulum (Lagrangian Mechanics)
            const num1 = -s.g * (2 * s.m1 + s.m2) * Math.sin(s.th1) - s.m2 * s.g * Math.sin(s.th1 - 2 * s.th2) - 2 * Math.sin(s.th1 - s.th2) * s.m2 * (s.w2 * s.w2 * s.l2 + s.w1 * s.w1 * s.l1 * Math.cos(s.th1 - s.th2));
            const den1 = s.l1 * (2 * s.m1 + s.m2 - s.m2 * Math.cos(2 * s.th1 - 2 * s.th2));
            const alpha1 = num1 / den1;

            const num2 = 2 * Math.sin(s.th1 - s.th2) * (s.w1 * s.w1 * s.l1 * (s.m1 + s.m2) + s.g * (s.m1 + s.m2) * Math.cos(s.th1) + s.w2 * s.w2 * s.l2 * s.m2 * Math.cos(s.th1 - s.th2));
            const den2 = s.l2 * (2 * s.m1 + s.m2 - s.m2 * Math.cos(2 * s.th1 - 2 * s.th2));
            const alpha2 = num2 / den2;

            s.w1 += alpha1 * 0.2;
            s.w2 += alpha2 * 0.2;
            s.w1 *= 0.999; // subtle air damping
            s.w2 *= 0.999;
            s.th1 += s.w1 * 0.2;
            s.th2 += s.w2 * 0.2;
          }

          const x1 = originX + s.l1 * Math.sin(s.th1);
          const y1 = originY + s.l1 * Math.cos(s.th1);
          const x2 = x1 + s.l2 * Math.sin(s.th2);
          const y2 = y1 + s.l2 * Math.cos(s.th2);

          // Update trajectory trace
          if (isSimulatingPhysics) {
            setDpTrace((prev) => {
              const updated = [...prev, { x: x2, y: y2 }];
              if (updated.length > 250) updated.shift();
              return updated;
            });
          }

          // Draw chaotic motion ribbon trace
          if (dpTrace.length > 1) {
            ctx.lineWidth = 2;
            for (let i = 0; i < dpTrace.length - 1; i++) {
              const alpha = (i / dpTrace.length) * 0.85;
              ctx.strokeStyle = `rgba(236, 72, 153, ${alpha})`;
              ctx.beginPath();
              ctx.moveTo(dpTrace[i].x, dpTrace[i].y);
              ctx.lineTo(dpTrace[i + 1].x, dpTrace[i + 1].y);
              ctx.stroke();
            }
          }

          // Draw Rod 1
          ctx.strokeStyle = '#94A3B8';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(originX, originY);
          ctx.lineTo(x1, y1);
          ctx.stroke();

          // Draw Rod 2
          ctx.strokeStyle = '#38BDF8';
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();

          // Anchor & Bob 1
          ctx.fillStyle = '#CBD5E1';
          ctx.beginPath();
          ctx.arc(originX, originY, 6, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#38BDF8';
          ctx.beginPath();
          ctx.arc(x1, y1, 10, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Bob 2 (Chaos Tip)
          ctx.fillStyle = '#EC4899';
          ctx.beginPath();
          ctx.arc(x2, y2, 12, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 2;
          ctx.stroke();

          // HUD Stats
          ctx.fillStyle = '#E2E8F0';
          ctx.font = '13px monospace';
          ctx.fillText('🌀 Chaotic Double Pendulum (Lagrangian Dynamics)', 30, 40);
          ctx.fillStyle = '#EC4899';
          ctx.fillText(`Tip Velocity: ${(Math.sqrt(s.w1 * s.w1 + s.w2 * s.w2) * 10).toFixed(1)} rad/s`, 30, 60);
          ctx.fillStyle = '#94A3B8';
          ctx.fillText(`Non-linear Deterministic Chaos`, 30, 80);

        } else if (mechanicsType === 'spring_damper') {
          // Mass-Spring-Damper System
          const originY = 80;
          const originX = w / 2;

          if (isSimulatingPhysics) {
            // m * x'' + c * x' + k * x = 0
            const acc = (-springK * springState.current.x - dampingC * springState.current.v) / massM;
            springState.current.v += acc * 0.08;
            springState.current.x += springState.current.v * 0.08;
          }

          const currentY = originY + 120 + springState.current.x;

          // Draw Ceiling Mount
          ctx.fillStyle = '#475569';
          ctx.fillRect(originX - 60, originY - 10, 120, 10);

          // Draw Spring Coil (Zig-Zag)
          ctx.strokeStyle = '#38BDF8';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(originX, originY);
          const coils = 12;
          const springLen = currentY - originY - 30;
          for (let i = 0; i <= coils; i++) {
            const y = originY + (springLen / coils) * i;
            const xOffset = i === 0 || i === coils ? 0 : (i % 2 === 0 ? 18 : -18);
            ctx.lineTo(originX + xOffset, y);
          }
          ctx.stroke();

          // Draw Mass Block
          ctx.fillStyle = '#6366F1';
          ctx.beginPath();
          ctx.roundRect(originX - 35, currentY - 30, 70, 50, 8);
          ctx.fill();
          ctx.strokeStyle = '#A5B4FC';
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 12px sans-serif';
          ctx.fillText(`m = ${massM}kg`, originX - 22, currentY - 2);

          // Formula & Damping Type HUD
          const zeta = dampingC / (2 * Math.sqrt(springK * massM));
          let dampingName = 'Underdamped (অসিলেটিং)';
          if (zeta > 1.05) dampingName = 'Overdamped (ধীর রেসপন্স)';
          else if (zeta >= 0.95) dampingName = 'Critically Damped (আদর্শ)';

          ctx.fillStyle = '#E2E8F0';
          ctx.font = '13px monospace';
          ctx.fillText(`Harmonic Oscillator: mẍ + cẋ + kx = 0`, 30, 40);
          ctx.fillStyle = '#10B981';
          ctx.fillText(`Damping Ratio ζ = ${zeta.toFixed(2)} [${dampingName}]`, 30, 60);
          ctx.fillStyle = '#F59E0B';
          ctx.fillText(`Natural Frequency ω0 = ${Math.sqrt(springK / massM).toFixed(2)} rad/s`, 30, 80);

        } else if (mechanicsType === 'projectile') {
          // Projectile Motion with Vectors
          const originX = 60;
          const originY = h - 60;
          
          // Ground line
          ctx.strokeStyle = '#10B981';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(20, originY);
          ctx.lineTo(w - 20, originY);
          ctx.stroke();

          const rad = (projAngle * Math.PI) / 180;
          const vx = projVelocity * Math.cos(rad);
          const vy = projVelocity * Math.sin(rad);
          const totalFlightTime = (2 * vy) / projGravity;
          const maxRange = vx * totalFlightTime;
          const maxHeight = (vy * vy) / (2 * projGravity);

          const scaleX = (w - 140) / Math.max(maxRange, 100);
          const scaleY = (h - 120) / Math.max(maxHeight * 1.3, 50);

          // Parabolic Path
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          ctx.beginPath();
          for (let t = 0; t <= totalFlightTime; t += 0.05) {
            const px = vx * t;
            const py = vy * t - 0.5 * projGravity * t * t;
            const drawX = originX + px * scaleX;
            const drawY = originY - py * scaleY;
            if (t === 0) ctx.moveTo(drawX, drawY);
            else ctx.lineTo(drawX, drawY);
          }
          ctx.stroke();
          ctx.setLineDash([]);

          const currentT = projTime % totalFlightTime;
          const currX = vx * currentT;
          const currY = vy * currentT - 0.5 * projGravity * currentT * currentT;
          const drawX = originX + currX * scaleX;
          const drawY = originY - Math.max(0, currY) * scaleY;

          // Ball
          ctx.fillStyle = '#F59E0B';
          ctx.beginPath();
          ctx.arc(drawX, drawY, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Vector Arrows
          ctx.strokeStyle = '#EC4899';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(drawX, drawY);
          ctx.lineTo(drawX + vx * 0.4, drawY - (vy - projGravity * currentT) * 0.4);
          ctx.stroke();

          ctx.fillStyle = '#E2E8F0';
          ctx.font = '13px monospace';
          ctx.fillText(`Angle: ${projAngle}° | Speed: ${projVelocity} m/s | g: ${projGravity} m/s²`, originX, 40);
          ctx.fillStyle = '#10B981';
          ctx.fillText(`Max Range: ${maxRange.toFixed(1)} m | Max Height: ${maxHeight.toFixed(1)} m`, originX, 60);
          ctx.fillStyle = '#F59E0B';
          ctx.fillText(`Flight Time: ${totalFlightTime.toFixed(2)} s`, originX, 80);
        }
      }

      // ==========================================
      // 3. MATRIX TRANSFORMATIONS & LINEAR ALGEBRA
      // ==========================================
      else if (activeCategory === 'matrix') {
        const originX = w / 2;
        const originY = h / 2;
        const gridSpacing = 30;
        const maxRange = 6;

        // Transformation Matrix T = [A, B; C, D]
        // [x'] = [A  B] [x]
        // [y']   [C  D] [y]

        // Draw Transformed Grid Lines
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.35)';

        for (let i = -maxRange; i <= maxRange; i++) {
          // Vertical Transformed Grid Lines (x = const)
          ctx.beginPath();
          for (let j = -maxRange; j <= maxRange; j += 0.5) {
            const tx = matrixA * i + matrixB * j;
            const ty = matrixC * i + matrixD * j;
            const screenX = originX + tx * gridSpacing;
            const screenY = originY - ty * gridSpacing;
            if (j === -maxRange) ctx.moveTo(screenX, screenY);
            else ctx.lineTo(screenX, screenY);
          }
          ctx.stroke();

          // Horizontal Transformed Grid Lines (y = const)
          ctx.beginPath();
          for (let j = -maxRange; j <= maxRange; j += 0.5) {
            const tx = matrixA * j + matrixB * i;
            const ty = matrixC * j + matrixD * i;
            const screenX = originX + tx * gridSpacing;
            const screenY = originY - ty * gridSpacing;
            if (j === -maxRange) ctx.moveTo(screenX, screenY);
            else ctx.lineTo(screenX, screenY);
          }
          ctx.stroke();
        }

        // Draw Original Reference Axes (Faint)
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(30, originY);
        ctx.lineTo(w - 30, originY);
        ctx.moveTo(originX, 30);
        ctx.lineTo(originX, h - 30);
        ctx.stroke();

        // Transformed Unit Square Area (Determinant Visualization)
        ctx.fillStyle = 'rgba(236, 72, 153, 0.25)';
        ctx.strokeStyle = '#EC4899';
        ctx.lineWidth = 2;
        ctx.beginPath();
        const p0 = { x: originX, y: originY };
        const p1 = { x: originX + matrixA * gridSpacing, y: originY - matrixC * gridSpacing };
        const p2 = { x: originX + (matrixA + matrixB) * gridSpacing, y: originY - (matrixC + matrixD) * gridSpacing };
        const p3 = { x: originX + matrixB * gridSpacing, y: originY - matrixD * gridSpacing };

        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineTo(p3.x, p3.y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Draw Unit Vectors: i-hat -> [A, C], j-hat -> [B, D]
        // i-hat (Transformed Red/Pink)
        ctx.strokeStyle = '#F43F5E';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(originX, originY);
        ctx.lineTo(p1.x, p1.y);
        ctx.stroke();

        // j-hat (Transformed Emerald)
        ctx.strokeStyle = '#10B981';
        ctx.beginPath();
        ctx.moveTo(originX, originY);
        ctx.lineTo(p3.x, p3.y);
        ctx.stroke();

        // Vector labels
        ctx.fillStyle = '#F43F5E';
        ctx.font = 'bold 12px monospace';
        ctx.fillText(`î → [${matrixA.toFixed(1)}, ${matrixC.toFixed(1)}]`, p1.x + 8, p1.y - 6);

        ctx.fillStyle = '#10B981';
        ctx.fillText(`ĵ → [${matrixB.toFixed(1)}, ${matrixD.toFixed(1)}]`, p3.x + 8, p3.y - 6);

        // Determinant Math
        const det = matrixA * matrixD - matrixB * matrixC;
        const trace = matrixA + matrixD;

        // Eigenvalues (Characteristic Eq: λ² - Trace*λ + Det = 0)
        const disc = trace * trace - 4 * det;
        let eigenText = '';
        if (disc >= 0) {
          const l1 = (trace + Math.sqrt(disc)) / 2;
          const l2 = (trace - Math.sqrt(disc)) / 2;
          eigenText = `Real λ₁ = ${l1.toFixed(2)}, λ₂ = ${l2.toFixed(2)}`;
        } else {
          eigenText = `Complex Eigenvalues (Rotation & Scale)`;
        }

        // HUD
        ctx.fillStyle = '#E2E8F0';
        ctx.font = '13px monospace';
        ctx.fillText(`Linear Transformation Matrix: [ [${matrixA}, ${matrixB}], [${matrixC}, ${matrixD}] ]`, 30, 40);
        ctx.fillStyle = det < 0 ? '#F43F5E' : '#38BDF8';
        ctx.fillText(`Determinant det(A) = ${det.toFixed(2)} (Area Scaling ${det < 0 ? '[Orientation Inverted]' : ''})`, 30, 60);
        ctx.fillStyle = '#FBBF24';
        ctx.fillText(`Eigenvalues: ${eigenText}`, 30, 80);
      }

      // ==========================================
      // 4. TRIGONOMETRY & GEOMETRY (Unit Circle & Wave)
      // ==========================================
      else if (activeCategory === 'trigonometry') {
        const circleCenterX = 180;
        const circleCenterY = h / 2;
        const radius = 110;

        const rad = (trigAngle * Math.PI) / 180;
        const px = circleCenterX + radius * Math.cos(rad);
        const py = circleCenterY - radius * Math.sin(rad);

        // Unit Circle
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(circleCenterX, circleCenterY, radius, 0, Math.PI * 2);
        ctx.stroke();

        // Axes
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(circleCenterX - radius - 30, circleCenterY);
        ctx.lineTo(circleCenterX + radius + 30, circleCenterY);
        ctx.moveTo(circleCenterX, circleCenterY - radius - 30);
        ctx.lineTo(circleCenterX, circleCenterY + radius + 30);
        ctx.stroke();

        // Right-Angled Triangle inside Circle
        ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
        ctx.beginPath();
        ctx.moveTo(circleCenterX, circleCenterY);
        ctx.lineTo(px, circleCenterY);
        ctx.lineTo(px, py);
        ctx.closePath();
        ctx.fill();

        // Cosine Projection (Horizontal Base - Blue)
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(circleCenterX, circleCenterY);
        ctx.lineTo(px, circleCenterY);
        ctx.stroke();

        // Sine Projection (Vertical Altitude - Rose/Pink)
        ctx.strokeStyle = '#F43F5E';
        ctx.beginPath();
        ctx.moveTo(px, circleCenterY);
        ctx.lineTo(px, py);
        ctx.stroke();

        // Hypotenuse (Radius - White)
        ctx.strokeStyle = '#E2E8F0';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(circleCenterX, circleCenterY);
        ctx.lineTo(px, py);
        ctx.stroke();

        // Angle Arc Indicator
        ctx.strokeStyle = '#FBBF24';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(circleCenterX, circleCenterY, 30, 0, -rad, true);
        ctx.stroke();

        // Tangent Line projection
        const tanVal = Math.tan(rad);
        if (Math.abs(tanVal) < 4) {
          const tanEndX = circleCenterX + radius;
          const tanEndY = circleCenterY - radius * tanVal;
          ctx.strokeStyle = '#10B981';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(circleCenterX + radius, circleCenterY);
          ctx.lineTo(tanEndX, tanEndY);
          ctx.stroke();
        }

        // Connecting Line to Continuous Sine Wave on Right
        const waveStartX = 340;
        ctx.strokeStyle = 'rgba(244, 63, 94, 0.6)';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(waveStartX, py);
        ctx.stroke();
        ctx.setLineDash([]);

        // Real-Time Generated Sine Wave
        ctx.strokeStyle = '#F43F5E';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (let x = 0; x < w - waveStartX - 20; x += 2) {
          const waveRad = rad - (x * 0.03);
          const wy = circleCenterY - radius * Math.sin(waveRad);
          const wx = waveStartX + x;
          if (x === 0) ctx.moveTo(wx, wy);
          else ctx.lineTo(wx, wy);
        }
        ctx.stroke();

        // Wave Axis
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(waveStartX, circleCenterY);
        ctx.lineTo(w - 20, circleCenterY);
        ctx.stroke();

        // Numeric Values HUD
        const sinV = Math.sin(rad);
        const cosV = Math.cos(rad);

        ctx.fillStyle = '#E2E8F0';
        ctx.font = '13px monospace';
        ctx.fillText(`Angle θ = ${trigAngle.toFixed(1)}° (${rad.toFixed(2)} rad)`, 30, 40);
        ctx.fillStyle = '#F43F5E';
        ctx.fillText(`sin(θ) = ${sinV.toFixed(3)} [Vertical]`, 30, 60);
        ctx.fillStyle = '#38BDF8';
        ctx.fillText(`cos(θ) = ${cosV.toFixed(3)} [Horizontal]`, 30, 80);
        ctx.fillStyle = '#10B981';
        ctx.fillText(`tan(θ) = ${Math.abs(tanVal) > 50 ? '±∞' : tanVal.toFixed(3)}`, 30, 100);
      }

      // ==========================================
      // 5. CALCULUS, ODE & PDE (1D Heat / Slope Fields / Riemann)
      // ==========================================
      else if (activeCategory === 'calculus_ode_pde') {
        if (calculusType === 'pde_heat') {
          // 1D HEAT DIFFUSION PDE: ∂u/∂t = α ∂²u/∂x²
          const originY = h - 60;
          const barStartX = 80;
          const barEndX = w - 80;
          const barWidth = barEndX - barStartX;
          const stepX = barWidth / (heatGrid.length - 1);

          // Heatmap visual bar
          const barH = 30;
          for (let i = 0; i < heatGrid.length - 1; i++) {
            const temp = (heatGrid[i] + heatGrid[i + 1]) / 2;
            const ratio = Math.max(0, Math.min(1, temp / 100));
            // Color from blue (cold) to red/yellow (hot)
            const r = Math.floor(ratio * 255);
            const g = Math.floor((1 - Math.abs(ratio - 0.5) * 2) * 180);
            const b = Math.floor((1 - ratio) * 255);
            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            ctx.fillRect(barStartX + i * stepX, originY - 140, stepX + 1, barH);
          }

          // Draw Continuous Temperature Profile Curve
          ctx.strokeStyle = '#F59E0B';
          ctx.lineWidth = 3;
          ctx.beginPath();
          for (let i = 0; i < heatGrid.length; i++) {
            const px = barStartX + i * stepX;
            const py = originY - (heatGrid[i] / 100) * 180;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.stroke();

          // Fill Under Temperature Curve
          ctx.lineTo(barEndX, originY);
          ctx.lineTo(barStartX, originY);
          ctx.closePath();
          ctx.fillStyle = 'rgba(245, 158, 11, 0.15)';
          ctx.fill();

          // Axis & Ground
          ctx.strokeStyle = '#475569';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(barStartX, originY);
          ctx.lineTo(barEndX, originY);
          ctx.stroke();

          ctx.fillStyle = '#E2E8F0';
          ctx.font = '13px monospace';
          ctx.fillText(`🔥 1D Heat Equation PDE: ∂u/∂t = α (∂²u/∂x²)`, 30, 40);
          ctx.fillStyle = '#38BDF8';
          ctx.fillText(`Thermal Diffusivity α = ${pdeDiffusionRate.toFixed(2)} | Tap/Click on bar to add heat!`, 30, 60);
          ctx.fillStyle = '#94A3B8';
          ctx.fillText(`Laplacian spatial second-derivative smooths gradients over time.`, 30, 80);

        } else if (calculusType === 'ode_slope') {
          // ODE SLOPE FIELD & PHASE PORTRAIT: dy/dx = f(x, y)
          const centerX = w / 2;
          const centerY = h / 2;
          const scale = 25;

          // Compute slope for given (x, y)
          const slopeFunc = (x: number, y: number) => {
            if (odeFunc === 'vortex') return -x / (y || 0.001); // dy/dx = -x/y (circles)
            if (odeFunc === 'linear') return y - x; // dy/dx = y - x
            return Math.sin(x) - 0.5 * y; // oscillator
          };

          // Draw vector slope segments
          ctx.strokeStyle = '#475569';
          ctx.lineWidth = 1.5;

          for (let gx = -8; gx <= 8; gx += 0.8) {
            for (let gy = -5; gy <= 5; gy += 0.8) {
              const m = slopeFunc(gx, gy);
              const angle = Math.atan(m);
              const segLen = 8;
              const sx = centerX + gx * scale;
              const sy = centerY - gy * scale;

              const dx = Math.cos(angle) * segLen;
              const dy = Math.sin(angle) * segLen;

              ctx.beginPath();
              ctx.moveTo(sx - dx, sy + dy);
              ctx.lineTo(sx + dx, sy - dy);
              ctx.stroke();
            }
          }

          // Draw sample solution trajectories (Streamlines)
          const seeds = [-3, -1, 1, 3];
          ctx.strokeStyle = '#38BDF8';
          ctx.lineWidth = 2.5;

          seeds.forEach((seedY) => {
            let cx = -6;
            let cy = seedY;
            const dt = 0.08;

            ctx.beginPath();
            for (let step = 0; step < 160; step++) {
              const sx = centerX + cx * scale;
              const sy = centerY - cy * scale;
              if (step === 0) ctx.moveTo(sx, sy);
              else ctx.lineTo(sx, sy);

              const slope = slopeFunc(cx, cy);
              cx += dt;
              cy += slope * dt;
              if (Math.abs(cy) > 8 || Math.abs(cx) > 8) break;
            }
            ctx.stroke();
          });

          ctx.fillStyle = '#E2E8F0';
          ctx.font = '13px monospace';
          ctx.fillText(`📈 First-Order ODE Direction Field: dy/dx = f(x, y)`, 30, 40);
          ctx.fillStyle = '#38BDF8';
          ctx.fillText(`System: ${odeFunc === 'vortex' ? 'dy/dx = -x/y (Rotational Invariance)' : odeFunc === 'linear' ? 'dy/dx = y - x' : 'dy/dx = sin(x) - 0.5y'}`, 30, 60);

        } else if (calculusType === 'riemann') {
          // RIEMANN INTEGRAL
          const originX = 60;
          const originY = h - 60;
          const scaleX = (w - 120) / (Math.PI * 2);
          const scaleY = 140;

          const f = (x: number) => Math.sin(x) * 0.8 + 0.9;
          const xMin = 0;
          const xMax = Math.PI * 2;
          const dx = (xMax - xMin) / riemannSlices;

          ctx.fillStyle = 'rgba(236, 72, 153, 0.35)';
          ctx.strokeStyle = '#F43F5E';
          ctx.lineWidth = 1.5;

          for (let i = 0; i < riemannSlices; i++) {
            const x = xMin + i * dx;
            const midX = x + dx / 2;
            const heightVal = f(midX);
            const rectX = originX + x * scaleX;
            const rectW = dx * scaleX;
            const rectH = heightVal * scaleY;
            const rectY = originY - rectH;

            ctx.fillRect(rectX, rectY, rectW, rectH);
            ctx.strokeRect(rectX, rectY, rectW, rectH);
          }

          // Smooth curve
          ctx.strokeStyle = '#38BDF8';
          ctx.lineWidth = 3.5;
          ctx.beginPath();
          for (let px = 0; px <= (w - 120); px += 2) {
            const mathX = px / scaleX;
            const mathY = f(mathX);
            const drawX = originX + px;
            const drawY = originY - mathY * scaleY;
            if (px === 0) ctx.moveTo(drawX, drawY);
            else ctx.lineTo(drawX, drawY);
          }
          ctx.stroke();

          ctx.fillStyle = '#E2E8F0';
          ctx.font = '13px monospace';
          ctx.fillText(`Riemann Sum Integral: ∫ f(x) dx (Slices n = ${riemannSlices})`, 30, 40);
          ctx.fillStyle = '#F43F5E';
          ctx.fillText(`Approximated Area ≈ ${((xMax - xMin) * 0.9).toFixed(3)} units²`, 30, 60);
        }
      }

      // ==========================================
      // 6. FOURIER SERIES & HARMONICS
      // ==========================================
      else if (activeCategory === 'fourier') {
        const centerY = h / 2;
        const originX = 140;
        let curX = originX;
        let curY = centerY;

        for (let i = 0; i < fourierHarmonics; i++) {
          const n = fourierWaveShape === 'square' ? (i * 2 + 1) : (i + 1);
          const radius = fourierWaveShape === 'square' ? 60 * (4 / (n * Math.PI)) : 50 * (2 / (n * Math.PI));
          const prevX = curX;
          const prevY = curY;

          curX += radius * Math.cos(n * time * fourierSpeed);
          curY += radius * Math.sin(n * time * fourierSpeed);

          ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(prevX, prevY, radius, 0, Math.PI * 2);
          ctx.stroke();

          ctx.strokeStyle = '#38BDF8';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(prevX, prevY);
          ctx.lineTo(curX, curY);
          ctx.stroke();
        }

        const waveStartX = 280;
        ctx.strokeStyle = 'rgba(244, 63, 94, 0.6)';
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(curX, curY);
        ctx.lineTo(waveStartX, curY);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.strokeStyle = '#10B981';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (let x = 0; x < w - waveStartX - 20; x += 2) {
          let waveY = 0;
          for (let i = 0; i < fourierHarmonics; i++) {
            const n = fourierWaveShape === 'square' ? (i * 2 + 1) : (i + 1);
            const radius = fourierWaveShape === 'square' ? 60 * (4 / (n * Math.PI)) : 50 * (2 / (n * Math.PI));
            waveY += radius * Math.sin(n * (time * fourierSpeed - x * 0.03));
          }
          const plotX = waveStartX + x;
          const plotY = centerY + waveY;
          if (x === 0) ctx.moveTo(plotX, plotY);
          else ctx.lineTo(plotX, plotY);
        }
        ctx.stroke();

        ctx.fillStyle = '#E2E8F0';
        ctx.font = '13px monospace';
        ctx.fillText(`Fourier Series Synthesis (Harmonics N = ${fourierHarmonics})`, 30, 40);
        ctx.fillStyle = '#10B981';
        ctx.fillText(`Waveform: ${fourierWaveShape === 'square' ? 'Square Wave ∑ sin((2k+1)t)/(2k+1)' : 'Sawtooth Wave ∑ (-1)ⁿ⁺¹ sin(nt)/n'}`, 30, 60);
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [
    activeCategory,
    robotMode,
    robotTheta1,
    robotTheta2,
    targetPos,
    armLength1,
    armLength2,
    showWorkspace,
    mechanicsType,
    springK,
    dampingC,
    massM,
    projAngle,
    projVelocity,
    projGravity,
    isSimulatingPhysics,
    projTime,
    matrixA,
    matrixB,
    matrixC,
    matrixD,
    trigAngle,
    calculusType,
    pdeDiffusionRate,
    heatGrid,
    odeFunc,
    riemannSlices,
    fourierHarmonics,
    fourierSpeed,
    fourierWaveShape,
    isCustomCodeActive
  ]);

  const getCurrentSimulationShareData = (): SimulationShareData => {
    switch (activeCategory) {
      case 'robotics':
        return {
          id: 'robotics-kinematics',
          titleBn: 'রোবোটিক্স কাইনামেটিক্স (FK/IK) ও মেকাট্রনিক্স ল্যাব',
          titleEn: '2-DOF/3-DOF Robotics Manipulator & Inverse Kinematics Lab',
          categoryName: 'রোবোটিক্স ও মেকাট্রনিক্স',
          equations: [
            'Inverse Kinematics: cos(θ2) = (x² + y² - L1² - L2²) / (2 L1 L2)',
            'Forward Kinematics: x = L1 cos(θ1) + L2 cos(θ1 + θ2), y = L1 sin(θ1) + L2 sin(θ1 + θ2)',
            'Jacobian Singularity: det(J) = L1 L2 sin(θ2)'
          ],
          keyFeatures: [
            'রিয়েল-টাইম মাউস/টাচ ড্র্যাগিং ইনভার্স কাইনামেটিক্স টার্গেট ট্র্যাকিং',
            'ফরওয়ার্ড কাইনামেটিক্স জয়েন্ট কন্ট্রোল ও ওয়ার্কস্পেস সিঙ্গুলারিটি ডিটেকশন',
            'এইচটিএমএল৫ ক্যানভাসে ভেক্টর জয়েন্ট মেকানিক্স রেন্ডারিং'
          ],
          sampleCode: `function solveIK(x, y, L1, L2) {\n  const D = (x*x + y*y - L1*L1 - L2*L2) / (2*L1*L2);\n  const theta2 = Math.atan2(Math.sqrt(Math.max(0, 1 - D*D)), D);\n  const theta1 = Math.atan2(y, x) - Math.atan2(L2*Math.sin(theta2), L1 + L2*Math.cos(theta2));\n  return { theta1: (theta1 * 180) / Math.PI, theta2: (theta2 * 180) / Math.PI };\n}`,
          canvasRef
        };
      case 'mechanics':
        return {
          id: 'physics-mechanics-chaos',
          titleBn: 'পদার্থবিজ্ঞান, কেওটিক ডাবল পেন্ডুলাম ও মেকানিক্স ল্যাব',
          titleEn: 'Nonlinear Double Pendulum Chaos & Damped Oscillators',
          categoryName: 'পদার্থবিজ্ঞান ও বলবিদ্যা',
          equations: [
            'Euler-Lagrange Equation: d/dt(∂L/∂q̇) - ∂L/∂q = 0',
            'Damped Harmonic Motion: m(d²x/dt²) + c(dx/dt) + kx = 0',
            'Ballistic Trajectory: y(t) = v0 t sin(θ) - (1/2) g t²'
          ],
          keyFeatures: [
            'কেওটিক ডাবল পেন্ডুলামের লেগ্রাঞ্জিয়ান ট্র্যাজেক্টরি পাথ ট্রেসিং',
            'স্প্রিং-ম্যাস ড্যাম্পড অসিলেটর ও রেজোন্যান্স রেসপন্স',
            'ব্যালিস্টিক প্রজেক্টাইল গতিপথ ও অভিকর্ষজ ত্বরণ সিমুলেশন'
          ],
          sampleCode: `// Spring-Damper Harmonic state update\nconst omega0 = Math.sqrt(k / m);\nconst zeta = c / (2 * Math.sqrt(m * k));\nconst omegaD = omega0 * Math.sqrt(Math.abs(1 - zeta * zeta));\nconst x = A * Math.exp(-zeta * omega0 * t) * Math.cos(omegaD * t);`,
          canvasRef
        };
      case 'matrix':
        return {
          id: 'linear-algebra-matrix',
          titleBn: 'লিনিয়ার অ্যালজেব্রা ম্যাট্রিক্স ট্রান্সফর্মেশন ও আইগেনভেক্টর',
          titleEn: 'Linear Algebra 2D Transformations & Eigenvector Spaces',
          categoryName: 'লিনিয়ার অ্যালজেব্রা ও ডাটা সায়েন্স',
          equations: [
            'Transformation: v\' = A v = [ [a, b], [c, d] ] [x, y]ᵀ',
            'Eigenvalues: det(A - λI) = λ² - Tr(A)λ + det(A) = 0',
            'Determinant Area: det(A) = ad - bc'
          ],
          keyFeatures: [
            'ম্যাট্রিক্স শিয়ারিং, স্কেলিং ও রোটেশনের লাইভ গ্রিড অ্যানিমেশন',
            'বেসিস ভেক্টর (i-hat, j-hat) ও আইগেনভেক্টর লাইভ প্লটিং',
            'ডিটারমিন্যান্ট এরিয়া স্কেলিং ও ওরিয়েন্টেশন ভিজুয়ালাইজার'
          ],
          sampleCode: `const det = a * d - b * c;\nconst trace = a + d;\nconst disc = trace * trace - 4 * det;\nconst lambda1 = (trace + Math.sqrt(Math.max(0, disc))) / 2;\nconst lambda2 = (trace - Math.sqrt(Math.max(0, disc))) / 2;`,
          canvasRef
        };
      case 'trigonometry':
        return {
          id: 'trigonometry-unit-circle',
          titleBn: 'ইন্টারঅ্যাক্টিভ ত্রিকোণমিতি ও ইউনিট সার্কেল ল্যাব',
          titleEn: 'Trigonometry Unit Circle & Real-time Sine Wave Synthesis',
          categoryName: 'ত্রিকোণমিতি ও জ্যামিতি',
          equations: [
            'Pythagorean Identity: sin²(θ) + cos²(θ) = 1',
            'Tangent: tan(θ) = sin(θ) / cos(θ)',
            'Wave Function: y(t) = A sin(2π f t + φ)'
          ],
          keyFeatures: [
            'ইন্টারেক্টিভ ইউনিট সার্কেলে কোণ ঘূর্ণন ও সাইন/কোসাইন প্রজেকশন',
            'রিয়েল-টাইমে সাইন ওয়েভ গ্রাফ প্লটিং',
            'রেডিয়ান ও ডিগ্রি কনভার্সন মেট্রিক্স'
          ],
          sampleCode: `const rad = (deg * Math.PI) / 180;\nconst sinVal = Math.sin(rad);\nconst cosVal = Math.cos(rad);\nconst tanVal = Math.tan(rad);`,
          canvasRef
        };
      case 'calculus_ode_pde':
        return {
          id: 'calculus-ode-heat-pde',
          titleBn: 'ক্যালকুলাস, ODE স্লোপ ফিল্ড ও 1D Heat PDE সিমুলেটর',
          titleEn: 'Calculus, Direction Slope Fields & 1D Heat Diffusion PDE',
          categoryName: 'ক্যালকুলাস ও ডিফারেনশিয়াল সমীকরণ',
          equations: [
            '1D Heat PDE: ∂u/∂t = α (∂²u/∂x²)',
            'First Order ODE: dy/dx = f(x, y)',
            'Riemann Integral: ∫ f(x)dx ≈ Σ f(xᵢ) Δx'
          ],
          keyFeatures: [
            'ক্লিক করে তাপ দেওয়ার ইন্টারঅ্যাক্টিভ 1D হিট ডিফিউশন সিমুলেশন',
            'স্লোপ ফিল্ড ভেক্টর ডিরেকশন ও পার্টিকেল ট্র্যাকিং',
            'রিম্যান সাম ইন্টিগ্রেশন স্লাইস ভিজুয়ালাইজার'
          ],
          sampleCode: `// Heat PDE Finite Difference step\nfor (let i = 1; i < grid.length - 1; i++) {\n  nextGrid[i] = grid[i] + alpha * (grid[i-1] - 2*grid[i] + grid[i+1]);\n}`,
          canvasRef
        };
      case 'fourier':
        return {
          id: 'fourier-series-epicycles',
          titleBn: 'ফুরিয়ার সিরিজ ও এপিসাইকেল হারমোনিক্স অ্যানিমেশন',
          titleEn: 'Fourier Series Harmonic Epicycles & Signal Decomposition',
          categoryName: 'সিগন্যাল ও ফুরিয়ার অ্যানালাইসিস',
          equations: [
            'Fourier Series: f(t) = a₀/2 + Σ [ aₙ cos(nωt) + bₙ sin(nωt) ]',
            'Square Wave: f(t) = (4/π) Σ [ sin((2k-1)t) / (2k-1) ]',
            'Sawtooth Wave: f(t) = (2/π) Σ [ (-1)ᵏ⁺¹ sin(kt) / k ]'
          ],
          keyFeatures: [
            '3Blue1Brown স্টাইলে এপিসাইকেল সার্কেল কম্বিনেশন অ্যানিমেশন',
            'হারমোনিক্স সংখ্যা (১ থেকে ২৫) রিয়েল-টাইম কন্ট্রোল',
            'স্কয়ার ও স-টুথ ওয়েভ সিন্থেসিস'
          ],
          sampleCode: `let y = 0;\nfor (let n = 1; n <= harmonics; n += 2) {\n  const r = 60 * (4 / (n * Math.PI));\n  y += r * Math.sin(n * time);\n}`,
          canvasRef
        };
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-neutral-900 via-indigo-950/30 to-neutral-900 border border-indigo-900/40 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="max-w-4xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            <Atom className="w-3.5 h-3.5 text-indigo-400" />
            <span>মাল্টি-ডিসিপ্লিনারি স্টেম ল্যাব (STEM & Robotics Engine)</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            পদার্থবিজ্ঞান, মেকানিক্স, ম্যাট্রিক্স, ক্যালকুলাস, ODE/PDE ও রোবোটিক্স সিমুলেশন
          </h2>
          <p className="text-neutral-300 text-sm sm:text-base leading-relaxed">
            ম্যাথমেটিক্স, ফিজিক্স, রোবোটিক্স কাইনামেটিক্স এবং ডিফারেনশিয়াল সমীকরণের লাইভ ভিজ্যুয়াল সিমুলেশন তৈরি করে এডটেক ও বিদেশি গবেষণা প্রতিষ্ঠানে <span className="text-emerald-400 font-semibold">৳২,৫০০ থেকে ৳১৫,০০০+</span> মূল্যে সেল করুন।
          </p>
        </div>
      </div>

      {/* Main Discipline Tabs Bar */}
      <div className="flex flex-wrap gap-2 items-center">
        {[
          { id: 'robotics', label: '🤖 রোবোটিক্স ও ইনভার্স কাইনামেটিক্স', icon: Bot, badge: 'IK/FK' },
          { id: 'mechanics', label: '🔬 পদার্থবিজ্ঞান ও মেকানিক্স (Chaos/Spring)', icon: Activity, badge: 'Physics' },
          { id: 'matrix', label: '🧮 ম্যাট্রিক্স ট্রান্সফর্মেশন ও ভেক্টর', icon: Grid, badge: 'LinAlg' },
          { id: 'trigonometry', label: '📐 ত্রিকোণমিতি ও ইউনিট সার্কেল', icon: CircleDot, badge: 'Trig' },
          { id: 'calculus_ode_pde', label: '📈 ক্যালকুলাস, ODE ও Heat PDE', icon: Flame, badge: 'DiffEq' },
          { id: 'fourier', label: '🌊 ফুরিয়ার সিরিজ ও হারমোনিক্স', icon: Layers, badge: 'Waves' },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id as SimulationCategory)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 ring-1 ring-indigo-400'
                  : 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:bg-neutral-800 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Voice Recorder & Audio Editing Studio Panel */}
      {isVoiceStudioOpen && (
        <VoiceRecorderStudio
          simulationTitle={
            activeCategory === 'robotics' ? 'Robotics Kinematics' :
            activeCategory === 'mechanics' ? 'Physics Mechanics & Chaos' :
            activeCategory === 'matrix' ? 'Linear Algebra Matrix' :
            activeCategory === 'trigonometry' ? 'Trigonometry Lab' :
            activeCategory === 'calculus_ode_pde' ? 'Calculus & Heat PDE' : 'Fourier Series'
          }
          isOpen={isVoiceStudioOpen}
          onToggle={() => setIsVoiceStudioOpen(false)}
        />
      )}

      {/* Interactive Stage & Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Canvas & Contextual Controls */}
        <div className="lg:col-span-8 space-y-4">
          
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 shadow-2xl relative">
            <div className="flex flex-wrap items-center justify-between pb-3 border-b border-neutral-800 mb-3 text-xs gap-2">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-semibold text-neutral-200">
                  {activeCategory === 'robotics' && 'রোবোটিক আর্ম ইনভার্স কাইনামেটিক্স লাইভ ক্যানভাস'}
                  {activeCategory === 'mechanics' && 'ফিজিক্স মেকানিক্স ও ডাইনামিক্স ইঞ্জিন'}
                  {activeCategory === 'matrix' && '2D লিনিয়ার ট্রান্সফর্মেশন ও আইগেনভেক্টর ভিজুয়ালাইজার'}
                  {activeCategory === 'trigonometry' && 'ইন্টারঅ্যাক্টিভ ইউনিট সার্কেল ও সাইন ওয়েভ গ্রাফ'}
                  {activeCategory === 'calculus_ode_pde' && 'ক্যালকুলাস ও PDE / ODE ডিফারেনশিয়াল ল্যাব'}
                  {activeCategory === 'fourier' && 'ফুরিয়ার এপিসাইকেল হারমোনিক ওয়েভ সিন্থেসাইজার'}
                </span>
              </div>
              
              {/* Voice, Whiteboard, Code Editor & Quick Social Share Buttons */}
              <div className="flex flex-wrap items-center gap-1.5">
                
                {/* Live Code Editor Toggle */}
                <button
                  onClick={() => setIsCodeEditorOpen(!isCodeEditorOpen)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                    isCodeEditorOpen
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/30 ring-2 ring-indigo-400/40'
                      : isCustomCodeActive
                      ? 'bg-emerald-950 border-emerald-500/50 text-emerald-300 hover:text-white'
                      : 'bg-neutral-950 border-neutral-800 text-indigo-300 hover:border-indigo-700 hover:text-white'
                  }`}
                  title="সিমুলেশনের কোড ও সমীকরণ সরাসরি এডিট করে লাইভ রান করুন"
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>{isCodeEditorOpen ? 'কোড এডিটর খোলা' : isCustomCodeActive ? 'কাস্টম কোড লাইভ' : 'কোড এডিট'}</span>
                </button>

                {/* Voice Recorder Studio Toggle */}
                <button
                  onClick={() => setIsVoiceStudioOpen(!isVoiceStudioOpen)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                    isVoiceStudioOpen
                      ? 'bg-rose-600 border-rose-500 text-white shadow-md shadow-rose-600/30'
                      : 'bg-neutral-950 border-neutral-800 text-rose-400 hover:border-rose-700 hover:text-rose-300'
                  }`}
                  title="ভয়েস রেকর্ডার ও অডিও এডিটিং স্টুডিও খুলুন"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>{isVoiceStudioOpen ? 'রেকর্ডার চালু' : 'ভয়েস রেকর্ড'}</span>
                </button>

                {/* Whiteboard / Annotation Drawing Mode Toggle */}
                <button
                  onClick={() => setIsWhiteboardActive(!isWhiteboardActive)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                    isWhiteboardActive
                      ? 'bg-emerald-600 border-emerald-500 text-white shadow-md shadow-emerald-600/30 ring-2 ring-emerald-400/40'
                      : 'bg-neutral-950 border-neutral-800 text-emerald-400 hover:border-emerald-700 hover:text-emerald-300'
                  }`}
                  title="ক্যানভাসে ড্রয়িং ও হোয়াইটবোর্ড মোড চালু করুন"
                >
                  <PenTool className="w-3.5 h-3.5" />
                  <span>{isWhiteboardActive ? 'হোয়াইটবোর্ড একটিভ' : 'হোয়াইটবোর্ড মোড'}</span>
                </button>

                {/* Social Share Modal Button */}
                <button
                  onClick={() => setIsShareModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-pink-600/20 hover:from-blue-600/30 hover:to-pink-600/30 border border-indigo-500/30 text-indigo-300 hover:text-white transition-all text-xs font-semibold shadow-sm"
                  title="সোস্যাল মিডিয়ায় প্রজেক্ট পোস্ট করুন"
                >
                  <Share2 className="w-3.5 h-3.5 text-pink-400" />
                  <span className="hidden sm:inline">শেয়ার / পোস্ট</span>
                </button>
              </div>
            </div>

            {/* The Canvas Area + Whiteboard Layer */}
            <div className="relative rounded-2xl overflow-hidden border border-neutral-800/80 bg-neutral-950 flex items-center justify-center cursor-crosshair min-h-[370px]">
              <canvas
                ref={canvasRef}
                width={700}
                height={370}
                onMouseDown={handleCanvasInteraction}
                onMouseMove={(e) => { 
                  if (e.buttons === 1) handleCanvasInteraction(e); 
                  else {
                    const canvas = canvasRef.current;
                    if (canvas) {
                      const rect = canvas.getBoundingClientRect();
                      const scaleX = canvas.width / rect.width;
                      const scaleY = canvas.height / rect.height;
                      mousePosRef.current = {
                        x: (e.clientX - rect.left) * scaleX,
                        y: (e.clientY - rect.top) * scaleY,
                        isInteracting: false
                      };
                    }
                  }
                }}
                onMouseUp={() => { mousePosRef.current.isInteracting = false; }}
                onMouseLeave={() => { mousePosRef.current.isInteracting = false; }}
                onTouchStart={handleCanvasInteraction}
                onTouchMove={handleCanvasInteraction}
                onTouchEnd={() => { mousePosRef.current.isInteracting = false; }}
                className="w-full h-auto max-h-[390px] object-contain block"
              />

              {/* Whiteboard Interactive Canvas Layer */}
              <WhiteboardCanvas
                isActive={isWhiteboardActive}
                onClose={() => setIsWhiteboardActive(false)}
                targetCanvasRef={canvasRef}
              />
            </div>

            {/* Contextual Control Sliders & Buttons */}
            <div className="mt-4 pt-4 border-t border-neutral-800">
              
              {/* 1. ROBOTICS CONTROLS */}
              {activeCategory === 'robotics' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="text-neutral-400 block font-medium">কাইনামেটিক্স মোড:</label>
                    <div className="flex rounded-xl bg-neutral-950 p-1 border border-neutral-800">
                      <button
                        onClick={() => setRobotMode('ik')}
                        className={`flex-1 py-1 rounded-lg text-xs font-semibold transition-all ${
                          robotMode === 'ik' ? 'bg-indigo-600 text-white' : 'text-neutral-400'
                        }`}
                      >
                        Inverse (মাউস ট্র্যাকিং)
                      </button>
                      <button
                        onClick={() => setRobotMode('fk')}
                        className={`flex-1 py-1 rounded-lg text-xs font-semibold transition-all ${
                          robotMode === 'fk' ? 'bg-indigo-600 text-white' : 'text-neutral-400'
                        }`}
                      >
                        Forward (জয়েন্ট অ্যাঙ্গেল)
                      </button>
                    </div>
                  </div>

                  {robotMode === 'fk' ? (
                    <>
                      <div className="space-y-1">
                        <div className="flex justify-between text-neutral-400">
                          <span>জয়েন্ট ১ কোণ (θ1):</span>
                          <strong className="text-indigo-400">{robotTheta1}°</strong>
                        </div>
                        <input
                          type="range"
                          min={-90}
                          max={180}
                          value={robotTheta1}
                          onChange={(e) => setRobotTheta1(Number(e.target.value))}
                          className="w-full accent-indigo-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-neutral-400">
                          <span>জয়েন্ট ২ কোণ (θ2):</span>
                          <strong className="text-pink-400">{robotTheta2}°</strong>
                        </div>
                        <input
                          type="range"
                          min={-160}
                          max={160}
                          value={robotTheta2}
                          onChange={(e) => setRobotTheta2(Number(e.target.value))}
                          className="w-full accent-pink-500"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-1">
                        <div className="flex justify-between text-neutral-400">
                          <span>আর্ম দৈর্ঘ্য L1:</span>
                          <strong className="text-white font-mono">{armLength1}px</strong>
                        </div>
                        <input
                          type="range"
                          min={80}
                          max={170}
                          value={armLength1}
                          onChange={(e) => setArmLength1(Number(e.target.value))}
                          className="w-full accent-indigo-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-neutral-400">
                          <span>আর্ম দৈর্ঘ্য L2:</span>
                          <strong className="text-white font-mono">{armLength2}px</strong>
                        </div>
                        <input
                          type="range"
                          min={60}
                          max={150}
                          value={armLength2}
                          onChange={(e) => setArmLength2(Number(e.target.value))}
                          className="w-full accent-pink-500"
                        />
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* 2. MECHANICS CONTROLS */}
              {activeCategory === 'mechanics' && (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2 text-xs">
                    {[
                      { id: 'double_pendulum', label: '১. কেওটিক ডাবল পেন্ডুলাম (Nonlinear Chaos)' },
                      { id: 'spring_damper', label: '২. স্প্রিং-ড্যাম্পার অসিলেটর (Harmonic Motion)' },
                      { id: 'projectile', label: '৩. প্রজেক্টাইল ট্র্যাজেক্টরি (Ballistics)' },
                    ].map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setMechanicsType(m.id as any)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                          mechanicsType === m.id
                            ? 'bg-sky-600 text-white border-sky-400'
                            : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:bg-neutral-800'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>

                  {mechanicsType === 'spring_damper' && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2">
                      <div className="space-y-1">
                        <div className="flex justify-between text-neutral-400">
                          <span>স্প্রিং কনস্ট্যান্ট (k):</span>
                          <strong className="text-white">{springK} N/m</strong>
                        </div>
                        <input
                          type="range"
                          min={5}
                          max={40}
                          value={springK}
                          onChange={(e) => setSpringK(Number(e.target.value))}
                          className="w-full accent-sky-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-neutral-400">
                          <span>ড্যাম্পিং গুণাঙ্ক (c):</span>
                          <strong className="text-white">{dampingC} Ns/m</strong>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={3}
                          step={0.1}
                          value={dampingC}
                          onChange={(e) => setDampingC(Number(e.target.value))}
                          className="w-full accent-emerald-500"
                        />
                      </div>
                      <div className="flex items-center justify-end gap-2 pt-2">
                        <button
                          onClick={() => { springState.current.x = 100; springState.current.v = 0; }}
                          className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium"
                        >
                          স্প্রিং ডিসপ্লেসমেন্ট পুল
                        </button>
                      </div>
                    </div>
                  )}

                  {mechanicsType === 'double_pendulum' && (
                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-neutral-400">
                        লেগ্রাঞ্জিয়ান সমীকরণ নির্ভর সিমুলেশন। ট্র্যাজেক্টরি লাইন নন-লিনিয়ার কেয়স প্রদর্শন করে।
                      </span>
                      <button
                        onClick={() => {
                          dpState.current.th1 = Math.PI / 2 + (Math.random() - 0.5);
                          dpState.current.th2 = Math.PI / 2 + (Math.random() - 0.5);
                          dpState.current.w1 = 0;
                          dpState.current.w2 = 0;
                          setDpTrace([]);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium"
                      >
                        নতুন অ্যাঙ্গেলে রিস্টার্ট
                      </button>
                    </div>
                  )}

                  {mechanicsType === 'projectile' && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2">
                      <div className="space-y-1">
                        <div className="flex justify-between text-neutral-400">
                          <span>নিক্ষেপ কোণ:</span>
                          <strong className="text-white">{projAngle}°</strong>
                        </div>
                        <input
                          type="range"
                          min={10}
                          max={85}
                          value={projAngle}
                          onChange={(e) => setProjAngle(Number(e.target.value))}
                          className="w-full accent-amber-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-neutral-400">
                          <span>বেগ (v):</span>
                          <strong className="text-white">{projVelocity} m/s</strong>
                        </div>
                        <input
                          type="range"
                          min={20}
                          max={100}
                          value={projVelocity}
                          onChange={(e) => setProjVelocity(Number(e.target.value))}
                          className="w-full accent-amber-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-neutral-400">
                          <span>অভিকর্ষ (g):</span>
                          <strong className="text-white">{projGravity} m/s²</strong>
                        </div>
                        <input
                          type="range"
                          min={1.6}
                          max={20}
                          step={0.2}
                          value={projGravity}
                          onChange={(e) => setProjGravity(Number(e.target.value))}
                          className="w-full accent-emerald-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 3. MATRIX TRANSFORMATIONS CONTROLS */}
              {activeCategory === 'matrix' && (
                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-neutral-400">
                        <span>ম্যাট্রিক্স A (x₁):</span>
                        <strong className="text-rose-400 font-mono">{matrixA}</strong>
                      </div>
                      <input
                        type="range"
                        min={-2}
                        max={2}
                        step={0.1}
                        value={matrixA}
                        onChange={(e) => setMatrixA(Number(e.target.value))}
                        className="w-full accent-rose-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-neutral-400">
                        <span>ম্যাট্রিক্স B (y₁):</span>
                        <strong className="text-rose-400 font-mono">{matrixB}</strong>
                      </div>
                      <input
                        type="range"
                        min={-2}
                        max={2}
                        step={0.1}
                        value={matrixB}
                        onChange={(e) => setMatrixB(Number(e.target.value))}
                        className="w-full accent-rose-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-neutral-400">
                        <span>ম্যাট্রিক্স C (x₂):</span>
                        <strong className="text-emerald-400 font-mono">{matrixC}</strong>
                      </div>
                      <input
                        type="range"
                        min={-2}
                        max={2}
                        step={0.1}
                        value={matrixC}
                        onChange={(e) => setMatrixC(Number(e.target.value))}
                        className="w-full accent-emerald-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-neutral-400">
                        <span>ম্যাট্রিক্স D (y₂):</span>
                        <strong className="text-emerald-400 font-mono">{matrixD}</strong>
                      </div>
                      <input
                        type="range"
                        min={-2}
                        max={2}
                        step={0.1}
                        value={matrixD}
                        onChange={(e) => setMatrixD(Number(e.target.value))}
                        className="w-full accent-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      onClick={() => { setMatrixA(1); setMatrixB(0); setMatrixC(0); setMatrixD(1); }}
                      className="px-2.5 py-1 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-300 hover:text-white"
                    >
                      আইডেন্টিটি [I]
                    </button>
                    <button
                      onClick={() => { setMatrixA(0); setMatrixB(-1); setMatrixC(1); setMatrixD(0); }}
                      className="px-2.5 py-1 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-300 hover:text-white"
                    >
                      ৯০° রোটেশন
                    </button>
                    <button
                      onClick={() => { setMatrixA(1); setMatrixB(1.2); setMatrixC(0); setMatrixD(1); }}
                      className="px-2.5 py-1 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-300 hover:text-white"
                    >
                      হরাইজন্টাল শিয়ার
                    </button>
                    <button
                      onClick={() => { setMatrixA(2); setMatrixB(0); setMatrixC(0); setMatrixD(0.5); }}
                      className="px-2.5 py-1 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-300 hover:text-white"
                    >
                      নন-ইউনিফর্ম স্কেলিং
                    </button>
                  </div>
                </div>
              )}

              {/* 4. TRIGONOMETRY CONTROLS */}
              {activeCategory === 'trigonometry' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs items-center">
                  <div className="space-y-1">
                    <div className="flex justify-between text-neutral-400">
                      <span>কোণ θ (Angle):</span>
                      <strong className="text-amber-400 font-mono">{trigAngle.toFixed(0)}°</strong>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={360}
                      value={trigAngle}
                      onChange={(e) => {
                        setTrigAngle(Number(e.target.value));
                        setAutoRotateTrig(false);
                      }}
                      className="w-full accent-amber-500"
                    />
                  </div>

                  <div className="flex items-center justify-center sm:justify-start gap-2 pt-2">
                    <button
                      onClick={() => setAutoRotateTrig(!autoRotateTrig)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                        autoRotateTrig ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-neutral-950 text-neutral-400 border-neutral-800'
                      }`}
                    >
                      {autoRotateTrig ? '✓ অটো রোটেশন চালু' : 'অটো রোটেশন চালু করুন'}
                    </button>
                  </div>

                  <div className="text-neutral-400 text-[11px]">
                    <span>💡 ইউনিট সার্কেলের যেকোনো জায়গায় মাউস ড্র্যাগ করে কোণ মাপুন</span>
                  </div>
                </div>
              )}

              {/* 5. CALCULUS, ODE & PDE CONTROLS */}
              {activeCategory === 'calculus_ode_pde' && (
                <div className="space-y-3 text-xs">
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'pde_heat', label: '🔥 ১D হিট ডিফিউশন PDE (∂u/∂t = α ∇²u)' },
                      { id: 'ode_slope', label: '📈 ODE ডিরেকশন ফিল্ড ও ফেজ পোট্রেট' },
                      { id: 'riemann', label: '∫ রিম্যান সাম ইন্টিগ্রেশন (Definite Integral)' },
                    ].map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setCalculusType(c.id as any)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                          calculusType === c.id
                            ? 'bg-rose-600 text-white border-rose-400'
                            : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:bg-neutral-800'
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>

                  {calculusType === 'pde_heat' && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                      <div className="space-y-1">
                        <div className="flex justify-between text-neutral-400">
                          <span>ডিফিউশন সহগ α:</span>
                          <strong className="text-white font-mono">{pdeDiffusionRate.toFixed(2)}</strong>
                        </div>
                        <input
                          type="range"
                          min={0.1}
                          max={1.0}
                          step={0.05}
                          value={pdeDiffusionRate}
                          onChange={(e) => setPdeDiffusionRate(Number(e.target.value))}
                          className="w-full accent-rose-500"
                        />
                      </div>
                      <div className="flex items-center gap-2 pt-3">
                        <button
                          onClick={() => {
                            const arr = new Array(50).fill(0);
                            for (let i = 20; i <= 30; i++) arr[i] = 100;
                            setHeatGrid(arr);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200"
                        >
                          সেন্টার হিট পালস রিসেট
                        </button>
                      </div>
                    </div>
                  )}

                  {calculusType === 'ode_slope' && (
                    <div className="flex items-center gap-3 pt-1">
                      <label className="text-neutral-400">ফাংশন নির্বাচন:</label>
                      <select
                        value={odeFunc}
                        onChange={(e) => setOdeFunc(e.target.value as any)}
                        className="bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-1.5 text-white"
                      >
                        <option value="vortex">dy/dx = -x/y (সেন্টার সাইকেল)</option>
                        <option value="linear">dy/dx = y - x (লিনিয়ার স্যাডল)</option>
                        <option value="oscillator">dy/dx = sin(x) - 0.5y (নন-লিনিয়ার ড্যাম্পড)</option>
                      </select>
                    </div>
                  )}

                  {calculusType === 'riemann' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div className="space-y-1">
                        <div className="flex justify-between text-neutral-400">
                          <span>রিম্যান স্লাইস (n):</span>
                          <strong className="text-white font-mono">{riemannSlices}</strong>
                        </div>
                        <input
                          type="range"
                          min={4}
                          max={60}
                          value={riemannSlices}
                          onChange={(e) => setRiemannSlices(Number(e.target.value))}
                          className="w-full accent-rose-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 6. FOURIER CONTROLS */}
              {activeCategory === 'fourier' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="flex justify-between text-neutral-400">
                      <span>হারমোনিক্স সংখ্যা (N):</span>
                      <strong className="text-emerald-400 font-mono">{fourierHarmonics}</strong>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={18}
                      value={fourierHarmonics}
                      onChange={(e) => setFourierHarmonics(Number(e.target.value))}
                      className="w-full accent-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-neutral-400 block">ওয়েভের আকার:</label>
                    <select
                      value={fourierWaveShape}
                      onChange={(e) => setFourierWaveShape(e.target.value as any)}
                      className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-2.5 py-1.5 text-white"
                    >
                      <option value="square">স্কয়ার ওয়েভ (Square Wave)</option>
                      <option value="sawtooth">স-টুথ ওয়েভ (Sawtooth Wave)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-neutral-400">
                      <span>অ্যানিমেশন স্পিড:</span>
                      <strong className="text-white font-mono">{fourierSpeed}x</strong>
                    </div>
                    <input
                      type="range"
                      min={0.2}
                      max={2.5}
                      step={0.1}
                      value={fourierSpeed}
                      onChange={(e) => setFourierSpeed(Number(e.target.value))}
                      className="w-full accent-emerald-500"
                    />
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Live Interactive Code & Simulation Script Runner Panel */}
          {isCodeEditorOpen && (
            <LiveSimulationCodeEditor
              category={activeCategory}
              isOpen={isCodeEditorOpen}
              onClose={() => setIsCodeEditorOpen(false)}
              onApplyCustomCode={handleApplyCustomCode}
              isCustomActive={isCustomCodeActive}
              onResetCode={handleResetCustomCode}
            />
          )}

          {/* Quick Invoice & Social Share Action Bar */}
          <div className="bg-neutral-900/70 border border-neutral-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">
                  প্রজেক্টটি আপনার ফেসবুক, গিটহাব, ইউটিউব বা ইনস্টাগ্রামে পোস্ট করবেন?
                </h4>
                <p className="text-xs text-neutral-400">
                  সরাসরি প্রস্তুত পোস্ট ফরম্যাট, হ্যাশট্যাগ ও ক্যানভাস ইমেজ স্ন্যাপশট ডাউনলোড করুন।
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  setIsCodeEditorOpen(!isCodeEditorOpen);
                }}
                className={`whitespace-nowrap px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  isCodeEditorOpen 
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20' 
                    : isCustomCodeActive
                    ? 'bg-emerald-950 border-emerald-500/50 text-emerald-300'
                    : 'bg-neutral-800 border-neutral-700 text-indigo-300 hover:text-white'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>{isCodeEditorOpen ? 'কোড এডিটর খোলা' : 'কোড এডিট ও রান'}</span>
              </button>
              <button
                onClick={() => {
                  setIsVoiceStudioOpen(true);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`whitespace-nowrap px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  isVoiceStudioOpen 
                    ? 'bg-rose-600 border-rose-500 text-white shadow-lg shadow-rose-600/20' 
                    : 'bg-neutral-800 border-neutral-700 text-rose-300 hover:text-white'
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
                <span>ভয়েস রেকর্ডার</span>
              </button>

              <button
                onClick={() => {
                  setIsWhiteboardActive(!isWhiteboardActive);
                }}
                className={`whitespace-nowrap px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  isWhiteboardActive 
                    ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-600/20' 
                    : 'bg-neutral-800 border-neutral-700 text-emerald-300 hover:text-white'
                }`}
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>{isWhiteboardActive ? 'হোয়াইটবোর্ড চালু' : 'হোয়াইটবোর্ড'}</span>
              </button>

              <button
                onClick={() => setIsShareModalOpen(true)}
                className="whitespace-nowrap px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs transition-all shadow-lg shadow-blue-600/20 active:scale-95 flex items-center gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>সোস্যাল মিডিয়া শেয়ার</span>
              </button>

              <button
                onClick={() => {
                  const titleMap: Record<SimulationCategory, string> = {
                    robotics: 'রোবোটিক্স ইনভার্স কাইনামেটিক্স ও মেকাট্রনিক্স সিমুলেশন প্রজেক্ট',
                    mechanics: 'পদার্থবিজ্ঞান ও মেকানিক্স ডাইনামিক্যাল সিমুলেশন প্রজেক্ট',
                    matrix: 'ম্যাট্রিক্স ট্রান্সফর্মেশন ও লিনিয়ার অ্যালজেব্রা ভিজ্যুয়ালাইজার',
                    trigonometry: 'ইন্টারঅ্যাক্টিভ ত্রিকোণমিতি ও জ্যামিতি ভিজ্যুয়াল সফটওয়্যার',
                    calculus_ode_pde: 'ক্যালকুলাস, ODE ও Heat PDE ডিফারেনশিয়াল সিমুলেটর',
                    fourier: 'ফুরিয়ার সিরিজ ও সিগন্যাল প্রসেসিং অ্যানিমেশন প্রজেক্ট'
                  };
                  const amountMap: Record<SimulationCategory, number> = {
                    robotics: 4500,
                    mechanics: 3500,
                    matrix: 2500,
                    trigonometry: 2000,
                    calculus_ode_pde: 4000,
                    fourier: 2500
                  };
                  onSelectForInvoice(titleMap[activeCategory], amountMap[activeCategory]);
                }}
                className="whitespace-nowrap px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-semibold text-xs transition-all shadow-lg shadow-pink-600/20 active:scale-95 flex items-center gap-1.5"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>বিকাশ স্লিপ</span>
              </button>
            </div>
          </div>

          {/* Dedicated Per-Simulation AI Research, Summary & Q&A Panel */}
          <SimulationAiInsightPanel
            simulationKey={
              isCustomCodeActive 
                ? 'custom_code' 
                : activeCategory === 'mechanics'
                ? mechanicsType === 'double_pendulum' ? 'mechanics_double_pendulum' : mechanicsType === 'spring_damper' ? 'mechanics_spring_damper' : 'mechanics_projectile'
                : activeCategory === 'calculus_ode_pde'
                ? calculusType === 'pde_heat' ? 'calculus_pde_heat' : calculusType === 'ode_slope' ? 'calculus_ode_slope' : 'calculus_riemann'
                : activeCategory
            }
            activeCategory={activeCategory}
            onSelectForInvoice={onSelectForInvoice}
          />

        </div>

        {/* Right: STEM Disciplines Earning Roadmap & bKash Pitches */}
        <div className="lg:col-span-4 space-y-4">
          
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>স্টেম ও রোবোটিক্স ইনকাম ট্র্যাক</span>
              </h3>
            </div>

            <div className="space-y-3 text-xs text-neutral-300">
              
              <div className="bg-neutral-950 p-3.5 rounded-2xl border border-neutral-800/80 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-indigo-400">১. রোবোটিক্স ও মেকাট্রনিক্স সিমুলেশন</span>
                  <span className="text-[10px] font-mono bg-indigo-500/10 text-indigo-300 px-2 py-0.5 rounded">৳৪,০০০ - ৳১৫,০০০</span>
                </div>
                <p className="text-neutral-400 leading-relaxed">
                  বিশ্ববিদ্যালয়ের রোবোটিক্স ল্যাব, থিসিস বা ইঞ্জিনিয়ারিং স্টুডেন্টদের জন্য 2-DOF/3-DOF আর্ম কাইনামেটিক্স ও ম্যাটল্যাব/পাইথন কোড তৈরি।
                </p>
              </div>

              <div className="bg-neutral-950 p-3.5 rounded-2xl border border-neutral-800/80 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-sky-400">২. ফিজিক্স মেকানিক্স ও কেয়স সিমুলেশন</span>
                  <span className="text-[10px] font-mono bg-sky-500/10 text-sky-300 px-2 py-0.5 rounded">৳২,৫০০ - ৳৮,০০০</span>
                </div>
                <p className="text-neutral-400 leading-relaxed">
                  ইউটিউব এডুকেশন চ্যানেল বা অনলাইন কোচিং সেন্টারের জন্য ডাবল পেন্ডুলাম, ট্র্যাজেক্টরি ও মেকানিক্সের 3Blue1Brown স্টাইল ভিডিও।
                </p>
              </div>

              <div className="bg-neutral-950 p-3.5 rounded-2xl border border-neutral-800/80 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-emerald-400">৩. ম্যাট্রিক্স ও ডাটা সায়েন্স লিনিয়ার অ্যালজেব্রা</span>
                  <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded">৳৩,০০০ - ৳১২,০০০</span>
                </div>
                <p className="text-neutral-400 leading-relaxed">
                  মেশিন লার্নিং ও এআই শিক্ষার্থীদের আইগেনভ্যালু, PCA ও ভেক্টর স্পেস ভিজুয়ালাইজ করে দেওয়ার বিশেষ টিউটরিং বা সফটওয়্যার টুল।
                </p>
              </div>

              <div className="bg-neutral-950 p-3.5 rounded-2xl border border-neutral-800/80 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-rose-400">৪. PDE / ODE ও ডিফারেনশিয়াল মডেলিং</span>
                  <span className="text-[10px] font-mono bg-rose-500/10 text-rose-300 px-2 py-0.5 rounded">৳৩,৫০০ - ৳১০,০০০</span>
                </div>
                <p className="text-neutral-400 leading-relaxed">
                  হিট ট্রান্সফার, ফ্লুইড ডাইনামিক্স ও সিগন্যাল প্রসেসিংয়ের ডিফারেনশিয়াল মডেলিং প্রজেক্ট তৈরি।
                </p>
              </div>

            </div>

            {/* Direct bKash Pitch Box */}
            <div className="pt-2">
              <div className="bg-pink-950/30 border border-pink-900/40 rounded-xl p-3 text-[11px] text-pink-200 space-y-1">
                <div className="font-semibold text-pink-300 flex items-center gap-1">
                  <Send className="w-3 h-3" />
                  <span>ক্লায়েন্টকে পাঠানোর প্রস্তুত বার্তা:</span>
                </div>
                <p className="text-neutral-300 italic leading-relaxed">
                  "স্যার, আপনার ল্যাব বা ক্লাসের জন্য রোবোটিক্স/ক্যালকুলাস সিমুলেশন রেডি। নির্ধারিত ফি ৳৩,০০০ টাকা 01728045202 বিকাশ নম্বরে পাঠিয়ে জানালে সম্পূর্ণ সোর্স কোড ও ডকুমেন্টেশন দিয়ে দিচ্ছি।"
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Social Media Share and Post Modal */}
      <SimulationShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        data={getCurrentSimulationShareData()}
      />
    </div>
  );
};
