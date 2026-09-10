export const OnboardingColors = {
  background: '#000000',
  backgroundTop: '#0A1A3A',
  backgroundMid: '#061028',
  surface: 'rgba(255, 255, 255, 0.08)',
  surfaceSolid: '#1C1C1E',
  surfaceElevated: '#2C2C2E',
  text: '#FFFFFF',
  textSecondary: '#A0A8B8',
  textMuted: '#6B7280',
  link: '#5B9EFF',
  primaryButton: '#FFFFFF',
  primaryButtonText: '#000000',
  secondaryButton: '#2C2C2E',
  secondaryButtonText: '#FFFFFF',
  disabledButton: '#3A3A3C',
  disabledButtonText: '#8E8E93',
  border: 'rgba(255, 255, 255, 0.12)',
  error: '#FF453A',
  success: '#8E8E93',
  progressActive: '#FFFFFF',
  progressInactive: 'rgba(255, 255, 255, 0.2)',
  accent: '#5B9EFF',
} as const;

export const BRAND_NAME = 'Micro Sub Tracker';
export const BRAND_NAME_FULL = 'Micro Sub Tracker';

export type WelcomeSlide = {
  id: string;
  headline: string;
  subtitle?: string;
  theme: 'dark' | 'light';
  visual: 'control' | 'track' | 'remind';
};

export const WELCOME_SLIDES: WelcomeSlide[] = [
  {
    id: 'control',
    headline: 'READY TO STOP LOSING MONEY TO SUBSCRIPTIONS?',
    theme: 'dark',
    visual: 'control',
  },
  {
    id: 'track',
    headline: 'SEE WHERE YOUR MONEY ACTUALLY GOES',
    subtitle: 'One clear monthly total — so small charges stop sneaking past you.',
    theme: 'light',
    visual: 'track',
  },
  {
    id: 'remind',
    headline: 'GET WARNED BEFORE YOU GET CHARGED',
    subtitle: 'We\'ll nudge you before trials end and renewals hit — in time to cancel.',
    theme: 'dark',
    visual: 'remind',
  },
];

export type Country = {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
};

