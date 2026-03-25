const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const get = async <T>(endpoint: string): Promise<T> => {
  const res = await fetch(`${BASE_URL}${endpoint}`);
  if (!res.ok) throw new Error(`Failed to fetch ${endpoint}`);
  return res.json();
};

const post = async <T>(endpoint: string, body: unknown): Promise<T> => {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Failed to post ${endpoint}`);
  return res.json();
};

export const api = {
  projects:      { getAll: () => get('/projects') },
  skills:        { getAll: ()  => get('/skills') },
  experience:    { getAll: ()  => get('/experience') },
  education:     { getAll: ()  => get('/education') },
  testimonials:  { getAll: ()  => get('/testimonials') },
  community:     { getAll: ()  => get('/communities') },
  settings:      { get: ()     => get('/settings') },
  contact:       { send: (body: unknown) => post('/contact', body) },
};