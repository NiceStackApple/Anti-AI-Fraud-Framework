import { DeviceProfile, DeviceType } from './types';

export const SIMULATED_DEVICES: DeviceProfile[] = [
  {
    id: 'uuid-pix-8-pro-x992',
    model: 'Google Pixel 8 Pro',
    type: DeviceType.ANDROID_HIGH,
    osVersion: 'Android 14',
    label: 'Device A (Pixel 8 Pro)'
  },
  {
    id: 'uuid-sam-s24-u-7721',
    model: 'Samsung Galaxy S24 Ultra',
    type: DeviceType.ANDROID_HIGH,
    osVersion: 'OneUI 6.1',
    label: 'Device B (Galaxy S24 Ultra)'
  },
  {
    id: 'uuid-iph-15-pm-0012',
    model: 'iPhone 15 Pro Max',
    type: DeviceType.IOS_PRO,
    osVersion: 'iOS 17.4',
    label: 'Device C (iPhone 15 Pro Max)'
  },
  {
    id: 'uuid-red-n13-5541',
    model: 'Xiaomi Redmi Note 13',
    type: DeviceType.ANDROID_MID,
    osVersion: 'MIUI 14',
    label: 'Device D (Redmi Note 13)'
  },
  {
    id: 'uuid-gen-leg-1102',
    model: 'Generic Legacy Android',
    type: DeviceType.ANDROID_LEGACY,
    osVersion: 'Android 9.0',
    label: 'Device E (Legacy Android)'
  }
];

// Placeholder images to simulate capture
export const MOCK_IMAGE_URL = "https://picsum.photos/800/600";