export const COUNTRIES: Country[] = [
  { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', dialCode: '+61', flag: '🇦🇺' },
  { code: 'BD', name: 'Bangladesh', dialCode: '+880', flag: '🇧🇩' },
  { code: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳' },
  { code: 'SG', name: 'Singapore', dialCode: '+65', flag: '🇸🇬' },
  { code: 'DE', name: 'Germany', dialCode: '+49', flag: '🇩🇪' },
  { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷' },
  { code: 'JP', name: 'Japan', dialCode: '+81', flag: '🇯🇵' },
  { code: 'KR', name: 'South Korea', dialCode: '+82', flag: '🇰🇷' },
  { code: 'BR', name: 'Brazil', dialCode: '+55', flag: '🇧🇷' },
  { code: 'MX', name: 'Mexico', dialCode: '+52', flag: '🇲🇽' },
  { code: 'AE', name: 'United Arab Emirates', dialCode: '+971', flag: '🇦🇪' },
  { code: 'ID', name: 'Indonesia', dialCode: '+62', flag: '🇮🇩' },
  { code: 'PH', name: 'Philippines', dialCode: '+63', flag: '🇵🇭' },
  { code: 'PK', name: 'Pakistan', dialCode: '+92', flag: '🇵🇰' },
  { code: 'NG', name: 'Nigeria', dialCode: '+234', flag: '🇳🇬' },
  { code: 'ZA', name: 'South Africa', dialCode: '+27', flag: '🇿🇦' },
  { code: 'NL', name: 'Netherlands', dialCode: '+31', flag: '🇳🇱' },
];

export type InterestOption = {
  id: string;
  label: string;
  icon: string;
};

export type InterestSection = {
  id: string;
  title: string;
  options: InterestOption[];
};

export const INTEREST_SECTIONS: InterestSection[] = [
  {
    id: 'goals',
    title: 'What do you want help with?',
    options: [
      { id: 'monthly-spend', label: 'Know my monthly spend', icon: '💸' },
      { id: 'surprise-charges', label: 'Stop surprise charges', icon: '🛡️' },
      { id: 'cut-costs', label: 'Cut what I don\'t use', icon: '✂️' },
      { id: 'upcoming-bills', label: 'See what\'s renewing soon', icon: '📅' },
      { id: 'family-share', label: 'Keep family plans tidy', icon: '👨‍👩‍👧' },
    ],
  },
  {
    id: 'pain',
    title: 'What usually catches you out?',
    options: [
      { id: 'forgotten-trials', label: 'Forgotten free trials', icon: '⏳' },
      { id: 'unused-subs', label: 'Apps I forgot I\'m paying for', icon: '🫥' },
      { id: 'hard-to-cancel', label: 'Hard-to-cancel services', icon: '🚪' },
      { id: 'renewal-reminders', label: 'Missing renewal dates', icon: '🔔' },
      { id: 'foreign-charges', label: 'Charges in other currencies', icon: '🌍' },
    ],
  },
];

export type PlanBenefit = {
  id: string;
  icon: string;
  perkLabel: string;
  title: string;
  description: string;
};

export type PlanTier = {
  id: 'plus' | 'pro';
  name: string;
  priceLabel: string;
  tagline: string;
  badge?: string;
  accent: readonly [string, string];
  benefits: PlanBenefit[];
  cta: string;
  billingNote: string;
};

export const PLANS: PlanTier[] = [
  {
    id: 'plus',
    name: 'Plus',
    priceLabel: '$2.49/month',
    tagline: 'Clarity and reminders so renewals never catch you off guard',
    badge: 'Popular',
    accent: ['#1B3A6B', '#0A1528'],
    benefits: [
      {
        id: 'spend',
        icon: '💸',
        perkLabel: 'Know your\nmonthly total',
        title: 'Know your real monthly spend',
        description: 'One clear total across every plan — no spreadsheet needed',
      },
      {
        id: 'upcoming',
        icon: '📅',
        perkLabel: 'See what\'s\ncoming up',
        title: 'See renewals before they hit',
        description: 'A simple view of what\'s charging soon, so you can decide in time',
      },
      {
        id: 'trials',
        icon: '⏳',
        perkLabel: 'Trial end\nwarnings',
        title: 'Never sleep through a free trial',
        description:
          'Friendly warnings before a trial turns into a paid plan, plus a direct link to that service\'s cancel page',
      },
      {
        id: 'reminders',
        icon: '🔔',
        perkLabel: 'Renewal\nnudges',
        title: 'Get a heads-up before you\'re charged',
        description: 'A push like “Netflix renews tomorrow — $15.49” so you can act first',
      },
    ],
    cta: 'Get Plus',
    billingNote: '$2.49/month. Cancel anytime.',
  },
  {
    id: 'pro',
    name: 'Pro',
    priceLabel: '$4.99/month',
    tagline: 'Extra help to find waste, cancel faster, and stay in control',
    badge: 'Best value',
    accent: ['#3D2A6B', '#12081F'],
    benefits: [
      {
        id: 'receipt-scan',
        icon: '🧾',
        perkLabel: 'Scan\nreceipts',
        title: 'Suggest plans from receipts',
        description:
          'Paste invoice text or snap a receipt — we extract the plan so you can confirm in one tap',
      },
      {
        id: 'forgot',
        icon: '🫥',
        perkLabel: 'Find forgotten\nsubscriptions',
        title: 'Find what you forgot you\'re paying for',
        description: 'Quiet plans you haven\'t touched still cost money — we\'ll surface them',
      },
      {
        id: 'cancel',
        icon: '🚪',
        perkLabel: 'Easier\ncancel steps',
        title: 'Clear steps when you\'re ready to cancel',
        description:
          'When a renewal is close, open a simple path to cancel without hunting around',
      },
      {
        id: 'currency',
        icon: '🌍',
        perkLabel: 'See spend\nin your currency',
        title: 'Understand foreign charges',
        description: 'See overseas plans in the currency you actually think in',
      },
    ],
    cta: 'Get Pro',
    billingNote: '$4.99/month. Cancel anytime.',
  },
];
