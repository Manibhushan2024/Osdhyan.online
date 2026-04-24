import React from 'react';
import {AbsoluteFill, Audio, staticFile} from 'remotion';
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {PROMO_TOTAL_DURATION, SCENE_DURATIONS, TRANSITION_DURATION} from './data';
import {HeroScene} from './scenes/HeroScene';
import {EcosystemScene} from './scenes/EcosystemScene';
import {TestFlowScene} from './scenes/TestFlowScene';
import {AnalyticsScene} from './scenes/AnalyticsScene';
import {InstituteScene} from './scenes/InstituteScene';
import {ClosingScene} from './scenes/ClosingScene';

const transitionTiming = linearTiming({durationInFrames: TRANSITION_DURATION});

export const PromoVideo: React.FC = () => {
  return (
    <AbsoluteFill>
      <Audio
        src={staticFile('assets/audio/osdhyan-promo-en.mp3')}
        endAt={PROMO_TOTAL_DURATION}
      />
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.hero}>
          <HeroScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={transitionTiming} />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.ecosystem}>
          <EcosystemScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={transitionTiming} />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.testFlow}>
          <TestFlowScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={transitionTiming} />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.analytics}>
          <AnalyticsScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={transitionTiming} />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.institute}>
          <InstituteScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={transitionTiming} />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.closing}>
          <ClosingScene />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
