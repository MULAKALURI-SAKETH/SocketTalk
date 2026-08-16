const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const resolveMediaUrl = (url: string): string =>
  url.startsWith("/") ? `${API_BASE_URL}${url}` : url;
