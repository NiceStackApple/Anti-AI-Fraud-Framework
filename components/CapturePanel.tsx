import React, { useState } from 'react';
import { Camera, RefreshCw, Shield, Lock, KeyRound } from 'lucide-react';
import { DeviceProfile, HashingAlgo, CapturedAsset } from '../types';
import { generateSerialNumber, registerAsset } from '../services/cryptoService';
import { MOCK_IMAGE_URL } from '../constants';

interface Props {
  currentDevice: DeviceProfile;
  onAssetCreated: (sn: string) => void;
}

const CapturePanel: React.FC<Props> = ({ currentDevice, onAssetCreated }) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [algo, setAlgo] = useState<HashingAlgo>(HashingAlgo.V1_SIMPLE);
  const [lastCapturedAsset, setLastCapturedAsset] = useState<CapturedAsset | null>(null);

  const handleCapture = async () => {
    setIsCapturing(true);
    setLastCapturedAsset(null);

    // Simulate Network/Processing Delay
    setTimeout(async () => {
      const timestamp = Date.now();
      // In reality, this would be a hash of the binary image data
      const mockImageSignature = "binary_checksum_x8s7_mock"; 

      const serialNumber = await generateSerialNumber(
        currentDevice,
        mockImageSignature,
        timestamp,
        algo
      );

      // Generate random mock recovery PIN for this session
      const mockPin = Math.floor(1000 + Math.random() * 9000).toString();
      const mockEmail = `owner@${currentDevice.model.replace(/\s/g, '').toLowerCase()}.com`;

      const newAsset: CapturedAsset = {
        serialNumber,
        imageDataUrl: `${MOCK_IMAGE_URL}?seed=${serialNumber}`, // Unique-ish image
        timestamp,
        ownerDeviceId: currentDevice.id,
        deviceModel: currentDevice.model,
        algoVersion: algo,
        location: "34.0522° N, 118.2437° W", // Hardcoded mock location
        recoveryEmail: mockEmail,
        recoveryPin: mockPin
      };

      registerAsset(newAsset);
      setLastCapturedAsset(newAsset);
      onAssetCreated(serialNumber);
      setIsCapturing(false);
    }, 1500);
  };

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-2xl">
      <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Camera className="w-5 h-5 text-cyan-400" />
          Acquisition Layer
        </h2>
        <div className="flex gap-2">
           <span className="px-2 py-1 rounded bg-slate-800 text-xs text-slate-400 border border-slate-700">
             Mode: Secure Capture
           </span>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Viewfinder / Image */}
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden border border-slate-700 group">
          <img 
            src={lastCapturedAsset ? lastCapturedAsset.imageDataUrl : MOCK_IMAGE_URL} 
            alt="Viewfinder" 
            className={`w-full h-full object-cover transition-opacity duration-300 ${isCapturing ? 'opacity-50' : 'opacity-100'}`}
          />
          
          {/* Overlay UI */}
          <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none">
             <div className="flex justify-between items-start">
               <span className="text-xs font-mono text-green-400 bg-black/60 px-2 py-1 rounded">
                 REC: {currentDevice.model.toUpperCase()}
               </span>
               <Shield className="w-5 h-5 text-green-400 drop-shadow-lg" />
             </div>
             <div className="flex justify-center">
                {isCapturing && <span className="text-cyan-400 font-mono animate-pulse bg-black/70 px-4 py-1 rounded">CRYPTOGRAPHIC SIGNING...</span>}
             </div>
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex flex-col gap-6">
          
          <div className="space-y-4">
            <h3 className="text-slate-400 text-sm uppercase tracking-wider font-semibold">Security Parameters</h3>
            
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Hashing Strategy</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => setAlgo(HashingAlgo.V1_SIMPLE)}
                  className={`p-3 rounded-lg border text-left transition-all ${algo === HashingAlgo.V1_SIMPLE ? 'bg-cyan-900/20 border-cyan-500 text-cyan-300' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'}`}
                >
                  <div className="font-bold text-sm">Format V1</div>
                  <div className="text-xs opacity-70">Simple Hash (SHA256)</div>
                </button>
                <button
                  onClick={() => setAlgo(HashingAlgo.V2_SALTED)}
                  className={`p-3 rounded-lg border text-left transition-all ${algo === HashingAlgo.V2_SALTED ? 'bg-purple-900/20 border-purple-500 text-purple-300' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'}`}
                >
                  <div className="font-bold text-sm">Format V2</div>
                  <div className="text-xs opacity-70">Salted Device Hash</div>
                </button>
              </div>
            </div>

            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50 space-y-2">
               <div className="flex justify-between text-xs text-slate-400 font-mono">
                  <span>DEVICE_ID:</span>
                  <span className="text-slate-200">{currentDevice.id.substring(0, 12)}...</span>
               </div>
               <div className="flex justify-between text-xs text-slate-400 font-mono">
                  <span>TIMESTAMP:</span>
                  <span className="text-slate-200">{Date.now()}</span>
               </div>
            </div>
          </div>

          <button
            onClick={handleCapture}
            disabled={isCapturing}
            className="mt-auto w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-lg shadow-lg shadow-cyan-900/20 flex justify-center items-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCapturing ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <Camera className="w-5 h-5" />
            )}
            {isCapturing ? 'Processing...' : 'Capture & Sign Image'}
          </button>

          {lastCapturedAsset && (
            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
              <div className="bg-green-900/20 border border-green-800 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-green-400 mt-0.5" />
                  <div className="flex-1 overflow-hidden">
                    <h4 className="text-green-400 font-semibold text-sm">Cryptographic Binding Complete</h4>
                    <p className="text-slate-300 text-xs mt-1">Serial Number Generated:</p>
                    <code className="block mt-1 bg-black/40 p-2 rounded text-xs font-mono text-green-300 break-all select-all">
                      {lastCapturedAsset.serialNumber}
                    </code>
                  </div>
                </div>
              </div>
              
              {/* Recovery Key Display for Testing */}
              <div className="bg-yellow-900/10 border border-yellow-800/30 p-3 rounded-lg flex gap-3 items-center">
                 <KeyRound className="w-5 h-5 text-yellow-500" />
                 <div>
                    <h4 className="text-yellow-500 text-xs font-bold uppercase">Mock Recovery Keys (For Testing)</h4>
                    <div className="flex gap-4 mt-1">
                      <div className="text-xs text-slate-300">
                        Email: <span className="text-white font-mono">{lastCapturedAsset.recoveryEmail}</span>
                      </div>
                      <div className="text-xs text-slate-300">
                        PIN: <span className="text-white font-mono">{lastCapturedAsset.recoveryPin}</span>
                      </div>
                    </div>
                 </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default CapturePanel;