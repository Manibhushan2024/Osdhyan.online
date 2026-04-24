import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {BrandBackground} from '../components/BrandBackground';
import {BrandMark} from '../components/BrandMark';
import {GlowChip} from '../components/GlowChip';
import {brand, examTracks} from '../data';
import {fadeIn, rise, smoothSpring} from '../components/motion';

export const TutorialClosingScene: React.FC = () => {
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
          padding: '80px 120px',
          gap: 24,
        }}
      >
        <div
          style={{
            transform: `translateY(${rise(frame, 0, 28, 28)}px) scale(${0.95 + outroSpring * 0.05})`,
            opacity: fadeIn(frame, 0, 28),
          }}
        >
          <BrandMark size={190} />
        </div>

        <div
          style={{
            color: brand.secondary,
            fontFamily: 'Poppins, sans-serif',
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            opacity: fadeIn(frame, 10, 36),
          }}
        >
          Platform Walkthrough Complete
        </div>

        <div
          style={{
            color: brand.text,
            fontFamily: 'Oswald, sans-serif',
            fontSize: 104,
            fontWeight: 700,
            lineHeight: 0.92,
            textTransform: 'uppercase',
            opacity: fadeIn(frame, 12, 40),
          }}
        >
          Start Your
          <br />
          Next Mission
        </div>

        <div
          style={{
            maxWidth: 980,
            color: brand.muted,
            fontFamily: 'Poppins, sans-serif',
            fontSize: 28,
            fontWeight: 500,
            lineHeight: 1.5,
            opacity: fadeIn(frame, 16, 46),
          }}
        >
          Use the sidebar, keep your goals active, and review every result with AI assistance. This is how
          OSDHYAN turns preparation into a repeatable system.
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 12,
            marginTop: 6,
            opacity: fadeIn(frame, 18, 48),
          }}
        >
          {examTracks.map((track, index) => (
            <div
              key={track}
              style={{
                transform: `translateY(${rise(frame, 18 + index * 2, 48 + index * 2, 20)}px)`,
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
