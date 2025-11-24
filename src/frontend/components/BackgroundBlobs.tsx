import React from 'react';

export const BackgroundBlobs: React.FC = () => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-[#101722]">
      {/* Soft Gradient Base */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1A2333] to-[#101722]"></div>
      
      {/* Pastel Blobs with mixed blend modes for better lighting */}
      <div className="absolute top-[-10%] left-[-10%] h-96 w-96 rounded-full bg-indigo-400/20 blur-[100px] animate-pulse"></div>
      <div className="absolute top-[20%] right-[-20%] h-[30rem] w-[30rem] rounded-full bg-purple-400/15 blur-[120px]"></div>
      <div className="absolute bottom-[-10%] left-[20%] h-80 w-80 rounded-full bg-pink-300/15 blur-[100px]"></div>
      <div className="absolute bottom-[30%] right-[-10%] h-64 w-64 rounded-full bg-teal-200/10 blur-[80px]"></div>
      
      {/* Light overlay for glass effect texturing */}
      <div className="absolute inset-0 bg-white/5 mix-blend-overlay opacity-50"></div>
    </div>
  );
};