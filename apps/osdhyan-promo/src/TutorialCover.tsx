import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BrandBackground} from './components/BrandBackground';
import {BrandMark} from './components/BrandMark';
import {GlowChip} from './components/GlowChip';
import {ScreenCard} from './components/ScreenCard';
import {brand, screenshots} from './data';

export const TutorialCover: React.FC = () => {
  return (
    <AbsoluteFill>
      <BrandBackground />
      <AbsoluteFill style={{padding: '72px 88px'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <GlowChip text="OSDHYAN Platform Guide" color={brand.secondary} />
          <GlowChip text="Section by Section" color={brand.accent} />
        </div>

        <div style={{marginTop: 90, display: 'flex', justifyContent: 'space-between', gap: 40}}>
          <div style={{maxWidth: 860}}>
            <div
              style={{
                color: brand.text,
                fontFamily: 'Oswald, sans-serif',
                fontSize: 118,
                fontWeight: 700,
                textTransform: 'uppercase',
                lineHeight: 0.92,
              }}
            >
              Complete
              <br />
              Platform Walkthrough
            </div>
            <div
              style={{
                marginTop: 22,
                color: brand.muted,
                fontFamily: 'Poppins, sans-serif',
                fontSize: 30,
                lineHeight: 1.5,
              }}
            >
              Learn how to use every student and admin section: tests, analytics, syllabus, materials, productivity
              tools, and AI solutions.
            </div>
          </div>
          <BrandMark size={180} />
        </div>

        <div style={{position: 'absolute', left: 90, right: 90, bottom: 90, height: 420}}>
          <ScreenCard src={screenshots[1]} width={520} height={250} x={0} y={120} rotate={-6} opacity={0.92} />
          <ScreenCard src={screenshots[3]} width={520} height={250} x={360} y={0} rotate={-2} opacity={0.98} />
          <ScreenCard src={screenshots[2]} width={520} height={250} x={720} y={120} rotate={6} opacity={0.92} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
