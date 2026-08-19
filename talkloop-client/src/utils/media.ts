const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export const resolveMediaUrl = (url: string): string =>
  url.startsWith('/') ? `${API_BASE_URL}${url}` : url

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export const isImageAttachment = (contentType?: string): boolean =>
  contentType?.toLowerCase().startsWith('image/') ?? false
