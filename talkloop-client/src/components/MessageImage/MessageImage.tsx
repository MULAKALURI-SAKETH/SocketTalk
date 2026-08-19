import { useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import type { MessageImageProps } from '../../interfaces/IComponent'
import styles from './MessageImage.module.css'

export const MessageImage: React.FC<MessageImageProps> = ({ url }) => {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <Typography variant="body2" className={styles.fallback}>
        Image couldn't be loaded.
      </Typography>
    )
  }

  return (
    <Box
      component="img"
      src={url}
      loading="lazy"
      onError={() => setFailed(true)}
      className={styles.image}
    />
  )
}
