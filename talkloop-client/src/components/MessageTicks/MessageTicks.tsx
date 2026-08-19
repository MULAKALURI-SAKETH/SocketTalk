import React from 'react'
import DoneAll from '@mui/icons-material/DoneAll'
import type { MessageTicksProps } from '../../interfaces/IComponent'
import styles from './MessageTicks.module.css'

const MessageTicks: React.FC<MessageTicksProps> = ({ read, className }) => {
  const tickClass = read ? styles.read : styles.delivered
  return (
    <DoneAll
      aria-label={read ? 'Read' : 'Delivered'}
      className={`${styles.tick} ${tickClass} ${className ?? ''}`}
    />
  )
}

export default MessageTicks
