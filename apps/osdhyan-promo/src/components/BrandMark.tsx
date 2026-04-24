import React from 'react';
import {brand} from '../data';

export const BrandMark: React.FC<{
  size?: number;
}> = ({size = 180}) => {
  const ringSize = size;
  const coreSize = Math.round(size * 0.28);
  const dotSize = Math.round(size * 0.09);

  return (
    <div
      style={{
        position: 'relative',
        width: ringSize,
        height: ringSize,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 999,
          border: `10px solid ${brand.primary}`,
          opacity: 0.95,
          boxShadow: `0 0 54px ${brand.primary}55`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: size * 0.16,
          borderRadius: 999,
          border: '2px dashed rgba(245,247,251,0.22)',
        }}
      />
      <div
        style={{
          width: coreSize,
          height: coreSize,
          borderRadius: 999,
          background: `linear-gradient(135deg, ${brand.primary}, ${brand.accent})`,
          boxShadow: `0 0 54px ${brand.secondary}55`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: dotSize,
          height: dotSize,
          borderRadius: 999,
          background: '#FFFFFF',
        }}
      />
    </div>
  );
};
