import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {BrandBackground} from '../components/BrandBackground';
import {GlowChip} from '../components/GlowChip';
import {ScreenCard} from '../components/ScreenCard';
import {SectionTitle} from '../components/SectionTitle';
import {brand, screenshots} from '../data';
import {fadeIn, rise} from '../components/motion';

const operations = [
  'Question Bank Management',
  'Test Creation Wizard',
  'Bilingual Content Workflow',
  'AI Content Extraction',
];

export const InstituteScene: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill>
      <BrandBackground />
      <AbsoluteFill style={{padding: '94px 78px'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <GlowChip text="Student + Institute Ready" color={brand.warning} />
          <GlowChip text="Scale Content Operations" color={brand.primary} />
        </div>

        <div style={{marginTop: 72, width: 880}}>
          <SectionTitle
            eyebrow="Built for coaching teams too"
            title={
              <>
                Content Control.
                <br />
                Delivery At Scale.
              </>
            }
            description="OSDHYAN helps institutes create tests, manage bilingual question banks, organize study materials, and modernize the academic workflow behind serious preparation."
          />
        </div>

        <div
          style={{
            position: 'absolute',
            left: 78,
            right: 78,
            bottom: 100,
            display: 'grid',
            gridTemplateColumns: '0.95fr 1.05fr',
            gap: 26,
          }}
        >
          <div style={{display: 'grid', gap: 18}}>
            {operations.map((item, index) => (
              <div
                key={item}
                style={{
                  transform: `translateY(${rise(frame, 8 + index * 4, 40 + index * 4, 28)}px)`,
                  opacity: fadeIn(frame, 8 + index * 4, 40 + index * 4),
                  padding: '30px 30px',
                  borderRadius: 30,
                  border: '1px solid rgba(255,255,255,0.12)',
                  background: 'rgba(255,255,255,0.05)',
                  boxShadow: '0 20px 60px rgba(3, 8, 21, 0.44)',
                }}
              >
                <div
                  style={{
                    color: brand.secondary,
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: 19,
                    fontWeight: 700,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                  }}
                >
                  Operations
                </div>
                <div
                  style={{
                    marginTop: 10,
                    color: brand.text,
                    fontFamily: 'Oswald, sans-serif',
                    fontSize: 42,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    lineHeight: 1,
                  }}
                >
                  {item}
                </div>
              </div>
            ))}
          </div>

          <div style={{position: 'relative', height: 720}}>
            <ScreenCard
              src={screenshots[0]}
              width={522}
              height={260}
              x={46}
              y={40}
              rotate={-4}
              opacity={0.95}
            />
            <ScreenCard
              src={screenshots[1]}
              width={546}
              height={268}
              x={94}
              y={258}
              rotate={5}
              opacity={0.98}
            />
            <div
              style={{
                position: 'absolute',
                left: 0,
                bottom: 0,
                width: 470,
                padding: '28px 28px',
                borderRadius: 28,
                border: `1px solid ${brand.accent}33`,
                background: 'rgba(255,255,255,0.06)',
                boxShadow: '0 18px 50px rgba(3, 8, 21, 0.46)',
              }}
            >
              <div
                style={{
                  color: brand.accent,
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: 18,
                  fontWeight: 700,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                }}
              >
                Outcome
              </div>
              <div
                style={{
                  marginTop: 12,
                  color: brand.text,
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: 28,
                  fontWeight: 600,
                  lineHeight: 1.42,
                }}
              >
                A modern academic engine for institutes that want better content speed, cleaner workflows, and smarter delivery.
              </div>
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
