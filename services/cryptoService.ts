import { CapturedAsset, DeviceProfile, HashingAlgo, VerificationResult } from '../types';

// --- MOCK DATABASE (In-Memory) ---
// In a real app, this would be a secure distributed ledger or SQL DB.
const LEDGER: Record<string, CapturedAsset> = {};

/**
 * Utility to convert string to ArrayBuffer for hashing
 */
const textToBuffer = (text: string): Uint8Array => {
  return new TextEncoder().encode(text);
};

/**
 * Utility to convert ArrayBuffer to Hex String
 */
const bufferToHex = (buffer: ArrayBuffer): string => {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

/**
 * COMPONENT 1: Capture Simulation Logic
 * Generates the cryptographic serial number based on selected algo.
 */
export const generateSerialNumber = async (
  device: DeviceProfile,
  imageDataSignature: string, // Simplified checksum of image binary
  timestamp: number,
  algo: HashingAlgo
): Promise<string> => {
  const crypto = window.crypto.subtle;

  if (algo === HashingAlgo.V1_SIMPLE) {
    // V1: Simple Concatenation Hash
    // Input: DeviceID + Timestamp + ImageSignature
    const rawString = `${device.id}|${timestamp}|${imageDataSignature}`;
    const hashBuffer = await crypto.digest('SHA-256', textToBuffer(rawString));
    return `V1-${bufferToHex(hashBuffer).substring(0, 32)}`;
  } 
  
  if (algo === HashingAlgo.V2_SALTED) {
    // V2: Salted/Nested Hash for higher entropy
    // Step 1: Hash the Device Model as a salt
    const saltBuffer = await crypto.digest('SHA-256', textToBuffer(device.model));
    const saltHex = bufferToHex(saltBuffer);
    
    // Step 2: Combine with metadata
    const rawString = `${saltHex}::${device.id}::${timestamp}::${imageDataSignature}`;
    const hashBuffer = await crypto.digest('SHA-256', textToBuffer(rawString));
    
    // Step 3: Double hash for "hardening" (Simulated)
    const finalBuffer = await crypto.digest('SHA-256', hashBuffer);
    return `V2-${bufferToHex(finalBuffer).substring(0, 32)}`;
  }

  throw new Error("Unknown Algorithm");
};

/**
 * Simulates saving the captured image to the blockchain/database
 */
export const registerAsset = (asset: CapturedAsset): void => {
  console.log(`[LEDGER] Registering Asset: ${asset.serialNumber}`);
  LEDGER[asset.serialNumber] = asset;
};

/**
 * Helper to construct the response object based on access level
 */
const buildResponse = (asset: CapturedAsset, accessLevel: 'PUBLIC' | 'OWNER'): VerificationResult => {
  if (accessLevel === 'OWNER') {
    return {
      isAuthentic: true,
      accessLevel: 'OWNER',
      data: {
        imageUrl: asset.imageDataUrl, // Full Resolution
        metadata: {
          timestamp: new Date(asset.timestamp).toISOString(),
          deviceModel: asset.deviceModel, // Full Model Name
          location: asset.location || 'GPS: 34.0522° N, 118.2437° W', // Decrypted Location
          serialNumber: asset.serialNumber
        }
      },
      message: 'Identity Verified. Full forensic data access granted.'
    };
  }

  // PUBLIC Access
  return {
    isAuthentic: true,
    accessLevel: 'PUBLIC',
    data: {
      imageUrl: asset.imageDataUrl, 
      metadata: {
        timestamp: new Date(asset.timestamp).toLocaleDateString(), // Date only, no precise time
        deviceModel: 'REDACTED DEVICE', // Hidden
        location: 'REDACTED LOCATION', // Hidden
        serialNumber: asset.serialNumber
      }
    },
    message: 'Authentic content. Metadata redacted for privacy.'
  };
};

/**
 * COMPONENT 2: Verification & Privacy Logic
 * Determines what data to return based on who is asking.
 */
export const verifyAssetRequest = (
  serialNumber: string,
  requesterDeviceId: string
): VerificationResult => {
  const asset = LEDGER[serialNumber];

  // 1. Check existence
  if (!asset) {
    return {
      isAuthentic: false,
      accessLevel: 'PUBLIC',
      data: {
        imageUrl: '',
        metadata: {
          timestamp: 'Unknown',
          deviceModel: 'Unknown',
          location: 'Unknown',
          serialNumber
        }
      },
      message: 'Serial Number not found in the global registry.'
    };
  }

  // 2. Determine Access Level (Privacy Logic)
  const isOwner = asset.ownerDeviceId === requesterDeviceId;

  return buildResponse(asset, isOwner ? 'OWNER' : 'PUBLIC');
};

/**
 * NEW FEATURE: Secondary Authentication / Emergency Recovery
 * Allows access to full data by verifying email/pin instead of Device ID.
 */
export const verifySecondaryAuth = (
  serialNumber: string,
  email: string,
  pin: string
): Promise<VerificationResult> => {
  return new Promise((resolve, reject) => {
    const asset = LEDGER[serialNumber];

    if (!asset) {
      reject("Asset not found");
      return;
    }

    // Check credentials against the stored mock data
    // In a real app, use hashed passwords/tokens
    const isValid = 
      asset.recoveryEmail?.toLowerCase() === email.toLowerCase() && 
      asset.recoveryPin === pin;

    if (isValid) {
      // Bypass Device ID check and return OWNER level access
      resolve(buildResponse(asset, 'OWNER'));
    } else {
      reject("Invalid Recovery Credentials");
    }
  });
};