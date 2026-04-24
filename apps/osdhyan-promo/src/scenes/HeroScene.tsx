import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {BrandBackground} from '../components/BrandBackground';
import {GlowChip} from '../components/GlowChip';
import {MetricCard} from '../components/MetricCard';
import {ScreenCard} from '../components/ScreenCard';
import {SectionTitle} from '../components/SectionTitle';
import {brand, proofMetrics, screenshots} from '../data';
import {drift, fadeIn, rise, smoothSpring} from '../components/motion';

export const HeroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const titleProgress = smoothSpring(frame, fps, 0, 36);
  const stackProgress = smoothSpring(frame, fps, 18, 44);
  const metricOpacity = fadeIn(frame, 22, 58);

  return (
    <AbsoluteFill>
      <BrandBackground />
      <AbsoluteFill style={{padding: '96px 78px'}}>
        <div style={{display: 'flex', justifyContent: 'space-between'}}>
          <GlowChip text="OSDHYAN // PREP OS" />
          <GlowChip text="For Serious Aspirants" color={brand.accent} />
        </div>

        <div
          style={{
            display: 'flex',
            marginTop: 88,
            justifyContent: 'space-between',
            gap: 50,
          }}
        >
          <div
            style={{
              flex: 1,
              transform: `translateY(${rise(frame, 0, 28, 44)}px) scale(${0.96 + titleProgress * 0.04})`,
              opacity: titleProgress,
            }}
          >
            <SectionTitle
              eyebrow="One ecosystem. Every preparation move."
              title={
                <>
                  Serious
                  <br />
                  Preparation.
                  <br />
                  One System.
                </>
              }
              description="Bilingual mocks, PYQs, analytics, study materials, focus tools, and AI solution guidance built into one premium exam workflow."
            />
          </div>

          <div style={{width: 330, paddingTop: 26, display: 'grid', gap: 18}}>
            {proofMetrics.map((metric, index) => (
              <div
                key={metric.label}
                style={{
                  transform: `translateY(${rise(frame, 10 + index * 6, 36 + index * 6, 32)}px)`,
                  opacity: metricOpacity,
                }}
              >
                <MetricCard label={metric.label} value={metric.value} />
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            left: 74,
            right: 78,
            bottom: 118,
            height: 620,
          }}
        >
          <ScreenCard
            src={screenshots[0]}
            width={510}
            height={260}
            x={28 + stackProgress * 8}
            y={170 + drift(frame, 16, 160)}
            rotate={-9}
            scale={0.98 + stackProgress * 0.04}
            opacity={0.82}
          />
          <ScreenCard
            src={screenshots[1]}
            width={560}
            height={280}
            x={262}
            y={72 + drift(frame, 22, 170)}
            rotate={-2}
            scale={0.96 + stackProgress * 0.07}
          />
          <ScreenCard
            src={screenshots[2]}
            width={498}
            height={250}
            x={610 - stackProgress * 10}
            y={198 + drift(frame, 14, 190)}
            rotate={8}
            scale={0.96 + stackProgress * 0.04}
            opacity={0.88}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
