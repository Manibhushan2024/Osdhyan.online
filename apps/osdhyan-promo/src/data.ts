export const PROMO_FPS = 30;

export const SCENE_DURATIONS = {
  hero: 180,
  ecosystem: 180,
  testFlow: 200,
  analytics: 200,
  institute: 180,
  closing: 170,
} as const;

export const TRANSITION_DURATION = 18;

export const PROMO_TOTAL_DURATION =
  SCENE_DURATIONS.hero +
  SCENE_DURATIONS.ecosystem +
  SCENE_DURATIONS.testFlow +
  SCENE_DURATIONS.analytics +
  SCENE_DURATIONS.institute +
  SCENE_DURATIONS.closing -
  TRANSITION_DURATION * 5;

export const brand = {
  name: 'OSDHYAN',
  eyebrow: 'Bilingual Exam Preparation Ecosystem',
  primary: '#1367FF',
  secondary: '#19C6FF',
  accent: '#16D6A4',
  warning: '#FFB020',
  danger: '#FF5A6B',
  background: '#06101F',
  backgroundSoft: '#0D1E36',
  backgroundDeep: '#030815',
  text: '#F5F7FB',
  muted: 'rgba(245, 247, 251, 0.72)',
};

export const screenshots = [
  'assets/screenshots/screen-1.png',
  'assets/screenshots/screen-2.png',
  'assets/screenshots/screen-3.png',
  'assets/screenshots/screen-4.png',
  'assets/screenshots/screen-5.png',
];

export const featureCards = [
  'Full Mock Tests',
  'Previous Year Papers',
  'Study Materials',
  'Syllabus Tracking',
  'Performance Analytics',
  'Focus Tools',
  'AI Solution Guidance',
  'Bilingual Experience',
];

export const examTracks = ['PSC', 'SSC', 'AE/JE', 'Banking', 'Insurance', 'Govt Exams'];

export const proofMetrics = [
  {label: 'Languages', value: 'EN + HI'},
  {label: 'Practice Modes', value: 'Mocks + PYQs'},
  {label: 'Insight Layer', value: 'AI + Analytics'},
  {label: 'Focus Stack', value: 'Goals + Timer'},
];

export const voiceover = [
  'Serious exam preparation needs more than random practice.',
  'Meet OSDHYAN, the bilingual preparation ecosystem built for aspirants who want discipline, clarity, and performance.',
  'Attempt full mock tests, switch between English and Hindi, solve previous year papers, and study from structured materials in one place.',
  'Track your accuracy, spot weak areas, and use AI-powered explanations to learn from every mistake.',
  'For institutes, OSDHYAN brings question banks, bilingual workflows, test creation, and content operations into one modern system.',
  'OSDHYAN. Prep smart. Stay consistent. Perform with intent.',
];
