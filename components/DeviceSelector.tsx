import React from 'react';
import { DeviceProfile } from '../types';
import { SIMULATED_DEVICES } from '../constants';
import { Smartphone, ShieldCheck } from 'lucide-react';

interface Props {
  currentDevice: DeviceProfile;
  onDeviceChange: (device: DeviceProfile) => void;
}

const DeviceSelector: React.FC<Props> = ({ currentDevice, onDeviceChange }) => {
  return (
    <div className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-50">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/10 rounded-lg">
            <Smartphone className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Current Device Simulation</h2>
            <p className="text-white font-semibold">{currentDevice.model}</p>
            <p className="text-xs text-slate-500 font-mono">{currentDevice.id}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-400 hidden sm:block">Switch Device:</label>
          <select 
            value={currentDevice.id}
            onChange={(e) => {
              const device = SIMULATED_DEVICES.find(d => d.id === e.target.value);
              if (device) onDeviceChange(device);
            }}
            className="bg-slate-800 text-white text-sm rounded-md border border-slate-700 px-3 py-2 focus:ring-2 focus:ring-cyan-500 outline-none"
          >
            {SIMULATED_DEVICES.map(dev => (
              <option key={dev.id} value={dev.id}>
                {dev.label}
              </option>
            ))}
          </select>
        </div>

      </div>
    </div>
  );
};

export default DeviceSelector;