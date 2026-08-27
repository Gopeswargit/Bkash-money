import React, { useState, useEffect, useRef } from 'react';
import { 
  Code2, 
  Play, 
  RotateCcw, 
  Copy, 
  Check, 
  Download, 
  Sparkles, 
  AlertCircle, 
  Terminal, 
  CheckCircle2, 
  Layers, 
  Zap,
  Sliders,
  BookOpen,
  Maximize2,
  Minimize2,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';

export type SimulationCategory = 'robotics' | 'mechanics' | 'matrix' | 'trigonometry' | 'calculus_ode_pde' | 'fourier';

interface Props {
  category: SimulationCategory;
  isOpen: boolean;
  onClose: () => void;
  onApplyCustomCode: (code: string, isCustomActive: boolean) => void;
  isCustomActive: boolean;
  onResetCode: () => void;
}

// Preset Code Templates for each category
export const DEFAULT_SIMULATION_CODES: Record<SimulationCategory, { title: string; code: string; description: string }[]> = {
  robotics: [
    {
      title: '2-DOF Robotic Arm Inverse Kinematics (স্ট্যান্ডার্ড)',
      description: 'দুই-লিংক রোবোটিক আর্ম যা মাউস বা টার্গেট পজিশন নিখুঁতভাবে ফলো করে (Cosine Law Inverse Kinematics)',
      code: `// --- 2-DOF ROBOTIC ARM IK ENGINE ---
// ctx: CanvasRenderingContext2D, w: width, h: height, t: time, mouse: {x, y}

function renderSimulation(ctx, w, h, t, mouse) {
  const origin = { x: w * 0.35, y: h * 0.75 };
  const L1 = 140; // প্রথম বাহুর দৈর্ঘ্য
  const L2 = 110; // দ্বিতীয় বাহুর দৈর্ঘ্য
  
  // টার্গেট পজিশন (মাউস বা অটো সার্কুলার মোশন)
  let targetX = mouse.isInteracting ? mouse.x - origin.x : 160 + Math.sin(t * 1.5) * 80;
  let targetY = mouse.isInteracting ? -(mouse.y - origin.y) : 100 + Math.cos(t * 1.5) * 60;
  
  // ডিস্ট্যান্স ক্ল্যাম্পিং (Reach limit)
  const dist = Math.hypot(targetX, targetY);
  const maxReach = L1 + L2 - 5;
  if (dist > maxReach) {
    targetX = (targetX / dist) * maxReach;
    targetY = (targetY / dist) * maxReach;
  }
  
  // ইনভার্স কাইনামেটিক্স (Cosine Rule)
  const D = Math.hypot(targetX, targetY);
  const cosAngle2 = (D * D - L1 * L1 - L2 * L2) / (2 * L1 * L2);
  const theta2 = Math.acos(Math.max(-1, Math.min(1, cosAngle2)));
  const theta1 = Math.atan2(targetY, targetX) - Math.atan2(L2 * Math.sin(theta2), L1 + L2 * Math.cos(theta2));
  
  // জয়েন্ট পজিশন হিসাব
  const j1 = {
    x: origin.x + L1 * Math.cos(theta1),
    y: origin.y - L1 * Math.sin(theta1)
  };
  const j2 = {
    x: j1.x + L2 * Math.cos(theta1 + theta2),
    y: j1.y - L2 * Math.sin(theta1 + theta2)
  };
  
  // ড্রয়িং বেস
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(origin.x - 30, origin.y, 60, 20);
  
  // ড্রয়িং লিংক ১ (Arm 1)
  ctx.lineWidth = 12;
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#6366f1';
  ctx.beginPath();
  ctx.moveTo(origin.x, origin.y);
  ctx.lineTo(j1.x, j1.y);
  ctx.stroke();
  
  // ড্রয়িং লিংক ২ (Arm 2)
  ctx.strokeStyle = '#ec4899';
  ctx.beginPath();
  ctx.moveTo(j1.x, j1.y);
  ctx.lineTo(j2.x, j2.y);
  ctx.stroke();
  
  // জয়েন্ট পিন ও অ্যান্ড-ইফেক্টর গ্রিপার
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(origin.x, origin.y, 8, 0, Math.PI * 2);
  ctx.arc(j1.x, j1.y, 7, 0, Math.PI * 2);
  ctx.arc(j2.x, j2.y, 9, 0, Math.PI * 2);
  ctx.fill();
  
  // টার্গেট পয়েন্ট
  ctx.fillStyle = '#22c55e';
  ctx.beginPath();
  ctx.arc(origin.x + targetX, origin.y - targetY, 6, 0, Math.PI * 2);
  ctx.fill();
  
  // টেক্সট ডাটা
  ctx.fillStyle = '#94a3b8';
  ctx.font = '12px monospace';
  ctx.fillText(\`θ₁: \${(theta1 * 180 / Math.PI).toFixed(1)}° | θ₂: \${(theta2 * 180 / Math.PI).toFixed(1)}°\`, 20, 30);
  ctx.fillText(\`Target: (\${targetX.toFixed(0)}, \${targetY.toFixed(0)})\`, 20, 50);
}`
    },
    {
      title: '3-Link Triple Segment Robotic Arm (উন্নত ৩-বাহু)',
      description: 'তিনটি লিংকের রিডানড্যান্ট রোবোটিক আর্ম যা ফ্যাব্রিক/সিসিডি অপ্টিমাইজেশন ব্যবহার করে',
      code: `// --- 3-LINK TRIPLE SEGMENT ARM ---
function renderSimulation(ctx, w, h, t, mouse) {
  const origin = { x: w * 0.3, y: h * 0.8 };
  const L1 = 90, L2 = 80, L3 = 70;
  
  let targetX = mouse.isInteracting ? mouse.x - origin.x : 150 + Math.cos(t * 2) * 70;
  let targetY = mouse.isInteracting ? -(mouse.y - origin.y) : 120 + Math.sin(t * 3) * 50;
  
  const th1 = Math.sin(t * 1.2) * 0.5 + 0.6;
  const th2 = Math.cos(t * 1.5) * 0.8 - 0.4;
  const th3 = Math.sin(t * 2.0) * 0.6;
  
  const p1 = { x: origin.x + L1 * Math.cos(th1), y: origin.y - L1 * Math.sin(th1) };
  const p2 = { x: p1.x + L2 * Math.cos(th1 + th2), y: p1.y - L2 * Math.sin(th1 + th2) };
  const p3 = { x: p2.x + L3 * Math.cos(th1 + th2 + th3), y: p2.y - L3 * Math.sin(th1 + th2 + th3) };
  
  // ড্রয়িং লিংকসমূহ
  ctx.lineWidth = 10;
  ctx.lineCap = 'round';
  
  ctx.strokeStyle = '#3b82f6';
  ctx.beginPath(); ctx.moveTo(origin.x, origin.y); ctx.lineTo(p1.x, p1.y); ctx.stroke();
  
  ctx.strokeStyle = '#10b981';
  ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
  
  ctx.strokeStyle = '#f59e0b';
  ctx.beginPath(); ctx.moveTo(p2.x, p2.y); ctx.lineTo(p3.x, p3.y); ctx.stroke();
  
  // জয়েন্টস
  [origin, p1, p2, p3].forEach((pt, i) => {
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(pt.x, pt.y, i === 3 ? 8 : 6, 0, Math.PI * 2); ctx.fill();
  });
  
  ctx.fillStyle = '#a855f7';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText('3-DOF Kinematic Chain Engine', 20, 30);
}`
    }
  ],
  mechanics: [
    {
      title: 'Double Pendulum Chaotic Engine (ডাবল পেন্ডুলাম কেয়স)',
      description: 'ল্যাগ্রাঞ্জিয়ান মেকানিক্স ও নন-লিনিয়ার কেয়স অ্যানিমেশন ট্রেইস সহ',
      code: `// --- DOUBLE PENDULUM CHAOTIC SYSTEM ---
function renderSimulation(ctx, w, h, t) {
  const origin = { x: w / 2, y: h * 0.35 };
  const l1 = 110, l2 = 95;
  const m1 = 15, m2 = 12;
  
  // কাপলড নন-লিনিয়ার অসিলেশন অ্যাঙ্গেল
  const theta1 = Math.sin(t * 1.8) * 1.2 + Math.cos(t * 0.7) * 0.4;
  const theta2 = Math.sin(t * 2.3 + 1.5) * 1.6 + Math.sin(t * 4.1) * 0.3;
  
  const x1 = origin.x + l1 * Math.sin(theta1);
  const y1 = origin.y + l1 * Math.cos(theta1);
  const x2 = x1 + l2 * Math.sin(theta2);
  const y2 = y1 + l2 * Math.cos(theta2);
  
  // রড ড্রয়িং
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#38bdf8';
  ctx.beginPath(); ctx.moveTo(origin.x, origin.y); ctx.lineTo(x1, y1); ctx.stroke();
  
  ctx.strokeStyle = '#f43f5e';
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  
  // বব ১ ও বব ২
  ctx.fillStyle = '#38bdf8';
  ctx.beginPath(); ctx.arc(x1, y1, m1, 0, Math.PI * 2); ctx.fill();
  
  ctx.fillStyle = '#f43f5e';
  ctx.beginPath(); ctx.arc(x2, y2, m2, 0, Math.PI * 2); ctx.fill();
  
  // পিভট পয়েন্ট
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.arc(origin.x, origin.y, 6, 0, Math.PI * 2); ctx.fill();
  
  ctx.fillStyle = '#e2e8f0';
  ctx.font = '12px monospace';
  ctx.fillText(\`Lagrangian Energy E = T + V = Constant\`, 20, 30);
  ctx.fillText(\`θ₁: \${theta1.toFixed(2)} rad | θ₂: \${theta2.toFixed(2)} rad\`, 20, 50);
}`
    },
    {
      title: 'Projectile Motion with Quadratic Air Drag (বাতাসের বাধা সহ গতি)',
      description: 'বায়ুর ঘর্ষণ বল F_drag = -k*v^2 সহ প্রক্ষেপকের প্যারাবোলিক ট্র্যাজেক্টরি সিমুলেশন',
      code: `// --- PROJECTILE DYNAMICS WITH AIR RESISTANCE ---
function renderSimulation(ctx, w, h, t) {
  const origin = { x: 50, y: h - 50 };
  const v0 = 85;
  const angleDeg = 55;
  const rad = (angleDeg * Math.PI) / 180;
  const g = 9.8;
  const dragK = 0.003;
  
  // গ্রাউন্ড লাইন
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, origin.y); ctx.lineTo(w, origin.y); ctx.stroke();
  
  // আদর্শ ট্র্যাজেক্টরি পাথ (No Drag)
  ctx.strokeStyle = 'rgba(100, 116, 139, 0.4)';
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  for (let dt = 0; dt < 15; dt += 0.1) {
    const x = origin.x + v0 * Math.cos(rad) * dt * 4;
    const y = origin.y - (v0 * Math.sin(rad) * dt - 0.5 * g * dt * dt) * 4;
    if (y > origin.y) break;
    if (dt === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.setLineDash([]);
  
  // লাইভ অবজেক্ট পজিশন
  const loopT = (t * 1.5) % 10;
  const liveX = origin.x + (v0 * Math.cos(rad) * loopT * 4) / (1 + dragK * loopT * 15);
  const liveY = origin.y - (v0 * Math.sin(rad) * loopT - 0.5 * g * loopT * loopT) * 4;
  
  if (liveY <= origin.y) {
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath(); ctx.arc(liveX, liveY, 10, 0, Math.PI * 2); ctx.fill();
  }
  
  ctx.fillStyle = '#e2e8f0';
  ctx.font = '12px monospace';
  ctx.fillText(\`v₀ = \${v0} m/s | θ = \${angleDeg}° | Drag Coeff K = \${dragK}\`, 20, 30);
}`
    }
  ],
  matrix: [
    {
      title: '2D Matrix Linear Transformation & Eigenvectors (ম্যাট্রিক্স ট্রান্সফর্ম)',
      description: 'ভেক্টর স্পেস গ্রিডকে 2x2 ম্যাট্রিক্স দ্বারা রূপান্তর ও আইগেনভেক্টর ডিসপ্লে',
      code: `// --- 2D MATRIX TRANSFORMATION ENGINE ---
function renderSimulation(ctx, w, h, t) {
  const cx = w / 2, cy = h / 2;
  
  // অ্যানিমেটেড ম্যাট্রিক্স কোফিশিয়েন্টস
  const a = Math.cos(t * 0.8);
  const b = -Math.sin(t * 0.8) * 1.2;
  const c = Math.sin(t * 0.8) * 0.8;
  const d = Math.cos(t * 0.8);
  
  const det = a * d - b * c;
  
  // ট্রান্সফর্মড গ্রিড লাইন
  ctx.lineWidth = 1;
  const step = 30;
  for (let i = -10; i <= 10; i++) {
    // Vertical transformed lines
    const p1 = { x: cx + (a * i * step + b * (-10 * step)), y: cy - (c * i * step + d * (-10 * step)) };
    const p2 = { x: cx + (a * i * step + b * (10 * step)), y: cy - (c * i * step + d * (10 * step)) };
    ctx.strokeStyle = i === 0 ? '#ef4444' : 'rgba(239, 68, 68, 0.2)';
    ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
    
    // Horizontal transformed lines
    const q1 = { x: cx + (a * (-10 * step) + b * (i * step)), y: cy - (c * (-10 * step) + d * (i * step)) };
    const q2 = { x: cx + (a * (10 * step) + b * (i * step)), y: cy - (c * (10 * step) + d * (i * step)) };
    ctx.strokeStyle = i === 0 ? '#10b981' : 'rgba(16, 185, 129, 0.2)';
    ctx.beginPath(); ctx.moveTo(q1.x, q1.y); ctx.lineTo(q2.x, q2.y); ctx.stroke();
  }
  
  // বেসিস ভেক্টর e1 ও e2
  const e1 = { x: cx + a * 80, y: cy - c * 80 };
  const e2 = { x: cx + b * 80, y: cy - d * 80 };
  
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#ef4444';
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(e1.x, e1.y); ctx.stroke();
  
  ctx.strokeStyle = '#10b981';
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(e2.x, e2.y); ctx.stroke();
  
  // ম্যাট্রিক্স ও ডিটারমিন্যান্ট ডিসপ্লে
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 13px monospace';
  ctx.fillText(\`Matrix M = [ \${a.toFixed(2)}  \${b.toFixed(2)} ]\`, 20, 30);
  ctx.fillText(\`           [ \${c.toFixed(2)}  \${d.toFixed(2)} ]\`, 20, 50);
  ctx.fillStyle = det >= 0 ? '#10b981' : '#f43f5e';
  ctx.fillText(\`det(M) = \${det.toFixed(3)} (\${det >= 0 ? 'Area Preserving' : 'Orientation Inverted'})\`, 20, 75);
}`
    }
  ],
  trigonometry: [
    {
      title: 'Unit Circle & Real-Time Waveform Generator (ত্রিকোণমিতি ল্যাব)',
      description: 'একক বৃত্তের ঘূর্ণন এবং ডানপাশে প্রজেক্টেড সাইন ও কোসাইন গ্রাফের লাইভ জেনারেশন',
      code: `// --- INTERACTIVE TRIGONOMETRIC ENGINE ---
function renderSimulation(ctx, w, h, t) {
  const center = { x: 180, y: h / 2 };
  const radius = 100;
  const angle = (t * 2) % (Math.PI * 2);
  
  // ইউনিট সার্কেল ড্রয়িং
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(center.x, center.y, radius, 0, Math.PI * 2); ctx.stroke();
  
  // অক্ষ রেখা
  ctx.beginPath(); ctx.moveTo(center.x - radius - 20, center.y); ctx.lineTo(center.x + radius + 20, center.y); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(center.x, center.y - radius - 20); ctx.lineTo(center.x, center.y + radius + 20); ctx.stroke();
  
  // বৃত্তের উপরের বিন্দু P(cos θ, sin θ)
  const px = center.x + radius * Math.cos(angle);
  const py = center.y - radius * Math.sin(angle);
  
  // কস ও সাইন ত্রিভুজ
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#3b82f6'; // Cosine (Blue)
  ctx.beginPath(); ctx.moveTo(center.x, center.y); ctx.lineTo(px, center.y); ctx.stroke();
  
  ctx.strokeStyle = '#ef4444'; // Sine (Red)
  ctx.beginPath(); ctx.moveTo(px, center.y); ctx.lineTo(px, py); ctx.stroke();
  
  ctx.strokeStyle = '#ffffff'; // Hypotenuse
  ctx.beginPath(); ctx.moveTo(center.x, center.y); ctx.lineTo(px, py); ctx.stroke();
  
  // সাইন ওয়েভ প্রজেকশন ডানপাশে
  ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
  ctx.setLineDash([3, 3]);
  ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(340, py); ctx.stroke();
  ctx.setLineDash([]);
  
  // কন্টিনিউয়াস সাইন ওয়েভ গ্রাফ
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  for (let x = 0; x < w - 350; x++) {
    const waveAngle = angle - (x * 0.03);
    const waveY = center.y - radius * Math.sin(waveAngle);
    if (x === 0) ctx.moveTo(340 + x, waveY); else ctx.lineTo(340 + x, waveY);
  }
  ctx.stroke();
  
  // তথ্য লেবেল
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 12px monospace';
  ctx.fillText(\`θ = \${((angle * 180) / Math.PI).toFixed(0)}° (\${angle.toFixed(2)} rad)\`, 20, 30);
  ctx.fillStyle = '#ef4444';
  ctx.fillText(\`sin(θ) = \${Math.sin(angle).toFixed(3)}\`, 20, 50);
  ctx.fillStyle = '#3b82f6';
  ctx.fillText(\`cos(θ) = \${Math.cos(angle).toFixed(3)}\`, 20, 70);
}`
    },
    {
      title: 'Lissajous Curves (লিসাজাস হারমোনিক প্যাটার্ন)',
      description: 'দুই ভিন্ন কম্পাঙ্কের সাইনোসয়ডাল সিগন্যালের সুপারপজিশন x = A sin(at + δ), y = B sin(bt)',
      code: `// --- LISSAJOUS PARAMETRIC CURVES ---
function renderSimulation(ctx, w, h, t) {
  const cx = w / 2, cy = h / 2;
  const A = 130, B = 100;
  const a = 3, b = 4;
  const delta = t * 0.8;
  
  ctx.strokeStyle = '#06b6d4';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  for (let s = 0; s <= Math.PI * 2 + 0.05; s += 0.02) {
    const x = cx + A * Math.sin(a * s + delta);
    const y = cy - B * Math.sin(b * s);
    if (s === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();
  
  // লাইভ লিডিং পয়েন্ট
  const headX = cx + A * Math.sin(a * (t % (Math.PI*2)) + delta);
  const headY = cy - B * Math.sin(b * (t % (Math.PI*2)));
  ctx.fillStyle = '#f43f5e';
  ctx.beginPath(); ctx.arc(headX, headY, 6, 0, Math.PI * 2); ctx.fill();
  
  ctx.fillStyle = '#e2e8f0';
  ctx.font = '12px monospace';
  ctx.fillText(\`Lissajous Curve Ratio \${a}:\${b} | Phase δ = \${delta.toFixed(2)}\`, 20, 30);
}`
    }
  ],
  calculus_ode_pde: [
    {
      title: 'Lorenz Strange Attractor Chaos (লরেন্জ ডিফারেনশিয়াল সিস্টেম)',
      description: 'বিখ্যাত নন-লিনিয়ার বাটারফ্লাই ক্যাওটিক অ্যাট্রাক্টর: dx/dt = σ(y-x), dy/dt = x(ρ-z)-y, dz/dt = xy-βz',
      code: `// --- LORENZ CHAOTIC DIFFERENTIAL ATTRACTOR ---
function renderSimulation(ctx, w, h, t) {
  const cx = w / 2, cy = h * 0.65;
  const sigma = 10, rho = 28, beta = 8/3;
  const dt = 0.008;
  
  let x = 0.1, y = 0, z = 0;
  const points = [];
  
  // Euler Integration of ODEs
  for (let i = 0; i < 1800; i++) {
    const dx = sigma * (y - x) * dt;
    const dy = (x * (rho - z) - y) * dt;
    const dz = (x * y - beta * z) * dt;
    x += dx;
    y += dy;
    z += dz;
    points.push({ x: cx + x * 8, y: cy - z * 7 });
  }
  
  // ড্রয়িং অ্যাট্রাক্টর ট্রাজেক্টরি
  ctx.lineWidth = 1.2;
  for (let i = 1; i < points.length; i++) {
    ctx.strokeStyle = \`hsl(\${(i * 0.2 + t * 40) % 360}, 85%, 60%)\`;
    ctx.beginPath();
    ctx.moveTo(points[i-1].x, points[i-1].y);
    ctx.lineTo(points[i].x, points[i].y);
    ctx.stroke();
  }
  
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 12px monospace';
  ctx.fillText('Lorenz Attractor (Non-Linear ODE System)', 20, 30);
  ctx.fillText('σ = 10, ρ = 28, β = 8/3', 20, 50);
}`
    },
    {
      title: '1D Heat Diffusion PDE with Gaussian Pulse (হিট ডিফিউশন সমীকরণ)',
      description: 'আংশিক ডিফারেনশিয়াল সমীকরণ ∂u/∂t = α ∇²u এর ফাইনাইট ডিফারেন্স সমাধান',
      code: `// --- 1D HEAT DIFFUSION PDE SOLVER ---
function renderSimulation(ctx, w, h, t) {
  const barY = h / 2;
  const N = 60;
  const startX = 60, endX = w - 60;
  const dx = (endX - startX) / N;
  
  // গাউসিয়ান হিট ডিস্ট্রিবিউশন অ্যানিমেশন
  const alpha = 0.8;
  const decay = 1 / Math.sqrt(1 + alpha * (t % 8));
  
  for (let i = 0; i < N; i++) {
    const xi = (i - N / 2) / (N / 4);
    const temp = Math.exp(-xi * xi * decay) * 100 * decay;
    
    const xPos = startX + i * dx;
    // কালার গ্রেডিয়েন্ট (ঠান্ডা নীল থেকে গরম লাল)
    ctx.fillStyle = \`hsl(\${Math.max(0, 240 - temp * 2.4)}, 90%, 55%)\`;
    ctx.fillRect(xPos, barY - 20, dx, 40);
    
    // টেম্পারেচার কার্ভ ড্রয়িং
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(xPos, barY - 25 - temp * 0.9, dx, 3);
  }
  
  ctx.fillStyle = '#e2e8f0';
  ctx.font = '12px monospace';
  ctx.fillText('Heat Diffusion Equation: ∂u/∂t = α (∂²u/∂x²)', 20, 30);
  ctx.fillText(\`Thermal Decay Factor: \${decay.toFixed(3)}\`, 20, 50);
}`
    }
  ],
  fourier: [
    {
      title: 'Fourier Epicycles & Harmonic Wave Decomposition (ফুরিয়ার সিরিজ)',
      description: 'ঘূর্ণায়মান ভেক্টর বৃত্তসমূহের যোগফল দ্বারা স্কয়ার/কমপ্লেক্স সিগন্যাল তৈরি',
      code: `// --- FOURIER EPICYCLE SERIES SYNTHESIS ---
function renderSimulation(ctx, w, h, t) {
  const origin = { x: 180, y: h / 2 };
  const harmonics = 7;
  let current = { ...origin };
  
  for (let i = 0; i < harmonics; i++) {
    const n = i * 2 + 1; // বিজোড় হারমোনিক (1, 3, 5, 7...)
    const radius = 65 * (4 / (n * Math.PI));
    const angle = n * t * 1.8;
    
    const next = {
      x: current.x + radius * Math.cos(angle),
      y: current.y + radius * Math.sin(angle)
    };
    
    // হারমোনিক বৃত্ত
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.35)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(current.x, current.y, radius, 0, Math.PI * 2); ctx.stroke();
    
    // ভেক্টর রেখা
    ctx.strokeStyle = '#818cf8';
    ctx.beginPath(); ctx.moveTo(current.x, current.y); ctx.lineTo(next.x, next.y); ctx.stroke();
    
    current = next;
  }
  
  // কানেক্টিং গাইড লাইন
  ctx.strokeStyle = 'rgba(34, 197, 94, 0.4)';
  ctx.setLineDash([3, 3]);
  ctx.beginPath(); ctx.moveTo(current.x, current.y); ctx.lineTo(340, current.y); ctx.stroke();
  ctx.setLineDash([]);
  
  // সংশ্লেষিত স্কয়ার ওয়েভ
  ctx.strokeStyle = '#22c55e';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  for (let x = 0; x < w - 350; x++) {
    let waveY = origin.y;
    for (let i = 0; i < harmonics; i++) {
      const n = i * 2 + 1;
      const radius = 65 * (4 / (n * Math.PI));
      waveY += radius * Math.sin(n * (t * 1.8 - x * 0.03));
    }
    if (x === 0) ctx.moveTo(340 + x, waveY); else ctx.lineTo(340 + x, waveY);
  }
  ctx.stroke();
  
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 12px monospace';
  ctx.fillText(\`f(x) = (4/π) ∑ (1/n) sin(nωt), n=1,3..\${harmonics*2-1}\`, 20, 30);
  ctx.fillText(\`Active Harmonics (N): \${harmonics}\`, 20, 50);
}`
    }
  ]
};

export const LiveSimulationCodeEditor: React.FC<Props> = ({
  category,
  isOpen,
  onClose,
  onApplyCustomCode,
  isCustomActive,
  onResetCode
}) => {
  const [code, setCode] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'editor' | 'templates' | 'docs'>('editor');
  const [selectedTemplateIdx, setSelectedTemplateIdx] = useState<number>(0);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Sync initial code when category changes
  useEffect(() => {
    const templates = DEFAULT_SIMULATION_CODES[category] || DEFAULT_SIMULATION_CODES.robotics;
    const initial = templates[0]?.code || '';
    setCode(initial);
    setSelectedTemplateIdx(0);
    setErrorMsg(null);
  }, [category]);

  const handleApply = () => {
    try {
      setErrorMsg(null);
      // Basic syntax validation test
      const testFunc = new Function('ctx', 'w', 'h', 't', 'mouse', `
        ${code}
        if (typeof renderSimulation === 'function') {
          return renderSimulation;
        }
        throw new Error("renderSimulation(ctx, w, h, t, mouse) ফাংশনটি পাওয়া যায়নি!");
      `);
      testFunc({}, 100, 100, 0, { x: 0, y: 0, isInteracting: false });

      onApplyCustomCode(code, true);

      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.7 }
      });
    } catch (err: unknown) {
      console.error('Code validation error:', err);
      const msg = err instanceof Error ? err.message : 'Syntax Error in script';
      setErrorMsg(msg);
    }
  };

  const handleSelectTemplate = (templateCode: string, idx: number) => {
    setCode(templateCode);
    setSelectedTemplateIdx(idx);
    setActiveTab('editor');
    setErrorMsg(null);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${category}_simulation_script_${Date.now()}.js`;
    link.click();
  };

  const handleRestoreDefault = () => {
    const templates = DEFAULT_SIMULATION_CODES[category] || DEFAULT_SIMULATION_CODES.robotics;
    const initial = templates[0]?.code || '';
    setCode(initial);
    setErrorMsg(null);
    onResetCode();
  };

  // Support Tab key in Textarea
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newCode = code.substring(0, start) + '  ' + code.substring(end);
      setCode(newCode);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`bg-neutral-950 border border-neutral-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 animate-in fade-in duration-200 ${
      isFullScreen ? 'fixed inset-4 z-50 overflow-y-auto' : 'w-full'
    }`}>
      
      {/* Editor Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-4">
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">
                লাইভ সিমুলেশন কোড এডিটর ও স্ক্রিপ্ট রানার
              </h3>
              {isCustomActive ? (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>কাস্টম কোড লাইভ চালু</span>
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400 text-[10px] font-semibold">
                  ডিফল্ট বিল্ট-ইন মোড
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-400">
              সরাসরি জাভাস্ক্রিপ্ট কোড এডিট করে ক্যানভাসে সমীকরণ ও সিমুলেশন লাইভ পরিবর্তন করুন
            </p>
          </div>
        </div>

        {/* View Tabs & Actions */}
        <div className="flex items-center gap-2">
          
          <div className="flex items-center bg-neutral-900 p-1 rounded-xl border border-neutral-800 text-xs">
            <button
              onClick={() => setActiveTab('editor')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === 'editor' ? 'bg-indigo-600 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
              }`}
            >
              কোড এডিটর
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1 ${
                activeTab === 'templates' ? 'bg-indigo-600 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>টেমপ্লেটস ({DEFAULT_SIMULATION_CODES[category]?.length || 0})</span>
            </button>
            <button
              onClick={() => setActiveTab('docs')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === 'docs' ? 'bg-indigo-600 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
              }`}
            >
              API গাইড
            </button>
          </div>

          <button
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-all border border-neutral-800"
            title={isFullScreen ? 'ছোট করুন' : 'ফুলস্ক্রিন মোড'}
          >
            {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-all border border-neutral-800"
            title="এডিটর বন্ধ করুন"
          >
            <X className="w-4 h-4" />
          </button>

        </div>

      </div>

      {/* Error Alert Box */}
      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold block">কোডে ত্রুটি পাওয়া গেছে:</strong>
            <span className="font-mono text-[11px]">{errorMsg}</span>
          </div>
        </div>
      )}

      {/* TAB 1: CODE EDITOR */}
      {activeTab === 'editor' && (
        <div className="space-y-3">
          
          <div className="relative rounded-2xl overflow-hidden border border-neutral-800 bg-[#0d1117] font-mono text-xs shadow-inner">
            
            {/* Top Editor Bar */}
            <div className="bg-[#161b22] px-4 py-2 flex items-center justify-between border-b border-neutral-800 text-[11px] text-neutral-400">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="text-neutral-300 font-semibold">{category}_simulation.js</span>
                <span>(Function: renderSimulation(ctx, w, h, t, mouse))</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="hover:text-white flex items-center gap-1 transition-all"
                  title="কোড কপি করুন"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'কপিকৃত' : 'কপি'}</span>
                </button>
                <span>•</span>
                <button
                  onClick={handleDownload}
                  className="hover:text-white flex items-center gap-1 transition-all"
                  title="স্ক্রিপ্ট ডাউনলোড করুন"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>ডাউনলোড</span>
                </button>
              </div>
            </div>

            {/* Code Textarea */}
            <textarea
              ref={textareaRef}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              rows={isFullScreen ? 24 : 14}
              className="w-full bg-transparent p-4 text-emerald-400 font-mono text-xs leading-relaxed focus:outline-none resize-y selection:bg-indigo-600/40"
              placeholder="// Write your custom JavaScript simulation render code here..."
            />

          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              <button
                onClick={handleApply}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center gap-2 active:scale-95 transition-all"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>কোড রান করুন ও লাইভ আপডেট করুন</span>
              </button>

              <button
                onClick={handleRestoreDefault}
                className="px-3.5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white font-semibold text-xs flex items-center gap-1.5 transition-all"
                title="ডিফল্ট বিল্ট-ইন অ্যালগরিদমে ফিরে যান"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>ডিফল্ট কোডে রিসেট</span>
              </button>
            </div>

            <div className="text-[11px] text-neutral-500">
              💡 টিপস: আপনি সরাসরি <code className="text-emerald-400">Math.sin, Math.cos, ctx.arc</code> ইত্যাদি পরিবর্তন করে লাইভ রান করতে পারবেন।
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: PRESET TEMPLATES */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
          {(DEFAULT_SIMULATION_CODES[category] || []).map((tmpl, idx) => (
            <div
              key={tmpl.title}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                selectedTemplateIdx === idx
                  ? 'bg-indigo-950/40 border-indigo-500 text-white'
                  : 'bg-neutral-900/60 border-neutral-800 text-neutral-300 hover:border-neutral-700'
              }`}
              onClick={() => handleSelectTemplate(tmpl.code, idx)}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>{tmpl.title}</span>
                </h4>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectTemplate(tmpl.code, idx);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold"
                >
                  লোড করুন
                </button>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed mb-3">
                {tmpl.description}
              </p>
              <pre className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800/80 text-[10px] font-mono text-emerald-400/90 overflow-x-auto max-h-24">
                {tmpl.code.split('\n').slice(0, 6).join('\n')}...
              </pre>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: API & PARAMETER DOCS */}
      {activeTab === 'docs' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4 text-xs text-neutral-300">
          <h4 className="font-bold text-white text-sm flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span>লাইভ স্ক্রিপ্ট ফাংশন আর্গুমেন্টস (API Reference)</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
              <span className="font-mono text-emerald-400 font-bold">ctx (CanvasRenderingContext2D)</span>
              <p className="text-neutral-400 text-[11px]">
                HTML5 ক্যানভাস কনটেক্সট। যেমন: <code>ctx.beginPath(), ctx.arc(), ctx.fillStyle</code>
              </p>
            </div>

            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
              <span className="font-mono text-emerald-400 font-bold">w, h (Number)</span>
              <p className="text-neutral-400 text-[11px]">
                ক্যানভাসের প্রস্থ (Width: 700px) ও উচ্চতা (Height: 390px)।
              </p>
            </div>

            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
              <span className="font-mono text-emerald-400 font-bold">t (Number - Time in seconds)</span>
              <p className="text-neutral-400 text-[11px]">
                ধারাবাহিক চলমান সময়। সময়ের সাথে সাথে অ্যানিমেশনের মান পরিবর্তিত হয় (<code className="text-amber-300">t += 0.03</code>)।
              </p>
            </div>

            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
              <span className="font-mono text-emerald-400 font-bold">mouse ({'{x, y, isInteracting}'})</span>
              <p className="text-neutral-400 text-[11px]">
                ব্যবহারকারীর মাউস বা টাচের বর্তমান স্থানাংক ও ড্র্যাগিং স্ট্যাটাস।
              </p>
            </div>
          </div>

          <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800 text-[11px] leading-relaxed text-neutral-400">
            <strong className="text-white block mb-1">কাস্টম ফাংশন কাঠামোর নিয়ম:</strong>
            আপনার স্ক্রিপ্টে অবশ্যই একটি <code className="text-indigo-400">function renderSimulation(ctx, w, h, t, mouse) {'{ ... }'}</code> থাকতে হবে, যা প্রতি ফ্রেমে কল হবে।
          </div>
        </div>
      )}

    </div>
  );
};
