"use client";

import { useState } from "react";
import { Sword, Flame, ShieldAlert, Sparkles, Heart, Coins, ShieldCheck, Mail, Lock, User, RefreshCw } from "lucide-react";

export default function AuthPortal() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [characterClass, setCharacterClass] = useState("Warrior");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const classes = [
    {
      name: "Warrior",
      hp: 65,
      gold: 20,
      color: "border-slate-500 bg-slate-950/80 text-slate-200",
      activeColor: "ring-2 ring-blue-500 border-blue-500 bg-slate-900",
      perk: "High Fortitude",
      description: "Passive: Starts with +15 Max HP and takes 20% less damage from missed tasks.",
      icon: ShieldCheck,
      textColor: "text-blue-400",
    },
    {
      name: "Mage",
      hp: 40,
      gold: 30,
      color: "border-purple-500 bg-purple-950/80 text-purple-200",
      activeColor: "ring-2 ring-purple-500 border-purple-400 bg-purple-950",
      perk: "Gold Alchemist",
      description: "Passive: Starts with extra Gold and earns +30% Gold from completed tasks.",
      icon: Sparkles,
      textColor: "text-purple-400",
    },
    {
      name: "Rogue",
      hp: 45,
      gold: 20,
      color: "border-emerald-500 bg-emerald-950/80 text-emerald-200",
      activeColor: "ring-2 ring-emerald-500 border-emerald-400 bg-emerald-950",
      perk: "Lucky Strike",
      description: "Passive: 15% critical hit chance to double XP and Gold rewards on tasks.",
      icon: Flame,
      textColor: "text-emerald-400",
    },
    {
      name: "Cleric",
      hp: 50,
      gold: 20,
      color: "border-amber-500 bg-amber-950/80 text-amber-200",
      activeColor: "ring-2 ring-amber-500 border-amber-400 bg-amber-950",
      perk: "Divine Restoration",
      description: "Passive: Restores +50% more health when drinking any shop potions.",
      icon: Heart,
      textColor: "text-amber-400",
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const payload = isLogin
      ? { email, password }
      : { email, username, password, characterClass };

    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/signup";

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "An error occurred");
      }

      // Success! Reload page to activate SSR and render dashboard
      window.location.reload();
    } catch (err: any) {
      setError(err.message || "Failed to authenticate. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black text-slate-100 flex flex-col justify-center items-center px-4 py-12 select-none overflow-x-hidden">
      {/* Decorative stars and glows */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-4xl bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 md:p-10 shadow-[0_30px_100px_rgba(0,0,0,0.8)] relative z-10 transition-all duration-300">
        
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3.5 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl shadow-lg shadow-amber-500/20 mb-4 animate-pulse">
            <Sword className="w-8 h-8 text-slate-950 stroke-[2.5]" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 uppercase font-sans">
            QuestForge
          </h1>
          <p className="text-slate-400 mt-2 font-medium max-w-md mx-auto text-sm md:text-base">
            Gamify your life, conquer procrastination, and level up your productivity RPG-style!
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-950/50 border border-red-500/30 text-red-200 rounded-xl flex items-start gap-3 animate-headshake">
            <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">Action Failed</p>
              <p className="text-xs text-red-300 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Interactive Auth Switcher */}
        <div className="flex border-b border-slate-800/80 mb-8 p-1 bg-slate-950/40 rounded-xl gap-1">
          <button
            type="button"
            className={`flex-1 py-3 text-center rounded-lg font-bold text-sm transition-all duration-200 ${
              isLogin
                ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/10"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/30"
            }`}
            onClick={() => {
              setIsLogin(true);
              setError("");
            }}
          >
            Sign In to Save Progress
          </button>
          <button
            type="button"
            className={`flex-1 py-3 text-center rounded-lg font-bold text-sm transition-all duration-200 ${
              !isLogin
                ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/10"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/30"
            }`}
            onClick={() => {
              setIsLogin(false);
              setError("");
            }}
          >
            Create New Character
          </button>
        </div>

        {/* Registration/Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Input Column */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. hero@questforge.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 text-slate-100 placeholder:text-slate-600 transition"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {!isLogin && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" /> Hero Name / Username
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SirTaskALot"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 text-slate-100 placeholder:text-slate-600 transition"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" /> Secret Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 text-slate-100 placeholder:text-slate-600 transition"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {isLogin && (
                <div className="pt-2">
                  <p className="text-xs text-slate-500 italic leading-relaxed">
                    By signing in, your progress will be fetched directly from the PostgreSQL database, letting you resume your streak and fight current bosses from any device.
                  </p>
                </div>
              )}
            </div>

            {/* RPG Class Selection Column (Only for sign-up) */}
            <div className="space-y-3 flex flex-col justify-between">
              {isLogin ? (
                <div className="bg-slate-950/50 border border-slate-800/80 rounded-2xl p-5 h-full flex flex-col justify-center items-center text-center">
                  <Sword className="w-12 h-12 text-amber-500/40 mb-3" />
                  <h3 className="font-bold text-slate-300">Ready to Venture Forth?</h3>
                  <p className="text-xs text-slate-500 mt-2 max-w-xs">
                    Sign in with standard email and password. Your high scores, items equipped, and pending tasks are safe in our server vaults.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    Choose Your Character Class
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {classes.map((c) => {
                      const IconComponent = c.icon;
                      const isSelected = characterClass === c.name;
                      return (
                        <button
                          key={c.name}
                          type="button"
                          className={`p-3 rounded-xl border text-left transition duration-200 relative group flex flex-col justify-between h-[105px] overflow-hidden ${
                            isSelected ? c.activeColor : "border-slate-800/80 bg-slate-950/40 hover:bg-slate-950/80 text-slate-400"
                          }`}
                          onClick={() => setCharacterClass(c.name)}
                        >
                          <div className="flex justify-between items-center w-full">
                            <span className="font-bold text-sm text-slate-200">{c.name}</span>
                            <IconComponent className={`w-4.5 h-4.5 ${isSelected ? c.textColor : "text-slate-600"}`} />
                          </div>
                          <div className="z-10 mt-1">
                            <p className="text-[10px] text-slate-500 font-bold tracking-tight">{c.perk}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] text-red-400 font-bold flex items-center gap-0.5">
                                <Heart className="w-2.5 h-2.5 fill-red-500 text-red-500" /> {c.hp} HP
                              </span>
                              <span className="text-[10px] text-amber-400 font-bold flex items-center gap-0.5">
                                <Coins className="w-2.5 h-2.5 fill-amber-500 text-amber-500" /> {c.gold} Gold
                              </span>
                            </div>
                          </div>
                          {/* Inner soft glow */}
                          {isSelected && (
                            <span className="absolute bottom-0 right-0 w-12 h-12 bg-amber-500/10 rounded-full blur-md pointer-events-none" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                  
                  {/* Selected Class Description Panel */}
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 mt-2 min-h-[55px] flex items-center">
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {classes.find((c) => c.name === characterClass)?.description}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Trigger Button */}
          <div className="pt-4 border-t border-slate-800/50 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <p className="text-xs text-slate-500 text-center sm:text-left">
              {isLogin
                ? "Don't have a character yet? Click \"Create New Character\" above!"
                : "Already registered? Switch to the login tab to resume your quest."}
            </p>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 rounded-xl font-bold tracking-wide hover:from-amber-400 hover:to-amber-500 focus:outline-none focus:ring-4 focus:ring-amber-500/20 active:scale-95 transition-all shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  {isLogin ? "Signing In..." : "Creating Character..."}
                </>
              ) : (
                <>
                  <Sword className="w-5 h-5 fill-slate-950 text-slate-950" />
                  {isLogin ? "Enter the Arena" : "Begin Your Adventure"}
                </>
              )}
            </button>
          </div>
        </form>

      </div>

      {/* Decorative footer credits */}
      <footer className="mt-8 text-slate-600 text-xs font-semibold tracking-wider uppercase z-10 flex items-center gap-2">
        <span>QuestForge RPG Engine v1.4</span>
        <span>•</span>
        <span>Standard Pass Vault Security</span>
      </footer>
    </main>
  );
}
