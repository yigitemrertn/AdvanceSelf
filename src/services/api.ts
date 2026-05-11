import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.101:8001/api/v1';

async function getHeaders() {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  try {
    const userStorage = await AsyncStorage.getItem('user-storage');
    if (userStorage) {
      const parsed = JSON.parse(userStorage);
      const token = parsed.state?.token;
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
  } catch (error) {
    console.error('Error reading token:', error);
  }
  return headers;
}

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const headers = await getHeaders();
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });

  if (!response.ok) {
    let errorData = null;
    try {
      errorData = await response.json();
    } catch (e) {
      // Ignore JSON parse error on bad responses
    }
    throw new Error(errorData?.detail || `API request failed with status ${response.status}`);
  }

  // Handle empty responses
  if (response.status === 204) {
    return null;
  }

  try {
    return await response.json();
  } catch (e) {
    return null;
  }
}

export const api = {
  auth: {
    login: (data: any) => fetchApi('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    register: (data: any) => fetchApi('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  },
  profile: {
    get: (userId: number) => fetchApi(`/users/${userId}/profile`, { method: 'GET' }),
    update: (userId: number, data: any) => fetchApi(`/users/${userId}/profile`, { method: 'PATCH', body: JSON.stringify(data) }),
  },
  analysis: {
    getLatest: (userId: number) => fetchApi(`/analyses/latest/${userId}`, { method: 'GET' }),
    create: (data: any) => fetchApi('/analyses', { method: 'POST', body: JSON.stringify(data) }),
  },
  recommendations: {
    getLatest: (userId: number) => fetchApi(`/recommendations/latest/${userId}`, { method: 'GET' }),
    regenerate: (userId: number) => fetchApi('/recommendations/regenerate', { method: 'POST', body: JSON.stringify({ user_id: userId }) }),
  },
  progress: {
    getLatest: (userId: number) => fetchApi(`/progress/latest/${userId}`, { method: 'GET' }),
    getHistory: (userId: number) => fetchApi(`/progress/history/${userId}`, { method: 'GET' }),
  }
};
