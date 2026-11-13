'use client';

import React from 'react';
import { GitBranch, Star, GitFork, AlertOctagon, CheckCircle2, ExternalLink, Code } from 'lucide-react';
import { DevMetrics } from '@/types/crypto';

interface GithubSurveillanceProps {
  metrics: DevMetrics;
  symbol: string;
}

export function GithubSurveillance({ metrics, symbol }: GithubSurveillanceProps) {
  const { repo, stars, forks, openIssues, lastCommitDate, daysSinceLastCommit, activityStatus } = metrics;

  const isDormant = activityStatus === 'Dormant';
  const isHigh = activityStatus === 'High Activity';

  return (
    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <Code className="h-5 w-5 text-purple-400" />
          <h2 className="text-base font-bold text-white">Developer & Codebase Surveillance</h2>
        </div>
        <span className="text-xs text-zinc-400">GitHub REST API</span>
      </div>

      <div className="mt-4 flex flex-col gap-4">
        {/* Repo Header & Status Badge */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
          <div>
            <div className="text-[11px] text-zinc-400 uppercase font-semibold">Repository Inspected</div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-base font-mono font-bold text-white">
                {repo !== 'N/A' ? repo : `${symbol.toLowerCase()}-core (No public repo linked)`}
              </span>
              {repo !== 'N/A' && (
                <a
                  href={`https://github.com/${repo}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          </div>

          <div
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
              isHigh
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                : isDormant
                ? 'bg-rose-950 text-rose-300 border border-rose-800'
                : 'bg-amber-950 text-amber-300 border border-amber-800'
            }`}
          >
            {isHigh ? (
              <CheckCircle2 className="h-3.5 w-3.5" />
            ) : isDormant ? (
              <AlertOctagon className="h-3.5 w-3.5" />
            ) : (
              <GitBranch className="h-3.5 w-3.5" />
            )}
            <span>{activityStatus}</span>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/40 p-3">
            <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-medium">
              <Star className="h-3.5 w-3.5 text-amber-400" />
              <span>Stargazers</span>
            </div>
            <div className="mt-1 text-lg font-bold text-white">
              {stars.toLocaleString()}
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/40 p-3">
            <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-medium">
              <GitFork className="h-3.5 w-3.5 text-cyan-400" />
              <span>Forks</span>
            </div>
            <div className="mt-1 text-lg font-bold text-white">
              {forks.toLocaleString()}
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/40 p-3">
            <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-medium">
              <AlertOctagon className="h-3.5 w-3.5 text-rose-400" />
              <span>Open Issues</span>
            </div>
            <div className="mt-1 text-lg font-bold text-white">
              {openIssues.toLocaleString()}
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/40 p-3">
            <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-medium">
              <GitBranch className="h-3.5 w-3.5 text-purple-400" />
              <span>Last Push Recency</span>
            </div>
            <div
              className={`mt-1 text-lg font-bold ${
                daysSinceLastCommit <= 7
                  ? 'text-emerald-400'
                  : daysSinceLastCommit <= 30
                  ? 'text-yellow-400'
                  : 'text-rose-400'
              }`}
            >
              {daysSinceLastCommit < 999 ? `${daysSinceLastCommit}d ago` : 'N/A'}
            </div>
          </div>
        </div>

        {/* Abandonment Risk Analysis Banner */}
        <div
          className={`rounded-xl p-3 text-xs border ${
            isDormant
              ? 'bg-rose-950/30 border-rose-900/60 text-rose-300'
              : 'bg-zinc-950/40 border-zinc-800/60 text-zinc-400'
          }`}
        >
          {isDormant ? (
            <div className="flex items-center gap-2">
              <AlertOctagon className="h-4 w-4 shrink-0 text-rose-400" />
              <span>
                <strong>ABANDONMENT ALERT:</strong> No code commits pushed to the repository in over {daysSinceLastCommit} days. Development may be stalled.
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              <span>
                <strong>Active Development Verified:</strong> Core engineers actively maintaining repository with recent code updates (Last commit on {lastCommitDate}).
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
