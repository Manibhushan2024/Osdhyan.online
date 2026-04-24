import React from 'react';
import {Composition, Folder, Still} from 'remotion';
import {PromoVideo} from './PromoVideo';
import {PromoThumbnail} from './PromoThumbnail';
import {TutorialVideo} from './TutorialVideo';
import {TutorialCover} from './TutorialCover';
import {PROMO_FPS, PROMO_TOTAL_DURATION} from './data';
import {TUTORIAL_TOTAL_WITH_CLOSING} from './tutorialData';
import './fonts';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="marketing">
        <Composition
          id="OSDHYANPromoReel"
          component={PromoVideo}
          durationInFrames={PROMO_TOTAL_DURATION}
          fps={PROMO_FPS}
          width={1080}
          height={1920}
        />
        <Still
          id="OSDHYANPromoThumbnail"
          component={PromoThumbnail}
          width={1080}
          height={1920}
        />
        <Composition
          id="OSDHYANTutorial"
          component={TutorialVideo}
          durationInFrames={TUTORIAL_TOTAL_WITH_CLOSING}
          fps={PROMO_FPS}
          width={1920}
          height={1080}
        />
        <Still
          id="OSDHYANTutorialCover"
          component={TutorialCover}
          width={1920}
          height={1080}
        />
      </Folder>
    </>
  );
};
