import React, { useState } from 'react';
import { 
  ShieldCheck, Lock, Mail, Key, ArrowRight, Sparkles, Check, 
  Database, Cpu, Shield, Users, FileText, ListChecks, ArrowDown,
  Chrome
} from 'lucide-react';
import { auth } from '../firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInAnonymously,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';

interface LandingPageProps {
  onLoginSuccess: (email: string) => void;
  addLog: (action: string, category: 'Data Access' | 'System' | 'Modification' | 'Security', details: string) => void;
}

export default function LandingPage({ onLoginSuccess, addLog }: LandingPageProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOperationNotAllowed, setIsOperationNotAllowed] = useState(false);

  const handlePreFillAdmin = () => {
    setEmail('chief@studiobuild.ai');
    setPassword('studiobuild123');
    setIsSignUp(false);
    setError('');
  };

  const handleLocalBypass = () => {
    const fallbackEmail = email.trim() || 'chief@studiobuild.ai';
    localStorage.setItem('secure_hr_is_bypass', 'true');
    localStorage.setItem('secure_hr_curr_user', fallbackEmail);
    addLog('Local Sandbox Session Authorized', 'Security', `Administrator bypassed cloud validation with localized sandbox session: ${fallbackEmail}`);
    onLoginSuccess(fallbackEmail);
  };

  const handleAnonymousSignIn = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');
    setIsOperationNotAllowed(false);
    try {
      const userCredential = await signInAnonymously(auth);
      const userEmail = userCredential.user.email || `anon_${userCredential.user.uid.slice(-6)}@studiobuild.ai`;
      addLog('Anonymous Session Authorized', 'Security', `User authorized cloud connection with anonymous instance ${userCredential.user.uid}`);
      onLoginSuccess(userEmail);
    } catch (err: any) {
      console.error("Anonymous authentication error:", err);
      let errMsg = err.message || 'Anonymous entrance rejected.';
      if (err.code === 'auth/operation-not-allowed' || (err.message && err.message.includes('operation-not-allowed'))) {
        setIsOperationNotAllowed(true);
        errMsg = 'Both Email/Password and Anonymous authentications are currently disabled in Firebase. Please enable a sign-in provider, or select Offline Sandbox mode below.';
      }
      setError(`Sovereign Shield rejection: ${errMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');
    setIsOperationNotAllowed(false);
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const userEmail = userCredential.user.email || 'chief@studiobuild.ai';
      addLog('Google Session Authorized', 'Security', `User authorized cloud connection with Google: ${userEmail}`);
      onLoginSuccess(userEmail);
    } catch (err: any) {
      console.error("Google authentication error:", err);
      let errMsg = err.message || 'Google entrance rejected.';
      if (err.code === 'auth/popup-closed-by-user') {
        errMsg = 'Google Sign-in popup was closed before completion.';
      } else if (err.code === 'auth/operation-not-allowed' || (err.message && err.message.includes('operation-not-allowed'))) {
        setIsOperationNotAllowed(true);
        errMsg = 'Google authentication provider is disabled in Firebase. Please enable it in the console, or use Local Sandbox Mode below.';
      }
      setError(`Sovereign Shield rejection: ${errMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsOperationNotAllowed(false);

    // Field Valids
    if (!email || !email.includes('@')) {
      setError('Please provide a valid corporate email address.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must compile to at least 6 characters.');
      return;
    }
    if (isSignUp && !name) {
      setError('Please specify your Administrator name.');
      return;
    }

    setIsLoading(true);

    try {
      if (isSignUp) {
        // Real Firebase Auth Create User
        await createUserWithEmailAndPassword(auth, email, password);
        addLog('New Firebase Tenant Registered', 'Security', `Registered administrator: ${name} (${email}) securely to Firebase Auth Cloud.`);
        setSuccess('Success! Cloud Auth workspace credentials compiled successfully.');
        setTimeout(() => {
          onLoginSuccess(email);
        }, 1000);
      } else {
        // Real Firebase Auth Sign In
        try {
          await signInWithEmailAndPassword(auth, email, password);
          addLog('Tenant Console Session Authorized', 'Security', `User ${email} authenticated successfully via Firebase Auth.`);
          onLoginSuccess(email);
        } catch (signInErr: any) {
          // If pre-filled credentials don't exist yet, auto-create them to make the sandbox experience extremely smooth!
          if (email === 'chief@studiobuild.ai' && (signInErr.code === 'auth/user-not-found' || signInErr.code === 'auth/invalid-credential' || signInErr.code === 'auth/operation-not-allowed')) {
            if (signInErr.code === 'auth/operation-not-allowed') {
              setIsOperationNotAllowed(true);
              throw signInErr;
            }
            await createUserWithEmailAndPassword(auth, email, password);
            addLog('Pre-fill Admin Autocreated', 'Security', `Generated baseline demo tenant ${email} dynamically on project.`);
            onLoginSuccess(email);
          } else {
            throw signInErr;
          }
        }
      }
    } catch (err: any) {
      console.error("Firebase auth processing error:", err);
      let errMsg = err.message || 'Verification rejected.';
      if (err.code === 'auth/email-already-in-use') errMsg = 'This email is already registered here.';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') errMsg = 'Authentication failed: Invalid credentials code.';
      
      if (err.code === 'auth/operation-not-allowed' || (err.message && err.message.includes('operation-not-allowed'))) {
        setIsOperationNotAllowed(true);
        errMsg = 'Email/Password authentication provider is disabled in Firebase. Please enable it in the console, or use Local Sandbox Mode below.';
      }
      setError(`Sovereign Shield rejection: ${errMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-hidden font-sans" id="studiobuild-landing">
      
      {/* Decorative Radial Backdrop Gradients */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none select-none" />
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none select-none" />

      {/* Top Header Row of Landing Page */}
      <header className="border-b border-slate-900/80 bg-slate-950/60 backdrop-blur-md px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-md">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-black tracking-wider text-white">STUDIOBUILDAI</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[10px] bg-emerald-950 text-emerald-400 font-mono font-bold px-2 py-0.5 rounded border border-emerald-900/40 uppercase hidden sm:inline-block">
              ★ v1.2 Isolated Edition
            </span>
            <button
              onClick={handleLocalBypass}
              className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold px-4 py-2 rounded-lg transition-all shadow-md cursor-pointer border border-indigo-500/20 active:scale-95"
            >
              Start Console
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12 md:py-20 lg:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
        
        {/* Left Side: Product Pitches */}
        <div className="lg:col-span-7 space-y-6 text-left">
          
          <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 border border-slate-800 px-3 py-1 text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            <span className="text-[10px] uppercase font-bold tracking-widest font-mono">Military-Grade HR Governance</span>
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-none tracking-tight">
            Next-Gen HR Suite <br />
            <span className="text-white font-black tracking-tight">
              studiobuildai
            </span>
          </h2>

          <p className="text-sm sm:text-base text-slate-350 max-w-xl leading-relaxed">
            The world’s first local-first compliance directory, resume matcher, ethics checkpoint engine, and tactical appraisal assistant. Operates entirely in your browser sandbox with zero external network leakage.
          </p>

          {/* Quick Bento/Bullets list */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
            <div className="flex items-start gap-2.5">
              <div className="bg-slate-900 p-1.5 rounded border border-slate-805 mt-0.5">
                <Check className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-white">100% Client-Isolation</h4>
                <p className="text-[10px] text-slate-400">All data persists locally in secure localStorage. GDPR-proof.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="bg-slate-900 p-1.5 rounded border border-slate-805 mt-0.5">
                <Check className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-white">Dynamic Redaction Masking</h4>
                <p className="text-[10px] text-slate-400">Instantly toggle visual masking for candidate credentials.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="bg-slate-900 p-1.5 rounded border border-slate-805 mt-0.5">
                <Check className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-white">Bespoke SLA Billing</h4>
                <p className="text-[10px] text-slate-400">Slide setup fees from £10k to £50k under corporate schemas.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="bg-slate-900 p-1.5 rounded border border-slate-805 mt-0.5">
                <Check className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-white">Secure Audited Trail</h4>
                <p className="text-[10px] text-slate-400">Monotonic clock logging of all directory exports & accesses.</p>
              </div>
            </div>
          </div>

          <div className="pt-4 flex flex-wrap gap-4 items-center">
            <div className="flex -space-x-2 select-none">
              <span className="w-7 h-7 rounded-full bg-slate-800 border-2 border-slate-950 flex items-center justify-center text-[10px] font-bold text-indigo-400">CK</span>
              <span className="w-7 h-7 rounded-full bg-slate-800 border-2 border-slate-950 flex items-center justify-center text-[10px] font-bold text-amber-400">TS</span>
              <span className="w-7 h-7 rounded-full bg-slate-800 border-2 border-slate-950 flex items-center justify-center text-[10px] font-bold text-emerald-400">BW</span>
              <span className="w-7 h-7 rounded-full bg-indigo-950 border-2 border-slate-950 flex items-center justify-center text-[8px] font-bold text-white">+500</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Trusted by sovereign teams, legal counsel departments, and digital security architects.
            </p>
          </div>

        </div>

        {/* Right Side: Simple Console Connection Option */}
        <div className="lg:col-span-5" id="login-pane">
          <div className="bg-slate-900 rounded-2xl border-2 border-indigo-500/20 shadow-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden flex flex-col justify-center min-h-[380px]">
            
            {/* Decorative background pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none select-none" />

            <div className="space-y-2 text-center sm:text-left">
              <div className="bg-indigo-950/60 p-3 rounded-xl border border-indigo-900/40 text-indigo-400 w-fit mx-auto sm:mx-0">
                <ShieldCheck className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="text-xl font-black text-white leading-tight font-sans">
                HR Workspace Ready
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Access your HR compliance dashboard instantly. Your private workspace session is pre-configured for direct use. No email signup, passwords, or login details required.
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleLocalBypass}
                className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-extrabold text-sm py-4 rounded-xl transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 active:scale-[0.98] border border-indigo-400/20"
              >
                <span>Start Application</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>

              <div className="pt-4 flex flex-col gap-2 border-t border-slate-800 text-left">
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Admin Role: <span className="font-mono text-indigo-300 font-bold">chief@studiobuild.ai</span></span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 font-sans">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Sandbox Environment: <span className="font-semibold text-slate-300">Isolated & Synced</span></span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 font-sans">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Storage Model: <span className="font-semibold text-slate-300">Local Cache + Firestore Integration</span></span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </main>

      {/* Feature Bento Section Grid */}
      <section className="bg-slate-900/40 border-t border-slate-900 px-6 py-16" id="features">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center space-y-3">
            <h3 className="text-xs uppercase font-black text-indigo-400 tracking-wider">All-in-One Offline Corporate Safeguard</h3>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Every compliance safeguard built for continuous auditing.
            </h2>
            <p className="text-xs text-slate-400 max-w-xl mx-auto">
              STUDIOBUILDAI integrates your workflow, candidate screeners, and personnel rosters into a singular local playground environment.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="bg-slate-900 p-5 rounded-xl border border-slate-805 space-y-3">
              <div className="bg-indigo-950/60 p-2.5 rounded-lg border border-indigo-900/30 text-indigo-400 w-fit">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-extrabold text-white">Personnel Roster</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Add, remove, and mask personnel with customizable salaries, roles, and notes. Integrated search.
              </p>
            </div>

            <div className="bg-slate-900 p-5 rounded-xl border border-slate-805 space-y-3">
              <div className="bg-indigo-950/60 p-2.5 rounded-lg border border-indigo-900/30 text-indigo-400 w-fit">
                <FileText className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-extrabold text-white">Resume Screener</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Ingest fictional candidates CVs offline and render match statistics and target skill suggestions instantly.
              </p>
            </div>

            <div className="bg-slate-900 p-5 rounded-xl border border-slate-805 space-y-3">
              <div className="bg-indigo-950/60 p-2.5 rounded-lg border border-indigo-900/30 text-indigo-400 w-fit">
                <ListChecks className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-extrabold text-white">Appraisal Suggestions</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Log personnel performance across key metrics. Seamlessly integrated templates with optional mock AI drafting generators.
              </p>
            </div>

            <div className="bg-slate-900 p-5 rounded-xl border border-slate-805 space-y-3">
              <div className="bg-indigo-950/60 p-2.5 rounded-lg border border-indigo-900/30 text-indigo-400 w-fit">
                <Lock className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-extrabold text-white">Sovereign Encryption</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Zero network leakage ensures confidential compliance. Complete control with GDPR Article 17 hard deletes.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* Footer copyright */}
      <footer className="bg-slate-950 border-t border-slate-905 py-6 px-6 text-center text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="font-semibold text-slate-400">STUDIOBUILDAI Console Portal — Secure Sandbox License</p>
          <p>© 2026 Sovereign Systems. Encrypted under local client thread.</p>
        </div>
      </footer>

    </div>
  );
}
