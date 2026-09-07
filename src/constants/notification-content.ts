export type NotificationContentId =
  | 'renewals'
  | 'trials'
  | 'unused'
  | 'weekly-summary'
  | 'upcoming-week';

export type NotificationContentOption = {
  id: NotificationContentId;
  title: string;
  description: string;
  preview: string;
  defaultOn: boolean;
};

export const NOTIFICATION_CONTENT_OPTIONS: NotificationContentOption[] = [
  {
    id: 'renewals',
    title: 'Renewal nudges',
    description: 'Day-before reminders before a charge hits',
    preview: 'Netflix renews tomorrow — $15.49',
    defaultOn: true,
  },
  {
    id: 'trials',
    title: 'Trial ending warnings',
    description: 'Heads-up before a free trial converts',
    preview: 'ChatGPT trial ends in 2 days',
    defaultOn: true,
  },
  {
    id: 'unused',
    title: 'Unused / ghost nudges',
    description: 'Quiet plans you may want to cut',
    preview: 'YouTube Premium quiet for 47 days',
    defaultOn: true,
  },
  {
    id: 'weekly-summary',
    title: 'Weekly spend summary',
    description: 'A short burn-rate check-in each week',
    preview: 'This week’s burn: $42.10',
    defaultOn: false,
  },
  {
    id: 'upcoming-week',
    title: 'Upcoming this week',
    description: 'Digest of renewals landing soon',
    preview: '3 renewals land before Friday',
    defaultOn: false,
  },
];

export const DEFAULT_NOTIFICATION_CONTENT_IDS: NotificationContentId[] =
  NOTIFICATION_CONTENT_OPTIONS.filter((option) => option.defaultOn).map((option) => option.id);
