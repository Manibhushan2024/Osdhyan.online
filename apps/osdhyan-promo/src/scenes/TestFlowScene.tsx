import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {BrandBackground} from '../components/BrandBackground';
import {GlowChip} from '../components/GlowChip';
import {ScreenCard} from '../components/ScreenCard';
import {SectionTitle} from '../components/SectionTitle';
import {brand, screenshots} from '../data';
import {fadeIn, rise} from '../components/motion';

const badges = [
  {text: 'English <-> Hindi', color: brand.secondary},
  {text: 'Timed Full Mocks', color: brand.primary},
  {text: 'Negative Marking', color: brand.warning},
  {text: 'Resume Attempts', color: brand.accent},
];

export const TestFlowScene: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill>
      <BrandBackground />
      <AbsoluteFill style={{padding: '96px 78px'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <GlowChip text="Real Exam Simulation" color={brand.primary} />
          <GlowChip text="Precision Under Pressure" color={brand.secondary} />
        </div>

        <div style={{marginTop: 70, width: 720}}>
          <SectionTitle
            eyebrow="Exam pressure. Real control."
            title={
              <>
                Switch Language.
                <br />
                Stay In Flow.
              </>
            }
            description="Students can take timed tests, manage navigation under pressure, and continue incomplete attempts without losing momentum."
          />
        </div>

        <div style={{position: 'absolute', left: 74, right: 74, bottom: 92, top: 660}}>
          <div
            style={{
              position: 'absolute',
              left: 112,
              top: 0,
              width: 518,
              height: 870,
              borderRadius: 64,
              border: '1px solid rgba(255,255,255,0.14)',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.04))',
              boxShadow: '0 30px 100px rgba(3, 8, 21, 0.56)',
            }}
          />
          <ScreenCard
            src={screenshots[2]}
            width={454}
            height={760}
            x={144}
            y={42}
            rotate={0}
            opacity={1}
          />

          {badges.map((badge, index) => (
            <div
              key={badge.text}
              style={{
                position: 'absolute',
                right: 16,
                top: 40 + index * 154,
                width: 324,
                transform: `translateY(${rise(frame, 12 + index * 4, 44 + index * 4, 30)}px)`,
                opacity: fadeIn(frame, 12 + index * 4, 42 + index * 4),
                padding: '28px 28px',
                borderRadius: 28,
                border: `1px solid ${badge.color}40`,
                background: 'rgba(255,255,255,0.06)',
                boxShadow: `0 18px 50px ${badge.color}1e`,
                backdropFilter: 'blur(18px)',
              }}
            >
              <div
                style={{
                  color: badge.color,
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: 20,
                  fontWeight: 700,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                }}
              >
                Feature
              </div>
              <div
                style={{
                  marginTop: 12,
                  color: brand.text,
                  fontFamily: 'Oswald, sans-serif',
                  fontSize: 42,
                  fontWeight: 700,
                  lineHeight: 1,
                  textTransform: 'uppercase',
                }}
              >
                {badge.text}
              </div>
            </div>
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
