import axios from 'axios';
import { fetchAuthSession } from 'aws-amplify/auth';

const client = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

client.interceptors.request.use(async (config) => {
  try {
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // not signed in — request goes without auth header
  }
  return config;
});

export default client;
