import type { ChatMessage } from '../types'

export const removeMessageById = (
  conversations: Record<string, ChatMessage[]>,
  messageId: string,
): Record<string, ChatMessage[]> => {
  return Object.fromEntries(
    Object.entries(conversations).map(([key, messages]) => [
      key,
      messages.filter((message) => message.id !== messageId),
    ]),
  )
}
