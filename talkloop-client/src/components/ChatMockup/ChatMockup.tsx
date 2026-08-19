import React from 'react'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Avatar from '@mui/material/Avatar'
import Typography from '@mui/material/Typography'
import MessageTicks from '../MessageTicks/MessageTicks'
import styles from './ChatMockup.module.css'

const ChatMockup: React.FC = () => {
  return (
    <Box className={`animate-float-slow ${styles.wrapper}`}>
      <Box className={styles.glow} />

      <Paper elevation={24} className={styles.card}>
        <Box className={styles.header}>
          <Box className={styles.avatarWrap}>
            <Avatar className={styles.avatar}>A</Avatar>
            <Box className={styles.onlineDot} />
          </Box>
          <Box className={styles.headerName}>
            <Typography className={styles.nameText}>Aanya</Typography>
            <Typography variant="caption" className={styles.onlineText}>
              online
            </Typography>
          </Box>
        </Box>

        <Box className={styles.chatArea}>
          <Box className={`${styles.row} ${styles.rowStart}`}>
            <Box className={`${styles.bubble} ${styles.bubbleIn}`}>
              Hey! Have you seen the new update? 👀
            </Box>
          </Box>

          <Box className={`${styles.row} ${styles.rowEnd}`}>
            <Box className={`${styles.bubble} ${styles.bubbleOut}`}>
              Not yet, what's new?
            </Box>
          </Box>

          <Box className={`${styles.row} ${styles.rowEnd}`}>
            <Box className={styles.imageBubble}>
              <Box className={styles.imagePreview} />
              <Box className={styles.imageMeta}>
                <Typography variant="caption" className={styles.imageTime}>
                  10:24
                </Typography>
                <MessageTicks read className={styles.tickBlue} />
              </Box>
            </Box>
          </Box>

          <Box className={`${styles.row} ${styles.rowStart}`}>
            <Box className={styles.typingBubble}>
              <Box className={`animate-typing ${styles.typingDot}`} />
              <Box
                className={`animate-typing ${styles.typingDot} ${styles.typingDot1}`}
              />
              <Box
                className={`animate-typing ${styles.typingDot} ${styles.typingDot2}`}
              />
            </Box>
          </Box>

          <Box className={`${styles.row} ${styles.rowEnd}`}>
            <Box className={styles.textBubble}>
              It's all about edits & deletes now ✨
              <Box className={styles.textMeta}>
                10:25
                <MessageTicks read className={styles.tickBlue} />
              </Box>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  )
}

export default ChatMockup
