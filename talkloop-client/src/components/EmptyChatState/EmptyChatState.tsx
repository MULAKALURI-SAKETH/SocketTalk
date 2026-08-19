import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import ChatBubbleOutlineOutlined from '@mui/icons-material/ChatBubbleOutlineOutlined'
import styles from './EmptyChatState.module.css'

const EmptyChatState: React.FC = () => {
  return (
    <Box className={styles.empty}>
      <ChatBubbleOutlineOutlined className={styles.icon} />
      <Typography variant="body1" className={styles.text}>
        Select a user to start chatting
      </Typography>
    </Box>
  )
}

export default EmptyChatState
