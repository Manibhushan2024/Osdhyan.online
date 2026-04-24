import {loadFont as loadHeadlineFont} from '@remotion/google-fonts/Oswald';
import {loadFont as loadBodyFont} from '@remotion/google-fonts/Poppins';

const headline = loadHeadlineFont('normal', {
  weights: ['500', '700'],
  subsets: ['latin'],
});

const body = loadBodyFont('normal', {
  weights: ['400', '600', '700'],
  subsets: ['latin'],
});

export const fonts = {
  headline: headline.fontFamily,
  body: body.fontFamily,
};
