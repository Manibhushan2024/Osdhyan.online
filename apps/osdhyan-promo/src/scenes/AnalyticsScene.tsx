import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {BrandBackground} from '../components/BrandBackground';
import {GlowChip} from '../components/GlowChip';
import {SectionTitle} from '../components/SectionTitle';
import {brand} from '../data';
import {fadeIn, rise} from '../components/motion';

const strengths = ['Strength Mapping', 'Weak Area Signals', 'Section Insights', 'AI Solution Guidance'];

export const AnalyticsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const bars = [0.52, 0.78, 0.68, 0.88, 0.74, 0.93];

  return (
    <AbsoluteFill>
      <BrandBackground />
      <AbsoluteFill style={{padding: '96px 78px'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <GlowChip text="Performance Intelligence" color={brand.accent} />
          <GlowChip text="AI Powered Explanations" color={brand.secondary} />
        </div>

        <div style={{marginTop: 72, width: 800}}>
          <SectionTitle
            eyebrow="Every attempt becomes strategy"
            title={
              <>
                Learn From
                <br />
                Every Mistake.
              </>
            }
            description="OSDHYAN turns raw scores into action. Students review performance trends, spot weak zones, and use AI-backed explanations to improve faster."
          />
        </div>

        <div
          style={{
            position: 'absolute',
            left: 78,
            right: 78,
            bottom: 110,
            display: 'grid',
            gridTemplateColumns: '1.25fr 0.9fr',
            gap: 28,
          }}
        >
          <div
            style={{
              padding: '36px 34px',
              borderRadius: 34,
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.04))',
              boxShadow: '0 26px 80px rgba(3, 8, 21, 0.50)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  color: brand.text,
                  fontFamily: 'Oswald, sans-serif',
                  fontSize: 46,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                }}
              >
                Accuracy Momentum
              </div>
              <div
                style={{
                  color: brand.accent,
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: 24,
                  fontWeight: 700,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                }}
              >
                +12%
              </div>
            </div>

            <div
              style={{
                marginTop: 34,
                height: 440,
                display: 'flex',
                alignItems: 'flex-end',
                gap: 20,
              }}
            >
              {bars.map((bar, index) => (
                <div
                  key={bar}
                  style={{
                    flex: 1,
                    height: 420,
                    borderRadius: 24,
                    display: 'flex',
                    alignItems: 'flex-end',
                    background: 'rgba(255,255,255,0.05)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      height: `${bar * 100}%`,
                      borderRadius: 24,
                      transform: `translateY(${rise(frame, index * 3, 34 + index * 3, 130)}px)`,
                      opacity: fadeIn(frame, index * 3, 38 + index * 3),
                      background:
                        index >= 4
                          ? `linear-gradient(180deg, ${brand.accent}, ${brand.secondary})`
                          : `linear-gradient(180deg, ${brand.primary}, ${brand.secondary})`,
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div style={{display: 'grid', gap: 22}}>
            {strengths.map((item, index) => (
              <div
                key={item}
                style={{
                  transform: `translateY(${rise(frame, 6 + index * 3, 34 + index * 3, 28)}px)`,
                  opacity: fadeIn(frame, 6 + index * 3, 36 + index * 3),
                  padding: '28px 28px',
                  borderRadius: 30,
                  border: '1px solid rgba(255,255,255,0.12)',
                  background: 'rgba(255,255,255,0.05)',
                  boxShadow: '0 20px 60px rgba(3, 8, 21, 0.44)',
                }}
              >
                <div
                  style={{
                    color: index % 2 === 0 ? brand.secondary : brand.accent,
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: 19,
                    fontWeight: 700,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                  }}
                >
                  Insight Layer
                </div>
                <div
                  style={{
                    marginTop: 10,
                    color: brand.text,
                    fontFamily: 'Oswald, sans-serif',
                    fontSize: 40,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    lineHeight: 1,
                  }}
                >
                  {item}
                </div>
                <div
                  style={{
                    marginTop: 12,
                    color: brand.muted,
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: 22,
                    lineHeight: 1.45,
                  }}
                >
                  Convert performance data into a clear next move, not just another scorecard.
                </div>
              </div>
            ))}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
