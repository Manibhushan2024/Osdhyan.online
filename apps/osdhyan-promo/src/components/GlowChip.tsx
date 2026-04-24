import React from 'react';
import {brand} from '../data';

export const GlowChip: React.FC<{
  text: string;
  color?: string;
}> = ({text, color = brand.primary}) => {
  return (
    <div
      style={{
        padding: '14px 22px',
        borderRadius: 999,
        border: `1px solid ${color}55`,
        background: 'rgba(255, 255, 255, 0.05)',
        boxShadow: `0 0 48px ${color}1f`,
        fontFamily: 'Poppins, sans-serif',
        fontSize: 24,
        fontWeight: 600,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: brand.text,
        backdropFilter: 'blur(18px)',
      }}
    >
      {text}
    </div>
  );
};
