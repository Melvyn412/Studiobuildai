import React, { useState } from 'react';
import { WhitelabelConfig } from '../types';
import { 
  Shield, Globe, Briefcase, Cpu, Terminal, Users, 
  Sparkles, Check, Server, RefreshCw, AlertCircle, Link, ArrowRight
} from 'lucide-react';

interface WhitelabelBrandingProps {
  config: WhitelabelConfig;
  setConfig: (config: WhitelabelConfig) => void;
  activeTier: string;
  addLog: (action: string, category: 'Data Access' | 'System' | 'Modification' | 'Security', details: string) => void;
  onUpgradePrompt: () => void;
}

export default function WhitelabelBranding({
  config,
  setConfig,
  activeTier,
  addLog,
  onUpgradePrompt
}: WhitelabelBrandingProps) {
  const [domainInput, setDomainInput] = useState(config.customDomain);
  const [companyNameInput, setCompanyNameInput] = useState(config.companyName);
  const [selectedTheme, setSelectedTheme] = useState(config.theme);
  const [selectedIcon, setSelectedIcon] = useState(config.logoIcon);
  
  // Simulation States
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationPassed, setVerificationPassed] = useState(config.isWhitelabelActive);
  const [successMsg, setSuccessMsg] = useState('');

  const isPremiumUnlocked = activeTier === 'CustomAI';

  const iconsList = [
    { key: 'shield', icon: Shield, label: 'Secure Shield' },
    { key: 'globe', icon: Globe, label: 'Global Network' },
    { key: 'briefcase', icon: Briefcase, label: 'Enterprise Hub' },
    { key: 'cpu', icon: Cpu, label: 'Quantum Processor' },
    { key: 'terminal', icon: Terminal, label: 'Dev Console' },
    { key: 'users', icon: Users, label: 'Workforce Core' },
  ] as const;

  const themesList = [
    { key: 'indigo', name: 'Midnight Indigo', class: 'bg-indigo-600', text: 'text-indigo-400' },
    { key: 'emerald', name: 'Emerald Security', class: 'bg-emerald-600', text: 'text-emerald-400' },
    { key: 'rose', name: 'Crimson Defense', class: 'bg-rose-600', text: 'text-rose-400' },
    { key: 'amber', name: 'Amber Shield', class: 'bg-amber-600', text: 'text-amber-400' },
    { key: 'violet', name: 'Violet Sovereign', class: 'bg-violet-600', text: 'text-violet-400' },
    { key: 'cyan', name: 'Cyber Cyan', class: 'bg-cyan-600', text: 'text-cyan-400' },
  ] as const;

  const handleVerifyDomain = () => {
    if (!domainInput.includes('.') || domainInput.length < 5) {
      alert('Please enter a valid subdomain format (e.g. hr.yourcompany.com)');
      return;
    }

    setIsVerifying(true);
    addLog('DNS CNAME Lookup Initiated', 'System', `Resolving records for whitelabel domain: ${domainInput}`);
    
    setTimeout(() => {
      setIsVerifying(false);
      setVerificationPassed(true);
      setSuccessMsg(`CNAME verified! '${domainInput}' is successfully pointed to 'domains.studiobuild.ai'.`);
      addLog('DNS Verification Succeeded', 'Security', `CNAME validated successfully. Custom host ${domainInput} bound to whitelabel core.`);
    }, 1500);
  };

  const handleApplyBranding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPremiumUnlocked) {
      onUpgradePrompt();
      return;
    }

    const updatedConfig: WhitelabelConfig = {
      companyName: companyNameInput.trim() || 'STUDIOBUILDAI',
      theme: selectedTheme,
      customDomain: domainInput.trim() || 'hr.studiobuild.ai',
      logoIcon: selectedIcon,
      isWhitelabelActive: verificationPassed
    };

    setConfig(updatedConfig);
    setSuccessMsg('Branding configurations pushed and activated successfully!');
    addLog('Custom Branding Profile Applied', 'Modification', `Applied brand: "${updatedConfig.companyName}" with theme: ${updatedConfig.theme} on Whitelabel domain: ${updatedConfig.customDomain}`);
    
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const IconComponent = iconsList.find(i => i.key === selectedIcon)?.icon || Shield;

  return (
    <div className="space-y-6" id="whitelabel-panel">
      
      {/* Tab Banner */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-1 z-10">
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            Elite Corporate Whitelabel Console
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Unify your company's personnel systems under your custom domain, corporate colors, and visual branding. Fully isolate public indicators for a dedicated user-tenant experience.
          </p>
        </div>
        <div className="flex items-center gap-3 z-10 shrink-0">
          {isPremiumUnlocked ? (
            <span className="bg-emerald-950 text-emerald-400 font-mono text-[10px] font-black px-2.5 py-1 rounded border border-emerald-900/40 uppercase tracking-wider flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Feature Unlocked
            </span>
          ) : (
            <button
              onClick={onUpgradePrompt}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-[11px] px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 active:scale-95 cursor-pointer shadow-md"
            >
              Unlock Whitelabeling
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {!isPremiumUnlocked && (
        <div className="bg-indigo-950/20 border border-indigo-900/40 p-5 rounded-xl text-left space-y-3">
          <div className="flex items-center gap-2 text-indigo-400 font-extrabold text-sm">
            <AlertCircle className="w-5 h-5" />
            Premium Feature Gate • Custom AI Deployment Whitelabel Customization
          </div>
          <p className="text-xs text-slate-350 leading-relaxed max-w-3xl">
            Whitelabel capabilities are reserved exclusively for clients subscribed to our **Custom AI Deployment** tier. However, as an Administrator, you can fully test and preview these configuration parameters in this live session before provisioning!
          </p>
          <button
            onClick={onUpgradePrompt}
            className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2 rounded-lg transition-all"
          >
            Go to Billing & Upgrade Plans
          </button>
        </div>
      )}

      {/* Main Interactive Work Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
        
        {/* Left Side: Branding Configuration */}
        <form onSubmit={handleApplyBranding} className="lg:col-span-7 space-y-6">
          
          {/* Identity Parameters Box */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 space-y-4">
            <h3 className="text-xs font-black uppercase text-indigo-400 tracking-wider">
              1. Visual Brand Parameters
            </h3>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Corporate App Name
              </label>
              <input
                type="text"
                placeholder="e.g. Acme Workforce Hub"
                value={companyNameInput}
                onChange={(e) => setCompanyNameInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg py-2 px-3 text-xs text-white placeholder-slate-600 focus:outline-none transition-all"
              />
              <p className="text-[10px] text-slate-550">
                This display label replaces "STUDIOBUILDAI" throughout the header, tab bars, and page titles.
              </p>
            </div>

            {/* Logo Icon Choice */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Custom Identity Emblem
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {iconsList.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setSelectedIcon(item.key)}
                      className={`p-3 rounded-lg border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                        selectedIcon === item.key
                        ? 'bg-indigo-950/40 border-indigo-500 text-indigo-300'
                        : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200'
                      }`}
                      title={item.label}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-[8px] font-mono tracking-tight leading-none block">
                        {item.key}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Theme Scheme Choice */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Dynamic Theme Palette
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {themesList.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setSelectedTheme(t.key)}
                    className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer flex items-center gap-2 ${
                      selectedTheme === t.key
                      ? 'bg-slate-950 border-indigo-500 text-white'
                      : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className={`h-3.5 w-3.5 rounded-full ${t.class} block shrink-0`} />
                    <span className="text-[11px] font-semibold tracking-tight">
                      {t.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Whitelabel Domain Parameters Box */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 space-y-4">
            <h3 className="text-xs font-black uppercase text-indigo-400 tracking-wider flex items-center gap-1">
              <Globe className="w-4 h-4" />
              2. Custom Domain Verification
            </h3>

            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Target Subdomain / Host
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <Link className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="text"
                    placeholder="hr.acme-corp.com"
                    value={domainInput}
                    onChange={(e) => {
                      setDomainInput(e.target.value);
                      setVerificationPassed(false); // require re-verify
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 pl-9 pr-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all font-mono"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleVerifyDomain}
                  disabled={isVerifying}
                  className="bg-slate-950 hover:bg-slate-800 text-indigo-400 border border-slate-805 text-xs px-4 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isVerifying ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    'Verify DNS'
                  )}
                </button>
              </div>
            </div>

            {/* DNS Setup Guide Card */}
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-850 space-y-2">
              <span className="text-[9px] uppercase font-bold text-slate-400 font-mono tracking-wider flex items-center gap-1">
                <Server className="w-3 h-3 text-indigo-400" />
                Required DNS configuration
              </span>
              <p className="text-[10px] text-slate-400 leading-normal">
                To bind this portal to your custom domain, navigate to your registrar (e.g., Cloudflare, GoDaddy) and add the following record:
              </p>
              <div className="bg-slate-900 p-2.5 rounded border border-slate-800 font-mono text-[9px] text-slate-300 space-y-1">
                <p><strong className="text-indigo-400">Type:</strong> CNAME</p>
                <p><strong className="text-indigo-400">Name:</strong> {domainInput.split('.')[0] || 'hr'}</p>
                <p><strong className="text-indigo-400">Content:</strong> domains.studiobuild.ai</p>
                <p><strong className="text-indigo-400">TTL:</strong> Automatic / 3600</p>
              </div>

              {verificationPassed ? (
                <div className="text-[10px] text-emerald-400 font-bold flex items-center gap-1.5 pt-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 block" />
                  CNAME validation passed successfully. Traffic routing is enabled.
                </div>
              ) : (
                <div className="text-[10px] text-amber-500 font-medium flex items-center gap-1.5 pt-1">
                  <span className="h-2 w-2 rounded-full bg-amber-500 block" />
                  Awaiting DNS records lookup propagation. Click 'Verify DNS'.
                </div>
              )}
            </div>
          </div>

          {/* Form Submit Button */}
          <div className="flex items-center justify-between gap-4">
            <button
              type="submit"
              className={`flex-1 py-3 text-center text-xs font-extrabold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer border ${
                isPremiumUnlocked
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500/20 active:scale-95 shadow-md shadow-indigo-500/10'
                : 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'
              }`}
            >
              Apply Whitelabel Configuration
              <Check className="w-4 h-4" />
            </button>
          </div>

        </form>

        {/* Right Side: Visual Sandbox Whitelabel Preview */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 space-y-4 relative overflow-hidden flex flex-col justify-between min-h-[350px]">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[9px] uppercase font-bold text-indigo-400 font-mono tracking-wider">
                  🖥️ Live Layout Emulator
                </span>
                <span className="text-[8px] text-emerald-400 bg-emerald-950 px-1.5 py-0.2 rounded border border-emerald-900/40">
                  Preview State
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                Observe how the interface instantly adapts to your custom visual specifications.
              </p>
            </div>

            {/* Mini Dashboard Emulator Header */}
            <div className="bg-slate-950 rounded-lg p-3.5 border border-slate-850 space-y-3 text-left">
              <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded text-white ${themesList.find(t => t.key === selectedTheme)?.class || 'bg-indigo-600'}`}>
                    <IconComponent className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black tracking-tight text-white uppercase">
                      {companyNameInput.trim() || 'STUDIOBUILDAI'}
                    </h4>
                    <p className="text-[8px] text-slate-500 leading-none">Console Executive Console</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-[8px] px-1.5 py-0.2 rounded font-mono ${themesList.find(t => t.key === selectedTheme)?.text || 'text-indigo-400'} bg-slate-900 border border-slate-800`}>
                    ONLINE
                  </span>
                </div>
              </div>

              {/* Subdomain representation */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[9px] text-slate-400 font-mono">
                  <span>Routing Domain:</span>
                  <span className="text-slate-300 font-bold">{domainInput || 'hr.yourcompany.com'}</span>
                </div>
                <div className="flex justify-between items-center text-[9px] text-slate-400 font-mono">
                  <span>SSL Security:</span>
                  <span className="text-emerald-400 font-semibold">HTTPS 256-Bit SSL Active</span>
                </div>
              </div>

              {/* Sample Visual buttons */}
              <div className="pt-2 flex gap-1.5">
                <div className={`flex-1 py-1.5 rounded text-center text-[9px] text-white font-bold font-sans ${themesList.find(t => t.key === selectedTheme)?.class || 'bg-indigo-600'}`}>
                  Personnel
                </div>
                <div className="flex-1 py-1.5 rounded text-center text-[9px] text-slate-400 bg-slate-900 border border-slate-800 font-semibold">
                  Screener
                </div>
                <div className="flex-1 py-1.5 rounded text-center text-[9px] text-slate-400 bg-slate-900 border border-slate-800 font-semibold">
                  Assistant
                </div>
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 text-center space-y-2">
              <p className="text-[10px] text-slate-500 italic">
                {companyNameInput.trim() || 'STUDIOBUILDAI'} Client-Specific Whitelabel Instance.
              </p>
              {verificationPassed && (
                <div className="inline-flex items-center gap-1 bg-emerald-950 text-emerald-400 text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-emerald-900/50">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 block" />
                  Strict Whitelabel Domain Active
                </div>
              )}
            </div>

          </div>

          {successMsg && (
            <div className="bg-emerald-950/40 text-emerald-300 border border-emerald-900/50 p-3.5 rounded-xl text-xs text-left leading-relaxed flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
