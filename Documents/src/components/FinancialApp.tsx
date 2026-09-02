"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp,
  DollarSign,
  PieChart,
  BookOpen,
  Sliders,
  Award,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  RefreshCw,
  Plus,
  Trash2,
  Bookmark,
  ChevronRight,
  Percent,
  Calendar,
  AlertCircle,
  Briefcase,
  Layers,
  ArrowUpRight,
  Sparkles,
  Zap,
  Info,
  Trophy
} from "lucide-react";

// Types for Custom Budget Goals
interface BudgetExpense {
  id: string;
  category: string;
  amount: number;
}

// Types for Saved Compound Interest Scenarios
interface SavedScenario {
  id: string;
  name: string;
  principal: number;
  monthlyContribution: number;
  rate: number;
  years: number;
  finalBalance: number;
  totalInterest: number;
}

// Financial Literacy Lesson Data
const LITERACY_MODULES = [
  {
    id: "compound_interest",
    title: "The Magic of Compound Interest",
    duration: "5 mins",
    icon: TrendingUp,
    badge: "Interest Alchemist",
    color: "from-amber-500 to-orange-500",
    summary: "Understand how compounding interest acts like a snowball, turning small consistent savings into a fortune over time.",
    content: [
      {
        subtitle: "What is Compounding?",
        text: "Compound interest is earning interest on interest. Unlike simple interest, which only pays out on your initial deposit, compound interest continuously adds your earnings back to your principal. Over years, this creates an exponential growth curve."
      },
      {
        subtitle: "The Rule of 72",
        text: "To find out how fast your money will double, divide 72 by your annual interest rate. For example, at an 8% interest rate, your investment will double in roughly 9 years (72 / 8 = 9)!"
      },
      {
        subtitle: "The Cost of Waiting",
        text: "Starting early is more important than investing large amounts later. If you start investing $200/month at age 20, you'll have significantly more by retirement than someone who starts investing $500/month at age 35!"
      }
    ],
    quiz: [
      {
        question: "What is compound interest?",
        options: [
          "Interest calculated strictly on the initial principal only",
          "Interest earned on both the initial principal and the accumulated interest from previous periods",
          "A penalty fee you pay when withdrawing savings early",
          "Interest paid once every decade"
        ],
        answer: 1,
        explanation: "Compound interest computes interest on both your initial deposit and the previous interest earned, creating a powerful compounding effect."
      },
      {
        question: "According to the Rule of 72, how long does it take to double your money at a 6% annual return?",
        options: [
          "6 years",
          "12 years",
          "72 years",
          "18 years"
        ],
        answer: 1,
        explanation: "72 divided by 6 equals 12 years."
      },
      {
        question: "Who benefits the most from the compound interest snowball?",
        options: [
          "Someone who invests large sums very late in life",
          "Someone who waits for interest rates to hit 20%",
          "Someone who starts investing small, consistent amounts early",
          "Someone who moves money to cash daily"
        ],
        answer: 2,
        explanation: "Time is the single most important factor for compound interest. Starting early allows the snowball to roll further."
      }
    ]
  },
  {
    id: "budget_pro",
    title: "Mastering the 50/30/20 Budgeting Rule",
    duration: "6 mins",
    icon: PieChart,
    badge: "Budget Tactician",
    color: "from-emerald-500 to-teal-500",
    summary: "Learn a straightforward, worry-free structural breakdown to divide your income between Needs, Wants, and Savings.",
    content: [
      {
        subtitle: "What is the 50/30/20 Rule?",
        text: "It is a popular and simple budgeting blueprint. You split your after-tax monthly income into three primary baskets: 50% for Needs, 30% for Wants, and 20% for Savings and debt paydown."
      },
      {
        subtitle: "50% Needs (Essential Living)",
        text: "These are mandatory expenses you must pay to survive. Examples include rent/mortgage, utilities, basic groceries, healthcare, insurance, and minimum loan payments."
      },
      {
        subtitle: "30% Wants (Personal Lifestyle)",
        text: "These are non-essential, lifestyle choices. Examples include dining out, subscription services (Netflix, Spotify), hobbies, luxury shopping, and vacation travel."
      },
      {
        subtitle: "20% Savings (Financial Progress)",
        text: "This goes directly towards your future self. It includes building an emergency fund, making retirement contributions, and paying down high-interest debt beyond the minimums."
      }
    ],
    quiz: [
      {
        question: "Under the 50/30/20 rule, how is a subscription to an entertainment streaming service categorized?",
        options: [
          "Needs (50%)",
          "Wants (30%)",
          "Savings (20%)",
          "Investment (10%)"
        ],
        answer: 1,
        explanation: "Streaming subscriptions are enjoyable but non-essential, placing them firmly under the 'Wants' category."
      },
      {
        question: "If your take-home pay is $4,000 per month, how much should go to Savings and High-Interest Debt Paydown?",
        options: [
          "$2,000 per month",
          "$1,200 per month",
          "$800 per month",
          "$400 per month"
        ],
        answer: 2,
        explanation: "20% of $4,000 is $800 ($4,000 * 0.20)."
      }
    ]
  },
  {
    id: "debt_and_inflation",
    title: "Debt Snowball & Inflation Defenses",
    duration: "7 mins",
    icon: BookOpen,
    badge: "Debt Destroyer",
    color: "from-blue-500 to-indigo-500",
    summary: "Differentiate between good vs. bad debt, master the Debt Snowball payoff strategy, and protect your cash from inflation.",
    content: [
      {
        subtitle: "Good Debt vs. Bad Debt",
        text: "Good debt is an investment that grows in value or generates long-term income (e.g., student loans for career growth, reasonable mortgages). Bad debt is high-interest consumer debt used for depreciating assets (e.g., credit cards carrying 20%+ interest on clothes or vacations)."
      },
      {
        subtitle: "The Debt Snowball Strategy",
        text: "List your debts from smallest balance to largest. Pay minimums on all except the smallest. Throw all extra cash at the smallest debt. Once it's gone, roll its payment into the next smallest. This builds psychological momentum!"
      },
      {
        subtitle: "Inflation: The Silent Tax",
        text: "Inflation reduces the purchasing power of your money over time. If inflation is 3% annually, a $100 grocery trip today will cost $103 next year. Keeping all your long-term savings in a zero-interest bank account means you are losing money to inflation."
      }
    ],
    quiz: [
      {
        question: "How does the 'Debt Snowball' strategy rank and target debts?",
        options: [
          "Target highest interest rate first, ignoring the balance size",
          "Target the smallest balance first to build quick mental wins",
          "Only pay debts that are over 10 years old",
          "Pay the largest balance first because it has the most scary total"
        ],
        answer: 1,
        explanation: "The Debt Snowball prioritizes the smallest debt balances first, which builds psychological momentum as you knock out accounts quickly."
      },
      {
        question: "Why is keeping all your long-term wealth in low-interest cash accounts dangerous?",
        options: [
          "The bank might lose your cash entirely",
          "Inflation will silently erode the purchasing power of your money",
          "You will have to pay high wealth luxury taxes daily",
          "Cash accounts are illegal to own for more than 5 years"
        ],
        answer: 1,
        explanation: "Inflation averages 2-3%+ annually. Cash that doesn't yield interest loses buying power over time."
      }
    ]
  },
  {
    id: "investing_101",
    title: "Investing 101 & Asset Allocation",
    duration: "8 mins",
    icon: Sliders,
    badge: "Asset Commander",
    color: "from-purple-500 to-pink-500",
    summary: "De-mystify stocks, bonds, and ETFs. Learn how to allocate your assets to balance risk and compound rewards.",
    content: [
      {
        subtitle: "Stocks vs. Bonds",
        text: "Stocks represent ownership in a company. They offer high potential growth but carry high volatility. Bonds represent a loan to a company or government. They offer steady, lower interest payments with less volatility."
      },
      {
        subtitle: "What is an ETF / Index Fund?",
        text: "An Exchange Traded Fund (ETF) is a basket of hundreds of stocks or bonds. Instead of buying individual stocks like Apple or Tesla, you buy a single share of an ETF (like one tracking the S&P 500) to own a slice of the entire market, instantly diversifying your risk."
      },
      {
        subtitle: "Diversification: The Only Free Lunch",
        text: "Don't put all your eggs in one basket. By holding an balanced mix of international stocks, domestic stocks, real estate, and bonds, you ensure that a downturn in one sector won't wipe out your life savings."
      }
    ],
    quiz: [
      {
        question: "What is an Exchange Traded Fund (ETF) or Index Fund?",
        options: [
          "A lottery ticket issued by the government",
          "An individual stock for an overseas technology company",
          "A basket of many different stocks or bonds that offers instant diversification",
          "A savings account that charges you money to store capital"
        ],
        answer: 2,
        explanation: "ETFs bundle hundreds of securities together, allowing you to diversify your portfolio with a single investment."
      },
      {
        question: "What is the primary benefit of 'Diversification'?",
        options: [
          "It guarantees 50% returns every year",
          "It spreads out risk so that a crash in one stock doesn't ruin your entire portfolio",
          "It lowers your tax rate to exactly zero percent",
          "It allows you to bypass the compound interest equation"
        ],
        answer: 1,
        explanation: "Diversification spreads risk across sectors and assets, providing a smoother investment ride and protecting against single-company failures."
      }
    ]
  }
];

