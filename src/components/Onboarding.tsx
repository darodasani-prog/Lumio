/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight, Music, Heart, Code, Compass } from 'lucide-react';

interface OnboardingProps {
  onComplete: (selectedIntents: string[]) => void;
  onViewWaitlist: () => void;
}

interface SanctuaryCard {
  id: string;
  title: string;
  description: string;
  icon: React.ReactElement;
  presetSounds: string[]; // SoundIds
  color: string;
}

export default function Onboarding({ onComplete, onViewWaitlist }: OnboardingProps) {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('deep_work');

  const presets: SanctuaryCard[] = [
    {
      id: 'deep_work',
      title: 'Deep Work',
      description: 'Theta binaural beats & light espresso hum to trigger hyper-focus.',
      icon: <Code className="w-5 h-5" />,
      presetSounds: ['binaural', 'espresso'],
      color: 'from-cyan-500 to-indigo-600',
    },
    {
      id: 'stress_relief',
      title: 'Stress Relief',
      description: 'Celestial galactic pad & soft rain sweeps to wash away anxiety.',
      icon: <Heart className="w-5 h-5" />,
      presetSounds: ['galaxy', 'rain'],
      color: 'from-rose-500 to-indigo-600',
    },
    {
      id: 'midnight_coding',
      title: 'Midnight Coding',
      description: 'Hypnotic galaxy chord drones combined with cozy campfire heat.',
      icon: <Sparkles className="w-5 h-5" />,
      presetSounds: ['galaxy', 'fire'],
      color: 'from-amber-400 to-purple-600',
    },
    {
      id: 'creative_flow',
      title: 'Creative Flow',
      description: 'Falling rain sweeps + distant cafe tap beats for artistic inspiration.',
      icon: <Compass className="w-5 h-5" />,
      presetSounds: ['rain', 'espresso'],
      color: 'from-emerald-400 to-teal-600',
    },
  ];

  const handleStart = () => {
    const selected = presets.find(p => p.id === selectedPresetId);
    if (selected) {
      onComplete(selected.presetSounds);
    }
  };

  return (
    <div className="relative min-h-[92vh] flex flex-col justify-between p-6 max-w-4xl mx-auto overflow-hidden">
      {/* Background radial glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full filter blur-[100px] -z-10 animate-pulse duration-5000" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full filter blur-[100px] -z-10 animate-pulse duration-[8000ms]" />

      {/* Hero section */}
      <div className="my-auto py-8">
        <div className="flex flex-col items-center text-center space-y-4 max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="px-4 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono text-teal-400 flex items-center gap-2 shadow-[0_0_15px_rgba(20,184,166,0.1)]"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-450 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
            </span>
            procedural audio oasis ● offline ready
          </motion.div>

          {/* Logo Name */}
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-6xl md:text-8xl font-sans font-bold tracking-tighter text-slate-100 select-none bg-gradient-to-r from-slate-100 via-indigo-300 to-teal-200 bg-clip-text text-transparent"
          >
            lomio
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-base md:text-xl text-slate-400 font-sans tracking-tight leading-relaxed max-w-lg"
          >
            Design your ideal auditory sanctuary. Real-time synthesized environmental soundscapes configured for absolute mental clarity.
          </motion.p>
        </div>

        {/* Dynamic Wave Visualizer */}
        <div className="h-16 flex items-center justify-center gap-1 my-8 max-w-md mx-auto">
          {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20].map((bar) => {
            const h = Math.abs(Math.sin(bar * 0.4)) * 36 + 6;
            return (
              <motion.div
                key={bar}
                initial={{ scaleY: 0.1 }}
                animate={{ scaleY: [1, 0.4, 1.2, 0.6, 1] }}
                transition={{
                  repeat: Infinity,
                  duration: 1.2 + (bar % 3) * 0.3,
                  ease: "easeInOut",
                  delay: bar * 0.05
                }}
                className="w-1.5 rounded-full bg-gradient-to-t from-indigo-500 to-teal-400"
                style={{ height: `${h}px` }}
              />
            );
          })}
        </div>

        {/* Setup Selection Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 max-w-2xl mx-auto">
          {presets.map((card, idx) => {
            const isSelected = selectedPresetId === card.id;
            return (
              <motion.button
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + idx * 0.1 }}
                onClick={() => setSelectedPresetId(card.id)}
                id={`sanctuary-${card.id}`}
                className={`relative flex flex-col p-5 rounded-2xl border text-left transition-all duration-300 group cursor-pointer ${
                  isSelected 
                    ? 'bg-slate-900/85 border-indigo-500/80 shadow-[0_0_20px_rgba(99,102,241,0.15)]' 
                    : 'bg-slate-950/40 border-slate-900 hover:border-slate-800 hover:bg-slate-900/20'
                }`}
              >
                <div className={`p-2.5 rounded-xl w-fit bg-gradient-to-br ${card.color} text-slate-100 mb-4 transition-transform group-hover:scale-105 duration-300`}>
                  {card.icon}
                </div>
                <h3 className="text-base font-semibold text-slate-100 tracking-tight flex items-center gap-2">
                  {card.title}
                  {isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 block animate-ping" />
                  )}
                </h3>
                <p className="text-xs text-slate-400 tracking-tight mt-1.5 font-normal leading-relaxed">
                  {card.description}
                </p>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Launch Action */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="flex flex-col items-center gap-3 w-full max-w-sm mx-auto mt-6"
      >
        <button
          onClick={handleStart}
          id="btn-enter-studio"
          className="w-full relative group flex items-center justify-center gap-3 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-teal-500 hover:to-teal-400 font-medium text-slate-100 transition-all duration-300 shadow-[0_4px_30px_rgba(99,102,241,0.25)] hover:shadow-[0_10px_35px_rgba(99,102,241,0.40)] cursor-pointer overflow-hidden active:scale-98"
        >
          {/* Inner flash flare on hover */}
          <span className="absolute inset-0 w-full h-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <span className="text-xs font-semibold tracking-wide">Enter Sound Studio</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 duration-300" />
        </button>

        <button
          onClick={onViewWaitlist}
          id="btn-trigger-waitlist"
          className="w-full relative group flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-slate-950/40 hover:bg-slate-900/50 border border-slate-900 hover:border-slate-800 font-medium text-slate-400 hover:text-slate-200 transition-all duration-200 cursor-pointer text-[10px] uppercase tracking-wider"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
          <span>Lomio 2.0 Waitlist</span>
        </button>

        <span className="text-[9px] font-mono text-slate-500 tracking-widest uppercase mt-1">
          requires sound enabled ● wear headphones
        </span>
      </motion.div>
    </div>
  );
}
