import React from 'react';
import {Img, staticFile} from 'remotion';

export const ScreenCard: React.FC<{
  src: string;
  width: number;
  height: number;
  rotate?: number;
  x?: number;
  y?: number;
  scale?: number;
  opacity?: number;
}> = ({src, width, height, rotate = 0, x = 0, y = 0, scale = 1, opacity = 1}) => {
  return (
    <div
      style={{
        position: 'absolute',
        width,
        height,
        transform: `translate(${x}px, ${y}px) rotate(${rotate}deg) scale(${scale})`,
        opacity,
        borderRadius: 34,
        padding: 16,
        background: 'linear-gradient(180deg, rgba(255,255,255,0.16), rgba(255,255,255,0.07))',
        border: '1px solid rgba(255,255,255,0.14)',
        boxShadow: '0 38px 90px rgba(3, 8, 21, 0.52)',
        backdropFilter: 'blur(18px)',
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          borderRadius: 24,
          background: 'rgba(0,0,0,0.22)',
        }}
      >
        <Img
          src={staticFile(src)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </div>
    </div>
  );
};
