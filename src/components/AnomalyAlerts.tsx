'use client';

import React from 'react';
import { AlertTriangle, AlertOctagon, Info, ShieldAlert } from 'lucide-react';
import { SurveillanceReport } from '@/types/crypto';

interface AnomalyAlertsProps {
  report: SurveillanceReport;
}

export function AnomalyAlerts({ report }: AnomalyAlertsProps) {
  const { risk, security, devMetrics, ticker, orderBook } = report;

  const alerts: { type: 'critical' | 'warning' | 'info'; title: string; message: string }[] = [];

  // 1. Honeypot Check
  if (security.isHoneypot) {
    alerts.push({
      type: 'critical',
      title: 'CRITICAL SECURITY THREAT: Potential Honeypot',
      message: 'Zero sells recorded on decentralized pools despite heavy buy activity. Trading contract may block selling.',
    });
  }

  // 2. High Sell Pressure
  if (orderBook.sellPressurePercent >= 65) {
    alerts.push({
      type: 'warning',
      title: 'Elevated Sell Pressure Anomaly',
      message: `Sell orders account for ${orderBook.sellPressurePercent}% of immediate book depth. Downward price pressure active.`,
    });
  }

  // 3. GitHub Dormancy
  if (devMetrics.activityStatus === 'Dormant') {
    alerts.push({
      type: 'warning',
      title: 'Developer Inactivity Detected',
      message: `The project repository has recorded no commit pushes in over ${devMetrics.daysSinceLastCommit} days.`,
    });
  }

  // 4. Volatility Alert
  if (Math.abs(ticker.priceChangePercent24h) >= 20) {
    alerts.push({
      type: 'warning',
      title: 'Extreme 24h Volatility Alert',
      message: `Token has moved ${ticker.priceChangePercent24h.toFixed(1)}% in the past 24 hours. High risk of liquidation.`,
    });
  }

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-2.5">
      {alerts.map((alert, idx) => (
        <div
          key={idx}
          className={`flex items-start gap-3 rounded-xl border p-4 text-xs backdrop-blur-md ${
            alert.type === 'critical'
              ? 'border-rose-700/80 bg-rose-950/40 text-rose-200 shadow-lg shadow-rose-950/50'
              : 'border-amber-700/80 bg-amber-950/40 text-amber-200'
          }`}
        >
          {alert.type === 'critical' ? (
            <ShieldAlert className="h-5 w-5 shrink-0 text-rose-400 mt-0.5" />
          ) : (
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400 mt-0.5" />
          )}
          <div>
            <div className="font-bold text-sm tracking-wide text-white">{alert.title}</div>
            <div className="mt-0.5 text-zinc-300">{alert.message}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
