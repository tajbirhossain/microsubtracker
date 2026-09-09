const DEFAULT_API_URL = 'http://localhost:5000/api';

export const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL?.trim() || DEFAULT_API_URL
).replace(/\/$/, '');
