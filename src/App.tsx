/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Orbit, Radio, ClipboardList, BookOpen, BarChart3, 
  HelpCircle, Flame, Volume2, Sparkles, LogOut, Compass 
} from 'lucide-react';

import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import Journal from './components/Journal';
import Analytics from './components/Analytics';
import Waitlist from './components/Waitlist';

import { FocusTask, JournalEntry, FocusSessionLog, MoodType } from './types';
import { synth } from './utils/synth';

// --- SEEDING REALISTIC DEFAULT RECORDS ---
const getPastDateString = (daysAgo: number) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
};

const defaultTasks: FocusTask[] = [
  { id: 't1', text: 'Refactor lomio synth oscillator nodes', completed: true, createdAt: new Date().toISOString() },
  { id: 't2', text: 'Read the Tao of Mindful UI/UX Design', completed: false, createdAt: new Date().toISOString() },
  { id: 't3', text: 'Review stereo binaural theta thresholds', completed: false, createdAt: new Date().toISOString() },
];

const defaultSessionLogs: FocusSessionLog[] = [
  { id: 'l1', date: getPastDateString(5), minutes: 25, completedCount: 1 },
  { id: 'l2', date: getPastDateString(4), minutes: 60, completedCount: 2 },
  { id: 'l3', date: getPastDateString(3), minutes: 90, completedCount: 3 },
  { id: 'l4', date: getPastDateString(2), minutes: 50, completedCount: 2 },
  { id: 'l5', date: getPastDateString(1), minutes: 115, completedCount: 4 },
  { id: 'l6', date: getPastDateString(0), minutes: 50, completedCount: 2 },
];

const defaultJournalEntries: JournalEntry[] = [
  {
    id: 'e1',
    date: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    content: 'Tuned the Cozy Rain swept filtration levels alongside Binaural Focus signals. Sprints went smoothly, feeling incredibly focused today.',
    mood: 'focused',
    focusMinutes: 50
  },
  {
    id: 'e2',
    date: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    content: 'Drafted the bento grid coordinates for the app shell. Listened to the Celestial Pad synthesizer while writing procedural audio filters. Found calm and inspiration.',
    mood: 'inspired',
    focusMinutes: 90
  }
];

