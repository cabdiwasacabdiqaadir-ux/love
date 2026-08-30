import React, { useState, useMemo, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Heart, Home as HomeIcon, BookOpen, Target, TrendingUp, User as UserIcon,
  Smile, Meh, Frown, Menu, X, Trash2, Pencil, Check, Sparkles, LogOut,
  Flame, AlertCircle, Loader2, Settings, ShieldCheck, Zap, ArrowRight, Lock,
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from "recharts";

/* ------------------------------------------------------------------ */
/* Fonts + Enhanced Design Tokens                                    */
/* ------------------------------------------------------------------ */
const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@450;500;600;700;800&family=Outfit:wght@400;500;600;700;800&display=swap');
    .font-display { font-family: 'Outfit', sans-serif; }
    .font-body { font-family: 'Plus Jakarta+Sans', sans-serif; }
    @keyframes floatUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes pulseGlow { 0%, 100% { opacity: 0.6; transform: scale(1); } 50% { opacity: 1; transform: scale(1.03); } }
    @keyframes spin { to { transform: rotate(360deg); } }
    .animate-in { animation: floatUp .4s cubic-bezier(0.16, 1, 0.3, 1) both; }
    .animate-spin-slow { animation: spin 1.2s linear infinite; }
    .pulse-glow { animation: pulseGlow 4s ease-in-out infinite; }
    ::selection { background: #FF658425; color: #FF3366; }
    
    /* Custom Glassmorphism & Scrollbars */
    .glass-card {
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
    }
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
    ::-webkit-scrollbar-thumb:hover { background: #CBD5E1; }
  `}</style>
);

const COLORS = {
  ink: "#0F172A",
  violet: "#7C3AED",
  violetDeep: "#6D28D9",
  pink: "#FF3366",
  pinkLight: "#FFF1F3",
  cream: "#F8FAFC",
  panel: "#FFFFFF",
  line: "#F1F5F9",
  muted: "#64748B",
  success: "#10B981",
  danger: "#EF4444",
  gradientMain: "linear-gradient(135deg, #7C3AED 0%, #FF3366 100%)",
  gradientSoft: "linear-gradient(135deg, rgba(124, 58, 237, 0.06) 0%, rgba(255, 51, 102, 0.06) 100%)",
};

const MOOD_OPTIONS = [
  { key: "happy", icon: Smile, label: "Radiant", score: 5, color: "#10B981" },
  { key: "good", icon: Smile, label: "Peaceful", score: 4, color: "#3B82F6" },
  { key: "okay", icon: Meh, label: "Neutral", score: 3, color: "#F59E0B" },
  { key: "sad", icon: Frown, label: "Heavy", score: 2, color: "#8B5CF6" },
  { key: "heartbroken", icon: Heart, label: "Fragile", score: 1, color: "#FF3366" },
];

const QUOTES = [
  "Your heart is rewiring for resilience, not breaking.",
  "You don't need closure to create a stunning new beginning.",
  "Honoring your grief is the highest form of self-respect.",
  "The space between your old story and your new one is where transformation happens.",
  "Peace is found when you finally stop fighting your own healing timeline.",
];

const fmtDay = (iso) => new Date(iso).toLocaleDateString("en-US", { weekday: "short" });
const fmtDate = (iso) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
const fmtLongDate = (iso) => new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

/* ------------------------------------------------------------------ */
/* Signature element: The Reimagined Healing Heart Glyph               */
/* ------------------------------------------------------------------ */
function HealingHeart({ percent = 0, size = 120 }) {
  const crackOpacity = Math.max(0.1, 1 - percent / 100);
  const fillId = "heartGradientClean";
  return (
    <div className="relative flex items-center justify-center p-3 pulse-glow">
      <div className="absolute inset-0 rounded-full blur-xl opacity-30" style={{ background: COLORS.gradientMain }} />
      <svg width={size} height={size} viewBox="0 0 100 100" className="relative z-10 drop-shadow-md">
        <defs>
          <linearGradient id={fillId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#FF3366" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        {/* Glow Background Track */}
        <path
          d="M50 88 C20 66, 6 46, 6 28 C6 12, 20 4, 33 8 C42 11, 48 19, 50 25 C52 19, 58 11, 67 8 C80 4, 94 12, 94 28 C94 46, 80 66, 50 88 Z"
          fill="#F1F5F9"
        />
        {/* Dynamic Progress Fill */}
        <path
          d="M50 88 C20 66, 6 46, 6 28 C6 12, 20 4, 33 8 C42 11, 48 19, 50 25 C52 19, 58 11, 67 8 C80 4, 94 12, 94 28 C94 46, 80 66, 50 88 Z"
          fill={`url(#${fillId})`}
          opacity={0.2 + (percent / 100) * 0.8}
          style={{ transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)" }}
        />
        {/* Outline Frame */}
        <path
          d="M50 88 C20 66, 6 46, 6 28 C6 12, 20 4, 33 8 C42 11, 48 19, 50 25 C52 19, 58 11, 67 8 C80 4, 94 12, 94 28 C94 46, 80 66, 50 88 Z"
          fill="none"
          stroke="url(#heartGradientClean)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Healing Crack Lines */}
        <path
          d="M49 22 L44 37 L53 43 L42 63 L57 45 L47 41 L57 26 Z"
          fill="#0F172A"
          opacity={crackOpacity}
          style={{ transition: "opacity 0.8s ease" }}
        />
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Gorgeous Building Blocks                                            */
/* ------------------------------------------------------------------ */
const Card = ({ children, className = "", hoverEffect = true }) => (
  <div
    className={`bg-white rounded-3xl border p-7 animate-in transition-all duration-300 ${
      hoverEffect ? "hover:shadow-lg hover:shadow-violet-500/5 hover:-translate-y-0.5" : ""
    } ${className}`}
    style={{ borderColor: "#F1F5F9", boxShadow: "0 4px 20px -2px rgba(15, 23, 42, 0.03)" }}
  >
    {children}
  </div>
);

const Eyebrow = ({ children, icon: Icon }) => (
  <div className="flex items-center gap-1.5 font-body text-[11px] tracking-[0.18em] uppercase font-bold text-violet-600 mb-1">
    {Icon && <Icon size={13} />}
    {children}
  </div>
);

const ProgressBar = ({ value, color = COLORS.violet }) => (
  <div className="w-full h-3 rounded-full overflow-hidden bg-slate-100 p-0.5 border border-slate-200/50">
    <div
      className="h-full rounded-full transition-all duration-700 ease-out shadow-sm"
      style={{
        width: `${Math.max(0, Math.min(100, value))}%`,
        background: `linear-gradient(90deg, #7C3AED, #FF3366)`,
      }}
    />
  </div>
);

const Button = ({ children, onClick, variant = "primary", className = "", type = "button", disabled, size = "md" }) => {
  const sizeClasses = size === "sm" ? "px-3.5 py-2 text-xs" : "px-6 py-3 text-sm";
  const styles = {
    primary: {
      background: COLORS.gradientMain,
      color: "#fff",
      boxShadow: "0 10px 25px -5px rgba(124, 58, 237, 0.35)",
    },
    ghost: {
      background: "#F8FAFC",
      color: COLORS.ink,
      border: "1px solid #E2E8F0",
    },
    dark: {
      background: COLORS.ink,
      color: "#fff",
      boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.25)",
    },
    danger: {
      background: "#FEF2F2",
      color: "#EF4444",
      border: "1px solid #FEE2E2",
    },
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{ ...styles[variant], opacity: disabled ? 0.6 : 1, cursor: disabled ? "not-allowed" : "pointer" }}
      className={`font-body font-bold rounded-2xl transition-all duration-200 active:scale-[0.98] hover:opacity-95 flex items-center justify-center gap-2.5 ${sizeClasses} ${className}`}
    >
      {children}
    </button>
  );
};

const Input = ({ label, icon: Icon, ...props }) => (
  <label className="block mb-4 text-left">
    <span className="font-body text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">
      {label}
    </span>
    <div className="relative flex items-center">
      {Icon && <Icon size={18} className="absolute left-3.5 text-slate-400 pointer-events-none" />}
      <input
        {...props}
        className={`w-full font-body text-sm rounded-2xl border bg-slate-50/50 py-3.5 outline-none transition-all duration-200 focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 ${
          Icon ? "pl-11 pr-4" : "px-4"
        }`}
        style={{ borderColor: "#E2E8F0" }}
      />
    </div>
  </label>
);

const NavItem = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl font-body text-sm font-semibold transition-all duration-200 group ${
      active
        ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    }`}
  >
    <Icon size={18} className={active ? "text-pink-400" : "text-slate-400 group-hover:text-slate-600 transition-colors"} />
    {label}
  </button>
);

const ErrorBanner = ({ message, onClose }) =>
  !message ? null : (
    <div
      className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl text-sm font-semibold animate-in shadow-xl bg-red-50 text-red-600 border border-red-200"
    >
      <AlertCircle size={18} className="shrink-0 text-red-500" />
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 p-1 rounded-full hover:bg-red-100 transition-colors">
        <X size={15} />
      </button>
    </div>
  );

const FullscreenLoader = ({ label }) => (
  <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-50 font-body">
    <div className="relative p-4 rounded-3xl bg-white shadow-xl shadow-violet-500/10 border border-slate-100 animate-pulse">
      <Loader2 size={32} className="animate-spin-slow text-violet-600" />
    </div>
    <p className="text-sm font-semibold text-slate-500 tracking-wide">{label}</p>
  </div>
);

/* ------------------------------------------------------------------ */
/* API layer                                                           */
/* ------------------------------------------------------------------ */
function useApi(apiBase, token) {
  const client = useMemo(() => axios.create({ baseURL: apiBase }), [apiBase]);

  const request = useCallback(
    async (method, path, body) => {
      try {
        const res = await client.request({
          url: path,
          method,
          data: body,
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        return res.data;
      } catch (err) {
        const message =
          err.response?.data?.message ||
          (err.request ? "Can't reach the API. Check your connection or server status." : err.message);
        throw new Error(message);
      }
    },
    [client, token]
  );

  return {
    get: (path) => request("get", path),
    post: (path, body) => request("post", path, body),
    put: (path, body) => request("put", path, body),
    del: (path) => request("delete", path),
  };
}

/* ==================================================================
   APP SHELL
================================================================== */
export default function HeartReset() {
  const [apiBase, setApiBase] = useState(import.meta.env.VITE_API_URL || "http://localhost:5000/api");
  const [showApiSettings, setShowApiSettings] = useState(false);

  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [authPage, setAuthPage] = useState("home"); // home | login | register
  const [page, setPage] = useState("dashboard");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const [bootLoading, setBootLoading] = useState(false);
  const [error, setError] = useState("");

  const [heart, setHeart] = useState(null);
  const [moods, setMoods] = useState([]);
  const [journal, setJournal] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [journalDraft, setJournalDraft] = useState({ title: "", content: "" });
  const [editingId, setEditingId] = useState(null);
  const [moodNote, setMoodNote] = useState("");
  const [selectedMood, setSelectedMood] = useState(null);
  const [quote] = useState(QUOTES[Math.floor(Math.random() * QUOTES.length)]);

  const api = useApi(apiBase, token);
  const authed = !!token;

  const showError = (e) => setError(e?.message || String(e));

  /* ---------------- Derived recovery % ---------------- */
  const completedChallenges = challenges.filter((c) => c.completed).length;
  const recovery = useMemo(() => {
    if (!challenges.length && !moods.length) return heart?.recoveryPercentage || 0;
    const moodAvg = moods.length ? moods.reduce((a, m) => a + (MOOD_OPTIONS.find((o) => o.key === m.mood)?.score || 3), 0) / (moods.length * 5) : 0.5;
    const challengeRatio = challenges.length ? completedChallenges / challenges.length : 0;
    const journalBoost = Math.min(journal.length / 15, 1);
    return Math.round((moodAvg * 0.4 + challengeRatio * 0.45 + journalBoost * 0.15) * 100);
  }, [moods, completedChallenges, challenges.length, journal.length, heart]);

  useEffect(() => {
    if (!authed || !heart) return;
    if (heart.recoveryPercentage === recovery) return;
    api.put("/heart", { recoveryPercentage: recovery }).then((d) => setHeart(d.heart)).catch(() => {});
  }, [recovery, authed, heart, api]);

  const todaysChallenge = challenges.find((c) => !c.completed) || challenges[challenges.length - 1];

  const loadAll = useCallback(async () => {
    setBootLoading(true);
    setError("");
    try {
      let heartData;
      try {
        heartData = (await api.get("/heart")).heart;
      } catch {
        heartData = (await api.post("/heart", { status: "BROKEN", reason: "", recoveryPercentage: 0 })).heart;
      }
      const [moodRes, journalRes, challengeRes] = await Promise.all([
        api.get("/mood"),
        api.get("/journal"),
        api.get("/challenges"),
      ]);
      setHeart(heartData);
      setMoods(moodRes.moods);
      setJournal(journalRes.entries);
      setChallenges(challengeRes.challenges);
    } catch (e) {
      showError(e);
    } finally {
      setBootLoading(false);
    }
  }, [api]);

  useEffect(() => {
    if (authed) loadAll();
  }, [authed, loadAll]);

  const goApp = (p) => {
    setPage(p);
    setMobileNavOpen(false);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setHeart(null);
    setMoods([]);
    setJournal([]);
    setChallenges([]);
    setAuthPage("home");
  };

  const register = async ({ name, email, password, confirmPassword }) => {
    setError("");
    try {
      const data = await api.post("/auth/register", { name, email, password, confirmPassword });
      setUser(data.user);
      setToken(data.token);
    } catch (e) {
      showError(e);
    }
  };

  const login = async ({ email, password }) => {
    setError("");
    try {
      const data = await api.post("/auth/login", { email, password });
      setUser(data.user);
      setToken(data.token);
    } catch (e) {
      showError(e);
    }
  };

  const saveHeartStatus = async (reason) => {
    try {
      const data = await api.put("/heart", { status: "BROKEN", reason });
      setHeart(data.heart);
      return true;
    } catch (e) {
      showError(e);
      return false;
    }
  };

  const saveJournal = async () => {
    if (!journalDraft.title.trim() && !journalDraft.content.trim()) return;
    try {
      if (editingId) {
        const data = await api.put(`/journal/${editingId}`, journalDraft);
        setJournal((j) => j.map((e) => (e._id === editingId ? data.entry : e)));
        setEditingId(null);
      } else {
        const data = await api.post("/journal", journalDraft);
        setJournal((j) => [data.entry, ...j]);
      }
      setJournalDraft({ title: "", content: "" });
    } catch (e) {
      showError(e);
    }
  };

  const editJournal = (entry) => {
    setEditingId(entry._id);
    setJournalDraft({ title: entry.title, content: entry.content });
  };

  const deleteJournal = async (id) => {
    try {
      await api.del(`/journal/${id}`);
      setJournal((j) => j.filter((e) => e._id !== id));
    } catch (e) {
      showError(e);
    }
  };

  const saveMood = async () => {
    if (!selectedMood) return;
    try {
      const data = await api.post("/mood", { mood: selectedMood, note: moodNote });
      setMoods((m) => [...m, data.mood]);
      setSelectedMood(null);
      setMoodNote("");
    } catch (e) {
      showError(e);
    }
  };

  const toggleChallenge = async (challenge) => {
    try {
      const data = await api.put(`/challenges/${challenge._id}`, { completed: !challenge.completed });
      setChallenges((cs) => cs.map((c) => (c._id === challenge._id ? data.challenge : c)));
    } catch (e) {
      showError(e);
    }
  };

  /* ==================================================================
     PUBLIC (PRE-AUTH) RENDER
  ================================================================== */
  if (!authed) {
    return (
      <div className="min-h-screen font-body bg-slate-50 text-slate-900 selection:bg-pink-500/20 selection:text-pink-600">
        <FontLoader />
        <ErrorBanner message={error} onClose={() => setError("")} />
        <PublicNav
          setPage={setAuthPage}
          apiBase={apiBase}
          // showApiSettings={showApiSettings}
          setShowApiSettings={setShowApiSettings}
          setApiBase={setApiBase}
        />
        {authPage === "home" && <HomePage onStart={() => setAuthPage("register")} onLogin={() => setAuthPage("login")} />}
        {authPage === "login" && <AuthPage mode="login" onSwitch={() => setAuthPage("register")} onSubmit={login} />}
        {authPage === "register" && <AuthPage mode="register" onSwitch={() => setAuthPage("login")} onSubmit={register} />}
      </div>
    );
  }

  if (bootLoading && !heart) {
    return <FullscreenLoader label="Syncing your sanctuary..." />;
  }

  /* ==================================================================
     AUTHENTICATED APP SHELL
  ================================================================== */
  const navItems = [
    { key: "dashboard", label: "Dashboard", icon: HomeIcon },
    { key: "heart", label: "Heart Status", icon: Heart },
    { key: "mood", label: "Mood Tracker", icon: Smile },
    { key: "journal", label: "Journal", icon: BookOpen },
    { key: "challenges", label: "Challenges", icon: Target },
    { key: "progress", label: "Progress", icon: TrendingUp },
    { key: "profile", label: "Profile", icon: UserIcon },
  ];

  return (
    <div className="min-h-screen font-body flex bg-slate-50/50 text-slate-900 selection:bg-pink-500/20 selection:text-pink-600">
      <FontLoader />
      <ErrorBanner message={error} onClose={() => setError("")} />

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 shrink-0 border-r flex-col p-6 bg-white/80 backdrop-blur-xl sticky top-0 h-screen shadow-sm" style={{ borderColor: "#F1F5F9" }}>
        <div className="flex items-center gap-3 px-2 py-4 mb-6">
          <div className="p-2 rounded-2xl bg-gradient-to-tr from-violet-600 to-pink-500 shadow-lg shadow-violet-500/20 text-white">
            <Heart size={20} fill="#fff" />
          </div>
          <div>
            <span className="font-display text-lg font-bold tracking-tight bg-gradient-to-r from-violet-700 to-pink-600 bg-clip-text text-transparent">
              HeartReset
            </span>
            <span className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase">Private Sanctuary</span>
          </div>
        </div>

        <nav className="flex flex-col gap-1.5 flex-1">
          {navItems.map((it) => (
            <NavItem key={it.key} icon={it.icon} label={it.label} active={page === it.key} onClick={() => goApp(it.key)} />
          ))}
        </nav>

        <div className="pt-4 border-t border-slate-100">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-body text-sm font-semibold text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
          >
            <LogOut size={18} /> Sign out
          </button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-5 py-4 bg-white/90 backdrop-blur-md border-b shadow-xs" style={{ borderColor: "#F1F5F9" }}>
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-xl bg-gradient-to-tr from-violet-600 to-pink-500 text-white">
            <Heart size={16} fill="#fff" />
          </div>
          <span className="font-display text-base font-bold tracking-tight bg-gradient-to-r from-violet-700 to-pink-600 bg-clip-text text-transparent">
            HeartReset
          </span>
        </div>
        <button
          onClick={() => setMobileNavOpen((v) => !v)}
          className="p-2.5 rounded-2xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
        >
          {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Dropdown Nav */}
      {mobileNavOpen && (
        <div className="md:hidden fixed top-[69px] left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-b p-4 flex flex-col gap-1.5 shadow-2xl animate-in" style={{ borderColor: "#F1F5F9" }}>
          {navItems.map((it) => (
            <NavItem key={it.key} icon={it.icon} label={it.label} active={page === it.key} onClick={() => goApp(it.key)} />
          ))}
          <div className="pt-2 mt-2 border-t border-slate-100">
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-body text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut size={18} /> Sign out
            </button>
          </div>
        </div>
      )}

      {/* Main Content Viewport */}
      <main className="flex-1 px-6 md:px-12 py-10 md:py-12 pt-24 md:pt-12 pb-32 md:pb-12 max-w-5xl mx-auto overflow-y-auto">
        {page === "dashboard" && (
          <Dashboard
            name={user?.name || "there"}
            heart={heart}
            recovery={recovery}
            challenge={todaysChallenge}
            onComplete={() => todaysChallenge && toggleChallenge(todaysChallenge)}
            quote={quote}
            journalCount={journal.length}
          />
        )}
        {page === "heart" && <HeartStatusPage heart={heart} recovery={recovery} onSave={saveHeartStatus} />}
        {page === "mood" && (
          <MoodPage
            moods={moods}
            selectedMood={selectedMood}
            setSelectedMood={setSelectedMood}
            moodNote={moodNote}
            setMoodNote={setMoodNote}
            onSave={saveMood}
          />
        )}
        {page === "journal" && (
          <JournalPage
            journal={journal}
            draft={journalDraft}
            setDraft={setJournalDraft}
            onSave={saveJournal}
            onEdit={editJournal}
            onDelete={deleteJournal}
            editingId={editingId}
            cancelEdit={() => {
              setEditingId(null);
              setJournalDraft({ title: "", content: "" });
            }}
          />
        )}
        {page === "challenges" && <ChallengesPage challenges={challenges} onToggle={toggleChallenge} />}
        {page === "progress" && (
          <ProgressPage recovery={recovery} moods={moods} completedChallenges={completedChallenges} totalChallenges={challenges.length} journalCount={journal.length} />
        )}
        {page === "profile" && (
          <ProfilePage name={user?.name} email={user?.email} heart={heart} recovery={recovery} journalCount={journal.length} completedChallenges={completedChallenges} />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/90 backdrop-blur-xl border-t flex justify-around items-center px-2 py-2.5 shadow-lg" style={{ borderColor: "#F1F5F9" }}>
        {navItems.slice(0, 5).map((it) => {
          const isActive = page === it.key;
          return (
            <button
              key={it.key}
              onClick={() => goApp(it.key)}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${
                isActive ? "text-violet-600 bg-violet-50" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <it.icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
              <span className="text-[10px] font-bold tracking-tight">
                {it.label.split(" ")[0]}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

/* ==================================================================
   PUBLIC NAV + LANDING & AUTH VIEWS
================================================================== */
function PublicNav({ setPage, apiBase, showApiSettings, setShowApiSettings, setApiBase }) {
  return (
    <header className="max-w-6xl mx-auto px-6 py-6 sticky top-0 z-40 bg-slate-50/80 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => setPage("home")}>
          <div className="p-2 rounded-2xl bg-gradient-to-tr from-violet-600 to-pink-500 shadow-md shadow-violet-500/20 text-white transition-transform group-hover:scale-105">
            <Heart size={18} fill="#fff" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight bg-gradient-to-r from-violet-700 to-pink-600 bg-clip-text text-transparent">
            HeartReset
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowApiSettings((v) => !v)}
            title="API Settings"
            className="p-2.5 rounded-2xl bg-white border border-slate-200/80 hover:bg-slate-100 text-slate-600 transition-all shadow-xs"
          >
            <Settings size={18} />
          </button>
          <Button variant="ghost" onClick={() => setPage("login")} size="sm">Log in</Button>
          <Button onClick={() => setPage("register")} size="sm">Get Started</Button>
        </div>
      </div>
      {showApiSettings && (
        <div className="mt-4 rounded-2xl border p-4 flex items-center gap-3 animate-in bg-white shadow-xl" style={{ borderColor: "#E2E8F0" }}>
          <Settings size={18} className="text-violet-600 shrink-0" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 shrink-0">API URL</span>
          <input
            value={apiBase}
            onChange={(e) => setApiBase(e.target.value)}
            className="flex-1 text-sm rounded-xl border bg-slate-50 px-3.5 py-2 outline-none font-medium focus:bg-white focus:ring-2 focus:ring-violet-500/20"
            style={{ borderColor: "#E2E8F0" }}
            placeholder="http://localhost:5000/api"
          />
        </div>
      )}
    </header>
  );
}

function HomePage({ onStart, onLogin }) {
  const features = [
    { icon: Smile, title: "Daily Mood Tracking", desc: "A gentle check-in tool. Categorize your heavy moments and watch your emotional trends transform." },
    { icon: BookOpen, title: "Uncensored Journaling", desc: "Write out what you can't say aloud. A safe, encrypted vault for your thoughts and letters." },
    { icon: Target, title: "Guided Recovery Quests", desc: "Actionable daily micro-challenges designed to pull you forward gently, one step at a time." },
    { icon: TrendingUp, title: "Visual Healing Metrics", desc: "Watch your interactive heart icon repair itself dynamically as you invest in your personal growth." },
  ];

  return (
    <main className="max-w-6xl mx-auto overflow-hidden">
      {/* Hero Section */}
      <section className="grid lg:grid-cols-12 gap-12 items-center py-16 md:py-24">
        <div className="lg:col-span-7 animate-in text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-100/70 border border-violet-200 text-violet-700 text-xs font-bold tracking-wide uppercase mb-6">
            <Sparkles size={14} /> Your private healing sanctuary
          </div>
          <h1 className="font-display text-4xl sm:text-6xl font-extrabold leading-[1.08] tracking-tight text-slate-900">
            Heal gracefully. <br />
            <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
              Evolve powerfully.
            </span>
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-slate-600 max-w-xl font-normal">
            A private digital sanctuary built to sit with what you feel, name your emotions honestly, and take deliberate daily steps toward your strongest self.
          </p>
          <div className="flex flex-wrap gap-4 mt-8">
            <Button onClick={onStart} className="gap-2 text-base px-8 py-4">
              Begin Your Journey <ArrowRight size={18} />
            </Button>
            <Button variant="ghost" onClick={onLogin} className="px-6 py-4">
              I already have an account
            </Button>
          </div>
          <div className="flex items-center gap-6 mt-10 pt-8 border-t border-slate-200/80 text-xs font-semibold text-slate-500">
            <div className="flex items-center gap-2"><ShieldCheck size={16} className="text-emerald-500" /> 100% Private & Secure</div>
            <div className="flex items-center gap-2"><Lock size={16} className="text-violet-500" /> End-to-end local data</div>
          </div>
        </div>

        {/* Hero Visual Card */}
        <div className="lg:col-span-5 flex justify-center animate-in">
          <div className="relative w-full max-w-md rounded-3xl p-10 bg-white border shadow-2xl shadow-violet-500/10 flex flex-col items-center text-center" style={{ borderColor: "#F1F5F9" }}>
            <div className="absolute top-4 right-4 p-2 rounded-xl bg-pink-50 text-pink-500">
              <Flame size={18} />
            </div>
            <div className="my-6">
              <HealingHeart percent={72} size={180} />
            </div>
            <div className="w-full mt-4">
              <div className="flex justify-between items-center mb-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <span>Recovery Status</span>
                <span className="text-violet-600 font-extrabold">72% Restored</span>
              </div>
              <ProgressBar value={72} />
            </div>
            <p className="text-xs font-medium text-slate-400 mt-6">"Your heart may be broken, but your future isn't."</p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 border-t border-slate-200/70">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Eyebrow icon={Zap}>Designed for deep emotional renewal</Eyebrow>
          <h2 className="font-display text-3xl font-bold tracking-tight mt-2 text-slate-900">
            Everything you need to rebuild with confidence
          </h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {features.map((f, i) => (
            <Card key={i} className="flex gap-5 items-start">
              <div className="rounded-2xl p-3.5 shrink-0 bg-gradient-to-tr from-violet-50 to-pink-50 text-violet-600 border border-violet-100/60 shadow-xs">
                <f.icon size={22} />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-slate-900">{f.title}</h3>
                <p className="text-sm mt-2 text-slate-600 leading-relaxed">{f.desc}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer Banner */}
      <section className="py-20 my-10 rounded-3xl bg-gradient-to-r from-violet-900 via-purple-900 to-slate-900 text-white text-center px-6 relative overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,51,102,0.25),transparent_50%)]" />
        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight">
            Take the first step toward inner peace today.
          </h2>
          <p className="text-slate-300 mt-4 text-sm md:text-base leading-relaxed">
            Join thousands who use HeartReset to process heartbreak, find emotional clarity, and step into their power.
          </p>
          <div className="mt-8">
            <Button onClick={onStart} className="mx-auto px-8 py-4 text-base">
              Start Your Free Sanctuary Now <ArrowRight size={18} />
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}

function AuthPage({ mode, onSwitch, onSubmit }) {
  const isLogin = mode === "login";
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [submitting, setSubmitting] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await onSubmit(form);
    setSubmitting(false);
  };

  return (
    <main className="max-w-md mx-auto px-6 py-16 animate-in">
      <div className="text-center mb-8">
        <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-violet-600 to-pink-500 text-white shadow-lg shadow-violet-500/20 mb-4">
          <Heart size={24} fill="#fff" />
        </div>
        <h1 className="font-display text-3xl font-extrabold text-slate-900 tracking-tight">
          {isLogin ? "Welcome back" : "Create your sanctuary"}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {isLogin ? "Access your secure recovery dashboard" : "Begin your healing journey with complete privacy"}
        </p>
      </div>

      <Card className="shadow-xl shadow-slate-200/50">
        <form onSubmit={handleSubmit}>
          {!isLogin && <Input label="Full Name" placeholder="Your name" value={form.name} onChange={set("name")} />}
          <Input label="Email Address" type="email" placeholder="you@example.com" value={form.email} onChange={set("email")} />
          <Input label="Password" type="password" placeholder="••••••••" value={form.password} onChange={set("password")} />
          {!isLogin && <Input label="Confirm Password" type="password" placeholder="••••••••" value={form.confirmPassword} onChange={set("confirmPassword")} />}
          
          <Button type="submit" className="w-full mt-4 py-4 text-base" disabled={submitting}>
            {submitting && <Loader2 size={18} className="animate-spin-slow" />}
            {isLogin ? "Sign In to Sanctuary" : "Create Account"}
          </Button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6 pt-6 border-t border-slate-100">
          {isLogin ? "New to HeartReset?" : "Already have an account?"}{" "}
          <button onClick={onSwitch} className="font-bold text-violet-600 hover:underline">
            {isLogin ? "Create account" : "Log in"}
          </button>
        </p>
      </Card>
      
      <p className="text-xs text-center text-slate-400 mt-6">
        By continuing, you agree to our <a href="#" className="underline hover:text-violet-600">Terms of Service</a> and <a href="#" className="underline hover:text-violet-600">Privacy Policy</a>.
      </p>
    </main>
  );
}

/* ==================================================================
   DASHBOARD VIEW
================================================================== */
function Dashboard({ name, heart, recovery, challenge, onComplete, quote, journalCount }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const daysFocused = heart?.startedAt ? Math.max(0, Math.round((Date.now() - new Date(heart.startedAt)) / 86400000)) : 0;

  return (
    <div className="animate-in space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-violet-900 via-purple-900 to-slate-900 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-[radial-gradient(circle_at_center,rgba(255,51,102,0.2),transparent_70%)] pointer-events-none" />
        <div className="relative z-10">
          <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-pink-300 text-xs font-bold uppercase tracking-wider mb-2 backdrop-blur-md">
            {greeting} 👋
          </span>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight">
            Welcome back, {name}.
          </h1>
          <p className="text-slate-300 text-sm md:text-base mt-2 italic max-w-xl">
            "{quote}"
          </p>
        </div>
        <div className="relative z-10 flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 shrink-0">
          <HealingHeart percent={recovery} size={70} />
          <div>
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-300">Overall Healing</span>
            <span className="font-display text-2xl font-extrabold text-white">{recovery}%</span>
          </div>
        </div>
      </div>

      {/* Stats & Core Status Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 flex flex-col items-center text-center justify-between">
          <div>
            <Eyebrow>Sanctuary State</Eyebrow>
            <h3 className="font-display text-xl font-bold text-slate-900 mt-1">{heart?.status || "Healing"}</h3>
          </div>
          <div className="my-4">
            <HealingHeart percent={recovery} size={130} />
          </div>
          <p className="text-xs text-slate-500 line-clamp-2 px-2 bg-slate-50 py-2.5 rounded-xl w-full border border-slate-100 font-medium">
            {heart?.reason || "No catalyst reason logged yet."}
          </p>
        </Card>

        <Card className="md:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <Eyebrow>Recovery Progress</Eyebrow>
              <span className="font-display text-2xl font-extrabold text-violet-600">{recovery}%</span>
            </div>
            <div className="mt-3"><ProgressBar value={recovery} /></div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-slate-100">
            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100">
              <div className="flex items-center gap-2 text-violet-600 mb-1">
                <Sparkles size={18} />
                <span className="font-display text-2xl font-extrabold text-slate-900">{daysFocused}</span>
              </div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Days Focused on You</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100">
              <div className="flex items-center gap-2 text-pink-500 mb-1">
                <Flame size={18} />
                <span className="font-display text-2xl font-extrabold text-slate-900">{journalCount}</span>
              </div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Journal Vault Entries</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Daily Challenge Card */}
      {challenge && (
        <Card className="bg-gradient-to-br from-violet-50/60 via-pink-50/30 to-white border-violet-100/60">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-violet-700 font-bold text-xs uppercase tracking-wider mb-1">
                <Target size={16} /> Today's Micro-Challenge
              </div>
              <p className="font-display text-xl font-bold text-slate-900 mt-1">{challenge.title}</p>
              <p className="text-xs text-slate-500 mt-1">Complete this deliberate action to strengthen your recovery momentum today.</p>
            </div>
            <Button
              variant={challenge.completed ? "ghost" : "primary"}
              onClick={onComplete}
              className="shrink-0"
            >
              {challenge.completed ? <><Check size={16} className="text-emerald-600" /> Completed Today</> : "Mark Challenge Complete"}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

/* ==================================================================
   HEART STATUS VIEW
================================================================== */
function HeartStatusPage({ heart, recovery, onSave }) {
  const [reasonDraft, setReasonDraft] = useState(heart?.reason || "");
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);

  const breakHeart = async () => {
    setSaving(true);
    const ok = await onSave(reasonDraft);
    setSaving(false);
    if (ok) setShowConfirm(true);
  };

  return (
    <div className="animate-in space-y-8">
      <div>
        <Eyebrow>Heart Status & Catalyst</Eyebrow>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-900 mt-1">Your Healing Heart</h1>
      </div>

      <Card className="flex flex-col md:flex-row gap-8 items-center">
        <HealingHeart percent={recovery} size={140} />
        <div className="flex-1 w-full space-y-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Status</span>
            <div className="flex items-center gap-3 mt-1">
              <span className={`font-display text-2xl font-extrabold ${heart?.status === "BROKEN" ? "text-pink-600" : "text-violet-600"}`}>
                {heart?.status || "BROKEN"}
              </span>
              {heart?.status !== "BROKEN" && <span className="text-2xl">❤️‍🩹</span>}
            </div>
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Catalyst Reason</span>
            <p className="text-sm font-medium text-slate-700 mt-1 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              {heart?.reason || "No reason logged."}
            </p>
          </div>
          <div className="text-xs text-slate-400 font-medium">
            Recovery journey started on {heart?.startedAt ? fmtLongDate(heart.startedAt) : "—"}
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="font-display text-xl font-bold text-slate-900 mb-2">Log or Update Your Heart Status</h3>
        <p className="text-sm text-slate-500 mb-6">Honesty is the catalyst for healing. Document what happened or reset your focus.</p>
        
        <label className="block mb-6">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block">Catalyst / Note</span>
          <textarea
            className="w-full font-body text-sm rounded-2xl border bg-slate-50 p-4 outline-none focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 transition-all"
            style={{ borderColor: "#E2E8F0" }}
            rows={4}
            placeholder="What happened? Write your honest thoughts here..."
            value={reasonDraft}
            onChange={(e) => setReasonDraft(e.target.value)}
          />
        </label>

        <Button onClick={breakHeart} disabled={saving}>
          {saving && <Loader2 size={16} className="animate-spin-slow" />}
          Update Heart Status & Protocols
        </Button>

        {showConfirm && (
          <div className="mt-6 rounded-2xl p-5 bg-emerald-50 border border-emerald-200 text-emerald-900 animate-in">
            <p className="font-bold text-sm flex items-center gap-2 text-emerald-800">
              <Check size={18} /> Sanctuary Protocols Updated Successfully
            </p>
            <ul className="mt-3 space-y-2 text-xs font-semibold text-emerald-700 grid sm:grid-cols-2">
              <li className="flex items-center gap-1.5">✓ Self-love protocols active</li>
              <li className="flex items-center gap-1.5">✓ No-contact boundaries set</li>
              <li className="flex items-center gap-1.5">✓ Daily challenge engine active</li>
              <li className="flex items-center gap-1.5">✓ Future goal tracking enabled</li>
            </ul>
          </div>
        )}
      </Card>
    </div>
  );
}

/* ==================================================================
   MOOD TRACKER VIEW
================================================================== */
function MoodPage({ moods, selectedMood, setSelectedMood, moodNote, setMoodNote, onSave }) {
  const chartData = moods.map((m) => ({
    day: fmtDay(m.date),
    score: MOOD_OPTIONS.find((o) => o.key === m.mood)?.score || 3,
  }));

  return (
    <div className="animate-in space-y-8">
      <div>
        <Eyebrow>Daily Check-in</Eyebrow>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-900 mt-1">How are you feeling today?</h1>
      </div>

      <Card>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Select your primary emotional state</p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {MOOD_OPTIONS.map((opt) => {
            const isSelected = selectedMood === opt.key;
            return (
              <button
                key={opt.key}
                onClick={() => setSelectedMood(opt.key)}
                className={`flex flex-col items-center gap-2.5 p-4 rounded-2xl border transition-all duration-200 ${
                  isSelected
                    ? "bg-violet-900 text-white border-violet-900 shadow-lg shadow-violet-900/20 scale-[1.02]"
                    : "bg-slate-50/60 border-slate-200/80 hover:bg-slate-100 text-slate-700"
                }`}
              >
                <opt.icon size={26} className={isSelected ? "text-pink-400" : "text-slate-500"} />
                <span className="text-xs font-bold">{opt.label}</span>
              </button>
            );
          })}
        </div>

        <label className="block mt-6 mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block">Optional Reflection Note</span>
          <textarea
            className="w-full font-body text-sm rounded-2xl border bg-slate-50 p-4 outline-none focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 transition-all"
            style={{ borderColor: "#E2E8F0" }}
            rows={3}
            placeholder="I feel a little lighter today because..."
            value={moodNote}
            onChange={(e) => setMoodNote(e.target.value)}
          />
        </label>
        <Button onClick={onSave} disabled={!selectedMood} className="w-full sm:w-auto">
          Save Mood Check-In
        </Button>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-display text-lg font-bold text-slate-900 mb-4">Recent Mood History</h3>
          {moods.length === 0 ? (
            <p className="text-sm text-slate-400 italic">No moods logged yet. Save your first check-in above.</p>
          ) : (
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
              {moods.slice().reverse().map((m) => {
                const opt = MOOD_OPTIONS.find((o) => o.key === m.mood);
                return (
                  <div key={m._id} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-sm">
                    <span className="text-xs font-bold text-slate-400">{fmtDate(m.date)}</span>
                    <span className="flex items-center gap-2 font-bold text-slate-800">
                      {opt && <opt.icon size={16} className="text-violet-600" />} {opt?.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {chartData.length > 1 ? (
          <Card>
            <h3 className="font-display text-lg font-bold text-slate-900 mb-4">Emotional Trend</h3>
            <div style={{ width: "100%", height: 220 }}>
              <ResponsiveContainer>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#7C3AED" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 5]} tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 16, border: "1px solid #E2E8F0", fontSize: 12, boxShadow: "0 10px 25px rgba(0,0,0,0.05)" }} />
                  <Area type="monotone" dataKey="score" stroke="#7C3AED" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        ) : (
          <Card className="flex flex-col items-center justify-center text-center p-8">
            <SparksizePlaceholder className="text-slate-300 mb-2" />
            <p className="text-sm font-bold text-slate-600">Trend chart unlocks soon</p>
            <p className="text-xs text-slate-400 mt-1">Log at least two check-ins to generate your mood trend graph.</p>
          </Card>
        )}
      </div>
    </div>
  );
}

function SparksizePlaceholder() {
  return <Sparkles size={28} className="text-violet-400" />;
}

/* ==================================================================
   JOURNAL VIEW
================================================================== */
function JournalPage({ journal, draft, setDraft, onSave, onEdit, onDelete, editingId, cancelEdit }) {
  return (
    <div className="animate-in space-y-8">
      <div>
        <Eyebrow>Private Vault</Eyebrow>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-900 mt-1">
          {editingId ? "Edit Journal Entry" : "Write Freely"}
        </h1>
      </div>

      <Card>
        <Input label="Entry Title" placeholder="What is on your mind today?" value={draft.title} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} />
        <label className="block mb-6">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">Your Thoughts & Letters</span>
          <textarea
            className="w-full font-body text-sm rounded-2xl border bg-slate-50 p-4 outline-none focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 transition-all"
            style={{ borderColor: "#E2E8F0" }}
            rows={5}
            placeholder="Say the things you cannot say out loud yet. This vault is entirely for you..."
            value={draft.content}
            onChange={(e) => setDraft((d) => ({ ...d, content: e.target.value }))}
          />
        </label>
        <div className="flex items-center gap-3">
          <Button onClick={onSave}>{editingId ? "Update Entry" : "Save to Vault"}</Button>
          {editingId && <Button variant="ghost" onClick={cancelEdit}>Cancel</Button>}
        </div>
      </Card>

      <div>
        <h2 className="font-display text-xl font-bold text-slate-900 mb-4">Journal Archive</h2>
        {journal.length === 0 ? (
          <Card className="text-center py-12">
            <BookOpen size={36} className="mx-auto text-slate-300 mb-3" />
            <p className="text-sm font-bold text-slate-700">Your journal is currently empty</p>
            <p className="text-xs text-slate-400 mt-1">Write your first uncensored entry above to begin archiving your growth.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {journal.map((e) => (
              <Card key={e._id} className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <span className="text-xs font-bold text-violet-600 uppercase tracking-wider">{fmtDate(e.date)}</span>
                  <h3 className="font-display font-bold text-lg text-slate-900">{e.title || "Untitled Entry"}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{e.content}</p>
                </div>
                <div className="flex sm:flex-col gap-2 shrink-0 self-end sm:self-start">
                  <button onClick={() => onEdit(e)} className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors" title="Edit">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => onDelete(e._id)} className="p-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors" title="Delete">
                    <Trash2 size={16} />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ==================================================================
   CHALLENGES VIEW
================================================================== */
function ChallengesPage({ challenges, onToggle }) {
  const done = challenges.filter((c) => c.completed).length;
  const total = challenges.length;
  const progressRatio = total ? Math.round((done / total) * 100) : 0;

  return (
    <div className="animate-in space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Eyebrow>Recovery Challenges</Eyebrow>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-900 mt-1">Daily Action Quests</h1>
        </div>
        <div className="bg-white px-5 py-3 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <Target size={20} className="text-violet-600" />
          <span className="font-display font-extrabold text-lg text-slate-900">{done} / {total} Completed</span>
        </div>
      </div>

      <Card>
        <div className="flex justify-between items-center mb-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
          <span>Completion Progress</span>
          <span className="text-violet-600">{progressRatio}%</span>
        </div>
        <ProgressBar value={progressRatio} />
      </Card>

      <div className="space-y-3">
        {challenges.map((c) => (
          <Card
            key={c._id}
            hoverEffect={false}
            className={`flex items-center justify-between transition-all ${c.completed ? "bg-slate-50/60 opacity-80" : "bg-white"}`}
          >
            <div className="flex items-center gap-4">
              <span
                className={`w-9 h-9 rounded-2xl flex items-center justify-center font-display text-xs font-bold shrink-0 ${
                  c.completed ? "bg-emerald-500 text-white" : "bg-violet-100 text-violet-700"
                }`}
              >
                {c.day}
              </span>
              <p className={`text-sm font-bold ${c.completed ? "line-through text-slate-400" : "text-slate-900"}`}>
                {c.title}
              </p>
            </div>
            <button
              onClick={() => onToggle(c)}
              className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all shrink-0 ${
                c.completed
                  ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                  : "bg-slate-100 text-slate-400 hover:bg-slate-200"
              }`}
            >
              <Check size={18} />
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ==================================================================
   PROGRESS VIEW
================================================================== */
function ProgressPage({ recovery, moods, completedChallenges, totalChallenges, journalCount }) {
  const moodImprovement = moods.length
    ? Math.round((moods.reduce((a, m) => a + (MOOD_OPTIONS.find((o) => o.key === m.mood)?.score || 3), 0) / (moods.length * 5)) * 100)
    : 0;

  return (
    <div className="animate-in space-y-8">
      <div>
        <Eyebrow>Analytics & Growth</Eyebrow>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-900 mt-1">
          You are {recovery}% of the way there
        </h1>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="flex flex-col items-center justify-center text-center p-8">
          <HealingHeart percent={recovery} size={150} />
          <p className="font-display text-3xl font-extrabold text-slate-900 mt-4">{recovery}%</p>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-1">Overall Sanctuary Recovery</p>
        </Card>

        <div className="flex flex-col gap-6 justify-between">
          <Card>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Mood Uplift Index</span>
              <span className="font-display font-extrabold text-violet-600">{moodImprovement}%</span>
            </div>
            <ProgressBar value={moodImprovement} color="#10B981" />
            <p className="text-xs text-slate-400 mt-3">Calculated from your logged emotional check-ins.</p>
          </Card>

          <Card>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Challenge Completion</span>
              <span className="font-display font-extrabold text-pink-500">{completedChallenges} / {totalChallenges}</span>
            </div>
            <ProgressBar value={totalChallenges ? (completedChallenges / totalChallenges) * 100 : 0} />
            <p className="text-xs text-slate-400 mt-3">Micro-quests conquered to rebuild momentum.</p>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card className="text-center py-6">
          <p className="font-display text-3xl font-extrabold text-slate-900">{journalCount}</p>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-1">Journal Vault Entries</p>
        </Card>
        <Card className="text-center py-6">
          <p className="font-display text-3xl font-extrabold text-slate-900">{moods.length}</p>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-1">Mood Check-Ins</p>
        </Card>
      </div>
    </div>
  );
}

/* ==================================================================
   PROFILE VIEW
================================================================== */
function ProfilePage({ name, email, heart, recovery, journalCount, completedChallenges }) {
  const badges = [
    { icon: "🌱", label: "First Step", earned: completedChallenges >= 1 },
    { icon: "🔥", label: "7 Day Streak", earned: true },
    { icon: "📖", label: "Dedicated Writer", earned: journalCount >= 10 },
    { icon: "💪", label: "Resilient Mind", earned: completedChallenges >= 25 },
    { icon: "❤️‍🩹", label: "Healing Progress", earned: recovery >= 75 },
    { icon: "🏆", label: "New Beginning", earned: recovery >= 100 },
  ];
  const daysActive = heart?.startedAt ? Math.max(0, Math.round((Date.now() - new Date(heart.startedAt)) / 86400000)) : 0;

  return (
    <div className="animate-in space-y-8">
      <div>
        <Eyebrow>Account & Achievements</Eyebrow>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-900 mt-1">Sanctuary Profile</h1>
      </div>

      <Card className="flex items-center gap-6">
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center font-display text-2xl font-extrabold text-white shrink-0 bg-gradient-to-tr from-violet-600 to-pink-500 shadow-xl shadow-violet-500/20">
          {name?.charAt(0).toUpperCase()}
        </div>
        <div className="space-y-1">
          <h3 className="font-display font-extrabold text-xl text-slate-900">{name}</h3>
          <p className="text-sm text-slate-500">{email}</p>
          <p className="text-xs font-semibold text-violet-600 mt-1">
            Recovery sanctuary active since {heart?.startedAt ? fmtLongDate(heart.startedAt) : "—"}
          </p>
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-4">
        {[
          { v: daysActive, l: "Days Active" },
          { v: journalCount, l: "Vault Entries" },
          { v: `${recovery}%`, l: "Healing Index" },
        ].map((s, i) => (
          <Card key={i} className="text-center py-6">
            <p className="font-display text-2xl font-extrabold text-slate-900">{s.v}</p>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-1">{s.l}</p>
          </Card>
        ))}
      </div>

      <div>
        <h2 className="font-display text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Sparkles size={20} className="text-pink-500" /> Earned Achievements
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {badges.map((b, i) => (
            <div
              key={i}
              className={`rounded-2xl border p-4 flex flex-col items-center text-center gap-2 transition-all bg-white ${
                b.earned ? "border-violet-200/80 shadow-md shadow-violet-500/5" : "border-slate-100 opacity-40 grayscale"
              }`}
            >
              <span className="text-3xl">{b.icon}</span>
              <span className="text-xs font-bold text-slate-800 leading-tight">{b.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}