export default function FinancialApp() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<"dashboard" | "simulator" | "literacy">("dashboard");

  // --- PERSISTENT USER STATE via LocalStorage ---
  const [income, setIncome] = useState<number>(5000);
  const [savingGoal, setSavingGoal] = useState<number>(20000);
  const [currentSavings, setCurrentSavings] = useState<number>(4500);
  const [customExpenses, setCustomExpenses] = useState<BudgetExpense[]>([
    { id: "1", category: "Rent / Housing", amount: 1600 },
    { id: "2", category: "Groceries & Utilities", amount: 650 },
    { id: "3", category: "Dining Out & Fun", amount: 500 },
    { id: "4", category: "Transportation", amount: 350 },
    { id: "5", category: "Subscriptions & Clothes", amount: 200 },
  ]);

  // --- COMPOUND SIMULATOR STATE ---
  const [simulatorPrincipal, setSimulatorPrincipal] = useState<number>(5000);
  const [simulatorMonthly, setSimulatorMonthly] = useState<number>(350);
  const [simulatorRate, setSimulatorRate] = useState<number>(7.5);
  const [simulatorYears, setSimulatorYears] = useState<number>(15);
  const [simulatorFrequency, setSimulatorFrequency] = useState<number>(12); // monthly compounding

  // Saved scenarios list
  const [savedScenarios, setSavedScenarios] = useState<SavedScenario[]>([]);
  const [scenarioNameInput, setScenarioNameInput] = useState<string>("");

  // --- LITERACY MODULES STATE ---
  const [activeModuleIndex, setActiveModuleIndex] = useState<number>(0);
  const [quizState, setQuizState] = useState<"read" | "quiz" | "result">("read");
  const [currentQuizQuestionIndex, setCurrentQuizQuestionIndex] = useState<number>(0);
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizAnswersFeedback, setQuizAnswersFeedback] = useState<boolean[]>([]); // true = correct, false = wrong
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>([]);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load state from localStorage on client render
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedIncome = localStorage.getItem("wealth_income");
      const savedGoal = localStorage.getItem("wealth_goal");
      const savedCurrentSavings = localStorage.getItem("wealth_current_savings");
      const savedExp = localStorage.getItem("wealth_expenses");
      const savedScens = localStorage.getItem("wealth_saved_scenarios");
      const savedBadges = localStorage.getItem("wealth_unlocked_badges");

      if (savedIncome) setIncome(parseFloat(savedIncome));
      if (savedGoal) setSavingGoal(parseFloat(savedGoal));
      if (savedCurrentSavings) setCurrentSavings(parseFloat(savedCurrentSavings));
      if (savedExp) setCustomExpenses(JSON.parse(savedExp));
      if (savedScens) setSavedScenarios(JSON.parse(savedScens));
      if (savedBadges) setUnlockedBadges(JSON.parse(savedBadges));
    }
  }, []);

  // Save changes to localStorage helper
  const updatePersistedValue = (key: string, value: any) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value));
    }
  };

  const handleUpdateIncome = (val: number) => {
    setIncome(val);
    updatePersistedValue("wealth_income", val.toString());
  };

  const handleUpdateGoal = (val: number) => {
    setSavingGoal(val);
    updatePersistedValue("wealth_goal", val.toString());
  };

  const handleUpdateCurrentSavings = (val: number) => {
    setCurrentSavings(val);
    updatePersistedValue("wealth_current_savings", val.toString());
  };

  // Toast helper
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // --- BUDGET WIDGET HELPERS ---
  const handleAddExpense = (cat: string, amt: number) => {
    if (!cat.trim() || amt <= 0) return;
    const updated = [...customExpenses, { id: Date.now().toString(), category: cat.trim(), amount: amt }];
    setCustomExpenses(updated);
    updatePersistedValue("wealth_expenses", updated);
    triggerToast(`Added expense category: ${cat}`);
  };

  const handleDeleteExpense = (id: string) => {
    const updated = customExpenses.filter((e) => e.id !== id);
    setCustomExpenses(updated);
    updatePersistedValue("wealth_expenses", updated);
    triggerToast("Expense category removed");
  };

  const totalExpenses = customExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  const remainingMonthlySavingsPotential = Math.max(0, income - totalExpenses);

  // --- COMPOUND INTEREST MATH ---
  // A = P(1 + r/n)^(nt) + PMT * [((1 + r/n)^(nt) - 1) / (r/n)] * (1 + r/n)
  const calculateCompoundInterest = (
    P: number,
    PMT: number,
    annualRatePct: number,
    years: number,
    frequency: number
  ) => {
    const r = annualRatePct / 100;
    const t = years;
    const n = frequency; // e.g. 12 for monthly compounding

    if (r === 0) {
      const totalDeposits = P + PMT * 12 * t;
      return {
        finalBalance: totalDeposits,
        totalDeposits,
        totalInterest: 0,
        yearlyData: Array.from({ length: years + 1 }, (_, i) => ({
          year: i,
          deposits: P + PMT * 12 * i,
          interest: 0,
          total: P + PMT * 12 * i,
        })),
      };
    }

    const nTimesT = n * t;
    const rOverN = r / n;

    // Compound Principal
    const principalCompounded = P * Math.pow(1 + rOverN, nTimesT);

    // Compound Monthly deposits (Annuity)
    // Monthly payments occur, but compounding frequency is n.
    // If n=12 (monthly compounding) and payments are monthly:
    const annuityFactor = (Math.pow(1 + rOverN, nTimesT) - 1) / rOverN;
    // We adjust for monthly payments with monthly compounding:
    // If PMT is monthly, we multiply by the annuity factor.
    const annuityCompounded = PMT * annuityFactor;

    const finalBalance = principalCompounded + annuityCompounded;
    const totalDeposits = P + PMT * 12 * t;
    const totalInterest = Math.max(0, finalBalance - totalDeposits);

    // Generate accurate year-by-year projections for custom SVG charts
    const yearlyData = [];
    for (let y = 0; y <= years; y++) {
      const ny = n * y;
      const prinCompY = P * Math.pow(1 + rOverN, ny);
      const annFactorY = rOverN > 0 ? (Math.pow(1 + rOverN, ny) - 1) / rOverN : 0;
      const annCompY = PMT * annFactorY;
      const totalY = prinCompY + annCompY;
      const depositsY = P + PMT * 12 * y;
      const interestY = Math.max(0, totalY - depositsY);

      yearlyData.push({
        year: y,
        deposits: Math.round(depositsY),
        interest: Math.round(interestY),
        total: Math.round(totalY),
      });
    }

    return {
      finalBalance: Math.round(finalBalance),
      totalDeposits: Math.round(totalDeposits),
      totalInterest: Math.round(totalInterest),
      yearlyData,
    };
  };

  const simResult = calculateCompoundInterest(
    simulatorPrincipal,
    simulatorMonthly,
    simulatorRate,
    simulatorYears,
    simulatorFrequency
  );

  // Scenario management
  const handleSaveScenario = () => {
    const name = scenarioNameInput.trim() || `Plan at ${simulatorRate}% for ${simulatorYears} yrs`;
    const newScen: SavedScenario = {
      id: Date.now().toString(),
      name,
      principal: simulatorPrincipal,
      monthlyContribution: simulatorMonthly,
      rate: simulatorRate,
      years: simulatorYears,
      finalBalance: simResult.finalBalance,
      totalInterest: simResult.totalInterest,
    };

    const updated = [newScen, ...savedScenarios];
    setSavedScenarios(updated);
    updatePersistedValue("wealth_saved_scenarios", updated);
    setScenarioNameInput("");
    triggerToast(`Scenario "${name}" saved to comparison dashboard!`);
  };

  const handleDeleteScenario = (id: string) => {
    const updated = savedScenarios.filter((s) => s.id !== id);
    setSavedScenarios(updated);
    updatePersistedValue("wealth_saved_scenarios", updated);
    triggerToast("Scenario deleted");
  };

  // --- LITERACY MODULES HANDLERS ---
  const currentModule = LITERACY_MODULES[activeModuleIndex];

  const handleStartQuiz = () => {
    setQuizState("quiz");
    setCurrentQuizQuestionIndex(0);
    setSelectedQuizOption(null);
    setQuizScore(0);
    setQuizAnswersFeedback([]);
  };

  const handleSelectOption = (idx: number) => {
    setSelectedQuizOption(idx);
  };

  const handleNextQuizQuestion = () => {
    if (selectedQuizOption === null) return;

    const isCorrect = selectedQuizOption === currentModule.quiz[currentQuizQuestionIndex].answer;
    const newFeedback = [...quizAnswersFeedback, isCorrect];
    setQuizAnswersFeedback(newFeedback);

    const newScore = isCorrect ? quizScore + 1 : quizScore;
    setQuizScore(newScore);

    if (currentQuizQuestionIndex + 1 < currentModule.quiz.length) {
      setCurrentQuizQuestionIndex(currentQuizQuestionIndex + 1);
      setSelectedQuizOption(null);
    } else {
      // Quiz finished! Calculate if badge is unlocked
      setQuizState("result");
      const passed = newScore === currentModule.quiz.length;
      if (passed && !unlockedBadges.includes(currentModule.badge)) {
        const updatedBadges = [...unlockedBadges, currentModule.badge];
        setUnlockedBadges(updatedBadges);
        updatePersistedValue("wealth_unlocked_badges", updatedBadges);
        triggerToast(`🎉 Achievement Unlocked! You earned the "${currentModule.badge}" badge!`);
      }
    }
  };

  // Pre-populate simulation sliders on click for easy reference
  const loadPresetSimulation = (principal: number, monthly: number, rate: number, years: number) => {
    setSimulatorPrincipal(principal);
    setSimulatorMonthly(monthly);
    setSimulatorRate(rate);
    setSimulatorYears(years);
    triggerToast(`Loaded simulation preset! Check the Compound Simulator tab.`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-teal-500 selection:text-slate-950 overflow-x-hidden">
      
      {/* GLOWING AMBIENT BACKGROUNDS */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* TOP NAVIGATION HEADER */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80 px-4 md:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-teal-400 to-emerald-500 rounded-xl text-slate-950 shadow-lg shadow-teal-500/10">
            <TrendingUp className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-widest text-teal-400 uppercase bg-teal-950/60 px-2 py-0.5 rounded border border-teal-500/20">PUBLIC MODE</span>
              <span className="text-[10px] bg-slate-850 px-2 py-0.5 rounded text-slate-400 font-bold border border-slate-800">NO REGISTRATION</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-100 tracking-wide uppercase">
              WealthForge
            </h1>
          </div>
        </div>

        {/* Global Tab Switcher */}
        <div className="flex bg-slate-900/60 border border-slate-800/80 rounded-xl p-1 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg font-bold text-xs md:text-sm tracking-wide transition duration-150 flex items-center justify-center gap-2 ${
              activeTab === "dashboard"
                ? "bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <PieChart className="w-4 h-4" />
            <span>Financial Dashboard</span>
          </button>
          <button
            onClick={() => setActiveTab("simulator")}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg font-bold text-xs md:text-sm tracking-wide transition duration-150 flex items-center justify-center gap-2 ${
              activeTab === "simulator"
                ? "bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Savings Simulator</span>
          </button>
          <button
            onClick={() => setActiveTab("literacy")}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg font-bold text-xs md:text-sm tracking-wide transition duration-150 flex items-center justify-center gap-2 ${
              activeTab === "literacy"
                ? "bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Literacy Modules</span>
          </button>
        </div>
      </header>

      {/* TOAST SYSTEM FEEDBACK */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 p-4 bg-slate-900 border border-teal-500/50 text-teal-200 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce max-w-sm">
          <Sparkles className="w-5 h-5 text-teal-400 shrink-0" />
          <p className="text-xs font-bold leading-relaxed">{toastMessage}</p>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
        
        {/* TOP INTRO BANNER - EXPLAINING PUBLIC COMPLIANCE */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 w-36 h-36 bg-teal-500/5 rounded-full blur-2xl" />
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-teal-400">
                <Zap className="w-4 h-4 text-teal-400 fill-teal-400" />
                <span>INSTANT ACCESS ACTIVE</span>
              </div>
              <h2 className="text-2xl font-black text-slate-100 tracking-wide">Welcome to WealthForge!</h2>
              <p className="text-xs md:text-sm text-slate-400 max-w-2xl leading-relaxed">
                We have completely decommissioned all authentication blocks. Anyone visiting can immediately simulate compound interests, plan complex budgets, and test financial literacy without sign-in barriers! Progress is auto-saved locally.
              </p>
            </div>
            
            {/* Classy Stats Badges Panel */}
            <div className="flex items-center gap-3 bg-slate-950/80 p-3.5 border border-slate-800/80 rounded-2xl shrink-0 w-full md:w-auto justify-around">
              <div className="text-center px-4">
                <span className="block text-[10px] font-bold text-slate-500 uppercase">Badges Earned</span>
                <span className="text-base font-black text-teal-400 flex items-center justify-center gap-1 mt-0.5">
                  <Award className="w-4 h-4" />
                  {unlockedBadges.length} / 4
                </span>
              </div>
              <div className="w-px h-8 bg-slate-800" />
              <div className="text-center px-4">
                <span className="block text-[10px] font-bold text-slate-500 uppercase">Custom Plans</span>
                <span className="text-base font-black text-indigo-400 flex items-center justify-center gap-1 mt-0.5">
                  <Bookmark className="w-4 h-4" />
                  {savedScenarios.length} Scenarios
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* TAB 1: MAIN FINANCIAL DASHBOARD */}
        {/* ============================================================== */}
        {activeTab === "dashboard" && (
          <div className="space-y-8 animate-fadein">
            
            {/* WIDGET ROW 1: PERSONAL PARAMETERS SUMMARY */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Box A: Income Controller */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Monthly Income</span>
                    <h4 className="text-3xl font-black text-slate-100 mt-1">${income.toLocaleString()}</h4>
                  </div>
                  <div className="p-2 bg-teal-950 rounded-xl text-teal-400 border border-teal-500/20">
                    <DollarSign className="w-5 h-5" />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-400">
                    <span>Adjust monthly take-home pay:</span>
                  </div>
                  <input
                    type="range"
                    min="1000"
                    max="20000"
                    step="250"
                    className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-teal-500"
                    value={income}
                    onChange={(e) => handleUpdateIncome(parseInt(e.target.value))}
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                    <span>$1,000</span>
                    <span>$10,000</span>
                    <span>$20,000</span>
                  </div>
                </div>
              </div>

              {/* Box B: Savings Goal Tracker */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Savings Target</span>
                    <h4 className="text-3xl font-black text-slate-100 mt-1">${savingGoal.toLocaleString()}</h4>
                  </div>
                  <div className="p-2 bg-indigo-950 rounded-xl text-indigo-400 border border-indigo-500/20">
                    <Trophy className="w-5 h-5" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-400">
                    <span>Current Nest Egg:</span>
                    <span className="font-bold text-indigo-300">${currentSavings.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100000"
                    step="500"
                    className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    value={currentSavings}
                    onChange={(e) => handleUpdateCurrentSavings(parseInt(e.target.value))}
                  />
                  
                  {/* Dynamic percentage bar */}
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[10px] font-bold text-slate-400">
                      <span>Goal Progress:</span>
                      <span>{Math.round((currentSavings / Math.max(1, savingGoal)) * 100)}%</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="bg-gradient-to-r from-indigo-500 to-teal-400 h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, (currentSavings / Math.max(1, savingGoal)) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/40 flex justify-between items-center text-[10px]">
                  <span className="text-slate-500 font-bold">Goal Target input:</span>
                  <input
                    type="number"
                    className="bg-slate-950 border border-slate-800 rounded px-2 py-0.5 w-24 text-right text-slate-200 font-bold"
                    value={savingGoal}
                    onChange={(e) => handleUpdateGoal(Math.max(1, parseInt(e.target.value) || 0))}
                  />
                </div>
              </div>

              {/* Box C: Net Worth Potentials */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Monthly Cash Savings potential</span>
                      <h4 className="text-3xl font-black text-emerald-400 mt-1">${remainingMonthlySavingsPotential.toLocaleString()}</h4>
                    </div>
                    <div className="p-2 bg-emerald-950 rounded-xl text-emerald-400 border border-emerald-500/20">
                      <ArrowUpRight className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Income minus budget expenditures. If consistently saved at a **7.5% annual return**, this potential builds a massive nest egg!
                  </p>
                </div>
                
                <div className="pt-3 border-t border-slate-800/40 text-xs font-bold flex items-center justify-between text-teal-400">
                  <span>How high does it stack?</span>
                  <button
                    onClick={() => {
                      setSimulatorPrincipal(currentSavings);
                      setSimulatorMonthly(remainingMonthlySavingsPotential);
                      setSimulatorYears(10);
                      setSimulatorRate(8);
                      setActiveTab("simulator");
                      triggerToast("Copied budget parameters to Compound Interest Simulator!");
                    }}
                    className="text-xs hover:underline flex items-center gap-1"
                  >
                    <span>Simulate 10 Years</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>

            {/* INTERACTIVE BUDGET CATEGORY WIDGET & 50/30/20 BLUEPRINT */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Left Panel: Customized Monthly Budget Breakdown */}
              <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-black text-slate-100 tracking-wide">Interactive Budget Category Ledger</h3>
                  <p className="text-xs text-slate-400">Add or remove monthly costs dynamically. Watch the savings calculations synchronize instantly.</p>
                </div>

                {/* List of categories */}
                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                  {customExpenses.map((exp) => {
                    const percentageOfIncome = Math.round((exp.amount / Math.max(1, income)) * 100);
                    return (
                      <div key={exp.id} className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex items-center justify-between gap-4 group hover:border-slate-850 transition">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-200">{exp.category}</span>
                            <span className="text-[10px] text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-full">
                              {percentageOfIncome}% of income
                            </span>
                          </div>
                          <div className="w-full bg-slate-900 h-1 rounded-full mt-2.5">
                            <div className="bg-teal-500 h-full rounded-full" style={{ width: `${Math.min(100, percentageOfIncome)}%` }} />
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-black text-sm text-slate-100">${exp.amount}</span>
                          <button
                            onClick={() => handleDeleteExpense(exp.id)}
                            className="p-1.5 text-slate-600 hover:text-red-400 hover:bg-slate-900 rounded-lg transition"
                            title="Delete category"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Add new Category Form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.currentTarget;
                    const catInput = form.elements.namedItem("categoryName") as HTMLInputElement;
                    const amtInput = form.elements.namedItem("categoryAmount") as HTMLInputElement;
                    const amtVal = parseFloat(amtInput.value);
                    if (catInput.value && amtVal > 0) {
                      handleAddExpense(catInput.value, amtVal);
                      catInput.value = "";
                      amtInput.value = "";
                    }
                  }}
                  className="pt-4 border-t border-slate-800/60 grid grid-cols-1 sm:grid-cols-3 gap-3"
                >
                  <input
                    type="text"
                    required
                    name="categoryName"
                    placeholder="New category (e.g. Travel)"
                    className="sm:col-span-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 text-slate-100"
                  />
                  <div className="flex gap-2">
                    <input
                      type="number"
                      required
                      name="categoryAmount"
                      placeholder="Amount ($)"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 text-slate-100"
                    />
                    <button
                      type="submit"
                      className="px-3.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-black rounded-xl text-xs hover:from-teal-400 hover:to-emerald-400 transition shrink-0 flex items-center justify-center"
                    >
                      <Plus className="w-4 h-4 stroke-[3]" />
                    </button>
                  </div>
                </form>
              </div>

              {/* Right Panel: Dynamic 50/30/20 Rule Alignment */}
              <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-black text-slate-100 tracking-wide">Live 50/30/20 Blueprint Audit</h3>
                  <p className="text-xs text-slate-400">See how your current spending stacks against standard corporate financial budgeting rules.</p>
                </div>

                {/* Audit Grid */}
                <div className="space-y-4">
                  
                  {/* Needs Block (50%) */}
                  <div className="space-y-1.5 bg-slate-950/60 p-4 border border-slate-850 rounded-xl">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-blue-400 flex items-center gap-1">🟢 Essential Needs (Target 50%)</span>
                      <span className="text-slate-300">${(income * 0.5).toLocaleString()} max target</span>
                    </div>
                    <div className="flex justify-between items-center pt-1 text-[11px] text-slate-400">
                      <span>Your Rent, Groceries, & Utilities total:</span>
                      <span className="font-bold text-slate-200">${(customExpenses.find(e => e.category.toLowerCase().includes("rent") || e.category.toLowerCase().includes("groceries"))?.amount || 0).toLocaleString()}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 italic mt-1 leading-relaxed">
                      Rule of thumb: Rent, basic food, transport, and insurance shouldn't exceed half of your disposable income.
                    </div>
                  </div>

                  {/* Wants Block (30%) */}
                  <div className="space-y-1.5 bg-slate-950/60 p-4 border border-slate-850 rounded-xl">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-purple-400 flex items-center gap-1">🟡 Lifestyle Wants (Target 30%)</span>
                      <span className="text-slate-300">${(income * 0.3).toLocaleString()} max target</span>
                    </div>
                    <div className="flex justify-between items-center pt-1 text-[11px] text-slate-400">
                      <span>Dining out & non-essential costs:</span>
                      <span className="font-bold text-slate-200">${(customExpenses.find(e => e.category.toLowerCase().includes("dining") || e.category.toLowerCase().includes("fun"))?.amount || 0).toLocaleString()}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 italic mt-1 leading-relaxed">
                      Rule of thumb: Spend no more than 30% of your earnings on subscriptions, hobbies, luxury clothing, and vacations.
                    </div>
                  </div>

                  {/* Savings Block (20%) */}
                  <div className="space-y-1.5 bg-slate-950/60 p-4 border border-slate-850 rounded-xl">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-emerald-400 flex items-center gap-1">🔵 Savings & High Debt Paydown (Target 20%)</span>
                      <span className="text-slate-300">Target: ${(income * 0.2).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center pt-1 text-[11px] text-slate-400">
                      <span>Your current potential savings:</span>
                      <span className={`font-black ${remainingMonthlySavingsPotential >= income * 0.2 ? "text-emerald-400" : "text-amber-400"}`}>
                        ${remainingMonthlySavingsPotential.toLocaleString()} ({Math.round((remainingMonthlySavingsPotential / Math.max(1, income)) * 100)}%)
                      </span>
                    </div>
                    {remainingMonthlySavingsPotential >= income * 0.2 ? (
                      <div className="p-2 bg-emerald-950/40 border border-emerald-500/20 text-emerald-300 rounded text-[10px] font-bold mt-1.5 flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Awesome! You are beating the 20% savings target! Let's compound those returns below.</span>
                      </div>
                    ) : (
                      <div className="p-2 bg-amber-950/40 border border-amber-500/20 text-amber-300 rounded text-[10px] font-bold mt-1.5 flex items-center gap-1.5 animate-pulse">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                        <span>Heads up: Your spending leaves you under the 20% target. Try cutting down Fun expenses!</span>
                      </div>
                    )}
                  </div>

                </div>

              </div>

            </div>

            {/* THREE SCENARIOS TO DEMONSTRATE COMPOUND MAGIC */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-6">
              <div>
                <h3 className="text-lg font-black text-slate-100 tracking-wide">Historical Compound Interest Snowball Examples</h3>
                <p className="text-xs text-slate-400">See how investing small monthly amounts can scale over time. Click any scenario to load it into the custom simulator.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Preset Scenario 1 */}
                <div className="bg-slate-950/80 border border-slate-850 rounded-2xl p-5 space-y-4 flex flex-col justify-between hover:border-teal-500/40 transition">
                  <div className="space-y-2">
                    <span className="text-[10px] text-teal-400 font-bold bg-teal-950/40 px-2 py-0.5 rounded border border-teal-500/20 uppercase">Beginner Saver</span>
                    <h4 className="font-bold text-base text-slate-100">The Power of $150/Month</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Invest $150/month with zero initial deposit for 15 years at an 8% index fund return.
                    </p>
                    <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 text-xs">
                      <div className="flex justify-between text-slate-400">
                        <span>Total Deposited:</span>
                        <span>$27,000</span>
                      </div>
                      <div className="flex justify-between font-bold text-teal-300 mt-1">
                        <span>Final Value:</span>
                        <span>$49,271</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => loadPresetSimulation(0, 150, 8, 15)}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-850 text-slate-300 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1 border border-slate-800"
                  >
                    <span>Load Into Simulator</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Preset Scenario 2 */}
                <div className="bg-slate-950/80 border border-slate-850 rounded-2xl p-5 space-y-4 flex flex-col justify-between hover:border-indigo-500/40 transition">
                  <div className="space-y-2">
                    <span className="text-[10px] text-indigo-400 font-bold bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-500/20 uppercase">Consistent Wealth Builder</span>
                    <h4 className="font-bold text-base text-slate-100">The S&P 500 Route ($400)</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Start with $3,000, add $400/month for 20 years at a 9% return (average historic stock market growth).
                    </p>
                    <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 text-xs">
                      <div className="flex justify-between text-slate-400">
                        <span>Total Deposited:</span>
                        <span>$99,000</span>
                      </div>
                      <div className="flex justify-between font-bold text-indigo-300 mt-1">
                        <span>Final Value:</span>
                        <span>$282,143</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => loadPresetSimulation(3000, 400, 9, 20)}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-850 text-slate-300 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1 border border-slate-800"
                  >
                    <span>Load Into Simulator</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Preset Scenario 3 */}
                <div className="bg-slate-950/80 border border-slate-850 rounded-2xl p-5 space-y-4 flex flex-col justify-between hover:border-purple-500/40 transition">
                  <div className="space-y-2">
                    <span className="text-[10px] text-purple-400 font-bold bg-purple-950/40 px-2 py-0.5 rounded border border-purple-500/20 uppercase">Aggressive compounding</span>
                    <h4 className="font-bold text-base text-slate-100">Super Compounding ($800)</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Start with $10,000, invest $800/month for 30 years at 10% interest. The compounding effect goes exponential!
                    </p>
                    <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 text-xs">
                      <div className="flex justify-between text-slate-400">
                        <span>Total Deposited:</span>
                        <span>$298,000</span>
                      </div>
                      <div className="flex justify-between font-bold text-purple-300 mt-1">
                        <span>Final Value:</span>
                        <span>$1,940,948</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => loadPresetSimulation(10000, 800, 10, 30)}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-850 text-slate-300 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1 border border-slate-800"
                  >
                    <span>Load Into Simulator</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: ADVANCED COMPOUND INTEREST SIMULATOR */}
        {/* ============================================================== */}
        {activeTab === "simulator" && (
          <div className="space-y-8 animate-fadein">
            
            {/* INSTRUCTIONS PANEL */}
            <div className="bg-gradient-to-r from-teal-950/40 via-slate-900 to-indigo-950/40 border border-slate-800 rounded-3xl p-5 flex items-start gap-4">
              <Info className="w-6 h-6 text-teal-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-slate-200">How to use the Savings Simulator</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Use the sliders to adjust variables. Watch how compounding frequency affects returns over years. Save scenarios side-by-side to compare risk and investment durations without committing your cash!
                </p>
              </div>
            </div>

            {/* TWO COLUMN GRID: SLIDERS VS GRAPH/RESULTS */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* SLIDERS COLUMN (5 cols) */}
              <div className="lg:col-span-5 bg-slate-900/40 border border-slate-800 rounded-3xl p-6 space-y-6">
                <h3 className="text-lg font-black text-slate-100 tracking-wide border-b border-slate-850 pb-2 flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-teal-400" />
                  <span>Savings Variables</span>
                </h3>

                {/* Slider 1: Principal */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-300">
                    <span>Initial Principal (P)</span>
                    <span className="text-teal-400">${simulatorPrincipal.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100000"
                    step="500"
                    className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-teal-500"
                    value={simulatorPrincipal}
                    onChange={(e) => setSimulatorPrincipal(parseInt(e.target.value))}
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                    <span>$0</span>
                    <span>$50,000</span>
                    <span>$100,000</span>
                  </div>
                </div>

                {/* Slider 2: Monthly contributions */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-300">
                    <span>Monthly Additions (PMT)</span>
                    <span className="text-teal-400">${simulatorMonthly.toLocaleString()}/mo</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="5000"
                    step="25"
                    className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-teal-500"
                    value={simulatorMonthly}
                    onChange={(e) => setSimulatorMonthly(parseInt(e.target.value))}
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                    <span>$0</span>
                    <span>$2,500</span>
                    <span>$5,000</span>
                  </div>
                </div>

                {/* Slider 3: Interest Rate */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-300">
                    <span>Annual Return Rate (r)</span>
                    <span className="text-teal-400">{simulatorRate}%</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    step="0.1"
                    className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-teal-500"
                    value={simulatorRate}
                    onChange={(e) => setSimulatorRate(parseFloat(e.target.value))}
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                    <span>1% (Savings Acc)</span>
                    <span>10% (S&P Index)</span>
                    <span>20% (High Speculation)</span>
                  </div>
                </div>

                {/* Slider 4: Time Horizon */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-300">
                    <span>Horizon Duration (t)</span>
                    <span className="text-teal-400">{simulatorYears} Years</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="45"
                    step="1"
                    className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-teal-500"
                    value={simulatorYears}
                    onChange={(e) => setSimulatorYears(parseInt(e.target.value))}
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                    <span>1 Year</span>
                    <span>20 Years</span>
                    <span>45 Years</span>
                  </div>
                </div>

                {/* Compounding frequency options */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Compounding Frequency</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "Monthly", val: 12 },
                      { label: "Quarterly", val: 4 },
                      { label: "Annually", val: 1 },
                    ].map((f) => (
                      <button
                        key={f.label}
                        type="button"
                        onClick={() => setSimulatorFrequency(f.val)}
                        className={`py-2 text-center rounded-lg text-xs font-bold border transition ${
                          simulatorFrequency === f.val
                            ? "bg-slate-850 border-teal-500 text-teal-400"
                            : "bg-slate-950 border-slate-800 text-slate-400"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Save Scenario Form */}
                <div className="pt-4 border-t border-slate-800/60 space-y-2.5">
                  <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Compare this scenario</span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 text-slate-100 placeholder:text-slate-600 flex-1"
                      placeholder="Name this scenario (e.g. Retirement Goal)"
                      value={scenarioNameInput}
                      onChange={(e) => setScenarioNameInput(e.target.value)}
                    />
                    <button
                      onClick={handleSaveScenario}
                      className="px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black rounded-xl text-xs transition"
                    >
                      Save Scenario
                    </button>
                  </div>
                </div>

              </div>

              {/* SIMULATION VISUAL CHART & RESULTS COLUMN (7 cols) */}
              <div className="lg:col-span-7 bg-slate-900/40 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between space-y-6">
                
                {/* Result header */}
                <div className="flex justify-between items-center pb-2 border-b border-slate-850">
                  <h3 className="text-lg font-black text-slate-100 tracking-wide">Growth Projection</h3>
                  <span className="text-[10px] text-teal-400 font-bold tracking-widest uppercase">Compound mathematical forecast</span>
                </div>

                {/* Key stats row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-slate-950/80 p-3.5 border border-slate-850 rounded-xl text-center">
                    <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest">Total Contributions</span>
                    <span className="block text-lg font-black text-slate-300 mt-1">${simResult.totalDeposits.toLocaleString()}</span>
                  </div>
                  <div className="bg-slate-950/80 p-3.5 border border-slate-850 rounded-xl text-center">
                    <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest">Compounded Interest</span>
                    <span className="block text-lg font-black text-teal-400 mt-1">+${simResult.totalInterest.toLocaleString()}</span>
                  </div>
                  <div className="bg-slate-950/80 p-3.5 border border-teal-500/20 rounded-xl text-center bg-teal-950/5">
                    <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest">Final Projected Balance</span>
                    <span className="block text-xl font-black text-teal-300 mt-1">${simResult.finalBalance.toLocaleString()}</span>
                  </div>
                </div>

                {/* VISUAL CHART - RESPONSIVE SVG */}
                <div className="bg-slate-950/60 p-4 border border-slate-850 rounded-2xl">
                  <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Investment Accumulation Chart</span>
                  
                  <div className="w-full h-56 relative flex items-end">
                    
                    {/* Render Columns */}
                    <div className="w-full h-full flex justify-between items-end gap-1.5 pt-4">
                      {simResult.yearlyData.map((d, index) => {
                        // Max out balance scale
                        const maxVal = Math.max(1, simResult.finalBalance);
                        const depositHeight = (d.deposits / maxVal) * 100;
                        const interestHeight = (d.interest / maxVal) * 100;

                        // Only label every few years to keep graph tidy
                        const shouldLabel = simulatorYears <= 15 
                          ? index % 2 === 0 
                          : simulatorYears <= 30 
                          ? index % 5 === 0 
                          : index % 10 === 0 || index === simulatorYears;

                        return (
                          <div key={d.year} className="flex-1 flex flex-col justify-end items-center h-full relative group">
                            
                            {/* Hover info tooltip */}
                            <div className="absolute -top-12 scale-0 group-hover:scale-100 bg-slate-900 border border-slate-800 text-slate-200 text-[10px] p-2 rounded shadow-2xl z-20 pointer-events-none transition-transform w-28 text-center">
                              <p className="font-bold text-slate-300">Year {d.year}</p>
                              <p className="text-[9px] text-slate-500">Deposits: ${d.deposits.toLocaleString()}</p>
                              <p className="text-[9px] text-teal-400 font-bold">Interest: +${d.interest.toLocaleString()}</p>
                              <p className="font-black text-teal-300 border-t border-slate-800 mt-1 pt-0.5">Total: ${d.total.toLocaleString()}</p>
                            </div>

                            {/* Bar Stack */}
                            <div className="w-full flex flex-col justify-end items-center h-full relative rounded">
                              
                              {/* Interest portion */}
                              {d.interest > 0 && (
                                <div
                                  className="w-full bg-gradient-to-t from-teal-500 to-teal-400 hover:from-teal-400 transition rounded-t-sm"
                                  style={{ height: `${interestHeight}%` }}
                                />
                              )}
                              
                              {/* Deposit portion */}
                              <div
                                className="w-full bg-slate-800 hover:bg-slate-700 transition"
                                style={{ height: `${depositHeight}%` }}
                              />
                            </div>

                            {/* Year labels */}
                            <span className={`text-[9px] font-black text-slate-500 mt-2 block h-3 ${shouldLabel ? "opacity-100" : "opacity-0"}`}>
                              Y{d.year}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="flex items-center gap-4 justify-center pt-3 mt-2 border-t border-slate-900/60 text-[10px] font-bold text-slate-500">
                    <div className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 bg-slate-800 rounded" />
                      <span>Total Invested Capital</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 bg-teal-500 rounded" />
                      <span>Compounded Interest Accrued</span>
                    </div>
                  </div>
                </div>

                {/* Explanatory notes */}
                <div className="p-3 bg-teal-950/20 border border-teal-500/10 rounded-xl text-[11px] text-slate-400 flex items-start gap-2 leading-relaxed">
                  <Zap className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <span>
                    Notice the exponential rise? In early years, your savings growth is mostly driven by deposits. In later years, the **compound interest snowball** dominates, generating massive wealth with zero extra contribution!
                  </span>
                </div>

              </div>

            </div>

            {/* SAVED SCENARIOS COMPARISON BOARD */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 space-y-6">
              <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                <div>
                  <h3 className="text-lg font-black text-slate-100 tracking-wide">Saved Compound Interest Comparisons</h3>
                  <p className="text-xs text-slate-400">Review multiple simulations side-by-side to determine which timeline or rate matches your financial comfort zone.</p>
                </div>
                <span className="text-xs bg-slate-950 border border-slate-850 px-3 py-1 rounded-xl text-slate-400 font-bold">
                  {savedScenarios.length} Saved Scenarios
                </span>
              </div>

              {savedScenarios.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-slate-800 rounded-2xl bg-slate-950/20">
                  <Sliders className="w-10 h-10 text-slate-700 mx-auto mb-2" />
                  <p className="text-xs text-slate-500 font-bold">No saved scenarios to compare yet.</p>
                  <p className="text-[10px] text-slate-600 mt-1">Adjust sliders above and click \"Save Scenario\" to build your board!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {savedScenarios.map((scen) => (
                    <div key={scen.id} className="bg-slate-950 border border-slate-850 p-5 rounded-2xl flex flex-col justify-between hover:border-slate-850 transition relative">
                      
                      <button
                        onClick={() => handleDeleteScenario(scen.id)}
                        className="absolute top-4 right-4 p-1 text-slate-500 hover:text-red-400 transition"
                        title="Delete scenario"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="space-y-3">
                        <span className="text-[10px] text-indigo-400 font-bold bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-500/20 uppercase">
                          {scen.rate}% return for {scen.years} Yrs
                        </span>
                        <h4 className="font-bold text-sm text-slate-200 pr-6 truncate">{scen.name}</h4>
                        
                        <div className="space-y-1.5 pt-2 border-t border-slate-900 text-[11px] text-slate-400">
                          <div className="flex justify-between">
                            <span>Initial Principal:</span>
                            <span className="font-bold text-slate-300">${scen.principal.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Monthly Addition:</span>
                            <span className="font-bold text-slate-300">${scen.monthlyContribution.toLocaleString()}/mo</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Total Interest:</span>
                            <span className="font-bold text-teal-400">+${scen.totalInterest.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between pt-1 border-t border-slate-900 font-black text-xs">
                            <span className="text-slate-300">Final Projected Balance:</span>
                            <span className="text-teal-300">${scen.finalBalance.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-900 flex justify-end">
                        <button
                          onClick={() => {
                            setSimulatorPrincipal(scen.principal);
                            setSimulatorMonthly(scen.monthlyContribution);
                            setSimulatorRate(scen.rate);
                            setSimulatorYears(scen.years);
                            triggerToast(`Restored "${scen.name}" parameters into the sliders!`);
                          }}
                          className="text-[10px] text-teal-400 hover:underline font-bold flex items-center gap-0.5"
                        >
                          <span>Load variables</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              )}

            </div>

          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: FINANCIAL LITERACY MODULES */}
        {/* ============================================================== */}
        {activeTab === "literacy" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fadein">
            
            {/* LESSON CATEGORY NAVIGATION SIDEBAR (4 cols) */}
            <div className="lg:col-span-4 bg-slate-900/40 border border-slate-800 rounded-3xl p-5 space-y-4 h-fit">
              <h3 className="text-sm font-black text-slate-100 tracking-wider uppercase border-b border-slate-850 pb-2 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-teal-400" />
                <span>Financial Courseware</span>
              </h3>

              <div className="space-y-2.5">
                {LITERACY_MODULES.map((mod, index) => {
                  const isSelected = activeModuleIndex === index;
                  const hasBadge = unlockedBadges.includes(mod.badge);
                  const Icon = mod.icon;

                  return (
                    <button
                      key={mod.id}
                      type="button"
                      onClick={() => {
                        setActiveModuleIndex(index);
                        setQuizState("read");
                        setCurrentQuizQuestionIndex(0);
                        setSelectedQuizOption(null);
                      }}
                      className={`w-full p-4 rounded-xl border text-left transition duration-150 flex items-center justify-between gap-3 ${
                        isSelected
                          ? "bg-slate-850 border-teal-500/50 shadow-md text-slate-100"
                          : "bg-slate-950/80 border-slate-850 hover:bg-slate-950 text-slate-400"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-slate-900 border border-slate-800 ${isSelected ? "text-teal-400" : "text-slate-500"}`}>
                          <Icon className="w-4.5 h-4.5" />
                        </div>
                        <div>
                          <span className="block font-bold text-xs text-slate-200 leading-snug">{mod.title}</span>
                          <span className="block text-[10px] text-slate-500 mt-1">{mod.duration} duration</span>
                        </div>
                      </div>

                      {hasBadge ? (
                        <span className="text-amber-500" title={`Unlocked Badge: ${mod.badge}`}>
                          <Award className="w-5 h-5 fill-amber-500 text-amber-500 stroke-[2.5]" />
                        </span>
                      ) : (
                        <ChevronRight className="w-4.5 h-4.5 text-slate-600" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Badges Display Block */}
              <div className="pt-4 border-t border-slate-800/60 space-y-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Your Achievements</span>
                
                {unlockedBadges.length === 0 ? (
                  <p className="text-[10px] text-slate-500 leading-relaxed italic">
                    Finish lesson quizzes with a **100% score** to unlock unique investment merit badges!
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {unlockedBadges.map((badge) => (
                      <span
                        key={badge}
                        className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-950 text-amber-300 px-2.5 py-1 rounded-full border border-amber-500/30"
                      >
                        <Award className="w-3 h-3 fill-amber-500 text-amber-500" />
                        {badge}
                      </span>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* MAIN INTERACTIVE LESSON READER & QUIZ SYSTEM (8 cols) */}
            <div className="lg:col-span-8 bg-slate-900/40 border border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col justify-between space-y-6">
              
              {/* STATE A: LESSON TEXT READER */}
              {quizState === "read" && (
                <div className="space-y-6">
                  
                  {/* Lesson header */}
                  <div className="border-b border-slate-850 pb-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-teal-400 font-bold tracking-widest uppercase bg-teal-950/60 px-2.5 py-1 rounded border border-teal-500/20">
                        Lesson Module
                      </span>
                      <span className="text-xs text-slate-500 font-bold">{currentModule.duration} reading time</span>
                    </div>
                    <h2 className="text-2xl font-black text-slate-100 tracking-wide">{currentModule.title}</h2>
                    <p className="text-xs text-slate-400 leading-relaxed">{currentModule.summary}</p>
                  </div>

                  {/* Subchapters list */}
                  <div className="space-y-5">
                    {currentModule.content.map((sec, idx) => (
                      <div key={idx} className="bg-slate-950/80 p-4 border border-slate-850 rounded-xl space-y-1.5">
                        <h4 className="font-bold text-sm text-teal-300 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                          {sec.subtitle}
                        </h4>
                        <p className="text-xs text-slate-300 leading-relaxed font-medium">
                          {sec.text}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Trigger Quiz Action */}
                  <div className="pt-6 border-t border-slate-850 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-slate-500 text-center sm:text-left">
                      Done reading? Challenge yourself to a quiz to test your financial comprehension and earn your merit badge!
                    </p>
                    <button
                      onClick={handleStartQuiz}
                      className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-black rounded-xl text-xs hover:from-teal-400 hover:to-emerald-400 transition flex items-center justify-center gap-1 shadow-md shadow-teal-500/10 shrink-0"
                    >
                      <span>Challenge Lesson Quiz</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              )}

              {/* STATE B: ACTIVE COMPREHENSION QUIZ */}
              {quizState === "quiz" && (
                <div className="space-y-6">
                  
                  {/* Quiz header status */}
                  <div className="border-b border-slate-850 pb-4 flex justify-between items-center">
                    <div>
                      <span className="text-[10px] text-teal-400 font-bold uppercase tracking-widest block">COMPREHENSION CHECK</span>
                      <h3 className="font-bold text-sm text-slate-200 mt-1">{currentModule.title} Quiz</h3>
                    </div>
                    <span className="text-xs bg-slate-950 border border-slate-800 px-3 py-1 rounded-xl text-slate-400 font-bold">
                      Question {currentQuizQuestionIndex + 1} of {currentModule.quiz.length}
                    </span>
                  </div>

                  {/* Active Question Title */}
                  <div className="bg-slate-950/60 p-5 border border-slate-850 rounded-xl">
                    <p className="text-sm font-bold text-slate-100 leading-relaxed">
                      {currentModule.quiz[currentQuizQuestionIndex].question}
                    </p>
                  </div>

                  {/* Options List */}
                  <div className="space-y-3">
                    {currentModule.quiz[currentQuizQuestionIndex].options.map((opt, idx) => {
                      const isSelected = selectedQuizOption === idx;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectOption(idx)}
                          className={`w-full p-4 text-left rounded-xl border text-xs font-bold transition flex items-center justify-between ${
                            isSelected
                              ? "bg-teal-950/20 border-teal-500 text-teal-300"
                              : "bg-slate-950 border-slate-850 hover:bg-slate-950 text-slate-300"
                          }`}
                        >
                          <span>{opt}</span>
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected ? "border-teal-400 bg-teal-400 text-slate-950" : "border-slate-700"
                          }`}>
                            {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Navigation / Next Trigger */}
                  <div className="pt-6 border-t border-slate-850 flex justify-between items-center gap-4">
                    <button
                      onClick={() => setQuizState("read")}
                      className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200"
                    >
                      Return to Lesson
                    </button>
                    
                    <button
                      onClick={handleNextQuizQuestion}
                      disabled={selectedQuizOption === null}
                      className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-black rounded-xl text-xs hover:from-teal-400 hover:to-emerald-400 transition disabled:opacity-45 disabled:pointer-events-none flex items-center gap-1.5"
                    >
                      <span>
                        {currentQuizQuestionIndex + 1 === currentModule.quiz.length ? "Submit Answers" : "Next Question"}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              )}

              {/* STATE C: QUIZ SUBMISSION RESULTS */}
              {quizState === "result" && (
                <div className="space-y-6 text-center py-6">
                  
                  {/* Score Indicator Icon */}
                  <div className="w-20 h-24 mx-auto flex items-center justify-center relative">
                    <Award className="w-16 h-16 text-amber-500 fill-amber-500/20 animate-pulse stroke-[1.5]" />
                    <span className="absolute bottom-2 text-lg font-black text-slate-100">
                      {quizScore}/{currentModule.quiz.length}
                    </span>
                  </div>

                  {/* Results Message */}
                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-slate-100">
                      {quizScore === currentModule.quiz.length
                        ? "🎉 Flawless Score! Perfect Win!"
                        : "Almost got it! Keep studying."}
                    </h3>
                    <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                      {quizScore === currentModule.quiz.length
                        ? `You answered all ${currentModule.quiz.length} questions correctly and unlocked the "${currentModule.badge}" merit badge! Your financial literacy progress has been saved in the cache.`
                        : "You missed a few details. Take a moment to read the lesson content again and attempt the quiz once more to unlock your badge."}
                    </p>
                  </div>

                  {/* Detailed explanation review panel */}
                  <div className="text-left bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-3 max-h-[220px] overflow-y-auto max-w-xl mx-auto">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Review Explanations:</span>
                    {currentModule.quiz.map((q, idx) => (
                      <div key={idx} className="space-y-1 text-xs border-b border-slate-900 pb-2.5 last:border-0 last:pb-0">
                        <p className="font-bold text-slate-200">
                          {idx + 1}. {q.question}
                        </p>
                        <p className="text-[11px] text-teal-400">
                          💡 <span className="font-bold">Correct answer:</span> {q.options[q.answer]}
                        </p>
                        <p className="text-[10px] text-slate-500 italic leading-relaxed">
                          {q.explanation}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Result navigation triggers */}
                  <div className="pt-6 border-t border-slate-850 flex justify-center gap-3">
                    <button
                      onClick={() => setQuizState("read")}
                      className="px-5 py-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 rounded-xl text-xs font-bold transition"
                    >
                      Re-Read Lesson
                    </button>
                    {quizScore < currentModule.quiz.length && (
                      <button
                        onClick={handleStartQuiz}
                        className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 rounded-xl text-xs font-black hover:from-teal-400 hover:to-emerald-400 transition"
                      >
                        Try Quiz Again
                      </button>
                    )}
                  </div>

                </div>
              )}

            </div>

          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="text-center text-slate-600 text-xs py-10 border-t border-slate-900 mt-16 max-w-7xl mx-auto px-4">
        <p className="font-medium">WealthForge Public Savings Companion & Literacy Engine v3.1</p>
        <p className="mt-1 text-[10px] text-slate-700 uppercase tracking-widest font-black">All login blocks disabled. Code and simulator open source.</p>
      </footer>

    </div>
  );
}
