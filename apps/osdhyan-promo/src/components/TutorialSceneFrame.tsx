import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {BrandBackground} from './BrandBackground';
import {ScreenCard} from './ScreenCard';
import {GlowChip} from './GlowChip';
import {brand} from '../data';
import {TutorialSection} from '../tutorialData';
import {fadeIn, rise, smoothSpring} from './motion';

const StepItem: React.FC<{index: number; text: string; delay: number}> = ({index, text, delay}) => {
  const frame = useCurrentFrame();
  const opacity = fadeIn(frame, delay, delay + 24);
  const y = rise(frame, delay, delay + 24, 24);

  return (
    <div
      style={{
        display: 'flex',
        gap: 16,
        alignItems: 'flex-start',
        transform: `translateY(${y}px)`,
        opacity,
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.2)',
          color: brand.secondary,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Oswald, sans-serif',
          fontSize: 20,
          fontWeight: 700,
        }}
      >
        {index + 1}
      </div>
      <div
        style={{
          color: brand.text,
          fontFamily: 'Poppins, sans-serif',
          fontSize: 26,
          fontWeight: 500,
          lineHeight: 1.4,
        }}
      >
        {text}
      </div>
    </div>
  );
};

export const TutorialSceneFrame: React.FC<{section: TutorialSection}> = ({section}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const headlineSpring = smoothSpring(frame, fps, 0, 30);
  const bodyOpacity = fadeIn(frame, 10, 36);

  const textBlock = (
    <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 22}}>
      <div style={{display: 'flex', gap: 12, flexWrap: 'wrap'}}>
        {(section.badges || ['Section Walkthrough']).map((badge) => (
          <GlowChip key={badge} text={badge} color={brand.secondary} />
        ))}
      </div>
      <div
        style={{
          color: brand.text,
          fontFamily: 'Oswald, sans-serif',
          fontSize: 92,
          fontWeight: 700,
          lineHeight: 0.95,
          textTransform: 'uppercase',
          opacity: headlineSpring,
          transform: `translateY(${rise(frame, 0, 24, 32)}px)`,
        }}
      >
        {section.title}
      </div>
      <div
        style={{
          color: brand.muted,
          fontFamily: 'Poppins, sans-serif',
          fontSize: 30,
          fontWeight: 500,
          lineHeight: 1.5,
          opacity: bodyOpacity,
          maxWidth: 760,
        }}
      >
        {section.subtitle}
      </div>
      <div style={{display: 'grid', gap: 18, marginTop: 10}}>
        {section.steps.map((step, index) => (
          <StepItem key={step} index={index} text={step} delay={18 + index * 6} />
        ))}
      </div>
      {section.tips && section.tips.length > 0 ? (
        <div
          style={{
            marginTop: 18,
            padding: '18px 22px',
            borderRadius: 18,
            border: `1px solid ${brand.accent}40`,
            background: 'rgba(22, 214, 164, 0.08)',
            color: brand.text,
            fontFamily: 'Poppins, sans-serif',
            fontSize: 24,
            lineHeight: 1.4,
            opacity: fadeIn(frame, 24, 46),
          }}
        >
          {section.tips.join(' ')}
        </div>
      ) : null}
    </div>
  );

  const visualBlock = (
    <div style={{flex: 1, position: 'relative', minHeight: 640}}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 36,
          border: '1px solid rgba(255,255,255,0.12)',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))',
          boxShadow: '0 30px 90px rgba(3, 8, 21, 0.55)',
        }}
      />
      {section.screen ? (
        <ScreenCard
          src={section.screen}
          width={720}
          height={420}
          x={56}
          y={110}
          rotate={section.layout === 'left' ? 4 : -4}
          opacity={0.98}
        />
      ) : (
        <div
          style={{
            position: 'absolute',
            inset: 60,
            borderRadius: 28,
            border: '1px dashed rgba(255,255,255,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: brand.muted,
            fontFamily: 'Poppins, sans-serif',
            fontSize: 24,
            textTransform: 'uppercase',
            letterSpacing: '0.18em',
          }}
        >
          Section Preview
        </div>
      )}
    </div>
  );

  return (
    <AbsoluteFill>
      <BrandBackground />
      <AbsoluteFill
        style={{
          padding: '70px 84px',
          display: 'flex',
          gap: 54,
          alignItems: 'center',
        }}
      >
        {section.layout === 'left' ? (
          <>
            {visualBlock}
            {textBlock}
          </>
        ) : (
          <>
            {textBlock}
            {visualBlock}
          </>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
