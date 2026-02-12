import React, { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { analyzeContent } from './services/geminiService';
import { Typewriter } from './components/Typewriter';
import { Button } from './components/Button';
import { AppState, AnalysisResult, UserContent } from './types';
import { 
  ShieldAlert, 
  Skull, 
  TrendingDown, 
  CheckCircle, 
  Upload, 
  Image as ImageIcon,
  Lock,
  Zap,
  RefreshCcw,
  Share2,
  X,
  CreditCard,
  Smartphone,
  FileText
} from 'lucide-react';

const ONBOARDING_SCRIPT = [
  "oh. you're finally here. take a seat. don't touch anything yet.",
  "look. the internet is bored and angry. they are waiting for you to slip up so they can destroy you for sport.",
  "i'm the only thing standing between your 'brilliant idea' and a public apology video.",
  "i've seen billion-dollar brands collapse over a single emoji. i've seen careers end because someone thought they were being funny.",
  "so here is the deal. you show me what you want to post. i will tell you exactly how it will ruin your life.",
  "drop the file in the box. and please... try not to make me cringe. i've had a really long week."
];

export default function App() {
  const [appState, setAppState] = useState<AppState>(AppState.ONBOARDING);
  const [userContent, setUserContent] = useState<UserContent>({ text: '' });
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const shameRef = useRef<HTMLDivElement>(null);

  // --- Audio FX ---
  const playSuccessSound = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      
      const ctx = new AudioContext();
      
      // Cash Register 'Ching'
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(2000, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.6);

      // Distorted Choir (Angelic Glitch)
      [220, 277, 330, 440].forEach((freq, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sawtooth'; // Harsh/Digital sound
        o.frequency.value = freq;
        o.connect(g);
        g.connect(ctx.destination);
        
        g.gain.setValueAtTime(0, ctx.currentTime);
        g.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.2);
        g.gain.linearRampToValueAtTime(0, ctx.currentTime + 2.5);
        
        // Add subtle detune for "tired" vibe
        o.detune.setValueAtTime(0, ctx.currentTime);
        o.detune.linearRampToValueAtTime(Math.random() * 20 - 10, ctx.currentTime + 2);

        o.start(ctx.currentTime + 0.1);
        o.stop(ctx.currentTime + 2.5);
      });
    } catch (e) {
      console.error("Audio FX failed", e);
    }
  };

  // --- Handlers ---

  const handleSkipOnboarding = () => {
    setAppState(AppState.INPUT);
  };

  const handleOnboardingComplete = () => {
    setTimeout(() => {
      setAppState(AppState.INPUT);
    }, 1500);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserContent(prev => ({ ...prev, text: e.target.value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(',')[1];
        setUserContent(prev => ({ 
          ...prev, 
          image: base64Data,
          mimeType: file.type
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const startAnalysis = async () => {
    if (!userContent.text && !userContent.image) return;
    
    setAppState(AppState.ANALYZING);
    setIsLoading(true);

    try {
      const [result] = await Promise.all([
        analyzeContent(userContent.text, userContent.image, userContent.mimeType),
        new Promise(resolve => setTimeout(resolve, 3000))
      ]);
      
      setAnalysis(result);
      setAppState(AppState.TEASE);
    } catch (error) {
      console.error(error);
      setAppState(AppState.INPUT);
      alert("i crashed. probably because your post was too bad. try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayClick = () => {
    setShowPayModal(true);
  };

  const handleConfirmPayment = () => {
    setIsLoading(true);
    // Simulate "Biometric Ding" and processing
    setTimeout(() => {
      setIsLoading(false);
      setShowPayModal(false);
      
      // TRIGGER THE SUCCESS SEQUENCE
      playSuccessSound();
      setPaymentSuccess(true);
      
      // Wait for shatter animation to finish before showing dashboard
      setTimeout(() => {
        setPaymentSuccess(false);
        setAppState(AppState.DASHBOARD);
      }, 2000);
    }, 1500);
  };

  const handleShareShame = async () => {
    if (!shameRef.current) return;
    
    await new Promise(r => setTimeout(r, 100));

    try {
      const canvas = await html2canvas(shameRef.current, {
        backgroundColor: '#000000',
        scale: 2,
        useCORS: true,
        logging: false,
        onclone: (clonedDoc) => {
          // Force styles in clone if needed
          const el = clonedDoc.querySelector('.shame-card') as HTMLElement;
          if (el) el.style.display = 'flex'; 
        }
      });

      canvas.toBlob(async (blob) => {
        if (!blob) return;
        
        const filename = 'nemesis_shame_report.png';
        const file = new File([blob], filename, { type: 'image/png' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              title: 'NEMESIS Vibe Check',
              text: `i just got roasted by NEMESIS. ${analysis?.oofScore}% cringe detected. read the report.`,
              files: [file]
            });
          } catch (err) {
            console.log('Share cancelled', err);
          }
        } else {
          const link = document.createElement('a');
          link.download = filename;
          link.href = canvas.toDataURL();
          link.click();
        }
      }, 'image/png');
    } catch (error) {
      console.error("Shame generation failed:", error);
      alert("Failed to capture your shame. You got lucky.");
    }
  };

  // --- Components ---

  const JailBars = ({ shattering }: { shattering: boolean }) => (
    <div className="fixed inset-0 z-40 pointer-events-none flex">
      {[...Array(8)].map((_, i) => (
        <div 
          key={i} 
          className={`flex-1 bg-black border-r border-gray-900 relative ${shattering ? (i % 2 === 0 ? 'shatter-up' : 'shatter-down') : ''}`}
          style={{ transitionDelay: `${i * 50}ms` }}
        >
          {/* Bar highlight */}
          <div className="absolute top-0 right-0 h-full w-[1px] bg-gray-800/50"></div>
        </div>
      ))}
    </div>
  );

  // --- Render Helpers ---

  const renderOnboarding = () => (
    <div className="max-w-2xl mx-auto pt-20 px-6 min-h-screen flex flex-col justify-center">
      <Typewriter 
        lines={ONBOARDING_SCRIPT} 
        onComplete={handleOnboardingComplete} 
        speed={30}
      />
      <div className="mt-8 opacity-0 animate-[fadeIn_2s_ease-in_5s_forwards]">
        <button 
          onClick={handleSkipOnboarding}
          className="text-xs text-gray-700 hover:text-gray-500 transition-colors uppercase tracking-widest"
        >
          [ Skip Initiation ]
        </button>
      </div>
    </div>
  );

  const renderInput = () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative">
      <div className="w-full max-w-xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-widest uppercase text-gray-400 glow-text">NEMESIS</h1>
          <p className="text-xs text-gray-600 font-mono lowercase">i'm ready. disappoint me.</p>
        </div>

        <div className="relative group">
          <textarea 
            className="w-full h-48 bg-black border border-gray-800 p-4 text-gray-300 focus:border-red-900 focus:ring-1 focus:ring-red-900 outline-none transition-all resize-none placeholder-gray-800 font-mono text-sm"
            placeholder="paste your caption, tweet, or excuse here..."
            value={userContent.text}
            onChange={handleTextChange}
          />
          <div className="absolute -inset-0.5 bg-red-900 opacity-0 group-focus-within:opacity-20 blur transition duration-1000 -z-10"></div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileChange}
          />
          
          <Button 
            variant="secondary" 
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-2"
          >
            <ImageIcon size={16} />
            {userContent.image ? "Image Loaded" : "Upload Visual"}
          </Button>

          <Button 
            variant="danger" 
            onClick={startAnalysis}
            disabled={!userContent.text && !userContent.image}
            className="flex-[2] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Analyze Risk
          </Button>
        </div>
        
        {userContent.image && (
          <div className="mt-4 p-2 border border-gray-800 border-dashed">
            <p className="text-xs text-gray-600 mb-2">Attached Visual Evidence:</p>
            <img 
              src={`data:${userContent.mimeType};base64,${userContent.image}`} 
              alt="Preview" 
              className="max-h-32 object-contain opacity-70 grayscale hover:grayscale-0 transition-all" 
            />
          </div>
        )}
      </div>
    </div>
  );

  const renderAnalyzing = () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-black">
      <div className="w-16 h-16 border-t-2 border-red-600 rounded-full animate-spin mb-8"></div>
      <div className="text-center space-y-4">
        <p className="text-red-600 font-mono animate-pulse lowercase">scanning for cringe...</p>
        <p className="text-gray-700 text-xs lowercase">cross-referencing with 4 billion bad tweets</p>
      </div>
    </div>
  );

  const renderTease = () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative">
      <div className="w-full max-w-2xl bg-black border border-gray-800 p-8 md:p-12 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-900/10 blur-3xl rounded-full pointer-events-none"></div>
        
        <div className="text-center space-y-6 mb-12">
          <h2 className="text-4xl md:text-6xl font-bold text-red-600 glow-red tracking-tighter">
            {analysis?.oofScore}% OOF
          </h2>
          <p className="text-gray-400 text-sm tracking-widest uppercase border-b border-gray-800 pb-4 inline-block">
            Disaster Probability: High
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-900/30 p-4 border-l-2 border-red-600">
            <p className="text-xs text-gray-500 uppercase mb-2">Predicted Top Comment:</p>
            <p className="text-gray-300 italic font-serif">
              "{analysis?.roast.substring(0, Math.floor(analysis.roast.length / 2))}... [censored for your protection]"
            </p>
          </div>

          <div className="space-y-2">
            <Typewriter 
              lines={[
                "yeah... this is bad.",
                `i found ${analysis?.lethalErrors.length} reasons why this is going to get you ratio'd.`,
                "do you want to hear the truth or do you want to go viral for the wrong reasons?"
              ]}
              speed={20}
              className="text-sm text-gray-400"
            />
          </div>
        </div>

        <div className="mt-12 space-y-4">
           {/* The Trap */}
           <div className="border border-red-900/50 p-6 bg-red-950/10 relative group hover:bg-red-950/20 transition-all cursor-pointer" onClick={() => setAppState(AppState.PAYWALL)}>
              <div className="absolute top-0 right-0 p-2 text-xs text-red-500 border-l border-b border-red-900/50">LOCKED</div>
              <h3 className="text-lg text-gray-300 mb-2 flex items-center gap-2">
                <Lock size={16} className="text-red-500" />
                View The Damage Report
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 blur-[2px] group-hover:blur-[1px] transition-all select-none">
                <li>• 3 Lethal Errors Detected</li>
                <li>• Innocence Check Results</li>
                <li>• Brand Suicide Risk Assessment</li>
              </ul>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                 <span className="bg-black text-red-500 border border-red-500 px-4 py-2 text-xs uppercase tracking-widest">
                   Unlock for $5
                 </span>
              </div>
           </div>
           
           <Button variant="danger" className="w-full" onClick={() => setAppState(AppState.PAYWALL)}>
             Save My Reputation ($5)
           </Button>
        </div>
      </div>
    </div>
  );

  const renderPaywall = () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-black z-50 relative">
      {/* Jail Bars Overlay */}
      <JailBars shattering={paymentSuccess} />

      {/* Payment Content */}
      <div className={`max-w-md w-full z-50 transition-all duration-700 ${paymentSuccess ? 'opacity-0 scale-110' : 'opacity-100 scale-100'}`}>
         {/* The "Shakedown" Modal style */}
         <div className="bg-black border border-red-900/50 p-8 shadow-[0_0_50px_rgba(220,38,38,0.2)]">
            <div className="text-center space-y-6">
               <h2 className="text-3xl font-bold text-red-600 glow-red tracking-tighter uppercase">Pay The Fine.</h2>
               
               <div className="py-8 border-t border-b border-gray-900">
                  <span className="text-6xl font-bold text-white glow-text">$5.00</span>
                  <p className="text-xs text-gray-500 uppercase mt-2 tracking-widest">One-time Rescue Fee</p>
               </div>
               
               <p className="text-gray-400 text-sm font-mono">
                 "One tap to save your reputation."
               </p>

               <button 
                 onClick={handlePayClick}
                 className="w-full group relative overflow-hidden bg-black border border-white/20 hover:border-white transition-all rounded-lg p-0"
               >
                 {/* Fake GPay Button Look */}
                 <div className="relative z-10 flex items-center justify-center gap-2 py-4 bg-black text-white group-hover:bg-gray-900 transition-colors">
                    <span className="font-sans font-medium text-xl">G</span>
                    <span className="font-sans font-medium text-xl">Pay</span>
                 </div>
                 <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-blue-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
               </button>
               
               <button 
                 onClick={() => setAppState(AppState.TEASE)}
                 className="text-xs text-gray-700 hover:text-red-900 uppercase tracking-widest"
               >
                 I accept my fate
               </button>
            </div>
         </div>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="min-h-screen bg-black p-4 md:p-8 animate-[fadeIn_1s_ease-out]">
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-12 border-b border-gray-900 pb-4">
        <h1 className="text-xl font-bold tracking-widest text-gray-500">NEMESIS <span className="text-red-600 text-xs align-top">PRO</span></h1>
        <Button variant="secondary" className="px-4 py-2 text-xs" onClick={() => setAppState(AppState.INPUT)}>New Analysis</Button>
      </header>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Column: Stats & Evidence */}
        <div className="md:col-span-4 space-y-8">
          
          {/* EVIDENCE SECTION */}
          <div className="border border-gray-800 p-4 bg-gray-900/20">
             <div className="flex items-center gap-2 mb-4 text-gray-400">
               {userContent.image ? <ImageIcon size={18} /> : <FileText size={18} />}
               <h3 className="text-sm uppercase tracking-widest">Evidence</h3>
             </div>
             <div className="bg-black border border-gray-800 p-2 relative overflow-hidden group">
                {userContent.image ? (
                  <img 
                    src={`data:${userContent.mimeType};base64,${userContent.image}`} 
                    className="w-full h-auto object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all"
                  />
                ) : (
                  <div className="p-4 font-mono text-xs text-gray-500 italic border-l-2 border-gray-800">
                    "{userContent.text.length > 150 ? userContent.text.substring(0, 150) + "..." : userContent.text}"
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-red-600 text-black text-[10px] font-bold px-2 py-0.5 uppercase transform rotate-2">
                  Flagged
                </div>
             </div>
          </div>

          {/* Cringe Clock */}
          <div className="border border-gray-800 p-6 bg-gray-900/20">
            <div className="flex items-center gap-2 mb-4 text-gray-400">
              <TrendingDown size={18} />
              <h3 className="text-sm uppercase tracking-widest">Cringe Clock</h3>
            </div>
            <div className="relative pt-2">
              <div className="flex justify-between text-xs mb-1">
                <span>Fresh</span>
                <span className="text-red-500">Dated</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-red-600 transition-all duration-1000" 
                  style={{ width: `${analysis?.cringeClock}%` }}
                ></div>
              </div>
              <p className="mt-4 text-sm text-gray-300 font-mono lowercase">
                {analysis?.cringeClock}% detected. 
                {analysis?.cringeClock && analysis.cringeClock > 50 
                  ? " this slang died three weeks ago. you sound like my dad."
                  : " acceptable freshness."}
              </p>
            </div>
          </div>

          {/* Brand Suicide */}
          <div className="border border-gray-800 p-6 bg-gray-900/20">
             <div className="flex items-center gap-2 mb-4 text-gray-400">
              <Skull size={18} />
              <h3 className="text-sm uppercase tracking-widest">Suicide Risk</h3>
            </div>
            <div className="text-4xl font-bold text-red-500 mb-2">{analysis?.brandSuicideScore}/100</div>
             <p className="text-xs text-gray-500 lowercase">
                {analysis?.brandSuicideScore && analysis.brandSuicideScore > 70 
                  ? "the haters are going to eat this alive. it feels like a hollow corporate cash-grab." 
                  : "you might survive this one."}
             </p>
          </div>
        </div>

        {/* Center Column: Deep Analysis */}
        <div className="md:col-span-8 space-y-8">
          <div className="border-l-2 border-red-600 pl-6 py-2">
            <h2 className="text-2xl font-bold text-gray-200 mb-4">Lethal Errors Detected</h2>
            <ul className="space-y-3">
              {analysis?.lethalErrors.map((error, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-400 text-sm">
                  <span className="text-red-500 mt-1">✕</span>
                  {error}
                </li>
              ))}
            </ul>
          </div>

          <div className="border border-gray-800 p-6">
            <div className="flex items-center gap-2 mb-4 text-gray-400">
              <ShieldAlert size={18} />
              <h3 className="text-sm uppercase tracking-widest">Innocence Check</h3>
            </div>
            {analysis?.innocenceIssues && analysis.innocenceIssues.length > 0 ? (
              <div className="bg-red-950/20 p-4 border border-red-900/30">
                <p className="text-red-400 text-xs font-bold uppercase mb-2">Warning: Hidden Meanings</p>
                <ul className="space-y-2 text-sm text-gray-400">
                  {analysis.innocenceIssues.map((issue, i) => (
                    <li key={i}>• {issue}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-sm text-green-500 flex items-center gap-2">
                <CheckCircle size={14} /> No accidental double-entendres found.
              </p>
            )}
          </div>

          <div className="bg-gray-900 p-8 border border-gray-700">
            <div className="flex items-center gap-2 mb-6">
              <Zap size={18} className="text-yellow-500" />
              <h3 className="text-sm uppercase tracking-widest text-yellow-500">The Fix (Clean Version)</h3>
            </div>
            <div className="font-serif text-lg text-white italic leading-relaxed border-l-4 border-yellow-500 pl-4 py-1">
              "{analysis?.cleanVersion}"
            </div>
            <div className="mt-6 flex gap-4">
              <Button variant="primary" className="text-xs" onClick={() => navigator.clipboard.writeText(analysis?.cleanVersion || '')}>
                Copy to Clipboard
              </Button>
               {/* Share shame feature */}
               <Button variant="secondary" className="text-xs flex items-center gap-2" onClick={handleShareShame}>
                 <Share2 size={14} />
                 Share My Shame
               </Button>
            </div>
          </div>
          
           <div className="border-t border-gray-800 pt-8 mt-8">
              <h3 className="text-sm text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <RefreshCcw size={14} />
                Pivot Options
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {analysis?.pivotOptions.map((opt, i) => (
                  <div key={i} className="bg-gray-900/50 p-4 border border-gray-800 text-xs text-gray-400 hover:border-gray-600 transition-colors cursor-pointer">
                    <span className="block text-red-500 font-bold mb-2">Option 0{i+1}</span>
                    {opt}
                  </div>
                ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );

  const renderGooglePaySheet = () => (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
      {/* Mobile-first bottom sheet style */}
      <div className="bg-white w-full md:w-[400px] md:rounded-t-xl md:rounded-b-xl rounded-t-2xl overflow-hidden shadow-2xl slide-up-animation">
        
        {/* GPay Header */}
        <div className="bg-white p-4 flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-xl font-sans font-medium text-gray-600 tracking-tight">G</span>
            <span className="text-xl font-sans font-medium text-gray-600 tracking-tight">Pay</span>
          </div>
          <button onClick={() => setShowPayModal(false)} className="text-gray-500 hover:text-gray-800">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
             <div>
                <h3 className="text-gray-900 font-bold">NEMESIS RESCUE</h3>
                <p className="text-sm text-gray-500">usmanzahra19@gmail.com</p>
             </div>
             <div className="text-xl font-bold text-gray-900">$5.00</div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-8 border border-gray-100">
             <div className="flex items-center gap-3">
                <CreditCard size={20} className="text-gray-600" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">Visa •••• 4242</div>
                </div>
                <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                   <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                </div>
             </div>
          </div>

          <button 
            onClick={handleConfirmPayment}
            className="w-full bg-black hover:bg-gray-900 text-white font-medium py-4 rounded-full transition-all flex items-center justify-center gap-2 shadow-lg active:scale-[0.98]"
          >
            {isLoading ? "Processing..." : "Pay $5.00"}
          </button>
          
          <div className="text-center mt-4">
             <p className="text-[10px] text-gray-400">Processing by Google Pay</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen text-gray-300 selection:bg-red-900 selection:text-white">
       {/* Global Scanlines via CSS in index.html, this is the React root */}
       {appState === AppState.ONBOARDING && renderOnboarding()}
       {appState === AppState.INPUT && renderInput()}
       {appState === AppState.ANALYZING && renderAnalyzing()}
       {appState === AppState.TEASE && renderTease()}
       {appState === AppState.PAYWALL && renderPaywall()}
       {appState === AppState.DASHBOARD && renderDashboard()}

       {/* Modals */}
       {showPayModal && renderGooglePaySheet()}

       {/* Hidden Shame Card for Image Generation (High Contrast) */}
       <div 
         ref={shameRef}
         className="fixed left-[-9999px] top-0 w-[1080px] h-[1350px] bg-black text-white p-16 flex flex-col justify-between font-mono shame-card"
       >
          <div className="border-b-4 border-red-600 pb-8 flex justify-between items-end">
             <h1 className="text-8xl font-bold tracking-tighter text-white glow-text">NEMESIS</h1>
             <div className="text-right">
                <span className="block text-2xl text-gray-500 uppercase tracking-widest">Vibe Audit</span>
                <span className="text-6xl text-red-600 font-bold glow-red">{analysis?.oofScore}% OOF</span>
             </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center relative my-8 gap-8">
             {/* Roast Quote */}
             <div className="relative z-10 max-w-[90%]">
                <div className="text-9xl text-red-800 opacity-20 absolute -top-16 -left-16 font-serif">"</div>
                <p className="text-5xl font-serif italic text-white leading-tight text-center relative z-10">
                  {analysis?.roast}
                </p>
                <div className="text-9xl text-red-800 opacity-20 absolute -bottom-16 -right-16 font-serif rotate-180">"</div>
             </div>

             {/* Evidence Thumbnail in Card */}
             <div className="relative border-4 border-gray-800 bg-gray-900 p-4 rotate-1 max-w-[60%] max-h-[400px] overflow-hidden shadow-2xl">
                {userContent.image ? (
                    <img 
                      src={`data:${userContent.mimeType};base64,${userContent.image}`} 
                      className="w-full h-full object-cover grayscale contrast-125" 
                      alt="User Evidence"
                    />
                ) : (
                    <div className="p-8 text-2xl font-mono text-gray-400 bg-black border-l-4 border-red-900">
                      "{userContent.text.substring(0, 100)}{userContent.text.length > 100 ? "..." : ""}"
                    </div>
                )}
                <div className="absolute inset-0 border-4 border-red-600 opacity-50 pointer-events-none"></div>
                <div className="absolute bottom-4 right-4 bg-red-600 text-black font-bold text-xl px-4 py-1 uppercase transform -rotate-2">
                   REJECTED
                </div>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-8 pt-12 border-t-4 border-gray-800">
             <div className="bg-red-950/40 p-8 border-l-8 border-red-600">
               <span className="block text-2xl text-gray-400 uppercase tracking-widest mb-2">Cringe Level</span>
               <span className="text-7xl text-white font-bold">{analysis?.cringeClock}%</span>
             </div>
             <div className="bg-red-950/40 p-8 border-l-8 border-red-600">
               <span className="block text-2xl text-gray-400 uppercase tracking-widest mb-2">Suicide Risk</span>
               <span className="text-7xl text-white font-bold">{analysis?.brandSuicideScore}/100</span>
             </div>
          </div>
          
          <div className="mt-12 text-center">
             <div className="inline-block bg-white text-black px-8 py-2 text-2xl font-bold uppercase tracking-widest transform -rotate-2">
                Certified Disaster
             </div>
          </div>
       </div>
    </div>
  );
}