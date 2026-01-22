// src/components/ui/index.jsx
import React from 'react';
import { AlertCircle } from 'lucide-react';

export const GlassCard = ({ children, className = '', hover = true }) => (
  <div className={`
    relative overflow-hidden
    bg-white/10 backdrop-blur-xl
    border border-white/20
    rounded-2xl
    ${hover ? 'hover:bg-white/15 hover:border-white/30 hover:shadow-xl hover:-translate-y-0.5' : ''}
    transition-all duration-300
    ${className}
  `}>
    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
    {children}
  </div>
);

export const AnimatedBackground = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none">
    <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[120px] animate-pulse" />
    <div
      className="absolute top-[20%] right-[-15%] w-[500px] h-[500px] bg-cyan-400/15 rounded-full blur-[100px] animate-pulse"
      style={{ animationDelay: '1s' }}
    />
    <div
      className="absolute bottom-[-10%] left-[20%] w-[700px] h-[700px] bg-indigo-500/15 rounded-full blur-[140px] animate-pulse"
      style={{ animationDelay: '2s' }}
    />
    <div
      className="absolute bottom-[30%] right-[10%] w-[400px] h-[400px] bg-sky-400/10 rounded-full blur-[80px] animate-pulse"
      style={{ animationDelay: '0.5s' }}
    />
  </div>
);

export const ConfirmModal = ({ show, title, message, onConfirm, onCancel }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <GlassCard className="w-full max-w-md p-6" hover={false}>
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-amber-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-amber-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
          <p className="text-white/70 whitespace-pre-line">{message}</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 bg-white/10 text-white rounded-xl font-bold hover:bg-white/20 transition-all"
          >
            {onConfirm ? '취소' : '확인'}
          </button>
          {onConfirm && (
            <button
              onClick={onConfirm}
              className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all"
            >
              확인
            </button>
          )}
        </div>
      </GlassCard>
    </div>
  );
};

export const Banner = ({
  pcImage,
  pcLink,
  mobileImage,
  mobileLink,
  className = ''
}) => {
  if (!pcImage && !mobileImage) return null;

  return (
    <div className={className}>
      {/* PC 배너 (768px 이상) */}
      {pcImage && (
        <a
          href={pcLink || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:block"
        >
          <img
            src={pcImage}
            alt="광고"
            className="w-full object-contain rounded-xl hover:opacity-90 transition-opacity"
            style={{ maxHeight: '90px' }}
          />
        </a>
      )}
      {/* 모바일 배너 (768px 미만) */}
      {mobileImage && (
        <a
          href={mobileLink || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="block md:hidden"
        >
          <img
            src={mobileImage}
            alt="광고"
            className="w-full object-contain rounded-xl hover:opacity-90 transition-opacity"
            style={{ maxHeight: '100px' }}
          />
        </a>
      )}
    </div>
  );
};

export default { GlassCard, AnimatedBackground, ConfirmModal, Banner };
