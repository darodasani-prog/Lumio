/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Mail, Users, CheckCircle2, Share2, ArrowLeft, 
  Lock, Zap, CloudLightning, Globe, Ticket, Copy, Check, ArrowRight
} from 'lucide-react';

interface WaitlistProps {
  onBack: () => void;
  accentClass: {
    text: string;
    bg: string;
    border: string;
    glow: string;
    fromGrad: string;
  };
}

export default function Waitlist({ onBack, accentClass }: WaitlistProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketNumber, setTicketNumber] = useState(1);
  const [copied, setCopied] = useState(false);
  const [totalWaitlistCount, setTotalWaitlistCount] = useState(5428);

  useEffect(() => {
    // Generate static but unique-looking queue size & individual ticket
    const storedCount = localStorage.getItem('lomio_waitlist_count');
    if (storedCount) {
      setTotalWaitlistCount(parseInt(storedCount, 10));
    } else {
      const initialCount = 5420 + Math.floor(Math.random() * 20);
      setTotalWaitlistCount(initialCount);
      localStorage.setItem('lomio_waitlist_count', String(initialCount));
    }

    const savedTicket = localStorage.getItem('lomio_user_ticket');
    if (savedTicket) {
      setTicketNumber(parseInt(savedTicket, 10));
      setIsSubmitted(true);
    }
  }, []);

  const validateEmail = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Email address is required.');
      return;
    }
    if (!validateEmail(email)) {
      setError('Please add a valid email address.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    // Simulate authentic API registration delays
    setTimeout(() => {
      const nextCount = totalWaitlistCount + 1;
      setTotalWaitlistCount(nextCount);
      setTicketNumber(nextCount);
      setIsSubmitted(true);
      setIsSubmitting(false);

      // Save to local storage for persistence across reloads
      localStorage.setItem('lomio_waitlist_count', String(nextCount));
      localStorage.setItem('lomio_user_ticket', String(nextCount));
      localStorage.setItem('lomio_waitlist_email', email);

      // Save standard waitlist participant log
      const emailsListStr = localStorage.getItem('lomio_waitlist_emails_list') || '[]';
      const emailsList = JSON.parse(emailsListStr);
      if (!emailsList.includes(email)) {
        emailsList.push({ email, date: new Date().toISOString(), ticket: nextCount });
        localStorage.setItem('lomio_waitlist_emails_list', JSON.stringify(emailsList));
      }
    }, 1200);
  };

  const copyReferral = () => {
    const textToCopy = `I just secured priority access to Lomio 2.0 (Ticket #${ticketNumber})! Join the waitlist for premium real-time AI soundscapes: ${window.location.origin}`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const features = [
    {
      icon: <Zap className="w-5 h-5 text-indigo-400" />,
      title: "Real-time AI Neural Drones",
      description: "Generates custom adaptive frequencies in real-time targeted to match your tasks and visual themes automatically."
    },
    {
      icon: <CloudLightning className="w-5 h-5 text-teal-400" />,
      title: "Secure Sanctuary Syncing",
      description: "Instantly cloud-sync your deep work session history, custom synthesizers, and reflective journals across all formats."
    },
    {
      icon: <Globe className="w-5 h-5 text-amber-400" />,
      title: "Interactive Collective Rooms",
      description: "Sync sound generators and focus with peers globally inside private, distraction-free spatial audio co-working sanctuaries."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto py-4 px-2" id="lomio-waitlist-container">
      {/* Back button */}
      <div className="mb-8">
        <button
          onClick={onBack}
          id="btn-waitlist-back"
          className="flex items-center gap-2 group text-xs font-mono text-slate-400 hover:text-slate-100 bg-slate-950/40 hover:bg-slate-900/50 border border-slate-900 hover:border-slate-800 px-4 py-2.5 rounded-xl cursor-pointer transition-all duration-200"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>RETURN TO OVERVIEW</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Side: Copywriting & Feature Teasers */}
        <div className="lg:col-span-7 space-y-8 pr-0 lg:pr-4">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/35 border border-indigo-500/20 text-[10px] font-mono text-indigo-300">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>LAUNCHING AUTUMN 2026</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
              Lomio Premium.<br />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-teal-300 bg-clip-text text-transparent">
                Elevate your sanctuary.
              </span>
            </h2>
            
            <p className="text-slate-400 text-sm md:text-base leading-relaxed max-w-xl">
              Become part of our exclusive guild. Secure early priority access to experience Lomio's state-of-the-art spatial synthesizer and intelligent clarity logs. Zero ads, zero distraction, absolute audio mastery.
            </p>
          </div>

          <div className="space-y-4 border-t border-slate-900/80 pt-6">
            <h4 className="text-[11px] font-mono tracking-wider text-slate-500 uppercase">
              RESERVED PREMIUM ADDITIONS:
            </h4>
            <div className="grid gap-4">
              {features.map((item, idx) => (
                <div 
                  key={idx} 
                  className="flex gap-4 p-4 rounded-xl bg-slate-950/20 border border-slate-900/60 hover:border-slate-800/80 hover:bg-slate-950/45 transition-all duration-200"
                >
                  <div className="p-2 h-fit rounded-lg bg-slate-900/80 border border-slate-800/40">
                    {item.icon}
                  </div>
                  <div>
                    <h5 className="text-xs font-semibold text-slate-100">{item.title}</h5>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: High Converting Registration Card */}
        <div className="lg:col-span-5">
          <AnimatePresence mode="wait">
            {!isSubmitted ? (
              <motion.div
                key="register-form"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-6 md:p-8 rounded-2xl bg-slate-950/60 border border-slate-900 shadow-2xl relative overflow-hidden"
              >
                {/* Background glow overlay */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full filter blur-2xl -z-10" />

                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-100">Reserve Spotlight</h3>
                    <p className="text-xs text-slate-500 mt-1">First-come, first-served premium alpha access.</p>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-850 text-[10px] font-mono text-slate-400">
                    <Users className="w-3 h-3 text-slate-500" />
                    <span>{totalWaitlistCount.toLocaleString()} Waiting</span>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-2">
                      Secured Email Address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (error) setError('');
                        }}
                        placeholder="e.g. wanderer@clarity.fm"
                        className="w-full bg-slate-950/90 border border-slate-900 focus:border-indigo-500/60 text-slate-100 rounded-xl px-4 py-3.5 pl-11 text-xs outline-none transition-colors placeholder:text-slate-600 focus:ring-1 focus:ring-indigo-500/20"
                      />
                      <Mail className="w-4 h-4 text-slate-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                    {error && (
                      <p className="text-[10px] font-mono text-rose-400 mt-1.5">{error}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    id="btn-waitlist-submit"
                    className="w-full relative group flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 font-medium text-slate-100 text-xs transition-all duration-200 cursor-pointer shadow-lg active:scale-98 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-bounce"></span>
                      </span>
                    ) : (
                      <>
                        <span>CLAIM RESERVED SPOT</span>
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                      </>
                    )}
                  </button>
                </form>

                <div className="flex items-center gap-1.5 mt-6 justify-center text-[10px] font-mono text-slate-600">
                  <Lock className="w-3 h-3 text-slate-600" />
                  <span>Verified Clean ● No Spam ● Self Protected</span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="success-ticket"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-6 md:p-8 rounded-2xl bg-slate-950/60 border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.05)] text-center relative overflow-hidden"
              >
                {/* Background glow overlay */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full filter blur-2xl -z-10" />

                <div className="mx-auto p-3 rounded-full bg-emerald-950/45 border border-emerald-500/20 w-fit mb-4">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                </div>

                <h3 className="text-lg font-bold text-slate-100">Priority Spot Locked!</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  You are officially on the Lomio Premium registry. We will contact you at your provided address.
                </p>

                {/* Simulated ticket */}
                <div className="my-6 p-4 rounded-xl bg-slate-950 border border-slate-900 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-3 h-6 bg-[#060910] rounded-r-full -translate-x-1.5" />
                  <div className="absolute top-0 right-0 w-3 h-6 bg-[#060910] rounded-l-full translate-x-1.5" />
                  <div className="flex items-center justify-between border-b border-dashed border-slate-900 pb-3 mb-3">
                    <span className="text-[10px] font-mono text-slate-500">LOMIO PRO GEN-II TICKET</span>
                    <Ticket className="w-4 h-4 text-emerald-400 opacity-60" />
                  </div>
                  <div className="text-center font-mono">
                    <span className="text-[9px] text-slate-500 block">LOMIO REGISTRY QUEUE ID</span>
                    <span className="text-2xl font-bold tracking-widest text-slate-100 block mt-1">
                      #{ticketNumber.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <button
                    onClick={copyReferral}
                    id="btn-waitlist-copy"
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-100 border border-slate-800 text-xs font-semibold cursor-pointer transition-colors active:scale-98"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-400 text-xs">COPIED TICKET DETAIL</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-4 h-4 text-slate-400" />
                        <span>SHARE WITH GUILD</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      localStorage.removeItem('lomio_user_ticket');
                      localStorage.removeItem('lomio_waitlist_email');
                      setIsSubmitted(false);
                      setEmail('');
                    }}
                    id="btn-waitlist-different-email"
                    className="text-[10px] font-mono text-slate-500 hover:text-slate-350 bg-transparent border-none cursor-pointer underline underline-offset-4"
                  >
                    Register another email
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
