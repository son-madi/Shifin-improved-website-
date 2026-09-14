import React, { useState, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import {
  ArrowRight,
  UserPlus,
  LogIn,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Lock,
  User as UserIcon,
  Mail,
  Shield,
  Zap,
  Activity,
  Terminal,
  Cpu,
  Clock,
  Boxes,
  ChevronDown
} from 'lucide-react';
import { PublicPlatformStats, User } from '../types';
import { NinimoIcon } from './NinimoIcon';
import { getDeviceFingerprint } from '../lib/fingerprint';
import { useTheme } from '../context/ThemeContext';

const faqs = [
  {
    question: "What is Ninimo 24/7 Platform?",
    answer: "Ninimo is an autonomous cloud infrastructure platform that runs your Minecraft bots 24/7. It keeps your bots online in servers even when your computer is turned off."
  },
  {
    question: "Does it require my PC to stay on?",
    answer: "No. Ninimo runs entirely in our isolated cloud containers. Once you deploy a bot, you can close your browser and turn off your PC. The bot will continue running and auto-reconnecting 24/7."
  },
  {
    question: "Will I get banned for using this?",
    answer: "Ninimo mimics a vanilla Minecraft client exactly, including authentic movement packets, gravity simulation, and human-like pathfinding (A*). While it is undetectable to standard anti-cheats, server admins may manually review long playtimes."
  },
  {
    question: "Does it support cracked (offline) servers?",
    answer: "Yes, we support both Premium (Microsoft Auth) and Cracked (Offline mode) servers. Simply select your authentication type when creating your bot."
  },
  {
    question: "How does the Anti-AFK system work?",
    answer: "The Anti-AFK module executes randomized micro-movements, random camera pitching, and interval jumps to bypass aggressive anti-idle plugins on servers. It perfectly simulates a player occasionally moving."
  }
];

const FAQItem = ({ faq, isWhite, isColour }: { faq: { question: string, answer: string }, isWhite: boolean, isColour: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isDark = !isWhite && !isColour;

  return (
    <div className={`border-b transition-colors ${
      isWhite ? 'border-slate-200' : isColour ? 'border-indigo-500/20' : 'border-zinc-800'
    }`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-5 flex items-center justify-between text-left focus:outline-none cursor-pointer"
      >
        <span className={`text-sm sm:text-base font-bold ${
          isWhite ? 'text-slate-900' : isColour ? 'text-white' : 'text-zinc-200'
        }`}>
          {faq.question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className={`shrink-0 ml-4 ${isWhite ? 'text-slate-500' : isColour ? 'text-cyan-400' : 'text-zinc-500'}`}
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className={`pb-5 text-sm leading-relaxed ${
              isWhite ? 'text-slate-600' : isColour ? 'text-slate-300' : 'text-zinc-400'
            }`}>
              {faq.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface LivePlatformCounterProps {
  publicStats: PublicPlatformStats | null;
  onSignUp: () => void;
  onSignIn: () => void;
  onAuthSuccess?: (user: User, token: string) => void;
}

export const LivePlatformCounter: React.FC<LivePlatformCounterProps> = ({
  publicStats,
  onAuthSuccess,
}) => {
  const { isDark, isLight, isColourUI } = useTheme();
  const isWhite = isLight;
  const isColour = isColourUI;

  const [mode, setMode] = useState<'signup' | 'login'>('signup');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -14]);

  const activeBotsCount = publicStats !== null && publicStats !== undefined
    ? publicStats.activeBotsOnline
    : 154;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/signup';
      const body =
        mode === 'login'
          ? { usernameOrEmail: username || email, password }
          : { username, email, password };

      const deviceId = getDeviceFingerprint();
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Device-Id': deviceId,
          'X-Device-Fingerprint': deviceId,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      localStorage.setItem('ninimo_token', data.token);
      try {
        localStorage.setItem('ninimo_user_profile', JSON.stringify(data.user));
      } catch {}

      if (onAuthSuccess) {
        onAuthSuccess(data.user, data.token);
      } else {
        window.location.reload();
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`font-sans flex flex-col relative overflow-x-hidden transition-colors duration-300 ${
        isColour
          ? 'bg-[#060a16] text-slate-100 selection:bg-indigo-600 selection:text-white'
          : isWhite
          ? 'bg-[#f8fafc] text-slate-900 selection:bg-slate-200 selection:text-slate-900'
          : 'bg-[#09090b] text-zinc-100 selection:bg-zinc-700 selection:text-white'
      }`}
    >
      {/* Background Architectural Grid & Subtle Top Ambient Glow */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Geometric dot grid */}
        <div
          className={`absolute inset-0 transition-opacity ${
            isWhite ? 'opacity-[0.16]' : isColour ? 'opacity-[0.12]' : 'opacity-[0.08]'
          }`}
          style={{
            backgroundImage: `radial-gradient(${isWhite ? '#64748b' : isColour ? '#38bdf8' : '#ffffff'} 1.2px, transparent 1.2px)`,
            backgroundSize: '24px 24px',
          }}
        />

        {/* Top Ambient Spotlight */}
        <div
          className={`absolute -top-24 left-1/2 -translate-x-1/2 w-[1000px] h-[480px] blur-[120px] pointer-events-none transition-all ${
            isWhite
              ? 'bg-gradient-to-b from-emerald-500/10 via-slate-200/50 to-transparent'
              : isColour
              ? 'bg-gradient-to-b from-cyan-500/20 via-indigo-600/15 to-transparent'
              : 'bg-gradient-to-b from-zinc-700/20 via-zinc-800/10 to-transparent'
          }`}
        />
      </div>

      {/* Hero Section - Mobile-First & Desktop 12-Column Bento Grid */}
      <motion.section
        style={{ y: heroY }}
        className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-12 sm:pt-10 sm:pb-16 lg:pt-14 lg:pb-24 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-start z-10"
      >
        {/* Block 1: Aesthetic Gradient Headline & Value Prop (order-1 on mobile, lg:col-span-7 on desktop) */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="order-1 lg:col-span-7 flex flex-col justify-center space-y-6 sm:space-y-8 pr-0 lg:pr-4"
        >
          {/* Top Controls: Network Status Pill */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Live Network Status Pill */}
            <div
              className={`inline-flex items-center gap-2 sm:gap-2.5 px-3 sm:px-3.5 py-1.5 rounded-full border text-xs font-semibold backdrop-blur-md transition-all ${
                isWhite
                  ? 'border-slate-300 bg-white/95 text-slate-900 shadow-xs'
                  : isColour
                  ? 'border-cyan-500/40 bg-gradient-to-r from-cyan-950/60 via-indigo-950/80 to-[#0c1427] text-cyan-200 shadow-[0_0_20px_rgba(6,182,212,0.2)]'
                  : 'border-zinc-700/80 bg-zinc-900/90 text-zinc-200 shadow-[0_0_20px_rgba(255,255,255,0.05)]'
              }`}
            >
              <span className="relative flex h-2 w-2 shrink-0">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isWhite ? 'bg-slate-900' : isColour ? 'bg-cyan-400' : 'bg-white'
                }`} />
                <span className={`relative inline-flex rounded-full h-2 w-2 ${
                  isWhite ? 'bg-slate-950' : isColour ? 'bg-cyan-400' : 'bg-white'
                }`} />
              </span>
              <span
                className={`font-bold tracking-wide text-[11px] sm:text-xs ${
                  isWhite
                    ? 'text-slate-950'
                    : isColour
                    ? 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-indigo-300'
                    : 'text-white'
                }`}
              >
                Autonomous Cloud Infrastructure
              </span>
              <span className={isWhite ? 'text-slate-300' : 'text-zinc-700'}>|</span>
              <span className={`font-mono text-[11px] font-medium ${isWhite ? 'text-slate-700' : 'text-zinc-300'}`}>
                {activeBotsCount} Bots Active
              </span>
            </div>
          </div>

          {/* Main Headline with Animated Gradient Typography & Generous Spacing tailored to each theme */}
          <div className="space-y-4 sm:space-y-5">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[68px] font-black tracking-tight leading-[1.08] sm:leading-[1.04]">
              <span
                className={`block bg-clip-text text-transparent animate-text-gradient ${
                  isWhite
                    ? 'bg-gradient-to-r from-black via-slate-700 via-slate-900 to-black drop-shadow-[0_2px_10px_rgba(0,0,0,0.12)]'
                    : isColour
                    ? 'bg-gradient-to-r from-white via-cyan-200 via-sky-300 to-indigo-200 drop-shadow-[0_0_30px_rgba(56,189,248,0.4)]'
                    : 'bg-gradient-to-r from-white via-zinc-200 via-zinc-400 to-white drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]'
                }`}
              >
                Autonomous 24/7
              </span>
              <span
                className={`block bg-clip-text text-transparent animate-text-gradient ${
                  isWhite
                    ? 'bg-gradient-to-r from-slate-900 via-slate-600 via-slate-800 to-black drop-shadow-[0_2px_14px_rgba(0,0,0,0.15)]'
                    : isColour
                    ? 'bg-gradient-to-r from-teal-300 via-cyan-300 via-sky-400 to-indigo-400 drop-shadow-[0_0_40px_rgba(34,211,238,0.55)]'
                    : 'bg-gradient-to-r from-white via-zinc-300 via-zinc-100 to-white drop-shadow-[0_0_35px_rgba(255,255,255,0.25)]'
                }`}
              >
                Minecraft Cloud Bots.
              </span>
            </h1>
            <p
              className={`text-base sm:text-lg lg:text-xl max-w-xl font-normal leading-relaxed ${
                isWhite ? 'text-slate-600' : isColour ? 'text-slate-300' : 'text-zinc-300'
              }`}
            >
              Deploy persistent headless Minecraft nodes to keep your servers online, load chunks, and prevent idle kicks —{' '}
              <span
                className={`font-bold ${
                  isWhite
                    ? 'text-slate-950 underline decoration-slate-400 underline-offset-4'
                    : isColour
                    ? 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-indigo-200'
                    : 'text-white'
                }`}
              >
                100% cloud-hosted
              </span>{' '}
              with zero local PC resources.
            </p>
          </div>

          {/* Quick Value Badges */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-1 sm:pt-2">
            <span
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${
                isWhite
                  ? 'bg-white border-slate-200 text-slate-800 shadow-xs'
                  : isColour
                  ? 'bg-indigo-950/50 border-indigo-500/30 text-slate-200'
                  : 'bg-zinc-900/80 border-zinc-800 text-zinc-300'
              }`}
            >
              <Shield className={`w-3.5 h-3.5 ${isColour ? 'text-cyan-400' : isWhite ? 'text-slate-900' : 'text-zinc-200'}`} />
              Heuristic Anti-AFK Jitter
            </span>
            <span
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${
                isWhite
                  ? 'bg-white border-slate-200 text-slate-800 shadow-xs'
                  : isColour
                  ? 'bg-indigo-950/50 border-indigo-500/30 text-slate-200'
                  : 'bg-zinc-900/80 border-zinc-800 text-zinc-300'
              }`}
            >
              <Zap className={`w-3.5 h-3.5 ${isColour ? 'text-cyan-400' : isWhite ? 'text-slate-900' : 'text-zinc-200'}`} />
              Auto-Reconnect Backoff
            </span>
            <span
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${
                isWhite
                  ? 'bg-white border-slate-200 text-slate-800 shadow-xs'
                  : isColour
                  ? 'bg-indigo-950/50 border-indigo-500/30 text-slate-200'
                  : 'bg-zinc-900/80 border-zinc-800 text-zinc-300'
              }`}
            >
              <CheckCircle2 className={`w-3.5 h-3.5 ${isColour ? 'text-cyan-400' : isWhite ? 'text-slate-900' : 'text-zinc-200'}`} />
              Microsoft &amp; Offline Auth
            </span>
          </div>
        </motion.div>

        {/* Block 2: Sleek Authentication Card with Popup Animation on Site Load */}
        <motion.div
          id="landing-signup-card"
          initial={{ opacity: 0, scale: 0.86, y: 32 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{
            type: 'spring',
            stiffness: 260,
            damping: 24,
            mass: 0.85,
            delay: 0.08,
          }}
          className="order-2 lg:col-span-5 lg:row-span-2 w-full max-w-md mx-auto scroll-mt-20 lg:sticky lg:top-24"
        >
          <div
            className={`relative rounded-2xl border p-5 sm:p-7 backdrop-blur-xl shadow-2xl transition-all ${
              isWhite
                ? 'border-slate-200 bg-white/95 text-slate-900 shadow-slate-200/80 ring-1 ring-slate-100'
                : isColour
                ? 'border-indigo-500/40 bg-[#0c1427]/95 text-slate-100 shadow-[0_10px_35px_rgba(30,58,138,0.35)]'
                : 'border-zinc-800 bg-[#121215]/95 text-zinc-100'
            }`}
          >
            {/* Top Glowing Edge Accent Line */}
            <div
              className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent ${
                isWhite
                  ? 'via-slate-400/50'
                  : isColour
                  ? 'via-cyan-400/60'
                  : 'via-white/30'
              } to-transparent`}
            />

            {/* Auth Mode Switcher with Smooth Sliding Indicator */}
            <div
              className={`relative flex p-1 rounded-xl mb-5 border transition-all ${
                isWhite
                  ? 'bg-slate-100 border-slate-200'
                  : isColour
                  ? 'bg-[#070d1e] border-indigo-500/30'
                  : 'bg-zinc-950 border-zinc-800'
              }`}
            >
              <button
                type="button"
                id="auth-signup-tab"
                onClick={() => {
                  setMode('signup');
                  setError(null);
                }}
                className={`relative flex-1 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer z-10 ${
                  mode === 'signup'
                    ? isWhite
                      ? 'text-slate-950 font-black'
                      : isColour
                      ? 'text-white font-black'
                      : 'text-zinc-950 font-black'
                    : isWhite
                    ? 'text-slate-500 hover:text-slate-900'
                    : isColour
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {mode === 'signup' && (
                  <motion.div
                    layoutId="activeLandingAuthTab"
                    className={`absolute inset-0 rounded-lg shadow-sm ${
                      isWhite
                        ? 'bg-white border border-slate-200/80 shadow-slate-200/50'
                        : isColour
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 shadow-md shadow-cyan-500/20'
                        : 'bg-white shadow-md shadow-white/10 ring-1 ring-white/20'
                    }`}
                    transition={{ type: 'spring', stiffness: 420, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Sign Up</span>
                  <span
                    className={`text-[9px] font-mono font-extrabold px-1.5 py-0.5 rounded ${
                      mode === 'signup'
                        ? isWhite
                          ? 'bg-slate-200 text-slate-900 border border-slate-300'
                          : isColour
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30'
                          : 'bg-zinc-800 text-zinc-200 border border-zinc-700'
                        : isWhite
                        ? 'bg-slate-100 text-slate-700'
                        : isColour
                        ? 'bg-indigo-950/60 text-cyan-400 border border-indigo-500/30'
                        : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                    }`}
                  >
                    FREE
                  </span>
                </span>
              </button>
              <button
                type="button"
                id="auth-login-tab"
                onClick={() => {
                  setMode('login');
                  setError(null);
                }}
                className={`relative flex-1 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer z-10 ${
                  mode === 'login'
                    ? isWhite
                      ? 'text-slate-950 font-bold'
                      : isColour
                      ? 'text-white font-bold'
                      : 'text-white font-bold'
                    : isWhite
                    ? 'text-slate-500 hover:text-slate-900'
                    : isColour
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {mode === 'login' && (
                  <motion.div
                    layoutId="activeLandingAuthTab"
                    className={`absolute inset-0 rounded-lg shadow-sm ${
                      isWhite
                        ? 'bg-white border border-slate-200/80 shadow-slate-200/50'
                        : isColour
                        ? 'bg-indigo-900/90 border border-indigo-500/40 shadow-xs'
                        : 'bg-zinc-800 border border-zinc-700 shadow-xs'
                    }`}
                    transition={{ type: 'spring', stiffness: 420, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </span>
              </button>
            </div>

            {/* Smooth Tab Content Crossfade & Transition */}
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={mode}
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Title & Subtitle */}
                <div className="mb-4">
                  <h2
                    className={`text-lg sm:text-xl font-bold tracking-tight flex items-center justify-between ${
                      isWhite ? 'text-slate-900' : 'text-white'
                    }`}
                  >
                    <span>{mode === 'signup' ? 'Create Free Account' : 'Welcome Back'}</span>
                    {mode === 'signup' && (
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                          isWhite
                            ? 'bg-slate-100 border-slate-200 text-slate-600'
                            : isColour
                            ? 'bg-indigo-950/80 border-indigo-500/40 text-cyan-300'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                        }`}
                      >
                        Instant Setup
                      </span>
                    )}
                  </h2>
                  <p className={`text-xs mt-1 ${isWhite ? 'text-slate-500' : isColour ? 'text-slate-400' : 'text-zinc-400'}`}>
                    {mode === 'signup'
                      ? 'Sign up to deploy your first 24/7 headless bot node in 10 seconds.'
                      : 'Enter your credentials to access your fleet.'}
                  </p>
                </div>

                {/* Error Banner */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3 mb-4 rounded-xl border text-xs flex items-center gap-2 ${
                      isWhite
                        ? 'bg-red-50 border-red-200 text-red-700'
                        : 'bg-red-950/50 border-red-500/40 text-red-300'
                    }`}
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                    <span>{error}</span>
                  </motion.div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-3.5">
                  <div className="space-y-1">
                    <label
                      className={`block text-xs font-medium ${
                        isWhite ? 'text-slate-700 font-semibold' : 'text-zinc-300'
                      }`}
                    >
                      {mode === 'login' ? 'Username or Email' : 'Commander Username'}
                    </label>
                    <div className="relative">
                      <div
                        className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none ${
                          isWhite ? 'text-slate-400' : 'text-zinc-500'
                        }`}
                      >
                        <UserIcon className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder={mode === 'login' ? 'steve or steve@mail.com' : 'e.g. CommanderSteve'}
                        required
                        className={`w-full h-11 rounded-xl pl-10 pr-3.5 text-sm outline-none transition-all ${
                          isWhite
                            ? 'bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900'
                            : isColour
                            ? 'bg-[#070d1e] border border-indigo-500/40 text-white placeholder-slate-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400'
                            : 'bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500'
                        }`}
                      />
                    </div>
                  </div>

                  {mode === 'signup' && (
                    <div className="space-y-1">
                      <label
                        className={`block text-xs font-medium ${
                          isWhite ? 'text-slate-700 font-semibold' : 'text-zinc-300'
                        }`}
                      >
                        Email Address
                      </label>
                      <div className="relative">
                        <div
                          className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none ${
                            isWhite ? 'text-slate-400' : 'text-zinc-500'
                          }`}
                        >
                          <Mail className="w-4 h-4" />
                        </div>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="steve@domain.com"
                          required={mode === 'signup'}
                          className={`w-full h-11 rounded-xl pl-10 pr-3.5 text-sm outline-none transition-all ${
                            isWhite
                              ? 'bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900'
                              : isColour
                              ? 'bg-[#070d1e] border border-indigo-500/40 text-white placeholder-slate-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400'
                              : 'bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500'
                          }`}
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label
                      className={`block text-xs font-medium ${
                        isWhite ? 'text-slate-700 font-semibold' : 'text-zinc-300'
                      }`}
                    >
                      Password
                    </label>
                    <div className="relative">
                      <div
                        className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none ${
                          isWhite ? 'text-slate-400' : 'text-zinc-500'
                        }`}
                      >
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        required
                        className={`w-full h-11 rounded-xl pl-10 pr-10 text-sm outline-none transition-all ${
                          isWhite
                            ? 'bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900'
                            : isColour
                            ? 'bg-[#070d1e] border border-indigo-500/40 text-white placeholder-slate-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400'
                            : 'bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={`absolute right-3.5 top-3 transition-colors cursor-pointer ${
                          isWhite
                            ? 'text-slate-400 hover:text-slate-700'
                            : 'text-zinc-500 hover:text-white'
                        }`}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full mt-1 h-11 px-4 rounded-xl font-bold text-sm transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98] cursor-pointer ${
                      isWhite
                        ? 'bg-slate-950 hover:bg-slate-800 text-white shadow-md shadow-slate-900/15'
                        : isColour
                        ? 'bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 hover:from-cyan-300 hover:to-indigo-500 text-white shadow-lg shadow-cyan-500/25'
                        : 'bg-white hover:bg-zinc-200 text-zinc-950 shadow-md shadow-white/5'
                    }`}
                  >
                    {loading ? (
                      <span
                        className={`w-4 h-4 border-2 border-t-transparent rounded-full animate-spin ${
                          isWhite ? 'border-white' : 'border-zinc-950'
                        }`}
                      />
                    ) : (
                      <>
                        <span>{mode === 'signup' ? 'Complete Sign Up & Launch' : 'Sign In to Commander'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            </AnimatePresence>

            {/* Bottom Verification Badges */}
            <div
              className={`mt-4 pt-3.5 border-t flex flex-col gap-1.5 text-[11px] ${
                isWhite
                  ? 'border-slate-200 text-slate-600'
                  : isColour
                  ? 'border-indigo-500/30 text-slate-300'
                  : 'border-zinc-800/80 text-zinc-400'
              }`}
            >
              <div className="flex items-center gap-2">
                <CheckCircle2
                  className={`w-3.5 h-3.5 shrink-0 ${
                    isWhite ? 'text-slate-900' : isColour ? 'text-cyan-400' : 'text-zinc-300'
                  }`}
                />
                <span>Isolated cloud bot container with automatic reconnect</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2
                  className={`w-3.5 h-3.5 shrink-0 ${
                    isWhite ? 'text-slate-900' : isColour ? 'text-cyan-400' : 'text-zinc-300'
                  }`}
                />
                <span>Offline (cracked) and Microsoft auth supported</span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.section>

      {/* Feature Architecture Section (3-Theme Responsive) */}
      <section
        className={`relative w-full py-20 sm:py-28 border-t transition-colors ${
          isWhite
            ? 'border-slate-200 bg-white'
            : isColour
            ? 'border-indigo-500/30 bg-[#060b1b]'
            : 'border-zinc-800/80 bg-[#09090b]'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-2xl mx-auto mb-16 space-y-3"
          >
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-mono font-semibold ${
                isWhite
                  ? 'border-slate-300 bg-slate-100 text-slate-700'
                  : isColour
                  ? 'border-indigo-500/40 bg-indigo-950/60 text-cyan-300'
                  : 'border-zinc-800 bg-zinc-900 text-zinc-300'
              }`}
            >
              <Cpu className={`w-3.5 h-3.5 ${isWhite ? 'text-slate-600' : isColour ? 'text-cyan-400' : 'text-zinc-400'}`} />
              <span>CORE ARCHITECTURE</span>
            </div>
            <h2
              className={`text-3xl sm:text-4xl font-bold tracking-tight ${
                isWhite ? 'text-slate-950' : 'text-white'
              }`}
            >
              Built for pure uptime and low overhead.
            </h2>
            <p className={`text-sm sm:text-base leading-relaxed ${isWhite ? 'text-slate-600' : 'text-zinc-400'}`}>
              Every bot runs as an isolated process on dedicated nodes with continuous socket supervision and heuristic anti-detection algorithms.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: (
                  <Activity
                    className={`w-5 h-5 ${
                      isWhite ? 'text-slate-900' : isColour ? 'text-cyan-400' : 'text-white'
                    }`}
                  />
                ),
                title: 'Heuristic Anti-AFK Movement',
                desc: 'Continuous micro-strafing, non-linear camera rotation (pitch/yaw jitter), and randomized jumps that comfortably bypass AFK detection plugins.',
                tag: 'BEHAVIOR',
              },
              {
                icon: (
                  <Terminal
                    className={`w-5 h-5 ${
                      isWhite ? 'text-slate-900' : isColour ? 'text-cyan-400' : 'text-white'
                    }`}
                  />
                ),
                title: 'Live Bidirectional Terminal',
                desc: 'Direct bidirectional chat forwarding with full Minecraft color code decoding (§a, §c). Send in-game commands directly from your browser.',
                tag: 'TELEMETRY',
              },
              {
                icon: (
                  <Shield
                    className={`w-5 h-5 ${
                      isWhite ? 'text-slate-900' : isColour ? 'text-cyan-400' : 'text-white'
                    }`}
                  />
                ),
                title: 'Autonomous Auto-Reconnect',
                desc: 'Exponential backoff keeps your bot attempting reconnections if the target server restarts, crashes, or drops the connection.',
                tag: 'RESILIENCE',
              },
              {
                icon: (
                  <Zap
                    className={`w-5 h-5 ${
                      isWhite ? 'text-slate-900' : isColour ? 'text-cyan-400' : 'text-white'
                    }`}
                  />
                ),
                title: 'Automated On-Join Scripts',
                desc: 'Configure custom on-join commands (/login, /register, /server hub) executed with human timing pauses upon world spawn.',
                tag: 'AUTOMATION',
              },
              {
                icon: (
                  <Boxes
                    className={`w-5 h-5 ${
                      isWhite ? 'text-slate-900' : isColour ? 'text-cyan-400' : 'text-white'
                    }`}
                  />
                ),
                title: 'Zero Local PC Power',
                desc: 'Close your browser tab and shut down your computer. Your cloud node keeps the server alive 24/7 without consuming electricity.',
                tag: 'CLOUD',
              },
              {
                icon: (
                  <Clock
                    className={`w-5 h-5 ${
                      isWhite ? 'text-slate-900' : isColour ? 'text-cyan-400' : 'text-white'
                    }`}
                  />
                ),
                title: 'Chunk & Spawner Retention',
                desc: 'Keep mob grinders, iron farms, and sugarcane farms actively running by placing your bot right inside the chunk perimeter.',
                tag: 'SIMULATION',
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.06 }}
                className={`group rounded-2xl border p-6 transition-all duration-200 flex flex-col justify-between ${
                  isWhite
                    ? 'border-slate-200 bg-slate-50/70 hover:border-slate-300 hover:bg-white hover:shadow-lg'
                    : isColour
                    ? 'border-indigo-500/30 bg-[#0b1226]/80 hover:border-cyan-400/50 hover:bg-[#0f1730]'
                    : 'border-zinc-800 bg-[#121215] hover:border-zinc-600 hover:bg-[#151518]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`p-2.5 rounded-xl border transition-colors ${
                        isWhite
                          ? 'bg-white border-slate-200 shadow-xs group-hover:border-slate-300'
                          : isColour
                          ? 'bg-indigo-950/60 border-indigo-500/40 group-hover:border-cyan-400/40'
                          : 'bg-zinc-900 border-zinc-800 group-hover:border-zinc-600'
                      }`}
                    >
                      {item.icon}
                    </div>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                        isWhite
                          ? 'bg-white border-slate-200 text-slate-700'
                          : isColour
                          ? 'bg-indigo-950/80 border-indigo-500/30 text-cyan-300'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      {item.tag}
                    </span>
                  </div>
                  <h3
                    className={`text-base font-bold mb-2 tracking-tight ${
                      isWhite ? 'text-slate-950' : 'text-white'
                    }`}
                  >
                    {item.title}
                  </h3>
                  <p
                    className={`text-xs sm:text-sm leading-relaxed font-normal ${
                      isWhite ? 'text-slate-600' : 'text-zinc-400'
                    }`}
                  >
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3-Step Deployment Workflow */}
      <section
        className={`relative w-full py-20 sm:py-24 border-t transition-colors ${
          isWhite
            ? 'border-slate-200 bg-slate-100/60'
            : isColour
            ? 'border-indigo-500/30 bg-[#080e21]'
            : 'border-zinc-800/80 bg-[#0c0c0f]'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-xl mx-auto mb-16 space-y-2"
          >
            <span
              className={`text-xs font-mono font-semibold uppercase tracking-widest ${
                isWhite ? 'text-slate-500' : isColour ? 'text-cyan-400' : 'text-zinc-400'
              }`}
            >
              DEPLOYMENT WORKFLOW
            </span>
            <h2
              className={`text-3xl font-bold tracking-tight ${
                isWhite ? 'text-slate-950' : 'text-white'
              }`}
            >
              How It Works
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                title: 'Enter Server IP & Bot Name',
                desc: 'Specify the server host, port (default 25565), and your bot nickname. Select offline or Microsoft authentication.',
              },
              {
                step: '02',
                title: 'Configure Behavioral Routines',
                desc: 'Toggle anti-AFK yaw/pitch jitter, configure optional on-join commands, and enable auto-reconnect.',
              },
              {
                step: '03',
                title: 'Shut Down Your Computer',
                desc: 'Your bot remains online 24/7 in our cloud container cluster. Access the dashboard from any device at any time.',
              },
            ].map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className={`relative rounded-2xl border p-8 space-y-3 transition-all ${
                  isWhite
                    ? 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-lg'
                    : isColour
                    ? 'border-indigo-500/30 bg-[#0d162e]/70 hover:border-cyan-400/40'
                    : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
                }`}
              >
                <div
                  className={`text-3xl font-mono font-black ${
                    isWhite
                      ? 'text-slate-300'
                      : isColour
                      ? 'text-indigo-400/40'
                      : 'text-zinc-600'
                  }`}
                >
                  {step.step}
                </div>
                <h3
                  className={`text-lg font-bold tracking-tight ${
                    isWhite ? 'text-slate-950' : 'text-white'
                  }`}
                >
                  {step.title}
                </h3>
                <p
                  className={`text-xs sm:text-sm leading-relaxed font-normal ${
                    isWhite ? 'text-slate-600' : 'text-zinc-400'
                  }`}
                >
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section
        className={`relative w-full py-16 sm:py-24 border-t transition-colors ${
          isWhite
            ? 'border-slate-200 bg-slate-50'
            : isColour
            ? 'border-indigo-500/30 bg-[#080d24]'
            : 'border-zinc-800/80 bg-zinc-950'
        }`}
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10 sm:mb-14"
          >
            <h2
              className={`text-2xl sm:text-3xl font-black tracking-tight ${
                isWhite ? 'text-slate-950' : 'text-white'
              }`}
            >
              Frequently Asked Questions
            </h2>
            <p
              className={`mt-4 text-sm max-w-lg mx-auto ${
                isWhite ? 'text-slate-600' : 'text-zinc-400'
              }`}
            >
              Everything you need to know about the Ninimo 24/7 Platform and how it works.
            </p>
          </motion.div>

          <div className={`border-t ${
            isWhite ? 'border-slate-200' : isColour ? 'border-indigo-500/20' : 'border-zinc-800'
          }`}>
            {faqs.map((faq, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
              >
                <FAQItem faq={faq} isWhite={isWhite} isColour={isColour} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section
        className={`relative w-full py-16 sm:py-20 border-t transition-colors ${
          isWhite
            ? 'border-slate-200 bg-white'
            : isColour
            ? 'border-indigo-500/30 bg-[#060b1b]'
            : 'border-zinc-800/80 bg-[#09090b]'
        }`}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4">
          <h2
            className={`text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight ${
              isWhite ? 'text-slate-950' : 'text-white'
            }`}
          >
            Ready to deploy your 24/7 bot?
          </h2>
          <p
            className={`text-xs sm:text-sm max-w-lg mx-auto leading-relaxed ${
              isWhite ? 'text-slate-600' : 'text-zinc-400'
            }`}
          >
            Create a free account in 10 seconds and start running your cloud Minecraft bots right away.
          </p>
          <div className="pt-2">
            <button
              onClick={() => {
                setMode('signup');
                const card = document.getElementById('landing-signup-card');
                if (card) {
                  card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  const input = card.querySelector('input');
                  setTimeout(() => input?.focus(), 350);
                } else {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-150 active:scale-95 cursor-pointer ${
                isWhite
                  ? 'bg-slate-950 hover:bg-slate-800 text-white shadow-lg shadow-slate-950/15'
                  : isColour
                  ? 'bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 hover:from-cyan-300 hover:to-indigo-500 text-white shadow-lg shadow-cyan-500/30'
                  : 'bg-white hover:bg-zinc-200 text-zinc-950 shadow-lg shadow-white/5'
              }`}
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Minimalist 3-Theme Footer */}
      <footer
        className={`w-full border-t py-8 transition-colors ${
          isWhite
            ? 'border-slate-200 bg-slate-50'
            : isColour
            ? 'border-indigo-500/30 bg-[#040814]'
            : 'border-zinc-800/80 bg-[#09090b]'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <NinimoIcon size="sm" />
            <span
              className={`text-xs font-bold ${
                isWhite ? 'text-slate-800' : isColour ? 'text-slate-200' : 'text-zinc-300'
              }`}
            >
              Ninimo 24/7 Platform
            </span>
          </div>
          <p
            className={`text-xs font-mono ${
              isWhite ? 'text-slate-500' : isColour ? 'text-slate-400' : 'text-zinc-500'
            }`}
          >
            &copy; {new Date().getFullYear()} Ninimo Autonomous Infrastructure.
          </p>
        </div>
      </footer>
    </div>
  );
};
