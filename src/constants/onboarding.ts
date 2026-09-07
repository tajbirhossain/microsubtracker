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
    headline: 'READY TO TAKE CONTROL OF YOUR SUBSCRIPTIONS?',
    theme: 'dark',
    visual: 'control',
  },
  {
    id: 'track',
    headline: 'SEE YOUR BURN RATE AT A GLANCE',
    subtitle: 'Track micro and macro spend on a clear dashboard — monthly, yearly, overall.',
    theme: 'light',
    visual: 'track',
  },
  {
    id: 'remind',
    headline: 'CANCEL BEFORE YOU GET CHARGED',
    subtitle: 'Trial countdowns, ghost-sub alerts, and one-tap cancel guides when it matters.',
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
    id: 'tracking',
    title: 'Tracking & overview',
    options: [
      { id: 'rapid-add', label: 'Rapid add', icon: '⚡' },
      { id: 'burn-rate', label: 'Burn rate dashboard', icon: '🔥' },
      { id: 'categories', label: 'Micro / macro categories', icon: '🗂️' },
      { id: 'calendar', label: 'Timeline & calendar', icon: '📅' },
      { id: 'currency', label: 'Currency conversion', icon: '💱' },
    ],
  },
  {
    id: 'actions',
    title: 'Alerts & actions',
    options: [
      { id: 'trials', label: 'Trial expiry countdowns', icon: '⏳' },
      { id: 'ghost', label: 'Unused / ghost alerts', icon: '👻' },
      { id: 'cancel-guide', label: 'One-tap cancel guides', icon: '🚪' },
      { id: 'push', label: 'Custom push reminders', icon: '🔔' },
      { id: 'sms-parse', label: 'SMS / notification parse', icon: '💬' },
    ],
  },
];

export type PlanPerk = {
  id: string;
  icon: string;
  label: string;
};

export type PlanFeature = {
  title: string;
  description: string;
  icon: string;
};

export type PlanTier = {
  id: 'plus' | 'pro';
  name: string;
  priceLabel: string;
  tagline: string;
  badge?: string;
  accent: readonly [string, string];
  perks: PlanPerk[];
  features: PlanFeature[];
  cta: string;
  billingNote: string;
};

export const PLANS: PlanTier[] = [
  {
    id: 'plus',
    name: 'Plus',
    priceLabel: '7 days free then $4.99/month',
    tagline: 'Burn rate, categories, and reminders that keep you ahead',
    badge: 'Popular',
    accent: ['#1B3A6B', '#0A1528'],
    perks: [
      { id: 'burn', icon: '🔥', label: 'Burn rate\ndashboard' },
      { id: 'categories', icon: '🗂️', label: 'Micro /\nmacro cats' },
      { id: 'calendar', icon: '📅', label: 'Timeline &\ncalendar' },
      { id: 'trials', icon: '⏳', label: 'Trial\ncountdowns' },
      { id: 'push', icon: '🔔', label: 'Custom\nreminders' },
    ],
    features: [
      {
        title: 'Burn rate dashboard',
        description: 'See monthly and yearly spend hierarchy in one view',
        icon: '🔥',
      },
      {
        title: 'Micro & macro categories',
        description: 'Organize every plan the way you actually think about spend',
        icon: '🗂️',
      },
      {
        title: 'Trial expiry cards',
        description: 'Countdowns so free trials never quietly convert',
        icon: '⏳',
      },
    ],
    cta: 'Start free trial',
    billingNote:
      '7-day free trial, then $4.99/month. Cancel anytime before the trial ends.',
  },
  {
    id: 'pro',
    name: 'Pro',
    priceLabel: '7 days free then $9.99/month',
    tagline: 'Rapid add, cancel guides, and ghost-sub detection',
    badge: 'Best value',
    accent: ['#3D2A6B', '#12081F'],
    perks: [
      { id: 'rapid-add', icon: '⚡', label: 'Rapid add\n+ autofill' },
      { id: 'sms', icon: '💬', label: 'SMS /\nparse flow' },
      { id: 'cancel', icon: '🚪', label: 'Cancel\nguide' },
      { id: 'ghost', icon: '👻', label: 'Ghost sub\nalerts' },
      { id: 'currency', icon: '💱', label: 'Currency\nselector' },
    ],
    features: [
      {
        title: 'Rapid add with auto-fill',
        description: 'Add subscriptions in seconds with smart suggested details',
        icon: '⚡',
      },
      {
        title: 'One-tap cancellation guides',
        description: 'Open a clear cancel path when a renewal is close',
        icon: '🚪',
      },
      {
        title: 'Unused / ghost alerts',
        description: 'Catch plans you forgot about before they charge again',
        icon: '👻',
      },
      {
        title: 'SMS & notification parser consent',
        description: 'Opt in to detect subscriptions from messages when you want help',
        icon: '💬',
      },
    ],
    cta: 'Start free trial',
    billingNote:
      '7-day free trial, then $9.99/month. Cancel anytime before the trial ends.',
  },
];
