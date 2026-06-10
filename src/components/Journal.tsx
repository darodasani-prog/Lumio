/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Sparkles, Smile, Search, Calendar, Heart, MessageSquareReply, Trash2 } from 'lucide-react';
import { JournalEntry, MoodType } from '../types';

interface JournalProps {
  entries: JournalEntry[];
  onAddEntry: (content: string, mood: MoodType) => void;
  onDeleteEntry: (id: string) => void;
}

export default function Journal({ entries, onAddEntry, onDeleteEntry }: JournalProps) {
  const [editorText, setEditorText] = useState<string>('');
  const [selectedMood, setSelectedMood] = useState<MoodType>('calm');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const moodSchemes: Record<MoodType, { emoji: string; label: string; bg: string; border: string; text: string; tint: string }> = {
    calm: { emoji: '😌', label: 'Calm', bg: 'bg-indigo-950/20', border: 'border-indigo-950', text: 'text-indigo-400', tint: 'indigo' },
    focused: { emoji: '🎯', label: 'Focused', bg: 'bg-cyan-950/20', border: 'border-cyan-950', text: 'text-cyan-400', tint: 'cyan' },
    inspired: { emoji: '💫', label: 'Inspired', bg: 'bg-purple-950/20', border: 'border-purple-950', text: 'text-purple-400', tint: 'purple' },
    reflective: { emoji: '💭', label: 'Reflective', bg: 'bg-emerald-950/20', border: 'border-emerald-950', text: 'text-emerald-400', tint: 'emerald' },
    weary: { emoji: '🥱', label: 'Weary', bg: 'bg-rose-950/20', border: 'border-rose-950', text: 'text-rose-400', tint: 'rose' },
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editorText.trim()) return;
    onAddEntry(editorText.trim(), selectedMood);
    setEditorText('');
    setSelectedMood('calm');
    alert('Entry saved to your local database! Keep cataloging your thoughts.');
  };

  // Filter entries based on search query
  const filteredEntries = entries.filter((entry) => 
    entry.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Analyze dominant mood
  const getDominantMoodReport = () => {
    if (entries.length === 0) return { mood: 'calm', text: 'No entries registered yet' };
    
    // Tally
    const tallies = entries.reduce((acc, curr) => {
      acc[curr.mood] = (acc[curr.mood] || 0) + 1;
      return acc;
    }, {} as Record<MoodType, number>);

    let dom: MoodType = 'calm';
    let max = 0;
    for (const moodKey of Object.keys(tallies) as MoodType[]) {
      const v = tallies[moodKey] || 0;
      if (v > max) {
        max = v;
        dom = moodKey;
      }
    }

    let adviceText = "You are maintaining high mental clarity. Balance your focus epochs with rest intervals.";
    if (dom === 'weary') {
      adviceText = "You've been experiencing weariness. Slow down, play some Celestial Sound pads and take deep breaths.";
    } else if (dom === 'inspired') {
      adviceText = "Inspiration is cresting! Seize this high creative flow to document your architectural drafts.";
    } else if (dom === 'reflective') {
      adviceText = "Introspection grounds the mind. Your self-reflection index is high and healthy.";
    } else if (dom === 'focused') {
      adviceText = "Exceptional momentum. Ensure you stay hydrated and stand up to stretch.";
    }

    return { mood: dom, text: adviceText, emoji: moodSchemes[dom].emoji };
  };

  const sentimentReport = getDominantMoodReport();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto pb-10">
      
      {/* ═══ EDITOR & JOURNAL SUITE (Left Column) ═══ */}
      <div className="lg:col-span-7 space-y-6">
        
        {/* JOURNAL WRITING FIELD */}
        <div className="bg-slate-950/45 border border-slate-900 rounded-3xl p-6">
          <div className="flex items-center gap-2.5 mb-5">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-semibold text-slate-100 tracking-tight">Post Mindful Reflection</span>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            
            {/* TEXT PAD */}
            <textarea
              placeholder="Jot down lessons during this session, obstacles overcome, or general flow thoughts..."
              value={editorText}
              onChange={(e) => setEditorText(e.target.value)}
              rows={5}
              id="textarea-reflect"
              className="w-full text-xs md:text-sm bg-slate-900/60 border border-slate-900 focus:border-indigo-500/50 rounded-2xl p-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/20 leading-relaxed resize-none"
            />

            {/* MOOD PICKING CONTAINER */}
            <div>
              <span className="text-[10px] font-mono text-slate-500 tracking-widest uppercase mb-2 block">
                CURRENT MIND VIBE
              </span>
              <div className="grid grid-cols-5 gap-2">
                {(Object.keys(moodSchemes) as MoodType[]).map((mKey) => {
                  const m = moodSchemes[mKey];
                  const isSelected = selectedMood === mKey;
                  return (
                    <button
                      type="button"
                      key={mKey}
                      onClick={() => setSelectedMood(mKey)}
                      className={`py-2 px-1 flex flex-col items-center rounded-xl border transition-all cursor-pointer ${
                        isSelected 
                          ? `${m.bg} ${m.border} ${m.text} shadow-[0_0_12px_rgba(99,102,241,0.08)] scale-102` 
                          : 'bg-slate-950/40 border-slate-900 text-slate-400 hover:text-slate-205 hover:bg-slate-900/10'
                      }`}
                    >
                      <span className="text-xl mb-1 select-none">{m.emoji}</span>
                      <span className="text-[9px] font-mono font-medium tracking-tight truncate max-w-full">
                        {m.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SEND MODULE */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                id="btn-save-reflection"
                disabled={!editorText.trim()}
                className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-slate-100 font-semibold text-xs tracking-wider transition-colors disabled:opacity-30 disabled:pointer-events-none active:scale-95 cursor-pointer flex items-center gap-1.5 shadow-[0_4px_15px_rgba(99,102,241,0.15)]"
              >
                COMMIT JOURNAL ENTRY
              </button>
            </div>
          </form>
        </div>

        {/* DOMINANT MOOD INTELLIGENT ADVICE */}
        {entries.length > 0 && (
          <div className="bg-slate-950/25 border border-slate-900/80 p-5 rounded-2xl flex gap-4 items-start">
            <div className="p-2.5 rounded-xl bg-indigo-900/20 text-indigo-400 border border-indigo-900/40">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-mono text-slate-400 uppercase tracking-widest flex items-center gap-2">
                AUTOMATED MINDFUL ANALYSIS
              </h4>
              <p className="text-xs text-slate-300 mt-2 font-medium">
                Dominant state logged: <span className="font-bold text-slate-100">{sentimentReport.emoji} {sentimentReport.mood.toUpperCase()}</span>
              </p>
              <p className="text-xs text-slate-400 mt-1 lines-relaxed">
                {sentimentReport.text}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ═══ HISTORIC LEDGER ITEMS (Right Column) ═══ */}
      <div className="lg:col-span-5 space-y-6">
        
        {/* Past entries catalog */}
        <div className="bg-slate-950/45 border border-slate-900 rounded-3xl p-6 flex flex-col h-full min-h-[460px]">
          
          <div className="flex items-center justify-between gap-4 mb-4">
            <h3 className="text-sm font-semibold text-slate-105 tracking-tight flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-400" />
              Mindful Registry
            </h3>
            <span className="text-[10px] font-mono text-slate-500 bg-slate-900 border border-slate-800/80 px-2 py-0.5 rounded-full">
              {entries.length} RECORDS
            </span>
          </div>

          {/* Search Bar */}
          <div className="relative mb-5">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search through past mindscapes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs bg-slate-905 border border-slate-900 focus:border-indigo-500/50 rounded-xl pl-9 pr-3 py-2.5 text-slate-200 placeholder-slate-500 focus:outline-none"
            />
          </div>

          {/* JOURNAL RECORD CARDS */}
          <div className="space-y-3 overflow-y-auto max-h-[380px] flex-1 pr-1">
            <AnimatePresence initial={false}>
              {filteredEntries.map((entry) => {
                const ms = moodSchemes[entry.mood];
                const dateObj = new Date(entry.date);
                const formattedDate = dateObj.toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });

                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-4 bg-slate-900/40 border border-slate-900/80 rounded-2xl flex flex-col justify-between hover:border-slate-800 transition-colors group"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2.5">
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg select-none">{ms?.emoji}</span>
                        <div>
                          <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500">
                            {formattedDate}
                          </span>
                        </div>
                      </div>

                      {/* Delete Trigger */}
                      <button
                        onClick={() => onDeleteEntry(entry.id)}
                        className="text-slate-550 hover:text-rose-450 p-1 rounded transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                        title="Delete record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed font-normal whitespace-pre-wrap">
                      {entry.content}
                    </p>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {filteredEntries.length === 0 && (
              <div className="flex flex-col items-center justify-center text-center py-20 my-auto">
                <Smile className="w-10 h-10 text-slate-800 stroke-[1] mb-2" />
                <p className="text-[11px] font-mono text-slate-550 tracking-wider uppercase">
                  no diaries cataloged
                </p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs px-6 leading-relaxed">
                  Log your current mood or jot down mental logs in the left editor space to persist your mental stats.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
