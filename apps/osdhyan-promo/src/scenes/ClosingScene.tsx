import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {BrandBackground} from '../components/BrandBackground';
import {BrandMark} from '../components/BrandMark';
import {GlowChip} from '../components/GlowChip';
import {brand, examTracks} from '../data';
import {fadeIn, rise, smoothSpring} from '../components/motion';

export const ClosingScene: React.FC = () => {
  const frame = useCurrentFrame();
  const outroSpring = smoothSpring(frame, 30, 0, 36);

  return (
    <AbsoluteFill>
      <BrandBackground />
      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '120px 84px',
          gap: 30,
        }}
      >
        <div
          style={{
            transform: `translateY(${rise(frame, 0, 28, 32)}px) scale(${0.95 + outroSpring * 0.05})`,
            opacity: fadeIn(frame, 0, 28),
          }}
        >
          <BrandMark size={216} />
        </div>

        <div
          style={{
            color: brand.secondary,
            fontFamily: 'Poppins, sans-serif',
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            opacity: fadeIn(frame, 10, 36),
          }}
        >
          Prep Smart. Stay Consistent. Perform With Intent.
        </div>

        <div
          style={{
            color: brand.text,
            fontFamily: 'Oswald, sans-serif',
            fontSize: 134,
            fontWeight: 700,
            lineHeight: 0.92,
            letterSpacing: '-0.01em',
            textTransform: 'uppercase',
            opacity: fadeIn(frame, 12, 40),
          }}
        >
          OSDHYAN
        </div>

        <div
          style={{
            maxWidth: 880,
            color: brand.muted,
            fontFamily: 'Poppins, sans-serif',
            fontSize: 34,
            fontWeight: 500,
            lineHeight: 1.42,
            opacity: fadeIn(frame, 16, 46),
          }}
        >
          The complete preparation ecosystem for aspirants who want more than scattered practice. From syllabus to mock to analysis to improvement.
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 14,
            marginTop: 10,
            opacity: fadeIn(frame, 18, 48),
          }}
        >
          {examTracks.map((track, index) => (
            <div
              key={track}
              style={{
                transform: `translateY(${rise(frame, 18 + index * 2, 48 + index * 2, 24)}px)`,
              }}
            >
              <GlowChip text={track} color={index % 2 === 0 ? brand.primary : brand.accent} />
            </div>
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
