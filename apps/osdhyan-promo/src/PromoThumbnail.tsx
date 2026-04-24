import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BrandBackground} from './components/BrandBackground';
import {BrandMark} from './components/BrandMark';
import {GlowChip} from './components/GlowChip';
import {ScreenCard} from './components/ScreenCard';
import {brand, screenshots} from './data';

export const PromoThumbnail: React.FC = () => {
  return (
    <AbsoluteFill>
      <BrandBackground />
      <AbsoluteFill style={{padding: '88px 78px'}}>
        <div style={{display: 'flex', justifyContent: 'space-between'}}>
          <GlowChip text="OSDHYAN" />
          <GlowChip text="Bilingual Exam Ecosystem" color={brand.accent} />
        </div>

        <div style={{marginTop: 110, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <div style={{maxWidth: 680}}>
            <div
              style={{
                color: brand.secondary,
                fontFamily: 'Poppins, sans-serif',
                fontSize: 24,
                fontWeight: 700,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
              }}
            >
              Mock Tests. PYQs. Analytics. AI Guidance.
            </div>
            <div
              style={{
                marginTop: 18,
                color: brand.text,
                fontFamily: 'Oswald, sans-serif',
                fontSize: 138,
                fontWeight: 700,
                lineHeight: 0.9,
                textTransform: 'uppercase',
              }}
            >
              Prep Smart.
              <br />
              Perform Better.
            </div>
          </div>

          <BrandMark size={200} />
        </div>

        <div style={{position: 'absolute', left: 78, right: 78, bottom: 110, height: 560}}>
          <ScreenCard src={screenshots[0]} width={480} height={240} x={0} y={200} rotate={-8} opacity={0.88} />
          <ScreenCard src={screenshots[2]} width={520} height={250} x={284} y={56} rotate={-2} opacity={0.98} />
          <ScreenCard src={screenshots[4]} width={468} height={226} x={636} y={216} rotate={8} opacity={0.9} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
