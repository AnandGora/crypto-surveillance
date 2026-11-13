'use client';

import React from 'react';
import { X, Keyboard, Zap } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  if (!isOpen) return null;

  const shortcuts = [
    { key: '/', description: 'Focus quick search input' },
    { key: 'R', description: 'Toggle current coin on/off Surveillance Radar' },
    { key: 'C', description: 'Open Binance Futures Leverage & Liquidation Calculator' },
    { key: 'A', description: 'Open AI Review & Prompt Exporter (ChatGPT, Claude, Gemini)' },
    { key: '1', description: 'Switch to Overview & Threat Radar tab' },
    { key: '2', description: 'Switch to CoinGlass Deep Intel tab' },
    { key: '3', description: 'Switch to TradingView Futures Chart tab' },
    { key: '4', description: 'Switch to Futures, OI & Funding tab' },
    { key: '5', description: 'Switch to Live Whale Trades Tape tab' },
    { key: '6', description: 'Switch to Order Book & Depth tab' },
    { key: 'Space', description: 'Force refresh surveillance data' },
    { key: 'Esc', description: 'Close any active modal or drawer' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="relative w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400">
              <Keyboard className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Pro Trader Keyboard Shortcuts</h2>
              <p className="text-xs text-zinc-400">Navigate at high-frequency speed without taking hands off the keyboard</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 max-h-80 overflow-y-auto space-y-2 pr-1">
          {shortcuts.map((sc) => (
            <div
              key={sc.key}
              className="flex items-center justify-between rounded-lg border border-zinc-800/80 bg-zinc-900/60 px-3 py-2 text-xs"
            >
              <span className="text-zinc-300">{sc.description}</span>
              <kbd className="rounded border border-zinc-700 bg-zinc-800 px-2 py-0.5 font-mono text-[11px] font-bold text-cyan-300 shadow-sm">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-700 transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
