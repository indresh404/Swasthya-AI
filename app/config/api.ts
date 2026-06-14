import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * BACKEND_URL Configuration
 * - Loaded from EXPO_PUBLIC_BACKEND_URL if set.
 * - Otherwise dynamically detects the local development machine's IP address.
 */
const getDevBackendUrl = () => {
  const envUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
  if (envUrl) return envUrl;

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

export const API_ENDPOINTS = {
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
