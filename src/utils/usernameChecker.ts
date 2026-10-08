import { StatusType } from '../types';

export interface PlatformTarget {
  name: string;
  category: 'Coding & Dev' | 'Social' | 'Community' | 'Media & Music' | 'Professional';
  urlPattern: string;
  checkType: 'api' | 'pattern';
  apiEndpoint?: (u: string) => string;
}

export const PLATFORMS: PlatformTarget[] = [
  {
    name: 'GitHub',
    category: 'Coding & Dev',
    urlPattern: 'https://github.com/{u}',
    checkType: 'api',
    apiEndpoint: (u) => `https://api.github.com/users/${u}`,
  },
  {
    name: 'Dev.to',
    category: 'Coding & Dev',
    urlPattern: 'https://dev.to/{u}',
    checkType: 'api',
    apiEndpoint: (u) => `https://dev.to/api/users/by_username?url=${u}`,
  },
  {
    name: 'GitLab',
    category: 'Coding & Dev',
    urlPattern: 'https://gitlab.com/{u}',
    checkType: 'pattern',
  },
  {
    name: 'Codeberg',
    category: 'Coding & Dev',
    urlPattern: 'https://codeberg.org/{u}',
    checkType: 'pattern',
  },
  {
    name: 'Docker Hub',
    category: 'Coding & Dev',
    urlPattern: 'https://hub.docker.com/u/{u}',
    checkType: 'pattern',
  },
  {
    name: 'StackOverflow',
    category: 'Coding & Dev',
    urlPattern: 'https://stackoverflow.com/users/{u}',
    checkType: 'pattern',
  },
  {
    name: 'X (formerly Twitter)',
    category: 'Social',
    urlPattern: 'https://x.com/{u}',
    checkType: 'pattern',
  },
  {
    name: 'Reddit',
    category: 'Community',
    urlPattern: 'https://reddit.com/user/{u}',
    checkType: 'pattern',
  },
  {
    name: 'Instagram',
    category: 'Social',
    urlPattern: 'https://instagram.com/{u}',
    checkType: 'pattern',
  },
  {
    name: 'LinkedIn',
    category: 'Professional',
    urlPattern: 'https://linkedin.com/in/{u}',
    checkType: 'pattern',
  },
  {
    name: 'YouTube',
    category: 'Media & Music',
    urlPattern: 'https://youtube.com/@{u}',
    checkType: 'pattern',
  },
  {
    name: 'Telegram',
    category: 'Social',
    urlPattern: 'https://t.me/{u}',
    checkType: 'pattern',
  },
  {
    name: 'Twitch',
    category: 'Media & Music',
    urlPattern: 'https://twitch.tv/{u}',
    checkType: 'pattern',
  },
  {
    name: 'Medium',
    category: 'Community',
    urlPattern: 'https://medium.com/@{u}',
    checkType: 'pattern',
  },
  {
    name: 'Pinterest',
    category: 'Social',
    urlPattern: 'https://pinterest.com/{u}',
    checkType: 'pattern',
  },
  {
    name: 'Steam',
    category: 'Community',
    urlPattern: 'https://steamcommunity.com/id/{u}',
    checkType: 'pattern',
  },
  {
    name: 'Spotify',
    category: 'Media & Music',
    urlPattern: 'https://open.spotify.com/user/{u}',
    checkType: 'pattern',
  },
  {
    name: 'Keybase',
    category: 'Coding & Dev',
    urlPattern: 'https://keybase.io/{u}',
    checkType: 'pattern',
  },
  {
    name: 'Behance',
    category: 'Professional',
    urlPattern: 'https://behance.net/{u}',
    checkType: 'pattern',
  },
  {
    name: 'Dribbble',
    category: 'Professional',
    urlPattern: 'https://dribbble.com/{u}',
    checkType: 'pattern',
  },
  {
    name: 'SoundCloud',
    category: 'Media & Music',
    urlPattern: 'https://soundcloud.com/{u}',
    checkType: 'pattern',
  },
  {
    name: 'Kaggle',
    category: 'Coding & Dev',
    urlPattern: 'https://kaggle.com/{u}',
    checkType: 'pattern',
  },
  {
    name: 'Patreon',
    category: 'Community',
    urlPattern: 'https://patreon.com/{u}',
    checkType: 'pattern',
  },
  {
    name: 'Threads',
    category: 'Social',
    urlPattern: 'https://threads.net/@{u}',
    checkType: 'pattern',
  },
  {
    name: 'Mastodon Social',
    category: 'Social',
    urlPattern: 'https://mastodon.social/@{u}',
    checkType: 'pattern',
  },
];

export interface UsernameCheckResult {
  platform: string;
  category: string;
  url: string;
  status: StatusType;
  verified: boolean;
  avatarUrl?: string;
  bio?: string;
  details: string;
}

/**
 * Audit username across platforms
 */
export async function checkUsername(
  username: string,
  onProgress?: (result: UsernameCheckResult) => void
): Promise<UsernameCheckResult[]> {
  const cleanUser = username.trim().replace(/^@/, '');
  const results: UsernameCheckResult[] = [];

  for (const plat of PLATFORMS) {
    const targetUrl = plat.urlPattern.replace('{u}', cleanUser);
    let status: StatusType = 'Potential Match';
    let verified = false;
    let avatarUrl: string | undefined = undefined;
    let bio: string | undefined = undefined;
    let details = 'Profile URL formatted based on public standard namespace.';

    if (plat.checkType === 'api' && plat.apiEndpoint) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 2000);
        const res = await fetch(plat.apiEndpoint(cleanUser), { signal: controller.signal });
        clearTimeout(timeout);

        if (res.status === 200) {
          const data = await res.json();
          status = 'Completed';
          verified = true;
          avatarUrl = data.avatar_url || data.profile_image;
          bio = data.bio || data.summary || `Public account verified: ${data.name || cleanUser}`;
          details = `Verified active account via public API response.`;
        } else if (res.status === 404) {
          status = 'Unavailable';
          details = 'Account handle does not exist on platform.';
        }
      } catch {
        status = 'Potential Match';
        details = 'Public direct profile URL available for review.';
      }
    }

    const item: UsernameCheckResult = {
      platform: plat.name,
      category: plat.category,
      url: targetUrl,
      status,
      verified,
      avatarUrl,
      bio,
      details,
    };

    results.push(item);
    if (onProgress) onProgress(item);
  }

  return results;
}
