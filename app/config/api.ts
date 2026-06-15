// app/config/api.ts
import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * BACKEND_URL Configuration
 * - Loaded from EXPO_PUBLIC_BACKEND_URL if set.
 * - Otherwise dynamically detects the local development machine's IP address.
 */
const getDevBackendUrl = () => {
  const envUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
  // If envUrl is set and we are on web, or if it's a non-localhost address (e.g. production), use it directly.
  // Otherwise, on native platforms (iOS/Android), if it's localhost, we bypass it so we can dynamically detect the host computer IP.
  if (envUrl && (Platform.OS === 'web' || (!envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')))) {
    return envUrl;
  }

  // Dynamically detect local dev machine IP from Expo bundler
  const hostUri = Constants.expoConfig?.hostUri || (Constants as any).manifest?.debuggerHost;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    if (ip) {
      console.log('[API] Detected local development host IP:', ip);
      return `http://${ip}:8000`;
    }
  }

  // Fallbacks if debugger host is not available
  const defaultIp = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
  return `http://${defaultIp}:8000`;
};

export const BACKEND_URL = getDevBackendUrl();

// Add API_VERSION constant
export const API_VERSION = '/api/v1';  // ← ADD THIS

export const API_ENDPOINTS = {
    BASE_URL: `${BACKEND_URL}${API_VERSION}`,  // ← ADD THIS
    
    AUTH: {
        LOGIN: '/auth/login',
        VERIFY: '/auth/verify',
    },
    CHAT: {
        MESSAGE: '/chat/message',
        END_SESSION: '/chat/end-session',
    },
    FAMILY: {
        CREATE: '/family/create',
        JOIN: '/family/join',
        MEMBERS: (id: string) => `/family/members/${id}`,
    },
    MEDS: {
        LIST: (id: string) => `/meds/${id}`,
        LOG: '/meds/log',
        ADD: (id: string) => `/meds/add`,
    },
    PROFILE: {
        GET: (id: string) => `/profile/${id}`,
        PATCH: (id: string) => `/profile/${id}`,
        QR: (id: string) => `/profile/${id}/qr`,
    },
    CHECKINS: {
        PENDING: (id: string) => `/checkins/pending/${id}`,
        SUBMIT: '/checkins/submit',
        GENERATE: '/chat/checkin-questions',
    },
    RISK: {
        GENERATE: '/risk/generate',
        PREDICT: '/risk/predict',
    },
    SCHEMES: {
        MATCH: '/schemes/match',
    },
    SAFETY: {
        DRUG_INTERACTION: '/safety/drug-interaction',
    },
    EXTRACT: {
        REPORT: '/extract/report',
    }
};