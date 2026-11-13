import { DevMetrics } from '@/types/crypto';

export async function fetchGithubMetrics(repoFullName: string): Promise<DevMetrics> {
  const fallback: DevMetrics = {
    repo: repoFullName || 'N/A',
    stars: 0,
    forks: 0,
    openIssues: 0,
    lastCommitDate: 'N/A',
    daysSinceLastCommit: 999,
    activityStatus: 'Unavailable',
  };

  if (!repoFullName || !repoFullName.includes('/')) {
    return fallback;
  }

  try {
    const res = await fetch(`https://api.github.com/repos/${repoFullName}`, {
      headers: {
        'User-Agent': 'CryptoSurveillanceEngine/1.0',
        'Accept': 'application/vnd.github.v3+json',
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) return fallback;

    const data = await res.json();
    const lastCommitDate = data.pushed_at || data.updated_at || '';
    let daysSinceLastCommit = 999;

    if (lastCommitDate) {
      const diffMs = Date.now() - new Date(lastCommitDate).getTime();
      daysSinceLastCommit = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
    }

    let activityStatus: DevMetrics['activityStatus'] = 'Moderate';
    if (daysSinceLastCommit <= 7) {
      activityStatus = 'High Activity';
    } else if (daysSinceLastCommit <= 30) {
      activityStatus = 'Moderate';
    } else if (daysSinceLastCommit <= 90) {
      activityStatus = 'Low Activity';
    } else {
      activityStatus = 'Dormant';
    }

    return {
      repo: repoFullName,
      stars: data.stargazers_count || 0,
      forks: data.forks_count || 0,
      openIssues: data.open_issues_count || 0,
      lastCommitDate: lastCommitDate ? new Date(lastCommitDate).toISOString().split('T')[0] : 'N/A',
      daysSinceLastCommit,
      activityStatus,
    };
  } catch (err) {
    console.warn(`[GitHub Error for ${repoFullName}]:`, err);
    return fallback;
  }
}
