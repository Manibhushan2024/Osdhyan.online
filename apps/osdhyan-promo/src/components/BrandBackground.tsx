import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {brand} from '../data';

export const BrandBackground: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();

  const pulseA = interpolate(frame, [0, durationInFrames], [0.22, 0.34], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const pulseB = interpolate(frame, [0, durationInFrames], [0.18, 0.28], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const lineShift = interpolate(frame, [0, durationInFrames], [0, 180], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        overflow: 'hidden',
        background: `radial-gradient(circle at 12% 12%, rgba(25, 198, 255, 0.20), transparent 30%),
          radial-gradient(circle at 88% 18%, rgba(22, 214, 164, 0.18), transparent 26%),
          radial-gradient(circle at 50% 82%, rgba(19, 103, 255, 0.28), transparent 34%),
          linear-gradient(145deg, ${brand.backgroundDeep} 0%, ${brand.background} 42%, ${brand.backgroundSoft} 100%)`,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: -220,
          background: `radial-gradient(circle, rgba(25, 198, 255, ${pulseA}), transparent 48%)`,
          transform: `translate(${-60 + lineShift * 0.12}px, ${-30 + lineShift * 0.05}px)`,
          filter: 'blur(120px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: -180,
          top: 240,
          width: 560,
          height: 560,
          borderRadius: 999,
          background: `radial-gradient(circle, rgba(255, 176, 32, ${pulseB}), transparent 52%)`,
          filter: 'blur(130px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.12,
          backgroundImage:
            'linear-gradient(rgba(245,247,251,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(245,247,251,0.07) 1px, transparent 1px)',
          backgroundSize: '90px 90px',
          transform: `translateY(${lineShift * -0.08}px)`,
        }}
      />
    </AbsoluteFill>
  );
};
