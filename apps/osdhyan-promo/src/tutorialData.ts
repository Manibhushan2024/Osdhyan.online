export type TutorialSection = {
  id: string;
  title: string;
  subtitle: string;
  steps: string[];
  tips?: string[];
  badges?: string[];
  screen?: string;
  layout?: 'left' | 'right';
  durationInFrames?: number;
};

export const TUTORIAL_TRANSITION_DURATION = 18;
export const TUTORIAL_CLOSING_DURATION = 200;
export const DEFAULT_TUTORIAL_DURATION = 210;

export const tutorialSections: TutorialSection[] = [
  {
    id: 'welcome',
    title: 'Welcome to OSDHYAN',
    subtitle: 'A single system for learning, practice, analytics, and disciplined preparation.',
    steps: [
      'Open the platform and choose your exam focus.',
      'Use the sidebar to move between Learn, Tests, Academic, Productivity, and Identity.',
      'Start on the Home dashboard to see your daily plan and study stats.',
    ],
    badges: ['Platform Overview', 'Student Flow'],
    screen: 'assets/screenshots/screen-1.png',
    layout: 'right',
  },
  {
    id: 'access',
    title: 'Login and Profile Setup',
    subtitle: 'Secure sign-in plus exam preference makes your dashboard personalized.',
    steps: [
      'Login with your email or mobile number.',
      'Complete your profile and set exam preference in Dossier.',
      'Confirm your language preference for faster bilingual navigation.',
    ],
    tips: ['Keep your exam preference updated to align tests and materials.'],
    screen: 'assets/screenshots/screen-4.png',
    layout: 'left',
  },
  {
    id: 'dashboard',
    title: 'Home Dashboard',
    subtitle: 'Your command center for daily goals, study time, and active missions.',
    steps: [
      'Review today study plan, streak, and time targets.',
      'Add daily or weekly tasks and mark them complete.',
      'Track total tests attempted and accuracy in real time.',
    ],
    tips: ['Close your day with a quick summary to keep momentum.'],
    screen: 'assets/screenshots/screen-2.png',
    layout: 'right',
  },
  {
    id: 'courses',
    title: 'Courses and Learning',
    subtitle: 'Navigate course libraries by exam, subject, and chapter.',
    steps: [
      'Open Courses to select the exam or domain you are preparing for.',
      'Drill down by subject and chapter to follow the learning path.',
      'Use course assets to build the foundation before attempting mocks.',
    ],
    screen: 'assets/screenshots/screen-5.png',
    layout: 'left',
  },
  {
    id: 'live',
    title: 'Live Classes Console',
    subtitle: 'Join scheduled sessions, revision sprints, and interactive doubt classes.',
    steps: [
      'Open Live Classes to see upcoming sessions and timings.',
      'Join revision sessions or Q and A workshops from the same place.',
      'Use quick links to jump to courses or materials after class.',
    ],
    tips: ['Treat live classes as pre-test sharpening sessions.'],
    layout: 'right',
  },
  {
    id: 'practice',
    title: 'Practice Hub',
    subtitle: 'Choose your practice mode based on speed, accuracy, or exam simulation.',
    steps: [
      'Use Daily Practice Tests for quick accuracy drills.',
      'Open Test Series for full-length simulated missions.',
      'Solve Previous Year Papers to build exam pattern intuition.',
    ],
    screen: 'assets/screenshots/screen-1.png',
    layout: 'left',
  },
  {
    id: 'test-series',
    title: 'Test Series Hub',
    subtitle: 'Browse, enroll, and start exam-series missions with full tracking.',
    steps: [
      'Search for the series that matches your exam category.',
      'Enroll in a series to unlock all tests inside.',
      'Start, resume, or reattempt missions from one panel.',
    ],
    tips: ['Enroll early and follow the series order to build rhythm.'],
    screen: 'assets/screenshots/screen-2.png',
    layout: 'right',
  },
  {
    id: 'test-player',
    title: 'Test Player',
    subtitle: 'Timed, bilingual, and exam-like with negative marking and palette tracking.',
    steps: [
      'Read instructions, accept the declaration, and choose your default language.',
      'Use the question palette to jump between questions and mark for review.',
      'Save and continue, pause when needed, and submit from the mission console.',
    ],
    tips: ['Switch languages anytime to verify tricky questions.'],
    screen: 'assets/screenshots/screen-3.png',
    layout: 'left',
  },
  {
    id: 'results',
    title: 'Results and Performance',
    subtitle: 'Instant debrief with sectional scores, accuracy split, and trend data.',
    steps: [
      'Open the Mission Debrief after submission.',
      'Review total score, accuracy, and time spent.',
      'Analyze sectional strength and weak areas using charts.',
    ],
    tips: ['Download or share the report to track progress weekly.'],
    screen: 'assets/screenshots/screen-5.png',
    layout: 'right',
  },
  {
    id: 'solutions',
    title: 'Solutions and AI Guidance',
    subtitle: 'Detailed explanations plus AI assistance for every question.',
    steps: [
      'Open Detailed Solutions to see correct answers and reasoning.',
      'Filter by correct, wrong, or skipped questions.',
      'Use the AI assistant to ask why a choice was wrong and get shortcuts.',
    ],
    tips: ['Focus on wrong and skipped questions first for maximum improvement.'],
    screen: 'assets/screenshots/screen-4.png',
    layout: 'left',
  },
  {
    id: 'academic',
    title: 'Academic Tools',
    subtitle: 'Syllabus explorer, notes, materials, and blogs for continuous learning.',
    steps: [
      'Use Syllabus Explorer to view subjects, chapters, and topics.',
      'Open Materials to access PDFs, images, and curated resources.',
      'Use Notes and Blogs for revision, summaries, and strategy.',
    ],
    screen: 'assets/screenshots/screen-1.png',
    layout: 'right',
  },
  {
    id: 'productivity',
    title: 'Productivity Stack',
    subtitle: 'Focus Terminal and Growth Lab keep your preparation disciplined.',
    steps: [
      'Start a Focus Session to track deep work time.',
      'Set study goals by subject or chapter and monitor progress.',
      'Review milestones to ensure you stay on schedule.',
    ],
    tips: ['Treat focus sessions like non-negotiable study sprints.'],
    screen: 'assets/screenshots/screen-2.png',
    layout: 'left',
  },
  {
    id: 'identity',
    title: 'Identity and Settings',
    subtitle: 'Profile, performance overview, and account preferences live here.',
    steps: [
      'Open Dossier to edit profile, exam preference, and avatar.',
      'Use Performance for advanced analytics and topic insights.',
      'Update settings or open Help Hub for support.',
    ],
    screen: 'assets/screenshots/screen-5.png',
    layout: 'right',
  },
  {
    id: 'admin',
    title: 'Admin and Institute Control',
    subtitle: 'For coaching teams: content creation, test pipelines, and analytics.',
    steps: [
      'Use Test Series Manager to publish and control exam series.',
      'Create tests with the wizard and attach questions from the bank.',
      'Manage the question bank, upload materials, and track analytics.',
    ],
    tips: ['Standardize bilingual content for consistent student experience.'],
    screen: 'assets/screenshots/screen-3.png',
    layout: 'left',
  },
];

export const TUTORIAL_TOTAL_DURATION =
  tutorialSections.reduce(
    (total, section) => total + (section.durationInFrames ?? DEFAULT_TUTORIAL_DURATION),
    0,
  ) -
  TUTORIAL_TRANSITION_DURATION * (tutorialSections.length - 1);

export const TUTORIAL_TOTAL_WITH_CLOSING =
  TUTORIAL_TOTAL_DURATION + TUTORIAL_CLOSING_DURATION - TUTORIAL_TRANSITION_DURATION;

export const tutorialVoiceover = [
  'Welcome to OSDHYAN, the complete preparation ecosystem for serious aspirants.',
  'We will quickly walk through every major section so you can start using the platform with confidence.',
  'From the home dashboard to mock tests, analytics, and AI guidance, everything stays in one workflow.',
  'Use the Academic and Productivity sections to keep your learning structured and disciplined.',
  'Coaching teams can manage question banks, create tests, and operate content at scale.',
  'OSDHYAN turns preparation into a repeatable, results-driven system.',
];
