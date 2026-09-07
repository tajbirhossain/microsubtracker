import type { BillingCycle, SpendScale } from '@/constants/dashboard';

export type CatalogService = {
  id: string;
  name: string;
  amount: number;
  currency: string;
  billingCycle: BillingCycle;
  category: string;
  scale: SpendScale;
  color: string;
  icon: string;
  aliases?: string[];
};

export const SERVICE_CATALOG: CatalogService[] = [
  {
    id: 'netflix',
    name: 'Netflix',
    amount: 15.49,
    currency: 'USD',
    billingCycle: 'monthly',
    category: 'Entertainment',
    scale: 'micro',
    color: '#E50914',
    icon: 'N',
    aliases: ['nflx'],
  },
  {
    id: 'spotify',
    name: 'Spotify',
    amount: 10.99,
    currency: 'USD',
    billingCycle: 'monthly',
    category: 'Entertainment',
    scale: 'micro',
    color: '#1DB954',
    icon: '♪',
  },
  {
    id: 'disney',
    name: 'Disney+',
    amount: 13.99,
    currency: 'USD',
    billingCycle: 'monthly',
    category: 'Entertainment',
    scale: 'micro',
    color: '#113CCF',
    icon: '+',
    aliases: ['disney plus', 'disneyplus'],
  },
  {
    id: 'youtube',
    name: 'YouTube Premium',
    amount: 13.99,
    currency: 'USD',
    billingCycle: 'monthly',
    category: 'Entertainment',
    scale: 'micro',
    color: '#FF0000',
    icon: '▶',
  },
  {
    id: 'apple-tv',
    name: 'Apple TV+',
    amount: 9.99,
    currency: 'USD',
    billingCycle: 'monthly',
    category: 'Entertainment',
    scale: 'micro',
    color: '#000000',
    icon: '▶',
  },
  {
    id: 'hbo',
    name: 'Max',
    amount: 15.99,
    currency: 'USD',
    billingCycle: 'monthly',
    category: 'Entertainment',
    scale: 'micro',
    color: '#5822B4',
    icon: 'M',
    aliases: ['hbo', 'hbo max'],
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT Plus',
    amount: 20,
    currency: 'USD',
    billingCycle: 'monthly',
    category: 'Productivity',
    scale: 'macro',
    color: '#10A37F',
    icon: '✦',
    aliases: ['openai', 'gpt'],
  },
  {
    id: 'claude',
    name: 'Claude Pro',
    amount: 20,
    currency: 'USD',
    billingCycle: 'monthly',
    category: 'Productivity',
    scale: 'macro',
    color: '#D97706',
    icon: 'C',
    aliases: ['anthropic'],
  },
  {
    id: 'notion',
    name: 'Notion',
    amount: 10,
    currency: 'USD',
    billingCycle: 'monthly',
    category: 'Productivity',
    scale: 'micro',
    color: '#111111',
    icon: 'N',
  },
  {
    id: 'figma',
    name: 'Figma Pro',
    amount: 15,
    currency: 'USD',
    billingCycle: 'monthly',
    category: 'Productivity',
    scale: 'micro',
    color: '#A259FF',
    icon: 'F',
  },
  {
    id: 'adobe',
    name: 'Adobe Creative Cloud',
    amount: 59.99,
    currency: 'USD',
    billingCycle: 'monthly',
    category: 'Productivity',
    scale: 'macro',
    color: '#FF0000',
    icon: 'Ae',
  },
  {
    id: 'icloud',
    name: 'iCloud+',
    amount: 2.99,
    currency: 'USD',
    billingCycle: 'monthly',
    category: 'Cloud',
    scale: 'micro',
    color: '#3B82F6',
    icon: '☁',
  },
  {
    id: 'dropbox',
    name: 'Dropbox Plus',
    amount: 11.99,
    currency: 'USD',
    billingCycle: 'monthly',
    category: 'Cloud',
    scale: 'micro',
    color: '#0061FF',
    icon: 'D',
  },
  {
    id: 'github',
    name: 'GitHub Pro',
    amount: 4,
    currency: 'USD',
    billingCycle: 'monthly',
    category: 'Productivity',
    scale: 'micro',
    color: '#24292F',
    icon: '⌥',
  },
  {
    id: 'prime',
    name: 'Amazon Prime',
    amount: 14.99,
    currency: 'USD',
    billingCycle: 'monthly',
    category: 'Shopping',
    scale: 'macro',
    color: '#FF9900',
    icon: 'a',
  },
  {
    id: 'headspace',
    name: 'Headspace',
    amount: 12.99,
    currency: 'USD',
    billingCycle: 'monthly',
    category: 'Health',
    scale: 'micro',
    color: '#F47D31',
    icon: '◉',
  },
  {
    id: 'nytimes',
    name: 'New York Times',
    amount: 17,
    currency: 'USD',
    billingCycle: 'monthly',
    category: 'News',
    scale: 'micro',
    color: '#000000',
    icon: 'T',
    aliases: ['nyt', 'new york times'],
  },
  {
    id: 'canva',
    name: 'Canva Pro',
    amount: 14.99,
    currency: 'USD',
    billingCycle: 'monthly',
    category: 'Productivity',
    scale: 'micro',
    color: '#00C4CC',
    icon: 'C',
  },
];

export type DetectedCharge = {
  id: string;
  serviceId: string;
  sourceLabel: string;
  confidence: number;
};

export const MOCK_DETECTED_CHARGES: DetectedCharge[] = [
  {
    id: 'd1',
    serviceId: 'disney',
    sourceLabel: 'Apple receipt · 2 days ago',
    confidence: 0.94,
  },
  {
    id: 'd2',
    serviceId: 'canva',
    sourceLabel: 'Bank alert · Canva*PRO',
    confidence: 0.88,
  },
  {
    id: 'd3',
    serviceId: 'dropbox',
    sourceLabel: 'Email · Dropbox billing',
    confidence: 0.81,
  },
];

export function searchCatalog(query: string, limit = 6): CatalogService[] {
  const q = query.trim().toLowerCase();
  if (!q) return SERVICE_CATALOG.slice(0, limit);

  return SERVICE_CATALOG.filter((service) => {
    const haystack = [service.name, ...(service.aliases ?? [])].join(' ').toLowerCase();
    return haystack.includes(q);
  }).slice(0, limit);
}

export function getCatalogById(id: string): CatalogService | undefined {
  return SERVICE_CATALOG.find((service) => service.id === id);
}
