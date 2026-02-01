import React from 'react';

const BlueFolderIcon = ({ size = 40 }) => (
  <div style={{
    width: `${size}px`,
    height: `${size}px`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '10px'
  }}>
    <svg width={size} height={size} viewBox="0 0 24 24">
      <defs>
        <linearGradient id="folderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4285f4" />
          <stop offset="100%" stopColor="#1a73e8" />
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="rgba(26, 115, 232, 0.3)" />
        </filter>
      </defs>
      <path 
        d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z"
        fill="url(#folderGradient)"
        filter="url(#shadow)"
      />
      <path 
        d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z"
        fill="transparent"
        stroke="rgba(255, 255, 255, 0.3)"
        strokeWidth="0.5"
      />
    </svg>
  </div>
);
export default BlueFolderIcon;