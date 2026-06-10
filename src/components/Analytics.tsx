/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { AreaChart, Sparkles, Flame, CheckCircle, BarChart3, Palette, ShieldAlert, RotateCcw } from 'lucide-react';
import { FocusSessionLog, JournalEntry } from '../types';

interface AnalyticsProps {
  entries: JournalEntry[];
  sessionLogs: FocusSessionLog[];
  onResetAllData: () => void;
  selectedTheme: string;
  onSelectTheme: (theme: string) => void;
}

export default function Analytics({
  entries,
  sessionLogs,
  onResetAllData,
  selectedTheme,
  onSelectTheme
}: AnalyticsProps) {
  // Aggregate Metrics
  const totalFocusMinutes = sessionLogs.reduce((acc, curr) => acc + curr.minutes, 0);
  const totalCompletedCount = sessionLogs.reduce((acc, curr) => acc + curr.completedCount, 0);
  
  // Calculate Streak
  const todayStr = new Date().toISOString().split('T')[0];
  const activeStreak = sessionLogs.length > 0 ? Math.min(7, sessionLogs.length) : 0; // Simulated streak for prototype

  // Let's create past 7 days logs map
  const getPast7DaysData = () => {
    const data: { label: string; min: number; count: number }[] = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // Generate past 7 days backwards
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateString = d.toISOString().split('T')[0];
      const dayName = days[d.getDay()];
      
      const match = sessionLogs.find(l => l.date === dateString);
      data.push({
        label: dayName,
        min: match ? match.minutes : 0,
        count: match ? match.completedCount : 0
      });
    }
    return data;
  };

  const chartData = getPast7DaysData();
  const maxMins = Math.max(60, ...chartData.map(d => d.min));

  // Theme list details
  const themes = [
    { id: 'indigo', name: 'Cosmic Indigo', colors: 'bg-indigo-600', hue: 'border-indigo-500/30' },
    { id: 'rose', name: 'Solstice Rose', colors: 'bg-rose-500', hue: 'border-rose-500/30' },
    { id: 'emerald', name: 'Forest Calm', colors: 'bg-emerald-600', hue: 'border-emerald-500/30' },
    { id: 'amber', name: 'Golden Hour', colors: 'bg-amber-500', hue: 'border-amber-500/30' },
  ];

  const handleResetClick = () => {
    const confirm = window.confirm('Are you absolutely sure you want to purge all session records and journal notes? This cannot be undone.');
    if (confirm) {
      onResetAllData();
      alert('Your lomio workspace has been reset.');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto pb-10">
      
      {/* ═══ STATS MATRIX (Left Column) ═══ */}
      <div className="lg:col-span-7 flex flex-col space-y-6">
        
        {/* SUMMARY CARDS BENTO */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          <div className="bg-slate-950/45 border border-slate-900 rounded-2xl p-5 flex flex-col justify-between">
            <span className="text-[10px] font-mono text-slate-500 tracking-widest uppercase">
              FOCUS TIME LOGGED
            </span>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-3xl font-sans font-bold text-slate-100">{totalFocusMinutes}</span>
              <span className="text-xs text-slate-400 font-medium">mins</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-2">Aggregated across all focus cycles.</p>
          </div>

          <div className="bg-slate-950/45 border border-slate-900 rounded-2xl p-5 flex flex-col justify-between">
            <span className="text-[10px] font-mono text-slate-500 tracking-widest uppercase">
              STUDY STREAK
            </span>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-3xl font-sans font-bold text-slate-100">{activeStreak}</span>
              <span className="text-xs text-slate-400 font-medium">days</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-2">Consecutive days of mindful activity.</p>
          </div>

          <div className="bg-slate-950/45 border border-slate-900 rounded-2xl p-5 flex flex-col justify-between">
            <span className="text-[10px] font-mono text-slate-500 tracking-widest uppercase">
              COMPLETED OBJECTIVES
            </span>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-3xl font-sans font-bold text-slate-100">{totalCompletedCount}</span>
              <span className="text-xs text-slate-400 font-medium">loops</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-2">Pomodoro focus timers finished.</p>
          </div>

        </div>

        {/* PRISTINE CUSTOM SVG BAR CHART */}
        <div className="bg-slate-950/45 border border-slate-900 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <BarChart3 className="w-4 h-4 text-indigo-400" />
              <span className="text-sm font-semibold text-slate-100 tracking-tight">Focus Cadence</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500">PAST 7 DAYS SUMMARY</span>
          </div>

          {/* SVG representation of Bar graphs */}
          <div className="h-48 flex items-end justify-between gap-2.5 pt-6 px-2 border-b border-slate-900">
            {chartData.map((d, index) => {
              const hPercent = d.min > 0 ? (d.min / maxMins) * 100 : 3;
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-[10px] font-mono border border-slate-800 text-slate-150 px-2 py-1 rounded-md mb-1 text-center scale-90 sm:scale-100">
                    {d.min} min
                  </div>

                  {/* Gradient bar block */}
                  <div 
                    className="w-full rounded-t-lg transition-all duration-500 ease-out bg-gradient-to-t from-indigo-600/10 to-indigo-505 shadow-[0_0_15px_rgba(99,102,241,0.05)] cursor-pointer group-hover:brightness-110 active:scale-95"
                    style={{ 
                      height: `${hPercent}%`,
                      backgroundColor: d.min > 0 ? undefined : '#0f172a'
                    }}
                  />
                  
                  {/* Label */}
                  <span className="text-[10px] font-mono text-slate-500 mb-2 mt-1">
                    {d.label}
                  </span>
                </div>
              );
            })}
          </div>

          <p className="text-xs text-slate-400 font-normal leading-normal text-center mt-4">
            Study logs are updated automatically upon successful completion of a Pomodoro loop.
          </p>
        </div>

      </div>

      {/* ═══ WORKSPACE PREFERENCES (Right Column) ═══ */}
      <div className="lg:col-span-5 flex flex-col space-y-6">
        
        {/* PERSONALIZATION PORTABLE */}
        <div className="bg-slate-950/45 border border-slate-900 rounded-3xl p-6">
          <div className="flex items-center gap-2.5 mb-5">
            <Palette className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-semibold text-slate-105 tracking-tight">Personalize Sanctuary</span>
          </div>

          <span className="text-[10px] font-mono text-slate-500 tracking-widest uppercase mb-3 block">
            ACCENT HUE
          </span>

          <div className="space-y-3">
            {themes.map((t) => {
              const isActive = selectedTheme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => onSelectTheme(t.id)}
                  id={`btn-theme-${t.id}`}
                  className={`w-full p-4 rounded-xl border text-left flex items-center justify-between transition-all duration-200 cursor-pointer ${
                    isActive 
                      ? 'bg-slate-900 border-indigo-500/50 shadow-[0_4px_12px_rgba(99,102,241,0.1)]' 
                      : 'bg-slate-950/30 border-slate-900 hover:border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-3.5 h-3.5 rounded-full ${t.colors} block`} />
                    <span className="text-xs font-semibold text-slate-200">{t.name}</span>
                  </div>
                  {isActive && (
                    <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-wider">
                      Selected
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* FACTORY RESET MODULE */}
        <div className="bg-slate-950/45 border border-slate-900 rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-rose-450 border-b border-rose-950/30 pb-3 mb-3">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span className="text-xs font-semibold tracking-wider font-mono uppercase">Control Zone</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              Need a fresh slate? Purging local storage will instantly erase all focus metrics, studious logs, and space journal entries.
            </p>
          </div>
          
          <button
            onClick={handleResetClick}
            id="btn-factory-reset"
            className="w-full mt-6 py-3 border border-dashed border-rose-950/40 hover:border-rose-900/80 text-rose-450 hover:text-rose-405 font-mono text-xs font-semibold tracking-widest uppercase rounded-xl transition-all cursor-pointer hover:bg-rose-950/5 active:scale-98"
          >
            purge workspace cache
          </button>
        </div>

      </div>
    </div>
  );
}
