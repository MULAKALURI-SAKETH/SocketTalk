import { ChatEvent } from '../types'

export interface IChatSocketOptions {
  username: string | undefined
  onMessage: (event: ChatEvent) => void
}
