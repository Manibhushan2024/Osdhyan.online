import React from 'react';
import {brand} from '../data';

export const SectionTitle: React.FC<{
  eyebrow: string;
  title: React.ReactNode;
  description: string;
  align?: 'left' | 'center';
}> = ({eyebrow, title, description, align = 'left'}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
        maxWidth: align === 'center' ? 900 : 760,
        textAlign: align,
      }}
    >
      <div
        style={{
          color: brand.secondary,
          fontFamily: 'Poppins, sans-serif',
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
        }}
      >
        {eyebrow}
      </div>
      <div
        style={{
          color: brand.text,
          fontFamily: 'Oswald, sans-serif',
          fontSize: 108,
          fontWeight: 700,
          lineHeight: 0.92,
          letterSpacing: '-0.01em',
          textTransform: 'uppercase',
        }}
      >
        {title}
      </div>
      <div
        style={{
          color: brand.muted,
          fontFamily: 'Poppins, sans-serif',
          fontSize: 31,
          fontWeight: 500,
          lineHeight: 1.4,
        }}
      >
        {description}
      </div>
    </div>
  );
};
