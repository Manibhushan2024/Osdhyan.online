import React from 'react';
import {AbsoluteFill, Audio, staticFile} from 'remotion';
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {TutorialSceneFrame} from './components/TutorialSceneFrame';
import {
  tutorialSections,
  TUTORIAL_CLOSING_DURATION,
  TUTORIAL_TOTAL_WITH_CLOSING,
  TUTORIAL_TRANSITION_DURATION,
} from './tutorialData';
import {TutorialClosingScene} from './scenes/TutorialClosingScene';

const transitionTiming = linearTiming({durationInFrames: TUTORIAL_TRANSITION_DURATION});

export const TutorialVideo: React.FC = () => {
  return (
    <AbsoluteFill>
      <Audio
        src={staticFile('assets/audio/osdhyan-tutorial-hi.mp3')}
        endAt={TUTORIAL_TOTAL_WITH_CLOSING}
      />
      <TransitionSeries>
        {tutorialSections.map((section, index) => (
          <React.Fragment key={section.id}>
            <TransitionSeries.Sequence durationInFrames={section.durationInFrames ?? 210}>
              <TutorialSceneFrame section={section} />
            </TransitionSeries.Sequence>
            {index < tutorialSections.length - 1 ? (
              <TransitionSeries.Transition presentation={fade()} timing={transitionTiming} />
            ) : null}
          </React.Fragment>
        ))}
        <TransitionSeries.Transition presentation={fade()} timing={transitionTiming} />
        <TransitionSeries.Sequence durationInFrames={TUTORIAL_CLOSING_DURATION}>
          <TutorialClosingScene />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
