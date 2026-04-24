import {Easing, interpolate, spring} from 'remotion';

export const smoothSpring = (frame: number, fps: number, delay = 0, durationInFrames = 32) => {
  return spring({
    frame: frame - delay,
    fps,
    durationInFrames,
    config: {damping: 200},
  });
};

export const fadeIn = (frame: number, start: number, end: number) => {
  return interpolate(frame, [start, end], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
};

export const fadeOut = (frame: number, start: number, end: number) => {
  return interpolate(frame, [start, end], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.in(Easing.cubic),
  });
};

export const rise = (frame: number, start: number, end: number, distance = 40) => {
  return interpolate(frame, [start, end], [distance, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
};

export const drift = (frame: number, distance: number, speed = 140) => {
  return Math.sin(frame / speed) * distance;
};
