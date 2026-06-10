/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type MoodType = 'calm' | 'focused' | 'inspired' | 'reflective' | 'weary';

export interface SoundChannel {
  id: string;
  name: string;
  category: 'ambient' | 'synth' | 'binaural';
  iconName: string; // Lucide icon name mapping
  description: string;
  isPlaying: boolean;
  volume: number; // 0 to 1
  hue: string; // Tailwind color class hue (e.g., "indigo", "teal", "amber")
}

export interface FocusTask {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
}

export interface JournalEntry {
  id: string;
  date: string; // ISO string
  content: string;
  mood: MoodType;
  focusMinutes: number;
}

export interface FocusSessionLog {
  id: string;
  date: string; // YYYY-MM-DD
  minutes: number;
  completedCount: number;
}

export interface Quote {
  text: string;
  author: string;
}
