/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, Pause, RotateCcw, Volume2, VolumeX, Eye, Sparkles, 
  Flame, CloudRain, ShieldAlert, CheckCircle, Plus, Trash2, Check,
  Coffee, Orbit, Radio, BellRing, ClipboardList, FlameKindling
} from 'lucide-react';
import { SoundChannel, FocusTask, MoodType } from '../types';
import { synth } from '../utils/synth';

interface DashboardProps {
  initialPresetIds: string[];
  tasks: FocusTask[];
  onUpdateTasks: (tasks: FocusTask[]) => void;
  onLogCompletedMinutes: (minutes: number) => void;
}

export default function Dashboard({ 
  initialPresetIds, 
  tasks, 
  onUpdateTasks,
  onLogCompletedMinutes 
}: DashboardProps) {
  // --- SOUND CONSOLE STATE ---
  const [channels, setChannels] = useState<SoundChannel[]>([
    {
      id: 'rain',
      name: 'Cozy Rain',
      category: 'ambient',
      iconName: 'rain',
      description: 'Slow sweeping gusts and falling rain drops.',
      isPlaying: false,
      volume: 0.5,
      hue: 'indigo',
    },
    {
      id: 'binaural',
      name: 'Theta Focus',
      category: 'binaural',
      iconName: 'binaural',
      description: 'Theta brainwave binaural humming (140Hz / 146Hz).',
      isPlaying: false,
      volume: 0.4,
      hue: 'teal',
    },
    {
      id: 'fire',
      name: 'Campfire Crackle',
      category: 'ambient',
      iconName: 'fire',
      description: 'Crackling wood pops and warming baseline rumbles.',
      isPlaying: false,
      volume: 0.3,
      hue: 'amber',
    },
    {
      id: 'galaxy',
      name: 'Celestial Pad',
      category: 'synth',
      iconName: 'galaxy',
      description: 'Breathing multi-oscillator cosmic chord sequence.',
      isPlaying: false,
      volume: 0.35,
      hue: 'purple',
    },
    {
      id: 'espresso',
      name: 'Espresso Bar',
      category: 'ambient',
      iconName: 'espresso',
      description: 'Atmospheric crowd murmurs and clinking cups.',
      isPlaying: false,
      volume: 0.25,
      hue: 'emerald',
    },
  ]);

  const [masterVolume, setMasterVolume] = useState<number>(0.8);
  const [isMasterMuted, setIsMasterMuted] = useState<boolean>(false);

  // --- FOCUS TIMER STATE ---
  const [timerMinutes, setTimerMinutes] = useState<number>(25);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [timerMode, setTimerMode] = useState<'focus' | 'short' | 'long'>('focus');
  const [isTickingSound, setIsTickingSound] = useState<boolean>(false);
  
  // To keep track of the initial duration of active timer mode
  const [totalSecondsSet, setTotalSecondsSet] = useState<number>(25 * 60);

  // Interval Ref
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // --- TICKLIST STATE ---
  const [newTaskText, setNewTaskText] = useState<string>('');

  // --- INIT AUDIO PRESET ON MOUNT ---
  useEffect(() => {
    if (initialPresetIds.length > 0) {
      const updated = channels.map(channel => {
        if (initialPresetIds.includes(channel.id)) {
          // Play the sound in synth
          synth.togglePlayState(channel.id, true, channel.volume * masterVolume);
          return { ...channel, isPlaying: true };
        }
        return channel;
      });
      setChannels(updated);
    }
    return () => {
      // Cleanup synth sounds on unmount
      synth.stopAll();
    };
  }, [initialPresetIds]);

  // Adjust sound synth volumes whenever individual volume or master volume changes
  useEffect(() => {
    channels.forEach(ch => {
      if (ch.isPlaying && !isMasterMuted) {
        synth.setChannelVolume(ch.id, ch.volume * masterVolume);
      } else {
        synth.setChannelVolume(ch.id, 0);
      }
    });
  }, [channels, masterVolume, isMasterMuted]);

  // --- MASTER SOUND ACTIONS ---
  const toggleChannel = (id: string) => {
    const updated = channels.map(ch => {
      if (ch.id === id) {
        const nextPlay = !ch.isPlaying;
        synth.togglePlayState(ch.id, nextPlay, nextPlay ? ch.volume * masterVolume : 0);
        return { ...ch, isPlaying: nextPlay };
      }
      return ch;
    });
    setChannels(updated);
  };

  const handleChannelVolumeChange = (id: string, newVol: number) => {
    setChannels(channels.map(ch => {
      if (ch.id === id) {
        return { ...ch, volume: newVol };
      }
      return ch;
    }));
  };

  const applyPresetMix = (presetId: string) => {
    let targetMix: Record<string, number> = {};
    if (presetId === 'zen') {
      targetMix = { galaxy: 0.6, binaural: 0.4, rain: 0.2 };
    } else if (presetId === 'storm') {
      targetMix = { rain: 0.8, fire: 0.3 };
    } else if (presetId === 'focus') {
      targetMix = { binaural: 0.8, espresso: 0.3 };
    } else if (presetId === 'cozy') {
      targetMix = { espresso: 0.4, fire: 0.5, rain: 0.3 };
    }

    const updated = channels.map(ch => {
      const targetVolume = targetMix[ch.id];
      const shouldPlay = targetVolume !== undefined;
      synth.togglePlayState(ch.id, shouldPlay, shouldPlay ? targetVolume * masterVolume : 0);
      return {
        ...ch,
        isPlaying: shouldPlay,
        volume: shouldPlay ? targetVolume : ch.volume
      };
    });
    setChannels(updated);
  };

  const stopAllSounds = () => {
    synth.stopAll();
    setChannels(channels.map(ch => ({ ...ch, isPlaying: false })));
  };

  // --- AUDIO SYNTH TONE EFFECTS (Beep / Chime) ---
  const playSynthesizedChime = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      const now = ctx.currentTime;
      const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5 (arpeggio)
      
      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + index * 0.15);
        
        gainNode.gain.setValueAtTime(0, now + index * 0.15);
        gainNode.gain.linearRampToValueAtTime(0.15, now + index * 0.15 + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.15 + 0.8);
        
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc.start(now + index * 0.15);
        osc.stop(now + index * 0.15 + 0.9);
      });
    } catch (e) {
      console.error(e);
    }
  };

  const playTickSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, ctx.currentTime);
      
      gain.gain.setValueAtTime(0.008, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.015);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) {}
  };

  // --- POMODORO TIMER CORE LOOP ---
  useEffect(() => {
    if (isActive) {
      timerIntervalRef.current = setInterval(() => {
        if (isTickingSound) {
          playTickSound();
        }

        if (timerSeconds > 0) {
          setTimerSeconds(prev => prev - 1);
        } else if (timerMinutes > 0) {
          setTimerMinutes(prev => prev - 1);
          setTimerSeconds(59);
        } else {
          // Timer finished!
          setIsActive(false);
          playSynthesizedChime();

          if (timerMode === 'focus') {
            // Log focus session completed
            const focusedMins = Math.round(totalSecondsSet / 60);
            onLogCompletedMinutes(focusedMins);
            alert(`Incredible focus interval completed! Logged ${focusedMins} minutes of mindful clarity.`);
            // Automatically switch to short break
            switchTimerMode('short');
          } else {
            alert('Break finished. Ready to focus again?');
            switchTimerMode('focus');
          }
        }
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isActive, timerMinutes, timerSeconds, isTickingSound]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    if (timerMode === 'focus') {
      setTimerMinutes(25);
      setTotalSecondsSet(25 * 60);
    } else if (timerMode === 'short') {
      setTimerMinutes(5);
      setTotalSecondsSet(5 * 60);
    } else {
      setTimerMinutes(15);
      setTotalSecondsSet(15 * 60);
    }
    setTimerSeconds(0);
  };

  const switchTimerMode = (mode: 'focus' | 'short' | 'long') => {
    setIsActive(false);
    setTimerMode(mode);
    let mins = 25;
    if (mode === 'short') mins = 5;
    if (mode === 'long') mins = 15;
    setTimerMinutes(mins);
    setTimerSeconds(0);
    setTotalSecondsSet(mins * 60);
  };

  const adjustTimerMinutes = (amount: number) => {
    if (isActive) return;
    const nextMins = Math.max(1, Math.min(180, timerMinutes + amount));
    setTimerMinutes(nextMins);
    setTimerSeconds(0);
    setTotalSecondsSet(nextMins * 60);
  };

  // --- TASKS ACTIONS ---
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    const newTask: FocusTask = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
      text: newTaskText.trim(),
      completed: false,
      createdAt: new Date().toISOString()
    };
    onUpdateTasks([newTask, ...tasks]);
    setNewTaskText('');
  };

  const toggleTask = (id: string) => {
    onUpdateTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    onUpdateTasks(tasks.filter(t => t.id !== id));
  };

  // Helper properties
  const isAnySoundPlaying = channels.some(ch => ch.isPlaying);
  const activeChannelsCount = channels.filter(ch => ch.isPlaying).length;
  
  // Timer Percentage calculations for visual ring
  const currentTotalSeconds = timerMinutes * 60 + timerSeconds;
  const elapsedPercent = totalSecondsSet > 0 ? (currentTotalSeconds / totalSecondsSet) * 100 : 100;

  // Sound Icon lookup
  const renderSoundIcon = (iconName: string, active: boolean) => {
    const cls = `w-5 h-5 ${active ? 'animate-pulse' : ''}`;
    switch (iconName) {
      case 'rain': return <CloudRain className={cls} />;
      case 'binaural': return <Radio className={cls} />;
      case 'fire': return <Flame className={cls} />;
      case 'galaxy': return <Orbit className={cls} />;
      case 'espresso': return <Coffee className={cls} />;
      default: return <Sparkles className={cls} />;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto pb-10">
      
      {/* ═══ SOUND BOARD & PRESETS CONSOLE (Left column) ═══ */}
      <div className="lg:col-span-7 flex flex-col space-y-6">
        
        {/* Animated Sound Wave Banner */}
        <div className="bg-slate-950/45 p-5 rounded-2xl border border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${isAnySoundPlaying ? 'bg-indigo-950/30 border-indigo-500/30 text-indigo-400' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
              <Volume2 className={`w-5 h-5 ${isAnySoundPlaying ? 'animate-bounce' : ''}`} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-100 tracking-tight flex items-center gap-2">
                Auditory Oasis Console
                {isAnySoundPlaying && (
                  <span className="text-[10px] font-mono text-teal-400 bg-teal-950/30 border border-teal-800/50 px-2 py-0.5 rounded-full">
                    {activeChannelsCount} ACTIVE
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5 font-normal tracking-tight">
                {isAnySoundPlaying ? 'Synthesizing your bespoke frequency.' : 'Quiet sanctuary. Power sound cards below.'}
              </p>
            </div>
          </div>
          
          {/* Master volume slider and absolute master mute */}
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <button
              onClick={() => setIsMasterMuted(!isMasterMuted)}
              id="btn-master-mute"
              className={`p-2.5 rounded-xl border hover:scale-105 active:scale-95 transition-all cursor-pointer ${
                isMasterMuted || !isAnySoundPlaying
                ? 'bg-rose-950/20 border-rose-900/40 text-rose-450' 
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {isMasterMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <div className="flex flex-col flex-1 sm:flex-initial sm:w-36">
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest text-right mb-1">
                Master Vol: {isMasterMuted ? 'Muted' : `${Math.round(masterVolume * 100)}%`}
              </span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={masterVolume}
                onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
                id="slider-master-volume"
                className="w-full accent-indigo-500 border-none cursor-pointer h-1.5 rounded-lg bg-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Dynamic Waveform Simulation */}
        <div className="bg-slate-950/10 p-2 rounded-xl flex items-end justify-center gap-1.5 h-10 w-full px-8">
          {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30].map((bar, i) => {
            const isSoundActive = isAnySoundPlaying && !isMasterMuted;
            const randomMultiplier = 0.2 + (i % 4) * 0.15;
            const size = isSoundActive 
              ? Math.max(4, Math.min(32, (masterVolume * 30 * randomMultiplier) + (Math.sin(bar * 0.8) * 6)))
              : 2;
            return (
              <div
                key={bar}
                className={`w-1 rounded-full transition-all duration-300 ${
                  isSoundActive 
                    ? 'bg-gradient-to-t from-indigo-500/80 to-teal-400/80 shadow-[0_0_8px_rgba(99,102,241,0.2)]'
                    : 'bg-slate-900 h-1'
                }`}
                style={{ height: isSoundActive ? `${size}px` : '4px' }}
              />
            );
          })}
        </div>

        {/* PRESET CHANNELS COMPACT MATRIX */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => applyPresetMix('zen')}
            className="py-2.5 px-3 rounded-xl bg-slate-950/20 hover:bg-slate-900/30 border border-slate-900 hover:border-indigo-900/45 text-xs font-medium text-slate-300 tracking-tight transition-all duration-150 text-left flex items-center gap-2 cursor-pointer"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
            Zen Meditation
          </button>
          <button
            onClick={() => applyPresetMix('storm')}
            className="py-2.5 px-3 rounded-xl bg-slate-950/20 hover:bg-slate-900/30 border border-slate-900 hover:border-indigo-900/45 text-xs font-medium text-slate-300 tracking-tight transition-all duration-150 text-left flex items-center gap-2 cursor-pointer"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Cozy Storm
          </button>
          <button
            onClick={() => applyPresetMix('focus')}
            className="py-2.5 px-3 rounded-xl bg-slate-950/20 hover:bg-slate-900/30 border border-slate-900 hover:border-indigo-900/45 text-xs font-medium text-slate-300 tracking-tight transition-all duration-150 text-left flex items-center gap-2 cursor-pointer"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
            Focus Hack
          </button>
          <button
            onClick={() => applyPresetMix('cozy')}
            className="py-2.5 px-3 rounded-xl bg-slate-950/20 hover:bg-slate-900/30 border border-slate-900 hover:border-indigo-900/45 text-xs font-medium text-slate-300 tracking-tight transition-all duration-150 text-left flex items-center gap-2 cursor-pointer"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Warm Espresso
          </button>
        </div>

        {/* PRIMARY SOUNDBOARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {channels.map((ch) => {
            const isActivePlaying = ch.isPlaying && !isMasterMuted;
            
            // Map colors safely
            let activeBorder = 'border-slate-900 bg-slate-950/15';
            let trackClass = 'text-slate-300';
            let glowClass = '';

            if (isActivePlaying) {
              if (ch.hue === 'indigo') {
                activeBorder = 'border-indigo-500/50 bg-indigo-950/10';
                trackClass = 'text-indigo-400';
                glowClass = 'shadow-[0_0_15px_rgba(99,102,241,0.1)]';
              } else if (ch.hue === 'teal') {
                activeBorder = 'border-teal-500/50 bg-teal-950/10';
                trackClass = 'text-teal-400';
                glowClass = 'shadow-[0_0_15px_rgba(45,212,191,0.1)]';
              } else if (ch.hue === 'amber') {
                activeBorder = 'border-amber-500/50 bg-amber-950/10';
                trackClass = 'text-amber-400';
                glowClass = 'shadow-[0_0_15px_rgba(245,158,11,0.1)]';
              } else if (ch.hue === 'purple') {
                activeBorder = 'border-purple-500/50 bg-purple-900/10';
                trackClass = 'text-purple-400';
                glowClass = 'shadow-[0_0_15px_rgba(168,85,247,0.1)]';
              } else if (ch.hue === 'emerald') {
                activeBorder = 'border-emerald-500/50 bg-emerald-950/10';
                trackClass = 'text-emerald-400';
                glowClass = 'shadow-[0_0_15px_rgba(16,185,129,0.1)]';
              }
            }

            return (
              <div
                key={ch.id}
                id={`sound-card-${ch.id}`}
                className={`p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${activeBorder} ${glowClass}`}
              >
                {/* Header info */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl border ${isActivePlaying ? 'bg-slate-950 border-slate-800' : 'bg-slate-900 border-slate-900'} ${trackClass}`}>
                      {renderSoundIcon(ch.iconName, isActivePlaying)}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-100 tracking-tight">{ch.name}</h3>
                      <span className="text-[10px] font-mono opacity-60 uppercase tracking-wider">{ch.category}</span>
                    </div>
                  </div>
                  
                  {/* Play trigger button */}
                  <button
                    onClick={() => toggleChannel(ch.id)}
                    id={`btn-play-sound-${ch.id}`}
                    className={`px-3 py-1.5 text-xs font-mono font-medium rounded-lg transition-all duration-200 cursor-pointer active:scale-95 border ${
                      ch.isPlaying 
                        ? 'bg-slate-900 border-slate-800 text-slate-100 hover:bg-slate-800' 
                        : 'bg-slate-950 border-transparent text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {ch.isPlaying ? 'ACTIVE' : 'POWER'}
                  </button>
                </div>

                <p className="text-xs text-slate-400/90 tracking-tight mt-3 font-normal leading-relaxed">
                  {ch.description}
                </p>

                {/* Sub Slider segment */}
                <div className="mt-5 flex items-center gap-3 pt-4 border-t border-slate-900/50 overflow-hidden">
                  <span className="text-[9px] font-mono text-slate-500 tracking-wider">GAIN</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.02"
                    value={ch.volume}
                    disabled={!ch.isPlaying}
                    onChange={(e) => handleChannelVolumeChange(ch.id, parseFloat(e.target.value))}
                    className="flex-1 accent-indigo-400 h-1 bg-slate-900 rounded cursor-pointer disabled:opacity-25"
                  />
                  <span className="text-[9px] font-mono text-slate-400 tracking-wider w-8 text-right">
                    {Math.round(ch.volume * 100)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Console Cleanup Utility */}
        <div className="flex justify-end pt-2">
          <button
            onClick={stopAllSounds}
            id="btn-silence"
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-mono font-semibold tracking-wider text-rose-450 hover:text-rose-400 border border-slate-900 hover:border-rose-950/50 rounded-xl bg-slate-950/15 hover:bg-rose-950/5 cursor-pointer transition-all duration-150 active:scale-95"
          >
            <VolumeX className="w-3.5 h-3.5" />
            SILENCE ALL AUDIO
          </button>
        </div>
      </div>

      {/* ═══ TACITI_POMODORO TIMER & TODO COMPANION (Right column) ═══ */}
      <div className="lg:col-span-1" /> {/* Layout spacers */}
      <div className="lg:col-span-4 flex flex-col space-y-6">
        
        {/* TACITI_POMODORO TIMER MODULE */}
        <div className="bg-slate-950/45 border border-slate-900 rounded-3xl p-6 flex flex-col items-center">
          
          {/* Sub Tab selection for Focus modes */}
          <div className="flex gap-1.5 p-1 bg-slate-900 rounded-xl w-full mb-6">
            {(['focus', 'short', 'long'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => switchTimerMode(mode)}
                className={`flex-1 py-1.5 text-xs font-mono font-semibold tracking-tight rounded-lg transition-all duration-150 cursor-pointer ${
                  timerMode === mode
                    ? 'bg-slate-950 border border-slate-800 text-slate-100 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {mode === 'focus' ? 'Focus' : mode === 'short' ? 'Short' : 'Long'}
              </button>
            ))}
          </div>

          {/* CIRCULAR TIMER VISUALIZER */}
          <div className="relative w-48 h-48 my-2 flex items-center justify-center">
            
            {/* SVG Arc Drawing Progress */}
            <svg className="w-48 h-48 transform -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="82"
                strokeWidth="6"
                stroke="#090d16"
                fill="transparent"
              />
              <motion.circle
                cx="96"
                cy="96"
                r="82"
                strokeWidth="6"
                strokeLinecap="round"
                stroke={timerMode === 'focus' ? '#6366f1' : '#14b8a6'}
                fill="transparent"
                strokeDasharray="515.22"
                strokeDashoffset={515.22 - (515.22 * elapsedPercent) / 100}
                animate={{ strokeDashoffset: 515.22 - (515.22 * elapsedPercent) / 100 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </svg>

            {/* Glowing inner shadow backdrop */}
            <div className="absolute inset-4 rounded-full bg-slate-950/45 flex flex-col items-center justify-center border border-slate-900">
              
              {/* Manual adjust controls (visible when NOT active) */}
              {!isActive && (
                <div className="flex gap-4 mb-0.5">
                  <button 
                    onClick={() => adjustTimerMinutes(-5)} 
                    className="w-5 h-5 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 text-xs flex items-center justify-center cursor-pointer font-bold select-none"
                    title="-5 mins"
                  >
                    -
                  </button>
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-semibold">Duration</span>
                  <button 
                    onClick={() => adjustTimerMinutes(5)} 
                    className="w-5 h-5 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 text-xs flex items-center justify-center cursor-pointer font-bold select-none"
                    title="+5 mins"
                  >
                    +
                  </button>
                </div>
              )}

              {/* Time Numbers */}
              <div id="countdown-text" className="text-4xl font-sans font-bold tracking-tighter text-slate-100 flex items-baseline">
                <span>{String(timerMinutes).padStart(2, '0')}</span>
                <span className="animate-pulse mx-0.5 opacity-60">:</span>
                <span>{String(timerSeconds).padStart(2, '0')}</span>
              </div>

              {/* Display mode description tag */}
              <span className={`text-[10px] font-mono px-2 py-0.5 mt-2 rounded-full font-bold uppercase ${
                timerMode === 'focus' 
                  ? 'text-indigo-400 bg-indigo-950/25 border border-indigo-900/55' 
                  : 'text-teal-400 bg-teal-950/25 border border-teal-900/55'
              }`}>
                {timerMode === 'focus' ? 'deep focus' : 'peaceful break'}
              </span>
            </div>
          </div>

          {/* Play state controller layout */}
          <div className="flex items-center gap-3.5 mt-6 w-full">
            <button
              onClick={toggleTimer}
              id="btn-timer-trigger"
              className={`flex-1 py-3 px-5 rounded-xl text-xs font-semibold tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 active:scale-95 text-slate-100 ${
                isActive 
                  ? 'bg-slate-900 hover:bg-slate-800 border border-slate-800' 
                  : timerMode === 'focus'
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:to-indigo-400 shadow-[0_4px_15px_rgba(99,102,241,0.2)]'
                    : 'bg-gradient-to-r from-teal-600 to-teal-500 hover:to-teal-400 shadow-[0_4px_15px_rgba(20,184,166,0.2)]'
              }`}
            >
              {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isActive ? 'PAUSE SPREE' : 'START SPREE'}
            </button>

            <button
              onClick={resetTimer}
              id="btn-timer-reset"
              className="p-3 bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-900 rounded-xl transition-all duration-200 active:rotate-180 cursor-pointer"
              title="Reset Timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Sound settings inside timer segment */}
          <div className="flex justify-between items-center w-full mt-4 pt-4 border-t border-slate-900/40">
            <span className="text-[10px] font-mono text-slate-500 tracking-wide">
              MIND TICKING CHIME
            </span>
            <button
              onClick={() => setIsTickingSound(!isTickingSound)}
              id="btn-toggle-ticking"
              className={`text-xs font-mono font-bold tracking-tight px-3 py-1 rounded-md border ${
                isTickingSound 
                  ? 'bg-indigo-950/20 border-indigo-800 text-indigo-400' 
                  : 'bg-slate-950 border-transparent text-slate-500 hover:text-slate-400'
              }`}
            >
              {isTickingSound ? 'ENABLED' : 'MUTED'}
            </button>
          </div>
        </div>

        {/* PRIORITY TODO LIST BOX */}
        <div className="bg-slate-950/45 border border-slate-900 rounded-3xl p-5 flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-100 tracking-tight flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-indigo-400" />
              Focus Ledger
            </h3>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-900 border border-slate-800/80 px-2 py-0.5 rounded-full">
              {tasks.filter(t => t.completed).length}/{tasks.length} DONE
            </span>
          </div>

          {/* Quick task addition form */}
          <form onSubmit={handleAddTask} className="flex gap-2">
            <input
              type="text"
              placeholder="What are you mastering today?"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              id="input-new-task"
              maxLength={40}
              className="flex-1 text-xs bg-slate-900 border border-slate-900 focus:border-indigo-500/50 rounded-xl px-3 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none"
            />
            <button
              type="submit"
              id="btn-add-task"
              className="p-2.5 bg-indigo-600 text-slate-100 hover:bg-indigo-500 rounded-xl transition-colors shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </form>

          {/* Tasks ledger items render */}
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            <AnimatePresence initial={false}>
              {tasks.map((task) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  id={`task-item-${task.id}`}
                  className="p-3 bg-slate-900/60 rounded-xl border border-slate-900/70 flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={() => toggleTask(task.id)}
                      className={`w-4 h-4 rounded-md border flex items-center justify-center cursor-pointer transition-all duration-150 ${
                        task.completed 
                          ? 'bg-teal-500 border-teal-500 text-slate-950' 
                          : 'border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      {task.completed && <Check className="w-3 h-3 stroke-[3]" />}
                    </button>
                    <span className={`text-xs truncate transition-all duration-200 ${
                      task.completed ? 'line-through text-slate-500' : 'text-slate-300'
                    }`}>
                      {task.text}
                    </span>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => deleteTask(task.id)}
                    className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-450 p-1 rounded transition-all cursor-pointer"
                    title="Delete task"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>

            {tasks.length === 0 && (
              <div className="py-8 flex flex-col items-center justify-center text-center">
                <ClipboardList className="w-8 h-8 text-slate-700 stroke-[1] mb-2" />
                <p className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">
                  no active objectives
                </p>
                <p className="text-xs text-slate-400 max-w-xs mt-1 px-4">
                  Add some quick sprints above to chart your focus milestone.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
