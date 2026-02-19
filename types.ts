export enum DeviceType {
  ANDROID_HIGH = 'ANDROID_HIGH',
  ANDROID_MID = 'ANDROID_MID',
  ANDROID_LEGACY = 'ANDROID_LEGACY',
  IOS_PRO = 'IOS_PRO',
  IOS_STANDARD = 'IOS_STANDARD'
}

export interface DeviceProfile {
  id: string; // Hardware UUID simulation
  model: string;
  type: DeviceType;
  osVersion: string;
  label: string;
}

export enum HashingAlgo {
  V1_SIMPLE = 'V1_SIMPLE',
  V2_SALTED = 'V2_SALTED'
}

export interface CapturedAsset {
  serialNumber: string;
  imageDataUrl: string; // Base64 mock
  timestamp: number;
  ownerDeviceId: string;
  deviceModel: string; // Stored metadata
  algoVersion: HashingAlgo;
  location?: string; // Optional metadata
  // New fields for Secondary Auth / Emergency Recovery
  recoveryEmail?: string;
  recoveryPin?: string;
}

// Response structure from the "Server"
export interface VerificationResult {
  isAuthentic: boolean;
  accessLevel: 'PUBLIC' | 'OWNER';
  data: {
    imageUrl: string; // Full res or blurred
    metadata: {
      timestamp: string;
      deviceModel: string; // Redacted or Full
      location: string; // Redacted or Full
      serialNumber: string;
    };
  };
  message: string;
}