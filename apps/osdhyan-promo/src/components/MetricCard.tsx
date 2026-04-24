import React from 'react';
import {brand} from '../data';

export const MetricCard: React.FC<{
  label: string;
  value: string;
}> = ({label, value}) => {
  return (
    <div
      style={{
        minWidth: 236,
        padding: '28px 28px 24px',
        borderRadius: 30,
        border: '1px solid rgba(245, 247, 251, 0.12)',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.04))',
        boxShadow: '0 20px 60px rgba(3, 8, 21, 0.45)',
        backdropFilter: 'blur(18px)',
      }}
    >
      <div
        style={{
          color: 'rgba(245, 247, 251, 0.62)',
          fontFamily: 'Poppins, sans-serif',
          fontWeight: 600,
          fontSize: 21,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </div>
      <div
        style={{
          marginTop: 14,
          color: brand.text,
          fontFamily: 'Oswald, sans-serif',
          fontWeight: 700,
          fontSize: 54,
          letterSpacing: '0.02em',
          textTransform: 'uppercase',
          lineHeight: 1,
        }}
      >
        {value}
      </div>
    </div>
  );
};
