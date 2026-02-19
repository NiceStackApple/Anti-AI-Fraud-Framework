import React, { useState } from 'react';
import { Search, ShieldCheck, ShieldAlert, Eye, EyeOff, Lock, UserCheck, AlertTriangle, KeyRound, X } from 'lucide-react';
import { DeviceProfile, VerificationResult } from '../types';
import { verifyAssetRequest, verifySecondaryAuth } from '../services/cryptoService';

interface Props {
  currentDevice: DeviceProfile;
  prefillSN?: string;
}

const VerificationPanel: React.FC<Props> = ({ currentDevice, prefillSN }) => {
  const [inputSN, setInputSN] = useState(prefillSN || '');
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(false);

  // Secondary Auth State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPin, setAuthPin] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Update input if prefill changes
  React.useEffect(() => {
    if(prefillSN) setInputSN(prefillSN);
  }, [prefillSN]);

  const handleVerify = () => {
    if (!inputSN.trim()) return;
    setLoading(true);
    setResult(null);
    setAuthError('');

    // Simulate network latency
    setTimeout(() => {
      const res = verifyAssetRequest(inputSN, currentDevice.id);
      setResult(res);
      setLoading(false);
    }, 1000);
  };

  const handleSecondaryAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    try {
      // Logic for Emergency Recovery
      // Pass the SN currently displayed and the input credentials
      const currentSN = result?.data.metadata.serialNumber || inputSN;
      const newResult = await verifySecondaryAuth(currentSN, authEmail, authPin);
      
      // Update UI with the Full Access result
      setResult(newResult);
      setIsAuthModalOpen(false); // Close modal
      setAuthEmail('');
      setAuthPin('');
    } catch (err) {
      setAuthError('Authentication failed. Invalid email or PIN.');
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-2xl h-full flex flex-col relative">
      <div className="p-6 border-b border-slate-800 bg-slate-900/50">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Search className="w-5 h-5 text-purple-400" />
          Public Verification Portal
        </h2>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        {/* Search Bar */}
        <div className="relative mb-8">
          <input 
            type="text" 
            value={inputSN}
            onChange={(e) => setInputSN(e.target.value)}
            placeholder="Enter Image Serial Number (e.g., V1-2b89...)"
            className="w-full bg-slate-950 border border-slate-700 text-white p-4 pl-12 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none font-mono text-sm transition-all shadow-inner"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
          <button 
            onClick={handleVerify}
            disabled={loading || !inputSN}
            className="absolute right-2 top-2 bottom-2 bg-purple-600 hover:bg-purple-500 text-white px-6 rounded-md text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Verifying...' : 'Check Status'}
          </button>
        </div>

        {/* Results Area */}
        {!result && !loading && (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-600 border-2 border-dashed border-slate-800 rounded-xl p-8">
            <ShieldCheck className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-sm">Enter a Serial Number to verify authenticity and provenance.</p>
          </div>
        )}

        {result && (
          <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6">
            
            {/* Status Header */}
            <div className={`p-4 rounded-lg flex items-center gap-4 border ${result.isAuthentic ? 'bg-green-950/30 border-green-900' : 'bg-red-950/30 border-red-900'}`}>
              <div className={`p-3 rounded-full ${result.isAuthentic ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'}`}>
                {result.isAuthentic ? <ShieldCheck className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
              </div>
              <div>
                <h3 className={`font-bold text-lg ${result.isAuthentic ? 'text-green-400' : 'text-red-400'}`}>
                  {result.isAuthentic ? 'Authenticity Verified' : 'Verification Failed'}
                </h3>
                <p className="text-slate-400 text-sm">{result.message}</p>
              </div>
            </div>

            {result.isAuthentic && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Image Preview with Privacy Blur Logic */}
                <div className="bg-black rounded-lg border border-slate-700 overflow-hidden relative group">
                  <div className="absolute top-3 left-3 z-10">
                    <span className={`px-2 py-1 text-xs font-bold rounded shadow-lg uppercase tracking-wider ${result.accessLevel === 'OWNER' ? 'bg-green-500 text-black' : 'bg-yellow-500 text-black'}`}>
                       {result.accessLevel === 'OWNER' ? 'Full Access' : 'Public View'}
                    </span>
                  </div>
                  
                  <img 
                    src={result.data.imageUrl} 
                    alt="Asset" 
                    className={`w-full aspect-video object-cover transition-all duration-700 ${result.accessLevel === 'PUBLIC' ? 'blur-md scale-105 opacity-80' : ''}`}
                  />
                  
                  {/* Overlay for Public View */}
                  {result.accessLevel === 'PUBLIC' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <div className="bg-black/80 backdrop-blur-sm p-4 rounded-xl border border-slate-700 flex flex-col items-center text-center">
                        <EyeOff className="w-8 h-8 text-yellow-500 mb-2" />
                        <p className="text-yellow-400 font-bold text-sm">Image Obfuscated</p>
                        <p className="text-slate-400 text-xs mt-1 max-w-[200px]">
                           Visual content hidden to protect owner privacy.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Metadata Panel */}
                <div className="bg-slate-800 rounded-lg p-5 space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-700 pb-3">
                    <h4 className="text-white font-semibold flex items-center gap-2">
                       <Lock className="w-4 h-4 text-slate-400" />
                       Digital Forensics
                    </h4>
                    {result.accessLevel === 'OWNER' && (
                       <span className="text-green-400 text-xs flex items-center gap-1">
                          <UserCheck className="w-3 h-3" /> Owner Verified
                       </span>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="group">
                       <label className="text-xs text-slate-500 uppercase font-mono">Serial Number</label>
                       <div className="text-xs text-slate-300 font-mono break-all">{result.data.metadata.serialNumber}</div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                       <div>
                          <label className="text-xs text-slate-500 uppercase font-mono">Device Model</label>
                          <div className={`text-sm ${result.data.metadata.deviceModel.includes('REDACTED') ? 'text-yellow-500/70 italic' : 'text-white'}`}>
                             {result.data.metadata.deviceModel}
                          </div>
                       </div>
                       <div>
                          <label className="text-xs text-slate-500 uppercase font-mono">Location</label>
                          <div className={`text-sm ${result.data.metadata.location.includes('REDACTED') ? 'text-yellow-500/70 italic' : 'text-white'}`}>
                             {result.data.metadata.location}
                          </div>
                       </div>
                    </div>

                    <div>
                       <label className="text-xs text-slate-500 uppercase font-mono">Timestamp</label>
                       <div className="text-sm text-white">{result.data.metadata.timestamp}</div>
                    </div>
                  </div>

                  {/* Warning Box & Action Button for Public View */}
                  {result.accessLevel === 'PUBLIC' && (
                    <div className="mt-4 bg-yellow-900/20 border border-yellow-800/50 p-3 rounded flex flex-col gap-3">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-yellow-200/80">
                          <strong>Privacy Shield Active:</strong> You are accessing this record from a device ({currentDevice.model}) that does not match the originator. Sensitive metadata and full visual fidelity are restricted.
                        </p>
                      </div>
                      
                      {/* Emergency Access Action */}
                      <button 
                        onClick={() => setIsAuthModalOpen(true)}
                        className="w-full py-2 bg-yellow-600/20 hover:bg-yellow-600/30 border border-yellow-700/50 text-yellow-400 text-xs font-bold uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-2"
                      >
                        <KeyRound className="w-3 h-3" />
                        Verify User (Emergency Access)
                      </button>
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>
        )}
      </div>

      {/* Emergency Auth Modal */}
      {isAuthModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
           <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
             
             <div className="p-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
                <h3 className="text-white font-bold flex items-center gap-2">
                  <Lock className="w-4 h-4 text-cyan-400" />
                  Secondary Authentication
                </h3>
                <button onClick={() => setIsAuthModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
             </div>

             <form onSubmit={handleSecondaryAuth} className="p-6 space-y-4">
                <p className="text-xs text-slate-400">
                  Enter the recovery credentials linked to this asset to bypass the device hardware check.
                </p>

                <div className="space-y-1">
                  <label className="text-xs text-slate-500 uppercase font-mono">Recovery Email</label>
                  <input 
                    type="email" 
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-white p-2 rounded focus:border-cyan-500 outline-none text-sm"
                    placeholder="owner@device.com"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-500 uppercase font-mono">Recovery PIN</label>
                  <input 
                    type="password" 
                    required
                    value={authPin}
                    onChange={(e) => setAuthPin(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-white p-2 rounded focus:border-cyan-500 outline-none text-sm font-mono tracking-widest"
                    placeholder="••••"
                    maxLength={4}
                  />
                </div>

                {authError && (
                  <div className="p-2 bg-red-900/20 border border-red-900/50 rounded text-red-400 text-xs flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4" />
                    {authError}
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded transition-colors disabled:opacity-50 text-sm"
                >
                  {authLoading ? 'Verifying Credentials...' : 'Unlock Evidence'}
                </button>
             </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default VerificationPanel;