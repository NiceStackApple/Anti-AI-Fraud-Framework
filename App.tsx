import React, { useState } from 'react';
import { Shield, Lock, FileCheck } from 'lucide-react';
import DeviceSelector from './components/DeviceSelector';
import CapturePanel from './components/CapturePanel';
import VerificationPanel from './components/VerificationPanel';
import { DeviceProfile } from './types';
import { SIMULATED_DEVICES } from './constants';

const App: React.FC = () => {
  // Global State
  const [currentDevice, setCurrentDevice] = useState<DeviceProfile>(SIMULATED_DEVICES[0]);
  const [activeTab, setActiveTab] = useState<'CAPTURE' | 'VERIFY'>('CAPTURE');
  
  // State to easily verify what we just captured
  const [lastGeneratedSN, setLastGeneratedSN] = useState<string>('');

  const handleAssetCreated = (sn: string) => {
    setLastGeneratedSN(sn);
    // Optional: Auto switch to verify to show the flow? 
    // Let's keep manual to let user explore device switching.
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* 1. Global Device Simulation Header */}
      <DeviceSelector 
        currentDevice={currentDevice}
        onDeviceChange={setCurrentDevice}
      />

      {/* 2. Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-8">
        
        {/* Header / Intro */}
        <div className="mb-8 text-center sm:text-left">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 mb-2">
            Anti-AI Fraud Framework <span className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded border border-slate-700 ml-2 align-middle">MVP</span>
          </h1>
          <p className="text-slate-400 max-w-2xl">
            Simulate the content provenance lifecycle. Generate cryptographically bound serial numbers for images and verify them using privacy-preserving protocols.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 bg-slate-900/50 p-1 rounded-lg border border-slate-800 w-fit mb-6 mx-auto sm:mx-0">
          <button
            onClick={() => setActiveTab('CAPTURE')}
            className={`flex items-center gap-2 px-6 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'CAPTURE' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/50' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <Lock className="w-4 h-4" />
            Capture Layer
          </button>
          <button
            onClick={() => setActiveTab('VERIFY')}
            className={`flex items-center gap-2 px-6 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'VERIFY' ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <FileCheck className="w-4 h-4" />
            Verification Portal
          </button>
        </div>

        {/* Dynamic View */}
        <div className="relative">
          {activeTab === 'CAPTURE' ? (
            <div className="animate-in fade-in slide-in-from-left-4 duration-300">
               <CapturePanel 
                 currentDevice={currentDevice} 
                 onAssetCreated={handleAssetCreated}
               />
               
               {/* Helper Hint */}
               <div className="mt-4 p-4 border border-blue-900/50 bg-blue-950/20 rounded-lg text-sm text-blue-200/80">
                 <p className="font-semibold mb-1">Testing Instructions:</p>
                 <ul className="list-disc pl-5 space-y-1 opacity-80">
                   <li>Select a device from the top bar (e.g., Pixel 8 Pro).</li>
                   <li>Click "Capture" to generate a hash.</li>
                   <li>Copy the generated Serial Number.</li>
                   <li>Switch to the <strong>Verification Portal</strong> tab.</li>
                 </ul>
               </div>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <VerificationPanel 
                currentDevice={currentDevice}
                prefillSN={lastGeneratedSN}
              />
              
              {/* Privacy Logic Helper */}
              <div className="mt-4 p-4 border border-purple-900/50 bg-purple-950/20 rounded-lg text-sm text-purple-200/80">
                 <p className="font-semibold mb-1">Privacy Logic Simulation:</p>
                 <ul className="list-disc pl-5 space-y-1 opacity-80">
                   <li><strong>Scenario A (Owner):</strong> Ensure the "Current Device" (top bar) matches the device used to capture the image. You will see full data.</li>
                   <li><strong>Scenario B (Public):</strong> Switch the "Current Device" to a different model. Verify the same Serial Number. You will see redacted data and a blurred image.</li>
                 </ul>
               </div>
            </div>
          )}
        </div>

      </main>

      <footer className="border-t border-slate-900 p-6 text-center text-slate-600 text-xs">
        &copy; 2024 International Anti-AI Fraud Framework Prototype. Privacy by Design implemented.
      </footer>
    </div>
  );
};

export default App;