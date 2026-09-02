"use client";

import { useState, useEffect } from "react";
import {
  Sword,
  Heart,
  Coins,
  Trophy,
  History,
  Shield,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  AlertCircle,
  LogOut,
  ShoppingBag,
  Sparkles,
  ChevronRight,
  RefreshCw,
  Clock,
  User,
  Coffee,
  X,
  Volume2,
  VolumeX,
  PlusCircle,
  HelpCircle
} from "lucide-react";

// Types for props
interface UserProfile {
  id: number;
  email: string;
  username: string;
  class: string;
  level: number;
  xp: number;
  xpNeeded: number;
  hp: number;
  maxHp: number;
  gold: number;
  avatarConfig: string;
  createdAt: string;
}

interface Task {
  id: number;
  type: string;
  title: string;
  notes: string | null;
  difficulty: string;
  streak: number;
  completedToday: boolean;
  completed: boolean;
}

interface UserItem {
  id: number;
  itemId: string;
  name: string;
  type: string;
  statBoost: number;
  equipped: boolean;
}

interface Boss {
  id: string;
  name: string;
  maxHp: number;
  bossHp?: number;
  rewardGold: number;
  rewardXp: number;
  description: string;
}

interface HistoryLog {
  id: number;
  actionType: string;
  description: string;
  xpChange: number;
  goldChange: number;
  hpChange: number;
  createdAt: string;
}

interface DashboardProps {
  initialUser: UserProfile;
  initialTasks: Task[];
  initialActiveBoss: any;
  initialInventory: UserItem[];
  initialLogs: HistoryLog[];
}

