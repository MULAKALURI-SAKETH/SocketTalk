import { Client } from '@stomp/stompjs'
import { useCallback, useEffect, useRef } from 'react'
import SockJS from 'sockjs-client/dist/sockjs'
import type { ChatAttachment, ChatEvent } from '../types'
import { IChatSocketOptions } from '../interfaces/IUser'

const SOCKET_URL = import.meta.env.VITE_WS_URL

export const useChatSocket = ({ username, onMessage }: IChatSocketOptions) => {
  const clientRef = useRef<Client | null>(null)
  const onMessageRef = useRef(onMessage)
  onMessageRef.current = onMessage

  useEffect(() => {
    if (!username) {
      return
    }

    const client = new Client({
      webSocketFactory: () => new SockJS(SOCKET_URL),
      connectHeaders: { login: username },
      reconnectDelay: 5000,
      debug: () => {},
    })

    client.onConnect = () => {
      client.subscribe('/user/queue/messages', (frame) => {
        try {
          const payload = JSON.parse(frame.body) as ChatEvent
          onMessageRef.current(payload)
        } catch {
          // Ignore malformed frames
        }
      })
    }

    client.activate()
    clientRef.current = client

    return () => {
      client.deactivate()
      clientRef.current = null
    }
  }, [username])

  const sendMessage = useCallback(
    (
      recipientId: string,
      content: string,
      attachments: ChatAttachment[] = [],
    ): boolean => {
      const client = clientRef.current
      if (!client || !client.connected || !username) return false
      client.publish({
        destination: '/app/chat',
        body: JSON.stringify({
          senderId: username,
          recipientId,
          content,
          attachments,
          readByRecipient: false,
          edited: false,
          deletedForEveryone: false,
        }),
      })
      return true
    },
    [username],
  )

  return { sendMessage }
}
