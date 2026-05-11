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
      const gemKey = parsed.state?.geminiKey;
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      if (gemKey) {
        headers['X-Gemini-Key'] = gemKey;
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
    upload: async (formData: FormData) => {
      const tokenData = await AsyncStorage.getItem('user-storage');
      let headers: Record<string, string> = {};
      if (tokenData) {
        const parsed = JSON.parse(tokenData);
        const token = parsed.state?.token;
        const gemKey = parsed.state?.geminiKey;
        if (token) headers['Authorization'] = `Bearer ${token}`;
        if (gemKey) headers['X-Gemini-Key'] = gemKey;
      }
      // Do NOT specify Content-Type for FormData, it needs boundary generated auto.
      const response = await fetch(`${API_BASE_URL}/analyses/upload`, {
        method: 'POST',
        headers: headers,
        body: formData,
      });
      if (!response.ok) throw new Error("Fotoğraf analizi başarısız oldu.");
      return await response.json();
    },
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