export default function App() {
  const [isOnboarded, setIsOnboarded] = useState<boolean>(() => {
    return localStorage.getItem('lomio_onboarded') === 'true';
  });

  const [viewingWaitlist, setViewingWaitlist] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<'studio' | 'journal' | 'metrics'>(() => {
    return (localStorage.getItem('lomio_active_tab') as any) || 'studio';
  });

  const [selectedPresetIds, setSelectedPresetIds] = useState<string[]>([]);

  // Core Databases (Local Storage backed)
  const [tasks, setTasks] = useState<FocusTask[]>(() => {
    const local = localStorage.getItem('lomio_tasks');
    return local ? JSON.parse(local) : defaultTasks;
  });

  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(() => {
    const local = localStorage.getItem('lomio_journal');
    return local ? JSON.parse(local) : defaultJournalEntries;
  });

  const [sessionLogs, setSessionLogs] = useState<FocusSessionLog[]>(() => {
    const local = localStorage.getItem('lomio_session_logs');
    return local ? JSON.parse(local) : defaultSessionLogs;
  });

  const [selectedTheme, setSelectedTheme] = useState<string>(() => {
    return localStorage.getItem('lomio_theme') || 'indigo';
  });

  // --- PERSISTENCE SYNCRONIZATION ---
  useEffect(() => {
    localStorage.setItem('lomio_onboarded', String(isOnboarded));
  }, [isOnboarded]);

  useEffect(() => {
    localStorage.setItem('lomio_active_tab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('lomio_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('lomio_journal', JSON.stringify(journalEntries));
  }, [journalEntries]);

  useEffect(() => {
    localStorage.setItem('lomio_session_logs', JSON.stringify(sessionLogs));
  }, [sessionLogs]);

  useEffect(() => {
    localStorage.setItem('lomio_theme', selectedTheme);
  }, [selectedTheme]);

  // --- ACTIONS ---
  const handleOnboardingComplete = (presets: string[]) => {
    setSelectedPresetIds(presets);
    setIsOnboarded(true);
  };

  const handleLogCompletedMinutes = (minutes: number) => {
    const todayStr = new Date().toISOString().split('T')[0];
    
    // Add/Update focus logs
    setSessionLogs(prev => {
      const matchIdx = prev.findIndex(item => item.date === todayStr);
      if (matchIdx >= 0) {
        const copy = [...prev];
        copy[matchIdx] = {
          ...copy[matchIdx],
          minutes: copy[matchIdx].minutes + minutes,
          completedCount: copy[matchIdx].completedCount + 1
        };
        return copy;
      } else {
        return [
          ...prev,
          {
            id: String(Date.now()),
            date: todayStr,
            minutes,
            completedCount: 1
          }
        ];
      }
    });
  };

  const handleAddJournalEntry = (content: string, mood: MoodType) => {
    const newEntry: JournalEntry = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
      date: new Date().toISOString(),
      content,
      mood,
      focusMinutes: 25 // default estimate
    };
    setJournalEntries([newEntry, ...journalEntries]);
  };

  const handleDeleteJournalEntry = (id: string) => {
    setJournalEntries(journalEntries.filter(e => e.id !== id));
  };

  const handleResetAllData = () => {
    // Purge states
    setTasks([]);
    setJournalEntries([]);
    setSessionLogs([]);
    setIsOnboarded(false);
    synth.stopAll();
    // Clear storage keys
    localStorage.removeItem('lomio_onboarded');
    localStorage.removeItem('lomio_tasks');
    localStorage.removeItem('lomio_journal');
    localStorage.removeItem('lomio_session_logs');
    localStorage.removeItem('lomio_active_tab');
  };

  const exitStudio = () => {
    synth.stopAll();
    setIsOnboarded(false);
  };

  // Theme Accent Lookup Map
  const themeAccentClasses: Record<string, {
    text: string;
    bg: string;
    border: string;
    glow: string;
    fromGrad: string;
  }> = {
    indigo: {
      text: 'text-indigo-400',
      bg: 'bg-indigo-600',
      border: 'border-indigo-500/20',
      glow: 'shadow-[0_0_25px_rgba(99,102,241,0.15)]',
      fromGrad: 'from-indigo-950/20',
    },
    rose: {
      text: 'text-rose-455',
      bg: 'bg-rose-500',
      border: 'border-rose-500/20',
      glow: 'shadow-[0_0_25px_rgba(244,63,94,0.15)]',
      fromGrad: 'from-rose-950/25',
    },
    emerald: {
      text: 'text-emerald-400',
      bg: 'bg-emerald-600',
      border: 'border-emerald-500/20',
      glow: 'shadow-[0_0_25px_rgba(16,185,129,0.15)]',
      fromGrad: 'from-emerald-950/25',
    },
    amber: {
      text: 'text-amber-400',
      bg: 'bg-amber-600',
      border: 'border-amber-500/20',
      glow: 'shadow-[0_0_25px_rgba(245,158,11,0.15)]',
      fromGrad: 'from-amber-950/25',
    },
  };

  const curTheme = themeAccentClasses[selectedTheme] || themeAccentClasses.indigo;

  return (
    <div className="min-h-screen bg-[#060910] text-[#f1f5f9] antialiased select-none font-sans overflow-x-hidden flex flex-col justify-between">
      
      {/* Dynamic top gradient flare based on selected theme */}
      <div className={`absolute top-0 inset-x-0 h-96 bg-gradient-to-b ${curTheme.fromGrad} to-transparent -z-10 transition-colors duration-1000 pointer-events-none`} />

      {/* Main Orchestration Window */}
      <div className="w-full flex-1 flex flex-col">
        
        {/* TOP STATUS BAR (Visible if Onboarded) */}
        {isOnboarded && (
          <motion.header 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between border-b border-slate-900/60"
          >
            {/* Logo Brand / Action */}
            <div className="flex items-center gap-2.5">
              <span className={`w-2.5 h-2.5 rounded-full ${curTheme.bg} block animate-pulse`} />
              <h1 className="text-xl font-bold font-sans tracking-tight text-slate-100 flex items-center gap-1.5 select-none hover:opacity-80 transition-opacity">
                lomio
              </h1>
              <span className="text-[10px] font-mono text-slate-500 ml-1 select-none">STUDIO</span>
            </div>

            {/* TAB SELECTORS NAVIGATION */}
            <nav className="flex items-center p-1 bg-slate-950/80 border border-slate-900 rounded-2xl">
              <button
                onClick={() => setActiveTab('studio')}
                id="tab-studio"
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all duration-200 ${
                  activeTab === 'studio' 
                    ? `bg-slate-900 text-slate-100 ${curTheme.glow}`
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Compass className={`w-4 h-4 ${activeTab === 'studio' ? curTheme.text : ''}`} />
                <span className="hidden sm:inline">Studio</span>
              </button>

              <button
                onClick={() => setActiveTab('journal')}
                id="tab-journal"
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all duration-200 ${
                  activeTab === 'journal' 
                    ? `bg-slate-900 text-slate-100 ${curTheme.glow}`
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <BookOpen className={`w-4 h-4 ${activeTab === 'journal' ? curTheme.text : ''}`} />
                <span className="hidden sm:inline">Space Journal</span>
              </button>

              <button
                onClick={() => setActiveTab('metrics')}
                id="tab-metrics"
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all duration-200 ${
                  activeTab === 'metrics' 
                    ? `bg-slate-900 text-slate-105 ${curTheme.glow}`
                    : 'text-slate-400 hover:text-slate-202'
                }`}
              >
                <BarChart3 className={`w-4 h-4 ${activeTab === 'metrics' ? curTheme.text : ''}`} />
                <span className="hidden sm:inline">Milestones</span>
              </button>
            </nav>

            {/* Quick exit option */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setViewingWaitlist(true)}
                id="btn-nav-waitlist"
                className="flex items-center gap-1.5 px-3 py-2 text-[10px] font-mono font-semibold text-indigo-400 hover:text-indigo-300 bg-slate-950/40 hover:bg-slate-900 border border-slate-900 hover:border-indigo-500/20 rounded-xl transition-all duration-150 cursor-pointer"
                title="Lomio 2.0 Waitlist"
              >
                <Sparkles className="w-3.5 h-3.5 animate-pulse text-indigo-400" />
                <span className="hidden sm:inline">PRO 2.0 WAITLIST</span>
              </button>

              <button
                onClick={exitStudio}
                id="btn-nav-exit"
                className="flex items-center gap-1.5 px-3 py-2 text-[10px] font-mono font-semibold text-slate-500 hover:text-rose-400 tracking-wider hover:bg-slate-905 rounded-xl border border-transparent hover:border-slate-900 transition-all duration-150 cursor-pointer"
                title="Exit studio"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">EXIT STUDIO</span>
              </button>
            </div>
          </motion.header>
        )}

        {/* COMPONENT ROUTER VIEWS CONTAINER */}
        <main className="flex-1 px-6 pt-6 relative">
          <AnimatePresence mode="wait">
            {viewingWaitlist ? (
              <motion.div
                key="waitlist"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                <Waitlist onBack={() => setViewingWaitlist(false)} accentClass={curTheme} />
              </motion.div>
            ) : !isOnboarded ? (
              <motion.div
                key="onboarding"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full"
              >
                <Onboarding onComplete={handleOnboardingComplete} onViewWaitlist={() => setViewingWaitlist(true)} />
              </motion.div>
            ) : (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="w-full"
              >
                {activeTab === 'studio' && (
                  <Dashboard 
                    initialPresetIds={selectedPresetIds}
                    tasks={tasks}
                    onUpdateTasks={setTasks}
                    onLogCompletedMinutes={handleLogCompletedMinutes}
                  />
                )}
                {activeTab === 'journal' && (
                  <Journal 
                    entries={journalEntries}
                    onAddEntry={handleAddJournalEntry}
                    onDeleteEntry={handleDeleteJournalEntry}
                  />
                )}
                {activeTab === 'metrics' && (
                  <Analytics 
                    entries={journalEntries}
                    sessionLogs={sessionLogs}
                    onResetAllData={handleResetAllData}
                    selectedTheme={selectedTheme}
                    onSelectTheme={setSelectedTheme}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* FOOTER CODA */}
      <footer className="w-full px-6 py-4 flex flex-col sm:flex-row items-center justify-between border-t border-slate-950 text-[10px] font-mono text-slate-600 gap-2">
        <div className="flex items-center gap-2">
          <span>© 2026 lomio Inc.</span>
          <span>●</span>
          <span>Procedural Auditory Environment</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-slate-500">PRODUCED OFFLINE & SANCTUARY-SECURED</span>
        </div>
      </footer>
    </div>
  );
}
