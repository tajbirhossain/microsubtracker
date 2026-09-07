import type { ImageSource } from 'expo-image';

/**
 * Local brand marks for popular subscriptions (bundled under assets/logos).
 * Keys match catalog ids / providerKey values. Unknown keys fall back to letter avatars.
 */
export const SERVICE_LOGOS: Record<string, ImageSource> = {
  '1password': require('@/assets/logos/1password.png'),
  adobe: require('@/assets/logos/adobe.png'),
  apple: require('@/assets/logos/apple.png'),
  'apple-tv': require('@/assets/logos/apple-tv.png'),
  athletic: require('@/assets/logos/athletic.png'),
  audible: require('@/assets/logos/audible.png'),
  aws: require('@/assets/logos/aws.png'),
  calm: require('@/assets/logos/calm.png'),
  canva: require('@/assets/logos/canva.png'),
  chatgpt: require('@/assets/logos/chatgpt.png'),
  claude: require('@/assets/logos/claude.png'),
  coursera: require('@/assets/logos/coursera.png'),
  crunchyroll: require('@/assets/logos/crunchyroll.png'),
  dashlane: require('@/assets/logos/dashlane.png'),
  discord: require('@/assets/logos/discord.png'),
  disney: require('@/assets/logos/disney.png'),
  dropbox: require('@/assets/logos/dropbox.png'),
  duolingo: require('@/assets/logos/duolingo.png'),
  evernote: require('@/assets/logos/evernote.png'),
  expressvpn: require('@/assets/logos/expressvpn.png'),
  figma: require('@/assets/logos/figma.png'),
  fitbit: require('@/assets/logos/fitbit.png'),
  github: require('@/assets/logos/github.png'),
  google: require('@/assets/logos/google.png'),
  grammarly: require('@/assets/logos/grammarly.png'),
  hbo: require('@/assets/logos/hbo.png'),
  hulu: require('@/assets/logos/hulu.png'),
  icloud: require('@/assets/logos/icloud.png'),
  instacart: require('@/assets/logos/instacart.png'),
  kindle: require('@/assets/logos/kindle.png'),
  linkedin: require('@/assets/logos/linkedin.png'),
  masterclass: require('@/assets/logos/masterclass.png'),
  medium: require('@/assets/logos/medium.png'),
  netflix: require('@/assets/logos/netflix.png'),
  nintendo: require('@/assets/logos/nintendo.png'),
  nordvpn: require('@/assets/logos/nordvpn.png'),
  notion: require('@/assets/logos/notion.png'),
  nytimes: require('@/assets/logos/nytimes.png'),
  openai: require('@/assets/logos/openai.png'),
  paramount: require('@/assets/logos/paramount.png'),
  patreon: require('@/assets/logos/patreon.png'),
  peacock: require('@/assets/logos/peacock.png'),
  peloton: require('@/assets/logos/peloton.png'),
  playstation: require('@/assets/logos/playstation.png'),
  prime: require('@/assets/logos/prime.png'),
  slack: require('@/assets/logos/slack.png'),
  spotify: require('@/assets/logos/spotify.png'),
  starbucks: require('@/assets/logos/starbucks.png'),
  strava: require('@/assets/logos/strava.png'),
  substack: require('@/assets/logos/substack.png'),
  todoist: require('@/assets/logos/todoist.png'),
  uber: require('@/assets/logos/uber.png'),
  udemy: require('@/assets/logos/udemy.png'),
  xbox: require('@/assets/logos/xbox.png'),
  youtube: require('@/assets/logos/youtube.png'),
  zoom: require('@/assets/logos/zoom.png'),
};

const NAME_ALIASES: Record<string, string> = {
  'chatgpt plus': 'chatgpt',
  openai: 'openai',
  'claude pro': 'claude',
  anthropic: 'claude',
  'disney+': 'disney',
  'disney plus': 'disney',
  'youtube premium': 'youtube',
  'apple tv+': 'apple-tv',
  'apple tv plus': 'apple-tv',
  max: 'hbo',
  'hbo max': 'hbo',
  'adobe creative cloud': 'adobe',
  'icloud+': 'icloud',
  'dropbox plus': 'dropbox',
  'github pro': 'github',
  'amazon prime': 'prime',
  'new york times': 'nytimes',
  nyt: 'nytimes',
  'the athletic': 'athletic',
  'figma pro': 'figma',
  'canva pro': 'canva',
  'google one': 'google',
  'microsoft 365': 'microsoft',
  office365: 'microsoft',
};

export function resolveLogoKey(providerKey?: string | null, name?: string | null): string | null {
  if (providerKey) {
    const key = providerKey.trim().toLowerCase();
    if (SERVICE_LOGOS[key]) return key;
    const aliased = NAME_ALIASES[key];
    if (aliased && SERVICE_LOGOS[aliased]) return aliased;
  }

  if (name) {
    const normalized = name.trim().toLowerCase();
    if (SERVICE_LOGOS[normalized]) return normalized;
    const aliased = NAME_ALIASES[normalized];
    if (aliased && SERVICE_LOGOS[aliased]) return aliased;

    for (const [alias, logoKey] of Object.entries(NAME_ALIASES)) {
      if (normalized.includes(alias) && SERVICE_LOGOS[logoKey]) return logoKey;
    }
  }

  return null;
}

export function getServiceLogoSource(
  providerKey?: string | null,
  name?: string | null
): ImageSource | null {
  const key = resolveLogoKey(providerKey, name);
  return key ? SERVICE_LOGOS[key] : null;
}