export default function QuestForgeDashboard({
  initialUser,
  initialTasks,
  initialActiveBoss,
  initialInventory,
  initialLogs,
}: DashboardProps) {
  // Global States
  const [user, setUser] = useState<UserProfile>(initialUser);
  const [tasksList, setTasksList] = useState<Task[]>(initialTasks);
  const [activeBoss, setActiveBoss] = useState<any>(initialActiveBoss);
  const [inventory, setInventory] = useState<UserItem[]>(initialInventory);
  const [logs, setLogs] = useState<HistoryLog[]>(initialLogs);

  // UI States
  const [activeTab, setActiveTab] = useState<"tasks" | "shop" | "equipment" | "history">("tasks");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "success" | "danger" | "info" } | null>(null);
  
  // Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isBossModalOpen, setIsBossModalOpen] = useState(false);
  const [isTavernModalOpen, setIsTavernModalOpen] = useState(false);

  // Form states
  const [taskTitle, setTaskTitle] = useState("");
  const [taskType, setTaskType] = useState("habit");
  const [taskDifficulty, setTaskDifficulty] = useState("medium");
  const [taskNotes, setTaskNotes] = useState("");

  // Catalog loaded from server
  const [shopCatalog, setShopCatalog] = useState<any[]>([]);
  const [bossesList, setBossesList] = useState<Boss[]>([]);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Sound effects synthesizer using Web Audio API
  const playSound = (type: "coin" | "hit" | "levelUp" | "faint" | "victory" | "click") => {
    if (!soundEnabled) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      const playTone = (freq: number, typeOsc: OscillatorType, duration: number, delay = 0, decay = true) => {
        setTimeout(() => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = typeOsc;
          osc.frequency.setValueAtTime(freq, ctx.currentTime);
          
          gain.gain.setValueAtTime(0.1, ctx.currentTime);
          if (decay) {
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
          }
          
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + duration);
        }, delay * 1000);
      };

      if (type === "click") {
        playTone(400, "sine", 0.05);
      } else if (type === "coin") {
        playTone(987.77, "sine", 0.08); // B5
        playTone(1318.51, "sine", 0.15, 0.06); // E6
      } else if (type === "hit") {
        playTone(150, "triangle", 0.15);
        playTone(100, "sawtooth", 0.1, 0.03);
      } else if (type === "levelUp") {
        playTone(523.25, "sine", 0.1); // C5
        playTone(659.25, "sine", 0.1, 0.1); // E5
        playTone(783.99, "sine", 0.1, 0.2); // G5
        playTone(1046.50, "sine", 0.3, 0.3); // C6
      } else if (type === "faint") {
        playTone(300, "sawtooth", 0.2);
        playTone(220, "sawtooth", 0.2, 0.15);
        playTone(150, "sawtooth", 0.4, 0.3);
      } else if (type === "victory") {
        playTone(523.25, "sine", 0.08); // C5
        playTone(783.99, "sine", 0.08, 0.08); // G5
        playTone(1046.50, "sine", 0.08, 0.16); // C6
        playTone(1318.51, "sine", 0.4, 0.24); // E6
      }
    } catch (e) {
      console.warn("Audio Context failed:", e);
    }
  };

  // Toast feedback helper
  const triggerToast = (message: string, type: "success" | "danger" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 6000);
  };

  // Load shop catalog & bosses list on mount
  useEffect(() => {
    const fetchCatalogAndBosses = async () => {
      try {
        const shopRes = await fetch("/api/shop");
        const shopData = await shopRes.json();
        if (shopData.shopCatalog) setShopCatalog(shopData.shopCatalog);

        const bossRes = await fetch("/api/boss");
        const bossData = await bossRes.json();
        if (bossData.bossList) setBossesList(bossData.bossList);
      } catch (err) {
        console.error("Failed to load shop/boss catalogs", err);
      }
    };
    fetchCatalogAndBosses();
  }, []);

  // Fetch updated user logs & details
  const refreshUserData = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      }
      
      const taskRes = await fetch("/api/tasks");
      if (taskRes.ok) {
        const taskData = await taskRes.json();
        setTasksList(taskData);
      }

      const bossRes = await fetch("/api/boss");
      if (bossRes.ok) {
        const bossData = await bossRes.json();
        setActiveBoss(bossData.activeBoss);
      }

      const invRes = await fetch("/api/shop");
      if (invRes.ok) {
        const invData = await invRes.json();
        setInventory(invData.inventory);
      }

      const logRes = await fetch("/api/history");
      if (logRes.ok) {
        const logData = await logRes.json();
        setLogs(logData);
      }
    } catch (err) {
      console.error("Failed to refresh user data", err);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    playSound("click");
    if (confirm("Are you sure you want to log out of QuestForge?")) {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        window.location.reload();
      }
    }
  };

  // Create or Update Task
  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    playSound("click");
    setIsActionLoading(true);

    try {
      const isEditing = !!editingTask;
      const url = isEditing ? `/api/tasks/${editingTask!.id}` : "/api/tasks";
      const method = isEditing ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: taskTitle,
          type: taskType,
          difficulty: taskDifficulty,
          notes: taskNotes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save task");
      }

      triggerToast(
        isEditing ? `Task "${taskTitle}" updated!` : `New ${taskType} created!`,
        "success"
      );

      // Clean states & close modal
      setTaskTitle("");
      setTaskNotes("");
      setTaskType("habit");
      setTaskDifficulty("medium");
      setEditingTask(null);
      setIsTaskModalOpen(false);

      // Refresh list
      await refreshUserData();
    } catch (err: any) {
      triggerToast(err.message || "An error occurred", "danger");
    } finally {
      setIsActionLoading(false);
    }
  };

  // Delete Task
  const handleDeleteTask = async (id: number) => {
    playSound("click");
    if (!confirm("Are you sure you want to banish this quest into the void (delete)?")) return;

    try {
      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      if (res.ok) {
        triggerToast("Task permanently deleted!");
        await refreshUserData();
      } else {
        const d = await res.json();
        throw new Error(d.error || "Failed to delete task");
      }
    } catch (err: any) {
      triggerToast(err.message, "danger");
    }
  };

  // Set values to Edit Task
  const openEditTaskModal = (task: Task) => {
    playSound("click");
    setEditingTask(task);
    setTaskTitle(task.title);
    setTaskType(task.type);
    setTaskDifficulty(task.difficulty);
    setTaskNotes(task.notes || "");
    setIsTaskModalOpen(true);
  };

  // Process Task Action (Click + or - on habit, check daily/todo)
  const handleTaskAction = async (id: number, action: "up" | "down") => {
    // Optimistic sound feedback
    if (action === "up") {
      playSound("coin");
    } else {
      playSound("hit");
    }

    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Action failed");
      }

      // Check results
      if (data.feedback) {
        const isFaint = data.feedback.includes("FAINTED");
        const isLevelUp = data.feedback.includes("LEVEL UP");
        const isVictory = data.feedback.includes("Victory");

        if (isFaint) {
          playSound("faint");
          triggerToast(data.feedback, "danger");
        } else if (isLevelUp) {
          playSound("levelUp");
          triggerToast(data.feedback, "success");
        } else if (isVictory) {
          playSound("victory");
          triggerToast(data.feedback, "success");
        } else {
          triggerToast(data.feedback, "success");
        }
      }

      // Update state immediately
      if (data.user) {
        setUser(data.user);
      }
      
      await refreshUserData();
    } catch (err: any) {
      triggerToast(err.message || "Failed to log action", "danger");
    }
  };

  // Buy item from Shop
  const handleBuyItem = async (itemId: string, name: string, price: number, type: string) => {
    playSound("click");
    if (user.gold < price) {
      playSound("hit");
      triggerToast(`You do not have enough Gold! You need ${price} Gold, but only have ${user.gold}.`, "danger");
      return;
    }

    try {
      const res = await fetch("/api/shop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "buy", itemId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed purchase");
      }

      playSound("coin");
      triggerToast(data.feedback || `Successfully bought ${name}!`, "success");
      
      // Update states
      if (data.user) setUser(data.user);
      await refreshUserData();
    } catch (err: any) {
      triggerToast(err.message, "danger");
    }
  };

  // Toggle Equip item
  const handleToggleEquip = async (itemId: string, alreadyEquipped: boolean) => {
    playSound("click");
    const action = alreadyEquipped ? "unequip" : "equip";

    try {
      const res = await fetch("/api/shop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, itemId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Equip action failed");
      }

      playSound("coin");
      triggerToast(data.feedback || `${alreadyEquipped ? "Unequipped" : "Equipped"} item!`, "success");
      await refreshUserData();
    } catch (err: any) {
      triggerToast(err.message, "danger");
    }
  };

  // Challenge a new Boss
  const handleChallengeBoss = async (bossId: string) => {
    playSound("click");
    try {
      const res = await fetch("/api/boss", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bossId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Challenge failed");
      }

      playSound("victory");
      triggerToast(data.feedback || "A new boss approaches!", "info");
      setActiveBoss(data.activeBoss);
      setIsBossModalOpen(false);
      await refreshUserData();
    } catch (err: any) {
      triggerToast(err.message, "danger");
    }
  };

  // End Day / Rest at the Inn
  const handleEndDay = async () => {
    playSound("click");
    setIsTavernModalOpen(false);

    try {
      const res = await fetch("/api/history", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to rest");
      }

      const isFainted = data.feedback.includes("FAINT");
      if (isFainted) {
        playSound("faint");
        triggerToast(data.feedback, "danger");
      } else {
        playSound("levelUp");
        triggerToast(data.feedback, "success");
      }

      if (data.user) {
        setUser(data.user);
      }
      await refreshUserData();
    } catch (err: any) {
      triggerToast(err.message, "danger");
    }
  };

  // Separate tasks into columns
  const habits = tasksList.filter((t) => t.type === "habit");
  const dailies = tasksList.filter((t) => t.type === "daily");
  const todos = tasksList.filter((t) => t.type === "todo");

  // Calculate equipped bonuses
  let totalDmgBonus = 0;
  let totalDefBonus = 0;

  inventory.forEach((item) => {
    if (item.equipped) {
      if (item.type === "weapon") {
        totalDmgBonus += item.statBoost;
      } else if (item.type === "shield" || item.type === "armor") {
        totalDefBonus += item.statBoost;
      }
    }
  });

  // Simple SVG Hero Avatar Generator
  const renderHeroAvatar = () => {
    const config = JSON.parse(user.avatarConfig || "{}");
    const hair = config.hair || "spiky";
    const hairColor = config.hairColor || "brown";
    const skin = config.skin || "fair";
    const outfit = config.outfit || "apprentice";

    let hairColorHex = "#8B4513"; // brown
    if (hairColor === "black") hairColorHex = "#1A1A1A";
    else if (hairColor === "silver") hairColorHex = "#C0C0C0";
    else if (hairColor === "blonde") hairColorHex = "#D4AF37";
    else if (hairColor === "dark") hairColorHex = "#2E1C0C";

    let skinColorHex = "#FFDEC4"; // fair
    if (skin === "tan") skinColorHex = "#D2B48C";
    else if (skin === "brown") skinColorHex = "#8B5A2B";

    let outfitColorHex = "#708090"; // apprentice slate
    if (outfit === "chainmail") outfitColorHex = "#4682B4"; // warrior steel
    else if (outfit === "robes") outfitColorHex = "#4B0082"; // mage purple
    else if (outfit === "leather") outfitColorHex = "#5C4033"; // rogue brown
    else if (outfit === "vestments") outfitColorHex = "#8B8000"; // cleric gold

    // Check if we have active gear equipped
    const activeWeapon = inventory.find((i) => i.equipped && i.type === "weapon");
    const activeShield = inventory.find((i) => i.equipped && (i.type === "shield" || i.type === "armor"));

    return (
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_8px_16px_rgba(0,0,0,0.4)]">
        {/* Background Aura */}
        <circle cx="50" cy="50" r="45" fill="none" stroke="#222" strokeWidth="1" />
        <circle cx="50" cy="50" r="40" fill="rgba(30, 41, 59, 0.4)" />

        {/* Shield (Left hand side from our perspective) */}
        {activeShield && (
          <g transform="translate(15, 45) scale(0.6)">
            <path d="M 0,0 L 20,-10 L 40,0 L 35,30 C 35,45 20,55 20,55 C 20,55 5,45 5,30 Z" fill="#475569" stroke="#94A3B8" strokeWidth="2" />
            <path d="M 7,3 L 20,-5 L 33,3 L 29,27 C 29,38 20,46 20,46 C 20,46 11,38 11,27 Z" fill="#1E293B" />
            <circle cx="20" cy="20" r="4" fill="#E2E8F0" />
          </g>
        )}

        {/* Body Base */}
        <ellipse cx="50" cy="85" rx="25" ry="18" fill={outfitColorHex} stroke="#1A1A1A" strokeWidth="2.5" />
        
        {/* Neck */}
        <rect x="46" y="55" width="8" height="10" fill={skinColorHex} stroke="#1A1A1A" strokeWidth="2" />

        {/* Head */}
        <circle cx="50" cy="46" r="16" fill={skinColorHex} stroke="#1A1A1A" strokeWidth="2.5" />

        {/* Eyes */}
        <circle cx="44" cy="44" r="2" fill="#111" />
        <circle cx="56" cy="44" r="2" fill="#111" />
        
        {/* Cute blushing cheeks */}
        <ellipse cx="40" cy="49" rx="2" ry="1" fill="#FF8080" opacity="0.6" />
        <ellipse cx="60" cy="49" rx="2" ry="1" fill="#FF8080" opacity="0.6" />

        {/* Smiling Mouth */}
        <path d="M 46 50 Q 50 54 54 50" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" />

        {/* Hair Styles */}
        {hair === "spiky" && (
          <path d="M 32 40 L 40 22 L 46 28 L 50 18 L 56 26 L 62 20 L 68 38 L 60 30 L 50 32 L 40 30 Z" fill={hairColorHex} stroke="#1A1A1A" strokeWidth="2" />
        )}
        {hair === "buzzcut" && (
          <path d="M 33 42 A 16 16 0 0 1 67 42 Z" fill={hairColorHex} stroke="#1A1A1A" strokeWidth="1.5" />
        )}
        {hair === "long" && (
          <g>
            <path d="M 33 46 L 31 68 L 37 68 L 35 46 Z" fill={hairColorHex} stroke="#1A1A1A" strokeWidth="1.5" />
            <path d="M 67 46 L 69 68 L 63 68 L 65 46 Z" fill={hairColorHex} stroke="#1A1A1A" strokeWidth="1.5" />
            <path d="M 33 42 A 16 16 0 0 1 67 42 Z" fill={hairColorHex} stroke="#1A1A1A" strokeWidth="1.5" />
          </g>
        )}
        {hair === "hooded" && (
          <path d="M 31 46 C 31 22, 69 22, 69 46 C 69 56, 62 58, 50 58 C 38 58, 31 56, 31 46 Z" fill="#1E293B" stroke="#000" strokeWidth="2" />
        )}
        {hair === "neat" && (
          <path d="M 33 42 C 33 30, 67 30, 67 42 C 60 36, 40 36, 33 42 Z" fill={hairColorHex} stroke="#1A1A1A" strokeWidth="2" />
        )}

        {/* Weapon (Right hand side from our perspective) */}
        {activeWeapon && (
          <g transform="translate(68, 30) rotate(15) scale(0.7)">
            {/* Sword Blade */}
            <path d="M 10,-35 L 14,-42 L 18,-35 L 15,20 L 13,20 Z" fill="#E2E8F0" stroke="#475569" strokeWidth="2" />
            {/* Sword Crossguard */}
            <rect x="5" y="18" width="18" height="5" rx="1.5" fill="#B45309" stroke="#1A1A1A" strokeWidth="1.5" />
            {/* Sword Hilt */}
            <rect x="11" y="23" width="6" height="15" rx="1" fill="#78350F" stroke="#1A1A1A" strokeWidth="1.5" />
            {/* Sword Pommel */}
            <circle cx="14" cy="40" r="3.5" fill="#D97706" stroke="#1A1A1A" strokeWidth="1.5" />
          </g>
        )}
      </svg>
    );
  };

  return (
    <div className="relative min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black text-slate-100 font-sans select-none pb-16">
      
      {/* Dynamic Sound Toggle & Navigation Header */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 px-4 md:px-8 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500 rounded-lg text-slate-950 font-black flex items-center justify-center">
            <Sword className="w-5 h-5 fill-slate-950 text-slate-950" />
          </div>
          <div>
            <h1 className="text-xl font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400">
              QuestForge
            </h1>
            <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">PostgreSQL Campaign</p>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {/* Rest at Inn Alert Panel */}
          <button
            onClick={() => { playSound("click"); setIsTavernModalOpen(true); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-950/50 hover:bg-indigo-900/60 border border-indigo-500/30 text-xs font-bold text-indigo-300 transition duration-150 shadow-sm"
          >
            <Coffee className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400 animate-bounce" />
            <span>Rest at Inn</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 transition"
            title={soundEnabled ? "Disable synth sound effects" : "Enable synth sound effects"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-500" /> : <VolumeX className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-950/40 hover:bg-red-950/80 border border-red-500/20 hover:border-red-500/40 text-xs font-bold text-red-400 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Campaign Canvas */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-6">

        {/* Toast Notification Banner */}
        {toast && (
          <div
            className={`fixed bottom-5 right-5 z-50 p-4 rounded-xl shadow-2xl flex items-center gap-3 border max-w-md animate-bounce ${
              toast.type === "danger"
                ? "bg-red-950 border-red-500/50 text-red-200"
                : toast.type === "info"
                ? "bg-indigo-950 border-indigo-500/50 text-indigo-200"
                : "bg-emerald-950 border-emerald-500/50 text-emerald-200"
            }`}
          >
            <AlertCircle className={`w-5 h-5 shrink-0 ${toast.type === "danger" ? "text-red-400" : toast.type === "info" ? "text-indigo-400" : "text-emerald-400"}`} />
            <div>
              <p className="text-xs font-bold leading-relaxed">{toast.message}</p>
            </div>
            <button onClick={() => setToast(null)} className="ml-auto text-slate-400 hover:text-slate-200 shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* SECTION 1: Character Stats Board & Boss Battle Map */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* COLUMN 1A: Character Profile Card */}
          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row lg:flex-col gap-5 items-center relative overflow-hidden shadow-lg">
            {/* Glowing Aura depending on Class */}
            <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-15 ${
              user.class === "Warrior" ? "bg-blue-500" : user.class === "Mage" ? "bg-purple-500" : user.class === "Rogue" ? "bg-emerald-500" : "bg-amber-500"
            }`} />

            {/* Avatar Window */}
            <div className="w-28 h-28 md:w-36 md:h-36 shrink-0 bg-slate-950 border-2 border-slate-800 rounded-2xl p-1 relative group">
              {renderHeroAvatar()}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 bg-slate-950 border border-slate-800 rounded-full text-[9px] font-bold tracking-widest text-amber-500 uppercase">
                {user.class}
              </div>
            </div>

            {/* Stats list */}
            <div className="flex-1 w-full space-y-4">
              <div className="text-center md:text-left lg:text-center">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">LEVEL {user.level} HERO</span>
                <h2 className="text-2xl font-black text-slate-100 tracking-wide truncate">{user.username}</h2>
              </div>

              {/* Progress Gauges */}
              <div className="space-y-3">
                
                {/* Health (HP) Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-red-400 flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5 fill-red-500 text-red-500" /> HEALTH
                    </span>
                    <span className="text-slate-300">{user.hp} / {user.maxHp} HP</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="bg-gradient-to-r from-red-600 to-red-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.max(0, Math.min(100, (user.hp / user.maxHp) * 100))}%` }}
                    />
                  </div>
                </div>

                {/* Experience (XP) Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-amber-400 flex items-center gap-1">
                      <Trophy className="w-3.5 h-3.5 text-amber-400" /> EXPERIENCE
                    </span>
                    <span className="text-slate-300">{user.xp} / {user.xpNeeded} XP</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.max(0, Math.min(100, (user.xp / user.xpNeeded) * 100))}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Secondary Stats Inventory */}
              <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-slate-800/60">
                <div className="bg-slate-950/50 p-2 border border-slate-800/40 rounded-xl">
                  <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest">GOLD</span>
                  <div className="flex items-center justify-center gap-1 text-amber-400 font-black text-sm mt-0.5">
                    <Coins className="w-3.5 h-3.5 text-amber-400 fill-amber-500" />
                    <span>{user.gold}g</span>
                  </div>
                </div>
                <div className="bg-slate-950/50 p-2 border border-slate-800/40 rounded-xl">
                  <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest">ATTACK</span>
                  <span className="block text-slate-200 font-bold text-sm mt-0.5">+{totalDmgBonus} dmg</span>
                </div>
                <div className="bg-slate-950/50 p-2 border border-slate-800/40 rounded-xl">
                  <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest">DEFENSE</span>
                  <span className="block text-slate-200 font-bold text-sm mt-0.5">-{totalDefBonus} dmg</span>
                </div>
              </div>

            </div>
          </div>

          {/* COLUMN 1B & 1C: Active Boss Battle Map */}
          <div className="lg:col-span-2 bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800 rounded-2xl p-5 relative overflow-hidden shadow-lg flex flex-col justify-between">
            {/* Background pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,_transparent_1px),_linear-gradient(90deg,_rgba(255,255,255,0.02)_1px,_transparent_1px)] bg-[size:16px_16px] opacity-20 pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row gap-5 items-center">
              
              {/* Boss Icon / Artwork */}
              <div className="w-24 h-24 md:w-28 md:h-28 shrink-0 bg-red-950/30 border-2 border-red-900/50 rounded-2xl p-1 flex items-center justify-center relative animate-pulse shadow-md">
                {activeBoss ? (
                  <span className="text-5xl">
                    {activeBoss.bossId === "snail_of_sloth" && "🐌"}
                    {activeBoss.bossId === "distraction_demon" && "😈"}
                    {activeBoss.bossId === "binge_basilisk" && "🐍"}
                    {activeBoss.bossId === "procrastination_dragon" && "🐉"}
                  </span>
                ) : (
                  <HelpCircle className="w-12 h-12 text-slate-600" />
                )}
                <div className="absolute -top-2 right-2 px-1.5 py-0.5 bg-red-600 text-slate-100 rounded text-[8px] font-bold uppercase">
                  BOSS QUEST
                </div>
              </div>

              {/* Boss Description */}
              <div className="flex-1 text-center md:text-left space-y-2">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold uppercase tracking-widest text-red-400">ACTIVE CAMPAIGN TARGET</span>
                  <h3 className="text-2xl font-black text-slate-100 tracking-wide">
                    {activeBoss ? activeBoss.bossName : "No Active Target"}
                  </h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed max-w-lg">
                  {activeBoss 
                    ? bossesList.find(b => b.id === activeBoss.bossId)?.description || "Complete tasks to defeat this dungeon beast."
                    : "No monster is currently challenging you. Click below to select a quest boss from the local guild board!"
                  }
                </p>

                {activeBoss && (
                  <div className="flex items-center justify-center md:justify-start gap-4 text-xs font-bold text-slate-400 mt-2">
                    <span className="flex items-center gap-1 text-amber-400">
                      <Coins className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> +{activeBoss.rewardGold}g Loot
                    </span>
                    <span className="flex items-center gap-1 text-purple-400">
                      <Trophy className="w-3.5 h-3.5" /> +{activeBoss.rewardXp} XP Reward
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Boss HP Bar Gauge */}
            {activeBoss && (
              <div className="relative z-10 mt-5 space-y-1.5 bg-slate-950/40 p-4 border border-slate-800/50 rounded-xl">
                <div className="flex justify-between items-center text-xs font-bold text-red-200">
                  <span className="flex items-center gap-1">⚔️ BOSS HP GAUGE</span>
                  <span>{activeBoss.bossHp} / {activeBoss.bossMaxHp} HP</span>
                </div>
                <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800/80">
                  <div
                    className="bg-gradient-to-r from-red-600 via-orange-500 to-red-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.max(0, Math.min(100, (activeBoss.bossHp / activeBoss.bossMaxHp) * 100))}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-500 italic text-center mt-1">
                  Each completed task strikes the boss! Missed Dailies or bad habits heal them or damage you.
                </p>
              </div>
            )}

            {/* Change Quest Boss Target Button */}
            <div className="relative z-10 mt-4 pt-4 border-t border-slate-800/50 flex justify-end">
              <button
                onClick={() => { playSound("click"); setIsBossModalOpen(true); }}
                className="px-4 py-2 bg-slate-950 border border-slate-800 hover:bg-slate-900 rounded-xl text-xs font-bold text-amber-400 hover:text-amber-300 transition duration-150 flex items-center gap-1.5"
              >
                <Sword className="w-3.5 h-3.5" />
                <span>Challenge Different Boss</span>
              </button>
            </div>

          </div>
        </div>

        {/* SECTION 2: Navigation Tabs */}
        <div className="flex border-b border-slate-800/80 p-1 bg-slate-950/40 rounded-2xl gap-1">
          <button
            onClick={() => { playSound("click"); setActiveTab("tasks"); }}
            className={`flex-1 py-3 text-center rounded-xl font-bold text-xs md:text-sm tracking-wide transition duration-150 flex items-center justify-center gap-2 ${
              activeTab === "tasks"
                ? "bg-slate-900 border border-slate-800 text-amber-400"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Task Boards</span>
          </button>
          <button
            onClick={() => { playSound("click"); setActiveTab("shop"); }}
            className={`flex-1 py-3 text-center rounded-xl font-bold text-xs md:text-sm tracking-wide transition duration-150 flex items-center justify-center gap-2 ${
              activeTab === "shop"
                ? "bg-slate-900 border border-slate-800 text-amber-400"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Mercenary Shop</span>
          </button>
          <button
            onClick={() => { playSound("click"); setActiveTab("equipment"); }}
            className={`flex-1 py-3 text-center rounded-xl font-bold text-xs md:text-sm tracking-wide transition duration-150 flex items-center justify-center gap-2 ${
              activeTab === "equipment"
                ? "bg-slate-900 border border-slate-800 text-amber-400"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Character Gear ({inventory.filter(i => i.equipped).length})</span>
          </button>
          <button
            onClick={() => { playSound("click"); setActiveTab("history"); }}
            className={`flex-1 py-3 text-center rounded-xl font-bold text-xs md:text-sm tracking-wide transition duration-150 flex items-center justify-center gap-2 ${
              activeTab === "history"
                ? "bg-slate-900 border border-slate-800 text-amber-400"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <History className="w-4 h-4" />
            <span>Chronicles Journal</span>
          </button>
        </div>

        {/* SECTION 3: Tab Content Panel */}
        <div className="min-h-[400px]">
          
          {/* TAB 1: Tasks Column Boards */}
          {activeTab === "tasks" && (
            <div className="space-y-6">
              
              {/* Task Header Add Actions */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/40 p-4 border border-slate-800 rounded-2xl">
                <div>
                  <h3 className="font-bold text-sm tracking-wide text-slate-200">ACTIVE CAMPAIGN MISSIONS</h3>
                  <p className="text-xs text-slate-400">Complete tasks side-by-side. Gain XP and strike the boss.</p>
                </div>
                <button
                  onClick={() => {
                    playSound("click");
                    setEditingTask(null);
                    setTaskTitle("");
                    setTaskNotes("");
                    setTaskType("habit");
                    setTaskDifficulty("medium");
                    setIsTaskModalOpen(true);
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md hover:from-amber-400 hover:to-amber-500 transition duration-150"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Create New Quest Task</span>
                </button>
              </div>

              {/* THREE COLUMNS (Habits, Dailies, To-Dos) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* COLUMN 1: HABITS */}
                <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-4 space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <h4 className="font-black text-sm text-slate-200 uppercase tracking-wider">Habits</h4>
                    </div>
                    <span className="text-[10px] bg-blue-950 text-blue-300 font-bold px-2 py-0.5 rounded-full">
                      {habits.length} Active
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed italic">
                    Tasks that repeat frequently. Click (+) to receive rewards or (-) if you fail.
                  </p>

                  <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                    {habits.length === 0 ? (
                      <div className="text-center py-10 border border-dashed border-slate-800 rounded-xl bg-slate-950/20">
                        <PlusCircle className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                        <p className="text-xs text-slate-500 font-medium">No habits recorded.</p>
                        <p className="text-[10px] text-slate-600 mt-1">Add habits like \"Drink Water\" or \"Check Emails\".</p>
                      </div>
                    ) : (
                      habits.map((task) => (
                        <div key={task.id} className="bg-slate-950/80 border border-slate-850 p-3.5 rounded-xl flex items-center justify-between gap-3 group hover:border-slate-700 transition">
                          
                          {/* Habit Minus Button (Left side) */}
                          <button
                            onClick={() => handleTaskAction(task.id, "down")}
                            className="p-1.5 rounded-lg bg-red-950/50 hover:bg-red-900/60 border border-red-500/20 text-red-400 font-black text-xs shrink-0 transition"
                            title="Log Negative Habit hit"
                          >
                            ➖
                          </button>

                          {/* Task details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-slate-200 truncate leading-snug">{task.title}</span>
                              <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${
                                task.difficulty === "easy" ? "bg-emerald-950 text-emerald-400" :
                                task.difficulty === "medium" ? "bg-amber-950 text-amber-400" :
                                "bg-red-950 text-red-400"
                              }`}>
                                {task.difficulty}
                              </span>
                            </div>
                            {task.notes && <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{task.notes}</p>}
                            <p className="text-[9px] text-slate-400 font-bold mt-1">🔥 Streak: {task.streak} uses</p>
                          </div>

                          {/* Action controls (Edit, Delete, Up) */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => openEditTaskModal(task)}
                              className="p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-900 rounded-lg transition"
                              title="Edit task"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="p-1.5 text-slate-600 hover:text-red-400 hover:bg-slate-900 rounded-lg transition"
                              title="Delete task"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            
                            {/* Habit Plus Button */}
                            <button
                              onClick={() => handleTaskAction(task.id, "up")}
                              className="p-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/30 text-emerald-300 font-black text-xs transition"
                              title="Log Positive Habit hit"
                            >
                              ➕
                            </button>
                          </div>

                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* COLUMN 2: DAILIES */}
                <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-4 space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-purple-500" />
                      <h4 className="font-black text-sm text-slate-200 uppercase tracking-wider">Dailies</h4>
                    </div>
                    <span className="text-[10px] bg-purple-950 text-purple-300 font-bold px-2 py-0.5 rounded-full">
                      {dailies.length} Active
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed italic">
                    Must complete once a day. Uncompleted dailies hit your health overnight!
                  </p>

                  <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                    {dailies.length === 0 ? (
                      <div className="text-center py-10 border border-dashed border-slate-800 rounded-xl bg-slate-950/20">
                        <PlusCircle className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                        <p className="text-xs text-slate-500 font-medium">No daily quests recorded.</p>
                        <p className="text-[10px] text-slate-600 mt-1">Add dailies like \"Workout\" or \"Code for 1 Hour\".</p>
                      </div>
                    ) : (
                      dailies.map((task) => (
                        <div key={task.id} className={`p-3.5 rounded-xl flex items-center justify-between gap-3 group border transition ${
                          task.completedToday 
                            ? "bg-slate-950/30 border-slate-900 opacity-60" 
                            : "bg-slate-950 border-slate-850 hover:border-slate-700"
                        }`}>
                          
                          {/* Checkbox */}
                          <button
                            onClick={() => !task.completedToday && handleTaskAction(task.id, "up")}
                            disabled={task.completedToday}
                            className={`w-5.5 h-5.5 rounded-md border flex items-center justify-center shrink-0 transition ${
                              task.completedToday 
                                ? "bg-amber-500/20 border-amber-500/50 text-amber-400" 
                                : "border-slate-700 hover:border-amber-500 bg-slate-950"
                            }`}
                          >
                            {task.completedToday && "✓"}
                          </button>

                          {/* Task details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`font-bold text-sm truncate leading-snug ${task.completedToday ? "text-slate-500 line-through" : "text-slate-200"}`}>{task.title}</span>
                              <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${
                                task.difficulty === "easy" ? "bg-emerald-950 text-emerald-400" :
                                task.difficulty === "medium" ? "bg-amber-950 text-amber-400" :
                                "bg-red-950 text-red-400"
                              }`}>
                                {task.difficulty}
                              </span>
                            </div>
                            {task.notes && <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{task.notes}</p>}
                            <p className="text-[9px] text-slate-400 font-bold mt-1">🔥 Streak: {task.streak} days</p>
                          </div>

                          {/* Action controls */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => openEditTaskModal(task)}
                              className="p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-900 rounded-lg transition"
                              title="Edit task"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="p-1.5 text-slate-600 hover:text-red-400 hover:bg-slate-900 rounded-lg transition"
                              title="Delete task"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* COLUMN 3: TO-DOS */}
                <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-4 space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <h4 className="font-black text-sm text-slate-200 uppercase tracking-wider">To-Dos</h4>
                    </div>
                    <span className="text-[10px] bg-emerald-950 text-emerald-300 font-bold px-2 py-0.5 rounded-full">
                      {todos.length} Active
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed italic">
                    One-time responsibilities. Checking them off yields massive Gold and damage to Bosses.
                  </p>

                  <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                    {todos.length === 0 ? (
                      <div className="text-center py-10 border border-dashed border-slate-800 rounded-xl bg-slate-950/20">
                        <PlusCircle className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                        <p className="text-xs text-slate-500 font-medium">No pending to-dos recorded.</p>
                        <p className="text-[10px] text-slate-600 mt-1">Add tasks like \"Fix Sink\" or \"Submit Report\".</p>
                      </div>
                    ) : (
                      todos.map((task) => (
                        <div key={task.id} className={`p-3.5 rounded-xl flex items-center justify-between gap-3 group border transition ${
                          task.completed 
                            ? "bg-slate-950/30 border-slate-900 opacity-60" 
                            : "bg-slate-950 border-slate-850 hover:border-slate-700"
                        }`}>
                          
                          {/* Checkbox */}
                          <button
                            onClick={() => !task.completed && handleTaskAction(task.id, "up")}
                            disabled={task.completed}
                            className={`w-5.5 h-5.5 rounded-md border flex items-center justify-center shrink-0 transition ${
                              task.completed 
                                ? "bg-amber-500/20 border-amber-500/50 text-amber-400" 
                                : "border-slate-700 hover:border-amber-500 bg-slate-950"
                            }`}
                          >
                            {task.completed && "✓"}
                          </button>

                          {/* Task details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`font-bold text-sm truncate leading-snug ${task.completed ? "text-slate-500 line-through" : "text-slate-200"}`}>{task.title}</span>
                              <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${
                                task.difficulty === "easy" ? "bg-emerald-950 text-emerald-400" :
                                task.difficulty === "medium" ? "bg-amber-950 text-amber-400" :
                                "bg-red-950 text-red-400"
                              }`}>
                                {task.difficulty}
                              </span>
                            </div>
                            {task.notes && <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{task.notes}</p>}
                          </div>

                          {/* Action controls */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => openEditTaskModal(task)}
                              className="p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-900 rounded-lg transition"
                              title="Edit task"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="p-1.5 text-slate-600 hover:text-red-400 hover:bg-slate-900 rounded-lg transition"
                              title="Delete task"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: MERCENARY SHOP */}
          {activeTab === "shop" && (
            <div className="space-y-6">
              <div className="bg-slate-900/40 p-4 border border-slate-800 rounded-2xl flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-sm tracking-wide text-slate-200">LOCAL BLACKSMITH & MERCENARY TAVERN</h3>
                  <p className="text-xs text-slate-400">Spend your hard earned Gold coin here to purchase permanent gear or instant healing potions.</p>
                </div>
                <div className="bg-slate-950 border border-slate-800 px-4 py-2 rounded-xl flex items-center gap-1.5 text-amber-400 font-bold text-sm shrink-0">
                  <Coins className="w-4 h-4 fill-amber-500 text-amber-500" />
                  <span>Wallet: {user.gold}g</span>
                </div>
              </div>

              {/* Shop Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {shopCatalog.map((item) => {
                  const alreadyOwns = inventory.some((own) => own.itemId === item.id);
                  const isPotion = item.type === "potion";
                  const cannotAfford = user.gold < item.price;
                  
                  return (
                    <div key={item.id} className="bg-slate-950/80 border border-slate-850 p-5 rounded-2xl flex flex-col justify-between hover:border-slate-800 transition shadow-sm relative group">
                      
                      {/* Price Badge */}
                      <span className="absolute top-4 right-4 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-full text-xs font-black text-amber-400 flex items-center gap-1">
                        <Coins className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        {item.price}g
                      </span>

                      {/* Icon & Details */}
                      <div>
                        <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-2xl mb-4">
                          {item.type === "potion" && "🧪"}
                          {item.type === "weapon" && "⚔️"}
                          {item.type === "shield" && "🛡️"}
                          {item.type === "armor" && "🦺"}
                        </div>
                        <h4 className="font-bold text-base text-slate-100">{item.name}</h4>
                        <span className="inline-block text-[9px] font-black uppercase tracking-wider text-slate-400 mt-1">
                          Type: {item.type} {item.type === "weapon" ? `(+${item.statBoost} Boss Dmg)` : `(-${item.statBoost} Penalty Dmg)`}
                        </span>
                        <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">{item.description}</p>
                      </div>

                      {/* Action buttons */}
                      <div className="mt-5 pt-4 border-t border-slate-850 flex items-center justify-between">
                        {isPotion ? (
                          <button
                            onClick={() => handleBuyItem(item.id, item.name, item.price, item.type)}
                            disabled={cannotAfford}
                            className="w-full py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 disabled:opacity-45 disabled:pointer-events-none text-slate-950 font-black rounded-xl text-xs transition duration-150 flex items-center justify-center gap-1"
                          >
                            <span>Drink Potion (-{item.price}g)</span>
                          </button>
                        ) : alreadyOwns ? (
                          <span className="w-full py-2 bg-slate-900 text-slate-500 text-center font-bold rounded-xl text-xs border border-slate-850">
                            Already Owned ✔
                          </span>
                        ) : (
                          <button
                            onClick={() => handleBuyItem(item.id, item.name, item.price, item.type)}
                            disabled={cannotAfford}
                            className="w-full py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-45 disabled:pointer-events-none text-slate-950 font-black rounded-xl text-xs transition duration-150 flex items-center justify-center gap-1"
                          >
                            <span>Buy Gear (-{item.price}g)</span>
                          </button>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: CHARACTER GEAR */}
          {activeTab === "equipment" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Profile Gear Stats Overview */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-4">
                <h4 className="font-bold text-sm tracking-wide text-slate-200 uppercase border-b border-slate-800 pb-2">EQUIPPED STATS EFFECT</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center bg-slate-900/40 p-3 rounded-xl border border-slate-850">
                    <span className="text-xs font-bold text-slate-400 flex items-center gap-1">⚔️ Physical Attack</span>
                    <span className="text-sm font-black text-slate-100">+{totalDmgBonus} bonus damage</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-900/40 p-3 rounded-xl border border-slate-850">
                    <span className="text-xs font-bold text-slate-400 flex items-center gap-1">🛡️ Habit Penalty Shielding</span>
                    <span className="text-sm font-black text-slate-100">-{totalDefBonus} damage blocked</span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed italic">
                  You can equip ONE weapon, ONE armor, and ONE shield at the same time. Equipping an item of the same category will safely return your previous gear to the bag.
                </p>
              </div>

              {/* Inventory Gear List */}
              <div className="lg:col-span-2 bg-slate-900/30 border border-slate-800 rounded-2xl p-5 space-y-4">
                <h4 className="font-bold text-sm tracking-wide text-slate-200 uppercase border-b border-slate-850 pb-2">YOUR ARMORY SACK ({inventory.length} items owned)</h4>

                {inventory.length === 0 ? (
                  <div className="text-center py-16 border border-dashed border-slate-800 rounded-2xl">
                    <ShoppingBag className="w-10 h-10 text-slate-700 mx-auto mb-2" />
                    <p className="text-xs text-slate-400 font-bold">Your inventory bag is empty!</p>
                    <p className="text-[10px] text-slate-500 mt-1">Visit the Mercenary Shop to buy armor and epic weapons.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {inventory.map((item) => (
                      <div key={item.id} className={`p-4 rounded-xl border flex justify-between items-center gap-3 transition ${
                        item.equipped 
                          ? "bg-amber-950/20 border-amber-500/40 shadow-[0_4px_12px_rgba(217,119,6,0.08)]" 
                          : "bg-slate-950 border-slate-850"
                      }`}>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-center text-xl shrink-0">
                            {item.type === "weapon" ? "⚔️" : "🛡️"}
                          </div>
                          <div>
                            <span className="block font-bold text-sm text-slate-200">{item.name}</span>
                            <span className="block text-[9px] font-black uppercase text-amber-500 mt-0.5">
                              {item.type} • {item.type === "weapon" ? `+${item.statBoost} Boss Damage` : `-${item.statBoost} Habit Hit`}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleToggleEquip(item.itemId, item.equipped)}
                          className={`px-3 py-1.5 rounded-lg font-bold text-xs shrink-0 transition ${
                            item.equipped
                              ? "bg-red-950/50 hover:bg-red-900 border border-red-500/30 text-red-300"
                              : "bg-amber-500 hover:bg-amber-400 text-slate-950"
                          }`}
                        >
                          {item.equipped ? "Unequip" : "Equip"}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 4: CHRONICLES JOURNAL */}
          {activeTab === "history" && (
            <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                <div>
                  <h4 className="font-bold text-sm tracking-wide text-slate-200 uppercase">THE SCROLL OF CHRONICLES</h4>
                  <p className="text-xs text-slate-400">Read a complete record of your character's deeds and encounters.</p>
                </div>
                <button
                  onClick={refreshUserData}
                  className="p-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 rounded-lg text-xs font-bold transition flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Sync Record</span>
                </button>
              </div>

              <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                {logs.length === 0 ? (
                  <div className="text-center py-16">
                    <Clock className="w-10 h-10 text-slate-700 mx-auto mb-2" />
                    <p className="text-xs text-slate-400 font-bold">Your journal is clean.</p>
                    <p className="text-[10px] text-slate-500 mt-1">Begin completing missions to fill out your history scroll.</p>
                  </div>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} className="bg-slate-950/60 p-3 rounded-xl border border-slate-850/60 flex flex-col sm:flex-row justify-between sm:items-center gap-2 text-xs">
                      
                      {/* Description & Action Type */}
                      <div className="flex items-start gap-2.5">
                        <span className="text-lg mt-0.5 shrink-0">
                          {log.actionType === "character_creation" && "🧙"}
                          {log.actionType === "task_completed" && "🏅"}
                          {log.actionType === "level_up" && "🎉"}
                          {log.actionType === "boss_defeat" && "🏆"}
                          {log.actionType === "damage_taken" && "💥"}
                          {log.actionType === "fainted" && "💀"}
                          {log.actionType === "purchase" && "💰"}
                          {log.actionType === "equip" && "🛡️"}
                          {log.actionType === "perfect_day" && "🌟"}
                        </span>
                        <div>
                          <p className="text-slate-200 font-medium leading-relaxed">{log.description}</p>
                          <span className="text-[10px] text-slate-500 block mt-1">
                            {new Date(log.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Stat Gains Indicators */}
                      <div className="flex flex-wrap items-center gap-2 font-bold text-[10px] sm:shrink-0">
                        {log.xpChange !== 0 && (
                          <span className={`px-2 py-0.5 rounded ${log.xpChange > 0 ? "bg-purple-950 text-purple-300" : "bg-purple-950/20 text-purple-500"}`}>
                            {log.xpChange > 0 ? `+${log.xpChange}` : log.xpChange} XP
                          </span>
                        )}
                        {log.goldChange !== 0 && (
                          <span className={`px-2 py-0.5 rounded ${log.goldChange > 0 ? "bg-amber-950 text-amber-300" : "bg-slate-900 text-slate-400"}`}>
                            {log.goldChange > 0 ? `+${log.goldChange}` : log.goldChange} Gold
                          </span>
                        )}
                        {log.hpChange !== 0 && (
                          <span className={`px-2 py-0.5 rounded ${log.hpChange > 0 ? "bg-red-950 text-emerald-300" : "bg-red-950/50 text-red-400"}`}>
                            {log.hpChange > 0 ? `+${log.hpChange}` : log.hpChange} HP
                          </span>
                        )}
                      </div>

                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* FOOTER CREDITS */}
      <footer className="text-center text-slate-600 text-xs py-8 border-t border-slate-800/40">
        <p>© 2026 QuestForge RPG. Secure Standard Authentication & Local PostgreSQL database.</p>
        <p className="mt-1 text-[10px] text-slate-700 uppercase tracking-widest font-black">All progress saved in PostgreSQL real-time.</p>
      </footer>

      {/* MODAL 1: CREATE OR EDIT TASK MODAL */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadein">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative">
            <button
              onClick={() => { playSound("click"); setIsTaskModalOpen(false); }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black uppercase text-amber-400 tracking-wide mb-4">
              {editingTask ? "⚙️ Edit Campaign Mission" : "📜 Proclaim New Mission"}
            </h3>

            <form onSubmit={handleSaveTask} className="space-y-4">
              {/* Task Title */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mission Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wash dirty dungeon dishes"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 text-slate-100 placeholder:text-slate-600"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                />
              </div>

              {/* Task Type (Only for new) */}
              {!editingTask && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quest Category</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["habit", "daily", "todo"].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setTaskType(type)}
                        className={`py-2 text-center rounded-lg text-xs font-bold border transition ${
                          taskType === type
                            ? "bg-slate-850 border-amber-500 text-amber-400"
                            : "bg-slate-950 border-slate-800 text-slate-400"
                        }`}
                      >
                        {type === "habit" && "🔥 Habit"}
                        {type === "daily" && "📅 Daily"}
                        {type === "todo" && "✓ To-Do"}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Difficulty */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quest Difficulty</label>
                <div className="grid grid-cols-3 gap-2">
                  {["easy", "medium", "hard"].map((diff) => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => setTaskDifficulty(diff)}
                      className={`py-2 text-center rounded-lg text-xs font-bold border transition ${
                        taskDifficulty === diff
                          ? "bg-slate-850 border-amber-500 text-amber-400"
                          : "bg-slate-950 border-slate-800 text-slate-400"
                      }`}
                    >
                      {diff === "easy" && "🟢 Easy"}
                      {diff === "medium" && "🟡 Medium"}
                      {diff === "hard" && "🔴 Hard"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mission Notes / Instructions (Optional)</label>
                <textarea
                  placeholder="Provide scroll notes or descriptions of this task."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 text-slate-100 placeholder:text-slate-600 h-20 resize-none"
                  value={taskNotes}
                  onChange={(e) => setTaskNotes(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={isActionLoading}
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold rounded-xl text-sm hover:from-amber-400 hover:to-amber-500 transition active:scale-95 shadow-md flex items-center justify-center gap-1.5"
              >
                {isActionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 stroke-[3]" />}
                <span>{editingTask ? "Update Mission" : "Inscribe on Bulletin Board"}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: SWITCH BOSS MODAL */}
      {isBossModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadein">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative">
            <button
              onClick={() => { playSound("click"); setIsBossModalOpen(false); }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black uppercase text-red-400 tracking-wide mb-4">
              ⚔️ CHALLENGE A GUILD BOSS MONSTER
            </h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Choosing a new boss targets them with your completed tasks. Warning: Challenging a new boss will count your current target as failed/abandoned!
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-1">
              {bossesList.map((boss) => {
                const isActive = activeBoss?.bossId === boss.id;
                return (
                  <div
                    key={boss.id}
                    className={`p-4 rounded-xl border flex flex-col justify-between transition ${
                      isActive 
                        ? "bg-red-950/20 border-red-500/50 shadow-md" 
                        : "bg-slate-950 border-slate-850 hover:border-slate-800"
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-sm text-slate-100">{boss.name}</h4>
                        <span className="text-xs bg-red-950 border border-red-500/20 px-2 py-0.5 rounded text-red-400 font-bold">
                          {boss.maxHp} HP
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed min-h-[50px]">{boss.description}</p>
                      
                      <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500 mt-2">
                        <span className="text-amber-500">+{boss.rewardGold}g Gold</span>
                        <span className="text-purple-400">+{boss.rewardXp} XP</span>
                      </div>
                    </div>

                    <button
                      onClick={() => !isActive && handleChallengeBoss(boss.id)}
                      disabled={isActive}
                      className={`w-full py-2 mt-4 rounded-lg font-bold text-xs transition ${
                        isActive
                          ? "bg-red-950 text-red-400 border border-red-900/50 pointer-events-none"
                          : "bg-red-600 text-slate-100 hover:bg-red-500 active:scale-95"
                      }`}
                    >
                      {isActive ? "Currently Engaged ⚔️" : "Challenge Monster"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: TAVERN SLEEP (END DAY) MODAL */}
      {isTavernModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadein">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative text-center">
            <button
              onClick={() => { playSound("click"); setIsTavernModalOpen(false); }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 bg-indigo-950/80 border-2 border-indigo-500/50 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 animate-bounce">
              🛌
            </div>

            <h3 className="text-lg font-black uppercase text-indigo-400 tracking-wide mb-2">
              REST AT THE TAVERN INN
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Are you ready to retire for the night and process your Daily campaign quests?
            </p>

            <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 mb-5 text-left text-xs space-y-2">
              <p className="text-slate-400 font-bold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                Overnight Rules of accountability:
              </p>
              <ul className="list-disc pl-5 text-slate-400 space-y-1.5 font-medium leading-relaxed">
                <li>Any uncompleted <span className="text-purple-400 font-bold">Dailies</span> will strike your character overnight.</li>
                <li>Your defenses (class & shields/armor) will mitigate this hit.</li>
                <li>All daily checkmarks will safely reset for tomorrow!</li>
                <li>If you completed all dailies, you get a <span className="text-amber-400 font-bold">Perfect Day bonus</span> (+5g & +10 XP)!</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { playSound("click"); setIsTavernModalOpen(false); }}
                className="flex-1 py-3 bg-slate-950 border border-slate-800 hover:bg-slate-900 text-slate-400 rounded-xl font-bold text-xs transition"
              >
                Go Back to Work
              </button>
              <button
                onClick={handleEndDay}
                className="flex-1 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-slate-100 rounded-xl font-bold text-xs shadow-md active:scale-95 transition"
              >
                Sleep & Process Day
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
