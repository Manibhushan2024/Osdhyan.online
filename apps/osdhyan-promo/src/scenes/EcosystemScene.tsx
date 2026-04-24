import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {BrandBackground} from '../components/BrandBackground';
import {GlowChip} from '../components/GlowChip';
import {ScreenCard} from '../components/ScreenCard';
import {SectionTitle} from '../components/SectionTitle';
import {brand, featureCards, screenshots} from '../data';
import {fadeIn, rise} from '../components/motion';

export const EcosystemScene: React.FC = () => {
  const frame = useCurrentFrame();
  const panelIn = fadeIn(frame, 0, 26);

  return (
    <AbsoluteFill>
      <BrandBackground />
      <AbsoluteFill style={{padding: '94px 78px'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <GlowChip text="Beyond Mock Tests" color={brand.warning} />
          <div
            style={{
              color: brand.muted,
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 600,
              fontSize: 24,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
            }}
          >
            Learn • Practice • Improve
          </div>
        </div>

        <div style={{marginTop: 72}}>
          <SectionTitle
            eyebrow="Built like a preparation operating system"
            title={
              <>
                Not Just A
                <br />
                Mock Test App.
              </>
            }
            description="OSDHYAN connects practice, revision, materials, syllabus planning, and focus management so aspirants stop switching between disconnected tools."
          />
        </div>

        <div
          style={{
            marginTop: 74,
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: 22,
            width: 620,
          }}
        >
          {featureCards.map((feature, index) => (
            <div
              key={feature}
              style={{
                transform: `translateY(${rise(frame, 8 + index * 2, 28 + index * 2, 28)}px)`,
                opacity: fadeIn(frame, 8 + index * 2, 30 + index * 2),
                padding: '26px 28px',
                borderRadius: 28,
                border: '1px solid rgba(245,247,251,0.12)',
                background: 'linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.04))',
                boxShadow: '0 20px 50px rgba(3, 8, 21, 0.42)',
                color: brand.text,
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 700,
                fontSize: 26,
                letterSpacing: '0.03em',
                textTransform: 'uppercase',
              }}
            >
              {feature}
            </div>
          ))}
        </div>

        <div style={{position: 'absolute', right: 78, top: 350, width: 420, height: 880}}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 42,
              background: 'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
              border: '1px solid rgba(255,255,255,0.10)',
              boxShadow: '0 26px 80px rgba(3, 8, 21, 0.50)',
              opacity: panelIn,
            }}
          />
          <ScreenCard
            src={screenshots[3]}
            width={350}
            height={122}
            x={34}
            y={48}
            rotate={-1.5}
            opacity={0.96}
          />
          <ScreenCard
            src={screenshots[4]}
            width={340}
            height={160}
            x={42}
            y={212}
            rotate={3}
            opacity={0.95}
          />
          <ScreenCard
            src={screenshots[0]}
            width={336}
            height={168}
            x={36}
            y={424}
            rotate={-4}
            opacity={0.9}
          />
          <div
            style={{
              position: 'absolute',
              left: 34,
              right: 34,
              bottom: 44,
              padding: '24px 26px',
              borderRadius: 28,
              background: 'rgba(255,255,255,0.05)',
              border: `1px solid ${brand.accent}33`,
              color: brand.text,
              fontFamily: 'Poppins, sans-serif',
              fontSize: 24,
              lineHeight: 1.45,
            }}
          >
            A single dashboard for mock tests, PYQs, study assets, progress tracking, and daily focus routines.
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
